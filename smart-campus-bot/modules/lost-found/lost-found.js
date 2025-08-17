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
