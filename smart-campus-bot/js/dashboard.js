document.addEventListener('DOMContentLoaded', () => {
    // Check for session token
    if (!localStorage.getItem('sessionToken')) {
        window.location.href = 'index.html';
    }

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
    });

    const moduleCards = document.querySelectorAll('.module-card');
    moduleCards.forEach(card => {
        card.addEventListener('click', () => {
            const module = card.dataset.module;
            window.location.href = `modules/${module}/${module}.html`;
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                card.click();
            }
        });
    });

    // Voice commands
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition(); // Use global var
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = () => {
            console.log('Voice recognition started.');
            speak("I'm listening.");
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.trim().toLowerCase();
            console.log('Voice command:', command);

            if (command.startsWith('open')) {
                const moduleName = command.substring(5).replace(/ /g, '-');
                const card = document.querySelector(`.module-card[data-module="${moduleName}"]`);
                if (card) {
                    speak(`Opening ${moduleName.replace(/-/g, ' ')}.`);
                    card.click();
                } else {
                    speak(`Module ${moduleName.replace(/-/g, ' ')} not found.`);
                }
            } else if (command === 'stop listening') {
                speak("Going back to sleep.");
                recognition.stop();
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
        };

        recognition.onend = () => {
            console.log('Voice recognition ended.');
            // Don't automatically restart, wait for wake word again.
        };

        // Listen for wake word instead of starting immediately
        listenForWakeWord(startVoiceCommands);

    } else {
        console.log('Speech recognition not supported in this browser.');
    }
});
