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
    button.addEventListener('click', handlePrintToPdf); // Directly calls handlePrintToPdf
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
            for (let i = 0; i < 3 && parent; i++) { // Traverse up to 3 parents
                // Heuristic: if parent is scrollable and has multiple children, it's a good candidate
                if (parent.scrollHeight > parent.clientHeight + 50 && parent.children.length > 1) {
                    conversationContainer = parent; break;
                }
                if (parent.tagName === 'MAIN') { // Main tag is a good fallback
                    conversationContainer = parent; break;
                }
                parent = parent.parentElement;
            }
            if (!conversationContainer) conversationContainer = firstTurn.parentElement; // Fallback to direct parent
            console.log("Found conversation container via parent of first turn strategy:", conversationContainer);
        }
    }
    if (!conversationContainer) { // A more general selector as a last resort
        conversationContainer = document.querySelector('main div[role="presentation"] > div.flex.flex-col.items-center');
        if (conversationContainer) console.log("Found conversation container via general main content area selector:", conversationContainer);
    }

    if (!conversationContainer) {
        alert("Could not find the main conversation container to print. The page structure might have changed. Please report this issue if it persists.");
        console.error("Conversation container not found. Selectors might be outdated."); return;
    }

    const printStyleId = 'chatgpt-print-isolation-style';
    const printVisibleClass = 'chatgpt-print-visible-KpYqZ'; // Unique class name
    let printStyleElement = document.getElementById(printStyleId);
    if (printStyleElement) printStyleElement.remove(); // Remove old style if exists

    printStyleElement = document.createElement('style');
    printStyleElement.id = printStyleId;
    printStyleElement.media = 'print';

    const elementsToShowForPrint = [];
    let currentForClass = conversationContainer;
    // Add visibility class to the conversation container and its parents up to body
    while (currentForClass && currentForClass !== document.body) {
        currentForClass.classList.add(printVisibleClass);
        elementsToShowForPrint.push(currentForClass);
        currentForClass = currentForClass.parentElement;
    }
    document.documentElement.classList.add(printVisibleClass); // html element
    document.body.classList.add(printVisibleClass); // body element
    elementsToShowForPrint.push(document.documentElement);
    elementsToShowForPrint.push(document.body);

    let pageTitle = "ChatGPT Conversation";
    // Try various selectors for the conversation title
    const titleEl1 = document.querySelector('div[class*="flex-1 text-ellipsis"]'); // Common title selector
    const titleEl2 = document.querySelector('nav a[class*="bg-gray-800"] div.text-ellipsis'); // Another possible title location
    const titleEl3 = document.querySelector('div.truncate.text-sm.font-medium'); // Yet another one
    if (titleEl1 && titleEl1.textContent.trim()) pageTitle = titleEl1.textContent.trim();
    else if (titleEl2 && titleEl2.textContent.trim()) pageTitle = titleEl2.textContent.trim();
    else if (titleEl3 && titleEl3.textContent.trim()) pageTitle = titleEl3.textContent.trim();
    pageTitle = pageTitle.replace(/</g, "<").replace(/>/g, ">"); // Sanitize title

    // --- CSS FOR PRINTING (v0.7.15 - width:max-content for Tables, with filled-in generic styles) ---
    printStyleElement.innerHTML = `
        @page {
            margin: 0.2in !important; /* Minimal page margins */
            size: A4; /* Or letter, etc. */
        }

        @media print {
            /* Hide elements with class 'text-token-text-secondary' often used for minor details */
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
                width: 100% !important;
                box-sizing: border-box !important;
            }
            /* Hide everything in body by default unless it has the printVisibleClass or is the style itself */
            body > *:not(.${printVisibleClass}):not(#${printStyleId}) { display: none !important; }
            
            /* Ensure elements marked for printing are displayed as blocks and visible */
            .${printVisibleClass} {
                display: block !important; visibility: visible !important;
                position: static !important; overflow: visible !important;
                height: auto !important; width: 100% !important; 
                float: none !important; margin: 0 !important; padding: 0 !important; 
                box-sizing: border-box !important;
            }
            /* Children of visible elements should also be blocks and fill width */
            .${printVisibleClass} > * { 
                 display: block !important; visibility: visible !important;
                 position: relative !important; /* Changed from static for avatar positioning */
                 box-sizing: border-box !important;
                 width: 100% !important;
            }
            
            /* Specific styling for the main conversation scroll container */
            div.${printVisibleClass}[class*="react-scroll-to-bottom__view"],
            main.${printVisibleClass} div[role="presentation"] > div.${printVisibleClass} {
                 padding: 0 2pt !important; 
                 overflow: visible !important;
            }

            /* Hide common unwanted page elements for print */
            form, nav, header, footer, 
            div.text-token-text-secondary.relative.mt-auto.flex.min-h-8.w-full.items-center.justify-center, /* e.g., "ChatGPT can make mistakes" footer */
            button, [role="button"], 
            [data-testid*="send-button"], [data-testid*="feedback"], [data-testid*="copy"], /* Action buttons */
            [data-testid="conversation-actions"], /* More action buttons */
            div[class*="gizmo-shadow-stroke"], /* Gizmo specific elements */
            div[class*="text-gray-400"][class*="justify-center"][class*="items-center"] > button, /* Regenerate buttons */
            div[class*="text-center"] > button[class*="btn-neutral"], /* Model switcher, etc. */
            .markdown.prose pre > div[class*="contain-inline-size"] > div:not([class*="overflow-y-auto"]) { /* Hide copy buttons on code blocks */
                display: none !important;
            }

            /* Individual Message Turns */
            article[data-testid^="conversation-turn-"], 
            div[data-testid^="conversation-turn-"] {
                margin-bottom: 8pt !important; padding-left: 35pt !important; /* Space for pseudo-avatar */
                border: none !important; box-shadow: none !important;
                padding-top: 0 !important; padding-bottom: 0 !important; padding-right: 0 !important;
                position: relative !important; width: 100% !important; box-sizing: border-box !important;
                page-break-inside: avoid !important; /* Try to keep turns on one page */
            }
            
      
           

            /* Message Content Containers */
            /* User message bubble */
            div[data-message-author-role="user"] div[class*="whitespace-pre-wrap"],
            div[data-message-author-role="user"] div[class*="rounded-3xl"] { /* Adapt selector if needed */
                page-break-inside: auto !important;
                padding: 8pt 10pt !important;
                border: 1px solid #e0e0e0 !important;
                border-radius: 8px !important;
                background-color: #f7f7f8 !important; /* Light background for user messages */
                box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
                width: 100% !important; /* Use available width within the turn */
                max-width: 100% !important;
                box-sizing: border-box !important;
            }
            /* Assistant message bubble */
            div[data-message-author-role="assistant"] div.markdown.prose {
                page-break-inside: auto !important; padding: 0 !important; 
                border: none !important; border-radius: 0 !important; 
                background-color: transparent !important; /* Assistant messages often have no distinct bubble bg */
                box-shadow: none !important; 
                width: 100% !important; max-width: 100% !important; 
                box-sizing: border-box !important;
                overflow: visible !important; /* Allow content like tables to determine width */
            }
            /* Margins for first/last children within content */
            div[data-message-author-role] div p:first-child,
            div[data-message-author-role] div.markdown.prose > *:first-child:not(pre):not(table):not(ul):not(ol):not(.katex-display) { margin-top: 0 !important; padding-top: 0 !important; }
            div[data-message-author-role] div p:last-child,
            div[data-message-author-role] div.markdown.prose > *:last-child:not(pre):not(table):not(ul):not(ol):not(.katex-display) { margin-bottom: 0 !important; padding-bottom: 0 !important; }

            /* Paragraphs, KaTeX, Lists styling */
            div.markdown.prose p {
                margin-top: 0.6em !important;
                margin-bottom: 0.6em !important;
                orphans: 3 !important;
                widows: 3 !important;
            }
            .katex-display, .katex {
                font-size: 1em !important; 
                text-align: left !important;
                display: block !important; /* For katex-display */
                margin-top: 0.5em !important;
                margin-bottom: 0.5em !important;
                page-break-inside: avoid !important;
            }
            .markdown.prose ul, .markdown.prose ol {
                margin-top: 0.6em !important;
                margin-bottom: 0.6em !important;
                padding-left: 20pt !important; /* Indent lists */
            }
            .markdown.prose li {
                margin-bottom: 0.2em !important;
                page-break-inside: avoid !important;
            }
            
            /* Table Styling for Print - width:max-content for Tables */
            .markdown.prose div[class*="_tableContainer_"],
            .markdown.prose div[class*="_tableWrapper_"] { /* Common table wrapper classes */
                width: max-content !important; 
                min-width: 0 !important; 
                max-width: 100% !important; /* Allow it to shrink if table is narrower than page */
                overflow: visible !important; 
                margin-top: 0.8em !important; margin-bottom: 0.8em !important;
                page-break-inside: avoid !important; /* Try to keep tables on one page */
            }
            .markdown.prose table {
                width: max-content !important; 
                min-width: fit-content !important;
                table-layout: auto !important; 
                font-size: 7pt !important; 
                line-height: 1.1 !important;
                border-collapse: collapse !important;
                margin-left: 0; 
                margin-right: 0;
                border: 1px solid #ccc !important; /* Add border to table itself for better containment */
            }
            .markdown.prose th, 
            .markdown.prose td {
                border: 1px solid #ccc !important;
                padding: 2pt 4pt !important; 
                text-align: left !important;
                word-wrap: normal !important; 
                overflow-wrap: normal !important;
                white-space: nowrap !important; /* Prevent text wrapping in cells initially */
                hyphens: manual !important; 
                vertical-align: top;
            }
            /* More specific styling for cells that might need to wrap */
            .markdown.prose td.wrap-text, .markdown.prose th.wrap-text {
                white-space: normal !important; /* Allow wrapping for specific cells if needed */
                word-wrap: break-word !important;
            }
            .markdown.prose th {
                background-color: #f0f0f0 !important; 
                font-weight: bold !important;
            }
            .markdown.prose table .katex {
                font-size: 1em !important; 
                white-space: nowrap !important; 
                display: inline-block !important; 
            }

            /* Code Blocks Styling - Basic */
            .markdown.prose pre {
                background-color: #f5f5f5 !important; 
                border: 1px solid #ddd !important;
                border-radius: 4px !important;
                padding: 8pt !important;
                margin-top: 0.8em !important;
                margin-bottom: 0.8em !important;
                white-space: pre-wrap !important;  /* Wrap long lines */
                word-wrap: break-word !important;   /* Break words if necessary */
                overflow-x: auto !important;      /* Add scroll for very wide unwrappable content */
                font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace !important;
                font-size: 8pt !important;
                line-height: 1.3 !important;
                page-break-inside: avoid !important; /* Try to keep code blocks on one page */
            }
            .markdown.prose pre code {
                background-color: transparent !important;
                border: none !important;
                padding: 0 !important;
                font-size: inherit !important;
                color: #24292e !important; /* Dark color for code text */
                white-space: inherit !important; /* Inherit pre's white-space for wrapping */
                font-family: inherit !important;
            }
            /* Inline code */
            .markdown.prose code:not(pre code) {
                background-color: rgba(27,31,35,0.05) !important; /* Subtle background for inline code */
                border-radius: 3px !important;
                padding: 0.2em 0.4em !important;
                margin: 0 0.1em !important;
                font-size: 85% !important; 
                font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace !important;
                color: #cb2431; /* A common color for inline code, or adjust */
            }
            /* 
             * --- Prism/HLJS Token Styles ---
             * If you are using a syntax highlighter library like Prism.js or highlight.js,
             * you would include its specific token styles here for colored syntax in print.
             * Example (very basic, actual Prism themes are more complex):
             * .token.comment, .token.prolog, .token.doctype, .token.cdata { color: slategray; }
             * .token.punctuation { color: #999; }
             * ... many more ...
             * (User needs to provide these if specific syntax highlighting is desired for print)
             */
        }
    `;
    document.head.appendChild(printStyleElement);

    const originalTitle = document.title;
    document.title = pageTitle; // Set document title for PDF filename

    console.log("Injected print styles (v0.7.15). Triggering print dialog...");
    window.print(); // Open the print dialog

    // Cleanup after print dialog is closed (or after a timeout)
    setTimeout(() => {
        if (document.getElementById(printStyleId)) {
            document.head.removeChild(printStyleElement);
        }
        elementsToShowForPrint.forEach(el => el.classList.remove(printVisibleClass));
        document.title = originalTitle; // Restore original page title
        console.log("Removed print styles and classes, restored title.");
    }, 2500); // Adjust timeout if needed
}

// --- Main Download Handler & Initialization ---
// This function was in your original code. It's currently not directly used
// by the button, which calls handlePrintToPdf directly.
// You might keep it for other potential triggers or future use.
function handleDownload() {
    console.log("Download (Print Mode) button clicked via handleDownload function.");
    handlePrintToPdf();
}

// Initialize the extension once the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}