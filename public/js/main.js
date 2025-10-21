// Main Page JavaScript

let currentUser = null;
let allBooks = [];
let allCategories = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!requireAuth()) return;
    
    currentUser = getUser();
    
    // Initialize UI
    initializeUI();
    
    // Load initial data
    await loadDashboardStats();
    await loadCategories();
    
    // Setup event listeners
    setupEventListeners();
});

function initializeUI() {
    // Show user name
    document.getElementById('userName').textContent = currentUser.name;
    
    // Show/hide admin features
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = '';
        });
    }
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearUser();
        window.location.href = '/login';
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            await navigateToPage(page);
        });
    });
    
    // Books page - search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.btn-search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => searchBooks());
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchBooks();
        });
    }
    
    // Books page - sort
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', () => searchBooks());
    }
    
    // Popular page - chart tabs
    document.querySelectorAll('.chart-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            document.querySelectorAll('.chart-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const chart = e.target.dataset.chart;
            await loadPopularBooks(chart === 'all' ? null : chart);
        });
    });
    
    // Admin tabs
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const adminPage = e.target.dataset.admin;
            showAdminPage(adminPage);
        });
    });
}

async function navigateToPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    // Show selected page
    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Load page-specific data
        switch (page) {
            case 'home':
                await loadDashboardStats();
                break;
            case 'books':
                await searchBooks();
                break;
            case 'popular':
                await loadCategoryTabs(); // 카테고리 탭 동적 생성
                await loadPopularBooks();
                await loadMonthlyStats();
                break;
            case 'mybooks':
                await loadMyLoans();
                break;
            case 'manage':
                if (currentUser.role === 'admin') {
                    await loadAdminBooks();
                }
                break;
        }
    }
}

// === Dashboard ===
async function loadDashboardStats() {
    try {
        const response = await apiCall('/stats/dashboard');
        if (response.success) {
            const stats = response.stats;
            // Update stat cards
            const statCards = document.querySelectorAll('.stat-card .stat-number');
            if (statCards[0]) statCards[0].textContent = stats.totalBooks || 0;
            if (statCards[1]) statCards[1].textContent = (stats.totalCopies - stats.currentLoans) || 0;
            if (statCards[3]) statCards[3].textContent = stats.monthlyLoans || 0;
        }
        
        // Load user's current loan count
        const eligibility = await apiCall(`/loans/check-eligibility/${currentUser.id}`);
        if (eligibility.success) {
            const statCards = document.querySelectorAll('.stat-card .stat-number');
            if (statCards[2]) statCards[2].textContent = eligibility.currentLoanCount || 0;
        }
        
        // Load recent books
        await loadRecentBooks();
    } catch (error) {
        console.error('대시보드 통계 로드 오류:', error);
    }
}

async function loadRecentBooks() {
    try {
        const response = await apiCall('/books/recent?limit=4');
        if (response.success && response.books.length > 0) {
            renderRecentBooks(response.books);
        }
    } catch (error) {
        console.error('최근 도서 로드 오류:', error);
    }
}

function renderRecentBooks(books) {
    const container = document.querySelector('.book-grid');
    if (!container) return;
    
    const emojis = ['📘', '📗', '📙', '📕', '📔', '📓'];
    
    container.innerHTML = books.map((book, index) => `
        <div class="book-card">
            <div class="book-cover">${emojis[index % emojis.length]}</div>
            <h3>${book.title}</h3>
            <p class="book-author">${book.authors || '-'}</p>
            <p class="book-category">${book.categories || '-'}</p>
            <button class="btn-small" onclick="borrowBook(${book.id})" ${!book.canBorrow ? 'disabled' : ''}>
                ${book.canBorrow ? '대출하기' : '대출 불가'}
            </button>
        </div>
    `).join('');
}

// === Books List ===
async function searchBooks() {
    try {
        const searchTerm = document.getElementById('searchInput')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'title';
        
        const params = new URLSearchParams({
            search: searchTerm,
            searchType: 'title',
            sortBy: sortBy,
            sortOrder: 'ASC'
        });
        
        const response = await apiCall(`/books?${params}`);
        if (response.success) {
            allBooks = response.books;
            renderBooksTable(allBooks);
        }
    } catch (error) {
        console.error('도서 검색 오류:', error);
        alert('도서 목록을 불러올 수 없습니다.');
    }
}

