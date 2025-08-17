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
    const questionIdInput = document.getElementById('question-id');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formCancelBtn = document.getElementById('form-cancel-btn');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    let localQuestions = JSON.parse(localStorage.getItem('quiz-questions')) || [];

    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';

    const questionsTableBody = document.querySelector('#questions-table tbody');

    if (isAdminView) {
        document.getElementById('quiz-container').style.display = 'none';
        if(adminView) adminView.style.display = 'block';
        document.querySelector('.back-link').href = '../../admin.html';
        document.querySelector('h1').textContent = 'Manage Quiz';
        renderQuestionTable();
        renderQuizAnalytics();
    }

    /**
     * Calculates and renders the quiz analytics chart and stats.
     */
    function renderQuizAnalytics() {
        const results = JSON.parse(localStorage.getItem('quiz-results')) || [];
        const avgScoreEl = document.getElementById('avg-score');

        if (results.length === 0) {
            if (avgScoreEl) avgScoreEl.textContent = 'N/A';
            // Optionally draw an empty chart
            drawBarChart('quiz-analytics-chart', { labels: ['No Data'], values: [0] });
            return;
        }

        let totalPercentage = 0;
        const scoreDistribution = { '0-25%': 0, '26-50%': 0, '51-75%': 0, '76-100%': 0 };

        results.forEach(result => {
            const parts = result.score.split(' / ');
            const score = parseInt(parts[0]);
            const total = parseInt(parts[1]);
            const percentage = (score / total) * 100;
            totalPercentage += percentage;

            if (percentage <= 25) scoreDistribution['0-25%']++;
            else if (percentage <= 50) scoreDistribution['26-50%']++;
            else if (percentage <= 75) scoreDistribution['51-75%']++;
            else scoreDistribution['76-100%']++;
        });

        const averageScore = totalPercentage / results.length;
        if (avgScoreEl) avgScoreEl.textContent = `${averageScore.toFixed(1)}%`;

        const chartData = {
            labels: Object.keys(scoreDistribution),
            values: Object.values(scoreDistribution)
        };
        drawBarChart('quiz-analytics-chart', chartData, { barColor: '#4cd137' });
    }

    /**
     * Renders the local questions into the admin table.
     */
    function renderQuestionTable() {
        if (!questionsTableBody) return;
        questionsTableBody.innerHTML = '';
        localQuestions.forEach(q => {
            const row = questionsTableBody.insertRow();
            row.innerHTML = `
                <td>${sanitizeInput(q.question)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${q.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${q.id}">Delete</button>
                </td>
            `;
        });
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

            const questionId = parseInt(questionIdInput.value);
            const questionData = {
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

            if (questionId) {
                // Update existing question
                const questionIndex = localQuestions.findIndex(q => q.id === questionId);
                if (questionIndex > -1) {
                    localQuestions[questionIndex] = { ...localQuestions[questionIndex], ...questionData };
                }
            } else {
                // Add new question
                questionData.id = Date.now();
                localQuestions.push(questionData);
            }

            localStorage.setItem('quiz-questions', JSON.stringify(localQuestions));
            alert(`Question ${questionId ? 'updated' : 'added'} successfully!`);
            resetForm();
            renderQuestionTable();
        });
    }

    function resetForm() {
        addQuestionForm.reset();
        questionIdInput.value = '';
        formSubmitBtn.textContent = 'Add Question';
        formCancelBtn.style.display = 'none';
    }

    if (questionsTableBody) {
        questionsTableBody.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('action-btn')) {
                const questionId = parseInt(target.dataset.id);

                if (target.classList.contains('delete-btn')) {
                    if (confirm('Are you sure you want to delete this question?')) {
                        localQuestions = localQuestions.filter(q => q.id !== questionId);
                        localStorage.setItem('quiz-questions', JSON.stringify(localQuestions));
                        renderQuestionTable();
                    }
                } else if (target.classList.contains('edit-btn')) {
                    const questionToEdit = localQuestions.find(q => q.id === questionId);
                    if (questionToEdit) {
                        questionIdInput.value = questionToEdit.id;
                        document.getElementById('question-text').value = questionToEdit.question;
                        document.getElementById('correct-answer').value = questionToEdit.correct_answer;
                        document.getElementById('incorrect-answer-1').value = questionToEdit.incorrect_answers[0];
                        document.getElementById('incorrect-answer-2').value = questionToEdit.incorrect_answers[1];
                        document.getElementById('incorrect-answer-3').value = questionToEdit.incorrect_answers[2];

                        formSubmitBtn.textContent = 'Update Question';
                        formCancelBtn.style.display = 'inline-block';
                        addQuestionForm.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    }

    if (formCancelBtn) {
        formCancelBtn.addEventListener('click', resetForm);
    }

    // --- JSON Upload ---
    const jsonUploadInput = document.getElementById('json-upload');
    const uploadBtn = document.getElementById('upload-btn');

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            const file = jsonUploadInput.files[0];
            if (!file) {
                alert('Please select a JSON file to upload.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const newQuestions = JSON.parse(event.target.result);

                    // Basic validation
                    if (!Array.isArray(newQuestions)) {
                        throw new Error('JSON must be an array of questions.');
                    }

                    const validatedQuestions = newQuestions.filter(q => q.question && q.correct_answer && Array.isArray(q.incorrect_answers) && q.incorrect_answers.length >= 3);

                    if (validatedQuestions.length !== newQuestions.length) {
                        alert('Some questions in the file were invalid and have been skipped.');
                    }

                    validatedQuestions.forEach(q => {
                        q.id = Date.now() + Math.random(); // Ensure unique ID
                        q.category = 'custom';
                        q.type = 'multiple';
                        q.difficulty = 'custom';
                        localQuestions.push(q);
                    });

                    localStorage.setItem('quiz-questions', JSON.stringify(localQuestions));
                    renderQuestionTable();
                    alert(`${validatedQuestions.length} questions uploaded successfully!`);
                    jsonUploadInput.value = ''; // Reset file input

                } catch (error) {
                    alert(`Error parsing JSON file: ${error.message}`);
                }
            };
            reader.readAsText(file);
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
