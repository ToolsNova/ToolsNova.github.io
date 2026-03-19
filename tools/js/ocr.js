// ===== OCR - SCREENSHOT TO TEXT =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('OCR Tool loaded');
    
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const languageCard = document.getElementById('languageCard');
    const extractBtn = document.getElementById('extractBtn');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const resultThumbnail = document.getElementById('resultThumbnail');
    const extractedText = document.getElementById('extractedText');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const lineCount = document.getElementById('lineCount');
    const copyBtn = document.getElementById('copyBtn');
    const downloadTxtBtn = document.getElementById('downloadTxtBtn');
    const editBtn = document.getElementById('editBtn');
    const newOcrBtn = document.getElementById('newOcrBtn');
    const editControls = document.getElementById('editControls');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const progressFill = document.getElementById('progressFill');
    const loadingStatus = document.getElementById('loadingStatus');
    const preprocessImage = document.getElementById('preprocessImage');
    
    // State
    let originalFile = null;
    let originalImage = null;
    let isEditing = false;
    
    // Format bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Update text stats
    function updateTextStats(text) {
        charCount.textContent = text.length;
        wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
        lineCount.textContent = text.trim() ? text.split('\n').length : 0;
    }
    
    // Handle file selection
    function handleFile(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }
        
        if (file.size > 20 * 1024 * 1024) {
            alert('File too large. Please select an image under 20MB');
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
        languageCard.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = function() {
                resultThumbnail.src = e.target.result;
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
    
    changeFileBtn.addEventListener('click', resetOCR);
    
    // Extract text with OCR
    extractBtn.addEventListener('click', async function() {
        if (!originalImage) return;
        
        // Get selected language
        const language = document.querySelector('input[name="language"]:checked').value;
        const shouldPreprocess = preprocessImage.checked;
        
        // Show loading
        languageCard.style.display = 'none';
        loading.style.display = 'block';
        extractBtn.disabled = true;
        progressFill.style.width = '0%';
        
        try {
            loadingStatus.textContent = 'Preprocessing image...';
            progressFill.style.width = '10%';
            
            let imageToProcess = originalImage;
            
            // Preprocess image if enabled
            if (shouldPreprocess) {
                imageToProcess = await preprocessImageForOCR(originalImage);
                progressFill.style.width = '30%';
            }
            
            loadingStatus.textContent = 'Loading OCR engine...';
            
            // Initialize Tesseract
            const worker = await Tesseract.createWorker({
                logger: progress => {
                    if (progress.status === 'recognizing text') {
                        const percent = Math.round(progress.progress * 50) + 30;
                        progressFill.style.width = percent + '%';
                        loadingStatus.textContent = `Recognizing: ${Math.round(progress.progress * 100)}%`;
                    }
                }
            });
            
            loadingStatus.textContent = 'Loading language data...';
            progressFill.style.width = '40%';
            
            await worker.loadLanguage(language);
            await worker.initialize(language);
            
            loadingStatus.textContent = 'Recognizing text...';
            progressFill.style.width = '50%';
            
            // Recognize text
            const { data } = await worker.recognize(imageToProcess);
            
            progressFill.style.width = '90%';
            loadingStatus.textContent = 'Finalizing...';
            
            await worker.terminate();
            
            // Display results
            extractedText.value = data.text;
            updateTextStats(data.text);
            
            progressFill.style.width = '100%';
            
            setTimeout(() => {
                loading.style.display = 'none';
                resultCard.style.display = 'block';
                extractBtn.disabled = false;
            }, 500);
            
            // Track usage
            trackToolUse();
            
        } catch (error) {
            console.error('OCR error:', error);
            alert('OCR failed. Please try again with a different image.');
            loading.style.display = 'none';
            languageCard.style.display = 'block';
            extractBtn.disabled = false;
        }
    });
    
// Replace the preprocessImageForOCR function with this enhanced version:

function preprocessImageForOCR(image) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Draw image
        ctx.drawImage(image, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Enhanced preprocessing for better text recognition
        for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale with better weighting
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Adaptive thresholding - helps with stylized text
            const threshold = 128;
            const enhanced = gray > threshold ? 255 : 0;
            
            // Apply slight blur reduction (sharpening)
            data[i] = data[i + 1] = data[i + 2] = enhanced;
        }
        
        // Apply sharpening filter
        const sharpenedData = sharpen(imageData, canvas.width, canvas.height);
        
        ctx.putImageData(sharpenedData, 0, 0);
        
        // Increase contrast further
        const finalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const final = finalData.data;
        
        for (let i = 0; i < final.length; i += 4) {
            // Boost contrast
            final[i] = final[i + 1] = final[i + 2] = 
                Math.min(255, Math.max(0, (final[i] - 128) * 1.5 + 128));
        }
        
        ctx.putImageData(finalData, 0, 0);
        
        // Convert canvas to image
        const preprocessedImage = new Image();
        preprocessedImage.src = canvas.toDataURL();
        preprocessedImage.onload = () => resolve(preprocessedImage);
    });
}

// Sharpening filter helper
function sharpen(imageData, width, height) {
    const output = new ImageData(width, height);
    const data = imageData.data;
    const outData = output.data;
    
    // Simple sharpening kernel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;
            
            // Neighbor pixels
            const top = ((y - 1) * width + x) * 4;
            const bottom = ((y + 1) * width + x) * 4;
            const left = (y * width + (x - 1)) * 4;
            const right = (y * width + (x + 1)) * 4;
            
            // Apply sharpen: current * 5 - neighbors
            for (let c = 0; c < 3; c++) {
                outData[i + c] = Math.min(255, Math.max(0,
                    data[i + c] * 5 - 
                    (data[top + c] + data[bottom + c] + data[left + c] + data[right + c])
                ));
            }
            outData[i + 3] = data[i + 3]; // Alpha
        }
    }
    
    return output;
}
    
    // Copy text to clipboard
    copyBtn.addEventListener('click', async function() {
        if (!extractedText.value) return;
        
        try {
            await navigator.clipboard.writeText(extractedText.value);
            
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            alert('Failed to copy text');
        }
    });
    
    // Download as TXT
    downloadTxtBtn.addEventListener('click', function() {
        if (!extractedText.value) return;
        
        const blob = new Blob([extractedText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted-text.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Edit text
    editBtn.addEventListener('click', function() {
        isEditing = true;
        extractedText.readOnly = false;
        extractedText.focus();
        editBtn.style.display = 'none';
        editControls.style.display = 'flex';
    });
    
    // Save edits
    saveEditBtn.addEventListener('click', function() {
        isEditing = false;
        extractedText.readOnly = true;
        editBtn.style.display = 'flex';
        editControls.style.display = 'none';
        updateTextStats(extractedText.value);
    });
    
    // Cancel edits
    cancelEditBtn.addEventListener('click', function() {
        isEditing = false;
        extractedText.readOnly = true;
        editBtn.style.display = 'flex';
        editControls.style.display = 'none';
        // Reload original text from OCR result (you'd need to store it)
    });
    
    // New OCR
    newOcrBtn.addEventListener('click', resetOCR);
    
    function resetOCR() {
        originalFile = null;
        originalImage = null;
        isEditing = false;
        
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        languageCard.style.display = 'none';
        loading.style.display = 'none';
        resultCard.style.display = 'none';
        fileInput.value = '';
        extractBtn.disabled = false;
        progressFill.style.width = '0%';
        
        extractedText.value = '';
        extractedText.readOnly = true;
        editBtn.style.display = 'flex';
        editControls.style.display = 'none';
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