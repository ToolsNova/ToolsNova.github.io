// ===== IMAGE EDITOR - COMPLETE FIXED VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Editor loaded');
    
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
    
    // Crop elements
    const cropBtn = document.getElementById('cropBtn');
    const cropControls = document.getElementById('cropControls');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    
    // Resize elements
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const applyResizeBtn = document.getElementById('applyResizeBtn');
    const maintainAspect = document.getElementById('maintainAspect');
    
    // Rotate & Flip
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
    const flipVerticalBtn = document.getElementById('flipVerticalBtn');
    
    // Adjust sliders
    const brightnessSlider = document.getElementById('brightnessSlider');
    const contrastSlider = document.getElementById('contrastSlider');
    const saturationSlider = document.getElementById('saturationSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');
    const saturationValue = document.getElementById('saturationValue');
    
    // Filters
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    const autoEnhanceBtn = document.getElementById('autoEnhanceBtn');
    
    // Export
    const exportFormat = document.getElementById('exportFormat');
    const exportQuality = document.getElementById('exportQuality');
    const exportQualityValue = document.getElementById('exportQualityValue');
    const exportBtn = document.getElementById('exportBtn');

    // Undo/Redo and Reset buttons
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // State
    let originalFile = null;
    let originalImage = null;
    let originalImageData = null;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let cropper = null;
    let currentFilter = 'normal';
    let currentRotation = 0;
    let currentFlipH = false;
    let currentFlipV = false;
    let currentBrightness = 0;
    let currentContrast = 0;
    let currentSaturation = 0;
    
    // Crop state
    let isCropping = false;
    let cropStartX, cropStartY, cropEndX, cropEndY;
    let cropOverlay = null;
    let cropSelection = null;
    let isSelecting = false;
    
    // ===== UNDO/REDO FUNCTIONALITY =====
    let history = [];
    let currentHistoryIndex = -1;
    const maxHistorySteps = 20;

    // Save state to history
    function saveToHistory() {
        if (!editorImage || !editorImage.src) return;
        
        const snapshot = {
            src: editorImage.src,
            width: editorImage.naturalWidth,
            height: editorImage.naturalHeight,
            brightness: currentBrightness,
            contrast: currentContrast,
            saturation: currentSaturation,
            filter: currentFilter,
            rotation: currentRotation,
            flipH: currentFlipH,
            flipV: currentFlipV
        };
        
        // If we're not at the end of history, remove future states
        if (currentHistoryIndex < history.length - 1) {
            history = history.slice(0, currentHistoryIndex + 1);
        }
        
        // Add new state
        history.push(snapshot);
        currentHistoryIndex++;
        
        // Limit history size
        if (history.length > maxHistorySteps) {
            history.shift();
            currentHistoryIndex--;
        }
        
        // Update buttons
        updateHistoryButtons();
        console.log('Saved to history:', currentHistoryIndex);
    }

    // Update undo/redo buttons state
    function updateHistoryButtons() {
        if (undoBtn) {
            undoBtn.disabled = currentHistoryIndex <= 0;
        }
        if (redoBtn) {
            redoBtn.disabled = currentHistoryIndex >= history.length - 1;
        }
    }

    // Load state from history
    function loadFromHistory(index) {
        if (index < 0 || index >= history.length) return;
        
        const state = history[index];
        
        // Create temp image from stored src
        const img = new Image();
        img.src = state.src;
        img.onload = function() {
            // Update original image
            originalImage = img;
            editorImage.src = state.src;
            
            // Update canvas
            canvas.width = state.width;
            canvas.height = state.height;
            ctx.drawImage(img, 0, 0);
            
            // Update resize inputs
            widthInput.value = state.width;
            heightInput.value = state.height;
            
            // Restore adjustment values
            currentBrightness = state.brightness;
            currentContrast = state.contrast;
            currentSaturation = state.saturation;
            currentFilter = state.filter;
            currentRotation = state.rotation;
            currentFlipH = state.flipH;
            currentFlipV = state.flipV;
            
            // Update sliders
            brightnessSlider.value = state.brightness;
            contrastSlider.value = state.contrast;
            saturationSlider.value = state.saturation;
            brightnessValue.textContent = state.brightness > 0 ? '+' + state.brightness : state.brightness;
            contrastValue.textContent = state.contrast > 0 ? '+' + state.contrast : state.contrast;
            saturationValue.textContent = state.saturation > 0 ? '+' + state.saturation : state.saturation;
            
            // Update filter buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-filter="${state.filter}"]`)?.classList.add('active');
            
            // Store original data again
            storeOriginalImageData();
            
            // Cancel crop if active
            if (isCropping) {
                cancelCrop();
            }
            
            currentHistoryIndex = index;
            updateHistoryButtons();
        };
    }

    // Undo
    if (undoBtn) {
        undoBtn.addEventListener('click', function() {
            if (currentHistoryIndex > 0) {
                loadFromHistory(currentHistoryIndex - 1);
            }
        });
    }

    // Redo
    if (redoBtn) {
        redoBtn.addEventListener('click', function() {
            if (currentHistoryIndex < history.length - 1) {
                loadFromHistory(currentHistoryIndex + 1);
            }
        });
    }
    
    // Format bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Store original image data
    function storeOriginalImageData() {
        if (!originalImage) return;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = originalImage.width;
        tempCanvas.height = originalImage.height;
        tempCtx.drawImage(originalImage, 0, 0);
        originalImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        console.log('Original image data stored');
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
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = function() {
                editorImage.src = e.target.result;
                editorContainer.style.display = 'block';
                
                // Store original image data
                storeOriginalImageData();
                
                // Initialize canvas with original image
                canvas.width = originalImage.width;
                canvas.height = originalImage.height;
                ctx.drawImage(originalImage, 0, 0);
                
                // Update resize inputs
                widthInput.value = originalImage.width;
                heightInput.value = originalImage.height;
                
                // Reset all adjustments
                resetAdjustments();
                
                // Clear history for new image and save initial state
                history = [];
                currentHistoryIndex = -1;
                setTimeout(saveToHistory, 100);
                
                // Track usage
                trackToolUse();
            };
        };
        reader.readAsDataURL(file);
    }
    
    // Reset all adjustments
    function resetAdjustments() {
        currentBrightness = 0;
        currentContrast = 0;
        currentSaturation = 0;
        currentRotation = 0;
        currentFlipH = false;
        currentFlipV = false;
        currentFilter = 'normal';
        
        if (brightnessSlider) brightnessSlider.value = 0;
        if (contrastSlider) contrastSlider.value = 0;
        if (saturationSlider) saturationSlider.value = 0;
        if (brightnessValue) brightnessValue.textContent = '0';
        if (contrastValue) contrastValue.textContent = '0';
        if (saturationValue) saturationValue.textContent = '0';
        
        filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="normal"]')?.classList.add('active');
    }
    
    // Upload area events
    if (uploadArea) {
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
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    }
    
    if (changeFileBtn) {
        changeFileBtn.addEventListener('click', resetEditor);
    }
    
    // Reset editor
    function resetEditor() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        originalFile = null;
        originalImage = null;
        originalImageData = null;
        
        if (uploadArea) uploadArea.style.display = 'block';
        if (fileInfo) fileInfo.style.display = 'none';
        if (editorContainer) editorContainer.style.display = 'none';
        if (fileInput) fileInput.value = '';
        
        resetAdjustments();
        
        // Clear history
        history = [];
        currentHistoryIndex = -1;
        updateHistoryButtons();
    }
    
    // ===== SIMPLE CROP TOOL =====
    if (cropBtn) {
        cropBtn.addEventListener('click', function() {
            if (isCropping) {
                cancelCrop();
            } else {
                startCrop();
            }
        });
    }
    
    function startCrop() {
        isCropping = true;
        cropBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Crop';
        cropBtn.style.background = '#ef4444';
        
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
        
        // Show instructions
        if (cropControls) cropControls.style.display = 'flex';
        const applyBtn = document.querySelector('#cropControls .action-btn.small');
        if (applyBtn) applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply Crop';
    }
    
    function startSelection(e) {
        if (!isCropping) return;
        isSelecting = true;
        
        const rect = imageContainer.getBoundingClientRect();
        
        // Store start position
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
        
        // Calculate selection bounds
        const left = Math.min(cropStartX, currentX);
        const top = Math.min(cropStartY, currentY);
        const width = Math.abs(currentX - cropStartX);
        const height = Math.abs(currentY - cropStartY);
        
        // Update selection div
        cropSelection.style.left = left + 'px';
        cropSelection.style.top = top + 'px';
        cropSelection.style.width = width + 'px';
        cropSelection.style.height = height + 'px';
        
        // Store end coordinates
        cropEndX = currentX;
        cropEndY = currentY;
    }
    
    function endSelection(e) {
        if (!isCropping || !isSelecting) return;
        isSelecting = false;
        console.log('Selection finalized');
    }
    
    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', function() {
            if (cropStartX === undefined || cropEndX === undefined) {
                alert('Please drag to select an area first');
                return;
            }
            
            // Get image container dimensions
            const rect = imageContainer.getBoundingClientRect();
            
            // Calculate scale factors
            const scaleX = editorImage.naturalWidth / editorImage.offsetWidth;
            const scaleY = editorImage.naturalHeight / editorImage.offsetHeight;
            
            // Calculate selection bounds in screen coordinates
            const left = Math.min(cropStartX, cropEndX);
            const top = Math.min(cropStartY, cropEndY);
            const right = Math.max(cropStartX, cropEndX);
            const bottom = Math.max(cropStartY, cropEndY);
            
            // Convert to actual image coordinates
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
            
            // Draw cropped area
            tempCtx.drawImage(originalImage, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            
            // Update original image
            originalImage = new Image();
            originalImage.src = tempCanvas.toDataURL();
            originalImage.onload = function() {
                editorImage.src = tempCanvas.toDataURL();
                
                canvas.width = cropWidth;
                canvas.height = cropHeight;
                ctx.drawImage(tempCanvas, 0, 0);
                
                widthInput.value = Math.round(cropWidth);
                heightInput.value = Math.round(cropHeight);
                
                storeOriginalImageData();
                resetAdjustments();
                cancelCrop();
                
                // Save to history
                setTimeout(saveToHistory, 100);
            };
        });
    }
    
    if (cancelCropBtn) {
        cancelCropBtn.addEventListener('click', cancelCrop);
    }
    
    function cancelCrop() {
        isCropping = false;
        isSelecting = false;
        cropStartX = cropStartY = cropEndX = cropEndY = undefined;
        
        if (cropBtn) {
            cropBtn.innerHTML = '<i class="fas fa-crop"></i> Start Cropping';
            cropBtn.style.background = '#3b82f6';
        }
        
        if (cropOverlay) {
            cropOverlay.remove();
            cropOverlay = null;
        }
        if (cropSelection) {
            cropSelection.remove();
            cropSelection = null;
        }
        
        if (cropControls) cropControls.style.display = 'none';
    }
    
    // ===== RESIZE FUNCTIONALITY =====
    if (widthInput) {
        widthInput.addEventListener('input', function() {
            if (maintainAspect.checked && originalImage) {
                const aspect = originalImage.width / originalImage.height;
                heightInput.value = Math.round(this.value / aspect);
            }
        });
    }
    
    if (heightInput) {
        heightInput.addEventListener('input', function() {
            if (maintainAspect.checked && originalImage) {
                const aspect = originalImage.width / originalImage.height;
                widthInput.value = Math.round(this.value * aspect);
            }
        });
    }
    
    if (applyResizeBtn) {
        applyResizeBtn.addEventListener('click', function() {
            const newWidth = parseInt(widthInput.value);
            const newHeight = parseInt(heightInput.value);
            
            if (newWidth > 0 && newHeight > 0) {
                // Create temporary canvas for resizing
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = newWidth;
                tempCanvas.height = newHeight;
                const tempCtx = tempCanvas.getContext('2d');
                
                // Draw resized image
                tempCtx.drawImage(originalImage, 0, 0, newWidth, newHeight);
                
                // Update original image
                originalImage = new Image();
                originalImage.src = tempCanvas.toDataURL();
                originalImage.onload = function() {
                    editorImage.src = tempCanvas.toDataURL();
                    
                    // Update canvas
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx.drawImage(tempCanvas, 0, 0);
                    
                    // Store new original data
                    storeOriginalImageData();
                    
                    // Reset adjustments
                    resetAdjustments();
                    
                    // Save to history
                    setTimeout(saveToHistory, 100);
                };
            }
        });
    }
    
    // ===== ROTATE & FLIP =====
    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('click', function() {
            currentRotation = (currentRotation - 90 + 360) % 360;
            applyTransformations();
        });
    }
    
    if (rotateRightBtn) {
        rotateRightBtn.addEventListener('click', function() {
            currentRotation = (currentRotation + 90) % 360;
            applyTransformations();
        });
    }
    
    if (flipHorizontalBtn) {
        flipHorizontalBtn.addEventListener('click', function() {
            currentFlipH = !currentFlipH;
            applyTransformations();
        });
    }
    
    if (flipVerticalBtn) {
        flipVerticalBtn.addEventListener('click', function() {
            currentFlipV = !currentFlipV;
            applyTransformations();
        });
    }
    
    function applyTransformations() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Calculate new dimensions after rotation
        let width = originalImage.width;
        let height = originalImage.height;
        
        if (currentRotation % 180 !== 0) {
            [width, height] = [height, width];
        }
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Clear canvas
        tempCtx.clearRect(0, 0, width, height);
        
        // Apply transformations
        tempCtx.save();
        tempCtx.translate(width / 2, height / 2);
        tempCtx.rotate(currentRotation * Math.PI / 180);
        tempCtx.scale(currentFlipH ? -1 : 1, currentFlipV ? -1 : 1);
        tempCtx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
        tempCtx.restore();
        
        // Update original image
        originalImage = new Image();
        originalImage.src = tempCanvas.toDataURL();
        originalImage.onload = function() {
            editorImage.src = tempCanvas.toDataURL();
            
            // Update canvas
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(tempCanvas, 0, 0);
            
            // Store new original data
            storeOriginalImageData();
            
            // Update resize inputs
            widthInput.value = width;
            heightInput.value = height;
            
            // Reset adjustments (but keep rotation/flip)
            currentBrightness = 0;
            currentContrast = 0;
            currentSaturation = 0;
            brightnessSlider.value = 0;
            contrastSlider.value = 0;
            saturationSlider.value = 0;
            brightnessValue.textContent = '0';
            contrastValue.textContent = '0';
            saturationValue.textContent = '0';
            
            // Save to history
            setTimeout(saveToHistory, 100);
        };
    }
    
    // ===== ADJUSTMENTS =====
    function applyAdjustments() {
        if (!originalImage || !originalImageData) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = originalImage.width;
        tempCanvas.height = originalImage.height;
        
        // Start with original image data
        const imageData = new ImageData(
            new Uint8ClampedArray(originalImageData.data),
            originalImageData.width,
            originalImageData.height
        );
        const data = imageData.data;
        
        // Apply adjustments pixel by pixel
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Apply brightness (-100 to 100 maps to 0.5 to 1.5)
            const brightnessFactor = 1 + (currentBrightness / 200);
            r = r * brightnessFactor;
            g = g * brightnessFactor;
            b = b * brightnessFactor;
            
            // Apply contrast
            const contrastFactor = (259 * (currentContrast + 255)) / (255 * (259 - currentContrast));
            r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
            g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
            b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;
            
            // Apply saturation
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            const saturationFactor = 1 + (currentSaturation / 100);
            r = gray + (r - gray) * saturationFactor;
            g = gray + (g - gray) * saturationFactor;
            b = gray + (b - gray) * saturationFactor;
            
            // Clamp values
            data[i] = Math.min(255, Math.max(0, Math.round(r)));
            data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
            data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // Update preview
        editorImage.src = tempCanvas.toDataURL();
        
        // Save to history
        setTimeout(saveToHistory, 100);
    }
    
    if (brightnessSlider) {
        brightnessSlider.addEventListener('input', function() {
            currentBrightness = parseInt(this.value);
            brightnessValue.textContent = currentBrightness > 0 ? '+' + currentBrightness : currentBrightness;
            applyAdjustments();
        });
    }
    
    if (contrastSlider) {
        contrastSlider.addEventListener('input', function() {
            currentContrast = parseInt(this.value);
            contrastValue.textContent = currentContrast > 0 ? '+' + currentContrast : currentContrast;
            applyAdjustments();
        });
    }
    
    if (saturationSlider) {
        saturationSlider.addEventListener('input', function() {
            currentSaturation = parseInt(this.value);
            saturationValue.textContent = currentSaturation > 0 ? '+' + currentSaturation : currentSaturation;
            applyAdjustments();
        });
    }
    
    // ===== FILTERS =====
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            if (filter === 'auto-enhance') return;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = filter;
            applyFilter(filter);
        });
    });
    
    function applyFilter(filter) {
        if (!originalImage || !originalImageData) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = originalImage.width;
        tempCanvas.height = originalImage.height;
        
        // Start with original image data
        const imageData = new ImageData(
            new Uint8ClampedArray(originalImageData.data),
            originalImageData.width,
            originalImageData.height
        );
        const data = imageData.data;
        
        switch(filter) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }
                break;
                
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;
                
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;
                
            case 'vintage':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    data[i] = Math.min(255, r * 0.9 + g * 0.1);
                    data[i + 1] = Math.min(255, g * 0.8 + b * 0.2);
                    data[i + 2] = Math.min(255, b * 0.7 + r * 0.3);
                }
                break;
                
            case 'cool':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 0.9);
                    data[i + 2] = Math.min(255, data[i + 2] * 1.1);
                }
                break;
                
            case 'warm':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.1);
                    data[i + 2] = Math.min(255, data[i + 2] * 0.9);
                }
                break;
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // Update preview
        editorImage.src = tempCanvas.toDataURL();
        
        // Save to history
        setTimeout(saveToHistory, 100);
    }
    
    // ===== AUTO ENHANCE =====
    if (autoEnhanceBtn) {
        autoEnhanceBtn.addEventListener('click', function() {
            // Simple auto enhance - increase contrast and saturation slightly
            currentContrast = 20;
            currentSaturation = 15;
            currentBrightness = 5;
            
            contrastSlider.value = 20;
            saturationSlider.value = 15;
            brightnessSlider.value = 5;
            
            contrastValue.textContent = '+20';
            saturationValue.textContent = '+15';
            brightnessValue.textContent = '+5';
            
            applyAdjustments();
            
            // Save to history
            setTimeout(saveToHistory, 100);
            
            // Visual feedback
            this.classList.add('active');
            setTimeout(() => this.classList.remove('active'), 500);
        });
    }
    
    // ===== RESET FUNCTIONALITY =====
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (!originalImage) return;
            
            // Ask for confirmation
            if (confirm('Reset all edits? This cannot be undone.')) {
                // Reset to original uploaded image
                const reader = new FileReader();
                reader.onload = function(e) {
                    originalImage = new Image();
                    originalImage.src = e.target.result;
                    originalImage.onload = function() {
                        editorImage.src = e.target.result;
                        
                        // Reset canvas
                        canvas.width = originalImage.width;
                        canvas.height = originalImage.height;
                        ctx.drawImage(originalImage, 0, 0);
                        
                        // Reset resize inputs
                        widthInput.value = originalImage.width;
                        heightInput.value = originalImage.height;
                        
                        // Reset all adjustments
                        resetAdjustments();
                        
                        // Store new original data
                        storeOriginalImageData();
                        
                        // Cancel crop if active
                        if (isCropping) {
                            cancelCrop();
                        }
                        
                        // Clear history and save new state
                        history = [];
                        currentHistoryIndex = -1;
                        setTimeout(saveToHistory, 100);
                        
                        // Success feedback
                        resetBtn.innerHTML = '<i class="fas fa-check"></i> Reset Complete';
                        setTimeout(() => {
                            resetBtn.innerHTML = '<i class="fas fa-undo-alt"></i> Reset All Changes';
                        }, 2000);
                    };
                };
                reader.readAsDataURL(originalFile);
            }
        });
    }
    
    // ===== EXPORT =====
    if (exportQuality) {
        exportQuality.addEventListener('input', function() {
            exportQualityValue.textContent = this.value + '%';
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const format = exportFormat.value;
            const quality = parseInt(exportQuality.value) / 100;
            
            // Get current image from canvas
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = originalImage.width;
            tempCanvas.height = originalImage.height;
            
            // Draw current image
            const img = new Image();
            img.src = editorImage.src;
            img.onload = function() {
                tempCtx.drawImage(img, 0, 0);
                
                // Convert to blob and download
                tempCanvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `edited-${originalFile.name.split('.')[0]}.${format.split('/')[1]}`;
                    a.click();
                    URL.revokeObjectURL(url);
                }, format, quality);
            };
        });
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