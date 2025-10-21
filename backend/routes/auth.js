const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 회원가입
router.post('/register', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id, name, password, role, adminCode } = req.body;
    
    // 입력값 검증
    if (!id || !name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '아이디, 이름, 비밀번호를 모두 입력해주세요.' 
      });
    }
    
    // 비밀번호 길이 검증 (최소 4자)
    if (password.length < 4) {
      return res.status(400).json({ 
        success: false, 
        message: '비밀번호는 최소 4자 이상이어야 합니다.' 
      });
    }
    
    // 관리자 가입 시 추가 코드 검증
    if (role === 'admin') {
      const ADMIN_CODE = process.env.ADMIN_CODE || '2022086244';
      if (adminCode !== ADMIN_CODE) {
        return res.status(403).json({ 
          success: false, 
          message: '관리자 가입 코드가 올바르지 않습니다.' 
        });
      }
    }
    
    await connection.beginTransaction();
    
    // 사용자 등록 (PRIMARY KEY로 동시성 제어)
    await connection.execute(
      'INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, ?)',
      [id, name, password, role || 'user']
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: '회원가입이 완료되었습니다.',
      userId: id
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('회원가입 오류:', error);
    
    // PRIMARY KEY 중복 (동일한 아이디)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: '이미 사용 중인 아이디입니다.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: '회원가입 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    
    if (!id || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '아이디와 비밀번호를 입력해주세요.' 
      });
    }
    
    const [users] = await db.execute(
      'SELECT id, name, role FROM users WHERE id = ? AND password = ?',
      [id, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '아이디 또는 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    const user = users[0];
    
    res.json({ 
      success: true, 
      message: '로그인 성공',
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '로그인 중 오류가 발생했습니다.' 
    });
  }
});

// 비밀번호 변경
router.post('/change-password', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '모든 필드를 입력해주세요.' 
      });
    }
    
    // 새 비밀번호 길이 검증
    if (newPassword.length < 4) {
      return res.status(400).json({ 
        success: false, 
        message: '새 비밀번호는 최소 4자 이상이어야 합니다.' 
      });
    }
    
    await connection.beginTransaction();
    
    // 현재 비밀번호 확인
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ? AND password = ?',
      [userId, currentPassword]
    );
    
    if (users.length === 0) {
      await connection.rollback();
      return res.status(401).json({ 
        success: false, 
        message: '현재 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 비밀번호 변경
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, userId]
    );
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: '비밀번호가 변경되었습니다.' 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '비밀번호 변경 중 오류가 발생했습니다.' 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

