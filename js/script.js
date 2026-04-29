// ===== GOOGLE ANALYTICS =====
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-EWG766C86Y', {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
});

// ===== TOOLSNOVA - COMPLETE WITH FIREBASE AUTH =====

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC6rF7Pg7j-NPioZ8Ei70GCj_megjD7UQw",
    authDomain: "toolsnova-user.firebaseapp.com",
    projectId: "toolsnova-user",
    storageBucket: "toolsnova-user.firebasestorage.app",
    messagingSenderId: "907228879212",
    appId: "1:907228879212:web:7e82b085899deb14857b49",
    measurementId: "G-EWG766C86Y"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ===== DOM ELEMENTS =====
const popularGrid = document.getElementById('popularToolsGrid');
const searchGrid = document.getElementById('searchResultsGrid');
const mediaGrid = document.getElementById('mediaToolsGrid');
const aiGrid = document.getElementById('aiToolsGrid');
const imageGrid = document.getElementById('imageToolsGrid');
const codeGrid = document.getElementById('codeToolsGrid');
const calculatorToolsGrid = document.getElementById('calculatorToolsGrid');
const searchInput = document.getElementById('mainSearchInput');
const popularSection = document.getElementById('popularToolsSection');
const searchSection = document.getElementById('searchResultsSection');
const clearBtn = document.getElementById('clearSearch');
const resultCount = document.getElementById('resultCount');
const themeToggle = document.querySelector('.theme-toggle');
const mobileBtn = document.querySelector('.mobile-menu-btn');
const usesLeft = document.getElementById('usesLeft');
const usageCounter = document.getElementById('usageCounter');
const welcomeMessage = document.getElementById('welcomeMessage');
const userBadge = document.getElementById('userBadge');
const authLinks = document.getElementById('authLinks');
const userMenu = document.getElementById('userMenu');
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');
const footerLogout = document.getElementById('footerLogout');
const footerUserInfo = document.getElementById('footerUserInfo');
const footerGuestInfo = document.getElementById('footerGuestInfo');
const footerLogin = document.getElementById('footerLogin');
const footerSignup = document.getElementById('footerSignup');

// ===== GUEST USAGE TRACKING - FIXED VERSION =====
const maxGuestUses = 3;

// Helper function to get current guest uses (unified)
function getCurrentGuestUses() {
    let uses1 = parseInt(localStorage.getItem('toolsnova_guest_uses')) || 0;
    let uses2 = parseInt(localStorage.getItem('toolsnova_tools_used')) || 0;
    // Return the higher value to be safe, and sync them
    const total = Math.max(uses1, uses2);
    if (uses1 !== total || uses2 !== total) {
        localStorage.setItem('toolsnova_guest_uses', total);
        localStorage.setItem('toolsnova_tools_used', total);
    }
    return total;
}

// Update global variable
let guestUses = getCurrentGuestUses();

