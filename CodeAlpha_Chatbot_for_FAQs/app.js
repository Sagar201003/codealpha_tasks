/* -------------------------------------------------------------
 * FAQ Pulse Chatbot Logic & Client-Side NLP Engine (app.js)
 * ------------------------------------------------------------- */

// Common English Stop Words for NLP Preprocessing
const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
    'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
    'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
    'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
    'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
    'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
    'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
    'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
    'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
    'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
    'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Basic Suffix Stemmer (Porter-style light normalization)
function stemWord(word) {
    if (word.length <= 3) return word;
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    if (word.endsWith('ly')) return word.slice(0, -2);
    return word;
}

// Tokenize & Clean Text
function preprocessText(text) {
    if (!text) return [];
    // Lowercase and remove special characters/punctuation
    const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    // Split into tokens
    const rawTokens = cleaned.split(/\s+/).filter(t => t.length > 0);
    // Remove stop words and stem remaining terms
    return rawTokens
        .filter(token => !STOP_WORDS.has(token))
        .map(token => stemWord(token));
}

/* -------------------------------------------------------------
 * NLP Vector Space Model (TF-IDF & Cosine Similarity Calculator)
 * ------------------------------------------------------------- */
class NLPEngine {
    constructor() {
        this.faqs = [];
        this.vocabulary = new Set();
        this.documents = []; // Processed token arrays for each FAQ
        this.idfMap = new Map();
        this.faqVectors = []; // TF-IDF vector representations
    }

    // Index all FAQs in the dataset
    indexFAQs(faqs) {
        this.faqs = faqs;
        this.vocabulary.clear();
        this.documents = [];
        this.idfMap.clear();

        // 1. Process documents (combine Question + Tags + Category for higher accuracy)
        this.documents = faqs.map(faq => {
            const questionTokens = preprocessText(faq.question);
            const tagTokens = preprocessText((faq.tags || []).join(' '));
            const categoryTokens = preprocessText(faq.category || '');
            // Weight question tokens higher by duplicating them
            const combined = [...questionTokens, ...questionTokens, ...tagTokens, ...categoryTokens];
            combined.forEach(token => this.vocabulary.add(token));
            return combined;
        });

        // 2. Calculate Inverse Document Frequency (IDF) for every vocabulary term
        const totalDocs = this.documents.length;
        this.vocabulary.forEach(term => {
            const docCount = this.documents.filter(doc => doc.includes(term)).length;
            // Standard Smooth IDF formula
            const idf = Math.log(1 + (totalDocs / (1 + docCount))) + 1;
            this.idfMap.set(term, idf);
        });

        // 3. Build TF-IDF vectors for all FAQs
        this.faqVectors = this.documents.map(doc => this.computeTfidfVector(doc));
    }

    // Convert token list into normalized TF-IDF vector object
    computeTfidfVector(tokens) {
        if (tokens.length === 0) return { vector: {}, magnitude: 0 };

        const termCounts = {};
        tokens.forEach(t => termCounts[t] = (termCounts[t] || 0) + 1);

        const vector = {};
        let sumSquares = 0;

        for (const term in termCounts) {
            if (this.idfMap.has(term)) {
                // Term Frequency (TF) * IDF
                const tf = termCounts[term] / tokens.length;
                const idf = this.idfMap.get(term);
                const tfidf = tf * idf;
                vector[term] = tfidf;
                sumSquares += tfidf * tfidf;
            }
        }

        const magnitude = Math.sqrt(sumSquares);
        return { vector, magnitude };
    }

    // Compute Cosine Similarity between vector A and vector B
    calculateCosineSimilarity(vecA, vecB) {
        if (vecA.magnitude === 0 || vecB.magnitude === 0) return 0;

        let dotProduct = 0;
        const smallVec = Object.keys(vecA.vector).length < Object.keys(vecB.vector).length ? vecA.vector : vecB.vector;
        const largeVec = smallVec === vecA.vector ? vecB.vector : vecA.vector;

        for (const term in smallVec) {
            if (largeVec[term]) {
                dotProduct += smallVec[term] * largeVec[term];
            }
        }

        return dotProduct / (vecA.magnitude * vecB.magnitude);
    }

