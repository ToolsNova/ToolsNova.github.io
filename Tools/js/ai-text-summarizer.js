// ===== AI TEXT SUMMARIZER - USING GEMINI API =====
// Based on Google Gemini API documentation and open-source summarization projects [citation:2][citation:3][citation:8]

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Text Summarizer loaded');
    
    // 🔑 YOUR GEMINI API KEY
    const GEMINI_API_KEY = 'AIzaSyBguomd6Q-A-bcxoGcy7TNrUY_0fSovHzs';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
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
        article: `Climate change is one of the most pressing issues facing our planet today. Rising global temperatures, caused primarily by human activities such as burning fossil fuels and deforestation, are leading to a cascade of environmental impacts. These include more frequent and severe weather events like hurricanes, droughts, and floods; rising sea levels that threaten coastal communities; and disruptions to ecosystems and biodiversity. The scientific consensus is clear: urgent action is needed to reduce greenhouse gas emissions and transition to sustainable energy sources. International agreements like the Paris Agreement aim to unite countries in this effort, but implementation remains a challenge. Individual actions, such as reducing energy consumption, using public transportation, and supporting sustainable practices, also play a crucial role. The window of opportunity to avert the worst consequences of climate change is narrowing, making it essential for governments, businesses, and individuals to work together towards a more sustainable future.`,
        
        research: `A recent study published in the Journal of Neuroscience examined the effects of mindfulness meditation on brain structure and function. Researchers recruited 40 participants with no prior meditation experience and randomly assigned them to either an 8-week mindfulness-based stress reduction program or a control group. MRI scans were conducted before and after the intervention. Results showed that the meditation group exhibited increased gray matter density in the hippocampus, a region critical for learning and memory, as well as in brain areas associated with self-awareness and emotional regulation. Additionally, participants reported reduced stress levels and improved attention spans. The control group showed no significant changes. These findings suggest that even short-term mindfulness practice can induce measurable neuroplastic changes in the brain, potentially contributing to improved mental health outcomes. However, the researchers note that longer-term studies are needed to determine whether these changes are sustained over time.`
    };
    
    // Update character and word count
    function updateStats() {
        const text = textInput.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        charCount.textContent = chars;
        wordCount.textContent = words;
    }
    
    textInput.addEventListener('input', updateStats);
    
    // Sample buttons
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
    
    // Count words in text
    function countWords(text) {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }
    
    // Extract key points from summary (simple heuristic)
    function extractKeyPoints(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return sentences.slice(0, 5).map(s => s.trim());
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
        
        summarizeBtn.disabled = true;
        summarizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Summarizing...';
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            // Create length-specific instruction
            let lengthInstruction = '';
            switch(length) {
                case 'short':
                    lengthInstruction = 'Generate a very concise summary of 1-2 sentences.';
                    break;
                case 'medium':
                    lengthInstruction = 'Generate a medium-length summary of 3-5 sentences.';
                    break;
                case 'long':
                    lengthInstruction = 'Generate a detailed summary of one paragraph (6-8 sentences).';
                    break;
            }
            
            // Create format-specific instruction
            let formatInstruction = '';
            switch(format) {
                case 'paragraph':
                    formatInstruction = 'Format the summary as a single paragraph.';
                    break;
                case 'bullet':
                    formatInstruction = 'Format the summary as bullet points, with each key point on a new line starting with •';
                    break;
            }
            
            // Prepare the prompt for Gemini - based on Google's summarization best practices [citation:8][citation:9]
            const prompt = `You are an expert text summarizer. Summarize the following text according to these requirements:

${lengthInstruction}
${formatInstruction}

Focus on the most important information and key ideas. Maintain the original meaning and intent. Be accurate and concise.

Text to summarize:
"""
${text}
"""

Summary:`;

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
                        temperature: 0.3,
                        maxOutputTokens: 1024,
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                
                if (response.status === 503) {
                    throw new Error('AI service is busy. Please try again.');
                } else {
                    throw new Error(`API error: ${response.status}`);
                }
            }
            
            const data = await response.json();
            let summary = data.candidates[0].content.parts[0].text.trim();
            
            // Clean up the summary
            summary = summary.replace(/^Summary:?/i, '').trim();
            
            // Calculate summary word count and reduction
            const summaryWordCount = countWords(summary);
            const reduction = Math.round(((originalWordCount - summaryWordCount) / originalWordCount) * 100);
            
            // Extract key points for bullet format or from summary
            let keyPoints = [];
            if (format === 'bullet') {
                // If already bullet format, extract points
                keyPoints = summary.split('\n')
                    .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
                    .map(line => line.replace(/^[•-]\s*/, '').trim());
            } else {
                // Extract key sentences as points
                keyPoints = extractKeyPoints(summary);
            }
            
            // Update UI
            summaryContent.textContent = summary;
            originalWords.textContent = originalWordCount;
            summaryWords.textContent = summaryWordCount;
            reductionPercent.textContent = reduction;
            
            // Update key points
            if (keyPoints.length > 0) {
                keyPointsList.innerHTML = keyPoints.map(point => 
                    `<li><i class="fas fa-circle" style="font-size: 0.5rem;"></i> ${point}</li>`
                ).join('');
                document.getElementById('keyPointsSection').style.display = 'block';
            } else {
                document.getElementById('keyPointsSection').style.display = 'none';
            }
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            
        } catch (error) {
            console.error('Summarization error:', error);
            loading.style.display = 'none';
            
            if (error.message.includes('503')) {
                showError('AI service is busy right now. Please try again in a few seconds.');
            } else {
                showError('Failed to summarize text. Please try again.');
            }
        }
        
        summarizeBtn.disabled = false;
        summarizeBtn.innerHTML = '<i class="fas fa-magic"></i> Summarize Text';
    }
    
    summarizeBtn.addEventListener('click', summarizeText);
    
    copyBtn.addEventListener('click', function() {
        const text = summaryContent.textContent;
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
    
    // Allow Enter with Ctrl to trigger summarize
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            summarizeText();
        }
    });
    
    // Initial stats
    updateStats();
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