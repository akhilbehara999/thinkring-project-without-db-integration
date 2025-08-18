document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');
    const itemList = document.getElementById('item-list');
    const adminItemList = document.getElementById('admin-item-list');
    const searchBar = document.getElementById('search-bar');
    const filterStatusEl = document.getElementById('filter-status');
    const sortByEl = document.getElementById('sort-by');
    const itemNameInput = document.getElementById('item-name');
    const itemDescriptionInput = document.getElementById('item-description');
    const itemImageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');

    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');

    let items = JSON.parse(localStorage.getItem('lost-found-items')) || [];

    // Check for admin view
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    if (isAdminView) {
        document.body.classList.add('admin-mode');
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Lost & Found';
        renderAdminTable();
        renderAdminAnalytics();
    } else {
        document.body.classList.add('user-mode');
        renderItems();
    }

    if(itemNameInput) itemNameInput.addEventListener('input', () => validateField(itemNameInput));
    if(itemDescriptionInput) itemDescriptionInput.addEventListener('input', () => validateField(itemDescriptionInput));

    if (itemImageInput) {
        itemImageInput.addEventListener('change', () => {
            const file = itemImageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
            }
        });
    }

    if(reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Description is now optional, so we only validate the name.
            const isNameValid = validateField(itemNameInput);

            if (!isNameValid) {
                speak("Please fill out all required fields.");
                return;
            }

            const newItem = {
                id: Date.now(),
                name: itemNameInput.value,
                description: itemDescriptionInput.value,
                type: document.getElementById('item-type').value,
                category: document.getElementById('item-category').value,
                date: document.getElementById('item-date').value,
                location: document.getElementById('item-location').value,
                contact: document.getElementById('item-contact').value,
                image: imagePreview.src.startsWith('data:image') ? imagePreview.src : null,
                reportedAt: new Date(),
                reportedBy: localStorage.getItem('username') || 'anonymous',
                // Items are now approved by default to be visible immediately.
                status: 'approved'
            };

            items.push(newItem);
            localStorage.setItem('lost-found-items', JSON.stringify(items));
            alert('Your report has been submitted.'); // Changed message

            reportForm.reset();
            imagePreview.style.display = 'none';

            // Reset filters to ensure the new item is visible
            if(searchBar) searchBar.value = '';
            if(filterStatusEl) filterStatusEl.value = 'all';
            if(sortByEl) sortByEl.value = 'newest';

            renderItems(); // Re-render the user's view
    });

    if(searchBar) searchBar.addEventListener('input', renderItems);
    if(filterStatusEl) filterStatusEl.addEventListener('change', renderItems);
    if(sortByEl) sortByEl.addEventListener('change', renderItems);


    // --- Modal Logic ---
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const contactForm = document.getElementById('contact-form');
    const contactItemIdInput = document.getElementById('contact-item-id');

    function openModal(itemId) {
        contactItemIdInput.value = itemId;
        contactModal.classList.add('visible');
    }

    function closeModal() {
        contactModal.classList.remove('visible');
        contactForm.reset();
    }

    if(itemList) {
        // 3D Tilt Effect & Particle Sparks
        let lastSparkTime = 0;
        itemList.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.item-card');
            if (card) {
                // Throttled sparks on move
                const now = Date.now();
                if (now - lastSparkTime > 50) {
                    if (window.createSparkParticles) {
                        window.createSparkParticles(e.pageX, e.pageY, 2);
                    }
                    lastSparkTime = now;
                }

                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -8; // Max rotation 8deg
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            }
        });

        itemList.addEventListener('mouseleave', () => {
            const cards = itemList.querySelectorAll('.item-card');
            cards.forEach(card => {
                card.style.transform = 'perspective(1500px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });

        itemList.addEventListener('click', (e) => {
            if (e.target.classList.contains('contact-btn')) {
                const itemId = e.target.dataset.id;
                openModal(itemId);
            } else if (e.target.closest('.item-card')) {
                // Click on card itself for a larger burst
                if (window.createSparkParticles) {
                    window.createSparkParticles(e.pageX, e.pageY, 20);
                }
            }
        });
    }

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(contactModal) contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            closeModal();
        }
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, this would send an email or an in-app message.
            // Here, we'll just simulate it and log to console.
            const messageData = {
                toItemId: contactItemIdInput.value,
                from: document.getElementById('user-contact-info').value,
                message: document.getElementById('contact-message').value,
                sentAt: new Date()
            };
            console.log("Simulated Message Sent:", messageData);
            alert('Message sent successfully! The item reporter has been notified.');
            closeModal();
        });
    }


    function renderItems() {
        if(!itemList) return;

        // In user view, only show 'approved' items.
        let itemsToRender = items.filter(item => item.status === 'approved');

        // 1. Filter by status
        const filterValue = filterStatusEl.value;
        if (filterValue !== 'all') {
            itemsToRender = itemsToRender.filter(item => item.type === filterValue);
        }

        // 2. Filter by search term
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm) {
            itemsToRender = itemsToRender.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm)
            );
        }

        // 3. Sort
        const sortByValue = sortByEl.value;
        itemsToRender.sort((a, b) => {
            const dateA = new Date(a.reportedAt);
            const dateB = new Date(b.reportedAt);
            return sortByValue === 'newest' ? dateB - dateA : dateA - dateB;
        });

        itemList.innerHTML = '';
        if (itemsToRender.length === 0) {
            itemList.innerHTML = '<p class="empty-message">No items match your criteria.</p>';
            return;
        }

        itemsToRender.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                <div class="card-image-container">
                    ${item.image ? `<img src="${item.image}" alt="${sanitizeInput(item.name)}">` : '<div class="no-image">No Image</div>'}
                </div>
                <h3>${sanitizeInput(item.name)}</h3>
                <p class="item-meta">
                    <span class="badge category-${item.category}">${sanitizeInput(item.category)}</span>
                    <span class="badge type-${item.type}">${item.type}</span>
                </p>
                <p>${sanitizeInput(item.description)}</p>
                <small>Last Seen/Found: ${item.location} on ${item.date}</small>
                <button class="contact-btn" data-id="${item.id}">Contact</button>
            `;
            itemList.appendChild(itemCard);
        });
    }

function findMatches(currentItem, allItems) {
    if (currentItem.status === 'resolved') return false;

    const currentNameWords = currentItem.name.toLowerCase().split(' ');

    for (const otherItem of allItems) {
        if (otherItem.id === currentItem.id || otherItem.status === 'resolved' || otherItem.type === currentItem.type) {
            continue;
        }

        if (otherItem.category === currentItem.category) {
            const otherNameWords = otherItem.name.toLowerCase().split(' ');
            if (currentNameWords.some(word => word.length > 2 && otherNameWords.includes(word))) {
                return true;
            }
        }
    }
    return false;
}

    function renderAdminTable() {
        const adminTableBody = document.querySelector('#admin-items-table tbody');
        if (!adminTableBody) return;

        adminTableBody.innerHTML = '';

        if (items.length === 0) {
            const row = adminTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7; // Span all columns
            cell.innerHTML = '<p class="empty-message">No items have been reported.</p>';
            return;
        }

        items.forEach(item => {
            const row = adminTableBody.insertRow();
            row.className = item.isFlagged ? 'flagged' : '';
            if (findMatches(item, items)) {
                row.classList.add('match-highlight');
            }
            row.innerHTML = `
                <td>${sanitizeInput(item.name)}</td>
                <td>${sanitizeInput(item.category)}</td>
                <td>${sanitizeInput(item.reportedBy)}</td>
                <td>${sanitizeInput(item.contact)}</td>
                <td>${item.date}</td>
                <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                <td>
                    <button class="action-btn approve-btn" data-id="${item.id}" title="Approve">✔️</button>
                    <button class="action-btn resolve-btn" data-id="${item.id}" title="Mark Resolved">🏁</button>
                    <button class="action-btn flag-btn" data-id="${item.id}" title="Flag Item">🚩</button>
                    <button class="action-btn delete-btn" data-id="${item.id}" title="Delete">🗑️</button>
                </td>
            `;
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
            renderAdminTable();
        }
    }

    /**
     * Draws the analytics chart for the admin view.
     */
    function renderAdminAnalytics() {
        // Chart 1: Lost vs Found
        const lostCount = items.filter(item => item.type === 'lost').length;
        const foundCount = items.filter(item => item.type === 'found').length;
        drawBarChart('lost-found-admin-chart', {
            labels: ['Lost', 'Found'],
            values: [lostCount, foundCount]
        }, { barColor: '#ffd700' });

        // Chart 2: By Category
        const categoryCounts = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});
        drawBarChart('category-chart', {
            labels: Object.keys(categoryCounts),
            values: Object.values(categoryCounts)
        }, { barColor: '#9c88ff' });

        // Chart 3: Reports this week
        const today = new Date();
        const last7Days = Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - i);
            return d.toISOString().split('T')[0]; // Get YYYY-MM-DD
        }).reverse();

        const reportCounts = last7Days.map(dateStr => {
            return items.filter(item => {
                const itemDate = new Date(item.reportedAt).toISOString().split('T')[0];
                return itemDate === dateStr;
            }).length;
        });

        drawBarChart('trend-chart', {
            labels: last7Days.map(d => new Date(d).toLocaleDateString(undefined, {weekday: 'short'})),
            values: reportCounts
        }, { barColor: '#e84118' });
    }


    // --- Voice Command Logic ---
    if ('webkitSpeechRecognition' in window) {
        const voiceEnabled = localStorage.getItem('voice-enabled') !== 'false';
        if (!voiceEnabled) {
            console.log('Voice commands disabled by user setting.');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.trim().toLowerCase();
            console.log('Voice command received:', command);

            if (command.includes('report') && command.includes('item')) {
                speak('Opening the report form for you.');
                document.getElementById('report-form').scrollIntoView({ behavior: 'smooth' });
            } else if (command.includes('show found items')) {
                speak('Filtering to show found items.');
                filterStatusEl.value = 'found';
                renderItems();
            } else if (command.includes('show lost items')) {
                speak('Filtering to show lost items.');
                filterStatusEl.value = 'lost';
                renderItems();
            } else if (command.includes('show all items')) {
                speak('Showing all items.');
                filterStatusEl.value = 'all';
                renderItems();
            }

            // Admin-specific commands
            if (isAdminView && command.includes('delete flagged items')) {
                if (confirm('Are you sure you want to delete all flagged items?')) {
                    speak('Deleting all flagged items.');
                    items = items.filter(item => !item.isFlagged);
                    localStorage.setItem('lost-found-items', JSON.stringify(items));
                    renderAdminTable();
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
        };

        // Start listening
        try {
            recognition.start();
        } catch(e) {
            console.warn("Voice recognition could not be started automatically.", e.message);
        }
    }


    // --- Admin Table Action Logic ---
    const adminTableBody = document.querySelector('#admin-items-table tbody');
    if (adminTableBody) {
        adminTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-btn')) {
                const itemId = parseInt(e.target.dataset.id, 10);
                const itemIndex = items.findIndex(item => item.id === itemId);

                if (itemIndex === -1) return;

                if (e.target.classList.contains('delete-btn')) {
                    if (confirm('Are you sure you want to delete this item?')) {
                        items.splice(itemIndex, 1);
                    }
                } else if (e.target.classList.contains('approve-btn')) {
                    items[itemIndex].status = 'approved';
                } else if (e.target.classList.contains('resolve-btn')) {
                    items[itemIndex].status = 'resolved';
                } else if (e.target.classList.contains('flag-btn')) {
                    items[itemIndex].isFlagged = !items[itemIndex].isFlagged; // Toggle flag
                }

                localStorage.setItem('lost-found-items', JSON.stringify(items));
                renderAdminTable();
            }
        });
    }
});
