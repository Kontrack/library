// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://library.kontrack.kr/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// User session management
function getUser() {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

function setUser(userData, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
}

function clearUser() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
}

function isLoggedIn() {
    return getUser() !== null;
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

function requireAdmin() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        alert('관리자 권한이 필요합니다.');
        window.location.href = '/main';
        return false;
    }
    return true;
}

