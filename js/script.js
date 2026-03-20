// ===== TOOLSNOVA - COMPLETE WITH FIREBASE AUTH =====

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBADT8ZDZ9TGEVeVm73Yf_rwI6YmAtjRa8",
    authDomain: "toolsnova-869.firebaseapp.com",
    projectId: "toolsnova-869",
    storageBucket: "toolsnova-869.firebasestorage.app",
    messagingSenderId: "393315506444",
    appId: "1:393315506444:web:595807ed58abe6b6ad9129",
    measurementId: "G-NDYMR71RKW"
};

// Initialize Firebase
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

// ===== GUEST USAGE TRACKING =====
let guestUses = localStorage.getItem('toolsnova_guest_uses') ? parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
const maxGuestUses = 3;

// ===== TOOLS DATABASE =====
const tools = [
    // Media Tools
    { id: 1, name: "YouTube Thumbnail Downloader", desc: "Download any video thumbnail in HD quality", icon: "fa-brands fa-youtube", cat: "media", popular: true, url: "tools/yt-thumbnail.html" },
    { id: 2, name: "YouTube to MP3", desc: "Convert YouTube videos to MP3 audio", icon: "fa-solid fa-music", cat: "media", popular: true, url: "tools/video-to-mp3.html" },
    { id: 3, name: "YouTube Transcript Generator", desc: "Get transcripts from any YouTube video", icon: "fa-solid fa-closed-captioning", cat: "media", popular: true, url: "tools/yt-transcript.html" },
    { id: 4, name: "Video Compressor", desc: "Reduce video file size without losing quality", icon: "fa-solid fa-compress", cat: "media", popular: false, url: "tools/video-compressor.html" },
    { id: 6, name: "QR Code Generator", desc: "Create QR codes for URLs, text, WiFi", icon: "fa-solid fa-qrcode", cat: "media", popular: true, url: "tools/qr-generator.html" },
    
    // AI Tools
    { id: 8, name: "Background Remover", desc: "Remove image backgrounds with AI", icon: "fa-solid fa-eraser", cat: "ai", popular: true, url: "tools/background-remover.html" },
    { id: 9, name: "AI Content Detector", desc: "Check if text was written by AI", icon: "fa-solid fa-robot", cat: "ai", popular: true, url: "tools/ai-content-detector.html" },
    { id: 10, name: "AI Grammar Checker", desc: "Fix grammar and spelling mistakes", icon: "fa-solid fa-spell-check", cat: "ai", popular: false, url: "tools/ai-grammar-checker.html" },
    { id: 11, name: "AI Text Summarizer", desc: "Summarize long articles and texts", icon: "fa-solid fa-compress", cat: "ai", popular: false, url: "tools/ai-text-summarizer.html" },
    
    // Image Editor Tools
    { id: 12, name: "Image Editor", desc: "Crop, rotate, adjust images", icon: "fa-solid fa-paint-brush", cat: "image", popular: true, url: "tools/image-editor.html" },
    { id: 13, name: "Image to PNG Converter", desc: "Convert images to PNG format", icon: "fa-solid fa-file-image", cat: "image", popular: true, url: "tools/image-to-png.html" },
    { id: 14, name: "Screenshot to Text (OCR)", desc: "Extract text from images", icon: "fa-solid fa-text", cat: "image", popular: true, url: "tools/ocr.html" },
    { id: 15, name: "Brightness & Contrast", desc: "Adjust image brightness and contrast", icon: "fa-solid fa-sun", cat: "image", popular: false, url: "tools/brightness-contrast.html" },
    { id: 16, name: "Crop & Rotate", desc: "Crop, rotate, and flip images", icon: "fa-solid fa-crop", cat: "image", popular: true, url: "tools/crop-rotate.html" },
    { id: 17, name: "Image Filters", desc: "Apply filters like grayscale, sepia", icon: "fa-solid fa-filters", cat: "image", popular: false, url: "tools/image-filters.html" },
    { id: 18, name: "Resize Image", desc: "Change image dimensions", icon: "fa-solid fa-expand", cat: "image", popular: true, url: "tools/resize-image.html" },
    { id: 19, name: "Add Text to Image", desc: "Overlay text on images", icon: "fa-solid fa-font", cat: "image", popular: false, url: "tools/add-text.html" },
    
    // Code Editors
    { id: 20, name: "Python Editor", desc: "Write and run Python code online", icon: "fa-brands fa-python", cat: "code", popular: true, url: "tools/python-editor.html" },
    { id: 21, name: "Live HTML/CSS/JS Editor", desc: "Live preview HTML, CSS, JavaScript", icon: "fa-brands fa-html5", cat: "code", popular: true, url: "tools/live-editor.html" },
    { id: 22, name: "JSON Formatter", desc: "Format and validate JSON data", icon: "fa-solid fa-brackets-curly", cat: "code", popular: true, url: "tools/json-formatter.html" },
    { id: 23, name: "CSS Minifier", desc: "Compress CSS code", icon: "fa-brands fa-css3", cat: "code", popular: false, url: "tools/css-minifier.html" },
    { id: 24, name: "HTML Preview", desc: "Live HTML rendering", icon: "fa-brands fa-html5", cat: "code", popular: false, url: "tools/html-preview.html" },
    
    // Calculators
    { id: 25, name: "Age Calculator", desc: "Calculate exact age in years, months, days", icon: "fa-solid fa-cake-candles", cat: "calc", popular: true, url: "tools/age-calculator.html" },
    { id: 26, name: "Discount Calculator", desc: "Calculate sale prices and discounts", icon: "fa-solid fa-tags", cat: "calc", popular: true, url: "tools/discount-calculator.html" },
    { id: 27, name: "Currency Converter", desc: "Convert between currencies with live rates", icon: "fa-solid fa-coins", cat: "calc", popular: true, url: "tools/currency-converter.html" },
    { id: 28, name: "BMI Calculator", desc: "Calculate Body Mass Index", icon: "fa-solid fa-weight-scale", cat: "calc", popular: false, url: "tools/bmi-calculator.html" },
    
    // New Tools
    { id: 29, name: "Password Generator", desc: "Generate secure, random passwords", icon: "fa-solid fa-key", cat: "security", popular: true, url: "tools/password-generator.html" },
    { id: 30, name: "Text to Speech", desc: "Convert text to speech", icon: "fa-solid fa-volume-high", cat: "audio", popular: true, url: "tools/text-to-speech.html" },
    { id: 31, name: "PDF Merger", desc: "Combine multiple PDF files", icon: "fa-solid fa-file-pdf", cat: "pdf", popular: true, url: "tools/pdf-merger.html" },
    { id: 32, name: "Image to PDF", desc: "Convert images to PDF", icon: "fa-solid fa-image", cat: "pdf", popular: true, url: "tools/image-to-pdf.html" },
    { id: 33, name: "Unit Converter", desc: "Convert length, weight, volume", icon: "fa-solid fa-scale-balanced", cat: "converter", popular: true, url: "tools/unit-converter.html" }
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

// ===== HANDLE TOOL CLICK =====
window.handleToolClick = function(event, toolId) {
    if (!canUseTool()) {
        event.preventDefault();
        alert('You have used all 3 guest tries. Please sign up for unlimited access!');
        window.location.href = 'signup.html';
        return false;
    }
    trackToolUse();
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

// ===== AUTH STATE =====
auth.onAuthStateChanged((user) => {
    if (user) {
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userGreeting) userGreeting.textContent = `Hi, ${user.email.split('@')[0]}`;
        }
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
        if (userBadge) userBadge.textContent = 'Guest: 3 free uses';
    }
});