    // Query matcher: returns best match and top candidate suggestions
    findMatches(userQuery, categoryFilter = 'all') {
        const queryTokens = preprocessText(userQuery);
        const queryVec = this.computeTfidfVector(queryTokens);

        const results = this.faqs.map((faq, index) => {
            // Filter out by category if filter selected
            if (categoryFilter !== 'all' && faq.category !== categoryFilter) {
                return { faq, score: -1 };
            }

            const sim = this.calculateCosineSimilarity(queryVec, this.faqVectors[index]);
            return { faq, score: sim };
        }).filter(r => r.score >= 0);

        // Sort descending by similarity score
        results.sort((a, b) => b.score - a.score);

        const bestMatch = results.length > 0 ? results[0] : null;
        const candidates = results.slice(1, 4).filter(r => r.score > 0.1);

        return {
            bestMatch: bestMatch ? bestMatch.faq : null,
            confidence: bestMatch ? bestMatch.score : 0,
            candidates: candidates.map(c => c.faq)
        };
    }
}

/* -------------------------------------------------------------
 * Application State & UI Controller
 * ------------------------------------------------------------- */
let defaultFaqs = [];
let nlpEngine = new NLPEngine();

let state = {
    faqs: [],
    activeCategory: 'all',
    matchThreshold: 0.25, // 25% minimum confidence
    ttsEnabled: true,
    isListening: false,
    recognition: null
};

// DOM Elements Cache
const elements = {
    sidebar: document.getElementById('sidebar'),
    btnOpenSidebar: document.getElementById('btn-open-sidebar'),
    btnCloseSidebar: document.getElementById('btn-close-sidebar'),
    
    categoryPills: document.getElementById('category-pills'),
    quickQuestionsList: document.getElementById('quick-questions-list'),
    
    thresholdSlider: document.getElementById('threshold-slider'),
    thresholdValue: document.getElementById('threshold-value'),
    ttsToggle: document.getElementById('tts-toggle'),
    themeToggle: document.getElementById('theme-toggle'),
    
    chatBody: document.getElementById('chat-body'),
    chatForm: document.getElementById('chat-form'),
    userInput: document.getElementById('user-input'),
    btnSend: document.getElementById('btn-send'),
    btnVoiceInput: document.getElementById('btn-voice-input'),
    btnClearChat: document.getElementById('btn-clear-chat'),
    
    quickSuggestionsBar: document.getElementById('quick-suggestions-bar'),
    suggestionChips: document.getElementById('suggestion-chips'),
    starterSuggestions: document.getElementById('starter-suggestions'),
    
    kbModal: document.getElementById('kb-modal'),
    btnOpenKbModal: document.getElementById('btn-open-kb-modal'),
    btnCloseKbModal: document.getElementById('btn-close-kb-modal'),
    addFaqForm: document.getElementById('add-faq-form'),
    modalFaqList: document.getElementById('modal-faq-list'),
    faqCount: document.getElementById('faq-count'),
    btnResetFaqs: document.getElementById('btn-reset-faqs'),
    
    toastContainer: document.getElementById('toast-container')
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialFAQs();
    initSpeechRecognition();
    setupEventListeners();
    renderQuickQuestions();
    
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Load FAQs from faqs.json or localStorage
async function loadInitialFAQs() {
    try {
        const localData = localStorage.getItem('faqpulse_faqs');
        const response = await fetch('faqs.json');
        defaultFaqs = await response.json();

        if (localData) {
            state.faqs = JSON.parse(localData);
        } else {
            state.faqs = defaultFaqs;
        }

        nlpEngine.indexFAQs(state.faqs);
    } catch (err) {
        console.error('Failed to load FAQs:', err);
        showToast('Error loading dataset', 'error');
    }
}

// Event Listeners Registration
function setupEventListeners() {
    // Mobile Sidebar Toggles
    elements.btnOpenSidebar?.addEventListener('click', () => elements.sidebar.classList.add('open'));
    elements.btnCloseSidebar?.addEventListener('click', () => elements.sidebar.classList.remove('open'));

    // Category Filter Pills
    elements.categoryPills?.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            state.activeCategory = e.target.dataset.category;
            renderQuickQuestions();
            showToast(`Filtered by ${e.target.innerText}`, 'info');
        }
    });

    // Threshold Slider
    elements.thresholdSlider?.addEventListener('input', (e) => {
        const val = e.target.value;
        state.matchThreshold = val / 100;
        elements.thresholdValue.innerText = `${val}%`;
    });

    // Voice & Theme Toggles
    elements.ttsToggle?.addEventListener('change', (e) => {
        state.ttsEnabled = e.target.checked;
        showToast(state.ttsEnabled ? 'Voice responses enabled' : 'Voice responses muted', 'info');
    });

    elements.themeToggle?.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        showToast(`Switched to ${theme} theme`, 'info');
    });

    // Form Submission
    elements.chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserMessage(elements.userInput.value);
    });

    // Voice Input Mic Button
    elements.btnVoiceInput?.addEventListener('click', toggleVoiceDictation);

    // Clear Chat
    elements.btnClearChat?.addEventListener('click', clearChat);

    // Starter & Quick Question Clicks
    elements.starterSuggestions?.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-btn')) {
            const query = e.target.dataset.query;
            handleUserMessage(query);
        }
    });

    elements.quickQuestionsList?.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-q-btn');
        if (btn) {
            handleUserMessage(btn.dataset.query);
        }
    });

    // Modal Manager Controls
    elements.btnOpenKbModal?.addEventListener('click', () => {
        renderModalFAQList();
        elements.kbModal.classList.remove('hidden');
    });

    elements.btnCloseKbModal?.addEventListener('click', () => {
        elements.kbModal.classList.add('hidden');
    });

    elements.addFaqForm?.addEventListener('submit', handleAddFAQ);
    elements.btnResetFaqs?.addEventListener('click', resetFAQsToDefault);
}