// ===== TOOLS DATABASE - ONLY TOOLS THAT EXIST IN tools.html =====
const tools = [
    { id: 1, name: "YouTube Thumbnail Downloader", desc: "Download any video thumbnail in HD quality", icon: "fa-brands fa-youtube", cat: "media", popular: true, url: "tools/yt-thumbnail.html" },
    { id: 2, name: "YouTube to MP3", desc: "Convert YouTube videos to MP3 audio", icon: "fa-solid fa-music", cat: "media", popular: true, url: "tools/video-to-mp3.html" },
    { id: 3, name: "YouTube Transcript Generator", desc: "Get transcripts from any YouTube video", icon: "fa-solid fa-closed-captioning", cat: "media", popular: true, url: "tools/yt-transcript.html" },
    { id: 4, name: "Image Compressor", desc: "Reduce image file size without losing quality", icon: "fa-solid fa-compress", cat: "media", popular: false, url: "tools/image-compressor.html" },
    { id: 5, name: "QR Code Generator", desc: "Create QR codes for URLs, text, WiFi", icon: "fa-solid fa-qrcode", cat: "media", popular: true, url: "tools/qr-generator.html" },
    { id: 6, name: "AI Chat Assistant", desc: "Chat with AI assistant", icon: "fa-solid fa-comment-dots", cat: "ai", popular: true, url: "ai-assistant.html" },
    { id: 7, name: "Background Remover", desc: "Remove image backgrounds with AI", icon: "fa-solid fa-eraser", cat: "ai", popular: true, url: "tools/background-remover.html" },
    { id: 8, name: "AI Content Detector", desc: "Check if text was written by AI", icon: "fa-solid fa-robot", cat: "ai", popular: true, url: "tools/ai-content-detector.html" },
    { id: 9, name: "AI Grammar Checker", desc: "Fix grammar and spelling mistakes", icon: "fa-solid fa-spell-check", cat: "ai", popular: false, url: "tools/ai-grammar-checker.html" },
    { id: 10, name: "AI Text Summarizer", desc: "Summarize long articles and texts", icon: "fa-solid fa-compress-alt", cat: "ai", popular: false, url: "tools/ai-text-summarizer.html" },
    { id: 11, name: "Image Editor", desc: "Crop, rotate, adjust images", icon: "fa-solid fa-paint-brush", cat: "image", popular: true, url: "tools/image-editor.html" },
    { id: 12, name: "Image to PNG Converter", desc: "Convert images to PNG format", icon: "fa-solid fa-file-image", cat: "image", popular: true, url: "tools/image-to-png.html" },
    { id: 13, name: "Screenshot to Text (OCR)", desc: "Extract text from images", icon: "fa-solid fa-text", cat: "image", popular: true, url: "tools/ocr.html" },
    { id: 14, name: "Brightness & Contrast", desc: "Adjust image brightness and contrast", icon: "fa-solid fa-sun", cat: "image", popular: false, url: "tools/brightness-contrast.html" },
    { id: 15, name: "Crop & Rotate", desc: "Crop, rotate, and flip images", icon: "fa-solid fa-crop", cat: "image", popular: true, url: "tools/crop-rotate.html" },
    { id: 16, name: "Resize Image", desc: "Change image dimensions", icon: "fa-solid fa-expand", cat: "image", popular: true, url: "tools/resize-image.html" },
    { id: 17, name: "Python Editor", desc: "Write and run Python code online", icon: "fa-brands fa-python", cat: "code", popular: true, url: "tools/python-editor.html" },
    { id: 18, name: "Live HTML/CSS/JS Editor", desc: "Live preview HTML, CSS, JavaScript", icon: "fa-brands fa-html5", cat: "code", popular: true, url: "tools/live-editor.html" },
    { id: 19, name: "JSON Formatter", desc: "Format and validate JSON data", icon: "fa-solid fa-brackets-curly", cat: "code", popular: true, url: "tools/json-formatter.html" },
    { id: 20, name: "CSS Minifier", desc: "Compress CSS code", icon: "fa-brands fa-css3", cat: "code", popular: false, url: "tools/css-minifier.html" },
    { id: 21, name: "HTML Preview", desc: "Live HTML rendering", icon: "fa-brands fa-html5", cat: "code", popular: false, url: "tools/html-preview.html" },
    { id: 22, name: "Age Calculator", desc: "Calculate exact age in years, months, days", icon: "fa-solid fa-cake-candles", cat: "calc", popular: true, url: "tools/age-calculator.html" },
    { id: 23, name: "Discount Calculator", desc: "Calculate sale prices and discounts", icon: "fa-solid fa-tags", cat: "calc", popular: true, url: "tools/discount-calculator.html" },
    { id: 24, name: "Currency Converter", desc: "Convert between currencies with live rates", icon: "fa-solid fa-coins", cat: "calc", popular: true, url: "tools/currency-converter.html" },
    { id: 25, name: "BMI Calculator", desc: "Calculate Body Mass Index", icon: "fa-solid fa-weight-scale", cat: "calc", popular: false, url: "tools/bmi-calculator.html" }
];

