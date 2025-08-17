/**
 * @file Manages user data for the application.
 */

/**
 * Initializes the user database in localStorage if it doesn't exist.
 * Populates it with default user data.
 */
function initializeUsers() {
    let users = JSON.parse(localStorage.getItem('users'));
    if (!users) {
        // In a real app, password hashes would be generated server-side.
        // For demonstration, we'll keep the student password plain for now.
        users = [
            { id: 1, username: 'student', role: 'student', status: 'active', password: 'password123', lastLogin: 'N/A' },
            { id: 2, username: 'KAB', role: 'admin', status: 'active', password: simpleHash('7013432177@akhil'), lastLogin: 'N/A' },
            { id: 3, username: 'testuser', role: 'student', status: 'suspended', password: 'password', lastLogin: '2025-08-16' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
    return users;
}

/**
 * Retrieves all users from localStorage.
 * @returns {Array} An array of user objects.
 */
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

/**
 * Updates a specific user's data in localStorage.
 * @param {number} userId The ID of the user to update.
 * @param {object} updatedData An object containing the fields to update.
 */
function updateUser(userId, updatedData) {
    let users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize the user database on script load.
// This ensures that the data is available for other scripts.
initializeUsers();
