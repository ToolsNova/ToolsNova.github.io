// ===== CSS MINIFIER TOOL - COMPLETE FIXED VERSION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('CSS Minifier loaded');
    
    // DOM elements
    const inputCss = document.getElementById('inputCss');
    const minifiedCss = document.getElementById('minifiedCss');
    const formattedCss = document.getElementById('formattedCss');
    const originalSize = document.getElementById('originalSize');
    const minifiedSize = document.getElementById('minifiedSize');
    const savedPercent = document.getElementById('savedPercent');
    const inputLines = document.getElementById('inputLines');
    const outputLines = document.getElementById('outputLines');
    
    // Tabs
    const minifyTab = document.getElementById('minifyTab');
    const formatTab = document.getElementById('formatTab');
    const minifyView = document.getElementById('minifyView');
    const formatView = document.getElementById('formatView');
    const formatOptions = document.getElementById('formatOptions');
    
    // Controls
    const removeComments = document.getElementById('removeComments');
    const removeWhitespace = document.getElementById('removeWhitespace');
    const indentSize = document.getElementById('indentSize');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // State
    let isGuest = true;
    
    // Sample CSS
    const sampleCss = `/* Main stylesheet for ToolsNova */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
}

/* Header styles */
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 1rem 2rem;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h1 {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.header nav {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.header nav a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.header nav a:hover {
  color: white;
}

/* Card styles */
.card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

/* Button styles */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 60px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
}

/* Footer styles */
.footer {
  background: #1f2937;
  color: white;
  padding: 3rem 2rem;
  margin-top: 4rem;
}

.footer a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer a:hover {
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }
  
  .header nav {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .card {
    padding: 1rem;
  }
  
  .footer {
    padding: 2rem 1rem;
  }
}`;
    
    // Initialize
    checkUserStatus();
    updateStats();
    
    // Check user status
    function checkUserStatus() {
        if (typeof firebase !== 'undefined') {
            const user = firebase.auth().currentUser;
            isGuest = !user;
        }
    }
    
    // Update line counts and sizes
    function updateStats() {
        // Input lines
        const inputText = inputCss.value;
        const inputLineCount = inputText ? inputText.split('\n').length : 0;
        inputLines.textContent = `Lines: ${inputLineCount}`;
        
        // Original size
        const originalBytes = inputText ? new Blob([inputText]).size : 0;
        originalSize.textContent = formatBytes(originalBytes);
        
        // Minified size (from current active output)
        let outputText = '';
        if (minifyView.classList.contains('active')) {
            outputText = minifiedCss.value;
        } else {
            outputText = formattedCss.value;
        }
        
        const outputBytes = outputText ? new Blob([outputText]).size : 0;
        minifiedSize.textContent = formatBytes(outputBytes);
        
        // Output lines
        const outputLineCount = outputText ? outputText.split('\n').length : 0;
        outputLines.textContent = `Lines: ${outputLineCount}`;
        
        // Calculate savings
        if (originalBytes > 0) {
            const saved = ((originalBytes - outputBytes) / originalBytes * 100).toFixed(1);
            savedPercent.textContent = saved + '%';
        } else {
            savedPercent.textContent = '0%';
        }
    }
    
    // Format bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Minify CSS
    function minifyCss(css) {
        if (!css || !css.trim()) return '';
        
        let result = css;
        
        // Remove comments if enabled
        if (removeComments.checked) {
            result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        }
        
        // Remove whitespace if enabled
        if (removeWhitespace.checked) {
            result = result
                .replace(/\s+/g, ' ')                    // Multiple spaces to one
                .replace(/\s*{\s*/g, '{')                // Remove spaces around {
                .replace(/\s*}\s*/g, '}')                // Remove spaces around }
                .replace(/\s*;\s*/g, ';')                 // Remove spaces around ;
                .replace(/\s*:\s*/g, ':')                 // Remove spaces around :
                .replace(/\s*,\s*/g, ',')                 // Remove spaces around ,
                .replace(/;\s*}/g, '}')                   // Remove last semicolon
                .replace(/\s+/g, ' ')                     // Final cleanup
                .trim();
        }
        
        return result;
    }
    
    // Format CSS
    function formatCss(css) {
        if (!css || !css.trim()) return '';
        
        let result = css;
        
        // Remove comments if enabled
        if (removeComments.checked) {
            result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        }
        
        // First, let's split by selectors and properties properly
        const indent = indentSize.value === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize.value));
        let formatted = '';
        let indentLevel = 0;
        
        // Split into lines and process
        const lines = result.split('\n');
        let inSelector = false;
        let inProperty = false;
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // Check if line contains {
            if (line.includes('{')) {
                formatted += indent.repeat(indentLevel) + line + '\n';
                indentLevel++;
                inSelector = false;
            }
            // Check if line contains }
            else if (line.includes('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
                formatted += indent.repeat(indentLevel) + line + '\n';
            }
            // Check if it's a property line (contains :)
            else if (line.includes(':')) {
                formatted += indent.repeat(indentLevel) + line + '\n';
            }
            // Media query or at-rule
            else if (line.startsWith('@')) {
                formatted += '\n' + line + '\n';
            }
            // Regular selector
            else {
                formatted += indent.repeat(indentLevel) + line + '\n';
            }
        }
        
        // Clean up extra newlines
        formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();
        
        return formatted;
    }
    
    // Process CSS
    function processCss() {
        const css = inputCss.value;
        console.log('Processing CSS:', css.substring(0, 100) + '...');
        
        // Minify
        const minified = minifyCss(css);
        minifiedCss.value = minified;
        
        // Format
        const formatted = formatCss(css);
        formattedCss.value = formatted;
        
        updateStats();
    }
    
    // Tab switching
    minifyTab.addEventListener('click', function() {
        minifyTab.classList.add('active');
        formatTab.classList.remove('active');
        minifyView.classList.add('active');
        formatView.classList.remove('active');
        formatOptions.style.display = 'none';
        updateStats();
    });
    
    formatTab.addEventListener('click', function() {
        formatTab.classList.add('active');
        minifyTab.classList.remove('active');
        formatView.classList.add('active');
        minifyView.classList.remove('active');
        formatOptions.style.display = 'flex';
        updateStats();
    });
    
    // Input events
    inputCss.addEventListener('input', function() {
        console.log('Input event triggered');
        if (!isGuest) {
            processCss();
        } else {
            let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
            
            if (guestUses < 3) {
                processCss();
                
                // Only count if there's actual content
                if (inputCss.value.trim()) {
                    guestUses++;
                    localStorage.setItem('toolsnova_guest_uses', guestUses);
                    console.log('Guest uses:', guestUses);
                    
                    if (guestUses >= 3) {
                        setTimeout(() => {
                            alert('You have used all 3 guest tries. Sign up for unlimited access!');
                        }, 500);
                    }
                }
            } else {
                inputCss.value = '';
                alert('You have used all 3 guest tries. Please sign up for unlimited access!');
                window.location.href = '../signup.html';
            }
        }
    });
    
    // Option changes
    removeComments.addEventListener('change', function() {
        console.log('Remove comments changed');
        processCss();
    });
    
    removeWhitespace.addEventListener('change', function() {
        console.log('Remove whitespace changed');
        processCss();
    });
    
    indentSize.addEventListener('change', function() {
        console.log('Indent size changed');
        if (formatView.classList.contains('active')) {
            processCss();
        }
    });
    
    // Load sample
    loadSampleBtn.addEventListener('click', function() {
        console.log('Load sample clicked');
        if (!isGuest) {
            inputCss.value = sampleCss;
            processCss();
        } else {
            let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
            
            if (guestUses < 3) {
                inputCss.value = sampleCss;
                processCss();
                
                guestUses++;
                localStorage.setItem('toolsnova_guest_uses', guestUses);
                console.log('Guest uses after sample:', guestUses);
                
                if (guestUses >= 3) {
                    alert('You have used all 3 guest tries. Sign up for unlimited access!');
                }
            } else {
                alert('You have used all 3 guest tries. Please sign up for unlimited access!');
                window.location.href = '../signup.html';
            }
        }
    });
    
    // Copy to clipboard
    copyBtn.addEventListener('click', function() {
        let text = '';
        if (minifyView.classList.contains('active')) {
            text = minifiedCss.value;
        } else {
            text = formattedCss.value;
        }
        
        if (!text) {
            alert('Nothing to copy');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = original;
            }, 2000);
        }).catch(() => {
            alert('Failed to copy');
        });
    });
    
    // Download CSS
    downloadBtn.addEventListener('click', function() {
        let text = '';
        let filename = '';
        
        if (minifyView.classList.contains('active')) {
            text = minifiedCss.value;
            filename = 'styles.min.css';
        } else {
            text = formattedCss.value;
            filename = 'styles.css';
        }
        
        if (!text) {
            alert('Nothing to download');
            return;
        }
        
        const blob = new Blob([text], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Clear all
    clearBtn.addEventListener('click', function() {
        console.log('Clear clicked');
        inputCss.value = '';
        minifiedCss.value = '';
        formattedCss.value = '';
        updateStats();
    });

    // Initialize with empty values
    minifiedCss.value = '';
    formattedCss.value = '';
    
    console.log('CSS Minifier initialized');
});