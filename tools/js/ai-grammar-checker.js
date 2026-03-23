// ===== AI GRAMMAR CHECKER - GROQ API VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Grammar Checker loaded');
    
    // 🔑 YOUR GROQ API KEY
    const GROQ_API_KEY = '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';
    
    // ✅ GROQ MODELS - Latest available
    const MODELS = [
        'llama-3.3-70b-versatile',    // Most capable
        'llama-3.1-8b-instant',        // Fast and accurate
        'gemma2-9b-it'                 // Lightweight fallback
    ];
    
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    
    // DOM elements
    const textInput = document.getElementById('textInput');
    const checkBtn = document.getElementById('checkBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const correctedText = document.getElementById('correctedText');
    const originalText = document.getElementById('originalText');
    const explanationList = document.getElementById('explanationList');
    const issuesFixed = document.getElementById('issuesFixed');
    const suggestionCount = document.getElementById('suggestionCount');
    const copyBtn = document.getElementById('copyBtn');
    const newBtn = document.getElementById('newBtn');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const sampleBtns = document.querySelectorAll('.sample-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // Sample texts
    const samples = {
        grammar: `She go to school everyday. The children is playing in the park. I have went to the store yesterday. He don't like coffee. Their going to the movies tonight. Me and my friend is going to the party.`,
        
        clean: `She goes to school every day. The children are playing in the park. I went to the store yesterday. He doesn't like coffee. They're going to the movies tonight. My friend and I are going to the party.`
    };
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId + 'Tab').classList.add('active');
        });
    });
    
    function updateStats() {
        const text = textInput.value;
        charCount.textContent = text.length;
        wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    }
    
    textInput.addEventListener('input', updateStats);
    
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.sample;
            textInput.value = samples[type];
            updateStats();
        });
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    function canUseTool() {
        if (typeof firebase !== 'undefined') {
            const user = firebase.auth().currentUser;
            if (user) return true;
            let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
            return guestUses < 3;
        }
        return true;
    }
    
    function trackToolUsage() {
        if (typeof firebase !== 'undefined') {
            const user = firebase.auth().currentUser;
            if (!user) {
                let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                    parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
                guestUses++;
                localStorage.setItem('toolsnova_guest_uses', guestUses);
            }
        }
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Function to calculate grammar issues
    function calculateGrammarIssues(original, corrected) {
        let issues = 0;
        const explanations = [];
        
        // Common grammar patterns
        const patterns = [
            { pattern: /go(es)?\s+to\s+school/, original: 'go', corrected: 'goes', issue: 'Subject-verb agreement: third person singular needs "goes"' },
            { pattern: /children\s+is/, original: 'is', corrected: 'are', issue: 'Subject-verb agreement: "children" is plural, use "are"' },
            { pattern: /have\s+went/, original: 'have went', corrected: 'went', issue: 'Verb tense: incorrect past participle, use "went"' },
            { pattern: /don't\s+like/, original: "don't", corrected: "doesn't", issue: 'Subject-verb agreement: third person singular needs "doesn\'t"' },
            { pattern: /their\s+going/, original: 'their', corrected: "they're", issue: 'Homophone error: "their" vs "they\'re"' },
            { pattern: /me\s+and\s+my\s+friend/, original: 'me and my friend', corrected: 'my friend and I', issue: 'Pronoun order: should be "my friend and I"' },
            { pattern: /everyday\b/, original: 'everyday', corrected: 'every day', issue: 'Word usage: "every day" (two words) vs "everyday" (adjective)' }
        ];
        
        patterns.forEach(pattern => {
            if (original.toLowerCase().includes(pattern.original.toLowerCase()) && 
                corrected.toLowerCase().includes(pattern.corrected.toLowerCase())) {
                issues++;
                explanations.push(pattern.issue);
            }
        });
        
        // Count word differences
        const originalWords = original.split(/\s+/);
        const correctedWords = corrected.split(/\s+/);
        const wordDiff = Math.abs(originalWords.length - correctedWords.length);
        
        // If we found specific patterns, use those, otherwise estimate
        if (issues === 0) {
            issues = Math.max(1, Math.floor(wordDiff + (original.length - corrected.length) / 10));
        }
        
        return { issues, explanations };
    }
    
    // ✅ Call Groq API with retry and model fallback
    async function callGroqWithRetry(prompt, maxRetries = 2) {
        let lastError = null;
        
        for (const model of MODELS) {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`📡 Trying ${model} (attempt ${attempt}/${maxRetries})...`);
                    
                    const requestBody = {
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional grammar checker. Fix all grammar, spelling, and punctuation errors. Return ONLY the corrected text, no explanations, no markdown, no quotes.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.1,
                        max_tokens: 2048,
                        top_p: 0.9
                    };
                    
                    const response = await fetch(GROQ_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${GROQ_API_KEY}`
                        },
                        body: JSON.stringify(requestBody)
                    });
                    
                    if (response.status === 401) {
                        throw new Error('Invalid API key');
                    }
                    
                    if (response.status === 503 || response.status === 429) {
                        console.log(`⏳ Service busy, waiting...`);
                        await sleep(2000 * attempt);
                        continue;
                    }
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
                        
                        if (errorMsg.includes('decommissioned')) {
                            console.log(`⚠️ Model ${model} decommissioned, trying next...`);
                            break;
                        }
                        throw new Error(errorMsg);
                    }
                    
                    const data = await response.json();
                    
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        let correctedText = data.choices[0].message.content;
                        // Clean up the response
                        correctedText = correctedText.trim()
                            .replace(/^["']|["']$/g, '') // Remove quotes
                            .replace(/^Corrected:\s*/i, '') // Remove "Corrected:" prefix
                            .replace(/^Here's the corrected text:\s*/i, '')
                            .replace(/^The corrected text is:\s*/i, '');
                        console.log(`✅ ${model} succeeded!`);
                        return correctedText;
                    }
                    
                } catch (error) {
                    console.log(`❌ ${model} failed:`, error.message);
                    lastError = error;
                    
                    if (error.message.includes('Invalid API key') || error.message.includes('decommissioned')) {
                        break;
                    }
                    
                    await sleep(1000);
                }
            }
        }
        
        throw lastError || new Error('All models failed');
    }
    
    async function checkGrammar() {
        const text = textInput.value.trim();
        
        if (!text) {
            showError('Please enter some text to check');
            return;
        }
        
        if (text.length < 10) {
            showError('Please enter at least 10 characters');
            return;
        }
        
        if (!canUseTool()) {
            showError('You have used all 3 guest tries. Please sign up!');
            setTimeout(() => window.location.href = '../signup.html', 2000);
            return;
        }
        
        checkBtn.disabled = true;
        checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking grammar...';
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            const prompt = `Fix all grammar, spelling, and punctuation errors in this text. Return ONLY the corrected text, no explanations, no markdown, no quotes.

Original text:
"""
${text}
"""

Corrected text:`;
            
            const corrected = await callGroqWithRetry(prompt);
            
            // Validate corrected text
            if (!corrected || corrected.length === 0) {
                throw new Error('No response received');
            }
            
            // Update UI
            correctedText.textContent = corrected;
            originalText.textContent = text;
            
            // Calculate grammar issues
            const { issues, explanations } = calculateGrammarIssues(text, corrected);
            
            issuesFixed.textContent = issues;
            suggestionCount.textContent = issues;
            
            // Display explanations
            if (explanations.length > 0) {
                explanationList.innerHTML = explanations.map((exp, i) => `
                    <div class="explanation-item">
                        <div class="issue">Issue #${i+1}</div>
                        <div class="explanation-text">${exp}</div>
                    </div>
                `).join('');
            } else {
                // Generate basic explanations if none found
                const changes = [];
                if (text !== corrected) {
                    const originalWords = text.split(/\s+/);
                    const correctedWords = corrected.split(/\s+/);
                    
                    if (originalWords.length !== correctedWords.length) {
                        changes.push(`Word count adjusted from ${originalWords.length} to ${correctedWords.length} words`);
                    }
                    
                    if (text.length !== corrected.length) {
                        changes.push(`Text length optimized by ${Math.abs(text.length - corrected.length)} characters`);
                    }
                    
                    changes.push('Grammar and spelling errors corrected');
                    
                    explanationList.innerHTML = changes.map((change, i) => `
                        <div class="explanation-item">
                            <div class="issue">Improvement #${i+1}</div>
                            <div class="explanation-text">${change}</div>
                        </div>
                    `).join('');
                } else {
                    explanationList.innerHTML = '<div class="explanation-item"><div class="explanation-text">✓ No grammar errors detected! Your text looks great.</div></div>';
                    issuesFixed.textContent = '0';
                    suggestionCount.textContent = '0';
                }
            }
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            
            // Scroll to results
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Grammar check error:', error);
            loading.style.display = 'none';
            
            let errorMsg = 'Service temporarily unavailable. ';
            if (error.message.includes('Invalid API key')) {
                errorMsg = 'Invalid API key. Please check configuration.';
            } else if (error.message.includes('503') || error.message.includes('429')) {
                errorMsg = 'Service is busy. Please try again in a few moments.';
            } else {
                errorMsg += 'Please try again.';
            }
            
            showError(errorMsg);
        }
        
        checkBtn.disabled = false;
        checkBtn.innerHTML = '<i class="fas fa-check-double"></i> Check Grammar';
    }
    
    checkBtn.addEventListener('click', checkGrammar);
    
    copyBtn.addEventListener('click', function() {
        const text = correctedText.textContent;
        if (text && text !== 'No text to display') {
            navigator.clipboard.writeText(text).then(() => {
                const original = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = original;
                }, 2000);
            }).catch(() => {
                showError('Failed to copy text');
            });
        } else {
            showError('No text to copy');
        }
    });
    
    newBtn.addEventListener('click', function() {
        textInput.value = '';
        updateStats();
        resultCard.style.display = 'none';
        textInput.focus();
    });
    
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            checkGrammar();
        }
    });
    
    updateStats();
    console.log('✅ AI Grammar Checker ready with Groq API');
});

// Firebase auth state observer
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged(function(user) {
        const authLinks = document.getElementById('authLinks');
        const userMenu = document.getElementById('userMenu');
        const userGreeting = document.getElementById('userGreeting');
        const footerLogin = document.getElementById('footerLogin');
        const footerSignup = document.getElementById('footerSignup');
        const footerLogout = document.getElementById('footerLogout');
        const footerGuestInfo = document.getElementById('footerGuestInfo');
        const footerUserInfo = document.getElementById('footerUserInfo');
        
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
        } else {
            if (authLinks) authLinks.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (footerLogin) footerLogin.style.display = 'block';
            if (footerSignup) footerSignup.style.display = 'block';
            if (footerLogout) footerLogout.style.display = 'none';
            if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
            if (footerUserInfo) footerUserInfo.style.display = 'none';
        }
    });
}