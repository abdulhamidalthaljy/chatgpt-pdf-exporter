// content.js - Main version v0.7.15 (Print Mode - width:max-content for Tables)
console.log("ChatGPT PDF Exporter v0.7.15 (Print Mode - Max Content Tables) loaded.");

// --- Button Addition and SPA Handling ---
function addDownloadButton() {
    if (document.getElementById('chatgpt-pdf-print-button')) return;
    const button = document.createElement('button');
    button.id = 'chatgpt-pdf-print-button';
    button.textContent = '⬇️ Print to PDF';
    button.style.cssText = `position:fixed; bottom:20px; right:20px; padding:10px 15px; background-color:#10a37f; color:white; border:none; border-radius:8px; cursor:pointer; z-index:10000; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,0.2); transition:background-color 0.3s ease;`;
    button.onmouseover = () => button.style.backgroundColor = '#0d8c6c';
    button.onmouseout = () => button.style.backgroundColor = '#10a37f';
    button.addEventListener('click', handlePrintToPdf);
    document.body.appendChild(button);
    console.log("Print to PDF button added.");
}

let initObserver = null;
function attemptInitialization() {
    const readyIndicator = document.querySelector('textarea[data-id="root"], #prompt-textarea');
    if (readyIndicator && !document.getElementById('chatgpt-pdf-print-button')) {
        addDownloadButton();
    }
}

function initializeExtension() {
    console.log("Initializing Extension Logic...");
    attemptInitialization();
    if (initObserver) initObserver.disconnect();
    initObserver = new MutationObserver(attemptInitialization);
    initObserver.observe(document.body, { childList: true, subtree: true });
    console.log("MutationObserver set up.");
}

