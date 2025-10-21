const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 도서 목록 조회 (검색, 정렬 포함)
router.get('/', async (req, res) => {
  try {
    const { 
      search = '', 
      searchType = 'title', // title, author, category
      sortBy = 'title', // title, author, category, published_year
      sortOrder = 'ASC' // ASC, DESC
    } = req.query;
    
    let query = `
      SELECT DISTINCT
        b.id,
        b.title,
        b.published_year,
        GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') as authors,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') as categories,
        COUNT(DISTINCT bc.id) as total_copies,
        COUNT(DISTINCT CASE WHEN bc.status = 'available' THEN bc.id END) as available_copies
      FROM books b
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_categories bcat ON b.id = bcat.book_id
      LEFT JOIN categories c ON bcat.category_id = c.id
      LEFT JOIN book_copies bc ON b.id = bc.book_id
    `;
    
    const params = [];
    
    // 검색 조건
    if (search) {
      if (searchType === 'title') {
        query += ' WHERE b.title LIKE ?';
        params.push(`%${search}%`);
      } else if (searchType === 'author') {
        query += ' WHERE a.name LIKE ?';
        params.push(`%${search}%`);
      } else if (searchType === 'category') {
        query += ' WHERE c.name LIKE ?';
        params.push(`%${search}%`);
      }
    }
    
    query += ' GROUP BY b.id, b.title, b.published_year';
    
    // 정렬
    if (sortBy === 'title') {
      query += ` ORDER BY b.title ${sortOrder}`;
    } else if (sortBy === 'published_year') {
      query += ` ORDER BY b.published_year ${sortOrder}`;
    } else if (sortBy === 'author') {
      query += ` ORDER BY authors ${sortOrder}`;
    } else if (sortBy === 'category') {
      query += ` ORDER BY categories ${sortOrder}`;
    }
    
    const [books] = await db.execute(query, params);
    
    res.json({ 
      success: true, 
      books: books.map(book => ({
        ...book,
        canBorrow: book.available_copies > 0
      }))
    });
    
  } catch (error) {
    console.error('도서 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '도서 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 도서 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [books] = await db.execute(`
      SELECT 
        b.id,
        b.title,
        b.published_year,
        b.created_at,
        GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') as authors,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') as categories,
        COUNT(DISTINCT bc.id) as total_copies,
        COUNT(DISTINCT CASE WHEN bc.status = 'available' THEN bc.id END) as available_copies
      FROM books b
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_categories bcat ON b.id = bcat.book_id
      LEFT JOIN categories c ON bcat.category_id = c.id
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      WHERE b.id = ?
      GROUP BY b.id
    `, [id]);
    
    if (books.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '도서를 찾을 수 없습니다.' 
      });
    }
    
    // 사본 목록 조회
    const [copies] = await db.execute(`
      SELECT id, status
      FROM book_copies
      WHERE book_id = ?
      ORDER BY id
    `, [id]);
    
    res.json({ 
      success: true, 
      book: {
        ...books[0],
        copies,
        canBorrow: books[0].available_copies > 0
      }
    });
    
  } catch (error) {
    console.error('도서 상세 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '도서 상세 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 인기 도서 차트 (최근 3개월)
router.get('/charts/popular', async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let query = `
      SELECT 
        b.id,
        b.title,
        GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') as authors,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') as categories,
        COUNT(l.id) as loan_count
      FROM books b
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_categories bcat ON b.id = bcat.book_id
      LEFT JOIN categories c ON bcat.category_id = c.id
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      LEFT JOIN loans l ON bc.id = l.copy_id 
        AND l.checkout_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    `;
    
    const params = [];
    
    if (categoryId) {
      query += ` WHERE bcat.category_id = ?`;
      params.push(categoryId);
    }
    
    query += `
      GROUP BY b.id
      HAVING loan_count > 0
      ORDER BY loan_count DESC
      LIMIT 10
    `;
    
    const [books] = await db.execute(query, params);
    
    res.json({ 
      success: true, 
      books 
    });
    
  } catch (error) {
    console.error('인기 도서 차트 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '인기 도서 차트 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 카테고리 목록 조회
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT id, name FROM categories ORDER BY name'
    );
    
    res.json({ 
      success: true, 
      categories 
    });
    
  } catch (error) {
    console.error('카테고리 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '카테고리 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 최근 추가된 도서 조회
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const [books] = await db.execute(`
      SELECT 
        b.id,
        b.title,
        b.published_year,
        GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') as authors,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') as categories,
        COUNT(DISTINCT bc.id) as total_copies,
        COUNT(DISTINCT CASE WHEN bc.status = 'available' THEN bc.id END) as available_copies
      FROM books b
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_categories bcat ON b.id = bcat.book_id
      LEFT JOIN categories c ON bcat.category_id = c.id
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      GROUP BY b.id, b.title, b.published_year
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [limit]);
    
    res.json({ 
      success: true, 
      books: books.map(book => ({
        ...book,
        canBorrow: book.available_copies > 0
      }))
    });
    
  } catch (error) {
    console.error('최근 도서 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '최근 도서 조회 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;

