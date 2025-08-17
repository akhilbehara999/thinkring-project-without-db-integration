document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');
    const itemList = document.getElementById('item-list');
    const adminItemList = document.getElementById('admin-item-list');
    const searchBar = document.getElementById('search-bar');
    const itemNameInput = document.getElementById('item-name');
    const itemDescriptionInput = document.getElementById('item-description');

    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');

    let items = JSON.parse(localStorage.getItem('lost-found-items')) || [];

    // Check for admin view
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    if (isAdminView) {
        userView.style.display = 'none';
        adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Lost & Found';
        renderAdminItems();
        drawAdminChart();
    } else {
        renderItems();
    }

    if(itemNameInput) itemNameInput.addEventListener('input', () => validateField(itemNameInput));
    if(itemDescriptionInput) itemDescriptionInput.addEventListener('input', () => validateField(itemDescriptionInput));

    if(reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isNameValid = validateField(itemNameInput);
            const isDescriptionValid = validateField(itemDescriptionInput);

            if (!isNameValid || !isDescriptionValid) {
                speak("Please fill out all required fields.");
                return;
            }

            const itemName = itemNameInput.value;
            const itemDescription = itemDescriptionInput.value;
            const itemStatus = document.getElementById('item-type').value;
            const itemImageInput = document.getElementById('item-image');

            const reader = new FileReader();
        reader.onload = function(event) {
            const newItem = {
                id: Date.now(),
                name: itemName,
                description: itemDescription,
                type: itemStatus, // 'lost' or 'found'
                image: event.target.result,
                reportedAt: new Date(),
                status: 'pending' // 'pending', 'approved', 'resolved'
            };
            items.push(newItem);
            localStorage.setItem('lost-found-items', JSON.stringify(items));
            renderItems();
            reportForm.reset();
        };

        if (itemImageInput.files[0]) {
            reader.readAsDataURL(itemImageInput.files[0]);
        } else {
             const newItem = {
                id: Date.now(),
                name: itemName,
                description: itemDescription,
                type: itemStatus, // 'lost' or 'found'
                image: null,
                reportedAt: new Date(),
                status: 'pending' // 'pending', 'approved', 'resolved'
            };
            items.push(newItem);
            localStorage.setItem('lost-found-items', JSON.stringify(items));
            renderItems();
            reportForm.reset();
        }
    });

    if(searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredItems = items.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
            renderItems(filteredItems);
        });
    }


    function renderItems(itemsToRender = items) {
        if(!itemList) return;
        itemList.innerHTML = '';

        if (itemsToRender.length === 0) {
            itemList.innerHTML = '<p class="empty-message">No lost or found items have been reported yet.</p>';
            return;
        }

        itemsToRender.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                ${item.image ? `<img src="${item.image}" alt="${sanitizeInput(item.name)}">` : ''}
                <h3>${sanitizeInput(item.name)} (${item.status})</h3>
                <p>${sanitizeInput(item.description)}</p>
                <small>Reported: ${new Date(item.reportedAt).toLocaleString()}</small>
            `;
            itemList.appendChild(itemCard);
        });
    }

    function renderAdminItems() {
        adminItemList.innerHTML = '';

        if (items.length === 0) {
            adminItemList.innerHTML = '<p class="empty-message">No items have been reported.</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                ${item.image ? `<img src="${item.image}" alt="${sanitizeInput(item.name)}">` : ''}
                <h3>${sanitizeInput(item.name)} (${item.type})</h3>
                <p>${sanitizeInput(item.description)}</p>
                <p>Status: <span class="status-badge status-${item.status}">${item.status}</span></p>
                <small>Reported: ${new Date(item.reportedAt).toLocaleString()}</small>
                <div class="admin-actions">
                    <button class="action-btn approve-btn" data-id="${item.id}">Approve</button>
                    <button class="action-btn resolve-btn" data-id="${item.id}">Resolve</button>
                    <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
                </div>
            `;
            adminItemList.appendChild(itemCard);
        });

        // Use event delegation for more efficient event handling
        adminItemList.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-btn')) {
                const itemId = parseInt(e.target.dataset.id, 10);

                if (e.target.classList.contains('delete-btn')) {
                    items = items.filter(item => item.id !== itemId);
                    localStorage.setItem('lost-found-items', JSON.stringify(items));
                    renderAdminItems();
                } else if (e.target.classList.contains('approve-btn')) {
                    updateItemStatus(itemId, 'approved');
                } else if (e.target.classList.contains('resolve-btn')) {
                    updateItemStatus(itemId, 'resolved');
                }
            }
        });
    }

    /**
     * Updates the status of a specific item.
     * @param {number} itemId The ID of the item to update.
     * @param {string} newStatus The new status ('pending', 'approved', 'resolved').
     */
    function updateItemStatus(itemId, newStatus) {
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            items[itemIndex].status = newStatus;
            localStorage.setItem('lost-found-items', JSON.stringify(items));
            renderAdminItems();
        }
    }

    /**
     * Draws the analytics chart for the admin view.
     */
    function drawAdminChart() {
        const lostCount = items.filter(item => item.type === 'lost').length;
        const foundCount = items.filter(item => item.type === 'found').length;
        const chartData = {
            labels: ['Lost', 'Found'],
            values: [lostCount, foundCount]
        };
        drawBarChart('lost-found-admin-chart', chartData, { barColor: '#ffd700' });
    }
});
