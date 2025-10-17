// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const userPassword = document.getElementById('userPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // For now, just redirect to main page without backend validation
        // In production, you would make an API call here
        
        // Store user data in localStorage (temporary, for demo)
        const userData = {
            userId: userId || 'demo_user',
            name: '테스트 사용자',
            isAdmin: false,
            loginTime: new Date().toISOString()
        };
        
        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Redirect to main page
        window.location.href = 'main.html';
    });
    
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
        // User is already logged in, redirect to main page
        window.location.href = 'main.html';
    }
});