// ===== DISPLAY TOOLS =====
function displayTools(grid, items) {
    if (!grid) return;
    let html = '';
    for (let i = 0; i < items.length; i++) {
        html += `
            <div class="tool-card">
                <div class="tool-icon"><i class="${items[i].icon}"></i></div>
                <h3>${items[i].name}</h3>
                <p>${items[i].desc}</p>
                <div class="tool-meta">
                    <span class="tool-category">${items[i].cat}</span>
                    <a href="${items[i].url}" class="tool-link" onclick="return handleToolClick(event, ${items[i].id})">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }
    grid.innerHTML = html;
}

// ===== CHECK IF USER CAN USE TOOL =====
function canUseTool() {
    const user = auth.currentUser;
    // Logged in users have unlimited access
    if (user) return true;
    
    // Get current guest uses
    const currentUses = getCurrentGuestUses();
    return currentUses < maxGuestUses;
}

// ===== TRACK TOOL USAGE (only for guests) =====
function trackToolUse() {
    const user = auth.currentUser;
    if (user) return true; // No tracking for logged in users
    
    // Get current guest uses
    let currentUses = getCurrentGuestUses();
    
    if (currentUses >= maxGuestUses) {
        console.log('Guest limit reached - blocking usage');
        return false;
    }
    
    // Increment and save to BOTH keys for compatibility
    const newUses = currentUses + 1;
    localStorage.setItem('toolsnova_guest_uses', newUses);
    localStorage.setItem('toolsnova_tools_used', newUses);
    
    // Update global variable and display
    guestUses = newUses;
    updateGuestDisplay();
    
    console.log(`Guest use tracked: ${newUses}/${maxGuestUses}`);
    
    // Show warning when reaching limit
    if (newUses === maxGuestUses) {
        showNotification('Last free use! Sign up for unlimited access.', 'warning');
    }
    
    return true;
}

// ===== UPDATE GUEST DISPLAY =====
function updateGuestDisplay() {
    const currentUses = getCurrentGuestUses();
    const remaining = Math.max(0, maxGuestUses - currentUses);
    
    // Update global variable
    guestUses = currentUses;
    
    // Update UI elements
    if (usesLeft) usesLeft.textContent = remaining;
    if (usageCounter) usageCounter.textContent = `${remaining}/3 uses left`;
    
    // Update user badge
    if (userBadge && !auth.currentUser) {
        if (remaining === 0) {
            userBadge.textContent = 'Limit reached - Sign up!';
            userBadge.style.background = '#ef4444';
        } else {
            userBadge.textContent = `Guest: ${remaining}/3 uses left`;
            userBadge.style.background = '#f59e0b';
        }
    }
}

// ===== HANDLE TOOL CLICK =====
window.handleToolClick = function(event, toolId) {
    if (!canUseTool()) {
        event.preventDefault();
        showNotification('You have used all 3 guest tries. Please sign up for unlimited access!', 'error');
        setTimeout(() => { window.location.href = 'signup.html'; }, 2000);
        return false;
    }
    return true;
};

// ===== LOAD TOOLS =====
const popularTools = tools.filter(t => t.popular).slice(0, 8);
if (popularGrid) displayTools(popularGrid, popularTools);
if (mediaGrid) displayTools(mediaGrid, tools.filter(t => t.cat === 'media').slice(0, 3));
if (aiGrid) displayTools(aiGrid, tools.filter(t => t.cat === 'ai').slice(0, 3));
if (imageGrid) displayTools(imageGrid, tools.filter(t => t.cat === 'image').slice(0, 3));
if (codeGrid) displayTools(codeGrid, tools.filter(t => t.cat === 'code').slice(0, 3));
if (calculatorToolsGrid) displayTools(calculatorToolsGrid, tools.filter(t => t.cat === 'calc').slice(0, 3));

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    let notification = document.getElementById('globalNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'globalNotification';
        notification.className = 'global-notification';
        document.body.appendChild(notification);
    }
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    notification.className = `global-notification ${type} show`;
    
    setTimeout(() => { notification.classList.remove('show'); }, 3000);
}

// Add notification styles
if (!document.getElementById('notificationStyle')) {
    const notificationStyle = document.createElement('style');
    notificationStyle.id = 'notificationStyle';
    notificationStyle.textContent = `
        .global-notification {
            position: fixed;
            top: 80px;
            right: 30px;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
            z-index: 10002;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-size: 0.9rem;
            font-weight: 500;
            min-width: 280px;
        }
        .global-notification.show { transform: translateX(0); }
        .global-notification.success { border-left: 4px solid #10b981; }
        .global-notification.success i { color: #10b981; }
        .global-notification.error { border-left: 4px solid #ef4444; }
        .global-notification.error i { color: #ef4444; }
        .global-notification.warning { border-left: 4px solid #f59e0b; }
        .global-notification.warning i { color: #f59e0b; }
        @media (max-width: 768px) {
            .global-notification { top: 70px; right: 20px; left: 20px; transform: translateY(-100px); min-width: auto; }
            .global-notification.show { transform: translateY(0); }
        }
    `;
    document.head.appendChild(notificationStyle);
}

// ===== LOGOUT WITH CONFIRMATION POPUP =====
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
                <h3><i class="fas fa-sign-out-alt" style="color: var(--warning);"></i> Confirm Logout</h3>
                <button class="modal-close" onclick="closeLogoutModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to logout?</p>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px;">You will need to login again to access your account.</p>
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
        if (e.key === 'Escape') { closeLogoutModal(); document.removeEventListener('keydown', handleEscape); }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.innerHTML = ''; }, 300);
    }
}

function executeLogout() {
    auth.signOut().then(() => {
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    }).catch((error) => {
        showNotification('Error logging out: ' + error.message, 'error');
    });
}

window.closeLogoutModal = closeLogoutModal;

// ===== DELETE ACCOUNT FUNCTION =====
window.deleteUserAccount = function() {
    const user = auth.currentUser;
    if (!user) {
        showNotification('You need to be logged in to delete your account.', 'error');
        return;
    }
    
    let modalOverlay = document.getElementById('deleteAccountModal');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'deleteAccountModal';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
    }
    
    modalOverlay.innerHTML = `
        <div class="modal-container" style="max-width: 450px;">
            <div class="modal-header" style="border-bottom-color: #ef4444;">
                <h3><i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i> Delete Account - Permanent!</h3>
                <button class="modal-close" onclick="closeDeleteAccountModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px;">Are you sure you want to permanently delete your account?</p>
                <div class="warning-text" style="background: rgba(239,68,68,0.15); margin-bottom: 16px;">
                    <i class="fas fa-skull-crossbones"></i> <strong>This action CANNOT be undone!</strong>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">The following will be deleted:</p>
                <ul style="margin: 8px 0 16px 20px; color: var(--text-secondary); font-size: 0.85rem;">
                    <li>• Your account and email address</li>
                    <li>• All your chat history</li>
                    <li>• All your saved data</li>
                </ul>
                <div class="warning-text" style="margin-top: 16px;">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Type <strong style="color: #ef4444;">DELETE</strong> to confirm</span>
                </div>
                <input type="text" id="deleteConfirmInput" placeholder="Type DELETE to confirm" 
                    style="width: 100%; margin-top: 16px; padding: 12px 16px; border: 2px solid var(--border); border-radius: 12px; 
                    background: var(--bg-primary); color: var(--text-primary); font-size: 1rem; outline: none;">
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-cancel" onclick="closeDeleteAccountModal()">Cancel</button>
                <button class="modal-btn modal-btn-danger" id="confirmDeleteBtn" disabled style="opacity: 0.5;">Delete Account</button>
            </div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    
    const confirmInput = document.getElementById('deleteConfirmInput');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (confirmInput && confirmBtn) {
        confirmInput.oninput = (e) => {
            if (e.target.value === 'DELETE') {
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = '1';
            } else {
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.5';
            }
        };
        
        confirmBtn.onclick = () => {
            if (confirmInput.value === 'DELETE') {
                closeDeleteAccountModal();
                executeAccountDeletion();
            }
        };
    }
}

function closeDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.innerHTML = ''; }, 300);
    }
}

function executeAccountDeletion() {
    const user = auth.currentUser;
    if (!user) return;
    
    showNotification('Authenticating...', 'info');
    
    const password = prompt("For security, enter your password to confirm deletion:");
    if (!password) {
        showNotification('Password required to delete account', 'error');
        return;
    }
    
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
    
    user.reauthenticateWithCredential(credential)
        .then(() => {
            showNotification('Deleting your account...', 'info');
            return user.delete();
        })
        .then(() => {
            localStorage.clear();
            showNotification('Account deleted successfully!', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        })
        .catch((error) => {
            if (error.code === 'auth/wrong-password') {
                showNotification('Wrong password!', 'error');
            } else {
                showNotification('Error: ' + error.message, 'error');
            }
        });
}

window.closeDeleteAccountModal = closeDeleteAccountModal;

// ===== AUTH STATE =====
auth.onAuthStateChanged((user) => {
    if (user) {
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) { userMenu.style.display = 'flex'; if (userGreeting) userGreeting.textContent = `Hi, ${user.email.split('@')[0]}`; }
        if (footerLogin) footerLogin.style.display = 'none';
        if (footerSignup) footerSignup.style.display = 'none';
        if (footerLogout) footerLogout.style.display = 'block';
        if (footerGuestInfo) footerGuestInfo.style.display = 'none';
        if (footerUserInfo) footerUserInfo.style.display = 'flex';
        if (usageCounter) usageCounter.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'inline-flex';
        if (userBadge) userBadge.textContent = 'Unlimited Access';
    } else {
        if (authLinks) authLinks.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (footerLogin) footerLogin.style.display = 'block';
        if (footerSignup) footerSignup.style.display = 'block';
        if (footerLogout) footerLogout.style.display = 'none';
        if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
        if (footerUserInfo) footerUserInfo.style.display = 'none';
        if (usageCounter) usageCounter.style.display = 'inline-flex';
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        updateGuestDisplay();
    }
});

// ===== LOGOUT BUTTONS =====
if (logoutBtn) logoutBtn.onclick = (e) => { e.preventDefault(); showLogoutConfirmation(); };
if (footerLogout) footerLogout.onclick = (e) => { e.preventDefault(); showLogoutConfirmation(); };

// ===== SEARCH =====
if (searchInput) {
    searchInput.oninput = function() {
        const value = this.value.toLowerCase().trim();
        if (value.length > 0) {
            const results = tools.filter(tool => tool.name.toLowerCase().includes(value) || tool.desc.toLowerCase().includes(value));
            if (resultCount) resultCount.textContent = `(${results.length} tools)`;
            if (results.length > 0) { displayTools(searchGrid, results); } 
            else { searchGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px;"><i class="fas fa-search" style="font-size: 3rem;"></i><h3>No tools found</h3></div>'; }
            if (popularSection) popularSection.style.display = 'none';
            if (searchSection) searchSection.style.display = 'block';
        } else {
            if (popularSection) popularSection.style.display = 'block';
            if (searchSection) searchSection.style.display = 'none';
        }
    };
}

if (clearBtn) {
    clearBtn.onclick = () => {
        if (searchInput) searchInput.value = '';
        if (popularSection) popularSection.style.display = 'block';
        if (searchSection) searchSection.style.display = 'none';
    };
}

// ===== DARK MODE =====
if (themeToggle) {
    themeToggle.onclick = function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'far fa-moon';
        localStorage.setItem('toolsnova_darkmode', document.body.classList.contains('dark-mode'));
    };
}
if (localStorage.getItem('toolsnova_darkmode') === 'true') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.querySelector('i').className = 'fas fa-sun';
}

// ===== MOBILE MENU =====
if (mobileBtn) {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    const menu = document.createElement('div');
    menu.className = 'mobile-menu';
    document.body.appendChild(overlay);
    document.body.appendChild(menu);
    
    function updateMobileMenu() {
        const user = auth.currentUser;
        const isInTools = window.location.pathname.includes('/tools/');
        const basePath = isInTools ? '../' : './';
        
        let menuLinks = `
        <div class="mobile-menu-header">
        <div class="mobile-menu-logo">
            <i class="fas fa-star"></i>
            <span>ToolsNova</span>
        </div>
        <button class="mobile-menu-close"><i class="fas fa-times"></i></button>
    </div>
    <div class="mobile-menu-links">
        <a href="${basePath}index.html" class="mobile-link">Home</a>
        <a href="${basePath}ai-assistant.html" class="mobile-link">AI Assistant</a>
        <a href="${basePath}tools.html" class="mobile-link">All Tools</a>
        <a href="${basePath}changelog.html" class="mobile-link">What's New!</a>
        <div class="mobile-menu-category-title">For You! 🔥</div>
        <a href="${basePath}tools.html#media" class="mobile-link">📹 Media Tools</a>
        <a href="${basePath}tools.html#ai" class="mobile-link">🤖 AI Tools</a>
        <a href="${basePath}tools.html#image" class="mobile-link">🎨 Image Editor</a>
        <a href="${basePath}tools.html#code" class="mobile-link">💻 Code Editors</a>
        <a href="${basePath}tools.html#calc" class="mobile-link">🧮 Calculators</a>
        <div class="mobile-menu-divider"></div>
        <a href="${basePath}about.html" class="mobile-link">About</a>
        <a href="${basePath}privacy.html" class="mobile-link">Privacy</a>
        <a href="${basePath}terms.html" class="mobile-link">Terms</a>
        <a href="${basePath}contact.html" class="mobile-link">Contact</a>
        <div class="mobile-menu-divider"></div>
        <button class="mobile-link" id="mobileDarkToggle"><i class="fas fa-moon"></i> Dark Mode</button>
        <div class="mobile-menu-divider"></div>
        `;
        
        if (user) {
            menuLinks += `<div class="mobile-user-info"><i class="fas fa-user"></i><span>${user.email}</span></div>
                <a href="#" class="mobile-link mobile-logout" id="mobileLogout"><i class="fas fa-sign-out-alt"></i> Logout</a>
                <a href="#" class="mobile-link mobile-delete" id="mobileDeleteAccount"><i class="fas fa-trash-alt"></i> Delete Account</a>`;
        } else {
            menuLinks += `<a href="${basePath}login.html" class="mobile-link">Login</a>
                <a href="${basePath}signup.html" class="mobile-link mobile-cta">Sign Up</a>`;
        }
        menuLinks += `</div>`;
        menu.innerHTML = menuLinks;
        
        document.querySelector('.mobile-menu-close')?.addEventListener('click', closeMenu);
        document.getElementById('mobileLogout')?.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); showLogoutConfirmation(); });
        document.getElementById('mobileDeleteAccount')?.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); window.deleteUserAccount(); });
        
        const mobileDarkToggle = document.getElementById('mobileDarkToggle');
        if (mobileDarkToggle) {
            mobileDarkToggle.onclick = (e) => {
                e.preventDefault();
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isDark);
                mobileDarkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
                const mainIcon = document.querySelector('.theme-toggle i');
                if (mainIcon) mainIcon.className = isDark ? 'fas fa-sun' : 'far fa-moon';
            };
            if (document.body.classList.contains('dark-mode')) mobileDarkToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }
    
    updateMobileMenu();
    auth.onAuthStateChanged(() => updateMobileMenu());
    
    function closeMenu() { menu.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; }
    overlay.onclick = closeMenu;
    
    let isDragging = false, moved = false, offsetX = 0, offsetY = 0;
    const savedX = localStorage.getItem('btn_x'), savedY = localStorage.getItem('btn_y');
    if (savedX && savedY) {
        let x = parseInt(savedX), y = parseInt(savedY);
        const maxX = window.innerWidth - mobileBtn.offsetWidth, maxY = window.innerHeight - mobileBtn.offsetHeight;
        mobileBtn.style.left = Math.max(0, Math.min(x, maxX)) + "px";
        mobileBtn.style.top = Math.max(0, Math.min(y, maxY)) + "px";
        mobileBtn.style.right = "auto";
    }
    
    function openMenu() { menu.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    window.openMenu = openMenu;
    
    mobileBtn.ontouchstart = (e) => { isDragging = true; moved = false; const touch = e.touches[0]; offsetX = touch.clientX - mobileBtn.offsetLeft; offsetY = touch.clientY - mobileBtn.offsetTop; };
    mobileBtn.ontouchmove = (e) => { if (!isDragging) return; moved = true; const touch = e.touches[0]; let x = touch.clientX - offsetX, y = touch.clientY - offsetY; const maxX = window.innerWidth - mobileBtn.offsetWidth, maxY = window.innerHeight - mobileBtn.offsetHeight; mobileBtn.style.left = Math.max(0, Math.min(x, maxX)) + "px"; mobileBtn.style.top = Math.max(0, Math.min(y, maxY)) + "px"; mobileBtn.style.right = "auto"; };
    mobileBtn.ontouchend = (e) => { isDragging = false; if (!moved) { e.preventDefault(); openMenu(); } const rect = mobileBtn.getBoundingClientRect(); let finalX = rect.left < window.innerWidth / 2 ? 10 : window.innerWidth - mobileBtn.offsetWidth - 10; mobileBtn.style.left = finalX + "px"; localStorage.setItem('btn_x', mobileBtn.getBoundingClientRect().left); localStorage.setItem('btn_y', mobileBtn.getBoundingClientRect().top); };
    mobileBtn.onclick = () => { if (!isDragging && !moved) openMenu(); };
}

