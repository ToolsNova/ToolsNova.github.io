// ===== TOOLSNOVA AI ASSISTANT - ULTRA SIMPLE MEMORY =====

// ===== CONFIGURATION =====
const GROQ_API_KEY = "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";
const MAX_GUEST_MESSAGES = 3;

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyBADT8ZDZ9TGEVeVm73Yf_rwI6YmAtjRa8",
    authDomain: "toolsnova-869.firebaseapp.com",
    projectId: "toolsnova-869",
    storageBucket: "toolsnova-869.firebasestorage.app",
    messagingSenderId: "393315506444",
    appId: "1:393315506444:web:595807ed58abe6b6ad9129"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ===== GLOBAL STATE =====
let chats = [];
let currentChatId = null;
let currentUser = null;
let attachedFiles = [];

// ===== DOM ELEMENTS =====
let messagesWrapper, messagesContainer, welcomeScreen;
let messageInput, sendBtn, newChatBtn, themeToggle;
let chatHistory, currentChatTitle, attachBtn, fileInput, filePreviewContainer;
let sidebar, sidebarToggle, mobileMenuBtn, mobileOverlay;

// ===== FIXED COPY CODE FUNCTION =====
window.copyCode = function(code) {
    // Decode the URI component
    const decodedCode = decodeURIComponent(code);
    
    navigator.clipboard.writeText(decodedCode).then(() => {
        const btn = event.target.closest('.copy-code-btn');
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    }).catch(() => alert('Failed to copy code'));
};

// ===== FILE PROCESSING FUNCTIONS =====
async function processFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const content = e.target.result;
            const fileType = file.type;
            const fileName = file.name;
            const fileSize = (file.size / 1024).toFixed(2) + ' KB';
            
            resolve({
                name: fileName,
                type: fileType,
                size: fileSize,
                content: content,
                isText: fileType.startsWith('text/') || 
                        fileName.endsWith('.js') || 
                        fileName.endsWith('.py') || 
                        fileName.endsWith('.html') || 
                        fileName.endsWith('.css') || 
                        fileName.endsWith('.json') || 
                        fileName.endsWith('.txt')
            });
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        if (file.type.startsWith('text/') || 
            file.name.endsWith('.js') || 
            file.name.endsWith('.py') || 
            file.name.endsWith('.html') || 
            file.name.endsWith('.css') || 
            file.name.endsWith('.json') || 
            file.name.endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });
}

async function processFiles(files) {
    const processedFiles = [];
    for (let file of files) {
        try {
            const processed = await processFile(file);
            processedFiles.push(processed);
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }
    return processedFiles;
}

// ===== ULTRA SIMPLE AI ASSISTANT =====
class AIAssistant {
    constructor() {
        this.messages = [];
    }

    // Load messages for current chat
    loadMessages(msgs) {
        this.messages = [...msgs];
        console.log('Loaded messages:', this.messages.length);
    }

    // Clear for new chat
    clearMessages() {
        this.messages = [];
        console.log('Cleared messages for new chat');
    }

    async getResponse(userMessage, files = []) {
        // Add user message
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        // Create a simple prompt with exact message count
        const messageCount = this.messages.filter(m => m.role === 'user').length;
        
        // Build conversation history in a simple format
        let historyText = '';
        this.messages.forEach((msg, i) => {
            const prefix = msg.role === 'user' ? 'User' : 'Assistant';
            historyText += `${prefix}: ${msg.content}\n`;
        });

        const systemPrompt = `You are a helpful AI assistant. Here is the EXACT conversation so far:

${historyText}

Current message: "${userMessage}"
${files.length > 0 ? `Files: ${files.length}` : ''}

TABLE FORMATTING RULES - THIS IS CRITICAL:
When the user asks for a table, you MUST output an HTML table like this EXACT format:

<table class="data-table">
  <thead>
    <tr><th>City</th><th>Population</th><th>Country</th></tr>
  </thead>
  <tbody>
    <tr><td>Tokyo</td><td>38M</td><td>Japan</td></tr>
    <tr><td>Delhi</td><td>31M</td><td>India</td></tr>
    <tr><td>Shanghai</td><td>27M</td><td>China</td></tr>
  </tbody>
</table>

IMPORTANT:
1. Use <table>, <tr>, <td> tags - NOT markdown
2. First row should be <th> for headers
3. Keep tables clean and simple
4. The CSS will make it look good with borders
5. For any type of point wise data use <ul>, <li> tags with proper spacing - NO markdown
6. Answer ONLY what user ask, only few recomendation if needed.
7. Remember Chats but give fresh reply.

Remember: This is message #${messageCount} from the user.
The user's first message was: "${this.messages.filter(m => m.role === 'user')[0]?.content || 'nothing'}"

Answer based ONLY on the messages above. Be friendly and helpful.`;

        try {
            const messages = [
                { role: "system", content: systemPrompt }
            ];

            const response = await this.callGroqAPI(messages);
            
            // Add assistant response
            this.messages.push({
                role: 'assistant',
                content: response
            });
            
            return response.replace(/\*\*/g, '').replace(/\*/g, '').trim();
        } catch (error) {
            console.error('AI Error:', error);
            return "❌ Error\n\nSorry, try again.";
        }
    }

    async callGroqAPI(messages) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.1,
                max_tokens: 1500
            })
        });
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
}

