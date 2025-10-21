const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'library2024',
  database: process.env.DB_NAME || 'library',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 연결 테스트
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL 데이터베이스 연결 성공');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL 데이터베이스 연결 실패:', err.message);
  });

module.exports = pool;

