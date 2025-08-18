document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('holographic-bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        isAlive() { return true; }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = 0;
            this.len = (Math.random() * 80) + 10;
            this.speed = (Math.random() * 10) + 6;
            this.size = (Math.random() * 1) + 0.1;
            this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
            this.active = false;
        }
        update() {
            if (this.active) {
                this.x -= this.speed;
                this.y += this.speed;
                if (this.x < 0 || this.y > canvas.height) {
                    this.reset();
                }
            } else {
                if (new Date().getTime() > this.waitTime) {
                    this.active = true;
                }
            }
        }
        draw() {
            if (this.active) {
                ctx.lineWidth = this.size;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.len, this.y - this.len);
                ctx.stroke();
            }
        }
        isAlive() { return true; }
    }

    class Spark {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 2 + 1;
            this.life = 100; // Lifespan in frames
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // Gravity
            this.life--;
        }
        draw() {
            ctx.fillStyle = `rgba(0, 212, 255, ${this.life / 100})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        isAlive() {
            return this.life > 0;
        }
    }

    window.createSparkParticles = (x, y, count = 10) => {
        for (let i = 0; i < count; i++) {
            particles.push(new Spark(x, y));
        }
    };

    function init() {
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
        for (let i = 0; i < 5; i++) {
            particles.push(new ShootingStar());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.isAlive()); // Remove dead particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    init();
    animate();
});
