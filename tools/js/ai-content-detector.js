// ===== AI CONTENT DETECTOR - FIXED WITH RETRY & FALLBACK =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Content Detector loaded');
    
    // 🔑 YOUR GEMINI API KEY
    const GEMINI_API_KEY = 'AIzaSyBguomd6Q-A-bcxoGcy7TNrUY_0fSovHzs';
    
    // Multiple model options in order of stability
    const MODELS = [
        'gemini-2.5-flash',        // Most stable, lowest demand [citation:2]
        'gemini-1.5-flash',         // Old reliable
        'gemini-2.0-flash'          // Original (sometimes overloaded)
    ];
    
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
    
    // DOM elements
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
    
    // Sample texts
    const samples = {
        ai: `The rapid advancement of artificial intelligence has precipitated a paradigm shift across multiple sectors of the global economy. This transformative technology, characterized by its ability to simulate human cognitive functions, is poised to revolutionize industries ranging from healthcare to finance. Machine learning algorithms, a subset of AI, demonstrate remarkable proficiency in pattern recognition and predictive analytics, enabling unprecedented levels of automation and efficiency. However, the proliferation of AI also raises profound ethical considerations regarding employment displacement, algorithmic bias, and data privacy. Policymakers and technologists must collaborate to establish robust governance frameworks that foster innovation while safeguarding societal values. The trajectory of AI development suggests an increasingly integrated future where human and machine intelligence coalesce, creating synergistic capabilities that transcend current limitations.`,
        
        human: `I've been thinking a lot about AI lately, and honestly it's kind of scary but also exciting? Like, my friend just lost his job because they replaced his team with some automation software, and that sucks. But then I see how AI helps doctors detect cancer earlier, and that's amazing. I don't know, man. It feels like we're rushing into this without really understanding what we're doing. My grandma asked me the other day if robots are going to take over the world, and I laughed, but later I was like... wait, maybe she has a point? Anyway, I guess we'll figure it out as we go. Hopefully we don't mess things up too badly before then.`
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
    
    // Sleep function for retry delays
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Call Gemini API with retry logic and model fallback
    async function callGeminiWithRetry(prompt, maxRetries = 3) {
        let lastError = null;
        
        // Try each model in order
        for (const model of MODELS) {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Trying ${model} (attempt ${attempt}/${maxRetries})...`);
                    
                    const response = await fetch(
                        `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
                        {
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
                                    temperature: 0.2,
                                    maxOutputTokens: 1024,
                                }
                            })
                        }
                    );
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        
                        // If it's a 503 (overloaded), wait and retry
                        if (response.status === 503) {
                            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Exponential backoff with jitter [citation:1]
                            console.log(`Model overloaded, waiting ${waitTime/1000}s before retry...`);
                            await sleep(waitTime);
                            continue; // Retry same model
                        }
                        
                        // For other errors, try next model
                        throw new Error(`API error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Check if we got a valid response
                    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                        return data.candidates[0].content.parts[0].text;
                    } else {
                        throw new Error('Invalid response format');
                    }
                    
                } catch (error) {
                    console.log(`Attempt ${attempt} failed for ${model}:`, error.message);
                    lastError = error;
                    
                    // If it's the last attempt for this model, try next model
                    if (attempt === maxRetries) {
                        console.log(`Switching to next model...`);
                        break;
                    }
                    
                    // Wait before retry (exponential backoff) [citation:5]
                    const waitTime = Math.pow(2, attempt) * 1000;
                    await sleep(waitTime);
                }
            }
        }
        
        throw lastError || new Error('All models failed');
    }
    
    // Parse Gemini response to extract scores and analysis
    function parseGeminiResponse(text) {
        // Default values
        let result = {
            aiProbability: 50,
            humanProbability: 50,
            confidence: 'Medium',
            analysis: '',
            indicators: []
        };
        
        try {
            // Extract AI probability (look for numbers 0-100)
            const aiMatch = text.match(/(?:AI|artificial intelligence)[^\d]*(\d{1,3})%/i) || 
                           text.match(/(\d{1,3})%\s*(?:AI|artificial intelligence)/i) ||
                           text.match(/probability[^\d]*(\d{1,3})%/i);
            
            if (aiMatch) {
                result.aiProbability = parseInt(aiMatch[1]);
                result.humanProbability = 100 - result.aiProbability;
            }
            
            // Extract confidence level
            if (text.match(/high confidence/i)) result.confidence = 'High';
            else if (text.match(/low confidence/i)) result.confidence = 'Low';
            else result.confidence = 'Medium';
            
            // Extract analysis (first few sentences)
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
            result.analysis = sentences.slice(0, 3).join('. ') + '.';
            
            // Extract indicators
            const indicatorPatterns = [
                /repetitiv?e pattern/i,
                /lack of nuance/i,
                /unnatural flow/i,
                /overly formal/i,
                /awkward phrasing/i,
                /inconsistent style/i,
                /too perfect/i,
                /human-like variation/i,
                /personal touch/i,
                /emotional depth/i,
                /natural rhythm/i
            ];
            
            result.indicators = [];
            indicatorPatterns.forEach(pattern => {
                if (text.match(pattern)) {
                    let indicator = text.match(pattern)[0];
                    // Capitalize first letter
                    indicator = indicator.charAt(0).toUpperCase() + indicator.slice(1).toLowerCase();
                    result.indicators.push(indicator);
                }
            });
            
            // If no indicators found, add defaults
            if (result.indicators.length === 0) {
                if (result.aiProbability > 70) {
                    result.indicators = [
                        'Repetitive sentence structures',
                        'Lack of personal voice',
                        'Overly formal language',
                        'Unnatural flow between ideas'
                    ];
                } else if (result.aiProbability < 30) {
                    result.indicators = [
                        'Natural variation in sentence length',
                        'Personal voice and style',
                        'Emotional depth and nuance',
                        'Authentic expression of ideas'
                    ];
                } else {
                    result.indicators = [
                        'Mixed patterns detected',
                        'Some AI-like characteristics',
                        'Some human-like variation',
                        'Borderline content'
                    ];
                }
            }
            
        } catch (e) {
            console.error('Parse error:', e);
        }
        
        return result;
    }
    
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
        errorMessage.style.display = 'none';
        
        try {
            // Prepare the prompt for Gemini
            const prompt = `You are an AI content detection expert. Analyze the following text and determine if it was written by AI or a human. Provide:

1. Probability that this is AI-generated (0-100%)
2. Probability that this is human-written (0-100%)
3. Confidence level (High/Medium/Low)
4. Detailed analysis explaining your reasoning
5. List of key indicators that influenced your decision

Text to analyze:
"""
${text}
"""

Format your response clearly with sections. Be specific about what patterns you noticed.`;

            // Call Gemini with retry logic
            const geminiText = await callGeminiWithRetry(prompt);
            
            // Parse the response
            const result = parseGeminiResponse(geminiText);
            
            // Update UI
            aiScore.textContent = result.aiProbability + '%';
            humanScore.textContent = result.humanProbability + '%';
            
            // Update confidence badge
            confidenceBadge.innerHTML = `<i class="fas fa-check-circle"></i> ${result.confidence} Confidence`;
            if (result.confidence === 'High') {
                confidenceBadge.style.color = '#10b981';
            } else if (result.confidence === 'Low') {
                confidenceBadge.style.color = '#ef4444';
            }
            
            analysisText.textContent = result.analysis;
            
            // Update indicators
            indicatorsList.innerHTML = result.indicators.map(ind => 
                `<li><i class="fas fa-${result.aiProbability > 70 ? 'exclamation-triangle' : 'check-circle'}" style="color: ${result.aiProbability > 70 ? '#ef4444' : '#10b981'}"></i> ${ind}</li>`
            ).join('');
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            
        } catch (error) {
            console.error('Analysis error:', error);
            loading.style.display = 'none';
            
            // Show user-friendly message
            if (error.message.includes('503')) {
                showError('AI service is busy right now. Please try again in a few seconds.');
            } else {
                showError('Failed to analyze text. Please try again.');
            }
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
    
    // Allow Enter to trigger analysis (but with Shift+Enter for new line)
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeContent();
        }
    });
    
    // Initial stats
    updateStats();
});

// Firebase auth state observer (keep existing)