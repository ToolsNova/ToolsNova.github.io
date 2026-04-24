// ===== AI CHAT ASSISTANT - WITH LOGOUT CONFIRMATION & ENHANCED AI =====

// ===== GOOGLE ANALYTICS =====
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-EWG766C86Y', {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
});

// ===== FIREBASE CONFIG - SAME AS MAIN SITE =====
if (typeof window.firebaseConfig === 'undefined') {
    window.firebaseConfig = {
        apiKey: "AIzaSyC6rF7Pg7j-NPioZ8Ei70GCj_megjD7UQw",
        authDomain: "toolsnova-user.firebaseapp.com",
        projectId: "toolsnova-user",
        storageBucket: "toolsnova-user.firebasestorage.app",
        messagingSenderId: "907228879212",
        appId: "1:907228879212:web:7e82b085899deb14857b49",
        measurementId: "G-EWG766C86Y"
    };
}

// Initialize Firebase
let auth = null;
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(window.firebaseConfig);
    }
    auth = firebase.auth();
} else {
    console.error('Firebase not loaded');
}

// ===== CONFIGURATION =====
const MAX_GUEST_MESSAGES = 3;
const WORKER_URL = 'https://proxy.toolsnova.workers.dev';

// ===== GUEST MESSAGE TRACKING =====
function canGuestSend() {
    if (!auth) return true;
    const user = auth.currentUser;
    if (user) return true;
    const messagesSent = parseInt(localStorage.getItem('toolsnova_guest_messages') || '0');
    return messagesSent < MAX_GUEST_MESSAGES;
}

function trackGuestMessage() {
    if (!auth) return;
    const user = auth.currentUser;
    if (!user) {
        let messagesSent = parseInt(localStorage.getItem('toolsnova_guest_messages') || '0');
        messagesSent++;
        localStorage.setItem('toolsnova_guest_messages', messagesSent);
        
        const remaining = MAX_GUEST_MESSAGES - messagesSent;
        if (remaining === 0) {
            showNotification('✨ You have used all 3 free messages! Sign up for unlimited access!', 'warning');
            setTimeout(() => { window.location.href = 'signup.html'; }, 2000);
        } else if (remaining > 0) {
            showNotification(`📬 You have ${remaining} free ${remaining === 1 ? 'message' : 'messages'} left. Sign up for unlimited!`, 'info');
        }
    }
}

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

// ===== NOTIFICATION TOAST =====
function showNotification(message, type = 'info') {
    let notification = document.getElementById('customNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'customNotification';
        notification.className = 'custom-notification';
        document.body.appendChild(notification);
    }
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    notification.className = `custom-notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===== LOGOUT CONFIRMATION MODAL =====
function showLogoutConfirmation() {
    let modalOverlay = document.getElementById('logoutModal');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'logoutModal';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
    }
    
    modalOverlay.innerHTML = `
        <div class="modal-container" style="max-width: 380px;">
            <div class="modal-header">
                <h3><i class="fas fa-sign-out-alt" style="color: #f59e0b;"></i> Confirm Logout</h3>
                <button class="modal-close" onclick="closeLogoutModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to logout?</p>
                <p style="color: var(--text-secondary, #6b7280); font-size: 0.85rem; margin-top: 8px;">
                    You will need to login again to access your account.
                </p>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-cancel" onclick="closeLogoutModal()">Cancel</button>
                <button class="modal-btn modal-btn-confirm" id="confirmLogoutBtn">Logout</button>
            </div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    
    const confirmBtn = document.getElementById('confirmLogoutBtn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            closeLogoutModal();
            executeLogout();
        };
    }
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeLogoutModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.innerHTML = '';
        }, 300);
    }
}

