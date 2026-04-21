// ===== YOUTUBE THUMBNAIL DOWNLOADER - WITH API INTEGRATION =====

// Your API endpoint
const THUMBNAIL_API_URL = 'https://toolsnova-api.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    console.log('YouTube Thumbnail Downloader loaded');
    
    // DOM elements
    const videoUrlInput = document.getElementById('videoUrl');
    const getBtn = document.getElementById('getThumbnailsBtn');
    const thumbnailsGrid = document.getElementById('thumbnailsGrid');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const videoInfo = document.getElementById('videoInfo');
    
    // Thumbnail qualities with correct resolutions
    const qualities = [
        { name: 'Default', key: 'default', resolution: '120x90', description: 'Smallest' },
        { name: 'Medium', key: 'mqdefault', resolution: '320x180', description: 'Medium quality' },
        { name: 'High', key: 'hqdefault', resolution: '480x360', description: 'High quality' },
        { name: 'Standard', key: 'sddefault', resolution: '640x480', description: 'Standard definition' },
        { name: 'Max Resolution', key: 'maxresdefault', resolution: '1920x1080', description: 'Full HD (1080p)' }
    ];
    
    // Extract video ID from various YouTube URL formats
    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/,
            /youtube\.com\/embed\/([^/?]+)/,
            /youtube\.com\/v\/([^/?]+)/,
            /youtube\.com\/shorts\/([^/?]+)/
        ];
        
        for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }
    
    // Validate YouTube URL
    function isValidYouTubeUrl(url) {
        return extractVideoId(url) !== null;
    }
    
    // Generate thumbnail URLs using your API
    async function getThumbnailUrlsFromApi(videoId) {
        try {
            // Use your API to get all thumbnails
            const response = await fetch(`${THUMBNAIL_API_URL}/api/thumbnail/all?url=https://youtu.be/${videoId}`);
            const data = await response.json();
            
            if (data.success) {
                // Convert API response to our format
                const thumbnails = [];
                for (const [key, thumb] of Object.entries(data.thumbnails)) {
                    const qualityInfo = qualities.find(q => q.key === key);
                    if (qualityInfo && thumb.url) {
                        thumbnails.push({
                            name: qualityInfo.name,
                            key: key,
                            resolution: qualityInfo.resolution,
                            description: qualityInfo.description,
                            url: thumb.url,
                            exists: true // API only returns existing thumbnails
                        });
                    }
                }
                return thumbnails;
            }
            return [];
        } catch (error) {
            console.error('API error:', error);
            // Fallback to direct URL generation if API fails
            return getFallbackThumbnailUrls(videoId);
        }
    }
    
    // Fallback method (direct URL generation without API)
    function getFallbackThumbnailUrls(videoId) {
        return qualities.map(q => ({
            ...q,
            url: `https://img.youtube.com/vi/${videoId}/${q.key}.jpg`,
            exists: true // We'll check existence later
        }));
    }
    
    // Check if thumbnail exists (by trying to load it)
    function checkThumbnailExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    // Verify which thumbnails actually exist
    async function verifyExistingThumbnails(thumbnails) {
        const verified = await Promise.all(
            thumbnails.map(async (thumb) => ({
                ...thumb,
                exists: await checkThumbnailExists(thumb.url)
            }))
        );
        return verified.filter(t => t.exists);
    }
    
    // Display thumbnails
    async function displayThumbnails(videoId) {
        // Show loading
        loading.style.display = 'block';
        thumbnailsGrid.style.display = 'none';
        videoInfo.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            // Get thumbnails from API
            let thumbnails = await getThumbnailUrlsFromApi(videoId);
            
            // If no thumbnails from API, try fallback with verification
            if (thumbnails.length === 0) {
                thumbnails = getFallbackThumbnailUrls(videoId);
                thumbnails = await verifyExistingThumbnails(thumbnails);
            }
            
            // Hide loading
            loading.style.display = 'none';
            
            if (thumbnails.length === 0) {
                showError('No thumbnails found for this video. The video might not exist or is private.');
                return;
            }
            
            // Sort thumbnails by quality (highest first)
            const qualityOrder = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
            thumbnails.sort((a, b) => qualityOrder.indexOf(a.key) - qualityOrder.indexOf(b.key));
            
            // Display video info
            videoInfo.innerHTML = `
                <p><strong>🎬 Video ID:</strong> ${videoId}</p>
                <p><strong>📸 Thumbnails found:</strong> ${thumbnails.length} of ${qualities.length}</p>
                <p><small>💡 Tip: Max Resolution (1080p) is not available for all videos. ${thumbnails.find(t => t.key === 'maxresdefault') ? '✅ HD available!' : '❌ HD not available for this video'}</small></p>
            `;
            videoInfo.style.display = 'block';
            
            // Display thumbnails
            thumbnailsGrid.innerHTML = thumbnails.map(thumb => `
                <div class="thumbnail-card">
                    <img src="${thumb.url}" alt="${thumb.name} thumbnail" class="thumbnail-preview" loading="lazy">
                    <div class="thumbnail-quality">
                        ${thumb.name}
                        ${thumb.key === 'maxresdefault' ? '<span class="hd-badge">HD</span>' : ''}
                    </div>
                    <div class="thumbnail-resolution">${thumb.resolution}</div>
                    <div class="thumbnail-description">${thumb.description}</div>
                    <div class="thumbnail-actions">
                        <button class="thumbnail-btn download-btn" data-url="${thumb.url}" data-quality="${thumb.name}">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="thumbnail-btn copy-btn" data-url="${thumb.url}">
                            <i class="fas fa-link"></i> Copy URL
                        </button>
                    </div>
                </div>
            `).join('');
            
            thumbnailsGrid.style.display = 'grid';
            
            // Add event listeners to buttons
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const url = this.dataset.url;
                    const quality = this.dataset.quality;
                    downloadThumbnail(url, quality);
                    trackToolUsage();
                });
            });
            
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const url = this.dataset.url;
                    copyToClipboard(url);
                });
            });
            
        } catch (error) {
            console.error('Error displaying thumbnails:', error);
            loading.style.display = 'none';
            showError('Failed to load thumbnails. Please try again.');
        }
    }
    
    // Download thumbnail
    function downloadThumbnail(url, quality) {
        const sanitizedQuality = quality.toLowerCase().replace(/\s+/g, '-');
        const link = document.createElement('a');
        link.href = url;
        link.download = `youtube-thumbnail-${sanitizedQuality}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success feedback
        showTemporaryMessage('✅ Download started!', 'success');
    }
    
    // Copy URL to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showTemporaryMessage('✅ URL copied to clipboard!', 'success');
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showTemporaryMessage('✅ URL copied to clipboard!', 'success');
        }
    }
    
    // Show temporary message
    function showTemporaryMessage(message, type = 'success') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `temp-message ${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            animation: fadeInOut 2s ease-in-out;
        `;
        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 2000);
    }
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        thumbnailsGrid.style.display = 'none';
        videoInfo.style.display = 'none';
        loading.style.display = 'none';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Clear previous results
    function clearResults() {
        thumbnailsGrid.style.display = 'none';
        videoInfo.style.display = 'none';
        errorMessage.style.display = 'none';
    }
    
    // Process URL
    async function processUrl() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }
        
        if (!isValidYouTubeUrl(url)) {
            showError('Invalid YouTube URL. Please check the format.');
            return;
        }
        
        clearResults();
        
        const videoId = extractVideoId(url);
        await displayThumbnails(videoId);
    }
    
    // Track tool usage (for guest limits)
    function trackToolUsage() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
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
    if (getBtn) {
        getBtn.addEventListener('click', processUrl);
    }
    
    if (videoUrlInput) {
        videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processUrl();
            }
        });
    }
});

// Add CSS for animations and HD badge
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(20px); }
        15% { opacity: 1; transform: translateY(0); }
        85% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
    
    .hd-badge {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #000;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
    }
    
    .thumbnail-description {
        font-size: 11px;
        color: #666;
        margin: 5px 0;
    }
    
    .thumbnail-card {
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .thumbnail-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .thumbnail-preview {
        width: 100%;
        height: auto;
        border-radius: 8px;
        cursor: pointer;
    }
`;
document.head.appendChild(style);

// Firebase auth state observer (if Firebase is used)
if (typeof firebase !== 'undefined' && firebase.auth) {
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