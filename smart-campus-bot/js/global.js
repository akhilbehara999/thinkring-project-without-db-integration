function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        // You can customize the voice here
        speechSynthesis.speak(utterance);
    }
}

let recognition; // Will be defined in dashboard.js or other pages

function listenForWakeWord(callback) {
    console.log("Wake word detection is not fully implemented in this demo.");
    console.log("To simulate, you can call the callback manually from the console: window.startVoiceCommands()");
    // In a real app, you would use a library like Porcupine or a custom speech model.
    window.startVoiceCommands = callback;
}

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