const aiAssistant = new AIAssistant();

// ===== LOAD CHAT WITH PROPER CODE BLOCKS =====
function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    if (currentChatTitle) currentChatTitle.textContent = chat.title;
    
    // Load this chat's messages into AI
    aiAssistant.loadMessages(chat.messages);
    
    if (!messagesWrapper || !welcomeScreen) return;
    
    if (chat.messages.length === 0) {
        welcomeScreen.style.display = 'flex';
        messagesWrapper.innerHTML = '';
        messagesWrapper.appendChild(welcomeScreen);
    } else {
        welcomeScreen.style.display = 'none';
        messagesWrapper.innerHTML = chat.messages.map(msg => {
            const isUser = msg.role === 'user';
            const time = new Date(msg.time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            let content = msg.content;
            
            // Handle file attachments
            if (msg.files && msg.files.length > 0) {
                const fileHtml = msg.files.map(file => `
                    <div class="file-attachment">
                        <i class="fas fa-file"></i>
                        <span>${file.name} (${file.size})</span>
                    </div>
                `).join('');
                content = fileHtml + '<br>' + content;
            }
            
            // Handle HTML tables
            if (content.includes('<table')) {
                // Already HTML, leave as is
            }
            // Handle markdown tables
            else if (content.includes('|') && content.includes('\n|')) {
                content = content.replace(/\|(.+)\|/g, '<tr><td>$1</td></tr>');
                content = '<table class="data-table">' + content + '</table>';
            }
            
            // Handle code blocks - FIXED VERSION
            if (content.includes('```')) {
                content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
                    const cleanCode = code.trim();
                    // Escape for HTML display
                    const displayCode = cleanCode
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    
                    // Create a safe string for the copy button
                    const copyCode = cleanCode.replace(/`/g, '\\`').replace(/\${/g, '\\${');
                    
                    return `
                        <div class="code-block-wrapper">
                            <pre><code class="language-${language || 'plaintext'}">${displayCode}</code></pre>
                            <button class="copy-code-btn" data-code="${encodeURIComponent(cleanCode)}">
                                <i class="fas fa-copy"></i> Copy code
                            </button>
                        </div>
                    `;
                });
            }
            
            return `
                <div class="message ${isUser ? 'user' : ''}">
                    <div class="message-avatar ${isUser ? 'user' : 'ai'}">
                        <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">${content}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    renderChatHistory();
}
// ===== CHAT HISTORY =====
function loadChats() {
    const saved = localStorage.getItem('toolsnova_chats');
    if (saved) {
        chats = JSON.parse(saved);
    } else {
        const defaultChat = { 
            id: Date.now().toString(), 
            title: 'New Chat', 
            messages: [], 
            createdAt: Date.now() 
        };
        chats = [defaultChat];
        currentChatId = defaultChat.id;
        saveChats();
    }
    if (!currentChatId && chats.length > 0) currentChatId = chats[0].id;
    renderChatHistory();
    if (currentChatId) loadChat(currentChatId);
}

function saveChats() {
    localStorage.setItem('toolsnova_chats', JSON.stringify(chats));
}

function renderChatHistory() {
    if (!chatHistory) return;
    chatHistory.innerHTML = chats.map(chat => {
        const isActive = chat.id === currentChatId;
        const timeAgo = getTimeAgo(chat.createdAt);
        return `<div class="history-item ${isActive ? 'active' : ''}" onclick="window.loadChat('${chat.id}')">
            <i class="fas fa-comment"></i>
            <div class="history-content">
                <span class="history-title">${chat.title}</span>
                <span class="history-time">${timeAgo}</span>
            </div>
            <div class="chat-actions">
                <button class="chat-action-btn rename" onclick="window.renameChat('${chat.id}', event)">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="chat-action-btn delete" onclick="window.deleteChat('${chat.id}', event)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

function createNewChat() {
    const newChat = { 
        id: Date.now().toString(), 
        title: 'New Chat', 
        messages: [], 
        createdAt: Date.now() 
    };
    chats.unshift(newChat);
    currentChatId = newChat.id;
    saveChats();
    renderChatHistory();
    
    // Clear AI messages for new chat
    aiAssistant.clearMessages();
    
    loadChat(currentChatId);
    if (messageInput) messageInput.focus();
}

window.deleteChat = function(chatId, event) {
    event.stopPropagation();
    if (chats.length === 1) { 
        alert('Cannot delete last chat'); 
        return; 
    }
    chats = chats.filter(c => c.id !== chatId);
    if (currentChatId === chatId) { 
        currentChatId = chats[0].id; 
        loadChat(currentChatId); 
    }
    saveChats();
    renderChatHistory();
};

window.renameChat = function(chatId, event) {
    event.stopPropagation();
    const chat = chats.find(c => c.id === chatId);
    const newTitle = prompt('Enter new chat name:', chat.title);
    if (newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        saveChats();
        renderChatHistory();
        if (currentChatId === chatId && currentChatTitle) 
            currentChatTitle.textContent = chat.title;
    }
};

function getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return minutes + 'm';
    if (hours < 24) return hours + 'h';
    return days + 'd';
}

// ===== SEND MESSAGE =====
async function sendMessage() {
    if (!messageInput) return;
    const text = messageInput.value.trim();
    if (!text && attachedFiles.length === 0) return;
    
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) return;
    
    if (!currentUser) {
        const aiMsgCount = currentChat.messages.filter(m => m.role === 'assistant').length;
        if (aiMsgCount >= MAX_GUEST_MESSAGES) {
            alert('3 messages used. Sign up for unlimited!');
            window.location.href = 'signup.html';
            return;
        }
    }
    
    let processedFiles = [];
    if (attachedFiles.length > 0) {
        processedFiles = await processFiles(attachedFiles);
    }
    
    currentChat.messages.push({ 
        role: 'user', 
        content: text || '📎 File upload',
        files: processedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
        time: Date.now() 
    });
    
    if (currentChat.messages.length === 1) {
        const titleText = text || processedFiles[0]?.name || 'New Chat';
        currentChat.title = titleText.substring(0, 30) + (titleText.length > 30 ? '...' : '');
        if (currentChatTitle) currentChatTitle.textContent = currentChat.title;
    }
    
    saveChats();
    loadChat(currentChatId);
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
    attachedFiles = [];
    if (filePreviewContainer) filePreviewContainer.innerHTML = '';
    if (fileInput) fileInput.value = '';
    
    sendBtn.disabled = true;
    messageInput.disabled = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `<div class="message-avatar ai"><i class="fas fa-robot"></i></div><div class="message-content"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    messagesWrapper.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await aiAssistant.getResponse(text, processedFiles);
        
        document.getElementById('typingIndicator')?.remove();
        
        currentChat.messages.push({ 
            role: 'assistant', 
            content: response, 
            time: Date.now() 
        });
        
        saveChats();
        loadChat(currentChatId);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('typingIndicator')?.remove();
        currentChat.messages.push({ 
            role: 'assistant', 
            content: '❌ Error\n\nSorry, try again.', 
            time: Date.now() 
        });
        saveChats();
        loadChat(currentChatId);
    }
    
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
}

// ===== FILE UPLOAD =====
function showFilePreviews() {
    if (!filePreviewContainer) return;
    if (attachedFiles.length === 0) { 
        filePreviewContainer.innerHTML = ''; 
        return; 
    }
    filePreviewContainer.innerHTML = attachedFiles.map((file, index) => 
        `<div class="file-preview">
            <div class="file-preview-info">
                <i class="fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file'}"></i>
                <div>
                    <div>${file.name}</div>
                    <div>${(file.size / 1024).toFixed(1)} KB</div>
                </div>
            </div>
            <button class="remove-file" onclick="window.removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>`
    ).join('');
}

window.removeFile = function(index) {
    attachedFiles.splice(index, 1);
    showFilePreviews();
    if (fileInput) fileInput.value = '';
};

// ===== AUTH =====
function updateUserUI(user) {
    const authLinks = document.getElementById('sidebarAuth');
    const userMenu = document.getElementById('userInfo');
    const userName = document.getElementById('sidebarUserName');
    
    if (authLinks && userMenu) {
        if (user) {
            authLinks.style.display = 'none';
            userMenu.style.display = 'flex';
            if (userName && user.email) 
                userName.textContent = user.email.split('@')[0];
        } else {
            authLinks.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
}

// ===== STYLES =====
function addCopyButtonStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .code-block-wrapper {
            position: relative;
            margin: 16px 0;
            border-radius: 12px;
            overflow: hidden;
            background: #1e1e1e;
        }
        
        .code-block-wrapper pre {
            margin: 0;
            padding: 16px;
            background: #1e1e1e !important;
            color: #d4d4d4;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
            overflow-x: auto;
        }
        
        .copy-code-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
            z-index: 10;
            backdrop-filter: blur(4px);
        }
        
        .copy-code-btn:hover {
            background: var(--primary);
            border-color: var(--primary);
        }
        
        .file-attachment {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--bg-tertiary);
            border-radius: 8px;
            margin: 8px 0;
            border: 1px solid var(--border);
        }
        
        .file-attachment i {
            color: var(--primary);
            font-size: 1.2rem;
        }
        
        .file-preview {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 15px;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            margin: 8px 0;
        }
        
        .file-preview-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .file-preview-info i {
            font-size: 1.5rem;
            color: var(--primary);
        }
        
        .remove-file {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid var(--border);
            background: var(--bg-tertiary);
            color: var(--error);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .remove-file:hover {
            background: var(--error);
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// ===== INITIALIZE =====
function initDOMElements() {
    sidebar = document.getElementById('sidebar');
    sidebarToggle = document.getElementById('sidebarToggle');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    mobileOverlay = document.getElementById('mobileOverlay');
    messagesWrapper = document.getElementById('messagesWrapper');
    messagesContainer = document.getElementById('messagesContainer');
    welcomeScreen = document.getElementById('welcomeScreen');
    messageInput = document.getElementById('messageInput');
    sendBtn = document.getElementById('sendBtn');
    newChatBtn = document.getElementById('newChatBtn');
    themeToggle = document.getElementById('themeToggle');
    chatHistory = document.getElementById('chatHistory');
    currentChatTitle = document.getElementById('currentChatTitle');
    attachBtn = document.getElementById('attachBtn');
    fileInput = document.getElementById('fileInput');
    filePreviewContainer = document.getElementById('filePreviewContainer');
}

function setupEventListeners() {
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = sidebarToggle.querySelector('i');
        icon.className = sidebar.classList.contains('collapsed') ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    });
    
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.remove('collapsed');
        mobileOverlay.style.display = 'block';
        setTimeout(() => mobileOverlay.classList.add('active'), 10);
    });
    
    if (mobileOverlay) mobileOverlay.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
        mobileOverlay.classList.remove('active');
        setTimeout(() => mobileOverlay.style.display = 'none', 300);
    });
    
    if (sendBtn) sendBtn.addEventListener('click', (e) => { e.preventDefault(); sendMessage(); });
    if (newChatBtn) newChatBtn.addEventListener('click', createNewChat);
    if (attachBtn) attachBtn.addEventListener('click', () => fileInput.click());
    if (fileInput) fileInput.addEventListener('change', (e) => { 
        attachedFiles = Array.from(e.target.files); 
        showFilePreviews(); 
    });
    
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });
        messageInput.addEventListener('input', function() { 
            this.style.height = 'auto'; 
            this.style.height = this.scrollHeight + 'px'; 
        });
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('i');
            icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'far fa-moon';
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    addCopyButtonStyles();
    setupEventListeners();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.querySelector('i').className = 'fas fa-sun';
    }
    
    document.getElementById('sidebarLogout')?.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });
    
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateUserUI(user);
        loadChats();
    });
    
    window.loadChat = loadChat;
    window.sendMessage = sendMessage;
    window.copyCode = copyCode;
});

