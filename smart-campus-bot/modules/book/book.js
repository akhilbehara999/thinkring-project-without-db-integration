document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');
    const textInput = document.getElementById('text-input');
    const summarizeBtn = document.getElementById('summarize-btn');
    const expandBtn = document.getElementById('expand-btn');
    const rephraseBtn = document.getElementById('rephrase-btn');
    const speakBtn = document.getElementById('speak-btn');
    const stopBtn = document.getElementById('stop-btn');
    const copyBtn = document.getElementById('copy-btn');
    const exportBtn = document.getElementById('export-btn');
    const saveBtn = document.getElementById('save-btn');
    const statusDiv = document.getElementById('status');
    const outputTextDiv = document.getElementById('output-text');


    // --- Drag and Drop Logic ---
    if (textInput) {
        textInput.addEventListener('dragover', (e) => {
            e.preventDefault();
            textInput.classList.add('dragover');
        });

        textInput.addEventListener('dragleave', () => {
            textInput.classList.remove('dragover');
        });

        textInput.addEventListener('drop', (e) => {
            e.preventDefault();
            textInput.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileDrop(files[0]);
            }
        });
    }


    /**
     * Handles the dropped file, reading its content based on type.
     * @param {File} file The file that was dropped.
     */
    function handleFileDrop(file) {
        statusDiv.textContent = `Reading file: ${file.name}...`;

        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                textInput.value = e.target.result;
                statusDiv.textContent = 'File loaded successfully.';
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        textInput.value = result.value;
                        statusDiv.textContent = 'File loaded successfully.';
                    })
                    .catch(err => {
                        console.error('Error parsing .docx file:', err);
                        statusDiv.textContent = 'Error: Could not read .docx file.';
                    });
            };
            reader.readAsArrayBuffer(file);
        } else {
            statusDiv.textContent = `Error: Unsupported file type (${file.type}). Please use .txt or .docx.`;
            alert(`Unsupported file type: ${file.type}`);
        }
    }


    /**
     * A reusable function to call the OpenRouter API.
     * @param {string} systemPrompt The system prompt to guide the AI.
     * @param {string} userContent The user's text to be processed.
     * @returns {Promise<string>} The AI's response content or an error message.
     */
    async function callOpenRouter(systemPrompt, userContent) {
        const apiKey = localStorage.getItem('book-tools-api-key');
        if (!apiKey) {
            return "Error: API Key not set. Please configure it in the admin panel.";
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  "model": "deepseek/deepseek-r1-0528:free",
                  "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userContent }
                  ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                return `API Error: ${errorData.error.message}`;
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error("Network or fetch error:", error);
            return "Error: Could not connect to the AI service. Check your network connection.";
        }
    }


    summarizeBtn.addEventListener('click', async () => {
        const text = textInput.value;
        if (text.trim() === '') {
            alert('Please enter some text.');
            return;
        }
        statusDiv.textContent = 'Summarizing...';
        outputTextDiv.textContent = ''; // Clear previous output

        const systemPrompt = "You are an expert text summarizer. Take the user's text and provide a concise summary formatted as a list of bullet points.";
        const result = await callOpenRouter(systemPrompt, text);

        outputTextDiv.textContent = result;
        statusDiv.textContent = 'Summary complete.';
    });

    expandBtn.addEventListener('click', async () => {
        const text = textInput.value;
        if (text.trim() === '') {
            alert('Please enter some text.');
            return;
        }
        statusDiv.textContent = 'Expanding...';
        outputTextDiv.textContent = ''; // Clear previous output

        const systemPrompt = "You are a text expander. Take the user's text and elaborate on it, providing a more detailed and descriptive version.";
        const result = await callOpenRouter(systemPrompt, text);

        outputTextDiv.textContent = result;
        statusDiv.textContent = 'Expansion complete.';
    });

    rephraseBtn.addEventListener('click', async () => {
        const text = textInput.value;
        if (text.trim() === '') {
            alert('Please enter some text.');
            return;
        }
        statusDiv.textContent = 'Rephrasing...';
        outputTextDiv.textContent = '';

        const systemPrompt = "You are a rephrasing tool. Rewrite the user's text in a different style or with different vocabulary while preserving the core meaning.";
        const result = await callOpenRouter(systemPrompt, text);

        outputTextDiv.textContent = result;
        statusDiv.textContent = 'Rephrasing complete.';
    });

    exportBtn.addEventListener('click', () => {
        const outputText = outputTextDiv.textContent;
        if (outputText.trim() === '') {
            alert('There is no output to export.');
            return;
        }

        const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ai_output.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    copyBtn.addEventListener('click', () => {
        const outputText = outputTextDiv.textContent;
        if (outputText.trim() === '') {
            alert('There is no output to copy.');
            return;
        }

        navigator.clipboard.writeText(outputText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = 'var(--success-color)';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        });
    });

    speakBtn.addEventListener('click', () => {
        const text = outputTextDiv.textContent || textInput.value;
        if (text.trim() === '') {
            alert('Nothing to speak.');
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
        statusDiv.textContent = 'Speaking...';
        utterance.onend = () => {
            statusDiv.textContent = '';
        };
    });

    stopBtn.addEventListener('click', () => {
        speechSynthesis.cancel();
        statusDiv.textContent = '';
    });

    // --- Admin View Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    if (isAdminView) {
        userView.style.display = 'none';
        adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Book Tools';
        renderSummariesTable();
        loadApiKey();
    }

    function renderSummariesTable() {
        const summariesTableBody = document.querySelector('#summaries-table tbody');
        if (!summariesTableBody) return;

        let savedSummaries = JSON.parse(localStorage.getItem('saved-summaries')) || [];
        summariesTableBody.innerHTML = '';

        savedSummaries.forEach(summary => {
            const row = summariesTableBody.insertRow();
            row.innerHTML = `
                <td>${sanitizeInput(summary.username)}</td>
                <td>${sanitizeInput(summary.text.substring(0, 50))}...</td>
                <td>${summary.savedAt}</td>
                <td><button class="action-btn delete-btn" data-id="${summary.id}">Delete</button></td>
            `;
        });
    }


    // --- API Key Logic ---
    const apiKeyForm = document.getElementById('api-key-form');

    if (apiKeyForm) {
        apiKeyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const apiKey = document.getElementById('api-key-input').value;
            localStorage.setItem('book-tools-api-key', apiKey);
            alert('API Key saved!');
        });
    }

    function loadApiKey() {
        const apiKey = localStorage.getItem('book-tools-api-key');
        if (apiKey) {
            document.getElementById('api-key-input').value = apiKey;
        }
    }

    // --- Delete Saved Summary Logic ---
    const summariesTableBody = document.querySelector('#summaries-table tbody');
    if (summariesTableBody) {
        summariesTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const summaryId = parseInt(e.target.dataset.id);
                let savedSummaries = JSON.parse(localStorage.getItem('saved-summaries')) || [];
                savedSummaries = savedSummaries.filter(s => s.id !== summaryId);
                localStorage.setItem('saved-summaries', JSON.stringify(savedSummaries));
                renderSummariesTable();
            }
        });
    }


    saveBtn.addEventListener('click', () => {
        const outputText = outputTextDiv.textContent;
        if (outputText.trim() === '') {
            alert('There is no output to save.');
            return;
        }

        const savedSummaries = JSON.parse(localStorage.getItem('saved-summaries')) || [];
        const username = localStorage.getItem('username') || 'anonymous';

        savedSummaries.push({
            id: Date.now(),
            username: username,
            text: outputText,
            savedAt: new Date().toLocaleString()
        });

        localStorage.setItem('saved-summaries', JSON.stringify(savedSummaries));
        alert('Output saved successfully!');
    });
});
