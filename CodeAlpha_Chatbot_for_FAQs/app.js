/* -------------------------------------------------------------
 * FAQ Pulse Chatbot Logic & Client-Side NLP Engine (app.js)
 * Includes Sentiment Engine, Autocomplete Typeahead, Analytics,
 * Response Feedback System, and Transcript/JSON Export/Import
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

// Sentiment Lexicons
const FRUSTRATION_KEYWORDS = new Set(['crash', 'crashed', 'bug', 'freeze', 'broken', 'error', 'worst', 'frustrated', 'annoyed', 'terrible', 'slow', 'fail', 'failed', 'issue', 'problem', 'stuck']);
const POSITIVE_KEYWORDS = new Set(['great', 'awesome', 'thanks', 'thank', 'good', 'excellent', 'helpful', 'love', 'perfect', 'amazing']);

// Basic Suffix Stemmer
function stemWord(word) {
    if (word.length <= 3) return word;
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    if (word.endsWith('ly')) return word.slice(0, -2);
    return word;
}

// Synonym Dictionary for NLP Matching
const SYNONYMS = {
    'buy': ['purchase', 'checkout', 'pay', 'order', 'upgrade'],
    'purchase': ['buy', 'checkout', 'pay', 'order', 'upgrade'],
    'billing': ['cost', 'price', 'payment', 'fee', 'invoice', 'charge'],
    'price': ['cost', 'billing', 'payment', 'fee', 'charge'],
    'cost': ['price', 'billing', 'payment', 'fee', 'charge'],
    'charge': ['price', 'billing', 'payment', 'fee', 'cost'],
    'payment': ['billing', 'cost', 'price', 'charge', 'pay'],
    'pay': ['payment', 'billing', 'cost', 'price', 'charge'],
    'refund': ['return', 'exchange', 'money-back'],
    'return': ['refund', 'exchange'],
    'track': ['status', 'where', 'delivery', 'shipping'],
    'delivery': ['shipping', 'track', 'status'],
    'shipping': ['delivery', 'track', 'status'],
    'password': ['login', 'signin', 'credentials', 'reset'],
    'login': ['password', 'signin', 'credentials'],
    'specs': ['requirements', 'compatibility', 'system', 'specifications'],
    'requirements': ['specs', 'compatibility', 'system', 'specifications'],
    'crash': ['freeze', 'bug', 'error', 'broken'],
    'freeze': ['crash', 'bug', 'error', 'broken'],
    'bug': ['crash', 'freeze', 'error', 'broken'],
    'error': ['crash', 'freeze', 'bug', 'broken'],
    'human': ['agent', 'support', 'contact', 'call', 'phone', 'email', 'person'],
    'agent': ['human', 'support', 'contact', 'call', 'phone', 'email', 'person'],
    'contact': ['human', 'agent', 'support', 'call', 'phone', 'email', 'person']
};

// Tokenize & Clean Text
function preprocessText(text) {
    if (!text) return [];
    const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    const rawTokens = cleaned.split(/\s+/).filter(t => t.length > 0);
    const tokens = rawTokens
        .filter(token => !STOP_WORDS.has(token))
        .map(token => stemWord(token));

    // Synonym Expansion
    const expanded = [...tokens];
    tokens.forEach(t => {
        if (SYNONYMS[t]) {
            SYNONYMS[t].forEach(syn => {
                const stemmedSyn = stemWord(syn);
                if (!expanded.includes(stemmedSyn)) {
                    expanded.push(stemmedSyn);
                }
            });
        }
    });
    return expanded;
}

// Sentiment Detector
function detectSentiment(text) {
    const tokens = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
    let frustCount = 0;
    let posCount = 0;

    tokens.forEach(t => {
        if (FRUSTRATION_KEYWORDS.has(t)) frustCount++;
        if (POSITIVE_KEYWORDS.has(t)) posCount++;
    });

    if (frustCount > 0) return 'frustrated';
    if (posCount > 0) return 'positive';
    return 'neutral';
}

/* -------------------------------------------------------------
 * NLP Vector Space Model (TF-IDF & Cosine Similarity Calculator)
 * ------------------------------------------------------------- */
class NLPEngine {
    constructor() {
        this.faqs = [];
        this.vocabulary = new Set();
        this.documents = [];
        this.idfMap = new Map();
        this.faqVectors = [];
    }

