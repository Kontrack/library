const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ===== 도서 관리 =====

// 도서 추가
router.post('/books', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { title, publishedYear, authors, categories, copyCount = 1 } = req.body;
    
    if (!title || !authors || authors.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 저자는 필수입니다.' 
      });
    }
    
    await connection.beginTransaction();
    
    // 1. 도서 추가
    const [bookResult] = await connection.execute(
      'INSERT INTO books (title, published_year) VALUES (?, ?)',
      [title, publishedYear || null]
    );
    
    const bookId = bookResult.insertId;
    
    // 2. 저자 처리
    for (const authorName of authors) {
      // 저자가 이미 존재하는지 확인
      let [existingAuthors] = await connection.execute(
        'SELECT id FROM authors WHERE name = ?',
        [authorName]
      );
      
      let authorId;
      if (existingAuthors.length > 0) {
        authorId = existingAuthors[0].id;
      } else {
        // 새 저자 추가
        const [authorResult] = await connection.execute(
          'INSERT INTO authors (name) VALUES (?)',
          [authorName]
        );
        authorId = authorResult.insertId;
      }
      
      // 도서-저자 관계 추가
      await connection.execute(
        'INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)',
        [bookId, authorId]
      );
    }
    
    // 3. 카테고리 처리
    if (categories && categories.length > 0) {
      for (const categoryName of categories) {
        let [existingCategories] = await connection.execute(
          'SELECT id FROM categories WHERE name = ?',
          [categoryName]
        );
        
        let categoryId;
        if (existingCategories.length > 0) {
          categoryId = existingCategories[0].id;
        } else {
          const [categoryResult] = await connection.execute(
            'INSERT INTO categories (name) VALUES (?)',
            [categoryName]
          );
          categoryId = categoryResult.insertId;
        }
        
        await connection.execute(
          'INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)',
          [bookId, categoryId]
        );
      }
    }
    
    // 4. 사본 추가
    for (let i = 0; i < copyCount; i++) {
      await connection.execute(
        'INSERT INTO book_copies (book_id, status) VALUES (?, "available")',
        [bookId]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: '도서가 추가되었습니다.',
      bookId
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('도서 추가 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '도서 추가 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// 도서 삭제
router.delete('/books/:id', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // 현재 대출 중인 사본이 있는지 확인
    const [borrowedCopies] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM book_copies bc
      JOIN loans l ON bc.id = l.copy_id
      WHERE bc.book_id = ? AND l.returned_at IS NULL
    `, [id]);
    
    if (borrowedCopies[0].count > 0) {
      await connection.rollback();
      return res.status(403).json({ 
        success: false, 
        message: '대출 중인 도서가 있어 삭제할 수 없습니다.' 
      });
    }
    
    // 도서 삭제 (CASCADE로 관련 데이터 자동 삭제)
    const [result] = await connection.execute(
      'DELETE FROM books WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '도서를 찾을 수 없습니다.' 
      });
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: '도서가 삭제되었습니다.' 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('도서 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '도서 삭제 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// 도서 사본 추가
router.post('/books/:id/copies', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    const { count = 1 } = req.body;
    
    await connection.beginTransaction();
    
    // 도서 존재 확인
    const [books] = await connection.execute(
      'SELECT id FROM books WHERE id = ?',
      [id]
    );
    
    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '도서를 찾을 수 없습니다.' 
      });
    }
    
    // 사본 추가
    for (let i = 0; i < count; i++) {
      await connection.execute(
        'INSERT INTO book_copies (book_id, status) VALUES (?, "available")',
        [id]
      );
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: `${count}권의 사본이 추가되었습니다.` 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('사본 추가 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '사본 추가 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// ===== 카테고리 관리 =====

// 카테고리 추가
router.post('/categories', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: '카테고리 이름을 입력해주세요.' 
      });
    }
    
    await connection.beginTransaction();
    
    const [result] = await connection.execute(
      'INSERT INTO categories (name) VALUES (?)',
      [name]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: '카테고리가 추가되었습니다.',
      categoryId: result.insertId
    });
    
  } catch (error) {
    await connection.rollback();
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: '이미 존재하는 카테고리입니다.' 
      });
    }
    
    console.error('카테고리 추가 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '카테고리 추가 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// 카테고리 삭제
router.delete('/categories/:id', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    const [result] = await connection.execute(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '카테고리를 찾을 수 없습니다.' 
      });
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: '카테고리가 삭제되었습니다.' 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('카테고리 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '카테고리 삭제 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// ===== 회원 관리 =====

// 회원 목록 조회
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query; // 'user', 'admin', 'all'
    
    let query = `
      SELECT 
        u.id,
        u.name,
        u.role,
        u.created_at,
        COUNT(DISTINCT l.id) as total_loans,
        COUNT(DISTINCT CASE WHEN l.returned_at IS NULL THEN l.id END) as current_loans,
        MAX(CASE 
          WHEN l.returned_at IS NULL AND DATEDIFF(NOW(), l.due_at) > 0 
          THEN true 
          ELSE false 
        END) as has_overdue
      FROM users u
      LEFT JOIN loans l ON u.id = l.user_id
    `;
    
    const params = [];
    
    if (role && role !== 'all') {
      query += ' WHERE u.role = ?';
      params.push(role);
    }
    
    query += ' GROUP BY u.id ORDER BY u.created_at DESC';
    
    const [users] = await db.execute(query, params);
    
    res.json({ 
      success: true, 
      users: users.map(user => ({
        ...user,
        has_overdue: user.has_overdue === 1
      }))
    });
    
  } catch (error) {
    console.error('회원 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '회원 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 회원 삭제
router.delete('/users/:id', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // 현재 대출 중인 도서가 있는지 확인
    const [currentLoans] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM loans 
      WHERE user_id = ? AND returned_at IS NULL
    `, [id]);
    
    if (currentLoans[0].count > 0) {
      await connection.rollback();
      return res.status(403).json({ 
        success: false, 
        message: '대출 중인 도서가 있어 삭제할 수 없습니다.' 
      });
    }
    
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '회원을 찾을 수 없습니다.' 
      });
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: '회원이 삭제되었습니다.' 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('회원 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '회원 삭제 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

