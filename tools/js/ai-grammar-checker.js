// ===== AI GRAMMAR CHECKER - SECURE VERSION (Firebase AI Logic) =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Grammar Checker loaded');
    
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
    
    function calculateGrammarIssues(original, corrected) {
        let issues = 0;
        const explanations = [];
        
        const patterns = [
            { pattern: /go(es)?\s+to\s+school/, original: 'go', corrected: 'goes', issue: 'Subject-verb agreement: third person singular needs "goes"' },
            { pattern: /children\s+is/, original: 'is', corrected: 'are', issue: 'Subject-verb agreement: "children" is plural, use "are"' },
            { pattern: /have\s+went/, original: 'have went', corrected: 'went', issue: 'Verb tense: incorrect past participle, use "went"' },
            { pattern: /don't\s+like/, original: "don't", corrected: "doesn't", issue: 'Subject-verb agreement: third person singular needs "doesn\'t"' },
            { pattern: /their\s+going/, original: 'their', corrected: "they're", issue: 'Homophone error: "their" vs "they\'re"' },
            { pattern: /me\s+and\s+my\s+friend/, original: 'me and my friend', corrected: 'my friend and I', issue: 'Pronoun order: should be "my friend and I"' }
        ];
        
        patterns.forEach(pattern => {
            if (original.toLowerCase().includes(pattern.original.toLowerCase()) && 
                corrected.toLowerCase().includes(pattern.corrected.toLowerCase())) {
                issues++;
                explanations.push(pattern.issue);
            }
        });
        
        if (issues === 0 && original !== corrected) {
            issues = Math.max(1, Math.floor(Math.abs(original.length - corrected.length) / 10));
        }
        
        return { issues, explanations };
    }
    
    // 🔥 SECURE GRAMMAR CHECK USING FIREBASE AI LOGIC
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
            // 🔥 FIREBASE AI LOGIC - NO API KEY NEEDED!
            const ai = firebase.ai();
            const model = ai.generativeModel('gemini-2.5-flash-lite');
            
            const prompt = `Fix grammar and spelling. Return only corrected text. No explanations, no quotes:\n\n${text}`;
            const result = await model.generateContent(prompt);
            const corrected = result.response.text().trim();
            
            if (!corrected || corrected.length === 0) {
                throw new Error('No response received');
            }
            
            correctedText.textContent = corrected;
            originalText.textContent = text;
            
            const { issues, explanations } = calculateGrammarIssues(text, corrected);
            issuesFixed.textContent = issues;
            suggestionCount.textContent = issues;
            
            if (explanations.length > 0) {
                explanationList.innerHTML = explanations.map((exp, i) => `
                    <div class="explanation-item">
                        <div class="issue">Issue #${i+1}</div>
                        <div class="explanation-text">${exp}</div>
                    </div>
                `).join('');
            } else if (text !== corrected) {
                explanationList.innerHTML = `
                    <div class="explanation-item">
                        <div class="issue">Grammar Fixed</div>
                        <div class="explanation-text">Your text has been corrected for grammar and spelling.</div>
                    </div>
                `;
            } else {
                explanationList.innerHTML = '<div class="explanation-item"><div class="explanation-text">✓ No grammar errors detected! Your text looks great.</div></div>';
                issuesFixed.textContent = '0';
                suggestionCount.textContent = '0';
            }
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Grammar check error:', error);
            loading.style.display = 'none';
            showError('Service temporarily unavailable. Please try again.');
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
    console.log('✅ AI Grammar Checker ready with Firebase AI Logic');
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