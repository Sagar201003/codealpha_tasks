# LinguaFuse - Advanced Language Translation Tool

LinguaFuse is a modern, responsive, and high-performance single-page web application that lets users translate text across 30+ major languages. The application is built using vanilla HTML5, CSS3, and JavaScript, prioritizing visual excellence, accessibility, and smooth user interactions.

## 🚀 Key Features

*   **Multi-Engine Support**:
    *   **MyMemory API (Default)**: Free, keyless translation out-of-the-box (capped at 5,000 characters/day).
    *   **Google Cloud Translation API**: Premium translation using your Google Cloud developer key.
    *   **Microsoft Translator API**: Premium translation using your Azure Cognitive Services key.
*   **Web Speech API Integration**:
    *   🎙️ **Speech-to-Text (Voice Typing)**: Speak into your microphone to dictate text in the selected source language.
    *   🔊 **Text-to-Speech (Pronunciation)**: Listen to native-sounding pronunciation of both source and translated text.
*   **Premium Interactive Design**:
    *   ✨ **Glassmorphic UI**: Semi-transparent panels with fine blur and glowing accents.
    *   🌓 **Light/Dark Mode Toggles**: Smooth aesthetic shift based on user preference.
    *   🔍 **Searchable Selectors**: Filter through 30+ languages easily using integrated search inputs in custom dropdowns.
    *   ⚡ **Auto-Translate**: Real-time translated responses debounced at 800ms while you type (can be toggled to manual mode).
    *   🔄 **Language Swapper**: Rotate languages and input/output texts with a single click.
    *   📋 **One-Click Actions**: Quick buttons to copy text to clipboard, listen to pronunciation, or share translations.
*   **Translation History**:
    *   📜 Persists recently translated text and language pairs locally.
    *   🔄 Clicking any history item restores the inputs, languages, and performs translation.
    *   🗑️ Delete individual history entries or clear the entire history log.

---

## 🛠️ Folder Structure

```text
CodeAlpha_Language_Translation_Tool/
├── index.html   # Main HTML5 layout and DOM structure
├── style.css    # Premium CSS design, themes, and animations
├── app.js       # Core application, logic, and API calls
└── README.md    # Project documentation and setup guidelines
```

---

## 💻 How to Run Locally

Since this project consists of pure static web assets (Vanilla HTML/CSS/JS), there is no compilation step or dependency installation required! 

You can launch it in a few ways:

### Option 1: Direct File Launch
Double-click the `index.html` file in your file explorer. It will open in your default browser.
*Note: Due to browser security restrictions on the `file://` protocol, some features like Speech Synthesis/Recognition might work better when served through a local server (Option 2).*

### Option 2: Using Node.js (Recommended)
If you have Node.js installed, you can quickly serve the files using a lightweight HTTP server:
1. Open terminal and navigate to the project directory:
   ```bash
   cd CodeAlpha_Language_Translation_Tool
   ```
2. Run any static server, for example `npx http-server` or `npx serve`:
   ```bash
   npx http-server -p 3000
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## 🔑 Configuring Premium Engines

By default, the application runs on **MyMemory API** with no setup. To switch to paid translation engines:

1. Click the **Google Cloud** or **Microsoft Translator** option in the **Translation Engine** card in the sidebar.
2. An **API Credentials** configuration card will appear.
3. Input your API key (and region for Microsoft Translator if applicable).
4. Click **Save Credentials**.
5. Your keys will be securely saved inside your browser's local storage (`localStorage`). No keys are sent to external servers other than official Google and Microsoft API endpoints.

---

## ♿ Accessibility & Usability Tips

*   **Keyboard Navigation**: The output translation is focusable (`tabIndex="0"`) so screen readers can easily access the translated text.
*   **Character Limits**: The input is restricted to 2,000 characters to prevent API rate limit issues and optimize response times.
*   **Clean Reset**: Click the `x` button inside the input card to instantly clear all outputs and cancel active speech synthesis readouts.
