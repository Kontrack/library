const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'library2024',
  database: process.env.DB_NAME || 'library',
  port: parseInt(process.env.DB_PORT) || 3306,
  charset: process.env.DB_CHARSET || 'utf8mb4',
  collation: process.env.DB_COLLATION || 'utf8mb4_unicode_ci',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 추가 인코딩 옵션
  multipleStatements: false,
  timezone: '+09:00'
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