function renderBooksTable(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    
    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = books.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.authors || '-'}</td>
            <td>${book.categories || '-'}</td>
            <td>${book.available_copies} / ${book.total_copies}</td>
            <td>
                <span class="badge ${book.canBorrow ? 'badge-success' : 'badge-danger'}">
                    ${book.canBorrow ? '가능' : '불가'}
                </span>
            </td>
            <td>
                ${book.canBorrow ? 
                    `<button class="btn-small" onclick="borrowBook(${book.id})">대출</button>` :
                    `<button class="btn-small" disabled>대출 불가</button>`
                }
            </td>
        </tr>
    `).join('');
}

async function borrowBook(bookId) {
    try {
        // Get book details to find an available copy
        const response = await apiCall(`/books/${bookId}`);
        if (!response.success) {
            alert('도서 정보를 불러올 수 없습니다.');
            return;
        }
        
        const book = response.book;
        const availableCopy = book.copies.find(c => c.status === 'available');
        
        if (!availableCopy) {
            alert('대출 가능한 사본이 없습니다.');
            return;
        }
        
        if (!confirm(`"${book.title}"을(를) 대출하시겠습니까?\n(반납기한: 7일)`)) {
            return;
        }
        
        const loanResponse = await apiCall('/loans/checkout', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser.id,
                copyId: availableCopy.id
            })
        });
        
        if (loanResponse.success) {
            alert('대출이 완료되었습니다!');
            await searchBooks(); // Refresh list
        }
    } catch (error) {
        alert(error.message || '대출에 실패했습니다.');
    }
}

// === Popular Books ===
async function loadCategoryTabs() {
    const tabsContainer = document.querySelector('.chart-tabs');
    if (!tabsContainer) return;
    
    // 카테고리 목록이 없으면 먼저 로드
    if (allCategories.length === 0) {
        await loadCategories();
    }
    
    // 동적으로 탭 생성
    tabsContainer.innerHTML = `
        <button class="tab-btn active" data-chart="all">전체</button>
        ${allCategories.map(cat => `
            <button class="tab-btn" data-chart="${cat.name}">${cat.name}</button>
        `).join('')}
    `;
    
    // 이벤트 리스너 재등록
    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const chart = e.target.dataset.chart;
            await loadPopularBooks(chart === 'all' ? null : chart);
        });
    });
}

async function loadPopularBooks(categoryName = null) {
    try {
        // categoryName을 categoryId로 변환
        let categoryId = null;
        if (categoryName && categoryName !== 'all') {
            const category = allCategories.find(c => c.name === categoryName);
            if (category) {
                categoryId = category.id;
            }
        }
        
        const params = categoryId ? `?categoryId=${categoryId}` : '';
        const response = await apiCall(`/books/charts/popular${params}`);
        
        if (response.success) {
            renderPopularBooks(response.books);
        }
    } catch (error) {
        console.error('인기 도서 로드 오류:', error);
    }
}

function renderPopularBooks(books) {
    const container = document.querySelector('.popular-list');
    if (!container) return;
    
    if (books.length === 0) {
        container.innerHTML = '<p class="text-center">인기 도서 정보가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = books.map((book, index) => `
        <div class="rank-item">
            <div class="rank-number">${index + 1}</div>
            <div class="rank-info">
                <h3>${book.title}</h3>
                <p>${book.authors || '-'} · ${book.categories || '-'}</p>
            </div>
            <div class="rank-count">대출 ${book.loan_count}회</div>
        </div>
    `).join('');
}

async function loadMonthlyStats() {
    try {
        // 이달의 독서왕
        const readersResponse = await apiCall('/stats/top-readers');
        if (readersResponse.success) {
            renderTopReaders(readersResponse.topReaders);
        }
        
        // 이달의 핫한 저자
        const authorResponse = await apiCall('/stats/hot-author');
        if (authorResponse.success) {
            renderHotAuthor(authorResponse.hotAuthor);
        }
    } catch (error) {
        console.error('월간 통계 로드 오류:', error);
    }
}

function renderTopReaders(readers) {
    const container = document.getElementById('topReadersContainer');
    if (!container) return;
    
    if (!readers || readers.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: #7f8c8d;">이번 달 대출 기록이 없습니다.</p>';
        return;
    }
    
    const medals = ['🥇', '🥈', '🥉'];
    container.innerHTML = readers.map((reader, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #ecf0f1;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.5rem;">${medals[index]}</span>
                <div>
                    <div style="font-weight: 600; color: #2c3e50;">${reader.name}</div>
                    <div style="font-size: 0.875rem; color: #7f8c8d;">ID: ${reader.id}</div>
                </div>
            </div>
            <div style="font-weight: 600; color: #3498db;">${reader.loan_count}권</div>
        </div>
    `).join('');
}