function executeLogout() {
    if (auth) {
        auth.signOut().then(() => {
            showNotification('👋 Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }).catch((error) => {
            showNotification('Error logging out: ' + error.message, 'error');
        });
    } else {
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

window.closeLogoutModal = closeLogoutModal;

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
    }).catch(() => showNotification('Failed to copy code', 'error'));
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

// ===== ENHANCED AI ASSISTANT CLASS =====
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
    
    getSystemPrompt(userMessage, files, messageCount, historyText) {
        return `You are ToolsNova AI, a friendly, knowledgeable, and enthusiastic assistant for ToolsNova.com.

## YOUR PERSONALITY
- Be warm, friendly, and conversational (use occasional emojis like 😊, 🎉, 💡, ✅)
- Be enthusiastic and positive about helping
- Be patient and explain things clearly
- Show excitement when users learn something new
- Be honest when you don't know something

## RESPONSE FORMATTING RULES

### For Code:
Use proper syntax highlighting with triple backticks:
\`\`\`javascript
// Your code here
\`\`\`

### For Tables (Mobile Responsive):
ALWAYS wrap tables in a div with class "table-wrapper":
<div class="table-wrapper">
  <table class="data-table">
    <thead>
      <tr><th>Column 1</th><th>Column 2</th></tr>
    </thead>
    <tbody>
      <tr><td data-label="Column 1">Value 1</td><td data-label="Column 2">Value 2</td></tr>
    </tbody>
  </table>
</div>

### For Lists:
Use proper HTML lists:
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>

### For Important Information:
Use blockquotes or bold text:
> 💡 **Tip:** Important information here

### For Steps/Instructions:
Use numbered lists:
<ol>
  <li>First step</li>
  <li>Second step</li>
</ol>

## RESPONSE STRUCTURE
1. **Acknowledge the question** - Show you understood what they're asking
2. **Provide the answer** - Clear, concise, and accurate
3. **Add examples** - If helpful, include practical examples
4. **Offer follow-up** - Ask if they need clarification or have more questions

## CURRENT CONVERSATION
${historyText}

Current message: "${userMessage}"
${files.length > 0 ? `📎 Files attached: ${files.length} file(s)` : ''}
Message number: ${messageCount}

## REMEMBER
- You are ToolsNova AI, representing ToolsNova.com
- Be helpful, accurate, and friendly
- Keep responses concise but informative
- Break long responses into sections
- Never invent information - say "I don't know" if unsure

Now, provide a helpful response to the user's message.`;
    }

    async getResponse(userMessage, files = []) {
        this.messages.push({ role: 'user', content: userMessage });
        const messageCount = this.messages.filter(m => m.role === 'user').length;
        
        let historyText = '';
        this.messages.forEach((msg) => {
            const prefix = msg.role === 'user' ? 'User' : 'ToolsNova AI';
            historyText += `${prefix}: ${msg.content}\n`;
        });

        const systemPrompt = this.getSystemPrompt(userMessage, files, messageCount, historyText);

        try {
            console.log('Sending request to worker...');
            
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
                    action: 'chat'
                })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                let responseText = data.result;
                responseText = responseText.replace(/\*\*/g, '');
                responseText = responseText.replace(/\[|\]/g, '');
                responseText = responseText.trim();
                
                this.messages.push({ role: 'assistant', content: responseText });
                return responseText;
            } else {
                throw new Error(data.error || 'Unknown error from worker');
            }
        } catch (error) {
            console.error('AI Error details:', error);
            
            // Provide a more helpful error message
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                return `⚠️ **Connection Error**

I'm having trouble connecting to the AI service. 

**Possible reasons:**
1. The Cloudflare Worker might be offline
2. Network connectivity issues
3. CORS configuration needs adjustment

**Please try:**
- Refreshing the page
- Checking your internet connection
- Trying again in a few moments

If the problem persists, please contact support. 🔧`;
            }
            
            return `😊 I'm having a bit of trouble right now. Please try again in a moment.`;
        }
    }
}

const aiAssistant = new AIAssistant();

