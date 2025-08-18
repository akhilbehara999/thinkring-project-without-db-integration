document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const quizScreens = document.querySelectorAll('.quiz-screen');
    const startScreen = document.getElementById('start-screen');
    const startCard = document.querySelector('.start-card');
    const startBtn = document.getElementById('start-btn');
    const categorySelect = document.getElementById('category-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const quizScreen = document.getElementById('quiz-screen');
    const progressBarInner = document.getElementById('progress-bar-inner');
    const scoreValue = document.getElementById('score-value');
    const questionCard = document.getElementById('question-card');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');
    const resultsScreen = document.getElementById('results-screen');
    const finalScoreEl = document.getElementById('final-score');
    const achievementHologram = document.getElementById('achievement-unlocked');
    const achievementTextEl = document.getElementById('achievement-text');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- State Variables ---
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let localQuestions = JSON.parse(localStorage.getItem('quiz-questions')) || [];

    // --- Event Listeners ---
    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (playAgainBtn) playAgainBtn.addEventListener('click', resetQuiz);
    if (startCard) {
        startCard.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = startCard.getBoundingClientRect();
            const x = (e.clientX - left - width / 2) / (width / 2);
            const y = (e.clientY - top - height / 2) / (height / 2);
            startCard.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.05)`;
        });
        startCard.addEventListener('mouseleave', () => {
            startCard.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
        });
    }

    // --- Core Functions ---

    function switchScreen(targetScreenId) {
        quizScreens.forEach(screen => {
            screen.classList.toggle('active', screen.id === targetScreenId);
        });
    }

    async function startQuiz() {
        const category = categorySelect.value;
        const difficulty = difficultySelect.value;

        try {
            // Fetch questions from API
            const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`);
            const data = await response.json();

            // Combine with local questions for more variety
            questions = [...data.results, ...localQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
            if (questions.length === 0) throw new Error("No questions found.");

            // Reset state and switch to quiz screen
            score = 0;
            currentQuestionIndex = 0;
            updateScore(0);
            switchScreen('quiz-screen');
            showQuestion();
        } catch (error) {
            console.error('Error starting quiz:', error);
            showNotification('Failed to load questions. Please check your connection or add local questions.', 'error');
        }
    }

    function showQuestion() {
        // Reset animations and styles
        resetQuestionState();

        const question = questions[currentQuestionIndex];
        questionText.innerHTML = question.question; // Use innerHTML to decode entities

        const options = [...question.incorrect_answers, question.correct_answer];
        options.sort(() => Math.random() - 0.5); // Shuffle options

        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = option;
            button.style.animationDelay = `${index * 100}ms`;
            button.addEventListener('click', selectOption);
            optionsContainer.appendChild(button);
        });

        updateProgressBar();
    }

    function selectOption(e) {
        const selectedButton = e.target;
        const isCorrect = selectedButton.innerHTML === questions[currentQuestionIndex].correct_answer;

        // Disable all buttons to prevent multiple selections
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
            // Reveal the correct answer
            if (button.innerHTML === questions[currentQuestionIndex].correct_answer) {
                button.classList.add('correct');
            }
        });

        if (isCorrect) {
            score++;
            updateScore(score);
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
        }

        nextBtn.style.display = 'inline-flex';
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            // Add a particle trail effect for the transition
            createParticleTrail();
            // A short delay to let the particle animation be visible
            setTimeout(showQuestion, 300);
        } else {
            showResults();
        }
    }

    function showResults() {
        switchScreen('results-screen');
        finalScoreEl.textContent = `${score} / ${questions.length}`;

        const percentage = (score / questions.length) * 100;
        let achievementText = 'Good Effort!';
        if (percentage === 100) {
            achievementText = 'Perfect Score!';
            triggerConfetti();
        } else if (percentage >= 70) {
            achievementText = 'Quiz Master!';
            triggerConfetti(20);
        }

        achievementTextEl.textContent = achievementText;
        achievementHologram.style.display = 'block';
    }

    function resetQuiz() {
        switchScreen('start-screen');
        // A delay to allow the screen transition to finish before resetting elements
        setTimeout(() => {
            achievementHologram.style.display = 'none';
            document.getElementById('confetti-container').innerHTML = '';
        }, 500);
    }

    // --- UI & Animation Helpers ---

    function resetQuestionState() {
        questionCard.style.animation = 'none'; // Reset animation
        void questionCard.offsetWidth; // Trigger reflow
        questionCard.style.animation = 'question-enter 0.5s ease-out forwards';
        optionsContainer.innerHTML = '';
        nextBtn.style.display = 'none';
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBarInner.style.width = `${progress}%`;
    }

    function updateScore(newScore) {
        scoreValue.textContent = newScore;
        scoreValue.parentNode.classList.add('pulsate');
        setTimeout(() => scoreValue.parentNode.classList.remove('pulsate'), 300);
    }

    function createParticleTrail() {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-trail';
            optionsContainer.appendChild(particle);
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 0.2}s`;
            setTimeout(() => particle.remove(), 1000);
        }
    }

    function triggerConfetti(count = 50) {
        const container = document.getElementById('confetti-container');
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti ${Math.random() > 0.5 ? 'gold' : ''}`;
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = `${-20 - Math.random() * 20}px`;
            const animDuration = 3 + Math.random() * 2;
            const animDelay = Math.random() * 3;
            confetti.style.animation = `fall ${animDuration}s linear ${animDelay}s forwards`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), (animDuration + animDelay) * 1000);
        }
    }

    // --- Admin Panel Logic (Simplified for brevity, assuming it exists) ---
    const adminView = document.getElementById('admin-view');
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminView = urlParams.get('view') === 'admin';
    if (isAdminView) {
        document.getElementById('quiz-container').style.display = 'none';
        adminView.style.display = 'block';
    }

    // Add a fallback for showNotification if it's not in global.js
    function showNotification(message, type = 'info') {
        // In a real app, this would create a styled notification element.
        console.log(`[${type.toUpperCase()}] ${message}`);
        // For this project, a simple alert will suffice if the global function isn't there.
        if(typeof window.showNotification !== 'function') {
            alert(message);
        }
    }
});
