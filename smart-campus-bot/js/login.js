document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');
    const adminAccessBtn = document.getElementById('admin-access-btn');

    const users = {
        'student': { password: 'password123', role: 'student' },
        'admin': { password: simpleHash('adminpass'), role: 'admin' }
    };

    let failedLoginAttempts = 0;
    const maxLoginAttempts = 3;

    // Particle animation
    const particleContainer = document.getElementById('particle-container');
    if (particleContainer) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationDuration = `${3 + Math.random() * 3}s`;
            particleContainer.appendChild(particle);
        }
    }


    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (failedLoginAttempts >= maxLoginAttempts) {
            loginMessage.textContent = 'Too many failed login attempts. Please try again later.';
            speak('Too many failed login attempts. Please try again later.');
            return;
        }

        const username = usernameInput.value;
        const password = passwordInput.value;
        const user = users[username];

        let isAuthenticated = false;
        if (user) {
            if (user.role === 'admin') {
                isAuthenticated = simpleHash(password) === user.password;
            } else {
                isAuthenticated = password === user.password;
            }
        }

        if (isAuthenticated) {
            loginMessage.textContent = 'Authentication successful. Redirecting...';
            loginMessage.style.color = 'var(--success-color)';
            speak('Authentication successful. Redirecting to your dashboard.');

            // Store session token and user role
            localStorage.setItem('sessionToken', `token-${Date.now()}`);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('username', username);

            setTimeout(() => {
                window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
            }, 2000);
        } else {
            failedLoginAttempts++;
            loginMessage.textContent = 'Invalid username or password.';
            loginMessage.style.color = 'var(--error-color)';
            speak('Invalid username or password.');
        }
    });

    adminAccessBtn.addEventListener('click', () => {
        // A simple "secret" way to fill in admin credentials
        usernameInput.value = 'admin';
        passwordInput.value = '';
        passwordInput.focus();
    });
});
