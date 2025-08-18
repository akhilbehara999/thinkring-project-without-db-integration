document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');
    const itemGrid = document.getElementById('item-grid');
    const showReportModalBtn = document.getElementById('show-report-form-btn');

    // Modals
    const reportModal = document.getElementById('report-item-modal');
    const claimModal = document.getElementById('claim-item-modal');
    const closeReportModalBtn = document.getElementById('close-report-modal-btn');
    const closeClaimModalBtn = document.getElementById('close-claim-modal-btn');

    // Report Form
    const reportForm = document.getElementById('report-form');
    const submitReportBtn = document.getElementById('submit-report-btn');
    const dropZone = document.getElementById('drop-zone');
    const itemImageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');

    // --- State & Data ---
    let items = JSON.parse(localStorage.getItem('lost-found-items-v2')) || [];
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    // --- Initial Setup ---
    initializeViews();
    setupEventListeners();
    renderItems();
    if(isAdminView) setupAdminView();

    // --- Functions ---

    function initializeViews() {
        if (isAdminView) {
            userView.classList.remove('active');
            adminView.classList.add('active');
        } else {
            userView.classList.add('active');
            adminView.classList.remove('active');
        }
    }

    function setupAdminView() {
        renderAdminTable();
        renderAdminCharts();
    }

    function setupEventListeners() {
        // Modal Triggers
        showReportModalBtn.addEventListener('click', () => toggleModal(reportModal, true));
        closeReportModalBtn.addEventListener('click', () => toggleModal(reportModal, false));
        reportModal.addEventListener('click', (e) => e.target === reportModal && toggleModal(reportModal, false));
        closeClaimModalBtn.addEventListener('click', () => toggleModal(claimModal, false));
        claimModal.addEventListener('click', (e) => e.target === claimModal && toggleModal(claimModal, false));

        // Report Form & Drag-and-Drop
        reportForm.addEventListener('submit', handleReportSubmit);
        dropZone.addEventListener('click', () => itemImageInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', handleFileDrop);
        itemImageInput.addEventListener('change', handleFileInputChange);

        // Item Grid Interactions
        itemGrid.addEventListener('mousemove', handleGridMouseMove);
        itemGrid.addEventListener('mouseleave', handleGridMouseLeave);
    }

    function toggleModal(modal, show) {
        if (show) {
            modal.classList.add('visible');
        } else {
            modal.classList.remove('visible');
        }
    }

    function handleFileDrop(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            itemImageInput.files = files;
            previewImage(files[0]);
        }
    }

    function handleFileInputChange() {
        if (itemImageInput.files.length > 0) {
            previewImage(itemImageInput.files[0]);
        }
    }

    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }

    function handleReportSubmit(e) {
        e.preventDefault();
        submitReportBtn.classList.add('loading');
        submitReportBtn.disabled = true;

        // Simulate network delay
        setTimeout(() => {
            const newItem = {
                id: Date.now(),
                name: document.getElementById('item-name').value,
                description: document.getElementById('item-description').value,
                type: document.getElementById('item-type').value,
                image: imagePreview.src.startsWith('data:image') ? imagePreview.src : null,
                status: 'unclaimed', // new status system: unclaimed, claimed, approved
                reportedAt: new Date().toISOString()
            };

            items.push(newItem);
            localStorage.setItem('lost-found-items-v2', JSON.stringify(items));

            renderItems();

            submitReportBtn.classList.remove('loading');
            submitReportBtn.disabled = false;
            toggleModal(reportModal, false);
            reportForm.reset();
            imagePreview.style.display = 'none';

            // Success feedback
            showNotification('Report Submitted Successfully!', 'success');
        }, 1500);
    }

    function renderItems() {
        itemGrid.innerHTML = '';
        if (items.length === 0) {
            itemGrid.innerHTML = '<p class="empty-message">No items reported yet. Be the first!</p>';
            return;
        }

        // Add staggered animation delay
        items.forEach((item, index) => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.style.animationDelay = `${index * 100}ms`;
            itemCard.dataset.id = item.id;

            let statusBadge;
            if (item.status === 'claimed') {
                statusBadge = `<span class="badge status-claimed">Claimed</span>`;
            } else {
                statusBadge = `<span class="badge type-${item.type}">${item.type}</span>`;
            }

            itemCard.innerHTML = `
                <div class="card-image-container">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                </div>
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p class="item-meta">${statusBadge}</p>
                    <p>${item.description}</p>
                    <button class="holographic-btn claim-btn">Claim</button>
                </div>
            `;
            itemGrid.appendChild(itemCard);
        });
    }

    function handleGridMouseMove(e) {
        const card = e.target.closest('.item-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function handleGridMouseLeave() {
        const cards = itemGrid.querySelectorAll('.item-card');
        cards.forEach(card => {
            card.style.transform = 'perspective(1500px) rotateX(0) rotateY(0)';
        });
    }

    // --- Admin Functions ---
    function renderAdminTable() {
        const tableBody = document.querySelector('#admin-items-table tbody');
        if(!tableBody) return;
        tableBody.innerHTML = '';
        items.forEach(item => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${item.name}</td>
                <td><span class="badge type-${item.type}">${item.type}</span></td>
                <td>Anonymous</td>
                <td>${new Date(item.reportedAt).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn approve-btn" data-id="${item.id}">✔️</button>
                    <button class="action-btn delete-btn" data-id="${item.id}">🗑️</button>
                </td>
            `;
        });
    }

    function renderAdminCharts() {
        // Mock data for charts
        const statusData = {
            labels: ['Lost', 'Found', 'Claimed'],
            datasets: [{
                data: [
                    items.filter(i => i.type === 'lost').length,
                    items.filter(i => i.type === 'found').length,
                    items.filter(i => i.status === 'claimed').length
                ],
                backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 205, 86, 0.5)'],
                borderColor: ['#ff6384', '#4bc0c0', '#ffcd56'],
                borderWidth: 1
            }]
        };
        // In a real app, you would use a charting library. Here we just log it.
        console.log("Admin Chart Data (Status):", statusData);
        drawBarChart('admin-chart-status', {
            labels: statusData.labels,
            values: statusData.datasets[0].data
        });
    }

    // --- Particle Background Logic ---
    function createParticles() {
        const container = document.getElementById('particle-container');
        if(!container) return;
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${Math.random() * 2 + 1}px`;
            particle.style.height = particle.style.width;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
            container.appendChild(particle);
        }
    }
    createParticles();
});
