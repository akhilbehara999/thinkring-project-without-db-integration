document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');
    const rollNumberSearch = document.getElementById('roll-number-search');
    const searchBtn = document.getElementById('search-btn');
    const attendanceDisplay = document.getElementById('attendance-display');
    const manualEntryForm = document.getElementById('manual-entry-form');
    const attendanceFile = document.getElementById('attendance-file');
    const processFileBtn = document.getElementById('process-file-btn');
    const fileProcessingStatus = document.getElementById('file-processing-status');
    const recordSearchInput = document.getElementById('record-search');
    const attendanceTableBody = document.querySelector('#attendance-table tbody');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const dropZone = document.getElementById('drop-zone');

    // --- Data & State ---
    let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || generateMockData();
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    // --- Initial Setup ---
    setupView();
    setupEventListeners();
    if (isAdminView) {
        renderAttendanceTable();
        updateAnalytics();
        renderTrendChart();
    }

    // --- Functions ---

    function setupView() {
        if (isAdminView) {
            userView.style.display = 'none';
            adminView.style.display = 'block';
            document.querySelector('.back-link').href = '../../admin.html';
            document.querySelector('.header-title').textContent = 'Attendance Matrix';
        } else {
            userView.style.display = 'block';
            adminView.style.display = 'none';
        }
    }

    function setupEventListeners() {
        if (searchBtn) searchBtn.addEventListener('click', displayUserAttendance);
        if (rollNumberSearch) rollNumberSearch.addEventListener('keypress', (e) => e.key === 'Enter' && displayUserAttendance());
        if (manualEntryForm) manualEntryForm.addEventListener('submit', handleManualEntry);
        if (processFileBtn) processFileBtn.addEventListener('click', handleFileProcessing);
        if (recordSearchInput) recordSearchInput.addEventListener('input', () => renderAttendanceTable());
        if (exportCsvBtn) exportCsvBtn.addEventListener('click', handleExport);
        if (attendanceTableBody) attendanceTableBody.addEventListener('change', handleTableChange);

        // Drag and Drop Listeners
        if (dropZone) {
            dropZone.addEventListener('click', () => attendanceFile.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    attendanceFile.files = e.dataTransfer.files;
                    dropZone.classList.add('ripple');
                    setTimeout(() => dropZone.classList.remove('ripple'), 1000);
                    fileProcessingStatus.textContent = `File selected: ${e.dataTransfer.files[0].name}`;
                }
            });
        }
    }

    function displayUserAttendance() {
        const rollNumber = rollNumberSearch.value.trim().toUpperCase();
        if (!rollNumber) {
            showValidationError(rollNumberSearch, 'Please enter a roll number.');
            return;
        }

        if (attendanceData[rollNumber]) {
            const records = attendanceData[rollNumber];
            const presentCount = records.filter(r => r.status === 'present').length;
            const totalCount = records.length;
            const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

            attendanceDisplay.innerHTML = `
                <div class="holographic-card result-card animate-in">
                    <h3 class="result-title">Report for ${rollNumber}</h3>
                    <div class="result-grid">
                        <div class="result-item">
                            <span class="result-label">Present Days</span>
                            <span class="result-value">${presentCount}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Total Days</span>
                            <span class="result-value">${totalCount}</span>
                        </div>
                    </div>
                    <div class="result-summary">
                        <div class="progress-ring" data-value="${percentage}">
                             <svg class="progress-ring__svg">
                                <circle class="progress-ring__circle-bg" cx="60" cy="60" r="54"></circle>
                                <circle class="progress-ring__circle" cx="60" cy="60" r="54"></circle>
                            </svg>
                            <span class="progress-ring__text">${percentage}%</span>
                        </div>
                    </div>
                </div>
            `;
            // Animate the newly created progress ring
            const ring = attendanceDisplay.querySelector('.progress-ring');
            animateProgressRing(ring);
        } else {
            attendanceDisplay.innerHTML = `<p class="error-message animate-in">No records found for this roll number.</p>`;
        }
    }

    function handleManualEntry(e) {
        e.preventDefault();
        const rollNumberInput = document.getElementById('roll-number');
        const dateInput = document.getElementById('date');
        const statusInput = document.getElementById('status');

        const rollNumber = rollNumberInput.value.trim().toUpperCase();
        const date = dateInput.value;
        const status = statusInput.value;

        if(!rollNumber || !date) {
            showValidationError(rollNumberInput);
            showValidationError(dateInput);
            return;
        }

        if (!attendanceData[rollNumber]) {
            attendanceData[rollNumber] = [];
        }
        // Avoid duplicate entries for the same date
        const existingRecordIndex = attendanceData[rollNumber].findIndex(r => r.date === date);
        if(existingRecordIndex > -1) {
            attendanceData[rollNumber][existingRecordIndex].status = status;
        } else {
            attendanceData[rollNumber].push({ date, status });
        }

        saveData();
        showNotification('Record added successfully.');
        manualEntryForm.reset();
        renderAttendanceTable();
        updateAnalytics();
    }

    function handleFileProcessing() {
        const file = attendanceFile.files[0];
        if (!file) {
            showNotification('Please select a file first.', 'error');
            return;
        }

        fileProcessingStatus.textContent = 'Processing...';
        const fileType = file.type;

        // Simulate processing
        setTimeout(() => {
            if (fileType === 'text/csv') {
                parseCSV(file);
            } else {
                showNotification('File type not yet supported for auto-parsing.', 'warning');
                fileProcessingStatus.textContent = '';
            }
        }, 1000);
    }

    function parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split(/\r?\n/).slice(1); // Skip header, handle Windows/Unix newlines
            let addedCount = 0;
            rows.forEach(row => {
                const [rollNumber, date, status] = row.split(',');
                if (rollNumber && date && status) {
                    const cleanRoll = rollNumber.trim().toUpperCase();
                    if (!attendanceData[cleanRoll]) {
                        attendanceData[cleanRoll] = [];
                    }
                    attendanceData[cleanRoll].push({ date: date.trim(), status: status.trim().toLowerCase() });
                    addedCount++;
                }
            });
            saveData();
            fileProcessingStatus.textContent = '';
            showNotification(`${addedCount} records from CSV processed successfully.`);
            renderAttendanceTable();
            updateAnalytics();
        };
        reader.readAsText(file);
    }

    function renderAttendanceTable() {
        if (!attendanceTableBody) return;

        const searchTerm = recordSearchInput.value.toLowerCase();
        let flatData = [];

        for (const rollNo in attendanceData) {
            attendanceData[rollNo].forEach((record, index) => {
                flatData.push({ rollNo, ...record, id: `${rollNo}-${index}` });
            });
        }
        // Sort by date descending
        flatData.sort((a,b) => new Date(b.date) - new Date(a.date));

        const filteredData = flatData.filter(record =>
            record.rollNo.toLowerCase().includes(searchTerm) ||
            record.date.includes(searchTerm)
        );

        attendanceTableBody.innerHTML = '';
        filteredData.forEach((record, index) => {
            const row = attendanceTableBody.insertRow();
            row.style.animationDelay = `${index * 0.05}s`;
            row.innerHTML = `
                <td>${sanitizeInput(record.rollNo)}</td>
                <td>${sanitizeInput(record.date)}</td>
                <td><span class="status-badge status-${record.status}">${sanitizeInput(record.status)}</span></td>
                <td>
                    <select class="holographic-select status-select" data-id="${record.id}">
                        <option value="present" ${record.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>Absent</option>
                    </select>
                </td>
            `;
        });
    }

    function handleTableChange(e) {
        if (e.target.classList.contains('status-select')) {
            const selectEl = e.target;
            const recordId = selectEl.dataset.id;
            const newStatus = selectEl.value;
            const [rollNo, recordIndex] = recordId.split('-');

            if (attendanceData[rollNo] && attendanceData[rollNo][recordIndex]) {
                attendanceData[rollNo][recordIndex].status = newStatus;
                saveData();
                renderAttendanceTable(); // Re-render to update status badge
                updateAnalytics();
                showNotification(`Record for ${rollNo} updated.`);
            }
        }
    }

    function handleExport() {
        exportCsvBtn.classList.add('loading');

        setTimeout(() => {
            const headers = ['Roll Number', 'Date', 'Status'];
            let csvContent = headers.join(',') + '\n';

            for (const rollNo in attendanceData) {
                attendanceData[rollNo].forEach(record => {
                    csvContent += [rollNo, record.date, record.status].join(',') + '\n';
                });
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'attendance_report.csv';
            link.click();
            URL.revokeObjectURL(link.href);

            exportCsvBtn.classList.remove('loading');
            exportCsvBtn.classList.add('complete');

            setTimeout(() => exportCsvBtn.classList.remove('complete'), 2000);
        }, 1500); // Simulate generation time
    }

    function updateAnalytics() {
        const rings = document.querySelectorAll('.analytics-card .progress-ring');
        let totalRecords = 0;
        let totalPresent = 0;

        for (const rollNo in attendanceData) {
            totalRecords += attendanceData[rollNo].length;
            totalPresent += attendanceData[rollNo].filter(r => r.status === 'present').length;
        }

        const overallPresence = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
        const absenceRate = 100 - overallPresence;

        rings.forEach(ring => {
            if (ring.dataset.color === 'gold') { // Absence rate
                ring.dataset.value = absenceRate;
            } else { // Overall presence
                ring.dataset.value = overallPresence;
            }
            animateProgressRing(ring);
        });
    }

    function animateProgressRing(ringElement) {
        const circle = ringElement.querySelector('.progress-ring__circle');
        const text = ringElement.querySelector('.progress-ring__text');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const value = parseInt(ringElement.dataset.value, 10);

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (value / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // Animate text
        let start = 0;
        const duration = 1500;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const current = Math.min(Math.floor(progress / duration * value), value);
            text.textContent = `${current}%`;
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function renderTrendChart() {
        const ctx = document.getElementById('attendance-trend-chart')?.getContext('2d');
        if (!ctx) return;

        // This is a placeholder for a real charting library or a custom implementation
        // For now, we use the `drawBarChart` from utils.js if available.
        if(typeof drawBarChart === 'function') {
            const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const values = [88, 92, 85, 95, 90];
            drawBarChart(ctx, { labels, values }, {
                barColor: 'rgba(0, 212, 255, 0.6)',
                title: 'Weekly Attendance Trend'
            });
        }
    }

    function showValidationError(element, message = 'Invalid input') {
        element.classList.add('error');
        showNotification(message, 'error');
        setTimeout(() => element.classList.remove('error'), 1000);
    }

    function saveData() {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }

    // --- Utility & Mock Data ---
    function generateMockData() {
        // Create some default data if none exists
        const today = new Date().toISOString().slice(0, 10);
        return {
            'S123': [{date: today, status: 'present'}],
            'A456': [{date: today, status: 'absent'}],
        };
    }
});