// Update footer based on auth state
function updateFooterUI(user) {
    const footerGuestInfo = document.getElementById('footerGuestInfo');
    const footerUserInfo = document.getElementById('footerUserInfo');
    
    // Create user info element if it doesn't exist
    if (!footerUserInfo && footerGuestInfo) {
        const newUserInfo = document.createElement('div');
        newUserInfo.id = 'footerUserInfo';
        newUserInfo.className = 'user-info-footer';
        newUserInfo.style.display = 'none';
        newUserInfo.innerHTML = '<i class="fas fa-crown" style="color: var(--success);"></i><span>You have unlimited access</span>';
        footerGuestInfo.parentNode.appendChild(newUserInfo);
    }
}

// Update your existing auth observer
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'logged in' : 'guest');
    
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userGreeting = document.getElementById('userGreeting');
    const footerLogin = document.getElementById('footerLogin');
    const footerSignup = document.getElementById('footerSignup');
    const footerLogout = document.getElementById('footerLogout');
    const footerGuestInfo = document.getElementById('footerGuestInfo');
    const footerUserInfo = document.getElementById('footerUserInfo');
    
    if (user) {
        // User is logged in
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userGreeting) {
                userGreeting.textContent = `Hi, ${user.email.split('@')[0]}`;
            }
        }
        if (footerLogin) footerLogin.style.display = 'none';
        if (footerSignup) footerSignup.style.display = 'none';
        if (footerLogout) footerLogout.style.display = 'block';
        
        // Hide guest info, show user info
        if (footerGuestInfo) footerGuestInfo.style.display = 'none';
        if (footerUserInfo) {
            footerUserInfo.style.display = 'flex';
        } else {
            // Create user info element if it doesn't exist
            const newUserInfo = document.createElement('div');
            newUserInfo.id = 'footerUserInfo';
            newUserInfo.className = 'user-info-footer';
            newUserInfo.style.display = 'flex';
            newUserInfo.innerHTML = '<i class="fas fa-crown" style="color: var(--success);"></i><span>You have unlimited access</span>';
            if (footerGuestInfo && footerGuestInfo.parentNode) {
                footerGuestInfo.parentNode.appendChild(newUserInfo);
            }
        }
    } else {
        // User is guest
        if (authLinks) authLinks.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (footerLogin) footerLogin.style.display = 'block';
        if (footerSignup) footerSignup.style.display = 'block';
        if (footerLogout) footerLogout.style.display = 'none';
        
        // Show guest info, hide user info
        if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
        if (footerUserInfo) footerUserInfo.style.display = 'none';
    }
});