    indexFAQs(faqs) {
        this.faqs = faqs;
        this.vocabulary.clear();
        this.documents = [];
        this.idfMap.clear();

        this.documents = faqs.map(faq => {
            const questionTokens = preprocessText(faq.question);
            const tagTokens = preprocessText((faq.tags || []).join(' '));
            const categoryTokens = preprocessText(faq.category || '');
            const combined = [...questionTokens, ...questionTokens, ...tagTokens, ...categoryTokens];
            combined.forEach(token => this.vocabulary.add(token));
            return combined;
        });

        const totalDocs = this.documents.length;
        this.vocabulary.forEach(term => {
            const docCount = this.documents.filter(doc => doc.includes(term)).length;
            const idf = Math.log(1 + (totalDocs / (1 + docCount))) + 1;
            this.idfMap.set(term, idf);
        });

        this.faqVectors = this.documents.map(doc => this.computeTfidfVector(doc));
    }

    computeTfidfVector(tokens) {
        if (tokens.length === 0) return { vector: {}, magnitude: 0 };

        const termCounts = {};
        tokens.forEach(t => termCounts[t] = (termCounts[t] || 0) + 1);

        const vector = {};
        let sumSquares = 0;

        for (const term in termCounts) {
            if (this.idfMap.has(term)) {
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

    findMatches(userQuery, categoryFilter = 'all') {
        const queryTokens = preprocessText(userQuery);
        const queryVec = this.computeTfidfVector(queryTokens);

        const results = this.faqs.map((faq, index) => {
            if (categoryFilter !== 'all' && faq.category !== categoryFilter) {
                return { faq, score: -1 };
            }

            const sim = this.calculateCosineSimilarity(queryVec, this.faqVectors[index]);
            return { faq, score: sim };
        }).filter(r => r.score >= 0);

        results.sort((a, b) => b.score - a.score);

        const bestMatch = results.length > 0 ? results[0] : null;
        const candidates = results.slice(1, 4).map(r => r.faq);
        const fallbackCandidates = candidates.length > 0 ? candidates : this.faqs.slice(0, 3);

        return {
            bestMatch: bestMatch ? bestMatch.faq : null,
            confidence: bestMatch ? bestMatch.score : 0,
            candidates: fallbackCandidates
        };
    }

    // Typeahead Prefix & Match Search
    getAutocompleteSuggestions(query, limit = 4) {
        if (!query || query.length < 2) return [];
        const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);

        return this.faqs.filter(faq => {
            const questionLower = faq.question.toLowerCase();
            const tagsLower = (faq.tags || []).map(t => t.toLowerCase());

            return queryTokens.every(token => {
                const inQuestion = questionLower.includes(token);
                const inTags = tagsLower.some(t => t.includes(token));
                
                let inSynonyms = false;
                if (SYNONYMS[token]) {
                    inSynonyms = SYNONYMS[token].some(syn => 
                        questionLower.includes(syn) || tagsLower.some(t => t.includes(syn))
                    );
                }

                return inQuestion || inTags || inSynonyms;
            });
        }).slice(0, limit);
    }
}

/* -------------------------------------------------------------
 * Application State & UI Controller
 * ------------------------------------------------------------- */
let defaultFaqs = [];
let nlpEngine = new NLPEngine();

// Persona Settings and Dialect Configurations
const PERSONAS = {
    professional: {
        avatar: '<i data-lucide="briefcase"></i>',
        name: 'Professional Assistant',
        greet: 'Hello. I am the FAQ Support Assistant. How may I professionally address your inquiries today?',
        greetings: [
            'Understood. Let me clarify that for you:',
            'Certainly. Here is the official documentation:',
            'I can assist with that. Please refer to the details below:'
        ],
        fallback: 'I apologize, but I am unable to locate a precise matching document for your request in our archives. Please review the suggested records:'
    },
    friendly: {
        avatar: '<i data-lucide="bot"></i>',
        name: 'Friendly Buddy',
        greet: 'Hey there! 😊 Welcome to FAQ Pulse. How can I help you out today?',
        greetings: [
            'Sure thing! Here is what you need to know:',
            'I got you covered! Check this out:',
            'No problem! Let me explain that for you:'
        ],
        fallback: 'Oh, sorry about that! I couldn\'t find an exact answer for you. Maybe one of these questions is what you meant?'
    },
    geeky: {
        avatar: '<i data-lucide="cpu"></i>',
        name: 'Tech Geek',
        greet: 'FAQ Engine initialized. 🤖 Vector Search Space loaded. Awaiting input query...',
        greetings: [
            'Match found! Index parameters mapped. Output stream:',
            'Parsing matching database node. Data packets retrieved:',
            'Query vector successfully projected. Resolution details:'
        ],
        fallback: 'Error 404: Match confidence below precision threshold. Querying nearest neighbor centroids:'
    },
    pirate: {
        avatar: '<i data-lucide="anchor"></i>',
        name: 'Pirate Bot',
        greet: 'Ahoy, matey! 🏴‍☠️ Welcome aboard FAQ Pulse! What treasures of knowledge be ye seeking?',
        greetings: [
            'Arrr! Here be the answers ye seek, landlubber:',
            'Ahoy! Cast yer eyes on this fine loot of information:',
            'By Blackbeard\'s ghost, here be the charts ye need:'
        ],
        fallback: 'Shiver me timbers! I couldn\'t track down that map. Try chartin\' one of these routes, matey:'
    }
};

let state = {
    faqs: [],
    activeCategory: 'all',
    matchThreshold: 0.25,
    ttsEnabled: true,
    isListening: false,
    recognition: null,
    persona: 'friendly',
    
    // Analytics & Ratings
    analytics: {
        totalQueries: 0,
        totalConfidenceSum: 0,
        upvotes: 0,
        downvotes: 0,
        categoryCounts: {}
    },
    
    // Chat Transcript History Log
    chatTranscript: []
};

// Autocomplete Keyboard Navigation State
let autocompleteState = {
    activeIndex: -1,
    items: []
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
    autocompleteDropdown: document.getElementById('autocomplete-dropdown'),
    btnSend: document.getElementById('btn-send'),
    btnVoiceInput: document.getElementById('btn-voice-input'),
    btnClearChat: document.getElementById('btn-clear-chat'),
    btnExportChat: document.getElementById('btn-export-chat'),
    btnOpenAnalytics: document.getElementById('btn-open-analytics'),
    btnSidebarAnalytics: document.getElementById('btn-sidebar-analytics'),
    sentimentBadge: document.getElementById('sentiment-badge'),
    personaSelector: document.getElementById('persona-selector'),
    
    starterSuggestions: document.getElementById('starter-suggestions'),
    
    // KB Modal
    kbModal: document.getElementById('kb-modal'),
    btnOpenKbModal: document.getElementById('btn-open-kb-modal'),
    btnCloseKbModal: document.getElementById('btn-close-kb-modal'),
    addFaqForm: document.getElementById('add-faq-form'),
    modalFaqList: document.getElementById('modal-faq-list'),
    faqCount: document.getElementById('faq-count'),
    btnResetFaqs: document.getElementById('btn-reset-faqs'),
    btnExportKb: document.getElementById('btn-export-kb'),
    btnTriggerImportKb: document.getElementById('btn-trigger-import-kb'),
    inputImportKb: document.getElementById('input-import-kb'),
    
    // Analytics Modal
    analyticsModal: document.getElementById('analytics-modal'),
    btnCloseAnalyticsModal: document.getElementById('btn-close-analytics-modal'),
    statTotalQueries: document.getElementById('stat-total-queries'),
    statAvgConfidence: document.getElementById('stat-avg-confidence'),
    statSatisfaction: document.getElementById('stat-satisfaction'),
    statTopCategory: document.getElementById('stat-top-category'),
    statRatingBar: document.getElementById('stat-rating-bar'),
    statUpvotesCount: document.getElementById('stat-upvotes-count'),
    statDownvotesCount: document.getElementById('stat-downvotes-count'),
    
    // FAQ Directory Modal
    btnOpenDirectoryModal: document.getElementById('btn-open-directory-modal'),
    directoryModal: document.getElementById('directory-modal'),
    btnCloseDirectoryModal: document.getElementById('btn-close-directory-modal'),
    directorySearchInput: document.getElementById('directory-search-input'),
    directoryAccordionContainer: document.getElementById('directory-accordion-container'),

    toastContainer: document.getElementById('toast-container')
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    loadAnalyticsState();
    await loadInitialFAQs();
    initSpeechRecognition();
    setupEventListeners();
    renderQuickQuestions();

    // Initialize Persona
    const savedPersona = localStorage.getItem('faqpulse_persona') || 'friendly';
    state.persona = savedPersona;
    if (elements.personaSelector) {
        elements.personaSelector.value = savedPersona;
        const personaConfig = PERSONAS[savedPersona] || PERSONAS.friendly;
        const botTitleEl = document.getElementById('current-bot-title');
        if (botTitleEl) botTitleEl.innerText = personaConfig.name;
        const iconDiv = document.getElementById('bot-avatar-icon');
        if (iconDiv) iconDiv.innerHTML = personaConfig.avatar;
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Load Analytics & Ratings from localStorage
function loadAnalyticsState() {
    const saved = localStorage.getItem('faqpulse_analytics');
    if (saved) {
        try {
            state.analytics = JSON.parse(saved);
        } catch (e) {
            console.error('Analytics load error:', e);
        }
    }
}

function saveAnalyticsState() {
    localStorage.setItem('faqpulse_analytics', JSON.stringify(state.analytics));
}

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
        const pill = e.target.closest('.pill-chip');
        if (pill) {
            document.querySelectorAll('.category-pills .pill-chip').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeCategory = pill.dataset.category;
            renderQuickQuestions();
            showToast(`Filtered by ${pill.innerText.trim()}`, 'info');
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
        showToast(state.ttsEnabled ? 'Voice playback enabled' : 'Voice playback muted', 'info');
    });

    elements.themeToggle?.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        showToast(`Switched to ${theme} theme`, 'info');
    });

