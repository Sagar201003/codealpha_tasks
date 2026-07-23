# 🚀 CodeAlpha Internship Tasks Portfolio

Welcome to the **CodeAlpha Web Development Internship Project Portfolio**. This repository contains a collection of modern, production-grade web applications developed by **Sagar Shukla**.

Each project is located in its own self-contained folder with full source code, comprehensive README documentation, zero complex build dependencies, and live deployments on Vercel.

---

## 🌐 Project Directory & Index

| # | Project Name | Description & Highlights | Tech Stack | Documentation |
|---|--------------|--------------------------|------------|---------------|
| 1 | **LinguaFuse** (Language Translation Tool) | A modern, responsive translation app supporting 30+ major languages with real-time debounced translation, multi-engine support (MyMemory, Google Cloud, Microsoft Azure), speech-to-text voice typing, text-to-speech pronunciation, local translation history, and glassmorphic UI. | HTML5, CSS3 (Vanilla), JavaScript (ES6+), Web Speech API, Translation APIs | [View README](./CodeAlpha_Language_Translation_Tool/README.md) |
| 2 | **FAQ Pulse** (AI Conversational FAQ Chatbot) | An intelligent conversational FAQ chatbot powered by a client-side NLP engine with TF-IDF vectorization, Cosine Similarity matching ($\frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$), match precision slider, sentiment/emotion detection, voice dictation/playback, analytics dashboard, knowledge base editor, markdown formatting, persona switcher, synonym expansion, and searchable FAQ catalog. | HTML5, CSS3 (Vanilla), JS (ES6+), Web Speech API, Python (scikit-learn) | [View README](./CodeAlpha_Chatbot_for_FAQs/README.md) |
| 3 | **MelodyMind AI** (Music Generation with AI) | A deep learning music generation platform powered by an **Attention-Enhanced PyTorch LSTM (`AttentionMusicLSTM`)** with Multi-Head Self-Attention layers, Layer Normalization, Top-P (Nucleus) sampling, and `music21` sequence preprocessing. Features an interactive glassmorphic Web Audio Synthesizer studio, real-time Piano Roll visualizer, temperature creativity controls, genre profiles, and binary `.mid` MIDI file exporter. | HTML5, CSS3, JS, Web Audio API, PyTorch, music21, mido | [View README](./CodeAlpha_Music_Generation_with_AI/README.md) |

---

## 🌐 Live Deployed Links

* 🌐 **Task 1 - Language Translation Tool**: [https://languagetranslator-swart.vercel.app/](https://languagetranslator-swart.vercel.app/)
* 🌐 **Task 2 - FAQ Chatbot Application**: [https://faqchatbot-kappa.vercel.app/](https://faqchatbot-kappa.vercel.app/)

---

## 🛠️ How to Run Any Project Locally

All applications in this repository are built with vanilla web technologies, meaning they run directly inside any modern web browser without requiring complex framework compilation.

### Step 1: Download or Clone the Repository
* **Option A (Git Clone - Recommended):**
  ```bash
  git clone https://github.com/Sagar201003/codealpha_tasks.git
  cd codealpha_tasks
  ```
* **Option B (Direct Download):**
  1. Click the green **Code** button at the top of this GitHub repository.
  2. Select **Download ZIP** and extract the folder on your computer.
  3. Open your terminal or command prompt and navigate into the extracted `codealpha_tasks` directory.

---

### Step 2: Choose a Project to Run

#### Task 1: Language Translation Tool
```bash
cd CodeAlpha_Language_Translation_Tool
```
- **Option 1 (Live Demo):** Visit [https://languagetranslator-swart.vercel.app/](https://languagetranslator-swart.vercel.app/)
- **Option 2 (Quick Open):** Double-click `index.html` to open directly in your web browser.
- **Option 3 (Local Server):**
  ```bash
  npx http-server . -p 8080
  ```

#### Task 2: FAQ Chatbot Application
```bash
cd CodeAlpha_Chatbot_for_FAQs
```
- **Option 1 (Live Demo):** Visit [https://faqchatbot-kappa.vercel.app/](https://faqchatbot-kappa.vercel.app/)
- **Option 2 (Quick Open):** Double-click `index.html` to open directly in your web browser.
- **Option 3 (Local Server):**
  ```bash
  npx http-server . -p 8080
  ```

#### Task 3: Music Generation with AI
```bash
cd CodeAlpha_Music_Generation_with_AI
```
- **Option 1 (Web Studio Launch):**
  ```bash
  npx http-server web -p 8080
  ```
  Then visit `http://localhost:8080` in your browser.
- **Option 2 (Python CLI Pipeline):**
  ```bash
  pip install -r requirements.txt
  python generate_music.py --num_notes 60 --temperature 0.8 --top_p 0.85
  ```

---

## 🧑‍💻 Author Information

**Sagar Shukla**  
*CodeAlpha Web Development Intern*  
GitHub Repository: [https://github.com/Sagar201003/codealpha_tasks.git](https://github.com/Sagar201003/codealpha_tasks.git)

---

## 📄 License & Attribution

This repository is maintained for educational and portfolio presentation purposes under the CodeAlpha Internship Program.
