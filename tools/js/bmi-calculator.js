// ===== BMI CALCULATOR - WORKING VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('BMI Calculator loaded');
    
    // Get DOM elements
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');
    const bmiScaleDiv = document.getElementById('bmiScale');
    const scaleIndicator = document.getElementById('scaleIndicator');
    
    // Calculate BMI function
    function calculateBMI() {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        
        // Validate inputs
        if (isNaN(height) || height <= 0) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Please enter a valid height</p>
            `;
            resultDiv.classList.add('show');
            bmiScaleDiv.style.display = 'none';
            return;
        }
        
        if (isNaN(weight) || weight <= 0) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Please enter a valid weight</p>
            `;
            resultDiv.classList.add('show');
            bmiScaleDiv.style.display = 'none';
            return;
        }
        
        // Calculate BMI: weight(kg) / (height(m))^2
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const roundedBMI = bmi.toFixed(1);
        
        // Determine category
        let category = '';
        let categoryClass = '';
        let indicatorPosition = 0;
        
        if (bmi < 18.5) {
            category = 'Underweight';
            categoryClass = 'underweight';
            indicatorPosition = (bmi / 40) * 100; // Scale up to 40 BMI max
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal weight';
            categoryClass = 'normal';
            indicatorPosition = ((bmi - 18.5) / 6.5) * 30 + 20; // Position in normal range
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            categoryClass = 'overweight';
            indicatorPosition = ((bmi - 25) / 5) * 25 + 50; // Position in overweight range
        } else {
            category = 'Obese';
            categoryClass = 'obese';
            indicatorPosition = Math.min(((bmi - 30) / 10) * 25 + 75, 95); // Position in obese range, cap at 95%
        }
        
        // Ensure indicator stays within bounds
        indicatorPosition = Math.max(5, Math.min(95, indicatorPosition));
        
        // Display result
        resultDiv.innerHTML = `
            <div class="bmi-value">${roundedBMI}</div>
            <div class="bmi-category ${categoryClass}">${category}</div>
            <div style="margin-top: 15px; color: #6b7280;">
                <p>Height: ${height} cm</p>
                <p>Weight: ${weight} kg</p>
            </div>
        `;
        resultDiv.classList.add('show');
        
        // Show and update scale
        bmiScaleDiv.style.display = 'block';
        scaleIndicator.style.left = indicatorPosition + '%';
    }
    
    // Add click event
    calculateBtn.addEventListener('click', calculateBMI);
    
    // Add enter key events
    heightInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateBMI();
        }
    });
    
    weightInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateBMI();
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
        if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
        if (footerUserInfo) footerUserInfo.style.display = 'none';
    }
});