    // Autocomplete Typeahead Input Event
    elements.userInput?.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        renderAutocomplete(query);
    });

    // Autocomplete Keyboard Navigation
    elements.userInput?.addEventListener('keydown', (e) => {
        const dropdown = elements.autocompleteDropdown;
        if (dropdown.classList.contains('hidden')) return;

        const items = dropdown.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            autocompleteState.activeIndex = (autocompleteState.activeIndex + 1) % items.length;
            updateAutocompleteSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            autocompleteState.activeIndex = (autocompleteState.activeIndex - 1 + items.length) % items.length;
            updateAutocompleteSelection(items);
        } else if (e.key === 'Enter' && autocompleteState.activeIndex >= 0) {
            e.preventDefault();
            const selectedQ = autocompleteState.items[autocompleteState.activeIndex].question;
            elements.userInput.value = selectedQ;
            dropdown.classList.add('hidden');
            handleUserMessage(selectedQ);
        } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
        }
    });

    // Close Autocomplete on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.workspace-input-area')) {
            elements.autocompleteDropdown.classList.add('hidden');
        }
    });

    // Close modals on Esc press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            elements.kbModal.classList.add('hidden');
            elements.analyticsModal.classList.add('hidden');
            elements.directoryModal.classList.add('hidden');
            elements.autocompleteDropdown.classList.add('hidden');
        }
    });

    // Form Submission
    elements.chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        elements.autocompleteDropdown.classList.add('hidden');
        handleUserMessage(elements.userInput.value);
    });

    // Voice Input Mic Button
    elements.btnVoiceInput?.addEventListener('click', toggleVoiceDictation);

    // Clear & Export Chat
    elements.btnClearChat?.addEventListener('click', clearChat);
    elements.btnExportChat?.addEventListener('click', exportChatTranscript);

    // Analytics Modal Triggers
    elements.btnOpenAnalytics?.addEventListener('click', openAnalyticsModal);
    elements.btnSidebarAnalytics?.addEventListener('click', openAnalyticsModal);
    elements.btnCloseAnalyticsModal?.addEventListener('click', () => elements.analyticsModal.classList.add('hidden'));

    // FAQ Directory Modal Triggers
    elements.btnOpenDirectoryModal?.addEventListener('click', openDirectoryModal);
    elements.btnCloseDirectoryModal?.addEventListener('click', () => elements.directoryModal.classList.add('hidden'));
    elements.directorySearchInput?.addEventListener('input', (e) => {
        renderDirectoryAccordions(e.target.value.trim());
    });

    // Persona Selector Change
    elements.personaSelector?.addEventListener('change', (e) => {
        state.persona = e.target.value;
        localStorage.setItem('faqpulse_persona', state.persona);
        
        const personaConfig = PERSONAS[state.persona] || PERSONAS.friendly;
        const botTitleEl = document.getElementById('current-bot-title');
        if (botTitleEl) botTitleEl.innerText = personaConfig.name;
        
        const iconDiv = document.getElementById('bot-avatar-icon');
        if (iconDiv) iconDiv.innerHTML = personaConfig.avatar;
        
        appendBotMessage({
            id: Date.now(),
            question: 'Persona Switch',
            answer: personaConfig.greet,
            category: 'System',
            confidence: 100,
            candidates: []
        });
        
        if (state.ttsEnabled) speakText(personaConfig.greet);
        showToast(`Persona changed to ${personaConfig.name}`, 'success');
    });

    // Starter & Quick Question Clicks
    elements.starterSuggestions?.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-btn');
        if (btn) {
            handleUserMessage(btn.dataset.query);
        }
    });

    elements.quickQuestionsList?.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-item-btn');
        if (btn) {
            handleUserMessage(btn.dataset.query);
        }
    });

    // Modal KB Manager Controls
    elements.btnOpenKbModal?.addEventListener('click', () => {
        renderModalFAQList();
        elements.kbModal.classList.remove('hidden');
    });

    elements.btnCloseKbModal?.addEventListener('click', () => {
        elements.kbModal.classList.add('hidden');
    });

    elements.addFaqForm?.addEventListener('submit', handleAddFAQ);
    elements.btnResetFaqs?.addEventListener('click', resetFAQsToDefault);
    elements.btnExportKb?.addEventListener('click', exportKnowledgeBaseJSON);
    elements.btnTriggerImportKb?.addEventListener('click', () => elements.inputImportKb.click());
    elements.inputImportKb?.addEventListener('change', importKnowledgeBaseJSON);
}

