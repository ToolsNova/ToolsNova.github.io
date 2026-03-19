// ===== DISCOUNT CALCULATOR - WITH CURRENCY SUPPORT =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Discount Calculator loaded');
    
    // Get DOM elements
    const currencySelect = document.getElementById('currencySelect');
    const originalPriceInput = document.getElementById('originalPrice');
    const discountPercentInput = document.getElementById('discountPercent');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');
    
    // Currency symbols mapping
    const currencies = {
        '$': 'USD',
        '€': 'EUR', 
        '£': 'GBP',
        '¥': 'JPY',
        '₹': 'INR',
        'CA$': 'CAD',
        'A$': 'AUD',
        'CHF': 'CHF',
        'CN¥': 'CNY'
    };
    
    // Calculate discount function
    function calculateDiscount() {
        const currency = currencySelect.value;
        const originalPrice = parseFloat(originalPriceInput.value);
        const discountPercent = parseFloat(discountPercentInput.value);
        
        // Validate inputs
        if (isNaN(originalPrice) || originalPrice <= 0) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Please enter a valid original price</p>
            `;
            resultDiv.classList.add('show');
            return;
        }
        
        if (isNaN(discountPercent) || discountPercent < 0) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Please enter a valid discount percentage</p>
            `;
            resultDiv.classList.add('show');
            return;
        }
        
        if (discountPercent > 100) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Discount cannot exceed 100%</p>
            `;
            resultDiv.classList.add('show');
            return;
        }
        
        // Calculate
        const savings = originalPrice * (discountPercent / 100);
        const finalPrice = originalPrice - savings;
        
        // Format price with proper decimal places
        const formatPrice = (price) => {
            return price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
        };
        
        // Display result with currency
        resultDiv.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div class="detail-label">Final Price</div>
                <div class="final-price">
                    <span class="currency-symbol">${currency}</span> ${formatPrice(finalPrice)}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <div class="detail-label">You Save</div>
                <div class="savings-amount">
                    <span class="currency-symbol">${currency}</span> ${formatPrice(savings)}
                </div>
            </div>
            <div class="price-details">
                <div class="detail-item">
                    <div class="detail-label">Original Price</div>
                    <div class="detail-value">
                        <span class="currency-symbol">${currency}</span> ${formatPrice(originalPrice)}
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Discount</div>
                    <div class="detail-value">${discountPercent}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Currency</div>
                    <div class="detail-value">${currencies[currency]}</div>
                </div>
            </div>
        `;
        resultDiv.classList.add('show');
    }
    
    // Add click event
    calculateBtn.addEventListener('click', calculateDiscount);
    
    // Add enter key events
    originalPriceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateDiscount();
        }
    });
    
    discountPercentInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateDiscount();
        }
    });
    
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
    
    // Track usage when tool is used
    calculateBtn.addEventListener('click', trackToolUsage);
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

// Update footer based on auth state
function updateFooterUI(user) {
    const footerGuestInfo = document.getElementById('footerGuestInfo');
    const footerUserInfo = document.getElementById('footerUserInfo');
    
    // Create user info element if it doesn't exist
    if (!footerUserInfo && footerGuestInfo) {
        const newUserInfo = document.createElement('div');
        newUserInfo.id = 'footerUserInfo';
        newUserInfo.className = 'user-info-footer';
        newUserInfo.style.display = 'none';
        newUserInfo.innerHTML = '<i class="fas fa-crown" style="color: var(--success);"></i><span>You have unlimited access</span>';
        footerGuestInfo.parentNode.appendChild(newUserInfo);
    }
}

// Update your existing auth observer
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'logged in' : 'guest');
    
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userGreeting = document.getElementById('userGreeting');
    const footerLogin = document.getElementById('footerLogin');
    const footerSignup = document.getElementById('footerSignup');
    const footerLogout = document.getElementById('footerLogout');
    const footerGuestInfo = document.getElementById('footerGuestInfo');
    const footerUserInfo = document.getElementById('footerUserInfo');
    
    if (user) {
        // User is logged in
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
        
        // Hide guest info, show user info
        if (footerGuestInfo) footerGuestInfo.style.display = 'none';
        if (footerUserInfo) {
            footerUserInfo.style.display = 'flex';
        } else {
            // Create user info element if it doesn't exist
            const newUserInfo = document.createElement('div');
            newUserInfo.id = 'footerUserInfo';
            newUserInfo.className = 'user-info-footer';
            newUserInfo.style.display = 'flex';
            newUserInfo.innerHTML = '<i class="fas fa-crown" style="color: var(--success);"></i><span>You have unlimited access</span>';
            if (footerGuestInfo && footerGuestInfo.parentNode) {
                footerGuestInfo.parentNode.appendChild(newUserInfo);
            }
        }
    } else {
        // User is guest
        if (authLinks) authLinks.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (footerLogin) footerLogin.style.display = 'block';
        if (footerSignup) footerSignup.style.display = 'block';
        if (footerLogout) footerLogout.style.display = 'none';
        
        // Show guest info, hide user info
        if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
        if (footerUserInfo) footerUserInfo.style.display = 'none';
    }
});