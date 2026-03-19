// ===== CROP & ROTATE TOOL =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Crop & Rotate loaded');
    
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const editorContainer = document.getElementById('editorContainer');
    const editorImage = document.getElementById('editorImage');
    const imageContainer = document.getElementById('imageContainer');
    
    // Tool buttons
    const cropBtn = document.getElementById('cropBtn');
    const cropControls = document.getElementById('cropControls');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
    const flipVerticalBtn = document.getElementById('flipVerticalBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Export elements
    const exportFormat = document.getElementById('exportFormat');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // State
    let originalFile = null;
    let originalImage = null;
    let currentRotation = 0;
    let currentFlipH = false;
    let currentFlipV = false;
    
    // Crop state
    let isCropping = false;
    let cropStartX, cropStartY, cropEndX, cropEndY;
    let cropOverlay = null;
    let cropSelection = null;
    let isSelecting = false;
    
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
                editorImage.src = e.target.result;
                
                // Reset all transformations
                currentRotation = 0;
                currentFlipH = false;
                currentFlipV = false;
                
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
    
    // ===== CROP FUNCTIONALITY =====
    cropBtn.addEventListener('click', function() {
        if (isCropping) {
            cancelCrop();
        } else {
            startCrop();
        }
    });
    
    function startCrop() {
        isCropping = true;
        cropBtn.innerHTML = '<i class="fas fa-times"></i> <span>Cancel</span>';
        cropBtn.style.background = '#ef4444';
        cropBtn.style.color = 'white';
        
        // Create overlay
        cropOverlay = document.createElement('div');
        cropOverlay.className = 'crop-overlay';
        
        // Create selection div
        cropSelection = document.createElement('div');
        cropSelection.className = 'crop-selection';
        
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(cropOverlay);
        imageContainer.appendChild(cropSelection);
        
        // Mouse events
        cropOverlay.addEventListener('mousedown', startSelection);
        cropOverlay.addEventListener('mousemove', updateSelection);
        cropOverlay.addEventListener('mouseup', endSelection);
        
        // Show crop controls
        cropControls.style.display = 'flex';
    }
    
    function startSelection(e) {
        if (!isCropping) return;
        isSelecting = true;
        
        const rect = imageContainer.getBoundingClientRect();
        
        cropStartX = e.clientX - rect.left;
        cropStartY = e.clientY - rect.top;
        
        cropSelection.style.display = 'block';
        cropSelection.style.left = cropStartX + 'px';
        cropSelection.style.top = cropStartY + 'px';
        cropSelection.style.width = '0px';
        cropSelection.style.height = '0px';
    }
    
    function updateSelection(e) {
        if (!isCropping || !isSelecting || cropStartX === undefined) return;
        
        const rect = imageContainer.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const left = Math.min(cropStartX, currentX);
        const top = Math.min(cropStartY, currentY);
        const width = Math.abs(currentX - cropStartX);
        const height = Math.abs(currentY - cropStartY);
        
        cropSelection.style.left = left + 'px';
        cropSelection.style.top = top + 'px';
        cropSelection.style.width = width + 'px';
        cropSelection.style.height = height + 'px';
        
        cropEndX = currentX;
        cropEndY = currentY;
    }
    
    function endSelection(e) {
        if (!isCropping || !isSelecting) return;
        isSelecting = false;
    }
    
    applyCropBtn.addEventListener('click', function() {
        if (cropStartX === undefined || cropEndX === undefined) {
            alert('Please drag to select an area first');
            return;
        }
        
        const rect = imageContainer.getBoundingClientRect();
        
        // Calculate scale factors
        const scaleX = editorImage.naturalWidth / editorImage.offsetWidth;
        const scaleY = editorImage.naturalHeight / editorImage.offsetHeight;
        
        const left = Math.min(cropStartX, cropEndX);
        const top = Math.min(cropStartY, cropEndY);
        const right = Math.max(cropStartX, cropEndX);
        const bottom = Math.max(cropStartY, cropEndY);
        
        const cropX = Math.max(0, left * scaleX);
        const cropY = Math.max(0, top * scaleY);
        const cropWidth = Math.min((right - left) * scaleX, editorImage.naturalWidth - cropX);
        const cropHeight = Math.min((bottom - top) * scaleY, editorImage.naturalHeight - cropY);
        
        if (cropWidth < 10 || cropHeight < 10) {
            alert('Please select a larger area to crop');
            return;
        }
        
        // Create canvas and crop
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = cropWidth;
        tempCanvas.height = cropHeight;
        
        // Create a temporary image with current transformations
        const img = new Image();
        img.src = editorImage.src;
        img.onload = function() {
            tempCtx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            
            // Update original image
            originalImage = new Image();
            originalImage.src = tempCanvas.toDataURL();
            originalImage.onload = function() {
                editorImage.src = tempCanvas.toDataURL();
                cancelCrop();
            };
        };
    });
    
    cancelCropBtn.addEventListener('click', cancelCrop);
    
    function cancelCrop() {
        isCropping = false;
        isSelecting = false;
        cropStartX = cropStartY = cropEndX = cropEndY = undefined;
        
        cropBtn.innerHTML = '<i class="fas fa-crop"></i> <span>Crop</span>';
        cropBtn.style.background = '';
        cropBtn.style.color = '';
        
        if (cropOverlay) {
            cropOverlay.remove();
            cropOverlay = null;
        }
        if (cropSelection) {
            cropSelection.remove();
            cropSelection = null;
        }
        
        cropControls.style.display = 'none';
    }
    
    // ===== ROTATE & FLIP =====
    rotateLeftBtn.addEventListener('click', function() {
        currentRotation = (currentRotation - 90 + 360) % 360;
        applyTransformations();
    });
    
    rotateRightBtn.addEventListener('click', function() {
        currentRotation = (currentRotation + 90) % 360;
        applyTransformations();
    });
    
    flipHorizontalBtn.addEventListener('click', function() {
        currentFlipH = !currentFlipH;
        applyTransformations();
    });
    
    flipVerticalBtn.addEventListener('click', function() {
        currentFlipV = !currentFlipV;
        applyTransformations();
    });
    
    function applyTransformations() {
        if (!originalImage) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        let width = originalImage.width;
        let height = originalImage.height;
        
        if (currentRotation % 180 !== 0) {
            [width, height] = [height, width];
        }
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        tempCtx.save();
        tempCtx.translate(width / 2, height / 2);
        tempCtx.rotate(currentRotation * Math.PI / 180);
        tempCtx.scale(currentFlipH ? -1 : 1, currentFlipV ? -1 : 1);
        tempCtx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
        tempCtx.restore();
        
        editorImage.src = tempCanvas.toDataURL();
    }
    
    // Reset button
    resetBtn.addEventListener('click', function() {
        if (!originalImage) return;
        
        currentRotation = 0;
        currentFlipH = false;
        currentFlipV = false;
        
        editorImage.src = originalImage.src;
        
        // Cancel crop if active
        if (isCropping) {
            cancelCrop();
        }
    });
    
    // Quality slider
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        if (!editorImage.src || !originalFile) return;
        
        const format = exportFormat.value;
        const quality = parseInt(qualitySlider.value) / 100;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.src = editorImage.src;
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `edited-${originalFile.name.split('.')[0]}.${format.split('/')[1]}`;
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
        
        currentRotation = 0;
        currentFlipH = false;
        currentFlipV = false;
        
        if (isCropping) {
            cancelCrop();
        }
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