/* -------------------------------------------------------------
 * Typeahead Autocomplete Dropdown Renderer
 * ------------------------------------------------------------- */
function renderAutocomplete(query) {
    const suggestions = nlpEngine.getAutocompleteSuggestions(query);
    if (suggestions.length === 0) {
        elements.autocompleteDropdown.classList.add('hidden');
        autocompleteState.activeIndex = -1;
        autocompleteState.items = [];
        return;
    }

    autocompleteState.items = suggestions;
    autocompleteState.activeIndex = -1;

    elements.autocompleteDropdown.innerHTML = suggestions.map((faq, idx) => `
        <div class="autocomplete-item" data-query="${escapeHtml(faq.question)}" data-index="${idx}">
            <span>${escapeHtml(faq.question)}</span>
            <span class="autocomplete-category">${escapeHtml(faq.category)}</span>
        </div>
    `).join('');

    elements.autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const selectedQ = item.dataset.query;
            elements.userInput.value = selectedQ;
            elements.autocompleteDropdown.classList.add('hidden');
            handleUserMessage(selectedQ);
        });
    });

    elements.autocompleteDropdown.classList.remove('hidden');
}

/* -------------------------------------------------------------
 * Chat Processing & Message Handling
 * ------------------------------------------------------------- */
function handleUserMessage(messageText) {
    const text = messageText.trim();
    if (!text) return;

    // Detect Sentiment & update badge
    const sentiment = detectSentiment(text);
    updateSentimentBadge(sentiment);

    // Append User Message
    appendUserMessage(text);
    elements.userInput.value = '';

    // Log to Transcript
    state.chatTranscript.push({ sender: 'User', text, timestamp: new Date().toLocaleTimeString() });

    // Show Typing Indicator
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        processQueryAndRespond(text, sentiment);
    }, 500);
}

