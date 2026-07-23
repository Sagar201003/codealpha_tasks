# 🤖 FAQ Pulse - AI Conversational FAQ Assistant

**FAQ Pulse** is an intelligent, responsive, and feature-rich conversational FAQ chatbot built using vanilla HTML5, CSS3, and JavaScript. It features an advanced **client-side Natural Language Processing (NLP) engine** utilizing **TF-IDF Vectorization** and **Cosine Similarity** ($\frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$) to accurately parse, rank, and answer user queries against a pre-loaded knowledge base.

🌐 **Live Deployed Application**: [https://faqchatbot-kappa.vercel.app/](https://faqchatbot-kappa.vercel.app/)

---

## 🚀 Key Features & Capabilities

### 🧠 Core NLP & Vector Search Engine
* **Text Preprocessing**: Tokenization, stop-words cleaning, and Porter-style suffix stemming (*e.g., tracking, tracks → track*).
* **Synonym Match Expansion**: Built-in synonym mapping (*buy ↔ purchase ↔ upgrade*, *billing ↔ cost ↔ price*, *track ↔ shipping*, *reset ↔ password*) to boost query matching on alternative phrasing.
* **TF-IDF & Cosine Similarity Math**: Real-time mathematical vector closeness matching across indexed FAQ vectors.
* **Match Confidence Badges**: Color-coded relevance badges (*High Match >70%*, *Medium Match 40-70%*, *Low Match / Fallback <35%*).
* **Precision Slider**: Adjust match relevance threshold dynamically from 10% to 60%.

### 🎭 Personalization & Conversational Tone
* **Conversational Persona Selector**: Switch between 4 distinct bot personalities:
  * 💼 **Professional Assistant**: Official, polite, technical style.
  * 😊 **Friendly Buddy**: Empathetic, warm, approachable tone.
  * 🤓 **Tech Geek**: Vector space, query centroid, and output stream dialect.
  * 🏴‍☠️ **Pirate Bot**: Nautical pirate phrasing (*"Arrr! Here be the answers ye seek"*).
* **Sentiment & Emotion Detection**: Detects user mood (*Frustrated*, *Positive*, *Neutral*) and adapts bot responses with empathetic prefixes when frustration is detected.

### 📝 Rich Content & Search Catalog
* **Markdown & Rich-Text Support**: Renders bold text (`**text**`), bullet lists (`- item`), and hyperlinks (`[label](url)`) inside chat bubbles.
* **Searchable FAQ Directory Modal**: Accordion-style catalog browser allowing users to search, filter, and inspect FAQs by category outside the chat feed.
* **Typeahead Autocomplete**: Real-time floating dropdown matching FAQs as you type, complete with `ArrowUp` / `ArrowDown` / `Enter` keyboard selection.

### 🗣️ Voice Controls & Analytics Dashboard
* 🎙️ **Voice Dictation (Speech-to-Text)**: Dictate questions using your microphone via the Web Speech API.
* 🔊 **Text-to-Speech (Pronunciation)**: Listen to audio readouts of chatbot answers.
* 📊 **Performance Analytics Modal**: Displays total queries processed, average confidence score %, user satisfaction rate %, and top query categories.
* 👍 / 👎 **Helpfulness Feedback Rating**: Rate individual responses as helpful or unhelpful to update live satisfaction metrics.
* 📥 / 📤 **Import & Export Systems**: Export conversation transcripts to `.txt` files, and export/import knowledge base `.json` datasets.
* 🗄️ **Knowledge Base Editor**: Add, delete, or reset FAQ Q&A pairs directly in the UI with `localStorage` persistence.

---

## 🛠️ Project Structure

```text
CodeAlpha_Chatbot_for_FAQs/
├── index.html       # HTML5 layout for chat feed, modals, and input area
├── style.css        # Glassmorphic UI design, themes, and responsive layouts
├── app.js           # NLP engine, Sentiment, Autocomplete, Personas, and UI state
├── faqs.json        # Pre-loaded FAQ dataset (20+ Q&A pairs)
├── nlp_engine.py    # Python CLI reference implementation (scikit-learn)
└── README.md        # Complete project documentation
```

---

## 💻 How to Run Locally on Your System

### Option 1: Access Live Deployment (Instant)
Access the live production chatbot instantly on Vercel:
👉 **[https://faqchatbot-kappa.vercel.app/](https://faqchatbot-kappa.vercel.app/)**

---

### Option 2: Run Locally from Source Code

#### Step 1: Download or Clone the Repository

* **Option A (Git Clone):**
  ```bash
  git clone https://github.com/Sagar201003/codealpha_tasks.git
  cd codealpha_tasks/CodeAlpha_Chatbot_for_FAQs
  ```
* **Option B (Direct ZIP Download):**
  1. Download the ZIP file from GitHub and extract it.
  2. Open terminal and navigate into `CodeAlpha_Chatbot_for_FAQs`.

---

#### Step 2: Launch the Web Application

##### Method A: Direct File Launch (Quickest)
1. Open the `CodeAlpha_Chatbot_for_FAQs` folder in your file explorer.
2. Double-click `index.html`.
3. It will open immediately in your web browser.

##### Method B: Local Web Server (Recommended)
For full Web Speech API compatibility and local storage persistence:
1. Open terminal in the `CodeAlpha_Chatbot_for_FAQs` folder.
2. Run a static server:
   ```bash
   npx http-server -p 8080
   ```
3. Open your browser and go to `http://localhost:8080`.

---

## 🐍 Running the Python CLI Engine (Optional)

If you wish to test the python-based reference CLI engine:

1. Install dependencies:
   ```bash
   pip install scikit-learn
   ```
2. Run the engine:
   ```bash
   python nlp_engine.py
   ```

---

## 📄 License & Internship Notes

Developed under the **CodeAlpha Web Development Internship Program** by **Sagar Shukla**.
