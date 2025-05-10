# ChatGPT PDF Exporter v0.7.15

A lightweight Chrome extension that adds a floating **“⬇️ Print to PDF”** button to [ChatGPT](https://chat.openai.com), allowing users to export any conversation thread into a clean, printable PDF—optimized for table-heavy content.

---

## 🚀 Features

- 🖨️ **One-Click PDF Export** – Easily print full conversations to PDF.
- 💬 **Smart Content Detection** – Accurately identifies the active chat container.
- 🧼 **Clean Layout for Print** – Hides unnecessary UI elements like buttons, avatars, and footers.
- 📐 **Auto-Scaled Tables** – Tables are printed using `width: max-content`, preventing column clipping.
- 🧵 **Conversation Threading Support** – Works seamlessly with multiple conversation turns.
- ⚙️ **SPA-Compatible** – Uses a `MutationObserver` to support ChatGPT’s single-page application behavior.

---

## 📦 Installation

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select this project folder.
5. Open [ChatGPT](https://chat.openai.com), and you’ll see the **“⬇️ Print to PDF”** button appear in the bottom right corner.

---

## 🧠 How It Works

This extension injects a floating button into the DOM when visiting ChatGPT. Once clicked, it:

1. Locates the conversation container using multiple strategies.
2. Injects a print-optimized stylesheet.
3. Makes only the relevant DOM nodes visible for printing.
4. Applies layout fixes (padding, table resizing, etc.).
5. Triggers the native browser print dialog.

---

## 📄 Output Highlights

- **Typography**: Uses Arial/Helvetica with optimized print font sizes.
- **Tables**: Render using `width: max-content`, ensuring all columns are fully visible.
- **Page Margins**: Reduced to `0.2in` for dense, readable output.
- **Consistent Styling**: Applies light backgrounds and borders for user messages only.
- **Print Adjustments**: Forces dark backgrounds and colored buttons to appear in print using `-webkit-print-color-adjust: exact`.

---

## 🔧 Technical Notes

- Version: `0.7.15`
- Core File: `content.js`
- Load Scope: Automatically triggered when a ChatGPT prompt textarea appears.
- Styling is injected only when print mode is activated.

---

## 📸 Screenshots
![image](https://github.com/user-attachments/assets/e3abae59-bc2e-41d9-adeb-a86d113ef7c7)
![image](https://github.com/user-attachments/assets/e9df3adf-cf24-4335-a397-1b2538e03e4a)



---

## 📃 License

MIT License — free to use, modify, and distribute.

---

## 🙌 Acknowledgements

Special thanks to OpenAI for providing ChatGPT and a well-structured UI that made this tool possible.

---

## 🗣 Feedback

Feel free to open issues or pull requests on the [GitHub repo](https://github.com/abdulhamidalthaljy/chatgpt-pdf-exporter).
