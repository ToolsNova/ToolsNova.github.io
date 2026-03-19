// ===== QR CODE GENERATOR - WORKING VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('QR Code Generator loaded');
    
    // Get DOM elements
    const contentInput = document.getElementById('qrContent');
    const sizeSelect = document.getElementById('qrSize');
    const errorCorrectionSelect = document.getElementById('qrErrorCorrection');
    const generateBtn = document.getElementById('generateBtn');
    const qrResult = document.getElementById('qrResult');
    const qrContainer = document.getElementById('qrCodeContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    let currentQR = null;
    
    // Generate QR Code function
    function generateQRCode() {
        const content = contentInput.value.trim();
        
        // Validate input
        if (!content) {
            alert('Please enter some content for the QR code');
            return;
        }
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Get options
        const size = parseInt(sizeSelect.value);
        const errorCorrection = errorCorrectionSelect.value;
        
        try {
            // Create new QR code
            currentQR = new QRCode(qrContainer, {
                text: content,
                width: size,
                height: size,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: getErrorCorrectionLevel(errorCorrection)
            });
            
            // Show result section
            qrResult.style.display = 'block';
            
            // Track usage
            trackToolUsage();
            
        } catch (error) {
            console.error('QR Generation Error:', error);
            alert('Error generating QR code. Please try again.');
        }
    }
    
    // Helper function to get error correction level
    function getErrorCorrectionLevel(level) {
        switch(level) {
            case 'L': return QRCode.CorrectLevel.L;
            case 'M': return QRCode.CorrectLevel.M;
            case 'Q': return QRCode.CorrectLevel.Q;
            case 'H': return QRCode.CorrectLevel.H;
            default: return QRCode.CorrectLevel.M;
        }
    }
    
    // Download QR code as PNG
    function downloadQR() {
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) {
            alert('No QR code to download');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    // Copy QR code to clipboard
    async function copyQR() {
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) {
            alert('No QR code to copy');
            return;
        }
        
        try {
            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            
            // Show success feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = '#10b981';
            copyBtn.style.color = 'white';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2000);
            
        } catch (error) {
            console.error('Copy failed:', error);
            alert('Failed to copy QR code. You can download it instead.');
        }
    }
    
    // Track tool usage for guest users
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
    
    // Add event listeners
    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQR);
    copyBtn.addEventListener('click', copyQR);
    
    // Add enter key support
    contentInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateQRCode();
        }
    });
    
    // Example content on focus (optional)
    contentInput.addEventListener('focus', function() {
        if (this.value === '') {
            this.value = 'https://ToolsNova.github.io';
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
        
        if (user) {
            if (authLinks) authLinks.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                if (userGreeting) {
                    userGreeting.textContent = `Hi, ${user.email.split('@')[0]}`;
                }
            }
            if (footerLogin) footerLogin.style.display = 'none';
            if (footerSignup) footerSignup.style.display = 'none';
            if (footerLogout) footerLogout.style.display = 'block';
            if (footerGuestInfo) footerGuestInfo.style.display = 'none';
        } else {
            if (authLinks) authLinks.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (footerLogin) footerLogin.style.display = 'block';
            if (footerSignup) footerSignup.style.display = 'block';
            if (footerLogout) footerLogout.style.display = 'none';
            if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
        }
    });
}
