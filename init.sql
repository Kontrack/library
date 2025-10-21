-- 도서관 데이터베이스 초기화 스크립트
CREATE DATABASE IF NOT EXISTS library;
USE library;

-- 기존 테이블 삭제 (외래키 순서 고려)
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS book_copies;
DROP TABLE IF EXISTS book_categories;
DROP TABLE IF EXISTS book_authors;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;

-- ENUM 타입 정의
-- user_role: 'user' (일반 사용자), 'admin' (관리자)
-- copy_status: 'available' (대출 가능), 'borrowed' (대출 중), 'lost' (분실), 'damaged' (손상)

-- 1. 사용자 테이블
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_id (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 저자 테이블
CREATE TABLE authors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(160) NOT NULL UNIQUE,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 카테고리 테이블
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL UNIQUE,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 도서 테이블
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    published_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_published_year (published_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 도서-저자 관계 테이블 (Many-to-Many)
CREATE TABLE book_authors (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
    INDEX idx_book (book_id),
    INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 도서-카테고리 관계 테이블 (Many-to-Many)
CREATE TABLE book_categories (
    book_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_book (book_id),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 도서 사본 테이블 (실제 대출 가능한 책의 개별 사본)
CREATE TABLE book_copies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    status ENUM('available', 'borrowed', 'lost', 'damaged') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book (book_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 대출 테이블
CREATE TABLE loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    copy_id INT NOT NULL,
    checkout_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMP NOT NULL,
    returned_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (copy_id) REFERENCES book_copies(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_copy (copy_id),
    INDEX idx_checkout_at (checkout_at),
    INDEX idx_returned_at (returned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

