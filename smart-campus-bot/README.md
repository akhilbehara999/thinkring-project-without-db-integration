# Smart Service Campus Bot

This is a multi-page web application called "Smart Service Campus Bot" that transforms campus services through an immersive Jarvis-inspired interface. This project is built entirely using vanilla HTML, CSS, and JavaScript, with no external frameworks.

## How to Run

1.  Clone this repository to your local machine.
2.  Since this is a vanilla HTML, CSS, and JavaScript application, you can simply open the `index.html` file in your web browser.
3.  For some features, like file processing and voice recognition, it is recommended to run the application from a local web server to avoid potential CORS issues. You can use a simple server like Python's `http.server`:
    ```bash
    cd smart-campus-bot
    python -m http.server
    ```
    Then, navigate to `http://localhost:8000` in your browser.

## Features

### Core
- **Futuristic UI:** A Jarvis-inspired interface with a deep space blue and electric cyan color scheme, holographic elements, and animations.
- **Authentication:** A secure login system with different roles for students and administrators. The admin password is hashed.
- **Dashboard:** A central command center for students to access all the available modules.
- **Admin Panel:** A dedicated panel for administrators to manage the application's modules.
- **Responsive Design:** The application is designed to work on various screen sizes, from mobile phones to desktops.

### Modules
1.  **Lost & Found:** Report and search for lost or found items on campus.
2.  **Attendance:** Track attendance records. Admins can upload CSV, PDF, or image files (PDF and image processing are simulated).
3.  **Quiz:** Test your knowledge with quizzes fetched from an external API, with a local fallback.
4.  **Book Tools:** Utilize AI-powered tools to summarize and expand text (AI is simulated).
5.  **Code Explainer:** Get explanations and simulated outputs for your code in various languages.
6.  **Storage:** A personal cloud storage system using IndexedDB to store files locally.
7.  **Chatbot:** An intelligent chatbot with a local knowledge base that can be expanded by admins.
8.  **Study Groups:** Create, join, and chat in study groups.

## Technologies Used

-   **HTML5:** For the structure of the web pages.
-   **CSS3:** For styling, layout, and animations.
-   **Vanilla JavaScript (ES6+):** For all the application logic.
-   **Web Speech API:** For voice commands and text-to-speech.
-   **IndexedDB:** for client-side storage of large files.
-   **localStorage:** For session management and storing smaller data.

## Security Notes

- **Password Hashing:** The admin password is hashed using a simple, non-cryptographically secure function for demonstration purposes. In a real-world application, a strong, salted hashing algorithm like **bcrypt** or **Argon2** should be used.
- **Input Sanitization:** The application includes basic input sanitization to prevent XSS attacks. However, all user-generated content should be thoroughly validated and sanitized on both the client and server sides in a production environment.

## Notes on Simulated Features

Some of the advanced features in this project are simulated to demonstrate the concept without requiring a backend or paid API keys.

-   **AI Features (Book Tools, Code Explainer, Chatbot):** The AI-powered text processing, code analysis, and chatbot responses are based on placeholder functions and a local knowledge base. To implement these features fully, you would need to integrate with a service like OpenAI, Google AI, or a custom-trained model.
-   **PDF and OCR Processing (Attendance):** The PDF and image parsing in the Attendance module are demonstrated using `pdf.js` and `Tesseract.js`. The extracted text is logged to the console, but a more robust implementation would require more sophisticated parsing logic to handle various document layouts.
-   **Wake Word Detection:** The voice command system is activated by a placeholder "wake word" function. In a real-world application, this would require a dedicated library like Porcupine or a browser extension with the necessary permissions.
