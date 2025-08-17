document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');
    const adminAccessBtn = document.getElementById('admin-access-btn');

    let failedLoginAttempts = 0;
    const maxLoginAttempts = 3;

    // --- Interactive Particle Animation ---
    const particleContainer = document.getElementById('particle-container');
    const particles = [];
    const numParticles = 75;
    const mouse = { x: null, y: null };

    if (particleContainer) {
        // Create particles
        for (let i = 0; i < numParticles; i++) {
            const p = {
                domElement: document.createElement('div'),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            };
            p.domElement.classList.add('particle');
            p.domElement.style.left = `${p.x}px`;
            p.domElement.style.top = `${p.y}px`;
            particleContainer.appendChild(p.domElement);
            particles.push(p);
        }

        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Animation loop
        function animateParticles() {
            for (let i = 0; i < numParticles; i++) {
                const p = particles[i];
                let ax = 0, ay = 0;

                // Force towards mouse
                if (mouse.x !== null) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 1) {
                        ax += dx / dist * 0.5; // Acceleration towards mouse
                        ay += dy / dist * 0.5;
                    }
                }

                // Add some damping/friction
                p.vx = p.vx * 0.98 + ax;
                p.vy = p.vy * 0.98 + ay;

                p.x += p.vx;
                p.y += p.vy;

                // Boundary checks
                if (p.x > window.innerWidth) p.x = 0;
                if (p.x < 0) p.x = window.innerWidth;
                if (p.y > window.innerHeight) p.y = 0;
                if (p.y < 0) p.y = window.innerHeight;

                p.domElement.style.left = `${p.x}px`;
                p.domElement.style.top = `${p.y}px`;
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }


    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (failedLoginAttempts >= maxLoginAttempts) {
            loginMessage.textContent = 'Too many failed login attempts. Please try again later.';
            speak('Too many failed login attempts. Please try again later.');
            return;
        }

        const allUsers = getUsers();
        const username = usernameInput.value;
        const password = passwordInput.value;
        const user = allUsers.find(u => u.username === username);

        let isAuthenticated = false;
        if (user) {
            // Check if user is suspended
            if (user.status === 'suspended') {
                loginMessage.textContent = 'Your account is suspended.';
                speak('This account is suspended.');
                return; // Stop the login process
            }

            // Check password
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

            // Store session token and user info
            localStorage.setItem('sessionToken', `token-${Date.now()}`);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('username', user.username);

            // Update last login
            updateUser(user.id, { lastLogin: new Date().toLocaleString() });

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
        usernameInput.value = 'KAB';
        passwordInput.value = '';
        passwordInput.focus();
    });
});
