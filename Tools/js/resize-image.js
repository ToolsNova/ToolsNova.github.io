// ===== RESIZE IMAGE TOOL - COMPLETE FIXED VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Resize Image loaded');
    
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const editorContainer = document.getElementById('editorContainer');
    const originalPreview = document.getElementById('originalPreview');
    const resizedPreview = document.getElementById('resizedPreview');
    const originalDimensions = document.getElementById('originalDimensions');
    const originalDimensionsText = document.getElementById('originalDimensionsText');
    const resizedDimensionsText = document.getElementById('resizedDimensionsText');
    const newDimensions = document.getElementById('newDimensions');
    
    // Controls
    const presetBtns = document.querySelectorAll('.preset-btn');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const maintainAspect = document.getElementById('maintainAspect');
    const applyResizeBtn = document.getElementById('applyResizeBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Export
    const exportFormat = document.getElementById('exportFormat');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // State
    let originalFile = null;
    let originalImage = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatio = 1;
    let currentResizedDataUrl = null; // Store current resized image
    
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
                resizedPreview.src = e.target.result;
                currentResizedDataUrl = e.target.result;
                
                originalWidth = originalImage.width;
                originalHeight = originalImage.height;
                aspectRatio = originalWidth / originalHeight;
                
                // Update dimension displays
                originalDimensions.textContent = `${originalWidth} × ${originalHeight}`;
                originalDimensionsText.textContent = `${originalWidth} × ${originalHeight}`;
                resizedDimensionsText.textContent = `${originalWidth} × ${originalHeight}`;
                
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                updateNewDimensions();
                
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
    
    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const width = parseInt(this.dataset.width);
            const height = parseInt(this.dataset.height);
            
            widthInput.value = width;
            
            if (maintainAspect.checked) {
                heightInput.value = Math.round(width / aspectRatio);
            } else {
                heightInput.value = height;
            }
            
            updateNewDimensions();
            performResize(); // Actually resize the image
        });
    });
    
    // Width input
    widthInput.addEventListener('input', function() {
        if (maintainAspect.checked && originalImage) {
            heightInput.value = Math.round(this.value / aspectRatio);
        }
        updateNewDimensions();
        
        // Clear previous timer
        if (previewTimer) {
            clearTimeout(previewTimer);
        }
        
        // Set new timer for live preview
        previewTimer = setTimeout(() => {
            performResize();
        }, 500);
    });
    
    // Height input
    heightInput.addEventListener('input', function() {
        if (maintainAspect.checked && originalImage) {
            widthInput.value = Math.round(this.value * aspectRatio);
        }
        updateNewDimensions();
        
        // Clear previous timer
        if (previewTimer) {
            clearTimeout(previewTimer);
        }
        
        // Set new timer for live preview
        previewTimer = setTimeout(() => {
            performResize();
        }, 500);
    });
    
    // Update new dimensions display
    function updateNewDimensions() {
        const newWidth = parseInt(widthInput.value) || originalWidth;
        const newHeight = parseInt(heightInput.value) || originalHeight;
        newDimensions.textContent = `${newWidth} × ${newHeight}`;
        resizedDimensionsText.textContent = `${newWidth} × ${newHeight}`;
    }
    
    // Perform actual resize
    function performResize() {
        if (!originalImage) return;
        
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);
        
        if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 1 || newHeight < 1) {
            return;
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw resized image
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
        
        // Get the resized image data URL
        currentResizedDataUrl = canvas.toDataURL('image/png');
        
        // Update preview
        resizedPreview.src = currentResizedDataUrl;
        
        console.log('Resize performed:', newWidth, 'x', newHeight);
    }
    
    // Apply resize button
    applyResizeBtn.addEventListener('click', function() {
        if (!originalImage) {
            alert('Please upload an image first');
            return;
        }
        
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);
        
        if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 1 || newHeight < 1) {
            alert('Please enter valid dimensions');
            return;
        }
        
        // Force resize now
        performResize();
        
        // Visual feedback
        applyResizeBtn.innerHTML = '<i class="fas fa-check"></i> Applied!';
        applyResizeBtn.style.background = '#10b981';
        
        setTimeout(() => {
            applyResizeBtn.innerHTML = '<i class="fas fa-check"></i> Apply Resize';
            applyResizeBtn.style.background = '';
        }, 1000);
    });
    
    // Reset button
    resetBtn.addEventListener('click', function() {
        if (!originalImage) return;
        
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        updateNewDimensions();
        
        // Reset to original
        resizedPreview.src = originalImage.src;
        currentResizedDataUrl = originalImage.src;
        
        // Visual feedback
        resetBtn.innerHTML = '<i class="fas fa-check"></i> Reset';
        setTimeout(() => {
            resetBtn.innerHTML = '<i class="fas fa-undo"></i> Reset';
        }, 1000);
    });
    
    // Quality slider
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });
    
    // Download button - FIXED to use currentResizedDataUrl
    downloadBtn.addEventListener('click', function() {
        if (!currentResizedDataUrl || !originalFile) {
            alert('Please resize an image first');
            return;
        }
        
        const format = exportFormat.value;
        const quality = parseInt(qualitySlider.value) / 100;
        
        // Create image from current resized data
        const img = new Image();
        img.src = currentResizedDataUrl;
        img.onload = function() {
            // Create canvas from the loaded image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Export with selected format and quality
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resized-${originalFile.name.split('.')[0]}.${format.split('/')[1]}`;
                a.click();
                URL.revokeObjectURL(url);
                
                // Success feedback
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                setTimeout(() => {
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Resized Image';
                }, 2000);
            }, format, quality);
        };
    });
    
    // Reset tool
    function resetTool() {
        originalFile = null;
        originalImage = null;
        currentResizedDataUrl = null;
        
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        editorContainer.style.display = 'none';
        fileInput.value = '';
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