// ===== SIDEBAR FUNCTIONS =====
function toggleSidebar() {
    if (!sidebar) return;
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        let overlay = document.getElementById('mobileOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobileOverlay';
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeSidebar);
        }
        if (sidebar.classList.contains('open')) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    } else {
        sidebar.classList.toggle('collapsed');
        const icon = sidebarToggle?.querySelector('i');
        if (icon) {
            icon.className = sidebar.classList.contains('collapsed') ? 'fas fa-chevron-right' : 'fas fa-bars';
        }
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
}

function closeSidebar() {
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
        const overlay = document.getElementById('mobileOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
}

function restoreSidebarState() {
    if (window.innerWidth > 768) {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
            if (sidebarToggle) {
                const icon = sidebarToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-chevron-right';
            }
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
            const time = msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            let content = msg.content;
            if (msg.files && msg.files.length > 0) {
                const fileHtml = msg.files.map(file => `<div class="file-attachment"><i class="fas fa-file"></i><span>${escapeHtml(file.name)} (${file.size})</span></div>`).join('');
                content = fileHtml + '<br>' + content;
            }
            if (content.includes('```')) {
                content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
                    const cleanCode = code.trim();
                    const displayCode = cleanCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return `<div class="code-block-wrapper"><pre><code class="language-${language || 'plaintext'}">${displayCode}</code></pre><button class="copy-code-btn" onclick="copyCode('${encodeURIComponent(cleanCode)}')"><i class="fas fa-copy"></i> Copy code</button></div>`;
                });
            }
            return `<div class="message ${isUser ? 'user' : ''}"><div class="message-avatar ${isUser ? 'user' : 'ai'}"><i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i></div><div class="message-content"><div class="message-bubble">${content}</div><div class="message-time">${time}</div></div></div>`;
        }).join('');
    }
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    renderChatHistory();
    if (window.innerWidth <= 768) closeSidebar();
}

function loadChats() {
    const saved = localStorage.getItem('toolsnova_chats');
    if (saved) {
        chats = JSON.parse(saved);
        if (chats.length === 0) {
            chats = [{ id: Date.now().toString(), title: 'New Chat', messages: [], createdAt: Date.now() }];
            saveChats();
        }
    } else {
        chats = [{ id: Date.now().toString(), title: 'New Chat', messages: [], createdAt: Date.now() }];
        saveChats();
    }
    if (!currentChatId && chats.length > 0) currentChatId = chats[0].id;
    renderChatHistory();
    if (currentChatId) loadChat(currentChatId);
}

function saveChats() { localStorage.setItem('toolsnova_chats', JSON.stringify(chats)); }

function escapeHtml(text) { 
    const div = document.createElement('div'); 
    div.textContent = text; 
    return div.innerHTML; 
}

function getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return minutes + 'm';
    if (hours < 24) return hours + 'h';
    return days + 'd';
}

