// ===== LIVE HTML/CSS/JS EDITOR - CLEAN VERSION =====

document.addEventListener("DOMContentLoaded", () => {

    console.log("Live Editor loaded");

    // ---------- Elements ----------

    const htmlCode = document.getElementById("htmlCode");
    const cssCode = document.getElementById("cssCode");
    const jsCode = document.getElementById("jsCode");

    const preview = document.getElementById("preview");
    const consoleOutput = document.getElementById("consoleOutput");

    const runBtn = document.getElementById("runBtn");
    const refreshPreviewBtn = document.getElementById("refreshPreviewBtn");
    const openPreviewBtn = document.getElementById("openPreviewBtn");
    const clearConsoleBtn = document.getElementById("clearConsoleBtn");
    const loadSampleBtn = document.getElementById("loadSampleBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const clearBtn = document.getElementById("clearBtn");

    const htmlLines = document.getElementById("htmlLines");
    const cssLines = document.getElementById("cssLines");
    const jsLines = document.getElementById("jsLines");
    const lastRun = document.getElementById("lastRun");
    const autoRunStatus = document.getElementById("autoRunStatus");

    const langTabs = document.querySelectorAll(".lang-tab");
    const editorWrappers = document.querySelectorAll(".editor-wrapper");

    let htmlEditor, cssEditor, jsEditor;
    let timer = null;

    // ---------- Sample ----------

    const sample = {
        html: `<h1>Hello Editor</h1>
<button onclick="clickMe()">Click</button>
<p id="text"></p>`,

        css: `body {
    font-family: Arial;
    background: #111;
    color: white;
}`,

        js: `function clickMe(){
    document.getElementById("text").textContent="Clicked!";
    console.log("clicked");
}`
    };


    // ---------- Init CodeMirror ----------

    function initEditors() {

        if (!window.CodeMirror) {
            console.error("CodeMirror not loaded");
            return;
        }

        htmlEditor = CodeMirror.fromTextArea(htmlCode, {
            mode: "htmlmixed",
            lineNumbers: true,
            theme: "default"
        });

        cssEditor = CodeMirror.fromTextArea(cssCode, {
            mode: "css",
            lineNumbers: true
        });

        jsEditor = CodeMirror.fromTextArea(jsCode, {
            mode: "javascript",
            lineNumbers: true
        });

        htmlEditor.on("change", update);
        cssEditor.on("change", update);
        jsEditor.on("change", update);

    }


    // ---------- Update ----------

    function update() {

        updateLines();

        clearTimeout(timer);

        timer = setTimeout(runCode, 400);
    }


    function updateLines() {

        if (htmlLines) htmlLines.textContent = htmlEditor.lineCount();
        if (cssLines) cssLines.textContent = cssEditor.lineCount();
        if (jsLines) jsLines.textContent = jsEditor.lineCount();

    }


    // ---------- Run Code ----------

    function runCode() {

        if (!preview) return;

        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue();

        const code = `
<!DOCTYPE html>
<html>
<head>
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CL847BSHY4"></script>



<!-- Favicon -->
<link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../favicon-16x16.png">
<link rel="icon" type="image/png" sizes="48x48" href="../favicon-48x48.png">
<link rel="manifest" href="../site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">



<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499" crossorigin="anonymous"></script>
<!-- Favicon -->
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499"
     crossorigin="anonymous"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499"
     crossorigin="anonymous"></script>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499"
     crossorigin="anonymous"></script>
</script>
<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
<style>${css}</style>

</head>
<body>

${html}

<script>

(function(){

const send = (type,args)=>{
parent.postMessage({type, args},"*")
}

console.log = (...a)=>send("log",a)
console.error = (...a)=>send("error",a)
console.warn = (...a)=>send("warn",a)

})();

${js}

<\/script>

<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
</html>
`;

        const doc =
            preview.contentDocument ||
            preview.contentWindow.document;

        if (!doc) return;

        doc.open();
        doc.write(code);
        doc.close();

        if (lastRun)
            lastRun.textContent =
                new Date().toLocaleTimeString();
    }


    // ---------- Console ----------

    window.addEventListener("message", e => {

        if (!consoleOutput) return;

        if (!e.data) return;

        const div = document.createElement("div");

        div.textContent = e.data.args.join(" ");

        consoleOutput.appendChild(div);

        consoleOutput.scrollTop =
            consoleOutput.scrollHeight;
    });


    function clearConsole() {

        if (consoleOutput)
            consoleOutput.innerHTML = "";

    }


    // ---------- Buttons ----------

    if (runBtn) runBtn.onclick = runCode;

    if (refreshPreviewBtn)
        refreshPreviewBtn.onclick = runCode;

    if (clearConsoleBtn)
        clearConsoleBtn.onclick = clearConsole;

    if (loadSampleBtn)
        loadSampleBtn.onclick = () => {

            htmlEditor.setValue(sample.html);
            cssEditor.setValue(sample.css);
            jsEditor.setValue(sample.js);

            runCode();

        };


    if (downloadBtn)
        downloadBtn.onclick = () => {

            const html = htmlEditor.getValue();
            const css = cssEditor.getValue();
            const js = jsEditor.getValue();

            const file = `
<!DOCTYPE html>
<html>
<head>
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CL847BSHY4"></script>



<!-- Favicon -->
<link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../favicon-16x16.png">
<link rel="icon" type="image/png" sizes="48x48" href="../favicon-48x48.png">
<link rel="manifest" href="../site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">



<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499" crossorigin="anonymous"></script>
<!-- Favicon -->
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233b82f6' rx='20'/%3E%3Ctext x='50' y='70' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499"
     crossorigin="anonymous"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499"
     crossorigin="anonymous"></script>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2870338245420499"
     crossorigin="anonymous"></script>
</script>
<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
<style>${css}</style>

</head>
<body>
${html}
<script>${js}<\/script>
<!-- Monetag Clean Ads - Push + In-Page + Direct Link -->

<script>(function(s){s.dataset.zone='10792808',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='10792811',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
</html>`;

            const blob =
                new Blob([file],
                    { type: "text/html" });

            const url =
                URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = url;
            a.download = "project.html";
            a.click();

        };


    if (clearBtn)
        clearBtn.onclick = () => {

            if (!confirm("Clear?")) return;

            htmlEditor.setValue("");
            cssEditor.setValue("");
            jsEditor.setValue("");

            clearConsole();
            runCode();
        };


    // ---------- Open Preview ----------

    if (openPreviewBtn)
        openPreviewBtn.onclick = () => {

            const w = window.open("", "_blank");

            if (!w) return;

            const html = htmlEditor.getValue();
            const css = cssEditor.getValue();
            const js = jsEditor.getValue();

            w.document.write(`
<style>${css}</style>
${html}
<script>${js}<\/script>
`);
        };


    // ---------- Tabs ----------

    langTabs.forEach(tab => {

        tab.onclick = () => {

            const lang = tab.dataset.lang;

            langTabs.forEach(t =>
                t.classList.remove("active"));

            tab.classList.add("active");

            editorWrappers.forEach(w =>
                w.classList.remove("active"));

            document
                .querySelector("." + lang + "-editor")
                ?.classList.add("active");

        };

    });


    // ---------- Start ----------

    initEditors();

    setTimeout(() => {

        htmlEditor.setValue(sample.html);
        cssEditor.setValue(sample.css);
        jsEditor.setValue(sample.js);

        runCode();

    }, 300);


    if (autoRunStatus)
        autoRunStatus.textContent = "ON";


    console.log("Editor ready");

});