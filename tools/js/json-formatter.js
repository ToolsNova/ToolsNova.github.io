// ===== JSON FORMATTER TOOL =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('JSON Formatter loaded');
    
    // DOM elements
    const inputJson = document.getElementById('inputJson');
    const formattedJson = document.getElementById('formattedJson');
    const minifiedJson = document.getElementById('minifiedJson');
    const jsonTree = document.getElementById('jsonTree');
    const inputError = document.getElementById('inputError');
    const statusBadge = document.getElementById('statusBadge');
    const lineCount = document.getElementById('lineCount');
    const charCount = document.getElementById('charCount');
    
    // Tabs
    const formatTab = document.getElementById('formatTab');
    const minifyTab = document.getElementById('minifyTab');
    const treeTab = document.getElementById('treeTab');
    const formatView = document.getElementById('formatView');
    const minifyView = document.getElementById('minifyView');
    const treeView = document.getElementById('treeView');
    
    // Controls
    const indentSize = document.getElementById('indentSize');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // State
    let currentJson = null;
    let currentError = null;
    let isGuest = true;
    
    // Sample JSON data
    const sampleJson = {
        "name": "ToolsNova",
        "version": "1.0.0",
        "description": "Your universe of professional web tools",
        "features": [
            "JSON Formatter",
            "Image Editor",
            "OCR Tool",
            "YouTube Tools"
        ],
        "pricing": {
            "guest": "3 free uses",
            "premium": "unlimited"
        },
        "active": true,
        "users": 10000
    };
    
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
    
    // Update line and character count
    function updateStats() {
        const text = inputJson.value;
        const lines = text.split('\n').length;
        const chars = text.length;
        lineCount.textContent = lines;
        charCount.textContent = chars;
    }
    
    // Format JSON
    function formatJson() {
        const input = inputJson.value.trim();
        
        if (!input) {
            clearOutput();
            statusBadge.textContent = 'Empty';
            statusBadge.className = 'status-badge';
            inputError.textContent = '';
            currentJson = null;
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            currentJson = parsed;
            currentError = null;
            
            // Get indentation
            let spaces = indentSize.value;
            let indent = spaces === 'tab' ? '\t' : parseInt(spaces);
            
            // Format with syntax highlighting
            const formatted = JSON.stringify(parsed, null, indent);
            formattedJson.innerHTML = syntaxHighlight(formatted);
            
            // Minified version
            minifiedJson.value = JSON.stringify(parsed);
            
            // Tree view
            jsonTree.innerHTML = buildTree(parsed);
            
            inputError.textContent = '';
            inputJson.classList.remove('error');
            statusBadge.textContent = 'Valid JSON';
            statusBadge.className = 'status-badge success';
            
        } catch (error) {
            currentError = error.message;
            inputError.textContent = error.message;
            inputJson.classList.add('error');
            statusBadge.textContent = 'Invalid JSON';
            statusBadge.className = 'status-badge error';
            clearOutput();
        }
    }
    
    // Syntax highlighting
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    
    // Build tree view
function buildTree(obj, key = '') {
    if (obj === null) {
        return `<div class="tree-item"><span class="tree-toggle-placeholder"></span> ${key ? '<span class="key">' + key + '</span>: ' : ''}<span class="null">null</span></div>`;
    }
    
    if (typeof obj === 'undefined') {
        return `<div class="tree-item"><span class="tree-toggle-placeholder"></span> ${key ? '<span class="key">' + key + '</span>: ' : ''}<span class="null">undefined</span></div>`;
    }
    
    if (typeof obj !== 'object') {
        let valueClass = typeof obj === 'string' ? 'string' : 
                       typeof obj === 'number' ? 'number' : 
                       typeof obj === 'boolean' ? 'boolean' : 'value';
        return `<div class="tree-item"><span class="tree-toggle-placeholder"></span> ${key ? '<span class="key">' + key + '</span>: ' : ''}<span class="' + valueClass + '">' + obj + '</span></div>`;
    }
    
    const isArray = Array.isArray(obj);
    const type = isArray ? '[]' : '{}';
    const length = isArray ? obj.length : Object.keys(obj).length;
    
    // Generate unique ID for this node
    const nodeId = 'tree-node-' + Math.random().toString(36).substr(2, 9);
    
    let html = `<div class="tree-item" id="${nodeId}">`;
    html += `<span class="tree-toggle" onclick="toggleTree('${nodeId}')">▼</span> `;
    html += key ? `<span class="key">${key}</span>: ` : '';
    html += `<span class="value">${type} (${length} ${isArray ? 'items' : 'keys'})</span>`;
    html += `<div class="tree-children" id="children-${nodeId}">`;
    
    if (isArray) {
        for (let i = 0; i < obj.length; i++) {
            html += buildTree(obj[i], i);
        }
    } else {
        const keys = Object.keys(obj).sort();
        for (let k of keys) {
            html += buildTree(obj[k], k);
        }
    }
    
    html += `</div></div>`;
    return html;
}

