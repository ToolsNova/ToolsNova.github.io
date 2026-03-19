// ===== BRIGHTNESS & CONTRAST TOOL =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Brightness & Contrast loaded');
    
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const editorContainer = document.getElementById('editorContainer');
    const originalPreview = document.getElementById('originalPreview');
    const adjustedPreview = document.getElementById('adjustedPreview');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const contrastSlider = document.getElementById('contrastSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');
    const resetBtn = document.getElementById('resetBtn');
    const autoEnhanceBtn = document.getElementById('autoEnhanceBtn');
    const exportFormat = document.getElementById('exportFormat');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // State
    let originalFile = null;
    let originalImage = null;
    let currentBrightness = 0;
    let currentContrast = 0;
    
    // Format bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Handle file selection
    function handleFile(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
            alert('File too large. Please select an image under 50MB');
            return;
        }
        
        // Check guest usage
        if (!canUseTool()) {
            alert('You have used all 3 guest tries. Please sign up for unlimited access!');
            window.location.href = '../signup.html';
            return;
        }
        
        originalFile = file;
        
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        editorContainer.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = function() {
                originalPreview.src = e.target.result;
                adjustedPreview.src = e.target.result;
                
                // Track usage
                trackToolUse();
            };
        };
        reader.readAsDataURL(file);
    }
    
    // Upload area events
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#3b82f6';
        uploadArea.style.background = '#f9fafb';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#e5e7eb';
        uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e5e7eb';
        uploadArea.style.background = '';
        handleFile(e.dataTransfer.files[0]);
    });
    
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    
    changeFileBtn.addEventListener('click', resetTool);
    
    // Apply adjustments
    function applyAdjustments() {
        if (!originalImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        
        // Draw original image
        ctx.drawImage(originalImage, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply brightness and contrast
        const brightnessFactor = 1 + (currentBrightness / 100);
        const contrastFactor = (259 * (currentContrast + 255)) / (255 * (259 - currentContrast));
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Apply brightness
            r = r * brightnessFactor;
            g = g * brightnessFactor;
            b = b * brightnessFactor;
            
            // Apply contrast
            r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
            g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
            b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;
            
            // Clamp values
            data[i] = Math.min(255, Math.max(0, Math.round(r)));
            data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
            data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Update preview
        adjustedPreview.src = canvas.toDataURL();
    }
    
    // Brightness slider
    brightnessSlider.addEventListener('input', function() {
        currentBrightness = parseInt(this.value);
        brightnessValue.textContent = currentBrightness > 0 ? '+' + currentBrightness : currentBrightness;
        applyAdjustments();
    });
    
    // Contrast slider
    contrastSlider.addEventListener('input', function() {
        currentContrast = parseInt(this.value);
        contrastValue.textContent = currentContrast > 0 ? '+' + currentContrast : currentContrast;
        applyAdjustments();
    });
    
    // Reset button
    resetBtn.addEventListener('click', function() {
        currentBrightness = 0;
        currentContrast = 0;
        brightnessSlider.value = 0;
        contrastSlider.value = 0;
        brightnessValue.textContent = '0';
        contrastValue.textContent = '0';
        
        // Reset to original
        if (originalImage) {
            adjustedPreview.src = originalImage.src;
        }
    });
    
    // Auto enhance
    autoEnhanceBtn.addEventListener('click', function() {
        // Simple auto enhance - moderate brightness and contrast boost
        currentBrightness = 15;
        currentContrast = 20;
        
        brightnessSlider.value = 15;
        contrastSlider.value = 20;
        brightnessValue.textContent = '+15';
        contrastValue.textContent = '+20';
        
        applyAdjustments();
        
        // Visual feedback
        this.classList.add('active');
        setTimeout(() => this.classList.remove('active'), 500);
    });
    
    // Quality slider
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        if (!adjustedPreview.src || !originalFile) return;
        
        const format = exportFormat.value;
        const quality = parseInt(qualitySlider.value) / 100;
        
        // Create canvas from adjusted image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.src = adjustedPreview.src;
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `adjusted-${originalFile.name.split('.')[0]}.${format.split('/')[1]}`;
                a.click();
                URL.revokeObjectURL(url);
            }, format, quality);
        };
    });
    
    // Reset tool
    function resetTool() {
        originalFile = null;
        originalImage = null;
        
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        editorContainer.style.display = 'none';
        fileInput.value = '';
        
        // Reset sliders
        currentBrightness = 0;
        currentContrast = 0;
        brightnessSlider.value = 0;
        contrastSlider.value = 0;
        brightnessValue.textContent = '0';
        contrastValue.textContent = '0';
    }
    
    // ===== GUEST USAGE =====
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
    
    function trackToolUse() {
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
});