function renderChatHistory() {
    if (!chatHistory) return;
    chatHistory.innerHTML = chats.map(chat => {
        const isActive = chat.id === currentChatId;
        const timeAgo = getTimeAgo(chat.createdAt);
        return `<div class="history-item ${isActive ? 'active' : ''}" onclick="window.loadChat('${chat.id}')">
            <i class="fas fa-comment"></i>
            <div class="history-content">
                <span class="history-title">${escapeHtml(chat.title)}</span>
                <span class="history-time">${timeAgo}</span>
            </div>
            <div class="chat-actions" onclick="event.stopPropagation()">
                <button class="chat-action-btn rename" onclick="window.showRenameModal('${chat.id}')" title="Rename">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="chat-action-btn delete" onclick="window.showDeleteModal('${chat.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

function createNewChat() {
    aiAssistant.clearMessages();
    const newChat = { id: Date.now().toString(), title: 'New Chat', messages: [], createdAt: Date.now() };
    chats.unshift(newChat);
    currentChatId = newChat.id;
    saveChats();
    renderChatHistory();
    if (currentChatTitle) currentChatTitle.textContent = 'New Chat';
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
    if (messagesWrapper) { messagesWrapper.innerHTML = ''; messagesWrapper.appendChild(welcomeScreen); }
    if (messageInput) messageInput.focus();
    if (window.innerWidth <= 768) closeSidebar();
}

// ===== CUSTOM RENAME/DELETE MODAL FUNCTIONS =====

window.showRenameModal = function(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    let modalOverlay = document.getElementById('renameModal');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'renameModal';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
    }
    
    modalOverlay.innerHTML = `
        <div class="modal-container" style="max-width: 400px;">
            <div class="modal-header">
                <h3><i class="fas fa-pen" style="color: #3b82f6;"></i> Rename Chat</h3>
                <button class="modal-close" onclick="closeRenameModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <input type="text" id="renameChatInput" placeholder="Enter new chat name" value="${escapeHtml(chat.title)}" autocomplete="off">
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-cancel" onclick="closeRenameModal()">Cancel</button>
                <button class="modal-btn modal-btn-confirm" id="confirmRenameBtn">Save Changes</button>
            </div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    
    const input = document.getElementById('renameChatInput');
    const confirmBtn = document.getElementById('confirmRenameBtn');
    
    if (input) {
        input.focus();
        input.select();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') confirmRenameChat(chatId);
        });
    }
    if (confirmBtn) confirmBtn.onclick = () => confirmRenameChat(chatId);
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeRenameModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeRenameModal() {
    const modal = document.getElementById('renameModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.innerHTML = ''; }, 300);
    }
}

function confirmRenameChat(chatId) {
    const input = document.getElementById('renameChatInput');
    const newTitle = input ? input.value.trim() : '';
    
    if (newTitle && newTitle.length > 0) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            chat.title = newTitle.substring(0, 50);
            saveChats();
            renderChatHistory();
            if (currentChatId === chatId && currentChatTitle) currentChatTitle.textContent = chat.title;
            showNotification('✏️ Chat renamed successfully!', 'success');
        }
    } else {
        showNotification('Please enter a valid chat name', 'error');
        return;
    }
    closeRenameModal();
}

