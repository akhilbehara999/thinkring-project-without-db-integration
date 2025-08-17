document.addEventListener('DOMContentLoaded', () => {
    // Check for session token and admin role
    if (!localStorage.getItem('sessionToken') || localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
    }

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
    });

    const moduleCards = document.querySelectorAll('.module-card');
    moduleCards.forEach(card => {
        card.addEventListener('click', () => {
            const module = card.dataset.module;
            // Redirect to the admin view of the module
            window.location.href = `modules/${module}/${module}.html?view=admin`;
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                card.click();
            }
        });
    });
});
