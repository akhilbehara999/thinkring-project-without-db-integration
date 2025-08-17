document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');
    const itemList = document.getElementById('item-list');
    const adminItemList = document.getElementById('admin-item-list');
    const searchBar = document.getElementById('search-bar');

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
    } else {
        renderItems();
    }

    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const itemName = document.getElementById('item-name').value;
        const itemDescription = document.getElementById('item-description').value;
        const itemStatus = document.getElementById('item-status').value;
        const itemImageInput = document.getElementById('item-image');

        const reader = new FileReader();
        reader.onload = function(event) {
            const newItem = {
                id: Date.now(),
                name: itemName,
                description: itemDescription,
                status: itemStatus,
                image: event.target.result,
                reportedAt: new Date()
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
                status: itemStatus,
                image: null,
                reportedAt: new Date()
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
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                ${item.image ? `<img src="${item.image}" alt="${sanitizeInput(item.name)}">` : ''}
                <h3>${sanitizeInput(item.name)} (${item.status})</h3>
                <p>${sanitizeInput(item.description)}</p>
                <small>Reported: ${new Date(item.reportedAt).toLocaleString()}</small>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
            `;
            adminItemList.appendChild(itemCard);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.id, 10);
                items = items.filter(item => item.id !== itemId);
                localStorage.setItem('lost-found-items', JSON.stringify(items));
                renderAdminItems();
            });
        });
    }
});
