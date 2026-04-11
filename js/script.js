// ===== GOOGLE ANALYTICS (STANDARD IMPLEMENTATION) =====
// Google Analytics 4 (GA4) Standard Code
window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // Default configuration: No delays, no custom bot logic
  gtag('config', 'G-CL847BSHY4', {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
  });

// ===== TOOLSNOVA - COMPLETE WITH FIREBASE AUTH =====

// Initialize Firebase (ONCE!)
const firebaseConfig = {
    apiKey: "AIzaSyC6rF7Pg7j-NPioZ8Ei70GCj_megjD7UQw",
    authDomain: "toolsnova-user.firebaseapp.com",
    projectId: "toolsnova-user",
    storageBucket: "toolsnova-user.firebasestorage.app",
    messagingSenderId: "907228879212",
    appId: "1:907228879212:web:7e82b085899deb14857b49",
    measurementId: "G-CL847BSHY4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ===== DOM ELEMENTS (ONCE!) =====
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

// ===== GUEST USAGE TRACKING =====
let guestUses = localStorage.getItem('toolsnova_guest_uses') ? parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
const maxGuestUses = 3;

// ===== TOOLS DATABASE (ONCE!) =====
const tools = [
    { id: 1, name: "YouTube Thumbnail Downloader", desc: "Download any video thumbnail in HD quality", icon: "fa-brands fa-youtube", cat: "media", popular: true, url: "tools/yt-thumbnail.html" },
    { id: 2, name: "YouTube to MP3", desc: "Convert YouTube videos to MP3 audio", icon: "fa-solid fa-music", cat: "media", popular: true, url: "tools/video-to-mp3.html" },
    { id: 3, name: "YouTube Transcript Generator", desc: "Get transcripts from any YouTube video", icon: "fa-solid fa-closed-captioning", cat: "media", popular: true, url: "tools/yt-transcript.html" },
    { id: 4, name: "Video Compressor", desc: "Reduce video file size without losing quality", icon: "fa-solid fa-compress", cat: "media", popular: false, url: "tools/video-compressor.html" },
    { id: 6, name: "QR Code Generator", desc: "Create QR codes for URLs, text, WiFi", icon: "fa-solid fa-qrcode", cat: "media", popular: true, url: "tools/qr-generator.html" },
    { id: 8, name: "Background Remover", desc: "Remove image backgrounds with AI", icon: "fa-solid fa-eraser", cat: "ai", popular: true, url: "tools/background-remover.html" },
    { id: 9, name: "AI Content Detector", desc: "Check if text was written by AI", icon: "fa-solid fa-robot", cat: "ai", popular: true, url: "tools/ai-content-detector.html" },
    { id: 10, name: "AI Grammar Checker", desc: "Fix grammar and spelling mistakes", icon: "fa-solid fa-spell-check", cat: "ai", popular: false, url: "tools/ai-grammar-checker.html" },
    { id: 11, name: "AI Text Summarizer", desc: "Summarize long articles and texts", icon: "fa-solid fa-compress", cat: "ai", popular: false, url: "tools/ai-text-summarizer.html" },
    { id: 12, name: "Image Editor", desc: "Crop, rotate, adjust images", icon: "fa-solid fa-paint-brush", cat: "image", popular: true, url: "tools/image-editor.html" },
    { id: 13, name: "Image to PNG Converter", desc: "Convert images to PNG format", icon: "fa-solid fa-file-image", cat: "image", popular: true, url: "tools/image-to-png.html" },
    { id: 14, name: "Screenshot to Text (OCR)", desc: "Extract text from images", icon: "fa-solid fa-text", cat: "image", popular: true, url: "tools/ocr.html" },
    { id: 15, name: "Brightness & Contrast", desc: "Adjust image brightness and contrast", icon: "fa-solid fa-sun", cat: "image", popular: false, url: "tools/brightness-contrast.html" },
    { id: 16, name: "Crop & Rotate", desc: "Crop, rotate, and flip images", icon: "fa-solid fa-crop", cat: "image", popular: true, url: "tools/crop-rotate.html" },
    { id: 17, name: "Image Filters", desc: "Apply filters like grayscale, sepia", icon: "fa-solid fa-filters", cat: "image", popular: false, url: "tools/image-filters.html" },
    { id: 18, name: "Resize Image", desc: "Change image dimensions", icon: "fa-solid fa-expand", cat: "image", popular: true, url: "tools/resize-image.html" },
    { id: 19, name: "Add Text to Image", desc: "Overlay text on images", icon: "fa-solid fa-font", cat: "image", popular: false, url: "tools/add-text.html" },
    { id: 20, name: "Python Editor", desc: "Write and run Python code online", icon: "fa-brands fa-python", cat: "code", popular: true, url: "tools/python-editor.html" },
    { id: 21, name: "Live HTML/CSS/JS Editor", desc: "Live preview HTML, CSS, JavaScript", icon: "fa-brands fa-html5", cat: "code", popular: true, url: "tools/live-editor.html" },
    { id: 22, name: "JSON Formatter", desc: "Format and validate JSON data", icon: "fa-solid fa-brackets-curly", cat: "code", popular: true, url: "tools/json-formatter.html" },
    { id: 23, name: "CSS Minifier", desc: "Compress CSS code", icon: "fa-brands fa-css3", cat: "code", popular: false, url: "tools/css-minifier.html" },
    { id: 24, name: "HTML Preview", desc: "Live HTML rendering", icon: "fa-brands fa-html5", cat: "code", popular: false, url: "tools/html-preview.html" },
    { id: 25, name: "Age Calculator", desc: "Calculate exact age in years, months, days", icon: "fa-solid fa-cake-candles", cat: "calc", popular: true, url: "tools/age-calculator.html" },
    { id: 26, name: "Discount Calculator", desc: "Calculate sale prices and discounts", icon: "fa-solid fa-tags", cat: "calc", popular: true, url: "tools/discount-calculator.html" },
    { id: 27, name: "Currency Converter", desc: "Convert between currencies with live rates", icon: "fa-solid fa-coins", cat: "calc", popular: true, url: "tools/currency-converter.html" },
    { id: 28, name: "BMI Calculator", desc: "Calculate Body Mass Index", icon: "fa-solid fa-weight-scale", cat: "calc", popular: false, url: "tools/bmi-calculator.html" },
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
        const isToolPage = window.location.pathname.includes('/tools/');
        if (!isToolPage) return;
        
        const hasResult = document.querySelector('.result-card, .thumbnails-grid, #result, .output');
        if (!hasResult) return;
        
        let used = parseInt(localStorage.getItem('toolsnova_tools_used') || '0');
        used++;
        localStorage.setItem('toolsnova_tools_used', used);
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
                <button class="mobile-link" id="mobileDarkToggle">
                    <i class="fas fa-moon"></i> Dark Mode
                </button>
                <div class="mobile-menu-divider"></div>
        `;
        
        if (user) {
            menuLinks += `
                <div class="mobile-user-info">
                    <i class="fas fa-user"></i>
                    <span>${user.email}</span>
                </div>
                <a href="#" class="mobile-link mobile-logout" id="mobileLogout">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
                <a href="#" class="mobile-link mobile-delete" id="mobileDeleteAccount">
                    <i class="fas fa-trash-alt"></i> Delete Account
                </a>
            `;
        } else {
            menuLinks += `
                <a href="${basePath}login.html" class="mobile-link">Login</a>
                <a href="${basePath}signup.html" class="mobile-link mobile-cta">Sign Up</a>
            `;
        }
        
        menuLinks += `</div>`;
        menu.innerHTML = menuLinks;
        
        const closeBtn = menu.querySelector('.mobile-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }
        
        const mobileLogout = document.getElementById('mobileLogout');
        if (mobileLogout) {
            mobileLogout.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
                closeMenu();
            });
        }
        
        const mobileDelete = document.getElementById('mobileDeleteAccount');
        if (mobileDelete) {
            mobileDelete.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
                deleteUserAccount();
            });
        }
        
        const mobileDarkToggle = document.getElementById('mobileDarkToggle');
        if (mobileDarkToggle) {
            const newToggle = mobileDarkToggle.cloneNode(true);
            mobileDarkToggle.parentNode.replaceChild(newToggle, mobileDarkToggle);
            
            newToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isDark);
                newToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
                const mainIcon = document.querySelector('.theme-toggle i');
                if (mainIcon) {
                    mainIcon.className = isDark ? 'fas fa-sun' : 'far fa-moon';
                }
            });
            
            if (document.body.classList.contains('dark-mode')) {
                newToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            }
        }
    }
    
    updateMobileMenu();
    
    auth.onAuthStateChanged(() => {
        updateMobileMenu();
    });
    
    function closeMenu() {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    window.closeMenu = closeMenu;
    
    const closeBtn = menu.querySelector('.mobile-menu-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }
    
    overlay.addEventListener('click', closeMenu);
}

// ===== DRAGGABLE MOBILE MENU BUTTON =====
if (mobileBtn) {
    let isDragging = false;
    let moved = false;
    let offsetX = 0;
    let offsetY = 0;
    
    const savedX = localStorage.getItem('btn_x');
    const savedY = localStorage.getItem('btn_y');
    
    if (savedX && savedY) {
        let x = parseInt(savedX);
        let y = parseInt(savedY);
        const maxX = window.innerWidth - mobileBtn.offsetWidth;
        const maxY = window.innerHeight - mobileBtn.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        mobileBtn.style.left = x + "px";
        mobileBtn.style.top = y + "px";
        mobileBtn.style.right = "auto";
    }
    
    function openMenu() {
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (menu) {
            menu.classList.add('active');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    window.openMenu = openMenu;
    
    mobileBtn.addEventListener("touchstart", (e) => {
        isDragging = true;
        moved = false;
        const touch = e.touches[0];
        offsetX = touch.clientX - mobileBtn.offsetLeft;
        offsetY = touch.clientY - mobileBtn.offsetTop;
    });
    
    mobileBtn.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        moved = true;
        const touch = e.touches[0];
        let x = touch.clientX - offsetX;
        let y = touch.clientY - offsetY;
        const maxX = window.innerWidth - mobileBtn.offsetWidth;
        const maxY = window.innerHeight - mobileBtn.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        mobileBtn.style.left = x + "px";
        mobileBtn.style.top = y + "px";
        mobileBtn.style.right = "auto";
        mobileBtn.style.bottom = "auto";
    });
    
    mobileBtn.addEventListener("touchend", (e) => {
        isDragging = false;
        if (!moved) {
            e.preventDefault();
            openMenu();
        }
        const screenWidth = window.innerWidth;
        const rect = mobileBtn.getBoundingClientRect();
        let finalX = rect.left < screenWidth / 2 ? 10 : screenWidth - mobileBtn.offsetWidth - 10;
        mobileBtn.style.left = finalX + "px";
        const finalRect = mobileBtn.getBoundingClientRect();
        localStorage.setItem('btn_x', finalRect.left);
        localStorage.setItem('btn_y', finalRect.top);
    });
    
    mobileBtn.addEventListener("click", () => {
        if (!isDragging && !moved) {
            openMenu();
        }
    });
}

// ===== COLLAPSIBLE DESKTOP SIDEBAR =====
function initDesktopSidebar() {
    if (window.innerWidth <= 768) return;
    if (document.querySelector('.desktop-sidebar')) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'desktop-sidebar-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    document.body.appendChild(toggleBtn);
    
    const sidebar = document.createElement('div');
    sidebar.className = 'desktop-sidebar';
    sidebar.id = 'desktopSidebar';
    document.body.appendChild(sidebar);
    
    const isSidebarOpen = localStorage.getItem('desktopSidebarOpen') !== 'false';
    
    function updateSidebarState(open) {
        if (open) {
            sidebar.classList.remove('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            document.body.classList.remove('sidebar-collapsed');
            localStorage.setItem('desktopSidebarOpen', 'true');
        } else {
            sidebar.classList.add('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            document.body.classList.add('sidebar-collapsed');
            localStorage.setItem('desktopSidebarOpen', 'false');
        }
        window.dispatchEvent(new Event('resize'));
    }
    
    updateSidebarState(isSidebarOpen);
    
    function toggleSidebar() {
        const isOpen = !sidebar.classList.contains('collapsed');
        updateSidebarState(!isOpen);
    }
    
    toggleBtn.addEventListener('click', toggleSidebar);
    
    function updateSidebar() {
        const user = auth.currentUser;
        const currentPath = window.location.pathname;
        const isInTools = currentPath.includes('/tools/');
        const basePath = isInTools ? '../' : './';
        
        function isActive(href) {
            if (href === 'index.html' && (currentPath === '/' || currentPath === '/index.html')) return true;
            if (href === 'ai-assistant.html' && currentPath.includes('ai-assistant')) return true;
            if (href === 'tools.html' && currentPath.includes('tools.html')) return true;
            if (href === 'about.html' && currentPath.includes('about')) return true;
            if (href === 'privacy.html' && currentPath.includes('privacy')) return true;
            if (href === 'terms.html' && currentPath.includes('terms')) return true;
            if (href === 'contact.html' && currentPath.includes('contact')) return true;
            return false;
        }
        
        let html = `
            <div class="desktop-sidebar-header">
                <div class="desktop-sidebar-logo">
                    <i class="fas fa-star"></i>
                    <span>ToolsNova</span>
                </div>
            </div>
            <div class="desktop-sidebar-links">
                <a href="${basePath}index.html" class="desktop-sidebar-link ${isActive('index.html') ? 'active' : ''}">
                    <i class="fas fa-home"></i> <span>Home</span>
                </a>
                <a href="${basePath}ai-assistant.html" class="desktop-sidebar-link ${isActive('ai-assistant.html') ? 'active' : ''}">
                    <i class="fas fa-robot"></i> <span>AI Assistant</span>
                </a>
                <a href="${basePath}tools.html" class="desktop-sidebar-link ${isActive('tools.html') ? 'active' : ''}">
                    <i class="fas fa-tools"></i> <span>All Tools</span>
                </a>
                
                <div class="desktop-sidebar-category-title">For You! 🔥</div>
                <a href="${basePath}tools.html#media" class="desktop-sidebar-link"><i class="fas fa-video"></i> <span>Media Tools</span></a>
                <a href="${basePath}tools.html#ai" class="desktop-sidebar-link"><i class="fas fa-robot"></i> <span>AI Tools</span></a>
                <a href="${basePath}tools.html#image" class="desktop-sidebar-link"><i class="fas fa-paint-brush"></i> <span>Image Editor</span></a>
                <a href="${basePath}tools.html#code" class="desktop-sidebar-link"><i class="fas fa-code"></i> <span>Code Editors</span></a>
                <a href="${basePath}tools.html#calc" class="desktop-sidebar-link"><i class="fas fa-calculator"></i> <span>Calculators</span></a>
                
                <div class="desktop-sidebar-divider"></div>
                <a href="${basePath}about.html" class="desktop-sidebar-link ${isActive('about.html') ? 'active' : ''}">
                    <i class="fas fa-info-circle"></i> <span>About</span>
                </a>
                <a href="${basePath}privacy.html" class="desktop-sidebar-link ${isActive('privacy.html') ? 'active' : ''}">
                    <i class="fas fa-shield-alt"></i> <span>Privacy</span>
                </a>
                <a href="${basePath}terms.html" class="desktop-sidebar-link ${isActive('terms.html') ? 'active' : ''}">
                    <i class="fas fa-file-contract"></i> <span>Terms</span>
                </a>
                <a href="${basePath}contact.html" class="desktop-sidebar-link ${isActive('contact.html') ? 'active' : ''}">
                    <i class="fas fa-envelope"></i> <span>Contact</span>
                </a>
                
                <div class="desktop-sidebar-divider"></div>
                <button class="desktop-sidebar-link" id="desktopDarkToggle">
                    <i class="fas fa-moon"></i> <span>Dark Mode</span>
                </button>
        `;
        
        if (user) {
            html += `
                <div class="desktop-sidebar-divider"></div>
                <div class="desktop-sidebar-user-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.email.split('@')[0]}</span>
                </div>
                <a href="#" class="desktop-sidebar-link desktop-sidebar-logout" id="desktopSidebarLogout">
                    <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
                </a>
                <a href="#" class="desktop-sidebar-link desktop-sidebar-delete" id="desktopDeleteAccount">
                    <i class="fas fa-trash-alt"></i> <span>Delete Account</span>
                </a>
            `;
        } else {
            html += `
                <div class="desktop-sidebar-divider"></div>
                <a href="${basePath}login.html" class="desktop-sidebar-link"><i class="fas fa-sign-in-alt"></i> <span>Login</span></a>
                <a href="${basePath}signup.html" class="desktop-sidebar-link desktop-sidebar-cta"><i class="fas fa-user-plus"></i> <span>Sign Up</span></a>
            `;
        }
        
        html += `</div>`;
        sidebar.innerHTML = html;
        
        document.getElementById('desktopDarkToggle')?.addEventListener('click', toggleDarkMode);
        document.getElementById('desktopSidebarLogout')?.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
        
        const desktopDelete = document.getElementById('desktopDeleteAccount');
        if (desktopDelete) {
            desktopDelete.addEventListener('click', (e) => {
                e.preventDefault();
                deleteUserAccount();
            });
        }
    }
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        const darkToggle = document.getElementById('desktopDarkToggle');
        if (darkToggle) {
            darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> <span>Light Mode</span>' : '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
        }
        
        const mainIcon = document.querySelector('.theme-toggle i');
        if (mainIcon) {
            mainIcon.className = isDark ? 'fas fa-sun' : 'far fa-moon';
        }
    }
    
    auth.onAuthStateChanged(() => updateSidebar());
    updateSidebar();
    
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
        } else {
            const savedState = localStorage.getItem('desktopSidebarOpen') !== 'false';
            updateSidebarState(savedState);
        }
    });
}

// ===== DELETE ACCOUNT FUNCTION =====
function deleteUserAccount() {
    const user = auth.currentUser;
    if (!user) {
        alert('You need to be logged in to delete your account.');
        return;
    }
    
    const confirmed = confirm(
        '⚠️ WARNING: This will PERMANENTLY delete:\n\n' +
        '• Your account and email\n' +
        '• All your chat history\n' +
        '• All your saved data\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Click OK to delete your account forever.'
    );
    
    if (!confirmed) return;
    
    user.delete().then(() => {
        localStorage.clear();
        alert('✅ Your account has been deleted successfully.');
        window.location.href = 'index.html';
    }).catch((error) => {
        if (error.code === 'auth/requires-recent-login') {
            alert('⚠️ For security, please log out and log in again, then try deleting your account.');
        } else {
            alert('❌ Error: ' + error.message);
        }
    });
}

// Initialize desktop sidebar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopSidebar);
} else {
    initDesktopSidebar();
}

// Initial guest display
updateGuestDisplay();

// ===== MAKE AUTH FUNCTIONS GLOBAL =====
window.auth = auth;
window.canUseTool = canUseTool;
window.trackToolUse = trackToolUse;
window.guestUses = guestUses;
window.maxGuestUses = maxGuestUses;
window.isGuestUser = function() {
    const user = auth.currentUser;
    return !user;
};

window.dispatchEvent(new Event('toolsnova-auth-ready'));