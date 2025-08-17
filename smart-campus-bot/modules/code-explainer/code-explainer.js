document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');
    const languageSelect = document.getElementById('language-select');
    const codeInput = document.getElementById('code-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const explainBtn = document.getElementById('explain-btn');
    const outputBtn = document.getElementById('output-btn');
    const resultOutput = document.getElementById('result-output');
    const learningModeToggle = document.getElementById('learning-mode-toggle');

    // --- Placeholder Data and Functions ---
    const keywords = {
        javascript: ['function', 'let', 'const', 'var', 'return', 'if', 'else', 'for', 'while', 'async', 'await', 'new'],
        python: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'class'],
        java: ['public', 'private', 'protected', 'static', 'void', 'int', 'String', 'new', 'return', 'if', 'else', 'for'],
        c: ['int', 'char', 'void', 'return', 'if', 'else', 'for', 'while', '#include']
    };
    const explanations = {
        javascript: {
            'for': 'This is a for loop, which iterates over a block of code a number of times.',
            'function': 'This declares a function, a reusable block of code.'
        },
        python: {
            'for': 'This is a for loop, used for iterating over a sequence (like a list or a string).',
            'def': 'This keyword is used to define a function in Python.'
        },
        java: {
            'public static void main': 'This is the entry point of a Java application.',
            'System.out.println': 'This is used to print output to the console.'
        },
        c: {
            '#include': 'This is a preprocessor directive to include a header file.',
            'printf': 'This function is used to print output to the console.'
        }
    };

    const outputs = {
        javascript: 'Hello, World! (simulated output)',
        python: 'Hello, World! (simulated output)',
        java: 'Hello, World! (simulated output)',
        c: 'Hello, World! (simulated output)'
    };

    function simpleJsLinter(code) {
        let errors = [];
        const lines = code.split('\n');

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            // Check for loose equality
            if (line.includes('==') && !line.includes('===')) {
                errors.push(`Line ${index + 1}: [Warning] Use of loose equality (==). Consider using strict equality (===).`);
            }
            // Check for 'var'
            if (/\bvar\b/.test(line)) {
                errors.push(`Line ${index + 1}: [Info] Use of 'var'. Consider using 'let' or 'const'.`);
            }
            // Check for missing semicolon on lines that are not blocks or empty
            if (trimmedLine.length > 0 && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}')) {
                errors.push(`Line ${index + 1}: [Info] Potentially missing semicolon.`);
            }
        });

        return errors.length > 0 ? errors.join('\n') : 'No obvious issues found.';
    }
    // --- End of Placeholder Data ---


    /**
     * Calls the OpenRouter API to get a code explanation.
     * @param {string} lang The programming language of the code.
     * @param {string} code The code snippet to explain.
     * @returns {Promise<string>} The AI's explanation or an error message.
     */
    async function callOpenRouterForCode(lang, code) {
        const apiKey = localStorage.getItem('book-tools-api-key'); // Reuse the same key
        if (!apiKey) {
            return "Error: API Key not set. Please configure it in the Book Tools admin panel.";
        }

        const systemPrompt = `You are an expert ${lang} teacher. Explain the following code snippet clearly and concisely. Focus on the core concepts and logic.`;

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
                    { "role": "user", "content": code }
                  ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return `API Error: ${errorData.error.message}`;
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            return "Error: Could not connect to the AI service.";
        }
    }


    // --- Admin View Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    if (isAdminView) {
        userView.style.display = 'none';
        adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Code Explainer';
        renderLanguageChart();
        loadApiKey();
    }

    // --- API Key Logic ---
    const apiKeyForm = document.getElementById('api-key-form');
    if (apiKeyForm) {
        apiKeyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const apiKey = document.getElementById('api-key-input').value;
            localStorage.setItem('book-tools-api-key', apiKey); // Use shared key
            alert('API Key saved!');
        });
    }

    function loadApiKey() {
        const apiKey = localStorage.getItem('book-tools-api-key');
        if (apiKey) {
            document.getElementById('api-key-input').value = apiKey;
        }
    }

    // --- Template Form Logic ---
    const templateForm = document.getElementById('template-form');
    if (templateForm) {
        templateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTemplate = {
                id: Date.now(),
                title: document.getElementById('template-title').value,
                language: document.getElementById('template-language').value,
                code: document.getElementById('template-code').value
            };

            const templates = JSON.parse(localStorage.getItem('code-templates')) || [];
            templates.push(newTemplate);
            localStorage.setItem('code-templates', JSON.stringify(templates));

            alert('Template saved successfully!');
            templateForm.reset();
        });
    }


    analyzeBtn.addEventListener('click', () => {
        learningModeToggle.checked = false; // Turn off learning mode
        highlightKeywords(); // Clear any existing highlight

        const code = codeInput.value;
        const language = languageSelect.value;
        logLanguageUse(language);
        let analysisResult = 'Analysis not available for this language.';

        if (language === 'javascript') {
            analysisResult = simpleJsLinter(code);
        }
        // Add more language analyses here...

        resultOutput.textContent = `--- ANALYSIS ---\\n${analysisResult}`;
    });

    explainBtn.addEventListener('click', async () => {
        learningModeToggle.checked = false; // Turn off learning mode
        highlightKeywords(); // Clear any existing highlight

        const code = codeInput.value;
        const language = languageSelect.value;
        logLanguageUse(language);

        if (code.trim() === '') {
            alert('Please enter some code to explain.');
            return;
        }

        resultOutput.textContent = ''; // Clear previous output
        const thinking_span = document.createElement('span');
        thinking_span.textContent = '🧠 AI is thinking...';
        resultOutput.appendChild(thinking_span);

        const explanation = await callOpenRouterForCode(language, code);

        // Clear "thinking" message and start typing
        thinking_span.remove();
        typewriterEffect(resultOutput, `--- AI EXPLANATION ---\n${explanation}`);
    });

    outputBtn.addEventListener('click', () => {
        learningModeToggle.checked = false; // Turn off learning mode
        highlightKeywords(); // Clear any existing highlight

        const language = languageSelect.value;
        const code = codeInput.value;
        logLanguageUse(language);

        let simulatedOutput = `[${language.toUpperCase()}] Simulation complete. No direct output.`;

        if (code.toLowerCase().includes('hello, world') || code.toLowerCase().includes('hello world')) {
            simulatedOutput = 'Hello, World!';
        } else if (code.includes('for') && (code.includes('i < 5') || code.includes('i in range(5)'))) {
            simulatedOutput = '0\n1\n2\n3\n4';
        } else if (code.includes('function') || code.includes('def')) {
            simulatedOutput = '[Function defined, no output to display unless called.]';
        }

        resultOutput.textContent = `--- SIMULATED OUTPUT ---\\n${simulatedOutput}`;
    });

    /**
     * Logs the use of a specific language for analytics.
     * @param {string} language The language that was used.
     */
    function logLanguageUse(language) {
        let usage = JSON.parse(localStorage.getItem('code-explainer-usage')) || {};
        usage[language] = (usage[language] || 0) + 1;
        localStorage.setItem('code-explainer-usage', JSON.stringify(usage));
    }

    /**
     * Renders the language usage analytics chart.
     */
    function renderLanguageChart() {
        const usage = JSON.parse(localStorage.getItem('code-explainer-usage')) || {};
        const chartData = {
            labels: Object.keys(usage),
            values: Object.values(usage)
        };

        if (chartData.labels.length === 0) {
            chartData.labels = ['No Data'];
            chartData.values = [0];
        }

        drawBarChart('language-chart', chartData, { barColor: '#9c88ff' });
    }


    // --- Learning Mode Logic ---
    function highlightKeywords() {
        if (!learningModeToggle.checked) {
            resultOutput.innerHTML = ''; // Clear output if mode is off
            return;
        }

        const lang = languageSelect.value;
        const code = codeInput.value;
        const langKeywords = keywords[lang] || [];

        if (langKeywords.length === 0) {
            resultOutput.textContent = sanitizeInput(code);
            return;
        }

        // Create a regex to find all keywords
        const regex = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'g');
        const highlightedCode = sanitizeInput(code).replace(regex, '<span class="highlight-keyword">$1</span>');

        resultOutput.innerHTML = highlightedCode;
    }

    if (learningModeToggle) {
        learningModeToggle.addEventListener('change', highlightKeywords);
    }
    if (codeInput) {
        // Also update highlight as user types if mode is on
        codeInput.addEventListener('keyup', highlightKeywords);
    }
});
