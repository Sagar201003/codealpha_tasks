# 🤖 FAQ Pulse - Intelligent FAQ Chatbot

FAQ Pulse is a modern, responsive, and high-performance conversational AI application designed to answer Frequently Asked Questions (FAQs). It features a **client-side Natural Language Processing (NLP) engine** using **TF-IDF Vectorization** and **Cosine Similarity** to match user questions with the best response from a pre-loaded knowledge base.

---

## 🚀 Key Features

*   **🧠 Natural Language Preprocessing & Matching**:
    *   **Text Cleaning & Normalization**: Strips special characters, converts text to lowercase, and filters out common stop-words.
    *   **Word Stemming**: Normalizes word variations (e.g. *tracking*, *tracked*, *tracks* → *track*).
    *   **TF-IDF Vectorization**: Calculates Term Frequency & Inverse Document Frequency across all FAQ documents.
    *   **Cosine Similarity Matching**: Computes mathematical vector closeness to deliver the most relevant answer.
*   **📊 Match Confidence Scoring**:
    *   Displays relevance match percentages (e.g. `95% match`) on every answer.
    *   **High Match (>70%)**: Green badge indicator.
    *   **Medium Match (40-70%)**: Yellow badge indicator.
    *   **Low Match / Fallback (<35%)**: Displays fallback response with smart suggested alternatives.
*   **🗣️ Voice & Audio Integration**:
    *   🎙️ **Voice Typing**: Speak into your microphone to dictate your question using the Web Speech API.
    *   🔊 **Text-to-Speech (Pronunciation)**: Listen to audio readouts of chatbot answers.
*   **🗄️ Interactive Knowledge Base Manager**:
    *   Add custom Q&A pairs directly through the UI.
    *   Filter FAQs by category (E-Commerce, SaaS & Account, Tech Support, HR & General).
    *   Persistent storage using `localStorage`.
*   **🐍 Python NLP Reference Script**:
    *   Includes `nlp_engine.py` built with `scikit-learn` for backend Python execution.

---

## 🛠️ Folder Structure

```text
CodeAlpha_Chatbot_for_FAQs/
├── index.html       # HTML5 structure for chat dashboard & modal manager
├── style.css        # Premium glassmorphic design, themes, and animations
├── app.js           # Client-side NLP engine, TF-IDF, Cosine Similarity & UI logic
├── faqs.json        # Pre-loaded FAQ dataset with 20+ Q&A pairs
├── nlp_engine.py    # Python CLI reference implementation (scikit-learn)
└── README.md        # Project documentation and setup instructions
```

---

## 💻 How to Run Locally on Your System

Running this project is fast and straightforward. Choose one of the options below.

### Step 1: Download or Clone the Repository
If you haven't already, get the code on your machine:
*   **Option A (Download ZIP):** Click the green **Code** button on GitHub, select **Download ZIP**, and extract the folder.
*   **Option B (Git Clone):**
    ```bash
    git clone https://github.com/Sagar201003/codealpha_tasks.git
    cd codealpha_tasks/CodeAlpha_Chatbot_for_FAQs
    ```

---

### Step 2: Launch the Web Application

#### Method A: Direct File Launch (Quickest)
1. Open the `CodeAlpha_Chatbot_for_FAQs` folder in your File Explorer.
2. Double-click `index.html`.
3. It will open instantly in your default web browser.

#### Method B: Using Node.js HTTP Server (Recommended)
For the best experience (and full Web Speech API compatibility):
1. Open your terminal or command prompt.
2. Navigate to the project directory:
   ```bash
   cd CodeAlpha_Chatbot_for_FAQs
   ```
3. Run a local server:
   ```bash
   npx http-server -p 8080
   ```
4. Open your browser and navigate to: `http://localhost:8080`

#### Method C: Using VS Code Live Server
1. Open the `CodeAlpha_Chatbot_for_FAQs` folder in **Visual Studio Code**.
2. Install the **Live Server** extension.
3. Right-click `index.html` and select **"Open with Live Server"**.

---

## 🐍 Running the Python CLI Engine (Optional)

If you'd like to test the backend Python NLP engine:

1. Install `scikit-learn`:
   ```bash
   pip install scikit-learn
   ```
2. Run the script:
   ```bash
   python nlp_engine.py
   ```
3. Type questions in the terminal prompt to see similarity match scores in real time!

---

## 📄 License

This project is created for educational and internship purposes under the CodeAlpha program.
