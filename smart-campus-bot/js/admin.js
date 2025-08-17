document.addEventListener('DOMContentLoaded', () => {
    // Check for session token and admin role
    if (!localStorage.getItem('sessionToken') || localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return; // Stop execution if not an admin
    }

    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    }

    /**
     * Populates the overview cards with real and simulated data.
     */
    function populateOverviewCards() {
        // Total Users
        const totalUsersEl = document.getElementById('total-users');
        if (totalUsersEl) {
            const users = getUsers();
            totalUsersEl.textContent = users.length;
        }

        // System Usage (Simulated)
        const systemUsageEl = document.getElementById('system-usage');
        if (systemUsageEl) {
            systemUsageEl.textContent = `${(Math.random() * 20 + 70).toFixed(1)}%`;
        }

        // Recent Alerts (Simulated)
        const recentAlertsEl = document.getElementById('recent-alerts');
        if (recentAlertsEl) {
            recentAlertsEl.textContent = '2'; // Placeholder value
        }
    }

    /**
     * Initializes and draws all charts on the admin dashboard.
     */
    function initializeCharts() {
        // --- Lost & Found Chart ---
        const lostFoundItems = JSON.parse(localStorage.getItem('lost-found-items')) || [];
        const lostCount = lostFoundItems.filter(item => item.status === 'lost').length;
        const foundCount = lostFoundItems.filter(item => item.status === 'found').length;
        const lostFoundData = {
            labels: ['Lost', 'Found'],
            values: [lostCount, foundCount]
        };
        drawBarChart('lost-found-chart', lostFoundData, { barColor: '#ffd700' });

        // --- Quiz Usage Chart (Simulated) ---
        const customQuizCount = (JSON.parse(localStorage.getItem('quiz-questions')) || []).length;
        const quizData = {
            labels: ['Easy', 'Medium', 'Hard', 'Custom'],
            values: [
                Math.floor(Math.random() * 50 + 10),
                Math.floor(Math.random() * 30 + 5),
                Math.floor(Math.random() * 20 + 2),
                customQuizCount
            ]
        };
        drawBarChart('quiz-chart', quizData, { barColor: '#ff4757' });


        // --- Storage Capacity Chart (Simulated) ---
        // We'll simulate based on number of items in localStorage for now
        const lostFoundSize = (JSON.parse(localStorage.getItem('lost-found-items')) || []).length * 0.2; // Avg 0.2 MB
        const quizResultsSize = (JSON.parse(localStorage.getItem('quiz-results')) || []).length * 0.01; // Avg 0.01 MB
        const usedStorage = lostFoundSize + quizResultsSize;
        const totalStorage = 50; // Simulate total capacity in MB
        const storageData = {
            labels: ['Used (MB)', 'Free (MB)'],
            values: [usedStorage.toFixed(1), (totalStorage - usedStorage).toFixed(1)]
        };
        drawBarChart('storage-chart', storageData, { barColor: '#4cd137' });
    }

    // --- User Management ---
    const userSearchInput = document.getElementById('user-search');
    const userTableBody = document.querySelector('#user-table tbody');

    /**
     * Renders the user data into the management table.
     * Filters users based on the search input.
     */
    function renderUserTable() {
        if (!userTableBody) return;

        const users = getUsers();
        const searchTerm = userSearchInput.value.toLowerCase();

        userTableBody.innerHTML = ''; // Clear existing rows

        const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm));

        filteredUsers.forEach(user => {
            const row = userTableBody.insertRow();
            row.innerHTML = `
                <td>${sanitizeInput(user.username)}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>
                    <button class="action-btn suspend-btn" data-id="${user.id}">Suspend</button>
                    <button class="action-btn promote-btn" data-id="${user.id}">Promote</button>
                </td>
            `;
        });
    }

    if(userSearchInput) {
        userSearchInput.addEventListener('input', renderUserTable);
    }

    // Initial population of dashboard elements
    populateOverviewCards();
    initializeCharts();
    renderUserTable();
});
