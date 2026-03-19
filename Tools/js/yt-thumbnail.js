// ===== YOUTUBE THUMBNAIL DOWNLOADER - NO AUTOFILL =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('YouTube Thumbnail Downloader loaded');
    
    // DOM elements
    const videoUrlInput = document.getElementById('videoUrl');
    const getBtn = document.getElementById('getThumbnailsBtn');
    const thumbnailsGrid = document.getElementById('thumbnailsGrid');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const videoInfo = document.getElementById('videoInfo');
    
    // Thumbnail qualities
    const qualities = [
        { name: 'Default', key: 'default', resolution: '120x90', description: 'Smallest' },
        { name: 'Medium', key: 'mqdefault', resolution: '320x180', description: 'Medium quality' },
        { name: 'High', key: 'hqdefault', resolution: '480x360', description: 'High quality' },
        { name: 'Standard', key: 'sddefault', resolution: '640x480', description: 'Standard definition' },
        { name: 'Max Resolution', key: 'maxresdefault', resolution: '1280x720', description: 'HD quality' }
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
    
    // Generate thumbnail URLs
    function getThumbnailUrls(videoId) {
        return qualities.map(q => ({
            ...q,
            url: `https://img.youtube.com/vi/${videoId}/${q.key}.jpg`
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
    
    // Display thumbnails
    async function displayThumbnails(videoId) {
        const thumbnailUrls = getThumbnailUrls(videoId);
        
        // Show loading
        loading.style.display = 'block';
        thumbnailsGrid.style.display = 'none';
        videoInfo.style.display = 'none';
        
        // Check which thumbnails exist
        const thumbnailsWithStatus = await Promise.all(
            thumbnailUrls.map(async (thumb) => ({
                ...thumb,
                exists: await checkThumbnailExists(thumb.url)
            }))
        );
        
        // Filter only existing thumbnails
        const existingThumbnails = thumbnailsWithStatus.filter(t => t.exists);
        
        // Hide loading
        loading.style.display = 'none';
        
        if (existingThumbnails.length === 0) {
            showError('No thumbnails found for this video. The video might not exist or is private.');
            return;
        }
        
        // Display video info
        videoInfo.innerHTML = `
            <p><strong>Video ID:</strong> ${videoId}</p>
            <p><strong>Thumbnails found:</strong> ${existingThumbnails.length} of ${qualities.length}</p>
            <p><small>Note: Some videos don't have HD thumbnails. Max resolution (1280x720) is not always available.</small></p>
        `;
        videoInfo.style.display = 'block';
        
        // Display thumbnails
        thumbnailsGrid.innerHTML = existingThumbnails.map(thumb => `
            <div class="thumbnail-card">
                <img src="${thumb.url}" alt="${thumb.name} thumbnail" class="thumbnail-preview" onerror="this.style.display='none'">
                <div class="thumbnail-quality">${thumb.name}</div>
                <div class="thumbnail-resolution">${thumb.resolution}</div>
                <div class="thumbnail-actions">
                    <button class="thumbnail-btn download-btn" data-url="${thumb.url}" data-quality="${thumb.name}">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="thumbnail-btn copy-btn" data-url="${thumb.url}">
                        <i class="fas fa-link"></i> Copy
                    </button>
                </div>
            </div>
        `).join('');
        
        thumbnailsGrid.style.display = 'grid';
        
        // Add event listeners to buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.dataset.url;
                const quality = this.dataset.quality;
                downloadThumbnail(url, quality);
                trackToolUsage();
            });
        });
        
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.dataset.url;
                copyToClipboard(url);
            });
        });
    }
    
    // Download thumbnail
    function downloadThumbnail(url, quality) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `youtube-thumbnail-${quality.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Copy URL to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('URL copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy URL');
        });
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
    function processUrl() {
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
        displayThumbnails(videoId);
    }
    
    // Track tool usage (for guest limits)
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
    getBtn.addEventListener('click', processUrl);
    
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processUrl();
        }
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