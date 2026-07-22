# 🤖 FAQ Pulse - AI Conversational FAQ Assistant

FAQ Pulse is a modern, responsive, and high-performance conversational AI application designed to answer Frequently Asked Questions (FAQs). It features a **client-side Natural Language Processing (NLP) engine** using **TF-IDF Vectorization** and **Cosine Similarity** to match user questions with the best response from a pre-loaded knowledge base.

---

## 🚀 Key Features

*   **🧠 Natural Language Preprocessing & Vector Matching**:
    *   **Text Cleaning & Normalization**: Strips special characters, converts text to lowercase, and filters out common stop-words.
    *   **Word Stemming**: Normalizes word variations (e.g. *tracking*, *tracked*, *tracks* → *track*).
    *   **TF-IDF Vectorization**: Calculates Term Frequency & Inverse Document Frequency across all FAQ documents.
    *   **Cosine Similarity Matching**: Computes mathematical vector closeness ($\frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$) to deliver the most relevant answer.
*   **📊 Match Confidence & Precision Controls**:
    *   Displays relevance match percentages (e.g. `95% match`) on every answer.
    *   **High Match (>70%)**: Green badge indicator.
    *   **Medium Match (40-70%)**: Yellow badge indicator.
    *   **Low Match / Fallback (<35%)**: Embeds suggested related question chips directly inside the bot response card.
    *   **Match Precision Slider**: Dynamically adjust match confidence threshold (10% - 60%).
*   **🔍 Typeahead Autocomplete Search**:
    *   Floating dropdown recommending top matching questions in real-time as you type.
*   **👍 / 👎 Interactive Response Rating System**:
    *   Rate every bot answer as helpful or unhelpful to calculate user satisfaction percentage.
*   **🎭 Sentiment & Emotion Reaction Engine**:
    *   Detects user mood (Frustrated, Positive, Neutral) and adapts the bot's avatar badge and tone dynamically (prepending empathetic messages when frustration is detected).
*   **🗣️ Voice Dictation & Audio Playback**:
    *   🎙️ **Voice Dictation**: Speak into your microphone to dictate questions using the Web Speech API.
    *   🔊 **Text-to-Speech (Pronunciation)**: Listen to audio readouts of chatbot answers.
*   **📊 Performance Analytics Dashboard Modal**:
    *   Real-time metrics: Total Queries, Average Match Score %, User Satisfaction Rate %, and Top Category.
*   **📥 / 📤 Export & Import System**:
    *   **Export Transcript**: Download full chat transcript as a formatted `.txt` file.
    *   **Export/Import Knowledge Base**: Export dataset or import custom JSON FAQ files.
*   **📝 Markdown & Rich Text Formatting**:
    *   Renders bold text (`**text**`), bullet lists (`- item`), and hyperlinks (`[label](url)`) inside chatbot response cards.
*   **🎭 Conversational Persona Switcher**:
    *   Switch between **Professional Assistant**, **Friendly Buddy**, **Tech Geek**, and **Pirate Bot** with custom avatars, greetings, and tone templates.
*   **📖 Synonym Match Expansion**:
    *   Built-in dictionary mapping synonyms (e.g. *buy*/*purchase*, *billing*/*cost*, *reset*/*password*, *track*/*shipping*) to boost vector matching.
*   **📖 Searchable FAQ Directory Modal**:
    *   Accordion-style catalog browser to search, filter, and inspect FAQs by category outside of the chat feed.
*   **♿ Keyboard Shortcuts & Navigation**:
    *   Use `ArrowUp` / `ArrowDown` to navigate autocomplete suggestions, `Enter` to select, and `Esc` to close modals.
*   **🗄️ Interactive Knowledge Base Editor**:
    *   Add custom Q&A pairs directly through the UI.
    *   Filter FAQs by category (E-Commerce, SaaS & Account, Tech Support, HR & General).
    *   Persistent storage using `localStorage`.

---

## 🛠️ Folder Structure

```text
CodeAlpha_Chatbot_for_FAQs/
├── index.html       # HTML5 structure for chat dashboard, autocomplete, and modals
├── style.css        # Premium glassmorphic design system, themes, and animations
├── app.js           # Client-side NLP engine, Sentiment, Autocomplete, Analytics, & UI logic
├── faqs.json        # Pre-loaded FAQ dataset with 20+ Q&A pairs
├── nlp_engine.py    # Python CLI reference implementation (scikit-learn)
└── README.md        # Project documentation and setup instructions
```

---

## 💻 How to Run Locally on Your System

Running this project is fast and straightforward.

### Step 1: Download or Clone the Repository
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

---

## 📄 License

This project is created for educational and internship purposes under the CodeAlpha program.
