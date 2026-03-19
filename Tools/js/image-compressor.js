// ===== IMAGE COMPRESSOR - USING BROWSER CANVAS API =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Compressor loaded');
    
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const settingsCard = document.getElementById('settingsCard');
    const compressBtn = document.getElementById('compressBtn');
    const loading = document.getElementById('loading');
    const previewCard = document.getElementById('previewCard');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalPreviewSize = document.getElementById('originalPreviewSize');
    const compressedPreviewSize = document.getElementById('compressedPreviewSize');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const reduction = document.getElementById('reduction');
    const downloadBtn = document.getElementById('downloadBtn');
    const newBtn = document.getElementById('newBtn');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const maxWidthSelect = document.getElementById('maxWidthSelect');
    const progressFill = document.getElementById('progressFill');
    
    // State
    let originalFile = null;
    let compressedFile = null;
    let compressedBlob = null;
    let originalImage = null;
    
    // Format bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Update quality display
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });
    
    // Handle file selection
    function handleFile(file) {
        if (!file) return;
        
        // Check if image file
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }
        
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('File too large. Please select an image under 50MB');
            return;
        }
        
        originalFile = file;
        
        // Update UI
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        settingsCard.style.display = 'block';
        
        // Load image for preview
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = function() {
                originalPreview.src = e.target.result;
                originalPreviewSize.textContent = formatBytes(file.size);
            };
        };
        reader.readAsDataURL(file);
    }
    
    // Upload area events
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
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
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });
    
    // Change file
    changeFileBtn.addEventListener('click', () => {
        resetTool();
    });
    
    // Compress image
    compressBtn.addEventListener('click', async () => {
        if (!originalFile || !originalImage) return;
        
        // Check guest usage
        if (!canUseTool()) {
            alert('You have used all 3 guest tries. Please sign up for unlimited access!');
            window.location.href = '../signup.html';
            return;
        }
        
        // Disable button
        compressBtn.disabled = true;
        
        // Get settings
        const quality = parseInt(qualitySlider.value) / 100;
        const maxWidth = parseInt(maxWidthSelect.value);
        const format = document.querySelector('input[name="format"]:checked').value;
        
        // Show loading
        loading.style.display = 'block';
        settingsCard.style.display = 'none';
        progressFill.style.width = '0%';
        
        try {
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate dimensions
            let width = originalImage.width;
            let height = originalImage.height;
            
            if (maxWidth > 0 && width > maxWidth) {
                height = Math.floor(height * (maxWidth / width));
                width = maxWidth;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw image
            ctx.drawImage(originalImage, 0, 0, width, height);
            
            // Determine output format
            let outputFormat = originalFile.type;
            if (format !== 'same') {
                outputFormat = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
            }
            
            // Compress
            progressFill.style.width = '50%';
            
            canvas.toBlob((blob) => {
                compressedBlob = blob;
                compressedFile = new File([blob], 'compressed-' + originalFile.name, {
                    type: blob.type
                });
                
                // Update preview
                compressedPreview.src = URL.createObjectURL(blob);
                compressedPreviewSize.textContent = formatBytes(blob.size);
                
                // Update stats
                const originalSizeBytes = originalFile.size;
                const compressedSizeBytes = blob.size;
                const reductionPercent = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes * 100).toFixed(1);
                
                originalSize.textContent = formatBytes(originalSizeBytes);
                compressedSize.textContent = formatBytes(compressedSizeBytes);
                reduction.textContent = reductionPercent + '%';
                
                // Hide loading, show preview
                progressFill.style.width = '100%';
                setTimeout(() => {
                    loading.style.display = 'none';
                    previewCard.style.display = 'block';
                    compressBtn.disabled = false;
                }, 500);
                
                // Track usage
                trackToolUse();
                
            }, outputFormat, quality);
            
        } catch (error) {
            console.error('Compression error:', error);
            alert('Compression failed. Please try again.');
            loading.style.display = 'none';
            settingsCard.style.display = 'block';
            compressBtn.disabled = false;
        }
    });
    
    // Download compressed image
    downloadBtn.addEventListener('click', () => {
        if (!compressedBlob) return;
        
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = compressedFile.name;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Compress another
    newBtn.addEventListener('click', () => {
        resetTool();
    });
    
    // Reset tool
    function resetTool() {
        originalFile = null;
        compressedFile = null;
        compressedBlob = null;
        originalImage = null;
        
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        settingsCard.style.display = 'none';
        previewCard.style.display = 'none';
        loading.style.display = 'none';
        fileInput.value = '';
        compressBtn.disabled = false;
        progressFill.style.width = '0%';
    }
    
    // Check if user can use tool (guest limits)
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
    
    // Track tool usage
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