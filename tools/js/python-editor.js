// ===== PYTHON EDITOR TOOL - OPTIMIZED LOADING =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Python Editor loaded');
    
    // DOM elements
    const pythonCode = document.getElementById('pythonCode');
    const output = document.getElementById('output');
    const runBtn = document.getElementById('runBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const lineCount = document.getElementById('lineCount');
    const totalLines = document.getElementById('totalLines');
    const charCount = document.getElementById('charCount');
    const execTime = document.getElementById('execTime');
    const themeSelect = document.getElementById('themeSelect');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingTip = document.getElementById('loadingTip');
    
    // State
    let pyodide = null;
    let isPyodideLoading = false;
    let isGuest = true;
    let hasCountedThisSession = false;
    let editor = null;
    let loadStartTime = null;
    
    // Tips to show during loading
    const loadingTips = [
        "Python is loading in your browser using WebAssembly!",
        "This only happens once. After loading, it's super fast!",
        "You can write and run real Python code here.",
        "Supports print(), input(), loops, functions, and more!",
        "Try the sample codes to see what Python can do.",
        "Press Ctrl+Enter to run your code quickly.",
        "Your code never leaves your browser - 100% private."
    ];
    
    // Sample Python code
    const samples = [
        `# Hello World
print("Hello, ToolsNova!")
print("Welcome to Python Editor")

# Variables
name = "Student"
age = 20
print(f"My name is {name} and I'm {age} years old")`,

        `# Loops and Lists
# Print numbers 1 to 5
print("Numbers 1 to 5:")
for i in range(1, 6):
    print(i)

# Create a list
fruits = ["apple", "banana", "orange"]
print("\\nFruits:")
for fruit in fruits:
    print(f"- {fruit}")`,

        `# Functions
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

# Test the functions
print(greet("ToolsNova User"))
print(f"5 + 3 = {add(5, 3)}")

# Lambda example
square = lambda x: x ** 2
print(f"Square of 7: {square(7)}")`,

        `# Input example
name = input("What's your name? ")
age = input("How old are you? ")

print(f"\\nHello {name}!")
print(f"You are {age} years old")

# Simple calculator
num1 = float(input("\\nEnter first number: "))
num2 = float(input("Enter second number: "))
print(f"Sum: {num1 + num2}")
print(f"Product: {num1 * num2}")`,

        `# Dictionary example
student = {
    "name": "Rahul",
    "age": 20,
    "course": "Computer Science",
    "grades": [85, 90, 78, 92]
}

print("Student Info:")
for key, value in student.items():
    print(f"{key}: {value}")

# Average grade
avg = sum(student["grades"]) / len(student["grades"])
print(f"Average grade: {avg:.2f}")`
    ];
    
    let currentSampleIndex = 0;
    
    // Apply theme based on dark mode
    function applyThemeBasedOnMode() {
        // Just refresh the editor, CSS handles the colors
        setTimeout(() => {
            if (editor) editor.refresh();
        }, 50);
    }
    
    // Initialize CodeMirror
    function initCodeMirror() {
        editor = CodeMirror.fromTextArea(pythonCode, {
            mode: 'python',
            theme: 'default',
            lineNumbers: true,
            indentUnit: 4,
            smartIndent: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            extraKeys: {
                'Ctrl-Enter': function(cm) {
                    runCode();
                },
                'Cmd-Enter': function(cm) {
                    runCode();
                },
                'Tab': 'indentMore'
            }
        });
        
        // Update line count on changes
        editor.on('change', function() {
            updateStats();
        });
        
        // Set initial value
        editor.setValue(samples[0]);
        
        // Apply initial theme
        applyThemeBasedOnMode();
    }
    
    // Update loading progress
    function updateLoadingProgress(percent, message) {
        if (loadingProgress) {
            loadingProgress.style.width = percent + '%';
        }
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        // Update tip every 3 seconds
        if (!window.tipInterval) {
            window.tipInterval = setInterval(() => {
                if (loadingOverlay.style.display !== 'none') {
                    const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
                    loadingTip.textContent = randomTip;
                } else {
                    clearInterval(window.tipInterval);
                }
            }, 3000);
        }
    }
    
    // Initialize Pyodide with better loading
    async function initPyodide() {
        if (pyodide || isPyodideLoading) return;
        
        isPyodideLoading = true;
        loadStartTime = Date.now();
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        updateLoadingProgress(10, 'Starting Python engine...');
        
        // Use setTimeout to prevent UI freeze
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            console.log('Loading Pyodide...');
            updateLoadingProgress(30, 'Downloading Python runtime (10MB)...');
            
            // Load Pyodide in chunks to prevent UI freeze
            pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.3/full/",
                stdout: (text) => {
                    output.classList.remove('error', 'success');
                    output.textContent += text + '\n';
                },
                stderr: (text) => {
                    output.classList.add('error');
                    output.textContent += 'Error: ' + text + '\n';
                }
            });
            
            updateLoadingProgress(80, 'Initializing Python packages...');
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 500));
            
            updateLoadingProgress(100, 'Python ready!');
            
            console.log('Pyodide loaded successfully in', (Date.now() - loadStartTime) / 1000, 'seconds');
            
            // Hide overlay after a short delay
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                clearInterval(window.tipInterval);
                
                // Enable run button
                runBtn.disabled = false;
                output.textContent = 'Python loaded! Click "Run" to execute your code.';
            }, 500);
            
        } catch (error) {
            console.error('Failed to load Pyodide:', error);
            output.classList.add('error');
            output.textContent = 'Failed to load Python. Please refresh the page.';
            loadingOverlay.style.display = 'none';
        }
        
        isPyodideLoading = false;
    }
    
    // Initialize
    checkUserStatus();
    initCodeMirror();
    
    // Disable run button until Python loads
    runBtn.disabled = true;
    output.textContent = 'Loading Python... Please wait (may take 10-20 seconds first time)';
    
    // Start loading after a short delay
    setTimeout(() => {
        initPyodide();
    }, 500);
    
    // Check user status
    function checkUserStatus() {
        if (typeof firebase !== 'undefined') {
            const user = firebase.auth().currentUser;
            isGuest = !user;
        }
    }
    
    // Listen for auth changes
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(function(user) {
            isGuest = !user;
        });
    }
    
    // Update line count and character count
    function updateStats() {
        if (!editor) return;
        
        const code = editor.getValue();
        const lines = code.split('\n').length;
        const chars = code.length;
        const currentLine = editor.getCursor().line + 1;
        
        lineCount.textContent = `Line: ${currentLine}`;
        totalLines.textContent = lines;
        charCount.textContent = chars;
    }
    
    // Run Python code with terminal-style input - FIXED VERSION
    async function runCode() {
        if (!pyodide) {
            output.classList.add('error');
            output.textContent = 'Python is still loading. Please wait...';
            return;
        }
        
        const code = editor.getValue().trim();
        if (!code) {
            output.classList.add('error');
            output.textContent = 'Please enter some Python code to run.';
            return;
        }
        
        // Check guest usage
        if (isGuest && !hasCountedThisSession) {
            let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
            
            if (guestUses >= 3) {
                alert('You have used all 3 guest tries. Please sign up for unlimited access!');
                window.location.href = '../signup.html';
                return;
            }
        }
        
        // Disable run button
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
        
        // Clear previous output
        output.innerHTML = '';
        output.classList.remove('error', 'success');
        
        const startTime = performance.now();
        
        try {
            // Set up the JavaScript input handler
            window.pythonInput = function(promptText) {
                return new Promise((resolve) => {
                    // Show prompt in output
                    const promptDiv = document.createElement('div');
                    promptDiv.className = 'input-prompt';
                    promptDiv.textContent = promptText;
                    output.appendChild(promptDiv);
                    
                    // Create input line
                    const inputDiv = document.createElement('div');
                    inputDiv.className = 'input-line';
                    inputDiv.innerHTML = `<span class="prompt-arrow">⟩⟩</span> <input type="text" class="terminal-input" id="terminalInput" autofocus>`;
                    output.appendChild(inputDiv);
                    
                    const inputField = document.getElementById('terminalInput');
                    inputField.focus();
                    
                    inputField.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            const value = this.value;
                            
                            // Remove the input line
                            inputDiv.remove();
                            
                            // Show what was entered
                            const valueDiv = document.createElement('div');
                            valueDiv.className = 'input-value';
                            valueDiv.innerHTML = `<span class="prompt">${promptText}</span> <span class="typed-value">${value}</span>`;
                            output.appendChild(valueDiv);
                            
                            // Resolve the promise with the value
                            resolve(value);
                            
                            // Scroll to bottom
                            output.scrollTop = output.scrollHeight;
                        }
                    });
                    
                    // Scroll to bottom
                    output.scrollTop = output.scrollHeight;
                });
            };
            
            // Create a custom input handler in Python - FIXED
            pyodide.runPython(`
import sys

# Get the JavaScript function
from js import pythonInput

# Define a custom input function
def custom_input(prompt=""):
    sys.stdout.write(prompt)
    sys.stdout.flush()
    # Call JavaScript function and wait for result
    result = pythonInput(prompt)
    return result

# Override the built-in input in the current namespace
input = custom_input
            `);
            
            // Redirect stdout to capture prints
            pyodide.runPython(`
import sys
from io import StringIO

# Save original stdout
original_stdout = sys.stdout

# Redirect stdout to capture print statements
sys.stdout = StringIO()
            `);
            
            // Run the code with custom input in the namespace
            await pyodide.runPythonAsync(code);
            
            // Get the captured output
            const capturedOutput = pyodide.runPython('sys.stdout.getvalue()');
            if (capturedOutput) {
                const lines = capturedOutput.split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        const lineDiv = document.createElement('div');
                        lineDiv.className = 'output-line';
                        lineDiv.textContent = line;
                        output.appendChild(lineDiv);
                    }
                });
            }
            
            // Restore stdout
            pyodide.runPython(`
sys.stdout = original_stdout
            `);
            
            // Track guest usage
            if (isGuest && !hasCountedThisSession) {
                let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                    parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
                guestUses++;
                localStorage.setItem('toolsnova_guest_uses', guestUses);
                hasCountedThisSession = true;
            }
            
        } catch (error) {
            output.classList.add('error');
            output.innerHTML = 'Error: ' + error.message;
            console.error('Python execution error:', error);
        }
        
        const endTime = performance.now();
        const timeInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        execTime.textContent = `${timeInSeconds}s`;
        
        // Re-enable run button
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
    }
    
    // Clear output
    function clearOutput() {
        output.innerHTML = 'Output cleared. Click "Run" to execute your code...';
        output.classList.remove('error', 'success');
        execTime.textContent = '0.00s';
    }
    
    // Load sample code
    function loadSample() {
        currentSampleIndex = (currentSampleIndex + 1) % samples.length;
        editor.setValue(samples[currentSampleIndex]);
        clearOutput();
        hasCountedThisSession = false;
    }
    
    // Theme change
    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            const isDark = document.body.classList.contains('dark-mode');
            const selectedTheme = this.value;
            
            if (isDark && selectedTheme === 'default') {
                editor.setOption('theme', 'dracula');
            } else {
                editor.setOption('theme', selectedTheme);
            }
            editor.refresh();
        });
    }
    
    // Listen for dark mode changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                applyThemeBasedOnMode();
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Event listeners
    runBtn.addEventListener('click', runCode);
    clearOutputBtn.addEventListener('click', clearOutput);
    loadSampleBtn.addEventListener('click', loadSample);
    
    copyBtn.addEventListener('click', function() {
        const code = editor.getValue();
        if (!code) {
            alert('Nothing to copy');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = original;
            }, 2000);
        }).catch(() => {
            alert('Failed to copy code');
        });
    });
    
    downloadBtn.addEventListener('click', function() {
        const code = editor.getValue();
        if (!code) {
            alert('Nothing to download');
            return;
        }
        
        const blob = new Blob([code], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'script.py';
        a.click();
        URL.revokeObjectURL(url);
    });
    
    clearBtn.addEventListener('click', function() {
        if (confirm('Clear all code?')) {
            editor.setValue('');
            clearOutput();
            hasCountedThisSession = false;
        }
    });
});