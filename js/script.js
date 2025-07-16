// Sistema de autenticação simples usando localStorage
const users = {
    'admin': { password: 'admin@2025*', role: 'admin' },
    'José Eduardo': { password: 'Edu@2025*', role: 'admin' },
    'cliente1': { password: 'cliente01@2025', role: 'client' },
    'cliente2': { password: '123456', role: 'client' }
};

// Função para fazer login
function login(username, password) {
    if (users[username] && users[username].password === password) {
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            role: users[username].role
        }));
        return true;
    }
    return false;
}

// Função para verificar se o usuário está logado
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Função para obter o usuário atual
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Verificar se já está logado e redirecionar
function checkAuthAndRedirect() {
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (user.role === 'admin') {
            window.location.href = 'pages/admin.html';
        } else {
            window.location.href = 'pages/client.html';
        }
    }
}

// Event listener para o formulário de login
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        checkAuthAndRedirect();
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            
            if (login(username, password)) {
                const user = getCurrentUser();
                if (user.role === 'admin') {
                    window.location.href = 'pages/admin.html';
                } else {
                    window.location.href = 'pages/client.html';
                }
            } else {
                errorMessage.textContent = 'Usuário ou senha incorretos!';
            }
        });
    }
});

// Função para proteger páginas (verificar autenticação)
function protectPage(requiredRole = null) {
    if (!isLoggedIn()) {
        window.location.href = '../index.html';
        return false;
    }
    
    if (requiredRole) {
        const user = getCurrentUser();
        if (user.role !== requiredRole) {
            window.location.href = '../index.html';
            return false;
        }
    }
    
    return true;
}

