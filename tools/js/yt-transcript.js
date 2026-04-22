// ===== YOUTUBE TRANSCRIPT GENERATOR - WORKING PRODUCTION VERSION =====
// ✅ Works on GitHub Pages
// ✅ No API keys needed
// ✅ Multiple fallback proxies

document.addEventListener('DOMContentLoaded', function() {
    console.log('YouTube Transcript Generator loaded');
    
    // DOM elements
    const videoUrlInput = document.getElementById('videoUrl');
    const getBtn = document.getElementById('getTranscriptBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const videoTitle = document.getElementById('videoTitle');
    const videoChannel = document.getElementById('videoChannel');
    const transcriptInfo = document.getElementById('transcriptInfo');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const transcriptBox = document.getElementById('transcriptBox');
    const wordCount = document.getElementById('wordCount');
    const readingTime = document.getElementById('readingTime');
    const copyBtn = document.getElementById('copyBtn');
    const downloadTxtBtn = document.getElementById('downloadTxtBtn');
    const downloadSrtBtn = document.getElementById('downloadSrtBtn');
    const downloadVttBtn = document.getElementById('downloadVttBtn');
    
    let currentTranscriptData = null;
    let currentVideoId = null;
    let currentSegments = null;
    
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
        }, 8000);
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    function formatSrtTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
    }
    
    function formatVttTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }
    
    function calculateReadingTime(text) {
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        const minutes = Math.ceil(words / 200);
        return { words, minutes };
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async function getVideoInfo(videoId) {
        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            const data = await response.json();
            return {
                title: data.title || 'YouTube Video',
                author: data.author_name || 'YouTube',
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
    
    async function fetchTranscript(videoId) {
        // Try multiple proxy services
        const proxyUrls = [
            `https://thingproxy.freeboard.io/fetch/https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
            `https://corsproxy.io/?https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
            `https://api.allorigins.win/raw?url=https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&_=${Date.now()}`
        ];
        
        for (const proxyUrl of proxyUrls) {
            try {
                console.log('Trying:', proxyUrl.substring(0, 50));
                const response = await fetch(proxyUrl);
                
                if (response.ok) {
                    const xmlText = await response.text();
                    if (xmlText && xmlText.includes('<text')) {
                        console.log('✅ Success with proxy');
                        return parseXMLTranscript(xmlText);
                    }
                }
            } catch (e) {
                console.log('Proxy failed:', e.message);
                continue;
            }
        }
        return null;
    }
    
    function parseXMLTranscript(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const textElements = xmlDoc.getElementsByTagName('text');
            
            const segments = [];
            for (let i = 0; i < textElements.length; i++) {
                const el = textElements[i];
                const text = el.textContent;
                if (text && text.trim()) {
                    segments.push({
                        text: text.trim(),
                        start: parseFloat(el.getAttribute('start') || 0),
                        duration: parseFloat(el.getAttribute('dur') || 5)
                    });
                }
            }
            return segments.length > 0 ? segments : null;
        } catch (e) {
            console.error('Parse error:', e);
            return null;
        }
    }
    
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
        
        loading.style.display = 'block';
        resultCard.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            const videoInfo = await getVideoInfo(videoId);
            videoTitle.textContent = videoInfo.title;
            videoChannel.textContent = videoInfo.author;
            videoThumbnail.src = videoInfo.thumbnail;
            
            const segments = await fetchTranscript(videoId);
            
            if (!segments || segments.length === 0) {
                showError('❌ No transcript available for this video.\n\n💡 Tips:\n• Video must have captions/subtitles enabled\n• Look for the [CC] button on YouTube\n• Try this test video: https://youtu.be/Gc4HGQHgeFE');
                loading.style.display = 'none';
                return;
            }
            
            currentSegments = segments;
            
            let transcriptHTML = '';
            let fullText = '';
            
            for (const segment of segments) {
                fullText += segment.text + ' ';
                transcriptHTML += `<p><span style="color: #3b82f6; font-weight: 500;">[${formatTime(segment.start)}]</span> ${escapeHtml(segment.text)}</p>`;
            }
            
            const { words, minutes } = calculateReadingTime(fullText);
            
            transcriptInfo.textContent = `✅ Transcript found (${segments.length} lines)`;
            wordCount.textContent = `${words} words`;
            readingTime.textContent = `~${minutes} min read`;
            transcriptBox.innerHTML = transcriptHTML;
            currentTranscriptData = fullText.trim();
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            loading.style.display = 'none';
            showError('An error occurred. Please try again.');
        }
    }
    
    function generateSRT(segments) {
        let srt = '';
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            srt += `${i + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.start + seg.duration)}\n${seg.text}\n\n`;
        }
        return srt;
    }
    
    function generateVTT(segments) {
        let vtt = 'WEBVTT\n\n';
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            vtt += `${formatVttTime(seg.start)} --> ${formatVttTime(seg.start + seg.duration)}\n${seg.text}\n\n`;
        }
        return vtt;
    }
    
    // Event listeners
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (currentTranscriptData) {
                navigator.clipboard.writeText(currentTranscriptData);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Text', 2000);
            }
        });
    }
    
    if (downloadTxtBtn) {
        downloadTxtBtn.addEventListener('click', () => {
            if (currentTranscriptData) {
                const blob = new Blob([currentTranscriptData], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transcript-${currentVideoId}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    }
    
    if (downloadSrtBtn) {
        downloadSrtBtn.addEventListener('click', () => {
            if (currentSegments) {
                const srt = generateSRT(currentSegments);
                const blob = new Blob([srt], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transcript-${currentVideoId}.srt`;
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    }
    
    if (downloadVttBtn) {
        downloadVttBtn.addEventListener('click', () => {
            if (currentSegments) {
                const vtt = generateVTT(currentSegments);
                const blob = new Blob([vtt], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transcript-${currentVideoId}.vtt`;
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    }
    
    if (getBtn) {
        getBtn.addEventListener('click', processVideo);
    }
    if (videoUrlInput) {
        videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processVideo();
        });
    }
});
