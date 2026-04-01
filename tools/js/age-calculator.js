// ===== AGE CALCULATOR - WORKING VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Age Calculator loaded');
    
    // Get DOM elements
    const birthDateInput = document.getElementById('birthDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');
    
    // Set max date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const maxDate = `${yyyy}-${mm}-${dd}`;
    birthDateInput.setAttribute('max', maxDate);
    
    // Calculate age function
    function calculateAge() {
        const birthDateStr = birthDateInput.value;
        
        // Validate input
        if (!birthDateStr) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Please select your date of birth</p>
            `;
            resultDiv.classList.add('show');
            return;
        }
        
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        
        // Check if birth date is valid
        if (isNaN(birthDate.getTime())) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Please enter a valid date</p>
            `;
            resultDiv.classList.add('show');
            return;
        }
        
        // Check if birth date is in future
        if (birthDate > today) {
            resultDiv.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Birth date cannot be in the future</p>
            `;
            resultDiv.classList.add('show');
            return;
        }
        
        // Calculate age
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
        
        // Adjust days
        if (days < 0) {
            months--;
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }
        
        // Adjust months
        if (months < 0) {
            years--;
            months += 12;
        }
        
        // Calculate total days alive
        const timeDiff = today - birthDate;
        const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
        const totalMinutes = Math.floor(timeDiff / (1000 * 60));
        
        // Display result
        resultDiv.innerHTML = `
            <div class="age-number">${years} years, ${months} months, ${days} days</div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 5px 0; color: #6b7280;">Total days alive: <strong>${totalDays.toLocaleString()}</strong></p>
                <p style="margin: 5px 0; color: #6b7280;">Total hours: <strong>${totalHours.toLocaleString()}</strong></p>
                <p style="margin: 5px 0; color: #6b7280;">Total minutes: <strong>${totalMinutes.toLocaleString()}</strong></p>
            </div>
        `;
        resultDiv.classList.add('show');
    }
    
    // Add click event
    calculateBtn.addEventListener('click', calculateAge);
    
    // Add enter key event
    birthDateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateAge();
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

// Firebase auth state observer (only if firebase exists)
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
            if (footerGuestInfo) footerGuestInfo.style.display = 'none';
        } else {
            // User is guest
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