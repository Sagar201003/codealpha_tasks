# 🚀 CodeAlpha Internship Tasks Portfolio

Welcome to the **CodeAlpha Web Development Internship Project Portfolio**. This repository contains a collection of modern, production-grade web applications and AI computer vision systems developed by **Sagar Shukla**.

Each project is located in its own self-contained folder with full source code, comprehensive README documentation, zero complex build dependencies, and live deployments.

---

## 🌐 Project Directory & Index

| # | Project Name | Description & Highlights | Tech Stack | Documentation | Live Demo / Status |
|---|--------------|--------------------------|------------|---------------|-------------------|
| 1 | **LinguaFuse** (Language Translation Tool) | A modern, responsive translation app supporting 30+ major languages with real-time debounced translation, multi-engine support (MyMemory, Google Cloud, Microsoft Azure), speech-to-text voice typing, text-to-speech pronunciation, local translation history, and glassmorphic UI. | HTML5, CSS3 (Vanilla), JavaScript (ES6+), Web Speech API, Translation APIs | [View README](./CodeAlpha_Language_Translation_Tool/README.md) | [Live Demo 🌐](https://languagetranslator-swart.vercel.app/) |
| 2 | **FAQ Pulse** (AI Conversational FAQ Chatbot) | An intelligent conversational FAQ chatbot powered by a client-side NLP engine with TF-IDF vectorization, Cosine Similarity matching ($\frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$), match precision slider, sentiment/emotion detection, voice dictation/playback, analytics dashboard, knowledge base editor, markdown formatting, persona switcher, synonym expansion, and searchable FAQ catalog. | HTML5, CSS3 (Vanilla), JS (ES6+), Web Speech API, Python (scikit-learn) | [View README](./CodeAlpha_Chatbot_for_FAQs/README.md) | [Live Demo 🌐](https://faqchatbot-kappa.vercel.app/) |
| 3 | **MelodyMind AI** (Music Generation with AI) | A deep learning music generation platform powered by an **Attention-Enhanced PyTorch LSTM (`AttentionMusicLSTM`)** with Multi-Head Self-Attention layers, Layer Normalization, Top-P (Nucleus) sampling, and `music21` sequence preprocessing. Features an interactive glassmorphic Web Audio Synthesizer studio, real-time Piano Roll visualizer, temperature creativity controls, genre profiles, and binary `.mid` MIDI file exporter. | HTML5, CSS3, JS, Web Audio API, PyTorch, music21, mido | [View README](./CodeAlpha_Music_Generation_with_AI/README.md) | [Live Demo 🌐](https://melodymind-ai-music.vercel.app/) |
| 4 | **OmniTrack AI** (Object Detection & Tracking) | A real-time Computer Vision system combining **YOLOv8** object detection with **DeepSORT (8-State Kalman Filter + Re-ID CNN Feature Embeddings + Hungarian Cascade Matching)** for persistent multi-object tracking. Features OpenCV visual annotations, persistent Track IDs (`ID #1`, `ID #2`), glowing motion trajectory trails, real-time HUD stats overlay, and annotated MP4 video file exporting. | Python 3, OpenCV, YOLOv8, PyTorch, DeepSORT, NumPy, SciPy | [View README](./CodeAlpha_Object_Detection_and_Tracking/README.md) | OpenCV Native System 📹 |

---

## 🌐 Live Deployed Links

* 🌐 **Task 1 - Language Translation Tool**: [https://languagetranslator-swart.vercel.app/](https://languagetranslator-swart.vercel.app/)
* 🌐 **Task 2 - FAQ Chatbot Application**: [https://faqchatbot-kappa.vercel.app/](https://faqchatbot-kappa.vercel.app/)
* 🌐 **Task 3 - AI Music Generation Studio**: [https://melodymind-ai-music.vercel.app/](https://melodymind-ai-music.vercel.app/)
* 📹 **Task 4 - Real-Time Object Detection & Tracking**: Native OpenCV Window (`python main.py`)

---

## 🛠️ How to Run Any Project Locally

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

#### Task 2: FAQ Chatbot Application
```bash
cd CodeAlpha_Chatbot_for_FAQs
```
- **Option 1 (Live Demo):** Visit [https://faqchatbot-kappa.vercel.app/](https://faqchatbot-kappa.vercel.app/)
- **Option 2 (Quick Open):** Double-click `index.html` to open directly in your web browser.

#### Task 3: Music Generation with AI
```bash
cd CodeAlpha_Music_Generation_with_AI
```
- **Option 1 (Live Demo):** Visit [https://melodymind-ai-music.vercel.app/](https://melodymind-ai-music.vercel.app/)
- **Option 2 (Local Web Studio Launch):** `npx http-server . -p 8080`

#### Task 4: Object Detection and Tracking
```bash
cd CodeAlpha_Object_Detection_and_Tracking
pip install -r requirements.txt

# Run live tracking on webcam:
python main.py --source 0

# Run tracking on sample video file:
python main.py --source data/sample_traffic.mp4 --save_video data/output_traffic.mp4
```

---

## 🧑‍💻 Author Information

**Sagar Shukla**  
*CodeAlpha Web Development Intern*  
GitHub Repository: [https://github.com/Sagar201003/codealpha_tasks.git](https://github.com/Sagar201003/codealpha_tasks.git)

---

## 📄 License & Attribution

This repository is maintained for educational and portfolio presentation purposes under the CodeAlpha Internship Program.