window.showDeleteModal = function(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    if (chats.length === 1) {
        showNotification('Cannot delete the last chat', 'warning');
        return;
    }
    
    let modalOverlay = document.getElementById('deleteModal');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'deleteModal';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
    }
    
    modalOverlay.innerHTML = `
        <div class="modal-container" style="max-width: 400px;">
            <div class="modal-header">
                <h3><i class="fas fa-trash-alt" style="color: #ef4444;"></i> Delete Chat</h3>
                <button class="modal-close" onclick="closeDeleteModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete "<strong>${escapeHtml(chat.title)}</strong>"?</p>
                <div class="warning-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>This action cannot be undone. All messages will be permanently deleted.</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-cancel" onclick="closeDeleteModal()">Cancel</button>
                <button class="modal-btn modal-btn-danger" id="confirmDeleteBtn">Delete Chat</button>
            </div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) confirmBtn.onclick = () => confirmDeleteChat(chatId);
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeDeleteModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.innerHTML = ''; }, 300);
    }
}

function confirmDeleteChat(chatId) {
    const wasCurrent = currentChatId === chatId;
    chats = chats.filter(c => c.id !== chatId);
    if (wasCurrent) {
        currentChatId = chats[0].id;
        loadChat(currentChatId);
    }
    saveChats();
    renderChatHistory();
    showNotification('🗑️ Chat deleted successfully', 'success');
    closeDeleteModal();
}

window.renameChat = function(chatId) { window.showRenameModal(chatId); };
window.deleteChat = function(chatId) { window.showDeleteModal(chatId); };

// ===== SEND MESSAGE =====
async function sendMessage() {
    if (!messageInput) return;
    const text = messageInput.value.trim();
    if (!text && attachedFiles.length === 0) return;
    if (!canGuestSend()) {
        showNotification('✨ You have used all 3 free messages! Sign up for unlimited access!', 'warning');
        setTimeout(() => { window.location.href = 'signup.html'; }, 2000);
        return;
    }
    
    let currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) {
        const newChat = { id: Date.now().toString(), title: text.substring(0, 30) + (text.length > 30 ? '...' : ''), messages: [], createdAt: Date.now() };
        chats.unshift(newChat);
        currentChatId = newChat.id;
        currentChat = newChat;
        saveChats();
        renderChatHistory();
        if (currentChatTitle) currentChatTitle.textContent = currentChat.title;
        aiAssistant.clearMessages();
    }
    
    let processedFiles = [];
    if (attachedFiles.length > 0) processedFiles = await processFiles(attachedFiles);
    currentChat.messages.push({ role: 'user', content: text || '📎 File upload', files: processedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })), time: Date.now() });
    
    if (currentChat.messages.length === 1 && currentChat.title === 'New Chat') {
        const titleText = text || processedFiles[0]?.name || 'New Chat';
        currentChat.title = titleText.substring(0, 30) + (titleText.length > 30 ? '...' : '');
        if (currentChatTitle) currentChatTitle.textContent = currentChat.title;
        renderChatHistory();
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
        currentChat.messages.push({ role: 'assistant', content: response, time: Date.now() });
        saveChats();
        loadChat(currentChatId);
        trackGuestMessage();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('typingIndicator')?.remove();
        currentChat.messages.push({ role: 'assistant', content: '❌ Error\n\nSorry, something went wrong. Please try again.', time: Date.now() });
        saveChats();
        loadChat(currentChatId);
    }
    
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
}

function showFilePreviews() {
    if (!filePreviewContainer) return;
    if (attachedFiles.length === 0) { filePreviewContainer.innerHTML = ''; return; }
    filePreviewContainer.innerHTML = attachedFiles.map((file, index) => 
        `<div class="file-preview"><div class="file-preview-info"><i class="fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file'}"></i><div><div>${escapeHtml(file.name)}</div><div>${(file.size / 1024).toFixed(1)} KB</div></div></div><button class="remove-file" onclick="window.removeFile(${index})"><i class="fas fa-times"></i></button></div>`
    ).join('');
}

window.removeFile = function(index) { 
    attachedFiles.splice(index, 1); 
    showFilePreviews(); 
    if (fileInput) fileInput.value = ''; 
};

function updateUserUI(user) {
    const authLinks = document.getElementById('sidebarAuth');
    const userMenu = document.getElementById('userInfo');
    const userName = document.getElementById('sidebarUserName');
    if (authLinks && userMenu) {
        if (user) {
            authLinks.style.display = 'none';
            userMenu.style.display = 'flex';
            if (userName && user.email) userName.textContent = user.email.split('@')[0];
        } else {
            authLinks.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
}

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
    
    if (!document.getElementById('mobileOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'mobileOverlay';
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeSidebar);
    }
    restoreSidebarState();
}

function setupEventListeners() {
    if (sidebarToggle) sidebarToggle.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); });
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); });
    if (sendBtn) sendBtn.addEventListener('click', (e) => { e.preventDefault(); sendMessage(); });
    if (newChatBtn) newChatBtn.addEventListener('click', () => createNewChat());
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => { attachedFiles = Array.from(e.target.files); showFilePreviews(); });
    }
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
        messageInput.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 120) + 'px'; });
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('i');
            if (icon) icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'far fa-moon';
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }
    
    const sidebarLogoutBtn = document.getElementById('sidebarLogout');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLogoutConfirmation();
        });
    }
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (sidebar) sidebar.classList.remove('open');
            const overlay = document.getElementById('mobileOverlay');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
            restoreSidebarState();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    setupEventListeners();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        if (themeToggle) { const icon = themeToggle.querySelector('i'); if (icon) icon.className = 'fas fa-sun'; }
    }
    
    if (auth) {
        auth.onAuthStateChanged((user) => {
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
    window.showLogoutConfirmation = showLogoutConfirmation;
    window.closeRenameModal = closeRenameModal;
    window.closeDeleteModal = closeDeleteModal;
});

console.log('🤖 AI Chat Assistant initialized!');