/* -------------------------------------------------------------
 * Chat Processing & Message Handling
 * ------------------------------------------------------------- */
function handleUserMessage(messageText) {
    const text = messageText.trim();
    if (!text) return;

    // Append User Message to UI
    appendMessage(text, 'user');
    elements.userInput.value = '';
    hideSuggestionsBar();

    // Show Typing Indicator
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        processQueryAndRespond(text);
    }, 600);
}

function processQueryAndRespond(queryText) {
    const { bestMatch, confidence, candidates } = nlpEngine.findMatches(queryText, state.activeCategory);

    const confidencePct = Math.round(confidence * 100);
    const isHighMatch = confidence >= state.matchThreshold;

    if (isHighMatch && bestMatch) {
        // High Confidence Match Found
        appendBotMessage({
            question: bestMatch.question,
            answer: bestMatch.answer,
            category: bestMatch.category,
            confidence: confidencePct,
            type: 'success'
        });

        if (state.ttsEnabled) {
            speakText(bestMatch.answer);
        }
    } else {
        // Low Confidence Fallback Response
        const fallbackMsg = "I couldn't find an exact match for your question in our knowledge base. Here are the closest questions I found:";
        
        appendBotMessage({
            question: queryText,
            answer: fallbackMsg,
            category: 'Fallback',
            confidence: confidencePct,
            type: 'fallback'
        });

        if (candidates.length > 0) {
            showSuggestionsBar(candidates);
        }

        if (state.ttsEnabled) {
            speakText("I couldn't find an exact match. Please try one of the suggested topics below.");
        }
    }
}

/* -------------------------------------------------------------
 * UI Rendering Helpers
 * ------------------------------------------------------------- */
function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;

    if (sender === 'user') {
        msgDiv.innerHTML = `
            <div class="message-avatar"><i data-lucide="user"></i></div>
            <div class="message-content">
                <div class="message-text">${escapeHtml(text)}</div>
            </div>
        `;
    }

    elements.chatBody.appendChild(msgDiv);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
    
    if (window.lucide) lucide.createIcons();
}

function appendBotMessage({ question, answer, category, confidence, type }) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot-message';

    let badgeClass = 'low';
    if (confidence >= 70) badgeClass = 'high';
    else if (confidence >= 40) badgeClass = 'medium';

    msgDiv.innerHTML = `
        <div class="message-avatar"><i data-lucide="bot"></i></div>
        <div class="message-content">
            <div class="message-header">
                <span class="confidence-badge ${badgeClass}">${confidence}% match • ${category}</span>
                <button class="btn-icon btn-xs speak-btn" title="Listen Answer"><i data-lucide="volume-2"></i></button>
            </div>
            <div class="message-text">${escapeHtml(answer)}</div>
        </div>
    `;

    // Attach TTS listener to speak button inside response card
    msgDiv.querySelector('.speak-btn').addEventListener('click', () => speakText(answer));

    elements.chatBody.appendChild(msgDiv);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;

    if (window.lucide) lucide.createIcons();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator-msg';
    typingDiv.className = 'message bot-message';
    typingDiv.innerHTML = `
        <div class="message-avatar"><i data-lucide="bot"></i></div>
        <div class="message-content">
            <div class="message-text">Analyzing query with TF-IDF... 💬</div>
        </div>
    `;
    elements.chatBody.appendChild(typingDiv);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
    if (window.lucide) lucide.createIcons();
}

function removeTypingIndicator() {
    document.getElementById('typing-indicator-msg')?.remove();
}

