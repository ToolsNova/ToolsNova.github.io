// ===== AI CONTENT DETECTOR - GROQ API VERSION (FIXED PARSING) =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Content Detector loaded');
    
    // 🔑 YOUR GROQ API KEY
    const GROQ_API_KEY = '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';
    
    // ✅ LATEST GROQ MODELS
    const MODELS = [
        'llama-3.3-70b-versatile',    // Latest Llama 3.3 model
        'llama-3.1-8b-instant',        // Llama 3.1 8B
        'gemma2-9b-it'                 // Gemma 2
    ];
    
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    
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
        ai: `The rapid advancement of artificial intelligence has precipitated a paradigm shift across multiple sectors of the global economy. This transformative technology, characterized by its ability to simulate human cognitive functions, is poised to revolutionize industries ranging from healthcare to finance. Machine learning algorithms, a subset of AI, demonstrate remarkable proficiency in pattern recognition and predictive analytics, enabling unprecedented levels of automation and efficiency. However, the proliferation of AI also raises profound ethical considerations regarding employment displacement, algorithmic bias, and data privacy. Policymakers and technologists must collaborate to establish robust governance frameworks that foster innovation while safeguarding societal values.`,
        
        human: `I've been thinking a lot about AI lately, and honestly it's kind of scary but also exciting? Like, my friend just lost his job because they replaced his team with some automation software, and that sucks. But then I see how AI helps doctors detect cancer earlier, and that's amazing. I don't know, man. It feels like we're rushing into this without really understanding what we're doing. My grandma asked me the other day if robots are going to take over the world, and I laughed, but later I was like... wait, maybe she has a point?`
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
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
                                content: 'You are an AI content detection expert. Analyze text and provide detailed feedback.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.1,  // Lower temperature for more consistent responses
                        max_tokens: 1024,
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
                        const waitTime = Math.pow(2, attempt) * 1000;
                        await sleep(waitTime);
                        continue;
                    }
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
                        
                        if (errorMsg.includes('decommissioned')) {
                            break;
                        }
                        throw new Error(errorMsg);
                    }
                    
                    const data = await response.json();
                    
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        console.log(`✅ ${model} succeeded!`);
                        const content = data.choices[0].message.content;
                        console.log('Raw response:', content);
                        return content;
                    } else {
                        throw new Error('Invalid response format');
                    }
                    
                } catch (error) {
                    console.log(`❌ Attempt ${attempt} failed for ${model}:`, error.message);
                    lastError = error;
                    
                    if (error.message.includes('Invalid API key') || error.message.includes('decommissioned')) {
                        break;
                    }
                    
                    if (attempt === maxRetries) {
                        break;
                    }
                    
                    await sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        
        throw lastError || new Error('All models failed');
    }
    
    // Enhanced parsing function to extract probabilities
    function parseGroqResponse(text) {
        console.log('Parsing response:', text);
        
        let result = {
            aiProbability: null,
            humanProbability: null,
            confidence: 'Medium',
            analysis: '',
            indicators: []
        };
        
        try {
            // More comprehensive pattern matching for AI probability
            const patterns = [
                /AI\s+Probability:\s*(\d{1,3})%/i,
                /Probability\s+that\s+this\s+is\s+AI[-\s]generated:\s*(\d{1,3})%/i,
                /AI[- ]generated:\s*(\d{1,3})%/i,
                /(\d{1,3})%\s*AI/i,
                /(\d{1,3})%\s*chance\s+of\s+being\s+AI/i,
                /(\d{1,3})%\s*probability\s+of\s+AI/i,
                /likely\s+(\d{1,3})%\s+AI/i,
                /AI\s*[:=]\s*(\d{1,3})%/i
            ];
            
            let aiProb = null;
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    aiProb = parseInt(match[1]);
                    console.log(`Found AI probability: ${aiProb}% using pattern: ${pattern}`);
                    break;
                }
            }
            
            // If AI probability found, calculate human probability
            if (aiProb !== null) {
                result.aiProbability = Math.min(100, Math.max(0, aiProb));
                result.humanProbability = 100 - result.aiProbability;
            } else {
                // Try to find human probability directly
                const humanPatterns = [
                    /Human\s+Probability:\s*(\d{1,3})%/i,
                    /Probability\s+that\s+this\s+is\s+human[-\s]written:\s*(\d{1,3})%/i,
                    /Human[- ]written:\s*(\d{1,3})%/i,
                    /(\d{1,3})%\s*human/i,
                    /(\d{1,3})%\s*chance\s+of\s+being\s+human/i
                ];
                
                let humanProb = null;
                for (const pattern of humanPatterns) {
                    const match = text.match(pattern);
                    if (match) {
                        humanProb = parseInt(match[1]);
                        console.log(`Found human probability: ${humanProb}% using pattern: ${pattern}`);
                        break;
                    }
                }
                
                if (humanProb !== null) {
                    result.humanProbability = Math.min(100, Math.max(0, humanProb));
                    result.aiProbability = 100 - result.humanProbability;
                } else {
                    // If no percentages found, use sentiment analysis from text
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes('ai-generated') || lowerText.includes('likely ai') || 
                        lowerText.includes('written by ai') || lowerText.includes('artificial intelligence wrote')) {
                        result.aiProbability = 85;
                        result.humanProbability = 15;
                        console.log('Using keyword-based AI detection');
                    } else if (lowerText.includes('human-written') || lowerText.includes('likely human') || 
                               lowerText.includes('written by a human') || lowerText.includes('human author')) {
                        result.aiProbability = 15;
                        result.humanProbability = 85;
                        console.log('Using keyword-based human detection');
                    } else {
                        // Default fallback with explanation
                        result.aiProbability = 50;
                        result.humanProbability = 50;
                        console.log('Using default 50/50 split - no clear indicators found');
                    }
                }
            }
            
            // Extract confidence
            if (text.match(/confidence:\s*high/i) || text.match(/high confidence/i)) {
                result.confidence = 'High';
            } else if (text.match(/confidence:\s*low/i) || text.match(/low confidence/i)) {
                result.confidence = 'Low';
            } else {
                result.confidence = 'Medium';
            }
            
            // Extract analysis - get the analysis section
            const analysisMatch = text.match(/analysis:\s*([^]*?)(?=\d+\.|key indicators:|$)/i);
            if (analysisMatch && analysisMatch[1]) {
                result.analysis = analysisMatch[1].trim().substring(0, 200);
            } else {
                // Get first few sentences
                const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
                result.analysis = sentences.slice(0, 2).join('. ') + '.';
            }
            
            // Extract indicators
            const indicatorsMatch = text.match(/(?:key\s+indicators|indicators):\s*([^]*?)(?=\n\n|$)/i);
            if (indicatorsMatch && indicatorsMatch[1]) {
                const indicatorLines = indicatorsMatch[1].split(/[,\n]/).slice(0, 4);
                result.indicators = indicatorLines
                    .map(line => line.trim().replace(/^[\d\-•*]\s*/, ''))
                    .filter(line => line.length > 5 && line.length < 100)
                    .slice(0, 4);
            }
            
            // Ensure we have indicators
            if (result.indicators.length === 0) {
                if (result.aiProbability > 70) {
                    result.indicators = [
                        'Repetitive or formulaic sentence structures',
                        'Lack of personal voice or emotional depth',
                        'Overly formal and consistent language',
                        'Predictable flow between ideas'
                    ];
                } else if (result.aiProbability < 30) {
                    result.indicators = [
                        'Natural variation in sentence length and structure',
                        'Personal voice and authentic expression',
                        'Emotional depth and nuanced language',
                        'Unique phrasing and creative word choice'
                    ];
                } else {
                    result.indicators = [
                        'Mixed linguistic patterns detected',
                        'Some AI-like characteristics present',
                        'Human-like variations observed',
                        'Content shows elements of both styles'
                    ];
                }
            }
            
            console.log('Final parsed result:', result);
            
        } catch (e) {
            console.error('Parse error:', e);
            // Set fallback values
            result.aiProbability = 50;
            result.humanProbability = 50;
            result.confidence = 'Low';
            result.analysis = 'Unable to fully analyze the text. Please try again.';
            result.indicators = ['Analysis incomplete', 'Please try again with different text'];
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
            const prompt = `You are an AI content detection expert. Analyze the following text and determine if it was written by AI or a human.

Text to analyze:
"""
${text.substring(0, 3000)}
"""

Provide your analysis in this EXACT format:

AI Probability: [number between 0-100]%
Human Probability: [number between 0-100]%
Confidence: [High/Medium/Low]
Analysis: [2-3 sentence explanation of your reasoning]
Key Indicators: [List 3-4 specific patterns you noticed, separated by commas]

Example format:
AI Probability: 85%
Human Probability: 15%
Confidence: High
Analysis: The text shows repetitive sentence structures and lacks personal voice.
Key Indicators: Repetitive patterns, Formal language, Lack of emotion, Predictable flow

Be specific and include the percentages clearly.`;

            const groqText = await callGroqWithRetry(prompt);
            console.log('Groq response:', groqText);
            
            const result = parseGroqResponse(groqText);
            
            // Update UI
            aiScore.textContent = result.aiProbability + '%';
            humanScore.textContent = result.humanProbability + '%';
            
            // Update confidence badge
            confidenceBadge.innerHTML = `<i class="fas fa-check-circle"></i> ${result.confidence} Confidence`;
            const confidenceColors = {
                'High': '#10b981',
                'Medium': '#f59e0b',
                'Low': '#ef4444'
            };
            confidenceBadge.style.color = confidenceColors[result.confidence];
            confidenceBadge.style.backgroundColor = confidenceColors[result.confidence] + '20';
            
            analysisText.textContent = result.analysis;
            
            // Update indicators
            const isAI = result.aiProbability > 70;
            indicatorsList.innerHTML = result.indicators.map(ind => {
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
            
            let errorMsg = 'Failed to analyze text. ';
            if (error.message.includes('Invalid API key')) {
                errorMsg = 'Invalid Groq API key. Please check your API key configuration.';
            } else if (error.message.includes('503')) {
                errorMsg = 'AI service is busy. Please try again in a few seconds.';
            } else if (error.message.includes('429')) {
                errorMsg = 'Too many requests. Please wait a moment and try again.';
            } else {
                errorMsg += error.message;
            }
            
            showError(errorMsg);
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
    
    console.log('✅ AI Content Detector ready with fixed parsing');
});

// Firebase auth state observer (keep existing code)
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged(function(user) {
        // ... (keep your existing Firebase code)
    });
}