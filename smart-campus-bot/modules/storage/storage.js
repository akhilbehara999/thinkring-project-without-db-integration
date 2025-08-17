document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const searchStorage = document.getElementById('search-storage');
    const adminView = document.getElementById('admin-view');
    const storageStats = document.getElementById('storage-stats');
    const userView = document.getElementById('user-view');

    let db;
    const dbName = 'fileStorageDB';
    const request = indexedDB.open(dbName, 1);

    request.onerror = (event) => {
        console.error('Database error:', event.target.errorCode);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        displayFiles();
        if (urlParams.get('view') === 'admin') {
            displayStorageStats();
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'admin') {
        if(userView) userView.style.display = 'none';
        if(adminView) adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Storage Analytics';
    }

    if(dropZone) dropZone.addEventListener('click', () => fileInput.click());
    if(dropZone) dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    if(dropZone) dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    if(dropZone) dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    if(fileInput) fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    if(searchStorage) searchStorage.addEventListener('input', displayFiles);


    function handleFiles(files) {
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        for (const file of files) {
            const fileRecord = { name: file.name, type: file.type, size: file.size, data: file };
            objectStore.add(fileRecord);
        }
        transaction.oncomplete = () => {
            displayFiles();
        };
    }

    function displayFiles() {
        if(!db || !fileList) return;
        const searchTerm = searchStorage ? searchStorage.value.toLowerCase() : '';
        fileList.innerHTML = '';
        const objectStore = db.transaction('files').objectStore('files');
        objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.name.toLowerCase().includes(searchTerm)) {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <span>${cursor.value.name} (${(cursor.value.size / 1024).toFixed(2)} KB)</span>
                        <div>
                            <button class="download-btn" data-id="${cursor.key}">Download</button>
                            <button class="delete-btn" data-id="${cursor.key}">Delete</button>
                        </div>
                    `;
                    fileList.appendChild(fileItem);
                }
                cursor.continue();
            } else {
                attachActionListeners();
            }
        };
    }

    function attachActionListeners() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                deleteFile(id);
            });
        });
        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                downloadFile(id);
            });
        });
    }

    function deleteFile(id) {
        const request = db.transaction(['files'], 'readwrite').objectStore('files').delete(id);
        request.onsuccess = () => displayFiles();
    }

    function downloadFile(id) {
        const request = db.transaction(['files']).objectStore('files').get(id);
        request.onsuccess = (event) => {
            const fileRecord = event.target.result;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(fileRecord.data);
            link.download = fileRecord.name;
            link.click();
            URL.revokeObjectURL(link.href);
        };
    }

    function displayStorageStats() {
        if(!db) return;
        let totalSize = 0;
        let fileCount = 0;
        const objectStore = db.transaction('files').objectStore('files');
        objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                fileCount++;
                totalSize += cursor.value.size;
                cursor.continue();
            } else {
                if(storageStats){
                    storageStats.innerHTML = `
                        <p>Total Files: ${fileCount}</p>
                        <p>Total Storage Used: ${(totalSize / (1024 * 1024)).toFixed(2)} MB</p>
                    `;
                }
            }
        };
    }
});