function renderHotAuthor(author) {
    const container = document.getElementById('hotAuthorContainer');
    if (!container) return;
    
    if (!author) {
        container.innerHTML = '<p class="text-center" style="color: #7f8c8d;">이번 달 대출 기록이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="text-align: center; padding: 1rem 0;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">✨</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin-bottom: 0.5rem;">${author.name}</div>
            <div style="font-size: 1.125rem; color: #3498db; font-weight: 600;">총 ${author.total_loans}회 대출</div>
            <div style="font-size: 0.875rem; color: #7f8c8d; margin-top: 0.5rem;">이번 달 가장 인기 있는 저자입니다!</div>
        </div>
    `;
}

// === My Loans ===
async function loadMyLoans() {
    try {
        const response = await apiCall(`/loans/history/${currentUser.id}?status=all`);
        if (response.success) {
            renderMyLoans(response.loans);
        }
    } catch (error) {
        console.error('대출 기록 로드 오류:', error);
        alert('대출 기록을 불러올 수 없습니다.');
    }
}

function renderMyLoans(loans) {
    const currentLoans = loans.filter(l => !l.returned_at);
    const pastLoans = loans.filter(l => l.returned_at);
    
    // Current loans
    const currentSection = document.querySelector('.current-loans .loan-list');
    if (currentSection) {
        const loansHeader = document.querySelector('.current-loans h2');
        if (loansHeader) {
            loansHeader.textContent = `현재 대출 중 (${currentLoans.length}/3)`;
        }
        
        if (currentLoans.length === 0) {
            currentSection.innerHTML = '<p class="text-center">현재 대출 중인 도서가 없습니다.</p>';
        } else {
            currentSection.innerHTML = currentLoans.map(loan => {
                const dueDate = new Date(loan.due_at);
                const today = new Date();
                const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const isOverdue = loan.is_overdue;
                
                return `
                    <div class="loan-item ${isOverdue ? 'overdue' : ''}">
                        <div class="loan-book">
                            <div class="book-cover-small">📘</div>
                            <div>
                                <h3>${loan.title}</h3>
                                <p>${loan.authors || '-'}</p>
                            </div>
                        </div>
                        <div class="loan-info">
                            <p>대출일: ${formatDate(loan.checkout_at)}</p>
                            <p class="due-date ${isOverdue ? 'text-danger' : ''}">
                                반납일: ${formatDate(loan.due_at)} 
                                ${isOverdue ? `(${loan.overdue_days}일 연체)` : `(${daysLeft}일 남음)`}
                            </p>
                        </div>
                        <button class="btn-small btn-return" onclick="returnBook(${loan.loan_id})">반납하기</button>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Loan history
    const historyTable = document.querySelector('.loan-history tbody');
    if (historyTable) {
        if (pastLoans.length === 0) {
            historyTable.innerHTML = '<tr><td colspan="5" class="text-center">대출 이력이 없습니다.</td></tr>';
        } else {
            historyTable.innerHTML = pastLoans.map(loan => `
                <tr>
                    <td>${loan.title}</td>
                    <td>${loan.authors || '-'}</td>
                    <td>${formatDate(loan.checkout_at)}</td>
                    <td>${formatDate(loan.returned_at)}</td>
                    <td><span class="badge badge-secondary">반납완료</span></td>
                </tr>
            `).join('');
        }
    }
}

async function returnBook(loanId) {
    if (!confirm('이 도서를 반납하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await apiCall('/loans/return', {
            method: 'POST',
            body: JSON.stringify({ loanId })
        });
        
        if (response.success) {
            alert('반납이 완료되었습니다!');
            await loadMyLoans(); // Refresh
        }
    } catch (error) {
        alert(error.message || '반납에 실패했습니다.');
    }
}

// === Admin Functions ===
function showAdminPage(adminPage) {
    document.querySelectorAll('.admin-content').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById(`admin-${adminPage}`);
    if (section) {
        section.style.display = 'block';
        
        switch (adminPage) {
            case 'books':
                loadAdminBooks();
                break;
            case 'categories':
                loadAdminCategories();
                break;
            case 'members':
                loadAdminMembers();
                break;
        }
    }
}

async function loadAdminBooks() {
    await searchBooks();
    // Can reuse the same books data for admin view
}

async function loadAdminCategories() {
    try {
        const response = await apiCall('/books/categories/list');
        if (response.success) {
            renderAdminCategories(response.categories);
        }
    } catch (error) {
        console.error('카테고리 로드 오류:', error);
    }
}

function renderAdminCategories(categories) {
    const tbody = document.querySelector('#admin-categories tbody');
    if (!tbody) return;
    
    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.name}</td>
            <td>-</td>
            <td>
                <button class="btn-small btn-danger" onclick="deleteCategory(${cat.id}, '${cat.name}')">삭제</button>
            </td>
        </tr>
    `).join('');
}

async function loadAdminMembers() {
    try {
        const response = await apiCall('/admin/users?role=all');
        if (response.success) {
            renderAdminMembers(response.users);
        }
    } catch (error) {
        console.error('회원 목록 로드 오류:', error);
    }
}

function renderAdminMembers(users) {
    const tbody = document.querySelector('#admin-members tbody');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.role === 'admin' ? '관리자' : '일반 사용자'}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <span class="badge ${user.has_overdue ? 'badge-danger' : 'badge-success'}">
                    ${user.has_overdue ? '연체' : '정상'}
                </span>
            </td>
        </tr>
    `).join('');
}

async function deleteCategory(categoryId, categoryName) {
    if (!confirm(`"${categoryName}" 카테고리를 삭제하시겠습니까?`)) {
        return;
    }
    
    try {
        const response = await apiCall(`/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('카테고리가 삭제되었습니다.');
            await loadAdminCategories();
        }
    } catch (error) {
        alert(error.message || '카테고리 삭제에 실패했습니다.');
    }
}

// === Utility Functions ===
async function loadCategories() {
    try {
        const response = await apiCall('/books/categories/list');
        if (response.success) {
            allCategories = response.categories;
        }
    } catch (error) {
        console.error('카테고리 로드 오류:', error);
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}
