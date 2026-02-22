// App Configuration
const APP_CONFIG = {
    apiBase: 'http://localhost:5000/api',
    tokenKey: 'token',
    userKey: 'user'
};

// Utility Functions
function getToken() {
    return localStorage.getItem(APP_CONFIG.tokenKey);
}

function getUser() {
    const user = localStorage.getItem(APP_CONFIG.userKey);
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(user));
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(APP_CONFIG.tokenKey);
        localStorage.removeItem(APP_CONFIG.userKey);
        window.location.href = '/login.html';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) {
        console.error('Alert box not found');
        return;
    }

    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;

    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}

// Check Authentication
function checkAuth() {
    const user = getUser();
    const token = getToken();

    if (!user || !token) {
        window.location.href = '/login.html';
        return false;
    }

    return user;
}

function checkRole(requiredRole) {
    const user = checkAuth();
    if (!user || user.role !== requiredRole) {
        window.location.href = '/login.html';
        return false;
    }
    return user;
}

// Format Currency
function formatCurrency(amount) {
    return 'KES ' + parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format DateTime
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Days Until
function daysUntil(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diff = date - today;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Days Since
function daysSince(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diff = today - date;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Initialize User Info
function initializeUserInfo() {
    const user = getUser();
    if (user) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.email || 'User';
        }
    }
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeUserInfo();
});
