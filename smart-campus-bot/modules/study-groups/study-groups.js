document.addEventListener('DOMContentLoaded', () => {
    const groupListView = document.getElementById('group-list-view');
    const createGroupView = document.getElementById('create-group-view');
    const groupChatView = document.getElementById('group-chat-view');

    const createGroupBtn = document.getElementById('create-group-btn');
    const createGroupForm = document.getElementById('create-group-form');
    const cancelCreateBtn = document.getElementById('cancel-create-btn');
    const groupList = document.getElementById('group-list');

    const currentGroupName = document.getElementById('current-group-name');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const backToGroupsBtn = document.getElementById('back-to-groups-btn');

    let groups = JSON.parse(localStorage.getItem('study-groups')) || [];
    let currentGroupId = null;

    function renderGroupList() {
        groupList.innerHTML = '';
        groups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';
            groupCard.innerHTML = `<h3>${sanitizeInput(group.name)}</h3><p>${sanitizeInput(group.description)}</p>`;
            groupCard.dataset.groupId = group.id;
            groupCard.addEventListener('click', () => openChat(group.id));
            groupList.appendChild(groupCard);
        });
    }

    function openChat(groupId) {
        currentGroupId = groupId;
        const group = groups.find(g => g.id === groupId);
        currentGroupName.textContent = group.name;

        showView(groupChatView);
        renderChatMessages();
    }

    function renderChatMessages() {
        const group = groups.find(g => g.id === currentGroupId);
        chatMessages.innerHTML = '';
        group.messages.forEach(msg => {
            const msgElement = document.createElement('div');
            msgElement.textContent = `${msg.sender}: ${msg.text}`;
            chatMessages.appendChild(msgElement);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showView(view) {
        groupListView.style.display = 'none';
        createGroupView.style.display = 'none';
        groupChatView.style.display = 'none';
        view.style.display = 'block';
    }

    createGroupBtn.addEventListener('click', () => showView(createGroupView));
    cancelCreateBtn.addEventListener('click', () => showView(groupListView));
    backToGroupsBtn.addEventListener('click', () => showView(groupListView));

    const groupNameInput = document.getElementById('group-name');

    if(groupNameInput) groupNameInput.addEventListener('input', () => validateField(groupNameInput));

    createGroupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateField(groupNameInput)) {
            speak("Please provide a group name.");
            return;
        }

        const groupName = groupNameInput.value;
        const groupDescription = document.getElementById('group-description').value;
        const newGroup = {
            id: Date.now(),
            name: groupName,
            description: groupDescription,
            messages: []
        };
        groups.push(newGroup);
        localStorage.setItem('study-groups', JSON.stringify(groups));
        renderGroupList();
        showView(groupListView);
        createGroupForm.reset();
    });

    sendMessageBtn.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text === '' || !currentGroupId) return;

        const groupIndex = groups.findIndex(g => g.id === currentGroupId);
        if (groupIndex > -1) {
            groups[groupIndex].messages.push({ sender: 'User', text: text }); // Assuming 'User' for simplicity
            localStorage.setItem('study-groups', JSON.stringify(groups));

            renderChatMessages();
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageBtn.click();
        }
    });

    renderGroupList();
});
