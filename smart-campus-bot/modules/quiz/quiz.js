document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const adminView = document.getElementById('admin-view');

    const categorySelect = document.getElementById('category-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const startBtn = document.getElementById('start-btn');

    const questionContainer = document.getElementById('question-container');
    const optionsContainer = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');

    const scoreSpan = document.getElementById('score');
    const achievementsSpan = document.getElementById('achievements');
    const playAgainBtn = document.getElementById('play-again-btn');

    const addQuestionForm = document.getElementById('add-question-form');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    let localQuestions = JSON.parse(localStorage.getItem('quiz-questions')) || [];

    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    if (isAdminView) {
        document.getElementById('quiz-container').style.display = 'none';
        if(adminView) adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Quiz';
        renderQuizResults();
    }

    function renderQuizResults() {
        const resultsTableBody = document.querySelector('#results-table tbody');
        if (!resultsTableBody) return;
        const results = JSON.parse(localStorage.getItem('quiz-results')) || [];
        resultsTableBody.innerHTML = '';
        results.forEach(result => {
            const row = resultsTableBody.insertRow();
            row.innerHTML = `
                <td>${sanitizeInput(result.username)}</td>
                <td>${sanitizeInput(result.score)}</td>
                <td>${result.date}</td>
            `;
        });
    }

    if(startBtn){
        startBtn.addEventListener('click', startQuiz);
    }
    if(nextBtn){
        nextBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                showQuestion();
            } else {
                showResults();
            }
        });
    }
    if(playAgainBtn){
        playAgainBtn.addEventListener('click', () => {
            resultsScreen.style.display = 'none';
            startScreen.style.display = 'block';
        });
    }

    if(addQuestionForm) {
        addQuestionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newQuestion = {
                category: 'custom',
                type: 'multiple',
                difficulty: 'custom',
                question: document.getElementById('question-text').value,
                correct_answer: document.getElementById('correct-answer').value,
                incorrect_answers: [
                    document.getElementById('incorrect-answer-1').value,
                    document.getElementById('incorrect-answer-2').value,
                    document.getElementById('incorrect-answer-3').value,
                ]
            };
            localQuestions.push(newQuestion);
            localStorage.setItem('quiz-questions', JSON.stringify(localQuestions));
            alert('Question added successfully!');
            addQuestionForm.reset();
        });
    }


    async function startQuiz() {
        const category = categorySelect.value;
        const difficulty = difficultySelect.value;
        score = 0;
        currentQuestionIndex = 0;

        try {
            const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`);
            const data = await response.json();
            questions = [...data.results, ...localQuestions];
            startScreen.style.display = 'none';
            quizScreen.style.display = 'block';
            resultsScreen.style.display = 'none';
            showQuestion();
        } catch (error) {
            console.error('Error fetching questions:', error);
            // Fallback to local questions
            if(localQuestions.length > 0) {
                questions = localQuestions;
                startScreen.style.display = 'none';
                quizScreen.style.display = 'block';
                resultsScreen.style.display = 'none';
                showQuestion();
            } else {
                alert('Failed to fetch questions. Please try again later.');
            }
        }
    }

    function showQuestion() {
        const question = questions[currentQuestionIndex];
        questionContainer.innerHTML = `<p>${question.question}</p>`;

        const options = [...question.incorrect_answers, question.correct_answer];
        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        optionsContainer.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = option;
            button.addEventListener('click', selectOption);
            optionsContainer.appendChild(button);
        });
        nextBtn.style.display = 'none';
    }

    function selectOption(e) {
        const selectedButton = e.target;
        const correct = selectedButton.innerHTML === questions[currentQuestionIndex].correct_answer;

        if (correct) {
            score++;
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
        }

        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
            if (button.innerHTML === questions[currentQuestionIndex].correct_answer) {
                button.classList.add('correct');
            }
        });

        nextBtn.style.display = 'block';
    }

    function showResults() {
        quizScreen.style.display = 'none';
        resultsScreen.style.display = 'block';
        scoreSpan.textContent = `${score} / ${questions.length}`;

        // Simple achievement system
        let achievementText = 'None';
        if (score === questions.length) {
            achievementText = 'Perfect Score!';
        } else if (score >= questions.length * 0.7) {
            achievementText = 'Quiz Master!';
        }
        achievementsSpan.textContent = achievementText;

        // Save results
        const username = localStorage.getItem('username') || 'Anonymous';
        const results = JSON.parse(localStorage.getItem('quiz-results')) || [];
        results.push({
            username: username,
            score: `${score} / ${questions.length}`,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('quiz-results', JSON.stringify(results));
    }
});
