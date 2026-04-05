// ===== HTML PREVIEW TOOL - COMPLETE FIXED VERSION WITH AUTH =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('HTML Preview loaded');
    
    // DOM elements
    const htmlInput = document.getElementById('htmlInput');
    const preview = document.getElementById('preview');
    const charCount = document.getElementById('charCount');
    const autoRefresh = document.getElementById('autoRefresh');
    const wordWrap = document.getElementById('wordWrap');
    const refreshBtn = document.getElementById('refreshBtn');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // View buttons
    const sideBySideBtn = document.getElementById('sideBySideBtn');
    const editorOnlyBtn = document.getElementById('editorOnlyBtn');
    const previewOnlyBtn = document.getElementById('previewOnlyBtn');
    const editorContent = document.querySelector('.editor-content');
    
    // Check if critical elements exist
    if (!htmlInput || !preview || !editorContent) {
        console.error('Critical elements missing!');
        return;
    }
    
    // State
    let isGuest = true;
    let previewTimer = null;
    let hasCountedThisSession = false;
    let currentSampleIndex = 0;
    const sampleKeys = ['basic', 'form', 'dashboard'];
    
    // Check user status and listen for auth changes
    function checkUserStatus() {
        if (typeof firebase !== 'undefined') {
            const user = firebase.auth().currentUser;
            isGuest = !user;
            console.log('User status:', isGuest ? 'Guest' : 'Logged in');
        }
    }
    
    // Listen for auth state changes
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(function(user) {
            isGuest = !user;
            console.log('Auth state changed - isGuest:', isGuest);
            
            // Update UI if needed
            if (!isGuest) {
                // Logged in - reset any guest restrictions
                hasCountedThisSession = false;
            }
        });
    }
    
    // Initial check
    checkUserStatus();
    
    // Sample HTML templates - FIXED VERSION
    const samples = {
        basic: `<!DOCTYPE html>
<html>
<head>
<script>
<!-- Google Analytics (ONLY ONCE, TOP OF HEAD) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CL847BSHY4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('js', new Date());

  // ===== BOT DETECTION (RUN FIRST) =====
  const isBot = (
    navigator.webdriver || 
    /bot|crawl|spider|HeadlessChrome|slurp|bingpreview/i.test(navigator.userAgent)
  );

  // ===== ALWAYS FIRE PAGEVIEW (IMPORTANT) =====
  // Even bots get pageview → so GA doesn't miss users
  gtag('config', 'G-CL847BSHY4', {
    page_view: true
  });

  // ===== MARK USER TYPE =====
  gtag('event', 'user_type_detected', {
    user_type: isBot ? 'bot' : 'human_candidate'
  });

  // ===== HUMAN VERIFICATION (REAL USERS ONLY) =====
  if (!isBot) {
    const events = ['mousedown', 'touchstart', 'scroll', 'keydown'];

    const verifyHuman = () => {
      gtag('event', 'human_verified', {
        status: 'confirmed_human'
      });

      // stop after first interaction
      events.forEach(e => window.removeEventListener(e, verifyHuman));
    };

    events.forEach(e => window.addEventListener(e, verifyHuman, { passive: true }));

    // ===== BACKUP: AUTO CONFIRM AFTER 3s =====
    // (Fixes your "GSC clicks but no GA data" issue)
    setTimeout(() => {
      gtag('event', 'human_verified', {
        status: 'auto_confirmed'
      });
    }, 3000);
  }
</script>
<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>

<!-- Favicon - For tool pages (inside /tools/ folder) -->
<link rel="apple-touch-icon" sizes="180x180" href="../assets/images/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../assets/images/favicon-16x16.png">
<link rel="manifest" href="../assets/images/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">

    <title>My Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #3b82f6;
            text-align: center;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <h1>Welcome to ToolsNova</h1>
    <div class="card">
        <h2>HTML Preview Tool</h2>
        <p>This is a live preview of your HTML code. Try editing the HTML on the left to see changes instantly!</p>
        <button onclick="alert('Hello from ToolsNova!')">Click Me</button>
    </div>
    <div class="card">
        <h3>Features:</h3>
        <ul>
            <li>Live HTML preview</li>
            <li>CSS and JavaScript support</li>
            <li>Multiple view modes</li>
            <li>Copy and download HTML</li>
        </ul>
    </div>
</body>
</html>`,

        form: `<!DOCTYPE html>
<html>
<head>
<script>
<!-- Google Analytics (ONLY ONCE, TOP OF HEAD) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CL847BSHY4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('js', new Date());

  // ===== BOT DETECTION (RUN FIRST) =====
  const isBot = (
    navigator.webdriver || 
    /bot|crawl|spider|HeadlessChrome|slurp|bingpreview/i.test(navigator.userAgent)
  );

  // ===== ALWAYS FIRE PAGEVIEW (IMPORTANT) =====
  // Even bots get pageview → so GA doesn't miss users
  gtag('config', 'G-CL847BSHY4', {
    page_view: true
  });

  // ===== MARK USER TYPE =====
  gtag('event', 'user_type_detected', {
    user_type: isBot ? 'bot' : 'human_candidate'
  });

  // ===== HUMAN VERIFICATION (REAL USERS ONLY) =====
  if (!isBot) {
    const events = ['mousedown', 'touchstart', 'scroll', 'keydown'];

    const verifyHuman = () => {
      gtag('event', 'human_verified', {
        status: 'confirmed_human'
      });

      // stop after first interaction
      events.forEach(e => window.removeEventListener(e, verifyHuman));
    };

    events.forEach(e => window.addEventListener(e, verifyHuman, { passive: true }));

    // ===== BACKUP: AUTO CONFIRM AFTER 3s =====
    // (Fixes your "GSC clicks but no GA data" issue)
    setTimeout(() => {
      gtag('event', 'human_verified', {
        status: 'auto_confirmed'
      });
    }, 3000);
  }
</script>
<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>

<!-- Favicon - For tool pages (inside /tools/ folder) -->
<link rel="apple-touch-icon" sizes="180x180" href="../assets/images/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../assets/images/favicon-16x16.png">
<link rel="manifest" href="../assets/images/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">

    <title>Contact Form</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            max-width: 500px;
            margin: 40px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .form-container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h2 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a67d8;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Contact Us</h2>
        <form id="contactForm" onsubmit="event.preventDefault(); alert('Form submitted!');">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" placeholder="Enter your name">
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email">
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" rows="4" placeholder="Enter your message"></textarea>
            </div>
            <button type="submit">Send Message</button>
        </form>
    </div>
</body>
</html>`,

        dashboard: `<!DOCTYPE html>
<html>
<head>
<script>
<!-- Google Analytics (ONLY ONCE, TOP OF HEAD) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CL847BSHY4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('js', new Date());

  // ===== BOT DETECTION (RUN FIRST) =====
  const isBot = (
    navigator.webdriver || 
    /bot|crawl|spider|HeadlessChrome|slurp|bingpreview/i.test(navigator.userAgent)
  );

  // ===== ALWAYS FIRE PAGEVIEW (IMPORTANT) =====
  // Even bots get pageview → so GA doesn't miss users
  gtag('config', 'G-CL847BSHY4', {
    page_view: true
  });

  // ===== MARK USER TYPE =====
  gtag('event', 'user_type_detected', {
    user_type: isBot ? 'bot' : 'human_candidate'
  });

  // ===== HUMAN VERIFICATION (REAL USERS ONLY) =====
  if (!isBot) {
    const events = ['mousedown', 'touchstart', 'scroll', 'keydown'];

    const verifyHuman = () => {
      gtag('event', 'human_verified', {
        status: 'confirmed_human'
      });

      // stop after first interaction
      events.forEach(e => window.removeEventListener(e, verifyHuman));
    };

    events.forEach(e => window.addEventListener(e, verifyHuman, { passive: true }));

    // ===== BACKUP: AUTO CONFIRM AFTER 3s =====
    // (Fixes your "GSC clicks but no GA data" issue)
    setTimeout(() => {
      gtag('event', 'human_verified', {
        status: 'auto_confirmed'
      });
    }, 3000);
  }
</script>
<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>

<!-- Favicon - For tool pages (inside /tools/ folder) -->
<link rel="apple-touch-icon" sizes="180x180" href="../assets/images/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../assets/images/favicon-16x16.png">
<link rel="manifest" href="../assets/images/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">

    <title>Analytics Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f3f4f6;
            padding: 20px;
        }
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #111827;
            font-size: 24px;
        }
        .date {
            color: #6b7280;
            background: white;
            padding: 8px 16px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .stat-title {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-value {
            color: #111827;
            font-size: 32px;
            font-weight: 700;
            margin: 10px 0;
        }
        .stat-change {
            color: #10b981;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .chart {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .chart h3 {
            color: #111827;
            margin-bottom: 20px;
        }
        .bar-container {
            display: flex;
            align-items: flex-end;
            gap: 20px;
            height: 200px;
        }
        .bar {
            flex: 1;
            background: #3b82f6;
            border-radius: 8px 8px 0 0;
            transition: height 0.3s;
            position: relative;
            min-width: 40px;
        }
        .bar-label {
            text-align: center;
            margin-top: 10px;
            color: #6b7280;
            font-size: 12px;
        }
        .bar-value {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            color: #111827;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>Analytics Dashboard</h1>
            <div class="date">March 18, 2026</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-title">Total Users</div>
                <div class="stat-value">45.2K</div>
                <div class="stat-change">
                    ↑ +12.5%
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Page Views</div>
                <div class="stat-value">89.4K</div>
                <div class="stat-change">
                    ↑ +8.2%
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Revenue</div>
                <div class="stat-value">$12.3K</div>
                <div class="stat-change">
                    ↑ +5.7%
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Conversion</div>
                <div class="stat-value">3.2%</div>
                <div class="stat-change">
                    ↓ -0.3%
                </div>
            </div>
        </div>

        <div class="chart">
            <h3>Weekly Traffic</h3>
            <div class="bar-container">
                <div class="bar" style="height: 120px;">
                    <span class="bar-value">2.4K</span>
                </div>
                <div class="bar" style="height: 180px;">
                    <span class="bar-value">3.8K</span>
                </div>
                <div class="bar" style="height: 150px;">
                    <span class="bar-value">3.1K</span>
                </div>
                <div class="bar" style="height: 210px;">
                    <span class="bar-value">4.5K</span>
                </div>
                <div class="bar" style="height: 190px;">
                    <span class="bar-value">4.0K</span>
                </div>
                <div class="bar" style="height: 250px;">
                    <span class="bar-value">5.2K</span>
                </div>
                <div class="bar" style="height: 170px;">
                    <span class="bar-value">3.5K</span>
                </div>
            </div>
            <div style="display: flex; gap: 20px; margin-top: 10px;">
                <div style="flex:1; text-align: center;">Mon</div>
                <div style="flex:1; text-align: center;">Tue</div>
                <div style="flex:1; text-align: center;">Wed</div>
                <div style="flex:1; text-align: center;">Thu</div>
                <div style="flex:1; text-align: center;">Fri</div>
                <div style="flex:1; text-align: center;">Sat</div>
                <div style="flex:1; text-align: center;">Sun</div>
            </div>
        </div>
    </div>
</body>
</html>`
    };
    
    // Update character count
    function updateCharCount() {
        if (charCount && htmlInput) {
            const count = htmlInput.value.length;
            charCount.textContent = `${count} characters`;
        }
    }
    
    // Update preview - FIXED VERSION
    function updatePreview() {
        if (!preview || !htmlInput) return;
        
        let html = htmlInput.value;
        if (!html || html.trim() === '') {
            html = '<!DOCTYPE html><html><head>
<script>
<!-- Google Analytics (ONLY ONCE, TOP OF HEAD) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CL847BSHY4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('js', new Date());

  // ===== BOT DETECTION (RUN FIRST) =====
  const isBot = (
    navigator.webdriver || 
    /bot|crawl|spider|HeadlessChrome|slurp|bingpreview/i.test(navigator.userAgent)
  );

  // ===== ALWAYS FIRE PAGEVIEW (IMPORTANT) =====
  // Even bots get pageview → so GA doesn't miss users
  gtag('config', 'G-CL847BSHY4', {
    page_view: true
  });

  // ===== MARK USER TYPE =====
  gtag('event', 'user_type_detected', {
    user_type: isBot ? 'bot' : 'human_candidate'
  });

  // ===== HUMAN VERIFICATION (REAL USERS ONLY) =====
  if (!isBot) {
    const events = ['mousedown', 'touchstart', 'scroll', 'keydown'];

    const verifyHuman = () => {
      gtag('event', 'human_verified', {
        status: 'confirmed_human'
      });

      // stop after first interaction
      events.forEach(e => window.removeEventListener(e, verifyHuman));
    };

    events.forEach(e => window.addEventListener(e, verifyHuman, { passive: true }));

    // ===== BACKUP: AUTO CONFIRM AFTER 3s =====
    // (Fixes your "GSC clicks but no GA data" issue)
    setTimeout(() => {
      gtag('event', 'human_verified', {
        status: 'auto_confirmed'
      });
    }, 3000);
  }
</script>
<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>

<!-- Favicon - For tool pages (inside /tools/ folder) -->
<link rel="apple-touch-icon" sizes="180x180" href="../assets/images/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../assets/images/favicon-16x16.png">
<link rel="manifest" href="../assets/images/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">
<title>Empty Preview</title></head><body><h3>Start typing HTML to see preview...</h3></body></html>';
        }
        
        const previewDoc = preview.contentDocument || preview.contentWindow.document;
        
        previewDoc.open();
        previewDoc.write(html);
        previewDoc.close();
        
        updateCharCount();
    }
    
    // Input event with auto-refresh
    htmlInput.addEventListener('input', function() {
        updateCharCount();
        
        // Re-check user status on each input
        checkUserStatus();
        
        if (!isGuest) {
            // Logged in users - unlimited
            if (autoRefresh && autoRefresh.checked) {
                if (previewTimer) {
                    clearTimeout(previewTimer);
                }
                previewTimer = setTimeout(() => {
                    updatePreview();
                }, 300);
            }
        } else {
            // Guest users - check if this is their first input
            let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
            
            if (guestUses < 3) {
                if (autoRefresh && autoRefresh.checked) {
                    if (previewTimer) {
                        clearTimeout(previewTimer);
                    }
                    previewTimer = setTimeout(() => {
                        updatePreview();
                        
                        // Count as a use only after they've actually written something
                        if (htmlInput.value.trim() && !hasCountedThisSession) {
                            guestUses++;
                            localStorage.setItem('toolsnova_guest_uses', guestUses);
                            hasCountedThisSession = true;
                            
                            if (guestUses >= 3) {
                                setTimeout(() => {
                                    alert('You have used all 3 guest tries. Sign up for unlimited access!');
                                }, 500);
                            }
                        }
                    }, 300);
                }
            } else {
                htmlInput.value = '';
                alert('You have used all 3 guest tries. Please sign up for unlimited access!');
                window.location.href = '../signup.html';
            }
        }
    });
    
    // Word wrap toggle
    if (wordWrap && htmlInput) {
        wordWrap.addEventListener('change', function() {
            if (this.checked) {
                htmlInput.classList.add('word-wrap');
            } else {
                htmlInput.classList.remove('word-wrap');
            }
        });
    }
    
    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            updatePreview();
        });
    }
    
    // Load sample button
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', function() {
            checkUserStatus(); // Re-check before action
            
            if (!isGuest) {
                // Logged in users - unlimited access
                currentSampleIndex = (currentSampleIndex + 1) % sampleKeys.length;
                htmlInput.value = samples[sampleKeys[currentSampleIndex]];
                updatePreview();
                hasCountedThisSession = false;
            } else {
                // Guest users - check limit
                let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                    parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
                
                if (guestUses < 3) {
                    currentSampleIndex = (currentSampleIndex + 1) % sampleKeys.length;
                    htmlInput.value = samples[sampleKeys[currentSampleIndex]];
                    updatePreview();
                    
                    guestUses++;
                    localStorage.setItem('toolsnova_guest_uses', guestUses);
                    hasCountedThisSession = true;
                    
                    if (guestUses >= 3) {
                        setTimeout(() => {
                            alert('You have used all 3 guest tries. Sign up for unlimited access!');
                        }, 500);
                    }
                } else {
                    alert('You have used all 3 guest tries. Please sign up for unlimited access!');
                    window.location.href = '../signup.html';
                }
            }
        });
    }
    
    // Copy HTML
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const text = htmlInput.value;
            if (!text) {
                alert('Nothing to copy');
                return;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                const original = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = original;
                }, 2000);
            }).catch(() => {
                alert('Failed to copy');
            });
        });
    }
    
    // Download HTML
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const text = htmlInput.value;
            if (!text) {
                alert('Nothing to download');
                return;
            }
            
            const blob = new Blob([text], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'preview.html';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    // Clear all
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Clear all HTML?')) {
                htmlInput.value = '';
                updatePreview();
                hasCountedThisSession = false;
            }
        });
    }
    
    // View mode buttons
    if (sideBySideBtn && editorOnlyBtn && previewOnlyBtn && editorContent) {
        sideBySideBtn.addEventListener('click', function() {
            sideBySideBtn.classList.add('active');
            editorOnlyBtn.classList.remove('active');
            previewOnlyBtn.classList.remove('active');
            
            editorContent.classList.remove('editor-only', 'preview-only');
        });
        
        editorOnlyBtn.addEventListener('click', function() {
            editorOnlyBtn.classList.add('active');
            sideBySideBtn.classList.remove('active');
            previewOnlyBtn.classList.remove('active');
            
            editorContent.classList.remove('preview-only');
            editorContent.classList.add('editor-only');
        });
        
        previewOnlyBtn.addEventListener('click', function() {
            previewOnlyBtn.classList.add('active');
            sideBySideBtn.classList.remove('active');
            editorOnlyBtn.classList.remove('active');
            
            editorContent.classList.remove('editor-only');
            editorContent.classList.add('preview-only');
            
            setTimeout(() => {
                updatePreview();
            }, 50);
        });
    }
    
    // Set initial empty preview
    updatePreview();
    
    console.log('HTML Preview initialization complete');
});