// ===== GUEST FUNCTIONS =====
function updateGuestDisplay() {
    if (usesLeft) usesLeft.textContent = Math.max(0, maxGuestUses - guestUses);
}

function canUseTool() {
    const user = auth.currentUser;
    if (user) return true;
    return guestUses < maxGuestUses;
}

function trackToolUse() {
    const user = auth.currentUser;
    if (!user) {
        guestUses++;
        localStorage.setItem('toolsnova_guest_uses', guestUses);
        updateGuestDisplay();
    }
}

// ===== LOGOUT =====
function logout() {
    auth.signOut().then(() => console.log('Logged out'));
}

if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
if (footerLogout) footerLogout.addEventListener('click', (e) => { e.preventDefault(); logout(); });

// ===== SEARCH =====
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        if (value.length > 0) {
            const results = tools.filter(tool => tool.name.toLowerCase().includes(value) || tool.desc.toLowerCase().includes(value));
            if (resultCount) resultCount.textContent = `(${results.length} tools)`;
            if (results.length > 0) {
                displayTools(searchGrid, results);
            } else {
                searchGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px;"><i class="fas fa-search" style="font-size: 3rem;"></i><h3>No tools found</h3></div>';
            }
            if (popularSection) popularSection.style.display = 'none';
            if (searchSection) searchSection.style.display = 'block';
        } else {
            if (popularSection) popularSection.style.display = 'block';
            if (searchSection) searchSection.style.display = 'none';
        }
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (popularSection) popularSection.style.display = 'block';
        if (searchSection) searchSection.style.display = 'none';
    });
}

// ===== DARK MODE =====
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'far fa-moon';
        localStorage.setItem('toolsnova_darkmode', document.body.classList.contains('dark-mode'));
    });
}

if (localStorage.getItem('toolsnova_darkmode') === 'true') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.querySelector('i').className = 'fas fa-sun';
}

// ===== 🔥 SIMPLE MOBILE MENU THAT WILL WORK =====
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        console.log('✅ Menu setup');
        
        // Create overlay
        let overlay = document.querySelector('.mobile-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
        }
        
        // Toggle function
        function openMenu() {
            navLinks.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('menu-open');
            menuBtn.querySelector('i').className = 'fas fa-times';
        }
        
        function closeMenu() {
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            menuBtn.querySelector('i').className = 'fas fa-bars';
        }
        
        // Button click
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Overlay click
        overlay.addEventListener('click', closeMenu);
        
        // Links click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Make button visible
        menuBtn.style.cssText = 'display: flex !important; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer;';
    }
});

// Initial guest display
updateGuestDisplay();

// ===== GLOBAL =====
window.auth = auth;
window.canUseTool = canUseTool;
window.trackToolUse = trackToolUse;
window.guestUses = guestUses;
window.maxGuestUses = maxGuestUses;
window.isGuestUser = () => !auth.currentUser;
window.dispatchEvent(new Event('toolsnova-auth-ready'));
