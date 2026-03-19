// ===== IMAGE TO PNG CONVERTER =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Image to PNG Converter loaded');
    
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const settingsCard = document.getElementById('settingsCard');
    const convertBtn = document.getElementById('convertBtn');
    const loading = document.getElementById('loading');
    const previewCard = document.getElementById('previewCard');
    const originalPreview = document.getElementById('originalPreview');
    const convertedPreview = document.getElementById('convertedPreview');
    const originalFormat = document.getElementById('originalFormat');
    const originalSize = document.getElementById('originalSize');
    const convertedSize = document.getElementById('convertedSize');
    const downloadBtn = document.getElementById('downloadBtn');
    const newBtn = document.getElementById('newBtn');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const maintainAspect = document.getElementById('maintainAspect');
    const progressFill = document.getElementById('progressFill');
    
    // State
    let originalFile = null;
    let originalImage = null;
    let convertedBlob = null;
    let originalImageAspect = 1;
    
    // Format bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Get file extension
    function getFileExtension(filename) {
        return filename.split('.').pop().toUpperCase();
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
        settingsCard.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = function() {
                originalPreview.src = e.target.result;
                originalFormat.textContent = getFileExtension(file.name);
                originalSize.textContent = formatBytes(file.size);
                
                // Set aspect ratio
                originalImageAspect = originalImage.width / originalImage.height;
                widthInput.value = originalImage.width;
                heightInput.value = originalImage.height;
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
    
    changeFileBtn.addEventListener('click', resetConverter);
    
    // Aspect ratio handling
    widthInput.addEventListener('input', function() {
        if (maintainAspect.checked && originalImage) {
            heightInput.value = Math.round(this.value / originalImageAspect);
        }
    });
    
    heightInput.addEventListener('input', function() {
        if (maintainAspect.checked && originalImage) {
            widthInput.value = Math.round(this.value * originalImageAspect);
        }
    });
    
    // Convert to PNG
    convertBtn.addEventListener('click', async function() {
        if (!originalImage) return;
        
        convertBtn.disabled = true;
        
        // Get settings
        const pngType = document.querySelector('input[name="pngType"]:checked').value;
        const newWidth = parseInt(widthInput.value) || originalImage.width;
        const newHeight = parseInt(heightInput.value) || originalImage.height;
        
        // Show loading
        loading.style.display = 'block';
        settingsCard.style.display = 'none';
        progressFill.style.width = '0%';
        
        try {
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            progressFill.style.width = '30%';
            
            // Handle transparency
            if (pngType === 'transparent') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Draw image
            ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
            
            progressFill.style.width = '60%';
            
            // Convert to PNG blob
            canvas.toBlob((blob) => {
                convertedBlob = blob;
                
                // Update preview
                const url = URL.createObjectURL(blob);
                convertedPreview.src = url;
                convertedSize.textContent = formatBytes(blob.size);
                
                progressFill.style.width = '100%';
                
                // Hide loading, show preview
                setTimeout(() => {
                    loading.style.display = 'none';
                    previewCard.style.display = 'block';
                    convertBtn.disabled = false;
                }, 500);
                
                // Track usage
                trackToolUse();
                
            }, 'image/png');
            
        } catch (error) {
            console.error('Conversion error:', error);
            alert('Conversion failed. Please try again.');
            loading.style.display = 'none';
            settingsCard.style.display = 'block';
            convertBtn.disabled = false;
        }
    });
    
    // Download PNG
    downloadBtn.addEventListener('click', () => {
        if (!convertedBlob) return;
        
        const url = URL.createObjectURL(convertedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFile.name.replace(/\.[^/.]+$/, '') + '.png';
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Convert another
    newBtn.addEventListener('click', resetConverter);
    
    function resetConverter() {
        originalFile = null;
        originalImage = null;
        convertedBlob = null;
        
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        settingsCard.style.display = 'none';
        previewCard.style.display = 'none';
        loading.style.display = 'none';
        fileInput.value = '';
        convertBtn.disabled = false;
        progressFill.style.width = '0%';
        
        widthInput.value = '';
        heightInput.value = '';
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