// ===== AI TEXT SUMMARIZER - GROQ API VERSION (FIXED LENGTH) =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Text Summarizer loaded');
    
    // 🔑 YOUR GROQ API KEY
    const GROQ_API_KEY = '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';
    
    // ✅ GROQ MODELS - Latest available
    const MODELS = [
        'llama-3.3-70b-versatile',    // Most capable for summarization
        'llama-3.1-8b-instant',        // Fast and accurate
        'gemma2-9b-it'                 // Lightweight fallback
    ];
    
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    
    // DOM elements
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
    
    // Sample texts
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
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Calculate target summary length based on original
    function getTargetLength(originalWordCount, selectedLength) {
        switch(selectedLength) {
            case 'short':
                return Math.max(15, Math.floor(originalWordCount * 0.1)); // 10% of original, min 15 words
            case 'medium':
                return Math.max(30, Math.floor(originalWordCount * 0.2)); // 20% of original, min 30 words
            case 'long':
                return Math.max(50, Math.floor(originalWordCount * 0.3)); // 30% of original, min 50 words
            default:
                return Math.max(30, Math.floor(originalWordCount * 0.2));
        }
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
                                content: 'You are a concise text summarizer. Your summaries MUST be SHORTER than the original text. Extract only the most essential information. Be brief and direct.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 500,
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
                        let summary = data.choices[0].message.content;
                        // Clean up the response
                        summary = summary.trim()
                            .replace(/^["']|["']$/g, '')
                            .replace(/^Summary:\s*/i, '')
                            .replace(/^Here'?s\s+the\s+summary:\s*/i, '')
                            .replace(/^The\s+summary\s+is:\s*/i, '');
                        console.log(`✅ ${model} succeeded!`);
                        return summary;
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
        const targetWordCount = getTargetLength(originalWordCount, length);
        
        summarizeBtn.disabled = true;
        summarizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Summarizing...';
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            // Build strict length instructions
            let lengthInstruction = '';
            let maxSentences = 0;
            let maxWords = 0;
            
            switch(length) {
                case 'short':
                    lengthInstruction = `Create an EXTREMELY CONCISE summary. Maximum 2 sentences or 20 words - WHICHEVER IS SMALLER. Capture ONLY the single most important point.`;
                    maxSentences = 2;
                    maxWords = 20;
                    break;
                case 'medium':
                    lengthInstruction = `Create a CONCISE summary. Maximum 4 sentences or 50 words - WHICHEVER IS SMALLER. Capture the main points only.`;
                    maxSentences = 4;
                    maxWords = 50;
                    break;
                case 'long':
                    lengthInstruction = `Create a BRIEF summary. Maximum 6 sentences or 80 words - WHICHEVER IS SMALLER. Keep it significantly shorter than the original.`;
                    maxSentences = 6;
                    maxWords = 80;
                    break;
            }
            
            let formatInstruction = '';
            switch(format) {
                case 'paragraph':
                    formatInstruction = 'Format as a single paragraph. No bullet points.';
                    break;
                case 'bullet':
                    formatInstruction = 'Format as 2-4 bullet points with •. Each bullet should be 1 short sentence.';
                    break;
            }
            
            const prompt = `Summarize the text below. CRITICAL RULES:
1. ${lengthInstruction}
2. ${formatInstruction}
3. Summary MUST be SHORTER than the original text
4. Remove all examples, details, and repetition
5. Keep only the core message
6. Be direct - no introductory phrases like "This text discusses"

Original text:
"""
${text}
"""

Summary (be concise):`;
            
            const summary = await callGroqWithRetry(prompt);
            
            // Validate summary length
            let finalSummary = summary;
            const summaryWordCount = countWords(summary);
            
            // If summary is still too long, truncate
            if (summaryWordCount > maxWords * 1.2) {
                console.log(`Summary too long (${summaryWordCount} words), truncating...`);
                const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
                const truncatedSentences = sentences.slice(0, maxSentences);
                finalSummary = truncatedSentences.join('. ') + '.';
            }
            
            const finalWordCount = countWords(finalSummary);
            const reduction = Math.round(((originalWordCount - finalWordCount) / originalWordCount) * 100);
            
            // Ensure reduction is positive
            const actualReduction = Math.max(0, reduction);
            
            // Extract key points from summary
            let keyPoints = [];
            
            if (format === 'bullet' && finalSummary.includes('•')) {
                keyPoints = finalSummary.split('\n')
                    .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
                    .map(line => line.replace(/^[•-]\s*/, '').trim())
                    .filter(point => point.length > 0 && point.length < 100);
            } else {
                const sentences = finalSummary.split(/[.!?]+/)
                    .filter(s => s.trim().length > 10 && s.trim().length < 100)
                    .map(s => s.trim());
                keyPoints = sentences.slice(0, Math.min(3, sentences.length));
            }
            
            // Update UI
            summaryContent.textContent = finalSummary;
            originalWords.textContent = originalWordCount;
            summaryWords.textContent = finalWordCount;
            reductionPercent.textContent = actualReduction;
            
            // Color code reduction percentage
            const reductionElement = document.getElementById('reductionPercent');
            if (actualReduction < 30) {
                reductionElement.style.color = '#ef4444';
            } else if (actualReduction < 50) {
                reductionElement.style.color = '#f59e0b';
            } else {
                reductionElement.style.color = '#10b981';
            }
            
            // Display key points
            if (keyPoints.length > 0) {
                keyPointsList.innerHTML = keyPoints.map((point, index) => 
                    `<li><i class="fas fa-circle" style="font-size: 0.5rem; color: #3b82f6;"></i> <span>${point}</span></li>`
                ).join('');
                document.getElementById('keyPointsSection').style.display = 'block';
            } else {
                document.getElementById('keyPointsSection').style.display = 'none';
            }
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            resultCard.style.animation = 'fadeInUp 0.5s ease';
            
            trackToolUsage();
            
            // Scroll to results
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Show warning if summary is still too long
            if (finalWordCount >= originalWordCount) {
                showError('Warning: Summary is longer than original. Please try again with a different text.');
            }
            
        } catch (error) {
            console.error('Summarization error:', error);
            loading.style.display = 'none';
            
            let errorMsg = 'Failed to summarize text. ';
            if (error.message.includes('Invalid API key')) {
                errorMsg = 'Invalid API key. Please check configuration.';
            } else if (error.message.includes('503') || error.message.includes('429')) {
                errorMsg = 'Service is busy. Please try again in a few moments.';
            } else {
                errorMsg += 'Please try again with shorter text.';
            }
            
            showError(errorMsg);
        }
        
        summarizeBtn.disabled = false;
        summarizeBtn.innerHTML = '<i class="fas fa-magic"></i> Summarize Text';
    }
    
    summarizeBtn.addEventListener('click', summarizeText);
    
    copyBtn.addEventListener('click', function() {
        const text = summaryContent.textContent;
        if (text && text !== 'No text to display' && text !== 'Loading...') {
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
            showError('No summary to copy');
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
    console.log('✅ AI Text Summarizer ready with Groq API');
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