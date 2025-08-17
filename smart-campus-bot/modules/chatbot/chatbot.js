document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const adminView = document.getElementById('admin-view');
    const trainForm = document.getElementById('train-form');
    const userView = document.getElementById('user-view');

    let context = null;
    let knowledgeBase = JSON.parse(localStorage.getItem('chatbot-kb')) || {
        "hello": "Hi there! How can I help you today?",
        "library hours": "The library is open from 9 AM to 9 PM, Monday to Friday. What else would you like to know about the library?",
        "cafeteria": "The main cafeteria is located on the ground floor of the Student Union building."
    };

    const urlParams = new URLSearchParams(window.location.search);
    const kbTableBody = document.querySelector('#kb-table tbody');

    if (urlParams.get('view') === 'admin') {
        if(userView) userView.style.display = 'none';
        if(adminView) adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Chatbot';
        renderKbTable();
        renderChatbotAnalytics();
    }

    /**
     * Renders the knowledge base into the admin table.
     */
    function renderKbTable() {
        if (!kbTableBody) return;
        kbTableBody.innerHTML = '';
        for (const key in knowledgeBase) {
            const row = kbTableBody.insertRow();
            row.innerHTML = `
                <td>${sanitizeInput(key)}</td>
                <td>${sanitizeInput(knowledgeBase[key])}</td>
                <td>
                    <button class="action-btn edit-btn" data-key="${key}">Edit</button>
                    <button class="action-btn delete-btn" data-key="${key}">Delete</button>
                </td>
            `;
        }
    }

    if(sendBtn) sendBtn.addEventListener('click', sendMessage);
    if(chatInput) chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    if (kbTableBody) {
        kbTableBody.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('action-btn')) {
                const key = target.dataset.key;

                if (target.classList.contains('delete-btn')) {
                    if (confirm(`Are you sure you want to delete the Q&A for "${key}"?`)) {
                        delete knowledgeBase[key];
                        localStorage.setItem('chatbot-kb', JSON.stringify(knowledgeBase));
                        renderKbTable();
                    }
                } else if (target.classList.contains('edit-btn')) {
                    const questionInput = document.getElementById('new-question');
                    const answerInput = document.getElementById('new-answer');

                    questionInput.value = key;
                    answerInput.value = knowledgeBase[key];
                    questionInput.disabled = true; // Prevent key change during edit
                    trainForm.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    const docUploadInput = document.getElementById('doc-upload');

    if(trainForm) {
        trainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const questionInput = document.getElementById('new-question');
            const answerInput = document.getElementById('new-answer');

            const newQuestion = questionInput.value.toLowerCase();
            const newAnswer = answerInput.value;

            knowledgeBase[newQuestion] = newAnswer;
            localStorage.setItem('chatbot-kb', JSON.stringify(knowledgeBase));

            alert('Knowledge base updated!');
            trainForm.reset();
            questionInput.disabled = false; // Re-enable after submission
            renderKbTable();
        });
    }


    function sendMessage() {
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        addMessage(userInput, 'user');
        chatInput.value = '';

        setTimeout(() => {
            const botResponse = getBotResponse(userInput);
            addMessage(botResponse, 'bot');
        }, 500);
    }

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();

        // Check for contextual follow-up
        if (context === 'library' && (lowerInput.includes('weekend') || lowerInput.includes('saturday') || lowerInput.includes('sunday'))) {
            context = null; // Reset context
            return "The library is closed on weekends.";
        }

        // Simple keyword matching
        for (const question in knowledgeBase) {
            if (lowerInput.includes(question)) {
                logInteraction(question); // Log the matched keyword
                // Set context based on the question
                if (question.includes('library')) {
                    context = 'library';
                } else {
                    context = null; // Reset context for other questions
                }
                return knowledgeBase[question];
            }
        }

        // "Internet search" placeholder
        if (lowerInput.startsWith('search for')) {
            context = null;
            return `I found this on the web for "${input.substring(11)}": (This is a simulated search result).`;
        }

        context = null;
        return "I'm not sure how to answer that. Try asking something else or rephrasing.";
    }


    // --- Document Upload ---
    if (docUploadInput) {
        docUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || file.type !== 'text/plain') {
                alert('Please select a valid .txt file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const sentences = text.match( /[^.!?]+[.!?]+/g ) || [];
                handleSuggestions(sentences);
            };
            reader.readAsText(file);
        });
    }

    function handleSuggestions(suggestions) {
        const existingContainer = document.getElementById('suggestion-container');
        if (existingContainer) existingContainer.remove();

        let suggestionHTML = '<h3>Suggested Q&A Pairs</h3><p>Enter a question/keyword for each suggested answer and click save.</p>';
        suggestions.forEach((s, i) => {
            const cleanSentence = s.trim();
            if (cleanSentence) {
                suggestionHTML += `
                    <div class="suggestion-pair">
                        <input type="text" id="suggestion-q-${i}" placeholder="Enter question/keyword">
                        <p>${sanitizeInput(cleanSentence)}</p>
                    </div>
                `;
            }
        });
        suggestionHTML += '<button id="save-suggestions-btn">Save Approved Suggestions</button>';

        const suggestionContainer = document.createElement('div');
        suggestionContainer.id = 'suggestion-container';
        suggestionContainer.innerHTML = suggestionHTML;
        docUploadInput.parentElement.appendChild(suggestionContainer);

        document.getElementById('save-suggestions-btn').addEventListener('click', () => {
            let addedCount = 0;
            suggestions.forEach((s, i) => {
                const question = document.getElementById(`suggestion-q-${i}`).value.trim().toLowerCase();
                if (question) {
                    knowledgeBase[question] = s.trim();
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                localStorage.setItem('chatbot-kb', JSON.stringify(knowledgeBase));
                renderKbTable();
                alert(`${addedCount} new Q&A pairs added!`);
            }
            suggestionContainer.remove();
        });
    }

    /**
     * Logs a successful keyword match for analytics.
     * @param {string} keyword The keyword that was matched.
     */
    function logInteraction(keyword) {
        let interactions = JSON.parse(localStorage.getItem('chatbot-interactions')) || {};
        interactions[keyword] = (interactions[keyword] || 0) + 1;
        localStorage.setItem('chatbot-interactions', JSON.stringify(interactions));
    }

    /**
     * Renders the chatbot analytics chart.
     */
    function renderChatbotAnalytics() {
        const interactions = JSON.parse(localStorage.getItem('chatbot-interactions')) || {};

        const sortedInteractions = Object.entries(interactions).sort(([,a],[,b]) => b-a).slice(0, 5);

        const chartData = {
            labels: sortedInteractions.map(item => item[0]),
            values: sortedInteractions.map(item => item[1])
        };

        if (chartData.labels.length === 0) {
            chartData.labels = ['No Data'];
            chartData.values = [0];
        }

        drawBarChart('chatbot-analytics-chart', chartData, { barColor: '#f0932b' });
    }
});