function updateSentimentBadge(sentiment) {
    elements.sentimentBadge.className = `sentiment-pill ${sentiment}`;
    if (sentiment === 'frustrated') {
        elements.sentimentBadge.innerHTML = '<i data-lucide="frown"></i> Frustrated';
    } else if (sentiment === 'positive') {
        elements.sentimentBadge.innerHTML = '<i data-lucide="smile"></i> Happy';
    } else {
        elements.sentimentBadge.innerHTML = '<i data-lucide="meh"></i> Neutral';
    }
    if (window.lucide) lucide.createIcons();
}

function processQueryAndRespond(queryText, sentiment) {
    const { bestMatch, confidence, candidates } = nlpEngine.findMatches(queryText, state.activeCategory);

    const confidencePct = Math.round(confidence * 100);
    const isHighMatch = confidence >= state.matchThreshold;

    // Track Analytics Stats
    state.analytics.totalQueries++;
    state.analytics.totalConfidenceSum += confidencePct;

    let botAnswerText = '';
    let category = 'General';

    const personaConfig = PERSONAS[state.persona] || PERSONAS.friendly;

    if (isHighMatch && bestMatch) {
        botAnswerText = bestMatch.answer;
        category = bestMatch.category;

        const randomGreeting = personaConfig.greetings[Math.floor(Math.random() * personaConfig.greetings.length)];
        let prefix = randomGreeting;
        if (sentiment === 'frustrated') {
            prefix = (state.persona === 'pirate') ? "Avast! Sorry to hear ye be in stormy waters! Let me help:" : `I'm sorry you are experiencing trouble! Let help you right away:`;
        }
        botAnswerText = `${prefix}\n\n${botAnswerText}`;

        appendBotMessage({
            id: Date.now(),
            question: bestMatch.question,
            answer: botAnswerText,
            category: category,
            confidence: confidencePct,
            candidates: []
        });

        if (state.ttsEnabled) speakText(bestMatch.answer);
    } else {
        botAnswerText = personaConfig.fallback;
        category = 'Fallback Assistance';

        appendBotMessage({
            id: Date.now(),
            question: queryText,
            answer: botAnswerText,
            category: category,
            confidence: confidencePct,
            candidates: candidates
        });

        if (state.ttsEnabled) speakText(botAnswerText);
    }

    // Category Count tracking
    state.analytics.categoryCounts[category] = (state.analytics.categoryCounts[category] || 0) + 1;
    saveAnalyticsState();

    // Log to Transcript
    state.chatTranscript.push({ sender: 'Bot', text: botAnswerText, confidence: `${confidencePct}%`, timestamp: new Date().toLocaleTimeString() });
}

