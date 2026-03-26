// ===== AI CONTENT DETECTOR - SECURE VERSION (Firebase AI Logic) =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Content Detector loaded');
    
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const aiScore = document.getElementById('aiScore');
    const humanScore = document.getElementById('humanScore');
    const confidenceBadge = document.getElementById('confidenceBadge');
    const analysisText = document.getElementById('analysisText');
    const indicatorsList = document.getElementById('indicatorsList');
    const newBtn = document.getElementById('newBtn');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const sampleBtns = document.querySelectorAll('.sample-btn');
    
    const samples = {
        ai: `The rapid advancement of artificial intelligence has precipitated a paradigm shift across multiple sectors of the global economy. This transformative technology, characterized by its ability to simulate human cognitive functions, is poised to revolutionize industries ranging from healthcare to finance.`,
        human: `I've been thinking a lot about AI lately, and honestly it's kind of scary but also exciting? Like, my friend just lost his job because they replaced his team with some automation software, and that sucks.`
    };
    
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
    
    function parseResponse(text) {
        let result = {
            aiProbability: 50,
            humanProbability: 50,
            confidence: 'Medium',
            analysis: '',
            indicators: []
        };
        
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('likely ai') || lowerText.includes('ai-generated') || lowerText.includes('written by ai')) {
            result.aiProbability = 85;
            result.humanProbability = 15;
            result.confidence = 'High';
            result.indicators = ['Repetitive sentence structures', 'Lack of personal voice', 'Overly formal language'];
        } else if (lowerText.includes('likely human') || lowerText.includes('human-written') || lowerText.includes('written by a human')) {
            result.aiProbability = 15;
            result.humanProbability = 85;
            result.confidence = 'High';
            result.indicators = ['Natural variation', 'Personal voice', 'Emotional depth'];
        } else {
            result.aiProbability = 50;
            result.humanProbability = 50;
            result.confidence = 'Low';
            result.indicators = ['Mixed patterns detected', 'Unclear indicators'];
        }
        
        result.analysis = text.substring(0, 200);
        return result;
    }
    
    // 🔥 SECURE DETECTION USING FIREBASE AI LOGIC
    async function analyzeContent() {
        const text = textInput.value.trim();
        
        if (!text) {
            showError('Please enter some text to analyze');
            return;
        }
        
        if (text.length < 50) {
            showError('Please enter at least 50 characters for accurate analysis');
            return;
        }
        
        if (!canUseTool()) {
            showError('You have used all 3 guest tries. Please sign up for unlimited access!');
            setTimeout(() => window.location.href = '../signup.html', 2000);
            return;
        }
        
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        
        try {
            // 🔥 FIREBASE AI LOGIC - NO API KEY NEEDED!
            const ai = firebase.ai();
            const model = ai.generativeModel('gemini-2.5-flash-lite');
            
            const prompt = `Analyze if this text was written by AI. Return ONLY one of these three exact responses: "Likely AI-written", "Likely Human-written", or "Uncertain". Do not add any other text:\n\n${text}`;
            const result = await model.generateContent(prompt);
            const detection = result.response.text().trim();
            
            const parsed = parseResponse(detection);
            
            aiScore.textContent = parsed.aiProbability + '%';
            humanScore.textContent = parsed.humanProbability + '%';
            
            const confidenceColors = {
                'High': '#10b981',
                'Medium': '#f59e0b',
                'Low': '#ef4444'
            };
            confidenceBadge.innerHTML = `<i class="fas fa-check-circle"></i> ${parsed.confidence} Confidence`;
            confidenceBadge.style.color = confidenceColors[parsed.confidence];
            confidenceBadge.style.backgroundColor = confidenceColors[parsed.confidence] + '20';
            
            analysisText.textContent = parsed.analysis;
            
            const isAI = parsed.aiProbability > 70;
            indicatorsList.innerHTML = parsed.indicators.map(ind => {
                const icon = isAI ? 'exclamation-triangle' : 'check-circle';
                const color = isAI ? '#ef4444' : '#10b981';
                return `<li><i class="fas fa-${icon}" style="color: ${color}; margin-right: 10px; width: 20px;"></i> ${ind}</li>`;
            }).join('');
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            
        } catch (error) {
            console.error('Analysis error:', error);
            loading.style.display = 'none';
            showError('Service temporarily unavailable. Please try again.');
        }
        
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Content';
    }
    
    analyzeBtn.addEventListener('click', analyzeContent);
    
    newBtn.addEventListener('click', function() {
        textInput.value = '';
        updateStats();
        resultCard.style.display = 'none';
        textInput.focus();
    });
    
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeContent();
        }
    });
    
    updateStats();
    console.log('✅ AI Content Detector ready with Firebase AI Logic');
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