const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 임포트
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const loansRouter = require('./routes/loans');
const adminRouter = require('./routes/admin');
const statsRouter = require('./routes/stats');

// 라우트 설정
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/loans', loansRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);

// 기본 라우트
app.get('/api', (req, res) => {
  res.json({ message: 'Library Management System API' });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Library API Server running on port ${PORT}`);
});

