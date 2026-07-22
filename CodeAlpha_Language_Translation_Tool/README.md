# 🌐 LinguaFuse - Advanced Language Translation Tool

**LinguaFuse** is a modern, high-performance, single-page language translation web application built with vanilla HTML5, CSS3, and JavaScript. It provides real-time translation across 30+ global languages with voice dictation, text-to-speech audio pronunciation, multi-engine translation support (MyMemory, Google Cloud, Microsoft Azure), translation history tracking, and a sleek glassmorphic UI.

---

## 🚀 Key Features & Highlights

* **🌐 Multi-Engine Translation Support**:
  * **MyMemory API (Default)**: Free, keyless translation service out-of-the-box (capped at 5,000 characters/day).
  * **Google Cloud Translation API**: Premium neural translation support using your Google Cloud API key.
  * **Microsoft Azure Translator API**: Enterprise translation support using your Cognitive Services key.
* **🗣️ Web Speech API Integration**:
  * 🎙️ **Speech-to-Text (Voice Typing)**: Dictate text directly into your browser using your microphone.
  * 🔊 **Text-to-Speech (Pronunciation)**: Listen to native audio readouts for both source and translated text.
* **✨ Modern Glassmorphic UI & Themes**:
  * 🌓 **Dark / Light Mode**: Smooth visual toggle with customized CSS variables.
  * 🔍 **Searchable Language Selectors**: Filter through 30+ supported languages instantly with built-in search boxes inside dropdown modals.
  * ⚡ **Real-Time Auto-Translate**: Translates as you type with an optimized 800ms debounce timer (with optional toggle for manual translation).
  * 🔄 **Quick Swap Button**: Switch source and target languages along with their respective text contents in a single click.
  * 📋 **One-Click Actions**: Quick action buttons to copy text to clipboard, listen to pronunciation, or clear input fields.
* **📜 Local Translation History**:
  * Automatically records recent translations locally in browser `localStorage`.
  * Click any history item to instantly re-populate inputs, target languages, and re-translate.
  * Clear individual records or wipe full history logs.

---

## 🛠️ Project Architecture & File Structure

```text
CodeAlpha_Language_Translation_Tool/
├── index.html   # Main HTML5 page structure and modal dialogs
├── style.css    # Modern glassmorphic styling system, animations, and color themes
├── app.js       # Core application logic, API engine handlers, Web Speech, and localStorage
└── README.md    # Documentation and setup instructions
```

---

## 💻 How to Run Locally on Your System

Since LinguaFuse is built using vanilla web technologies, running it on your system requires **zero setup, zero npm builds, and no framework dependencies**.

### Step 1: Download or Clone the Repository

* **Option A (Git Clone):**
  ```bash
  git clone https://github.com/Sagar201003/codealpha_tasks.git
  cd codealpha_tasks/CodeAlpha_Language_Translation_Tool
  ```
* **Option B (Direct ZIP Download):**
  1. Go to the main GitHub repository: [https://github.com/Sagar201003/codealpha_tasks.git](https://github.com/Sagar201003/codealpha_tasks.git).
  2. Click the green **Code** button and select **Download ZIP**.
  3. Extract the downloaded `.zip` file on your computer.
  4. Open your terminal or command prompt and enter the extracted folder:
     ```bash
     cd CodeAlpha_Language_Translation_Tool
     ```

---

### Step 2: Launch the Application

#### Method A: Direct Browser Launch (Quickest)
1. Open your File Explorer and open the `CodeAlpha_Language_Translation_Tool` folder.
2. Double-click `index.html`.
3. It will open immediately in your web browser.

#### Method B: Local Web Server (Recommended)
Running via a local HTTP server guarantees that browser Web Speech API (microphone & text-to-speech) permissions operate without local file security (`file://`) restrictions:
1. Open terminal in the project directory.
2. Launch a lightweight HTTP server:
   ```bash
   npx http-server -p 8080
   ```
3. Open your browser and navigate to `http://localhost:8080`.

#### Method C: VS Code Live Server Extension
1. Open the `CodeAlpha_Language_Translation_Tool` directory in **Visual Studio Code**.
2. Install the **Live Server** extension.
3. Right-click `index.html` and select **Open with Live Server**.

---

## 🔑 Configuring Premium Translation Engines (Optional)

The application works out-of-the-box using the free **MyMemory API**. If you wish to use Google Cloud or Microsoft Azure APIs:

1. Open the application sidebar and locate **Translation Engine**.
2. Select **Google Cloud** or **Microsoft Azure**.
3. Fill in your API Key (and Azure Region if using Microsoft).
4. Click **Save Credentials**. Your credentials are stored strictly in your browser's private `localStorage`.

---

## 📄 License & Internship Notes

Developed under the **CodeAlpha Web Development Internship Program** by **Sagar Shukla**.
