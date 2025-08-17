document.addEventListener('DOMContentLoaded', () => {
    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');
    const rollNumberSearch = document.getElementById('roll-number-search');
    const attendanceDisplay = document.getElementById('attendance-display');
    const manualEntryForm = document.getElementById('manual-entry-form');
    const attendanceFile = document.getElementById('attendance-file');
    const processFileBtn = document.getElementById('process-file-btn');
    const fileProcessingStatus = document.getElementById('file-processing-status');

    let attendanceData = JSON.parse(localStorage.getItem('attendance-data')) || {};

    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    if (isAdminView) {
        userView.style.display = 'none';
        adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Attendance';
    } else {
        userView.style.display = 'block';
        adminView.style.display = 'none';
    }

    if(rollNumberSearch){
        rollNumberSearch.addEventListener('input', (e) => {
            const rollNumber = e.target.value;
            if (attendanceData[rollNumber]) {
                const records = attendanceData[rollNumber];
                const presentCount = records.filter(r => r.status === 'present').length;
                const totalCount = records.length;
                const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

                attendanceDisplay.innerHTML = `
                    <h3>Attendance for ${rollNumber}</h3>
                    <p>Present: ${presentCount}</p>
                    <p>Total Classes: ${totalCount}</p>
                    <p>Percentage: ${percentage.toFixed(2)}%</p>
                `;
            } else {
                attendanceDisplay.innerHTML = '<p>No records found for this roll number.</p>';
            }
        });
    }

    if(manualEntryForm){
        manualEntryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rollNumber = document.getElementById('roll-number').value;
            const date = document.getElementById('date').value;
            const status = document.getElementById('status').value;

            if (!attendanceData[rollNumber]) {
                attendanceData[rollNumber] = [];
            }
            attendanceData[rollNumber].push({ date, status });
            localStorage.setItem('attendance-data', JSON.stringify(attendanceData));
            alert('Record added successfully.');
            manualEntryForm.reset();
        });
    }

    if(processFileBtn){
        processFileBtn.addEventListener('click', () => {
            const file = attendanceFile.files[0];
            if (!file) {
                alert('Please select a file.');
                return;
            }

            fileProcessingStatus.textContent = 'Processing...';
            const fileType = file.type;

            if (fileType === 'text/csv') {
                parseCSV(file);
            } else if (fileType === 'application/pdf') {
                parsePDF(file);
            } else if (fileType.startsWith('image/')) {
                parseImage(file);
            } else {
                alert('Unsupported file type.');
                fileProcessingStatus.textContent = '';
            }
        });
    }


    function parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\\n').slice(1); // Skip header
            rows.forEach(row => {
                const [rollNumber, date, status] = row.split(',');
                if (rollNumber && date && status) {
                    if (!attendanceData[rollNumber]) {
                        attendanceData[rollNumber] = [];
                    }
                    attendanceData[rollNumber].push({ date, status: status.trim() });
                }
            });
            localStorage.setItem('attendance-data', JSON.stringify(attendanceData));
            fileProcessingStatus.textContent = 'CSV processed successfully.';
        };
        reader.readAsText(file);
    }

    function parsePDF(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;
            pdfjsLib.getDocument(data).promise.then(pdf => {
                let textContent = '';
                const numPages = pdf.numPages;
                let promises = [];
                for (let i = 1; i <= numPages; i++) {
                    promises.push(pdf.getPage(i).then(page => page.getTextContent()));
                }
                Promise.all(promises).then(contents => {
                    contents.forEach(content => {
                        content.items.forEach(item => {
                            textContent += item.str + ' ';
                        });
                    });
                    // This is a very basic way to parse text from a PDF.
                    // A more robust solution would be needed for complex PDFs.
                    // Assuming a format of "rollNumber,date,status" in the text.
                    console.log('PDF Text:', textContent);
                    alert('PDF parsing is for demonstration. Check console for extracted text.');
                    fileProcessingStatus.textContent = 'PDF processed.';
                });
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function parseImage(file) {
        Tesseract.recognize(
            file,
            'eng',
            { logger: m => {
                fileProcessingStatus.textContent = `${m.status}: ${Math.round(m.progress * 100)}%`;
                console.log(m)
            } }
        ).then(({ data: { text } }) => {
            console.log('OCR Text:', text);
            alert('Image OCR is for demonstration. Check console for extracted text.');
            fileProcessingStatus.textContent = 'Image processed.';
        });
    }
});
