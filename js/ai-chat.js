// ===== AI CHAT ASSISTANT - CLOUDFLARE WORKER VERSION =====

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
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
} else {
    console.error('Firebase not loaded');
}

// ===== CONFIGURATION =====
const MAX_GUEST_MESSAGES = 3;
// 🔥 YOUR CLOUDFLARE WORKER URL
const WORKER_URL = 'https://proxy.toolsnova.workers.dev';

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

// ===== CHECK MESSAGE SIZE =====
function checkMessageSize(text) {
    const MAX_SIZE = 50000;
    if (text.length > MAX_SIZE) {
        return {
            valid: false,
            message: `Message too long (${Math.round(text.length/1000)}KB). Please keep under 50KB.`
        };
    }
    return { valid: true };
}

// ===== COPY CODE FUNCTION =====
window.copyCode = function(code) {
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

// ===== FILE PROCESSING =====
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

// ===== 🔥 AI ASSISTANT CLASS - CLOUDFLARE WORKER VERSION =====
class AIAssistant {
    constructor() {
        this.messages = [];
    }

    loadMessages(msgs) {
        this.messages = [...msgs];
    }

    clearMessages() {
        this.messages = [];
    }

    async getResponse(userMessage, files = []) {
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        const messageCount = this.messages.filter(m => m.role === 'user').length;
        
        let historyText = '';
        this.messages.forEach((msg, i) => {
            const prefix = msg.role === 'user' ? 'User' : 'Assistant';
            historyText += `${prefix}: ${msg.content}\n`;
        });

        const systemPrompt = `You are a helpful AI assistant. Here is the EXACT conversation so far:

${historyText}

Current message: "${userMessage}"
${files.length > 0 ? `Files: ${files.length}` : ''}

TABLE FORMATTING RULES:
When the user asks for a table, output an HTML table like this:

<table class="data-table">
  <thead>
     <tr><th>City</th><th>Population</th><th>Country</th></tr>
  </thead>
  <tbody>
      <tr><td>Tokyo</td><td>38M</td><td>Japan</td></tr>
  </tbody>
</table>

IMPORTANT:
1. Use HTML tables, NOT markdown
2. Use <ul>, <li> tags for lists with proper spacing
3. Answer concisely and accurately
4. Remember chat context but give fresh replies
5. Always provide accurate and latest information

Remember: This is message #${messageCount}. Be friendly and helpful.`;

        try {
            // 🔥 CALL YOUR CLOUDFLARE WORKER (NO API KEY!)
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
                    action: 'chat'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                let responseText = data.result;
                responseText = responseText.replace(/\*\*/g, '').replace(/\*/g, '').trim();
                
                this.messages.push({
                    role: 'assistant',
                    content: responseText
                });
                
                return responseText;
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('AI Error:', error);
            return "❌ Error\n\nSorry, the AI service is temporarily unavailable. Please try again in a few moments.";
        }
    }
}

const aiAssistant = new AIAssistant();

// ===== SIDEBAR FUNCTIONS =====
function toggleSidebar() {
    if (!sidebar) return;
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        if (mobileOverlay) {
            if (sidebar.classList.contains('open')) {
                mobileOverlay.style.display = 'block';
                setTimeout(() => mobileOverlay.classList.add('active'), 10);
            } else {
                mobileOverlay.classList.remove('active');
                setTimeout(() => mobileOverlay.style.display = 'none', 300);
            }
        }
    } else {
        sidebar.classList.toggle('collapsed');
        const icon = sidebarToggle?.querySelector('i');
        if (icon) {
            icon.className = sidebar.classList.contains('collapsed') ? 'fas fa-chevron-right' : 'fas fa-bars';
        }
    }
}

function closeSidebar() {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
            setTimeout(() => {
                if (mobileOverlay) mobileOverlay.style.display = 'none';
            }, 300);
        }
    }
}

// ===== CHAT MANAGEMENT FUNCTIONS =====
function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    if (currentChatTitle) currentChatTitle.textContent = chat.title;
    
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
            
            if (msg.files && msg.files.length > 0) {
                const fileHtml = msg.files.map(file => `
                    <div class="file-attachment">
                        <i class="fas fa-file"></i>
                        <span>${escapeHtml(file.name)} (${file.size})</span>
                    </div>
                `).join('');
                content = fileHtml + '<br>' + content;
            }
            
            if (content.includes('```')) {
                content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
                    const cleanCode = code.trim();
                    const displayCode = cleanCode
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    
                    return `
                        <div class="code-block-wrapper">
                            <pre><code class="language-${language || 'plaintext'}">${displayCode}</code></pre>
                            <button class="copy-code-btn" onclick="copyCode('${encodeURIComponent(cleanCode)}')">
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
    
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    renderChatHistory();
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}

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
        return `
            <div class="history-item ${isActive ? 'active' : ''}" onclick="window.loadChat('${chat.id}')">
                <i class="fas fa-comment"></i>
                <div class="history-content">
                    <span class="history-title">${escapeHtml(chat.title)}</span>
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
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    
    aiAssistant.clearMessages();
    loadChat(currentChatId);
    if (messageInput) messageInput.focus();
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
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
            content: '❌ Error\n\nSorry, something went wrong. Please try again.', 
            time: Date.now() 
        });
        saveChats();
        loadChat(currentChatId);
    }
    
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
}

// ===== FILE UPLOAD UI =====
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
                    <div>${escapeHtml(file.name)}</div>
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

// ===== AUTH UI =====
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
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            closeSidebar();
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            sendMessage(); 
        });
    }
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            createNewChat();
        });
    }
    
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => { 
            attachedFiles = Array.from(e.target.files); 
            showFilePreviews(); 
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                sendMessage(); 
            }
        });
        
        messageInput.addEventListener('input', function() { 
            this.style.height = 'auto'; 
            this.style.height = Math.min(this.scrollHeight, 120) + 'px'; 
        });
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'far fa-moon';
            }
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (sidebar) {
                sidebar.classList.remove('open');
            }
            if (mobileOverlay) {
                mobileOverlay.style.display = 'none';
                mobileOverlay.classList.remove('active');
            }
        }
    });
}

// ===== APP START =====
document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    setupEventListeners();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-sun';
        }
    }
    
    document.getElementById('sidebarLogout')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut();
        }
    });
    
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            currentUser = user;
            updateUserUI(user);
            loadChats();
        });
    } else {
        loadChats();
    }
    
    window.loadChat = loadChat;
    window.sendMessage = sendMessage;
    window.copyCode = copyCode;
    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
});