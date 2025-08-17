// Basic string hashing function (for demonstration purposes)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
}

function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}
