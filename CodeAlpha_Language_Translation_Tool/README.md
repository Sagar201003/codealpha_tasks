# 🌐 LinguaFuse - Advanced Language Translation Tool

LinguaFuse is a modern, responsive, and high-performance single-page web application that allows users to seamlessly translate text across 30+ major languages. Built with vanilla HTML5, CSS3, and JavaScript, it prioritizes a premium user experience with a sleek glassmorphic interface, voice typing, text-to-speech pronunciation, and multi-engine API support.

---

## 🚀 Key Features

*   **🌐 Multi-Engine Support**:
    *   **MyMemory API (Default)**: Free, keyless translation out-of-the-box (capped at 5,000 characters/day).
    *   **Google Cloud Translation API**: Premium translation using your Google Cloud developer key.
    *   **Microsoft Translator API**: Premium translation using your Azure Cognitive Services key.
*   **🗣️ Web Speech API Integration**:
    *   🎙️ **Speech-to-Text (Voice Typing)**: Speak into your microphone to dictate text in the selected source language.
    *   🔊 **Text-to-Speech (Pronunciation)**: Listen to native-sounding pronunciation of both source and translated text.
*   **✨ Premium Interactive Design**:
    *   **Glassmorphic UI**: Semi-transparent panels with fine blur and glowing accents.
    *   🌓 **Light/Dark Mode Toggles**: Smooth aesthetic shift based on user preference.
    *   🔍 **Searchable Selectors**: Filter through 30+ languages easily using integrated search inputs in custom dropdowns.
    *   ⚡ **Auto-Translate**: Real-time translated responses debounced at 800ms while you type (can be toggled to manual mode).
    *   🔄 **Language Swapper**: Rotate languages and input/output texts with a single click.
    *   📋 **One-Click Actions**: Quick buttons to copy text to clipboard, listen to pronunciation, or share translations.
*   **🕰️ Translation History**:
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

## 💻 How to Run Locally on Your System

Running this project is incredibly easy because it uses **pure static web assets** (Vanilla HTML/CSS/JS). There are no complex builds, no frameworks to compile, and no dependencies to install!

Follow these step-by-step instructions to run the project on your machine.

### Step 1: Download or Clone the Repository
If you haven't already, download the project to your local machine. You can do this in two ways:
*   **Method A (Download ZIP):** Go to the GitHub repository page, click the green **Code** button, and select **Download ZIP**. Once downloaded, **extract (unzip)** the folder on your computer.
*   **Method B (Git):** Run the following command in your terminal:
    ```bash
    git clone https://github.com/Sagar201003/codealpha_tasks.git
    cd codealpha_tasks/CodeAlpha_Language_Translation_Tool
    ```

### Step 2: Choose a Method to Run the Project

You can run the project using any of the following methods. **Method B (Local Server) is highly recommended** to ensure all features (like voice typing and pronunciation) work perfectly without browser security restrictions.

#### Method A: Direct File Launch (Quickest)
1. Open the `CodeAlpha_Language_Translation_Tool` folder in your file explorer.
2. Double-click the `index.html` file. 
3. It will open directly in your default web browser.
*(Note: Due to browser security policies regarding local files (`file://`), advanced features like the microphone or speech synthesis might be blocked or behave unexpectedly.)*

#### Method B: Using Node.js HTTP Server (Recommended)
If you have [Node.js](https://nodejs.org/) installed, use this method for the best experience.
1. Open your terminal or command prompt.
2. Navigate into the project directory:
   ```bash
   cd CodeAlpha_Language_Translation_Tool
   ```
3. Run a lightweight static server using `npx`:
   ```bash
   npx http-server -p 8080
   ```
4. Open your web browser and go to: `http://localhost:8080`

#### Method C: Using VS Code Live Server Extension
1. Open the `CodeAlpha_Language_Translation_Tool` folder in **Visual Studio Code**.
2. Install the **"Live Server"** extension by Ritwick Dey from the VS Code Extensions marketplace.
3. Open `index.html` in the editor.
4. Right-click anywhere inside the code and select **"Open with Live Server"**, or click the **"Go Live"** button at the bottom right corner of the VS Code window.
5. Your default browser will automatically open the project at a local address (e.g., `http://127.0.0.1:5500`).

---

## 🔑 Configuring Premium Engines (Optional)

By default, the application runs perfectly on the **MyMemory API** with zero setup required. However, if you want to switch to paid/premium translation engines, follow these steps:

1. Launch the application in your browser.
2. Open the **Sidebar** and locate the **Translation Engine** card.
3. Select either **Google Cloud** or **Microsoft Translator**.
4. An **API Credentials** configuration card will appear below it.
5. Input your API key (and your region if using Microsoft Translator).
6. Click **Save Credentials**.
7. Your keys are securely saved *locally* inside your browser's `localStorage`. They are never sent to external servers other than the official Google and Microsoft API endpoints.

---

## ♿ Accessibility & Usability Tips

*   **Keyboard Navigation**: The output translation is focusable (`tabIndex="0"`), allowing screen readers to easily access and announce the translated text.
*   **Character Limits**: The text input area is restricted to 2,000 characters per request. This prevents API rate limit issues and ensures optimal response times.
*   **Clean Reset**: Click the `x` (clear) button inside the source input card to instantly clear all outputs, input text, and cancel any active speech synthesis readouts.