// Toggle tree item - NOW ONLY TOGGLES WHEN CLICKING THE BUTTON
window.toggleTree = function(nodeId) {
    const children = document.getElementById('children-' + nodeId);
    const toggle = document.querySelector(`#${nodeId} .tree-toggle`);
    
    if (children && toggle) {
        if (children.style.display === 'none') {
            children.style.display = 'block';
            toggle.textContent = '▼';
        } else {
            children.style.display = 'none';
            toggle.textContent = '►';
        }
    }
    // Stop event from bubbling up
    event.stopPropagation();
};
    
    // Clear output
    function clearOutput() {
        formattedJson.innerHTML = '';
        minifiedJson.value = '';
        jsonTree.innerHTML = '';
    }
    
    // Tab switching
    formatTab.addEventListener('click', function() {
        formatTab.classList.add('active');
        minifyTab.classList.remove('active');
        treeTab.classList.remove('active');
        formatView.classList.add('active');
        minifyView.classList.remove('active');
        treeView.classList.remove('active');
    });
    
    minifyTab.addEventListener('click', function() {
        minifyTab.classList.add('active');
        formatTab.classList.remove('active');
        treeTab.classList.remove('active');
        minifyView.classList.add('active');
        formatView.classList.remove('active');
        treeView.classList.remove('active');
    });
    
    treeTab.addEventListener('click', function() {
        treeTab.classList.add('active');
        formatTab.classList.remove('active');
        minifyTab.classList.remove('active');
        treeView.classList.add('active');
        formatView.classList.remove('active');
        minifyView.classList.remove('active');
    });
    
    // Input events
    inputJson.addEventListener('input', function() {
        updateStats();
        formatJson();
    });
    
    indentSize.addEventListener('change', formatJson);
    
    // Load sample
    loadSampleBtn.addEventListener('click', function() {
        if (!isGuest) {
            inputJson.value = JSON.stringify(sampleJson, null, 2);
            updateStats();
            formatJson();
        } else {
            let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
            
            if (guestUses < 3) {
                inputJson.value = JSON.stringify(sampleJson, null, 2);
                updateStats();
                formatJson();
                
                guestUses++;
                localStorage.setItem('toolsnova_guest_uses', guestUses);
                
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
        if (!currentJson) return;
        
        let text = '';
        if (formatView.classList.contains('active')) {
            text = JSON.stringify(currentJson, null, indentSize.value === 'tab' ? '\t' : parseInt(indentSize.value));
        } else if (minifyView.classList.contains('active')) {
            text = minifiedJson.value;
        } else {
            text = JSON.stringify(currentJson, null, 2);
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
    
    // Download JSON
    downloadBtn.addEventListener('click', function() {
        if (!currentJson) return;
        
        let text = '';
        if (formatView.classList.contains('active')) {
            text = JSON.stringify(currentJson, null, indentSize.value === 'tab' ? '\t' : parseInt(indentSize.value));
        } else if (minifyView.classList.contains('active')) {
            text = minifiedJson.value;
        } else {
            text = JSON.stringify(currentJson, null, 2);
        }
        
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Clear all
    clearBtn.addEventListener('click', function() {
        inputJson.value = '';
        updateStats();
        clearOutput();
        statusBadge.textContent = 'Ready';
        statusBadge.className = 'status-badge';
        inputError.textContent = '';
        inputJson.classList.remove('error');
        currentJson = null;
        currentError = null;
    });
    
    // Guest usage tracking for manual input
    inputJson.addEventListener('focus', function() {
        if (isGuest && inputJson.value.trim()) {
            let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
            
            if (guestUses >= 3) {
                alert('You have used all 3 guest tries. Please sign up for unlimited access!');
                window.location.href = '../signup.html';
            }
        }
    });
});