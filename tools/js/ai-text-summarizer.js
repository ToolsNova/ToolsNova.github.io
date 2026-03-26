// ===== AI TEXT SUMMARIZER - SECURE VERSION (Firebase AI Logic) =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Text Summarizer loaded');
    
    const textInput = document.getElementById('textInput');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const summaryContent = document.getElementById('summaryContent');
    const keyPointsList = document.getElementById('keyPointsList');
    const originalWords = document.getElementById('originalWords');
    const summaryWords = document.getElementById('summaryWords');
    const reductionPercent = document.getElementById('reductionPercent');
    const copyBtn = document.getElementById('copyBtn');
    const newBtn = document.getElementById('newBtn');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const lengthSelect = document.getElementById('lengthSelect');
    const formatSelect = document.getElementById('formatSelect');
    const sampleBtns = document.querySelectorAll('.sample-btn');
    
    const samples = {
        article: `Climate change is one of the most pressing issues facing our planet today. Rising global temperatures, caused primarily by human activities such as burning fossil fuels and deforestation, are leading to a cascade of environmental impacts. These include more frequent and severe weather events like hurricanes, droughts, and floods; rising sea levels that threaten coastal communities; and disruptions to ecosystems and biodiversity. The scientific consensus is clear: urgent action is needed to reduce greenhouse gas emissions and transition to sustainable energy sources. International agreements like the Paris Agreement aim to unite countries in this effort, but implementation remains a challenge.`,
        research: `A recent study published in the Journal of Neuroscience examined the effects of mindfulness meditation on brain structure and function. Researchers recruited 40 participants with no prior meditation experience and randomly assigned them to either an 8-week mindfulness-based stress reduction program or a control group. MRI scans were conducted before and after the intervention. Results showed that the meditation group exhibited increased gray matter density in the hippocampus, a region critical for learning and memory, as well as in brain areas associated with self-awareness and emotional regulation.`
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
    
    function countWords(text) {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }
    
    // 🔥 SECURE SUMMARIZATION USING FIREBASE AI LOGIC
    async function summarizeText() {
        const text = textInput.value.trim();
        
        if (!text) {
            showError('Please enter some text to summarize');
            return;
        }
        
        if (text.length < 100) {
            showError('Please enter at least 100 characters for a meaningful summary');
            return;
        }
        
        if (!canUseTool()) {
            showError('You have used all 3 guest tries. Please sign up for unlimited access!');
            setTimeout(() => window.location.href = '../signup.html', 2000);
            return;
        }
        
        const length = lengthSelect.value;
        const format = formatSelect.value;
        const originalWordCount = countWords(text);
        
        let lengthInstruction = '';
        switch(length) {
            case 'short':
                lengthInstruction = 'Maximum 2 sentences or 20 words.';
                break;
            case 'medium':
                lengthInstruction = 'Maximum 4 sentences or 50 words.';
                break;
            case 'long':
                lengthInstruction = 'Maximum 6 sentences or 80 words.';
                break;
        }
        
        let formatInstruction = format === 'bullet' ? 'Format as 2-4 bullet points with •.' : 'Format as a single paragraph.';
        
        summarizeBtn.disabled = true;
        summarizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Summarizing...';
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        
        try {
            // 🔥 FIREBASE AI LOGIC - NO API KEY NEEDED!
            const ai = firebase.ai();
            const model = ai.generativeModel('gemini-2.5-flash-lite');
            
            const prompt = `Summarize the text below. CRITICAL RULES:
1. ${lengthInstruction}
2. ${formatInstruction}
3. Keep only the core message
4. Remove examples and details

Text:
"""
${text}
"""

Summary:`;
            
            const result = await model.generateContent(prompt);
            let summary = result.response.text().trim();
            
            const summaryWordCount = countWords(summary);
            const reduction = Math.round(((originalWordCount - summaryWordCount) / originalWordCount) * 100);
            
            summaryContent.textContent = summary;
            originalWords.textContent = originalWordCount;
            summaryWords.textContent = summaryWordCount;
            reductionPercent.textContent = Math.max(0, reduction);
            
            const reductionElement = document.getElementById('reductionPercent');
            if (reduction < 30) {
                reductionElement.style.color = '#ef4444';
            } else if (reduction < 50) {
                reductionElement.style.color = '#f59e0b';
            } else {
                reductionElement.style.color = '#10b981';
            }
            
            // Extract key points
            const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
            const keyPoints = sentences.slice(0, 3).map(s => s.trim());
            
            if (keyPoints.length > 0) {
                keyPointsList.innerHTML = keyPoints.map(point => 
                    `<li><i class="fas fa-circle" style="font-size: 0.5rem; color: #3b82f6;"></i> <span>${point}</span></li>`
                ).join('');
                document.getElementById('keyPointsSection').style.display = 'block';
            } else {
                document.getElementById('keyPointsSection').style.display = 'none';
            }
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Summarization error:', error);
            loading.style.display = 'none';
            showError('Service temporarily unavailable. Please try again.');
        }
        
        summarizeBtn.disabled = false;
        summarizeBtn.innerHTML = '<i class="fas fa-magic"></i> Summarize Text';
    }
    
    summarizeBtn.addEventListener('click', summarizeText);
    
    copyBtn.addEventListener('click', function() {
        const text = summaryContent.textContent;
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
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            summarizeText();
        }
    });
    
    updateStats();
    console.log('✅ AI Text Summarizer ready with Firebase AI Logic');
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