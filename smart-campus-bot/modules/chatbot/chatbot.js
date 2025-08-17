document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const adminView = document.getElementById('admin-view');
    const trainForm = document.getElementById('train-form');
    const userView = document.getElementById('user-view');

    let knowledgeBase = JSON.parse(localStorage.getItem('chatbot-kb')) || {
        "hello": "Hi there! How can I help you today?",
        "library hours": "The library is open from 9 AM to 9 PM, Monday to Friday.",
        "cafeteria": "The main cafeteria is located on the ground floor of the Student Union building."
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'admin') {
        if(userView) userView.style.display = 'none';
        if(adminView) adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Train Chatbot';
    }

    if(sendBtn) sendBtn.addEventListener('click', sendMessage);
    if(chatInput) chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    if(trainForm) {
        trainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newQuestion = document.getElementById('new-question').value.toLowerCase();
            const newAnswer = document.getElementById('new-answer').value;
            knowledgeBase[newQuestion] = newAnswer;
            localStorage.setItem('chatbot-kb', JSON.stringify(knowledgeBase));
            alert('Knowledge base updated!');
            trainForm.reset();
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
        // Simple keyword matching
        for (const question in knowledgeBase) {
            if (lowerInput.includes(question)) {
                return knowledgeBase[question];
            }
        }

        // "Internet search" placeholder
        if (lowerInput.startsWith('search for')) {
            return `I found this on the web for "${input.substring(11)}": (This is a simulated search result).`;
        }

        return "I'm not sure how to answer that. Try asking something else or rephrasing.";
    }
});
