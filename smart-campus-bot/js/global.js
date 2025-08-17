// --- GLOBAL EVENT LISTENERS ---

/**
 * Handles the page load event to hide the loader and fade in the content.
 */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    const body = document.body;

    if (loader) {
        // Add a small delay to let the user see the animation
        setTimeout(() => {
            loader.classList.add('hidden');
            // Allow the loader to fade out before the body fades in
            setTimeout(() => {
                body.classList.add('loaded');
            }, 50);
        }, 500);
    } else {
        // If there's no loader, just show the body
        body.classList.add('loaded');
    }
});


// --- SPEECH SYNTHESIS & RECOGNITION ---

/**
 * Uses the Web Speech API to speak the given text.
 * @param {string} text The text to be spoken.
 */
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        // You can customize the voice here
        speechSynthesis.speak(utterance);
    }
}

/**
 * A global variable to hold the speech recognition instance.
 * This allows it to be controlled from different parts of the application.
 */
let recognition;

/**
 * Simulates listening for a wake word. In a real application, this would
 * involve a dedicated speech recognition library.
 * @param {function} callback The function to call when the wake word is "detected".
 */
function listenForWakeWord(callback) {
    console.log("Wake word detection is not fully implemented in this demo.");
    console.log("To simulate, you can call the callback manually from the console: window.startVoiceCommands()");
    // In a real app, you would use a library like Porcupine or a custom speech model.
    window.startVoiceCommands = callback;
}

/**
 * Starts the speech recognition service if it has been initialized.
 */
function startVoiceCommands() {
    if (recognition) {
        try {
            recognition.start();
        } catch(e) {
            console.error("Voice recognition could not be started.", e);
        }
    } else {
        console.error("Voice recognition is not initialized.");
    }
}