/* -------------------------------------------------------------
 * UI Rendering Helpers (with Feedback & Copy Buttons)
 * ------------------------------------------------------------- */
function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message-card user-card';
    msgDiv.innerHTML = `
        <div class="card-avatar"><i data-lucide="user"></i></div>
        <div class="card-bubble">
            <div class="bubble-text">${escapeHtml(text)}</div>
        </div>
    `;

    elements.chatBody.appendChild(msgDiv);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
    
    if (window.lucide) lucide.createIcons();
}

function appendBotMessage({ id, question, answer, category, confidence, candidates = [] }) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message-card bot-card';

    let badgeClass = 'low';
    if (confidence >= 70) badgeClass = 'high';
    else if (confidence >= 40) badgeClass = 'medium';

    let candidatesHtml = '';
    if (candidates && candidates.length > 0) {
        const chipsList = candidates.map(faq => `
            <button class="candidate-chip-btn" data-query="${escapeHtml(faq.question)}">
                <span>${escapeHtml(faq.question)}</span>
                <i data-lucide="arrow-right"></i>
            </button>
        `).join('');

        candidatesHtml = `
            <div class="fallback-candidates-box">
                <div class="fallback-title"><i data-lucide="help-circle"></i> Suggested Questions:</div>
                <div class="candidate-chips">${chipsList}</div>
            </div>
        `;
    }

    msgDiv.innerHTML = `
        <div class="card-avatar"><i data-lucide="bot"></i></div>
        <div class="card-bubble">
            <div class="bubble-meta">
                <span class="confidence-badge ${badgeClass}">${confidence}% match • ${category}</span>
                <div class="bubble-actions">
                    <button class="feedback-btn upvote-btn" title="Helpful answer"><i data-lucide="thumbs-up"></i></button>
                    <button class="feedback-btn downvote-btn" title="Unhelpful answer"><i data-lucide="thumbs-down"></i></button>
                    <button class="feedback-btn copy-btn" title="Copy answer text"><i data-lucide="copy"></i></button>
                    <button class="feedback-btn speak-btn" title="Listen Answer"><i data-lucide="volume-2"></i></button>
                </div>
            </div>
            <div class="bubble-text">${parseMarkdown(answer)}</div>
            ${candidatesHtml}
        </div>
    `;

    // Candidate Chips Click Event
    msgDiv.querySelectorAll('.candidate-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => handleUserMessage(btn.dataset.query));
    });

    // Feedback Rating Events
    const upBtn = msgDiv.querySelector('.upvote-btn');
    const downBtn = msgDiv.querySelector('.downvote-btn');

    upBtn.addEventListener('click', () => {
        if (!upBtn.classList.contains('active')) {
            upBtn.classList.add('active');
            downBtn.classList.remove('active');
            state.analytics.upvotes++;
            saveAnalyticsState();
            showToast('Feedback saved: Helpful 👍', 'success');
        }
    });

    downBtn.addEventListener('click', () => {
        if (!downBtn.classList.contains('active')) {
            downBtn.classList.add('active');
            upBtn.classList.remove('active');
            state.analytics.downvotes++;
            saveAnalyticsState();
            showToast('Feedback saved: Unhelpful 👎', 'info');
        }
    });

    // Copy to Clipboard Event
    msgDiv.querySelector('.copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(answer).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy text', 'error');
        });
    });

    // TTS Speaker Event
    msgDiv.querySelector('.speak-btn').addEventListener('click', () => speakText(answer));

    elements.chatBody.appendChild(msgDiv);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;

    if (window.lucide) lucide.createIcons();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator-msg';
    typingDiv.className = 'message-card bot-card';
    typingDiv.innerHTML = `
        <div class="card-avatar"><i data-lucide="bot"></i></div>
        <div class="card-bubble">
            <div class="bubble-text">Searching FAQs with TF-IDF Vector Math... 💬</div>
        </div>
    `;
    elements.chatBody.appendChild(typingDiv);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
    if (window.lucide) lucide.createIcons();
}

