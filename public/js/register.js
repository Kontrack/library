// Register Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
    const adminCodeGroup = document.getElementById('adminCodeGroup');
    const adminCodeInput = document.getElementById('adminCode');
    
    // Show/hide admin code field based on account type
    accountTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'admin') {
                adminCodeGroup.style.display = 'block';
                adminCodeInput.required = true;
            } else {
                adminCodeGroup.style.display = 'none';
                adminCodeInput.required = false;
                adminCodeInput.value = '';
            }
        });
    });
    
    // Handle registration form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('regUserId').value.trim();
        const name = document.getElementById('regName').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        const accountType = document.querySelector('input[name="accountType"]:checked').value;
        const adminCode = document.getElementById('adminCode').value.trim();
        
        // Validate user ID
        if (!userId) {
            alert('아이디를 입력해주세요.');
            return;
        }
        
        // Validate name
        if (!name) {
            alert('이름을 입력해주세요.');
            return;
        }
        
        // Validate password
        if (password.length < 4) {
            alert('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }
        
        // Validate password match
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        // Validate admin code if admin account
        if (accountType === 'admin' && !adminCode) {
            alert('관리자 코드를 입력해주세요.');
            return;
        }
        
        try {
            // API call to register
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    id: userId,
                    name: name,
                    password: password,
                    role: accountType,
                    adminCode: accountType === 'admin' ? adminCode : undefined
                })
            });
            
            if (response.success) {
                alert('회원가입이 완료되었습니다!');
                window.location.href = '/login';
            }
        } catch (error) {
            alert(error.message || '회원가입에 실패했습니다.');
        }
    });
});

