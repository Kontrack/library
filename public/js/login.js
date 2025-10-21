// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Check if user is already logged in
    if (isLoggedIn()) {
        window.location.href = '/main';
        return;
    }
    
    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value.trim();
        const userPassword = document.getElementById('userPassword').value;
        
        if (!userId || !userPassword) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }
        
        try {
            // API call to login
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    id: userId,
                    password: userPassword
                })
            });
            
            if (response.success) {
                // Store user data
                setUser(response.user, false);
                
                // Redirect to main page
                window.location.href = '/main';
            }
        } catch (error) {
            alert(error.message || '로그인에 실패했습니다.');
        }
    });
});

