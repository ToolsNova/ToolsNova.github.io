// ===== BACKGROUND REMOVER - SIMPLIFIED VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Background Remover loaded');
    
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const removeBtn = document.getElementById('removeBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const progressFill = document.getElementById('progressFill');
    const resultCard = document.getElementById('resultCard');
    const originalImage = document.getElementById('originalImage');
    const resultImage = document.getElementById('resultImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const newBtn = document.getElementById('newBtn');
    
    // State
    let selectedFile = null;
    let processedBlob = null;
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
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
    
    function handleFile(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showError('Image too large. Please select under 10MB');
            return;
        }
        
        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
    }
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#8b5cf6';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });
    
    changeFileBtn.addEventListener('click', () => {
        selectedFile = null;
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        resultCard.style.display = 'none';
        fileInput.value = '';
    });
    
    removeBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showError('Please select an image first');
            return;
        }
        
        if (!canUseTool()) {
            showError('You have used all 3 guest tries. Please sign up!');
            setTimeout(() => window.location.href = '../signup.html', 2000);
            return;
        }
        
        removeBtn.disabled = true;
        removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        loading.style.display = 'block';
        
        try {
            // Show original image
            const originalUrl = URL.createObjectURL(selectedFile);
            originalImage.src = originalUrl;
            
            // USE A SIMPLE API INSTEAD - 50 free images/month
            const formData = new FormData();
            formData.append('image_file', selectedFile);
            formData.append('size', 'auto');
            
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': '2UnKeDwwj7CTi9zXTJuGva9f' // Get from remove.bg
                },
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to process');
            
            const resultBlob = await response.blob();
            const resultUrl = URL.createObjectURL(resultBlob);
            
            resultImage.src = resultUrl;
            processedBlob = resultBlob;
            
            loading.style.display = 'none';
            resultCard.style.display = 'block';
            trackToolUsage();
            
        } catch (error) {
            console.error('Error:', error);
            loading.style.display = 'none';
            showError('Failed to process image. Please try again.');
        }
        
        removeBtn.disabled = false;
        removeBtn.innerHTML = '<i class="fas fa-magic"></i> Remove Background';
    });
    
    downloadBtn.addEventListener('click', () => {
        if (!processedBlob) return;
        const url = URL.createObjectURL(processedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'background-removed.png';
        link.click();
        URL.revokeObjectURL(url);
    });
    
    newBtn.addEventListener('click', () => {
        selectedFile = null;
        processedBlob = null;
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        resultCard.style.display = 'none';
        fileInput.value = '';
        if (originalImage.src) URL.revokeObjectURL(originalImage.src);
        if (resultImage.src) URL.revokeObjectURL(resultImage.src);
    });
});

// Firebase auth
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