// ===== DESKTOP SIDEBAR =====
let sidebarInitialized = false;
function initDesktopSidebar() {
    if (sidebarInitialized || window.innerWidth <= 768) return;
    let sidebar = document.getElementById('desktopSidebar');
    let toggleBtn = document.querySelector('.desktop-sidebar-toggle');
    if (!sidebar) { sidebar = document.createElement('div'); sidebar.className = 'desktop-sidebar'; sidebar.id = 'desktopSidebar'; document.body.appendChild(sidebar); }
    if (!toggleBtn) { toggleBtn = document.createElement('button'); toggleBtn.className = 'desktop-sidebar-toggle'; toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'; document.body.appendChild(toggleBtn); }
    
    const savedState = localStorage.getItem('desktopSidebarOpen');
    const isSidebarOpen = savedState !== 'false';
    if (isSidebarOpen) { sidebar.classList.remove('collapsed'); toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'; document.body.classList.remove('sidebar-collapsed'); }
    else { sidebar.classList.add('collapsed'); toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>'; document.body.classList.add('sidebar-collapsed'); }
    sidebarInitialized = true;
    
    function toggleSidebarFunc() {
        const isOpen = !sidebar.classList.contains('collapsed');
        if (isOpen) { sidebar.classList.add('collapsed'); toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>'; document.body.classList.add('sidebar-collapsed'); localStorage.setItem('desktopSidebarOpen', 'false'); }
        else { sidebar.classList.remove('collapsed'); toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'; document.body.classList.remove('sidebar-collapsed'); localStorage.setItem('desktopSidebarOpen', 'true'); }
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }
    toggleBtn.onclick = toggleSidebarFunc;
    
    function updateSidebarContent() {
        const user = auth.currentUser;
        const currentPath = window.location.pathname;
        const isInTools = currentPath.includes('/tools/');
        const basePath = isInTools ? '../' : './';
        
        function isActive(href) {
            if (href === 'index.html' && (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('index.html'))) return true;
            if (href === 'ai-assistant.html' && (currentPath.includes('ai-assistant') || currentPath.includes('ai-assistant.html'))) return true;
            if (href === 'tools.html' && (currentPath.includes('tools.html') || currentPath === '/tools.html')) return true;
            if (href === 'changelog.html' && (currentPath.includes('changelog') || currentPath.includes('changelog.html'))) return true;
            if (href === 'about.html' && (currentPath.includes('about') || currentPath.includes('about.html'))) return true;
            if (href === 'privacy.html' && (currentPath.includes('privacy') || currentPath.includes('privacy.html'))) return true;
            if (href === 'terms.html' && (currentPath.includes('terms') || currentPath.includes('terms.html'))) return true;
            if (href === 'contact.html' && (currentPath.includes('contact') || currentPath.includes('contact.html'))) return true;
            return false;
        }
        
        let html = `<div class="desktop-sidebar-header"><div class="desktop-sidebar-logo"><i class="fas fa-star"></i><span>ToolsNova</span></div></div>
            <div class="desktop-sidebar-links">
            <a href="${basePath}index.html" class="desktop-sidebar-link ${isActive('index.html') ? 'active' : ''}" data-tooltip="Home"><i class="fas fa-home"></i><span>Home</span></a>
            <a href="${basePath}ai-assistant.html" class="desktop-sidebar-link ${isActive('ai-assistant.html') ? 'active' : ''}" data-tooltip="AI Assistant"><i class="fas fa-robot"></i><span>AI Assistant</span></a>
            <a href="${basePath}tools.html" class="desktop-sidebar-link ${isActive('tools.html') ? 'active' : ''}" data-tooltip="All Tools"><i class="fas fa-tools"></i><span>All Tools</span></a>
            <a href="${basePath}changelog.html" class="desktop-sidebar-link ${isActive('changelog.html') ? 'active' : ''}" data-tooltip="What's New"><i class="fa-solid fa-rocket"></i><span>What's New!</span></a>
            <div class="desktop-sidebar-category-title">For You! 🔥</div>
            <a href="${basePath}tools.html#media" class="desktop-sidebar-link" data-tooltip="Media Tools"><i class="fas fa-video"></i><span>Media Tools</span></a>
            <a href="${basePath}tools.html#ai" class="desktop-sidebar-link" data-tooltip="AI Tools"><i class="fa-solid fa-gear"></i><span>AI Tools</span></a>
            <a href="${basePath}tools.html#image" class="desktop-sidebar-link" data-tooltip="Image Editor"><i class="fas fa-paint-brush"></i><span>Image Editor</span></a>
            <a href="${basePath}tools.html#code" class="desktop-sidebar-link" data-tooltip="Code Editors"><i class="fas fa-code"></i><span>Code Editors</span></a>
            <a href="${basePath}tools.html#calc" class="desktop-sidebar-link" data-tooltip="Calculators"><i class="fas fa-calculator"></i><span>Calculators</span></a>
            <div class="desktop-sidebar-divider"></div>
            <a href="${basePath}about.html" class="desktop-sidebar-link ${isActive('about.html') ? 'active' : ''}" data-tooltip="About"><i class="fas fa-info-circle"></i><span>About</span></a>
            <a href="${basePath}privacy.html" class="desktop-sidebar-link ${isActive('privacy.html') ? 'active' : ''}" data-tooltip="Privacy"><i class="fas fa-shield-alt"></i><span>Privacy</span></a>
            <a href="${basePath}terms.html" class="desktop-sidebar-link ${isActive('terms.html') ? 'active' : ''}" data-tooltip="Terms"><i class="fas fa-file-contract"></i><span>Terms</span></a>
            <a href="${basePath}contact.html" class="desktop-sidebar-link ${isActive('contact.html') ? 'active' : ''}" data-tooltip="Contact"><i class="fas fa-envelope"></i><span>Contact</span></a>
            <div class="desktop-sidebar-divider"></div>
            <button class="desktop-sidebar-link" id="desktopDarkToggle"><i class="fas ${document.body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon'}"></i><span>${document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode'}</span></button>`;
        
        if (user) {
            html += `<div class="desktop-sidebar-divider"></div><div class="desktop-sidebar-user-info"><i class="fas fa-user-circle"></i><span>${user.email.split('@')[0]}</span></div>
                <a href="#" class="desktop-sidebar-link desktop-sidebar-logout" id="desktopSidebarLogout"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a>
                <a href="#" class="desktop-sidebar-link desktop-sidebar-delete" id="desktopDeleteAccount"><i class="fas fa-trash-alt"></i><span>Delete Account</span></a>`;
        } else {
            html += `<div class="desktop-sidebar-divider"></div><a href="${basePath}login.html" class="desktop-sidebar-link"><i class="fas fa-sign-in-alt"></i><span>Login</span></a>
                <a href="${basePath}signup.html" class="desktop-sidebar-link desktop-sidebar-cta"><i class="fas fa-user-plus"></i><span>Sign Up</span></a>`;
        }
        html += `</div>`;
        
        if (sidebar.innerHTML !== html) sidebar.innerHTML = html;
        
        document.getElementById('desktopDarkToggle')?.addEventListener('click', () => { 
            document.body.classList.toggle('dark-mode'); 
            const isDark = document.body.classList.contains('dark-mode'); 
            localStorage.setItem('darkMode', isDark); 
            const btn = document.getElementById('desktopDarkToggle'); 
            if(btn) btn.innerHTML = isDark ? '<i class="fas fa-sun"></i><span>Light Mode</span>' : '<i class="fas fa-moon"></i><span>Dark Mode</span>'; 
            const mainIcon = document.querySelector('.theme-toggle i'); 
            if(mainIcon) mainIcon.className = isDark ? 'fas fa-sun' : 'far fa-moon'; 
        });
        
        document.getElementById('desktopSidebarLogout')?.addEventListener('click', (e) => { 
            e.preventDefault(); 
            showLogoutConfirmation(); 
        });
        
        document.getElementById('desktopDeleteAccount')?.addEventListener('click', (e) => { 
            e.preventDefault(); 
            window.deleteUserAccount(); 
        });
    }
    
    updateSidebarContent();
    
    if (auth) {
        auth.onAuthStateChanged(() => updateSidebarContent());
    }
}

// ===== FAQ ACCORDION FUNCTIONALITY =====
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (faqQuestions.length === 0) return;
    
    faqQuestions.forEach(question => {
        question.removeEventListener('click', handleFaqClick);
        question.addEventListener('click', handleFaqClick);
    });
}

function handleFaqClick() {
    const faqItem = this.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
    
    if (!isActive) {
        faqItem.classList.add('active');
    } else {
        faqItem.classList.remove('active');
    }
}

// ===== ACTIVE NAVIGATION HIGHLIGHT =====
function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const isInToolsFolder = currentPath.includes('/tools/');
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (!href) return;
        
        if ((href === 'tools.html' || href === './tools.html') && 
            (currentPage === 'tools.html' || isInToolsFolder)) {
            link.classList.add('active');
        }
        else if ((href === 'changelog.html' || href === './changelog.html') && 
                 currentPage === 'changelog.html') {
            link.classList.add('active');
        }
        else if ((href === 'ai-assistant.html' || href === './ai-assistant.html') && 
                 currentPage === 'ai-assistant.html') {
            link.classList.add('active');
        }
        else if ((href === 'index.html' || href === './index.html') && 
                 (currentPage === 'index.html' || currentPage === '' || currentPath === '/')) {
            link.classList.add('active');
        }
        else if ((href === 'about.html' || href === './about.html') && 
                 currentPage === 'about.html') {
            link.classList.add('active');
        }
    });
}

// ===== SATELLITE SITE LINK FIXER =====
(function fixSatelliteLinks() {
    const isSatellite = window.location.hostname === 'toolsnova.github.io' && 
                        window.location.pathname.includes('/YouTube-to-MP3-ToolsNova');
    
    if (isSatellite) {
        console.log('Satellite mode: Fixing links to point to main site');
        
        const MAIN_SITE = 'https://toolsnova.github.io';
        
        function fixLinks() {
            const links = document.querySelectorAll('a[href^="./"], a[href^="../"], a[href^="/"], a[href^="index.html"], a[href^="tools.html"], a[href^="ai-assistant.html"], a[href^="about.html"], a[href^="login.html"], a[href^="signup.html"]');
            
            links.forEach(link => {
                const originalHref = link.getAttribute('href');
                if (originalHref && !originalHref.startsWith('http') && !originalHref.startsWith('https')) {
                    let cleanPath = originalHref.replace(/^\.\.?\//, '').replace(/^\//, '');
                    link.href = `${MAIN_SITE}/${cleanPath}`;
                    if (link.target !== '_blank') {
                        link.removeAttribute('target');
                    }
                }
            });
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixLinks);
        } else {
            fixLinks();
        }
        
        setTimeout(fixLinks, 500);
        
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (mobileBtn) {
            mobileBtn.addEventListener('click', function() {
                setTimeout(fixLinks, 100);
            });
        }
    }
})();

// ===== RESET GUEST USES (for testing - remove in production) =====
window.resetGuestUses = function() {
    localStorage.removeItem('toolsnova_guest_uses');
    localStorage.removeItem('toolsnova_tools_used');
    guestUses = 0;
    updateGuestDisplay();
    showNotification('Guest uses reset to 0/3', 'success');
    console.log('Guest uses reset');
};

window.checkGuestUses = function() {
    const uses = getCurrentGuestUses();
    console.log(`Current guest uses: ${uses}/${maxGuestUses}`);
    console.log(`Auth user: ${auth.currentUser ? 'Logged in' : 'Guest'}`);
    return { uses, maxUses: maxGuestUses, isLoggedIn: !!auth.currentUser };
};

// ===== SHOW LIMIT REACHED MODAL =====
function showLimitReachedModal() {
    // Check if modal already exists
    let modalOverlay = document.getElementById('limitReachedModal');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        return;
    }
    
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'limitReachedModal';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
    
    modalOverlay.innerHTML = `
        <div class="modal-container" style="max-width: 400px; text-align: center;">
            <div class="modal-header" style="justify-content: center; border-bottom: none;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 10px;"></i>
            </div>
            <div class="modal-body" style="text-align: center;">
                <h3 style="margin-bottom: 12px; font-size: 1.5rem;">⚠️ Free Limit Reached</h3>
                <p style="margin-bottom: 20px; color: var(--text-secondary);">
                    You have used all <strong>3 free tries</strong>.
                </p>
                <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 16px; margin: 20px 0;">
                    <i class="fas fa-crown" style="font-size: 32px; color: #ffd700; margin-bottom: 10px; display: block;"></i>
                    <p style="color: white; font-weight: bold; margin-bottom: 15px;">Sign up for unlimited access!</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <a href="signup.html" style="background: white; color: #3b82f6; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Sign Up Free</a>
                        <a href="login.html" style="background: transparent; color: white; border: 1px solid white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Login</a>
                    </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">
                    ✨ No credit card required<br>
                    🚀 Unlimited access to all tools<br>
                    💾 Save your history
                </p>
            </div>
            <div class="modal-footer" style="justify-content: center; border-top: none;">
                <button class="modal-btn modal-btn-cancel" onclick="closeLimitReachedModal()">Close</button>
            </div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    
    // Close on escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeLimitReachedModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

window.closeLimitReachedModal = function() {
    const modal = document.getElementById('limitReachedModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};

// ===== GLOBAL TOOL LINK INTERCEPTOR =====
// This blocks all tool links when guest limit is reached
function initGlobalLinkInterceptor() {
    // Select all tool links (links that go to /tools/ or specific tool pages)
    const toolSelectors = [
        'a[href*="tools/"]',           // Any link containing "tools/"
        'a[href*="yt-thumbnail"]',
        'a[href*="video-to-mp3"]',
        'a[href*="yt-transcript"]',
        'a[href*="age-calculator"]',
        'a[href*="discount-calculator"]',
        'a[href*="bmi-calculator"]',
        'a[href*="currency-converter"]',
        'a[href*="image-compressor"]',
        'a[href*="qr-generator"]',
        'a[href*="background-remover"]',
        'a[href*="ai-content-detector"]',
        'a[href*="ai-grammar-checker"]',
        'a[href*="ai-text-summarizer"]',
        'a[href*="image-editor"]',
        'a[href*="image-to-png"]',
        'a[href*="ocr"]',
        'a[href*="python-editor"]',
        'a[href*="live-editor"]',
        'a[href*="json-formatter"]',
        'a[href*="ai-assistant.html"]'  // AI Assistant link
    ];
    
    const selector = toolSelectors.join(',');
    
    function blockToolLink(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        // Skip if it's a hash link or javascript: or external
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('http')) {
            return;
        }
        
        // Check if user is logged in
        const user = auth.currentUser;
        if (user) return true; // Logged in users can access
        
        // Check guest limit
        const currentUses = getCurrentGuestUses();
        if (currentUses >= maxGuestUses) {
            event.preventDefault();
            event.stopPropagation();
            
            // Show modal or notification
            showLimitReachedModal();
            return false;
        }
        
        return true;
    }
    
    // Attach listeners to all tool links
    function attachLinkListeners() {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
            // Remove existing listener to avoid duplicates
            link.removeEventListener('click', blockToolLink);
            link.addEventListener('click', blockToolLink);
        });
    }
    
    // Initial attachment
    attachLinkListeners();
    
    // Re-attach when DOM changes (for dynamically loaded content)
    const observer = new MutationObserver(function(mutations) {
        attachLinkListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also attach when sidebar/mobile menu updates
    if (auth) {
        auth.onAuthStateChanged(() => {
            setTimeout(attachLinkListeners, 100);
        });
    }
}

// ===== ALSO BLOCK THE YOUTUBE TO MP3 SATELLITE LINK =====
function blockSatelliteLink() {
    const satLink = document.querySelector('a[href*="YouTube-to-MP3-ToolsNova"]');
    if (satLink) {
        satLink.addEventListener('click', function(e) {
            const user = auth.currentUser;
            if (!user) {
                const currentUses = getCurrentGuestUses();
                if (currentUses >= maxGuestUses) {
                    e.preventDefault();
                    showLimitReachedModal();
                    return false;
                }
            }
            return true;
        });
    }
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    initDesktopSidebar();
    initFaqAccordion();
    highlightActiveNav();
    updateGuestDisplay();
    initGlobalLinkInterceptor();
    setTimeout(blockSatelliteLink, 500);
});

// Run FAQ accordion again after DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initFaqAccordion();
});

if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                initFaqAccordion();
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', highlightActiveNav);
setTimeout(highlightActiveNav, 100);

// ===== GLOBAL EXPORTS =====
window.auth = auth;
window.canUseTool = canUseTool;
window.trackToolUse = trackToolUse;
window.guestUses = guestUses;
window.maxGuestUses = maxGuestUses;
window.getCurrentGuestUses = getCurrentGuestUses;
window.isGuestUser = () => !auth.currentUser;
window.showNotification = showNotification;
window.dispatchEvent(new Event('toolsnova-auth-ready'));