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
            }
        });
    });
    
    // Handle registration form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            userId: document.getElementById('regUserId').value,
            password: document.getElementById('regPassword').value,
            passwordConfirm: document.getElementById('regPasswordConfirm').value,
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            accountType: document.querySelector('input[name="accountType"]:checked').value,
            adminCode: document.getElementById('adminCode').value
        };
        
        // Validate password match
        if (formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        // Validate admin code if admin account
        if (formData.accountType === 'admin') {
            if (formData.adminCode.length !== 10) {
                alert('관리자 코드는 10자리 학번이어야 합니다.');
                return;
            }
            // In production, validate admin code with backend
        }
        
        // For now, just show success and redirect to login
        alert('회원가입이 완료되었습니다!');
        window.location.href = '/login';
        
        // In production, you would make an API call here
        // fetch('/api/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData)
        // })
    });
});

