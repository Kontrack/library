const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 도서 대출
router.post('/checkout', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { userId, copyId } = req.body;
    
    if (!userId || !copyId) {
      return res.status(400).json({ 
        success: false, 
        message: '사용자 ID와 사본 ID를 입력해주세요.' 
      });
    }
    
    await connection.beginTransaction();
    
    // 1. 연체 상태 확인
    const [overdueLoans] = await connection.execute(`
      SELECT id 
      FROM loans 
      WHERE user_id = ? 
        AND returned_at IS NULL 
        AND DATEDIFF(NOW(), due_at) > 0
      LIMIT 1
    `, [userId]);
    
    if (overdueLoans.length > 0) {
      await connection.rollback();
      return res.status(403).json({ 
        success: false, 
        message: '연체 중인 도서가 있어 대출할 수 없습니다.' 
      });
    }
    
    // 2. 현재 대출 중인 도서 수 확인 (최대 3권)
    const [currentLoans] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM loans 
      WHERE user_id = ? AND returned_at IS NULL
    `, [userId]);
    
    if (currentLoans[0].count >= 3) {
      await connection.rollback();
      return res.status(403).json({ 
        success: false, 
        message: '최대 3권까지만 대출 가능합니다.' 
      });
    }
    
    // 3. 사본 상태 확인
    const [copies] = await connection.execute(`
      SELECT bc.id, bc.book_id, bc.status 
      FROM book_copies bc 
      WHERE bc.id = ?
    `, [copyId]);
    
    if (copies.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '사본을 찾을 수 없습니다.' 
      });
    }
    
    if (copies[0].status !== 'available') {
      await connection.rollback();
      return res.status(403).json({ 
        success: false, 
        message: '대출 가능한 상태가 아닙니다.' 
      });
    }
    
    // 4. 동일한 책을 이미 대출 중인지 확인
    const [sameBookLoans] = await connection.execute(`
      SELECT l.id 
      FROM loans l
      JOIN book_copies bc ON l.copy_id = bc.id
      WHERE l.user_id = ? 
        AND bc.book_id = ? 
        AND l.returned_at IS NULL
      LIMIT 1
    `, [userId, copies[0].book_id]);
    
    if (sameBookLoans.length > 0) {
      await connection.rollback();
      return res.status(403).json({ 
        success: false, 
        message: '동일한 책을 2권 이상 대출할 수 없습니다.' 
      });
    }
    
    // 5. 대출 처리
    const checkoutAt = new Date();
    const dueAt = new Date(checkoutAt);
    dueAt.setDate(dueAt.getDate() + 7); // 7일 후
    
    const [loanResult] = await connection.execute(`
      INSERT INTO loans (user_id, copy_id, checkout_at, due_at)
      VALUES (?, ?, ?, ?)
    `, [userId, copyId, checkoutAt, dueAt]);
    
    // 6. 사본 상태 업데이트
    await connection.execute(`
      UPDATE book_copies 
      SET status = 'borrowed' 
      WHERE id = ?
    `, [copyId]);
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: '대출이 완료되었습니다.',
      loanId: loanResult.insertId,
      dueAt: dueAt
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('대출 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '대출 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// 도서 반납
router.post('/return', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { loanId } = req.body;
    
    if (!loanId) {
      return res.status(400).json({ 
        success: false, 
        message: '대출 ID를 입력해주세요.' 
      });
    }
    
    await connection.beginTransaction();
    
    // 1. 대출 정보 확인
    const [loans] = await connection.execute(`
      SELECT l.id, l.copy_id, l.returned_at
      FROM loans l
      WHERE l.id = ?
    `, [loanId]);
    
    if (loans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '대출 기록을 찾을 수 없습니다.' 
      });
    }
    
    if (loans[0].returned_at !== null) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: '이미 반납된 도서입니다.' 
      });
    }
    
    // 2. 반납 처리
    const returnedAt = new Date();
    
    await connection.execute(`
      UPDATE loans 
      SET returned_at = ? 
      WHERE id = ?
    `, [returnedAt, loanId]);
    
    // 3. 사본 상태 업데이트
    await connection.execute(`
      UPDATE book_copies 
      SET status = 'available' 
      WHERE id = ?
    `, [loans[0].copy_id]);
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: '반납이 완료되었습니다.',
      returnedAt: returnedAt
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('반납 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '반납 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// 사용자별 대출 기록 조회
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query; // 'current', 'returned', 'all'
    
    let query = `
      SELECT 
        l.id as loan_id,
        l.checkout_at,
        l.due_at,
        l.returned_at,
        b.id as book_id,
        b.title,
        GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') as authors,
        bc.id as copy_id,
        CASE 
          WHEN l.returned_at IS NULL AND DATEDIFF(NOW(), l.due_at) > 0 THEN true
          ELSE false
        END as is_overdue,
        CASE 
          WHEN l.returned_at IS NULL THEN GREATEST(0, DATEDIFF(NOW(), l.due_at))
          ELSE 0
        END as overdue_days
      FROM loans l
      JOIN book_copies bc ON l.copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      WHERE l.user_id = ?
    `;
    
    if (status === 'current') {
      query += ' AND l.returned_at IS NULL';
    } else if (status === 'returned') {
      query += ' AND l.returned_at IS NOT NULL';
    }
    
    query += ' GROUP BY l.id ORDER BY l.checkout_at DESC';
    
    const [loans] = await db.execute(query, [userId]);
    
    res.json({ 
      success: true, 
      loans: loans.map(loan => ({
        ...loan,
        is_overdue: loan.is_overdue === 1,
        overdue_days: parseInt(loan.overdue_days)
      }))
    });
    
  } catch (error) {
    console.error('대출 기록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '대출 기록 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 대출 가능 여부 확인
router.get('/check-eligibility/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 연체 상태 확인
    const [overdueLoans] = await db.execute(`
      SELECT id 
      FROM loans 
      WHERE user_id = ? 
        AND returned_at IS NULL 
        AND DATEDIFF(NOW(), due_at) > 0
      LIMIT 1
    `, [userId]);
    
    // 현재 대출 수 확인
    const [currentLoans] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM loans 
      WHERE user_id = ? AND returned_at IS NULL
    `, [userId]);
    
    const hasOverdue = overdueLoans.length > 0;
    const currentCount = currentLoans[0].count;
    const canBorrow = !hasOverdue && currentCount < 3;
    
    res.json({ 
      success: true, 
      canBorrow,
      hasOverdue,
      currentLoanCount: currentCount,
      maxLoanCount: 3
    });
    
  } catch (error) {
    console.error('대출 가능 여부 확인 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '대출 가능 여부 확인 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;

