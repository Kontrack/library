const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 이달의 독서왕 (상위 3명)
router.get('/top-readers', async (req, res) => {
  try {
    const [readers] = await db.execute(`
      SELECT 
        u.id,
        u.name,
        COUNT(l.id) as loan_count
      FROM users u
      JOIN loans l ON u.id = l.user_id
      WHERE YEAR(l.checkout_at) = YEAR(NOW())
        AND MONTH(l.checkout_at) = MONTH(NOW())
      GROUP BY u.id, u.name
      ORDER BY loan_count DESC
      LIMIT 3
    `);
    
    res.json({ 
      success: true, 
      topReaders: readers 
    });
    
  } catch (error) {
    console.error('이달의 독서왕 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '이달의 독서왕 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 이달의 핫한 저자
router.get('/hot-author', async (req, res) => {
  try {
    const [authors] = await db.execute(`
      SELECT 
        a.id,
        a.name,
        COUNT(l.id) as total_loans
      FROM authors a
      JOIN book_authors ba ON a.id = ba.author_id
      JOIN books b ON ba.book_id = b.id
      JOIN book_copies bc ON b.id = bc.book_id
      JOIN loans l ON bc.id = l.copy_id
      WHERE YEAR(l.checkout_at) = YEAR(NOW())
        AND MONTH(l.checkout_at) = MONTH(NOW())
      GROUP BY a.id, a.name
      ORDER BY total_loans DESC
      LIMIT 1
    `);
    
    if (authors.length === 0) {
      return res.json({ 
        success: true, 
        hotAuthor: null,
        message: '이번 달 대출 기록이 없습니다.'
      });
    }
    
    res.json({ 
      success: true, 
      hotAuthor: authors[0]
    });
    
  } catch (error) {
    console.error('이달의 핫한 저자 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '이달의 핫한 저자 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 대시보드 통계 (전체)
router.get('/dashboard', async (req, res) => {
  try {
    // 전체 통계
    const [bookCount] = await db.execute('SELECT COUNT(*) as count FROM books');
    const [copyCount] = await db.execute('SELECT COUNT(*) as count FROM book_copies');
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [currentLoans] = await db.execute('SELECT COUNT(*) as count FROM loans WHERE returned_at IS NULL');
    
    // 이달의 통계
    const [monthlyLoans] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM loans 
      WHERE YEAR(checkout_at) = YEAR(NOW())
        AND MONTH(checkout_at) = MONTH(NOW())
    `);
    
    res.json({ 
      success: true, 
      stats: {
        totalBooks: bookCount[0].count,
        totalCopies: copyCount[0].count,
        totalUsers: userCount[0].count,
        currentLoans: currentLoans[0].count,
        monthlyLoans: monthlyLoans[0].count
      }
    });
    
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '대시보드 통계 조회 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;

