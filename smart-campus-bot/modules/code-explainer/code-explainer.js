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

    // --- Placeholder Data and Functions ---
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
        if (!code.includes(';')) {
            errors.push('Warning: Missing semicolons may lead to unexpected results.');
        }
        if (code.match(/let|const|var/g)?.length > 10) {
            errors.push('Info: Consider refactoring code with many variable declarations.');
        }
        return errors.length > 0 ? errors.join('\\n') : 'No obvious issues found.';
    }
    // --- End of Placeholder Data ---


    // --- Admin View Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    if (isAdminView) {
        userView.style.display = 'none';
        adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Code Explainer';
        renderLanguageChart();
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

    explainBtn.addEventListener('click', () => {
        const code = codeInput.value;
        const language = languageSelect.value;
        logLanguageUse(language);
        let explanation = 'Explanation not available for this language.';

        if (explanations[language]) {
            explanation = 'Key concepts found:\\n';
            for (const keyword in explanations[language]) {
                if (code.includes(keyword)) {
                    explanation += `- ${keyword}: ${explanations[language][keyword]}\\n`;
                }
            }
        }
        resultOutput.textContent = `--- EXPLANATION ---\\n${explanation}`;
    });

    outputBtn.addEventListener('click', () => {
        const language = languageSelect.value;
        logLanguageUse(language);
        let simulatedOutput = 'Simulated output not available for this language.';

        if (outputs[language]) {
            simulatedOutput = outputs[language];
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
});
