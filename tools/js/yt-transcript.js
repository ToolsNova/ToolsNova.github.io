// ===== YOUTUBE TRANSCRIPT GENERATOR - RAPIDAPI VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('YouTube Transcript Generator loaded');
    
    // 🔑 YOUR RAPIDAPI KEY (same as your MP3 tool)
    const RAPIDAPI_KEY = '4b36c31694msh1cdcec0b31dc05bp11f6f8jsn9c48a958e28f';
    const RAPIDAPI_HOST = 'youtube-transcript3.p.rapidapi.com';
    
    // DOM elements
    const videoUrlInput = document.getElementById('videoUrl');
    const getBtn = document.getElementById('getTranscriptBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const videoTitle = document.getElementById('videoTitle');
    const videoChannel = document.getElementById('videoChannel');
    const videoDuration = document.getElementById('videoDuration');
    const transcriptInfo = document.getElementById('transcriptInfo');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const transcriptBox = document.getElementById('transcriptBox');
    const wordCount = document.getElementById('wordCount');
    const readingTime = document.getElementById('readingTime');
    const copyBtn = document.getElementById('copyBtn');
    const downloadTxtBtn = document.getElementById('downloadTxtBtn');
    const downloadSrtBtn = document.getElementById('downloadSrtBtn');
    const downloadVttBtn = document.getElementById('downloadVttBtn');
    
    // Store current transcript data
    let currentTranscript = null;
    let currentVideoId = null;
    
    // Extract video ID from various YouTube URL formats
    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/,
            /youtube\.com\/embed\/([^/?]+)/,
            /youtube\.com\/shorts\/([^/?]+)/
        ];
        
        for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }
    
    function isValidYouTubeUrl(url) {
        return extractVideoId(url) !== null;
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loading.style.display = 'none';
        resultCard.style.display = 'none';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Format time (seconds to HH:MM:SS)
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    // Calculate reading time
    function calculateReadingTime(text) {
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return { words, minutes };
    }
    
    // Get video info from YouTube oEmbed
    async function getVideoInfo(videoId) {
        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            const data = await response.json();
            return {
                title: data.title,
                author: data.author_name,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            };
        } catch (error) {
            return {
                title: 'YouTube Video',
                author: 'YouTube',
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            };
        }
    }
    
    // Fetch transcript using RapidAPI
    async function fetchTranscript(videoId) {
        const url = `https://${RAPIDAPI_HOST}/api/transcript?videoId=${videoId}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'x-rapidapi-host': RAPIDAPI_HOST,
                    'x-rapidapi-key': RAPIDAPI_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Transcript data:', data); // Debug log
            
            // Handle different response formats
            if (data.transcript) {
                return data.transcript;
            } else if (data) {
                return data;
            } else {
                throw new Error('No transcript data');
            }
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Process video
    async function processVideo() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }
        
        if (!isValidYouTubeUrl(url)) {
            showError('Invalid YouTube URL');
            return;
        }
        
        const videoId = extractVideoId(url);
        currentVideoId = videoId;
        
        // Show loading
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            // Get video info
            const videoInfo = await getVideoInfo(videoId);
            videoTitle.textContent = videoInfo.title;
            videoChannel.textContent = videoInfo.author;
            videoThumbnail.src = videoInfo.thumbnail;
            
            // Fetch transcript
            const transcriptData = await fetchTranscript(videoId);
            
            // Store for downloads
            currentTranscript = transcriptData;
            
            // Build transcript HTML
            let transcriptHTML = '';
            let fullText = '';
            
            if (Array.isArray(transcriptData)) {
                // Format with timestamps
                transcriptHTML = transcriptData.map(item => {
                    const text = item.text || '';
                    fullText += text + ' ';
                    const time = item.offset || 0;
                    return `<p><span class="timestamp">[${formatTime(time)}]</span> ${text}</p>`;
                }).join('');
            } else if (typeof transcriptData === 'object') {
                // Try different object formats
                fullText = JSON.stringify(transcriptData);
                transcriptHTML = `<p>${fullText}</p>`;
            } else {
                fullText = String(transcriptData);
                transcriptHTML = `<p>${fullText}</p>`;
            }
            
            // Calculate stats
            const { words, minutes } = calculateReadingTime(fullText);
            
            // Update UI
            transcriptInfo.textContent = `Transcript found (${Array.isArray(transcriptData) ? transcriptData.length : 'text'} lines)`;
            wordCount.textContent = `${words} words`;
            readingTime.textContent = `~${minutes} min read`;
            transcriptBox.innerHTML = transcriptHTML;
            
            // Hide loading, show result
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            
            // Track usage
            trackToolUsage();
            
        } catch (error) {
            console.error('Process error:', error);
            loading.style.display = 'none';
            
            // Still show video info
            const videoInfo = await getVideoInfo(videoId);
            videoTitle.textContent = videoInfo.title;
            videoChannel.textContent = videoInfo.author;
            videoThumbnail.src = videoInfo.thumbnail;
            
            transcriptBox.innerHTML = '<p class="error">No transcript available for this video. The video may not have captions.</p>';
            resultCard.style.display = 'block';
        }
    }
    
    // Copy to clipboard
    copyBtn.addEventListener('click', function() {
        const text = transcriptBox.innerText;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                const original = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = original;
                }, 2000);
            });
        }
    });
    
    // Download as TXT
    downloadTxtBtn.addEventListener('click', function() {
        const text = transcriptBox.innerText;
        if (!text) return;
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${currentVideoId}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    });
    
    // Track tool usage
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
    
    // Event listeners
    getBtn.addEventListener('click', processVideo);
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processVideo();
    });
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