// --- Main Handler for Print to PDF ---
function handlePrintToPdf() {
    console.log("Attempting to Print to PDF (v0.7.15)...");

    let conversationContainer = null;
    const scrollContainers = document.querySelectorAll('div[class*="react-scroll-to-bottom"] div[class*="react-scroll-to-bottom__view"]');
    if (scrollContainers.length > 0) {
        for (let sc of scrollContainers) {
            if (sc.querySelector('article[data-testid^="conversation-turn-"], div[data-testid^="conversation-turn-"]')) {
                conversationContainer = sc;
                console.log("Found conversation container via scroll class strategy:", conversationContainer);
                break;
            }
        }
    }
    if (!conversationContainer) {
        const firstTurn = document.querySelector('article[data-testid^="conversation-turn-"], div[data-testid^="conversation-turn-"]');
        if (firstTurn) {
            let parent = firstTurn.parentElement;
            for (let i = 0; i < 3 && parent; i++) {
                if (parent.scrollHeight > parent.clientHeight + 50 && parent.children.length > 1) {
                    conversationContainer = parent; break;
                }
                if (parent.tagName === 'MAIN') { conversationContainer = parent; break; }
                parent = parent.parentElement;
            }
            if (!conversationContainer) conversationContainer = firstTurn.parentElement;
            console.log("Found conversation container via parent of first turn strategy:", conversationContainer);
        }
    }
    if (!conversationContainer) {
        conversationContainer = document.querySelector('main div[role="presentation"] > div.flex.flex-col.items-center');
        if (conversationContainer) console.log("Found conversation container via general main content area selector:", conversationContainer);
    }
    if (!conversationContainer) {
        alert("Could not find the main conversation container to print. Selectors might be outdated.");
        console.error("Conversation container not found."); return;
    }

    const printStyleId = 'chatgpt-print-isolation-style';
    const printVisibleClass = 'chatgpt-print-visible-KpYqZ';
    let printStyleElement = document.getElementById(printStyleId);
    if (printStyleElement) printStyleElement.remove();

    printStyleElement = document.createElement('style');
    printStyleElement.id = printStyleId;
    printStyleElement.media = 'print';

    const elementsToShowForPrint = [];
    let currentForClass = conversationContainer;
    while (currentForClass && currentForClass !== document.body) {
        currentForClass.classList.add(printVisibleClass);
        elementsToShowForPrint.push(currentForClass);
        currentForClass = currentForClass.parentElement;
    }
    document.documentElement.classList.add(printVisibleClass);
    document.body.classList.add(printVisibleClass);
    elementsToShowForPrint.push(document.documentElement);
    elementsToShowForPrint.push(document.body);

    let pageTitle = "ChatGPT Conversation";
    const titleEl1 = document.querySelector('div[class*="flex-1 text-ellipsis"]');
    const titleEl2 = document.querySelector('nav a[class*="bg-gray-800"] div.text-ellipsis');
    const titleEl3 = document.querySelector('div.truncate.text-sm.font-medium');
    if (titleEl1 && titleEl1.textContent.trim()) pageTitle = titleEl1.textContent.trim();
    else if (titleEl2 && titleEl2.textContent.trim()) pageTitle = titleEl2.textContent.trim();
    else if (titleEl3 && titleEl3.textContent.trim()) pageTitle = titleEl3.textContent.trim();
    pageTitle = pageTitle.replace(/</g, "<").replace(/>/g, ">");

    // --- CSS FOR PRINTING (v0.7.15 - width:max-content for Tables) ---
    printStyleElement.innerHTML = `
        @page {
            margin: 0.2in !important; /* Very minimal page margins */
        }

        @media print {
          .text-token-text-secondary {
    display: none !important;
  }
            html.${printVisibleClass}, body.${printVisibleClass} {
                margin: 0 !important; padding: 0 !important; 
                background-color: white !important; color: black !important;
                -webkit-print-color-adjust: exact !important; color-adjust: exact !important;
                font-family: Arial, Helvetica, sans-serif; 
                font-size: 9pt !important; 
                line-height: 1.3 !important; 
                width: 100% !important; /* Important for print context */
                box-sizing: border-box !important;
            }
            body > *:not(.${printVisibleClass}):not(#${printStyleId}) { display: none !important; }
            
            .${printVisibleClass} {
                display: block !important; visibility: visible !important;
                position: static !important; overflow: visible !important; /* Allow content to overflow for page scaling */
                height: auto !important; width: 100% !important; 
                float: none !important; margin: 0 !important; padding: 0 !important; 
                box-sizing: border-box !important;
            }
            .${printVisibleClass} > * { 
                 display: block !important; visibility: visible !important;
                 position: relative !important; 
                 box-sizing: border-box !important;
                 width: 100% !important; /* Children also try to use full width of their parent */
            }
            
            /* The direct conversation container (e.g., the scroll view) */
            div.${printVisibleClass}[class*="react-scroll-to-bottom__view"],
            main.${printVisibleClass} div[role="presentation"] > div.${printVisibleClass} {
                 padding: 0 2pt !important; 
                 overflow: visible !important; /* Ensure this primary container doesn't clip wide tables */
            }

            /* Hide unwanted page elements */
            form, nav, header, footer, 
            div.text-token-text-secondary.relative.mt-auto.flex.min-h-8.w-full.items-center.justify-center,
            button, [role="button"], 
            [data-testid*="send-button"], [data-testid*="feedback"], [data-testid*="copy"],
            [data-testid="conversation-actions"],
            div[class*="gizmo-shadow-stroke"], 
            div[class*="text-gray-400"][class*="justify-center"][class*="items-center"] > button,
            div[class*="text-center"] > button[class*="btn-neutral"],
            .markdown.prose pre > div[class*="contain-inline-size"] > div:not([class*="overflow-y-auto"]) {
                display: none !important;
            }

            /* Individual Message Turns & Role Avatars */
            article[data-testid^="conversation-turn-"], 
            div[data-testid^="conversation-turn-"] {
                margin-bottom: 8pt !important; padding-left: 35pt !important; 
                border: none !important; box-shadow: none !important;
                padding-top: 0 !important; padding-bottom: 0 !important; padding-right: 0 !important;
                position: relative !important; width: 100% !important; box-sizing: border-box !important;
            }
            div[data-message-author-role]::before { /* Avatar styles from v0.7.14 */ }
            div[data-message-author-role="user"]::before { /* User avatar styles from v0.7.14 */ }
            div[data-message-author-role="assistant"]::before { /* Assistant avatar styles from v0.7.14 */ }

            /* Message Content Containers - No border/bg, from v0.7.14 */
            div[data-message-author-role="user"] div[class*="whitespace-pre-wrap"],
            div[data-message-author-role="user"] div[class*="rounded-3xl"] {
    page-break-inside: auto !important;
    padding: 10pt 14pt !important;
    border: 1px solid #F4F4F4 !important;
    border-radius: 10px !important;
    background-color: #F4F4F4 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
}
            div[data-message-author-role="assistant"] div.markdown.prose {
                page-break-inside: auto !important; padding: 0 !important; 
                border: none !important; border-radius: 0 !important; 
                background-color: transparent !important; box-shadow: none !important; 
                width: 100% !important; max-width: 100% !important; 
                box-sizing: border-box !important;
                overflow: visible !important; /* Allow content like tables to determine width */
            }
            /* Margins for first/last children within content (from v0.7.14) */
            div[data-message-author-role] div p:first-child,
            div[data-message-author-role] div.markdown.prose > *:first-child:not(pre):not(table):not(ul):not(ol):not(.katex-display) { margin-top: 0 !important; padding-top: 0 !important; }
            div[data-message-author-role] div p:last-child,
            div[data-message-author-role] div.markdown.prose > *:last-child:not(pre):not(table):not(ul):not(ol):not(.katex-display) { margin-bottom: 0 !important; padding-bottom: 0 !important; }

            /* Paragraphs, KaTeX, Lists styling (from v0.7.14) */
            div.markdown.prose p { /* ... */ }
            .katex-display, .katex { /* ... */ }
            .markdown.prose ul, .markdown.prose ol { /* ... */ }
            .markdown.prose li { /* ... */ }
            
            /* Table Styling for Print - MODIFIED for max-content and potential page scaling */
            .markdown.prose div[class*="_tableContainer_"],
            .markdown.prose div[class*="_tableWrapper_"] {
                width: max-content !important; /* Allow wrapper to be as wide as the table */
                min-width: 0 !important; /* Don't force it to 100% if table is narrow */
                /* max-width: 100% !important; Removed to see if browser scales page */
                overflow: visible !important; /* No scrollbars on wrappers, let content dictate size */
                margin-top: 0.8em !important; margin-bottom: 0.8em !important;
                page-break-inside: avoid !important; 
            }
            .markdown.prose table {
                width: max-content !important; /* Table takes its natural, full content width */
                min-width: fit-content !important;
                table-layout: auto !important; /* Content determines column widths */
                font-size: 7pt !important; 
                line-height: 1.1 !important;
                border-collapse: collapse !important;
                margin-left: 0; /* Align table to the left of its container */
                margin-right: 0;
            }
            .markdown.prose th, 
            .markdown.prose td {
                border: 1px solid #ccc !important;
                padding: 2pt 4pt !important; 
                text-align: left !important;
                word-wrap: normal !important; /* Allow words to not break initially */
                overflow-wrap: normal !important;
                white-space: nowrap !important; /* Prevent text wrapping in cells */
                hyphens: manual !important; 
                vertical-align: top;
            }
            .markdown.prose th {
                background-color: #f5f5f5 !important; 
                font-weight: bold !important;
            }
            .markdown.prose table .katex {
                font-size: 1em !important; /* Relative to cell's 7pt font */
                white-space: nowrap !important; 
                display: inline-block !important; 
            }

            /* Code Blocks Styling (same as v0.7.14, ensure overflow-x:auto for <pre>) */
            .markdown.prose pre { /* ... */ }
            .markdown.prose pre code { /* ... */ }
            .markdown.prose code:not(pre code) { /* ... */ }
            /* ... (Prism/HLJS token styles from v0.7.14) ... */
        }
    `;
    document.head.appendChild(printStyleElement);

    const originalTitle = document.title;
    document.title = pageTitle;

    console.log("Injected print styles (v0.7.15). Triggering print dialog...");
    window.print();

    setTimeout(() => {
        if (document.getElementById(printStyleId)) {
            document.head.removeChild(printStyleElement);
        }
        elementsToShowForPrint.forEach(el => el.classList.remove(printVisibleClass));
        document.title = originalTitle;
        console.log("Removed print styles and classes, restored title.");
    }, 2500);
}

// --- Main Download Handler & Initialization ---
function handleDownload() {
    console.log("Download (Print Mode) button clicked.");
    handlePrintToPdf();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeExtension);
else initializeExtension();