function removeTypingIndicator() {
    document.getElementById('typing-indicator-msg')?.remove();
}

function clearChat() {
    elements.chatBody.innerHTML = '';
    state.chatTranscript = [];
    showToast('Conversation cleared', 'info');
}

function renderQuickQuestions() {
    elements.quickQuestionsList.innerHTML = '';
    const filtered = state.activeCategory === 'all' 
        ? state.faqs.slice(0, 5) 
        : state.faqs.filter(f => f.category === state.activeCategory).slice(0, 5);

    filtered.forEach(faq => {
        const btn = document.createElement('button');
        btn.className = 'quick-item-btn';
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
 * Export & Import System (Transcript & KB JSON)
 * ------------------------------------------------------------- */
function exportChatTranscript() {
    if (state.chatTranscript.length === 0) {
        showToast('No conversation to export!', 'error');
        return;
    }

    let textContent = `FAQ Pulse Chat Transcript - Exported on ${new Date().toLocaleString()}\n`;
    textContent += `=`.repeat(65) + `\n\n`;

    state.chatTranscript.forEach(item => {
        if (item.sender === 'User') {
            textContent += `[${item.timestamp}] USER: ${item.text}\n`;
        } else {
            textContent += `[${item.timestamp}] BOT (${item.confidence || 'N/A'}): ${item.text}\n\n`;
        }
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faq_chat_transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat transcript exported!', 'success');
}

function exportKnowledgeBaseJSON() {
    const dataStr = JSON.stringify(state.faqs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faq_knowledge_base_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Knowledge Base exported to JSON!', 'success');
}

function importKnowledgeBaseJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedFaqs = JSON.parse(event.target.result);
            if (Array.isArray(importedFaqs) && importedFaqs.length > 0) {
                state.faqs = importedFaqs;
                saveStateAndReindex();
                renderModalFAQList();
                renderQuickQuestions();
                showToast(`Successfully imported ${importedFaqs.length} FAQ entries!`, 'success');
            } else {
                showToast('Invalid FAQ JSON format', 'error');
            }
        } catch (err) {
            showToast('JSON Parse Error', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

/* -------------------------------------------------------------
 * Analytics Dashboard Modal Manager
 * ------------------------------------------------------------- */
function openAnalyticsModal() {
    const total = state.analytics.totalQueries;
    const avgConf = total > 0 ? Math.round(state.analytics.totalConfidenceSum / total) : 0;
    
    const up = state.analytics.upvotes;
    const down = state.analytics.downvotes;
    const totalVotes = up + down;
    const satPct = totalVotes > 0 ? Math.round((up / totalVotes) * 100) : 100;

    // Find Top Category
    let topCat = 'N/A';
    let maxCount = 0;
    for (const cat in state.analytics.categoryCounts) {
        if (state.analytics.categoryCounts[cat] > maxCount) {
            maxCount = state.analytics.categoryCounts[cat];
            topCat = cat;
        }
    }

    elements.statTotalQueries.innerText = total;
    elements.statAvgConfidence.innerText = `${avgConf}%`;
    elements.statSatisfaction.innerText = `${satPct}%`;
    elements.statTopCategory.innerText = topCat;

    elements.statRatingBar.style.width = `${satPct}%`;
    elements.statUpvotesCount.innerText = `👍 ${up} Helpful`;
    elements.statDownvotesCount.innerText = `👎 ${down} Unhelpful`;

    elements.analyticsModal.classList.remove('hidden');
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
        card.className = 'faq-card-item';
        card.innerHTML = `
            <div>
                <strong>[${faq.category}]</strong> ${escapeHtml(faq.question)}
            </div>
            <button class="btn btn-ghost-danger btn-xs btn-delete-faq" data-id="${faq.id}">Delete</button>
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
        showToast('Listening... Speak your question', 'info');
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

    window.speechSynthesis.cancel();
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

/* -------------------------------------------------------------
 * Phase 2 Advanced Upgrade Helper Functions
 * ------------------------------------------------------------- */

// Simple Markdown Parser (Escapes raw HTML, parses **bold**, [link](url), and lists)
function parseMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Links: [label](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Lists: newline followed by - or *
    const lines = html.split('\n');
    let inList = false;
    let resultLines = [];
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) {
                resultLines.push('<ul>');
                inList = true;
            }
            resultLines.push(`<li>${trimmed.slice(2)}</li>`);
        } else {
            if (inList) {
                resultLines.push('</ul>');
                inList = false;
            }
            resultLines.push(line);
        }
    });
    
    if (inList) {
        resultLines.push('</ul>');
    }
    
    return resultLines.join('\n');
}

// Update Keyboard Navigation Autocomplete Active Selection
function updateAutocompleteSelection(items) {
    items.forEach((item, idx) => {
        if (idx === autocompleteState.activeIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// Open FAQ Directory Modal
function openDirectoryModal() {
    elements.directorySearchInput.value = '';
    renderDirectoryAccordions();
    elements.directoryModal.classList.remove('hidden');
}

// Render Accordions in FAQ Directory
function renderDirectoryAccordions(searchTerm = '') {
    const container = elements.directoryAccordionContainer;
    container.innerHTML = '';

    const categories = ['E-Commerce', 'SaaS & Account', 'Technical Support', 'HR & General'];
    const lowerSearch = searchTerm.toLowerCase();

    categories.forEach(cat => {
        let faqsInCat = state.faqs.filter(f => f.category === cat);
        
        if (lowerSearch) {
            faqsInCat = faqsInCat.filter(f => 
                f.question.toLowerCase().includes(lowerSearch) || 
                f.answer.toLowerCase().includes(lowerSearch) ||
                (f.tags || []).some(t => t.toLowerCase().includes(lowerSearch))
            );
        }

        if (faqsInCat.length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'accordion-category-group';
        
        const groupTitle = document.createElement('div');
        groupTitle.className = 'accordion-category-title';
        
        let iconName = 'layers';
        if (cat === 'E-Commerce') iconName = 'shopping-bag';
        else if (cat === 'SaaS & Account') iconName = 'user-check';
        else if (cat === 'Technical Support') iconName = 'wrench';
        else if (cat === 'HR & General') iconName = 'building';

        groupTitle.innerHTML = `<i data-lucide="${iconName}"></i> <span>${cat}</span>`;
        groupDiv.appendChild(groupTitle);

        faqsInCat.forEach(faq => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'accordion-item';

            const headerBtn = document.createElement('button');
            headerBtn.className = 'accordion-header';
            headerBtn.innerHTML = `
                <span>${escapeHtml(faq.question)}</span>
                <i data-lucide="chevron-down"></i>
            `;

            const bodyDiv = document.createElement('div');
            bodyDiv.className = 'accordion-body bubble-text';
            bodyDiv.innerHTML = parseMarkdown(faq.answer);

            headerBtn.addEventListener('click', () => {
                const isActive = itemDiv.classList.contains('active');
                container.querySelectorAll('.accordion-item').forEach(item => item.classList.remove('active'));
                
                if (!isActive) {
                    itemDiv.classList.add('active');
                }
            });

            itemDiv.appendChild(headerBtn);
            itemDiv.appendChild(bodyDiv);
            groupDiv.appendChild(itemDiv);
        });

        container.appendChild(groupDiv);
    });

    if (container.children.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No matching FAQs found.</div>';
    }

    if (window.lucide) lucide.createIcons();
}