function showSuggestionsBar(candidates) {
    elements.suggestionChips.innerHTML = '';
    candidates.forEach(faq => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.innerText = faq.question;
        chip.addEventListener('click', () => handleUserMessage(faq.question));
        elements.suggestionChips.appendChild(chip);
    });
    elements.quickSuggestionsBar.classList.remove('hidden');
}

function hideSuggestionsBar() {
    elements.quickSuggestionsBar.classList.add('hidden');
}

function clearChat() {
    elements.chatBody.innerHTML = '';
    hideSuggestionsBar();
    showToast('Conversation cleared', 'info');
}

function renderQuickQuestions() {
    elements.quickQuestionsList.innerHTML = '';
    const filtered = state.activeCategory === 'all' 
        ? state.faqs.slice(0, 5) 
        : state.faqs.filter(f => f.category === state.activeCategory).slice(0, 5);

    filtered.forEach(faq => {
        const btn = document.createElement('button');
        btn.className = 'quick-q-btn';
        btn.dataset.query = faq.question;
        btn.innerHTML = `
            <span>${escapeHtml(faq.question)}</span>
            <i data-lucide="chevron-right"></i>
        `;
        elements.quickQuestionsList.appendChild(btn);
    });

    if (window.lucide) lucide.createIcons();
}

/* -------------------------------------------------------------
 * Knowledge Base Modal Manager
 * ------------------------------------------------------------- */
function renderModalFAQList() {
    elements.modalFaqList.innerHTML = '';
    elements.faqCount.innerText = state.faqs.length;

    state.faqs.forEach(faq => {
        const card = document.createElement('div');
        card.className = 'faq-item-card';
        card.innerHTML = `
            <div>
                <strong>[${faq.category}]</strong> ${escapeHtml(faq.question)}
            </div>
            <button class="btn btn-danger btn-xs btn-delete-faq" data-id="${faq.id}">Delete</button>
        `;

        card.querySelector('.btn-delete-faq').addEventListener('click', () => deleteFAQ(faq.id));
        elements.modalFaqList.appendChild(card);
    });
}

function handleAddFAQ(e) {
    e.preventDefault();
    const category = document.getElementById('new-faq-category').value;
    const question = document.getElementById('new-faq-question').value.trim();
    const answer = document.getElementById('new-faq-answer').value.trim();
    const tagsRaw = document.getElementById('new-faq-tags').value;

    if (!question || !answer) return;

    const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const newFaq = {
        id: Date.now(),
        category,
        question,
        answer,
        tags
    };

    state.faqs.push(newFaq);
    saveStateAndReindex();
    renderModalFAQList();
    renderQuickQuestions();

    elements.addFaqForm.reset();
    showToast('New FAQ pair added successfully!', 'success');
}

function deleteFAQ(id) {
    state.faqs = state.faqs.filter(f => f.id !== id);
    saveStateAndReindex();
    renderModalFAQList();
    renderQuickQuestions();
    showToast('FAQ removed', 'info');
}

function resetFAQsToDefault() {
    state.faqs = defaultFaqs;
    localStorage.removeItem('faqpulse_faqs');
    nlpEngine.indexFAQs(state.faqs);
    renderModalFAQList();
    renderQuickQuestions();
    showToast('Knowledge Base reset to default!', 'success');
}

function saveStateAndReindex() {
    localStorage.setItem('faqpulse_faqs', JSON.stringify(state.faqs));
    nlpEngine.indexFAQs(state.faqs);
}

/* -------------------------------------------------------------
 * Speech Recognition & Text-to-Speech APIs
 * ------------------------------------------------------------- */
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        elements.btnVoiceInput.style.display = 'none';
        return;
    }

    state.recognition = new SpeechRecognition();
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    state.recognition.lang = 'en-US';

    state.recognition.onstart = () => {
        state.isListening = true;
        elements.btnVoiceInput.classList.add('recording');
        showToast('Listening... Speak now', 'info');
    };

    state.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.userInput.value = transcript;
        handleUserMessage(transcript);
    };

    state.recognition.onend = () => {
        state.isListening = false;
        elements.btnVoiceInput.classList.remove('recording');
    };

    state.recognition.onerror = (e) => {
        state.isListening = false;
        elements.btnVoiceInput.classList.remove('recording');
        showToast(`Voice error: ${e.error}`, 'error');
    };
}

function toggleVoiceDictation() {
    if (!state.recognition) return;

    if (state.isListening) {
        state.recognition.stop();
    } else {
        state.recognition.start();
    }
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Cancel any active audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

/* -------------------------------------------------------------
 * Helper Utilities & Toasts
 * ------------------------------------------------------------- */
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
