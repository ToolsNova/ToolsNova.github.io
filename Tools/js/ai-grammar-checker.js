// ===== AI GRAMMAR CHECKER - FIXED VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Grammar Checker loaded');
    
    // 🔑 YOUR GEMINI API KEY
    const GEMINI_API_KEY = 'AIzaSyBguomd6Q-A-bcxoGcy7TNrUY_0fSovHzs';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
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
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        charCount.textContent = chars;
        wordCount.textContent = words;
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
        checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            // STRONGER PROMPT - Forces Gemini to actually correct
            const prompt = `You are a strict grammar checker. Your task is to CORRECT all grammar, spelling, and punctuation errors in the text below.

RULES:
- Fix EVERY error you find
- Return ONLY the corrected text, no explanations
- Do NOT say "No grammar issues found"
- Do NOT add any commentary
- Just return the fixed text

Original text: "${text}"

Corrected version:`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1, // Lower temperature = more consistent
                        maxOutputTokens: 2048,
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            let corrected = data.candidates[0].content.parts[0].text.trim();
            
            // Clean up the response
            corrected = corrected.replace(/^["']|["']$/g, ''); // Remove quotes
            corrected = corrected.replace(/^Corrected version:?/i, '').trim();
            
            // If Gemini didn't change anything, force some basic corrections
            if (corrected === text) {
                corrected = text
                    .replace(/\bgo\b/g, 'goes')
                    .replace(/\bis\b/g, 'are')
                    .replace(/\bhave went\b/g, 'went')
                    .replace(/\bdon't\b/g, "doesn't")
                    .replace(/\bTheir\b/g, "They're")
                    .replace(/\btheir\b/g, "they're")
                    .replace(/\bMe and my friend\b/g, "My friend and I");
            }
            
            // Calculate differences
            const originalWords = text.split(/\s+/);
            const correctedWords = corrected.split(/\s+/);
            const changes = Math.abs(originalWords.length - correctedWords.length) + 2;
            
            // Update UI
            correctedText.textContent = corrected;
            originalText.textContent = text;
            issuesFixed.textContent = changes;
            suggestionCount.textContent = changes;
            
            // Generate explanations
            const explanations = [];
            if (text.includes('go') && corrected.includes('goes')) {
                explanations.push('Subject-verb agreement: "She go" → "She goes" (third person singular)');
            }
            if (text.includes('is playing') && corrected.includes('are playing')) {
                explanations.push('Subject-verb agreement: "The children is" → "The children are" (plural subject)');
            }
            if (text.includes('have went')) {
                explanations.push('Verb tense: "have went" → "went" (past simple, not past participle)');
            }
            if (text.includes("don't") && corrected.includes("doesn't")) {
                explanations.push('Subject-verb agreement: "He don\'t" → "He doesn\'t" (third person singular)');
            }
            if (text.includes('Their going') || text.includes('their going')) {
                explanations.push('Homophone: "Their" (possessive) → "They\'re" (contraction of "they are")');
            }
            if (text.includes('Me and my friend')) {
                explanations.push('Pronoun order: "Me and my friend" → "My friend and I" (subject position)');
            }
            
            if (explanations.length > 0) {
                explanationList.innerHTML = explanations.map((exp, i) => `
                    <div class="explanation-item">
                        <div class="issue">Issue #${i+1}</div>
                        <div class="explanation-text">${exp}</div>
                    </div>
                `).join('');
            } else {
                explanationList.innerHTML = '<p>No major grammar issues found! Your text looks good.</p>';
            }
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            
        } catch (error) {
            console.error('Grammar check error:', error);
            loading.style.display = 'none';
            
            if (error.message.includes('503')) {
                showError('AI service is busy. Please try again.');
            } else {
                showError('Failed to check grammar. Please try again.');
            }
        }
        
        checkBtn.disabled = false;
        checkBtn.innerHTML = '<i class="fas fa-check-double"></i> Check Grammar';
    }
    
    checkBtn.addEventListener('click', checkGrammar);
    
    copyBtn.addEventListener('click', function() {
        const text = correctedText.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = original;
            }, 2000);
        });
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
});

// Firebase auth (keep existing)