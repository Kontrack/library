// Main Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
        // User is not logged in, redirect to login page
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(storedUser);
    
    // Update user name in navbar
    document.getElementById('userName').textContent = user.name || user.userId;
    
    // Show admin menu if user is admin
    if (user.isAdmin) {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = '';
        });
    }
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    });
    
    // Handle navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetPage = this.dataset.page;
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById('page-' + targetPage).classList.add('active');
        });
    });
    
    // Handle admin tabs
    const adminTabBtns = document.querySelectorAll('[data-admin]');
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.admin;
            
            // Update active tab button
            adminTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show target admin content
            document.querySelectorAll('.admin-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById('admin-' + targetTab).style.display = 'block';
        });
    });
    
    // Handle popular books chart tabs
    const chartTabBtns = document.querySelectorAll('[data-chart]');
    chartTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            chartTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // In production, you would fetch data for the selected category
            console.log('Chart category:', this.dataset.chart);
        });
    });
    
    // Handle book borrowing (demo)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-small') && e.target.textContent.includes('대출')) {
            alert('대출 기능은 백엔드 구현 후 사용 가능합니다.');
        }
        
        if (e.target.classList.contains('btn-return')) {
            if (confirm('이 도서를 반납하시겠습니까?')) {
                alert('반납 기능은 백엔드 구현 후 사용 가능합니다.');
            }
        }
    });
    
    // Search functionality (demo)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const query = this.value;
                console.log('Searching for:', query);
                // In production, you would make an API call here
            }
        });
    }
    
    // Filter and sort functionality (demo)
    const sortSelect = document.getElementById('sortBy');
    const categorySelect = document.getElementById('filterCategory');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            console.log('Sort by:', this.value);
            // In production, you would update the table based on sort option
        });
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            console.log('Filter by category:', this.value);
            // In production, you would update the table based on category filter
        });
    }
});

