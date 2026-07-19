/* -------------------------------------------------------------
 * LinguaFuse Translation Application Logic (app.js)
 * ------------------------------------------------------------- */

// Supported languages list with ISO codes
const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'sv', name: 'Swedish' },
    { code: 'id', name: 'Indonesian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'el', name: 'Greek' },
    { code: 'he', name: 'Hebrew' },
    { code: 'la', name: 'Latin' },
    { code: 'fa', name: 'Persian' },
    { code: 'th', name: 'Thai' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'no', name: 'Norwegian' },
    { code: 'ro', name: 'Romanian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'uk', name: 'Ukrainian' }
];

// Map 2-character codes to regional BCP-47 locales for Voice/TTS compatibility
function getLangLocale(code) {
    const localeMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        'nl': 'nl-NL',
        'pl': 'pl-PL',
        'tr': 'tr-TR',
        'vi': 'vi-VN',
        'sv': 'sv-SE',
        'id': 'id-ID',
        'bn': 'bn-IN',
        'el': 'el-GR',
        'he': 'he-IL',
        'la': 'la',
        'fa': 'fa-IR',
        'th': 'th-TH',
        'cs': 'cs-CZ',
        'da': 'da-DK',
        'fi': 'fi-FI',
        'hu': 'hu-HU',
        'no': 'no-NO',
        'ro': 'ro-RO',
        'sk': 'sk-SK',
        'uk': 'uk-UA'
    };
    return localeMap[code] || code;
}

// State management
let state = {
    sourceLang: 'auto',
    targetLang: 'es',
    engine: 'mymemory',
    isAutoTranslate: true,
    isListening: false,
    history: [],
    debounceTimeout: null
};

// DOM Selections
const elements = {
    // Sidebar & Preference Toggles
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    themeToggle: document.getElementById('theme-toggle'),
    autoTranslateToggle: document.getElementById('auto-translate-toggle'),
    
    // Engine & Key Inputs
    engineRadios: document.getElementsByName('translation-engine'),
    credentialsCard: document.getElementById('credentials-card'),
    credentialsTitle: document.getElementById('credentials-title'),
    googleKeyGroup: document.getElementById('google-key-group'),
    googleApiKey: document.getElementById('google-api-key'),
    microsoftKeyGroup: document.getElementById('microsoft-key-group'),
    microsoftApiKey: document.getElementById('microsoft-api-key'),
    microsoftRegion: document.getElementById('microsoft-region'),
    btnSaveKeys: document.getElementById('btn-save-keys'),
    activeEngineBadge: document.getElementById('active-engine-badge'),
    
    // Custom Dropdown Selections
    sourceLangBtn: document.getElementById('source-lang-btn'),
    sourceLangDropdown: document.getElementById('source-lang-dropdown'),
    sourceLangSearch: document.getElementById('source-lang-search'),
    sourceLangOptions: document.getElementById('source-lang-options'),
    
    targetLangBtn: document.getElementById('target-lang-btn'),
    targetLangDropdown: document.getElementById('target-lang-dropdown'),
    targetLangSearch: document.getElementById('target-lang-search'),
    targetLangOptions: document.getElementById('target-lang-options'),
    
    // Source Textarea & Footers
    sourceText: document.getElementById('source-text'),
    clearTextBtn: document.getElementById('clear-text-btn'),
    btnVoiceInput: document.getElementById('btn-voice-input'),
    btnSpeakSource: document.getElementById('btn-speak-source'),
    charCounter: document.getElementById('char-counter'),
    micVisualizer: document.getElementById('mic-visualizer'),
    
    // Target Outputs & Footers
    btnSwapLangs: document.getElementById('btn-swap-languages'),
    loadingOverlay: document.getElementById('loading-overlay'),
    translationPlaceholder: document.getElementById('translation-placeholder'),
    translationOutput: document.getElementById('translation-output'),
    btnSpeakTarget: document.getElementById('btn-speak-target'),
    btnCopyTarget: document.getElementById('btn-copy-target'),
    btnShare: document.getElementById('btn-share'),
    
    // Manual action button
    manualTranslatePanel: document.getElementById('manual-translate-panel'),
    btnTranslateManual: document.getElementById('btn-translate-manual'),
    
    // History & Toast Notifications
    clearHistoryBtn: document.getElementById('clear-history'),
    historyList: document.getElementById('history-list'),
    toastContainer: document.getElementById('toast-container')
};

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // 2. Load Local Storage Saved State
    loadSavedState();
    
    // 3. Build Language Dropdowns
    populateLanguageDropdowns();
    
    // 4. Setup Event Listeners
    setupEventListeners();
    
    // 5. Initialize Web Speech Recognition if available
    initSpeechRecognition();
    
    // 6. Initial UI state adjustments
    adjustUIForPreferences();
});

// -------------------------------------------------------------
// State and Settings Persistency
// -------------------------------------------------------------
function loadSavedState() {
    // Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    elements.themeToggle.checked = (savedTheme === 'dark');
    
    // Auto-Translate
    const savedAuto = localStorage.getItem('auto_translate');
    state.isAutoTranslate = savedAuto !== null ? (savedAuto === 'true') : true;
    elements.autoTranslateToggle.checked = state.isAutoTranslate;
    
    // Translation Engine
    const savedEngine = localStorage.getItem('translation_engine') || 'mymemory';
    state.engine = savedEngine;
    for (let radio of elements.engineRadios) {
        if (radio.value === savedEngine) {
            radio.checked = true;
        }
    }
    updateEngineBadge(savedEngine);
    
    // API Keys
    elements.googleApiKey.value = localStorage.getItem('google_translate_key') || '';
    elements.microsoftApiKey.value = localStorage.getItem('microsoft_translate_key') || '';
    elements.microsoftRegion.value = localStorage.getItem('microsoft_region') || '';
    
    // History list
    try {
        state.history = JSON.parse(localStorage.getItem('translation_history')) || [];
        renderHistory();
    } catch (e) {
        state.history = [];
    }
}

function saveStateItem(key, value) {
    localStorage.setItem(key, value);
}

// -------------------------------------------------------------
// Populate Customs Language Selector Dropdowns
// -------------------------------------------------------------
function populateLanguageDropdowns() {
    // Source dropdown options (Includes detect language)
    const sourceLangs = [{ code: 'auto', name: 'Detect Language' }, ...languages];
    renderDropdownOptions(elements.sourceLangOptions, sourceLangs, state.sourceLang, (code, name) => {
        state.sourceLang = code;
        elements.sourceLangBtn.querySelector('.selected-lang-text').innerText = name;
        elements.sourceLangBtn.parentElement.classList.remove('open');
        triggerTranslationIfNeeded();
    });
    
    // Set initial text for source trigger
    const initialSrc = sourceLangs.find(l => l.code === state.sourceLang) || sourceLangs[0];
    elements.sourceLangBtn.querySelector('.selected-lang-text').innerText = initialSrc.name;

    // Target dropdown options (Cannot have detect language)
    renderDropdownOptions(elements.targetLangOptions, languages, state.targetLang, (code, name) => {
        state.targetLang = code;
        elements.targetLangBtn.querySelector('.selected-lang-text').innerText = name;
        elements.targetLangBtn.parentElement.classList.remove('open');
        triggerTranslationIfNeeded();
    });
    
    // Set initial text for target trigger
    const initialTgt = languages.find(l => l.code === state.targetLang) || languages[0];
    elements.targetLangBtn.querySelector('.selected-lang-text').innerText = initialTgt.name;
}

function renderDropdownOptions(ulElement, list, selectedCode, onSelectCallback) {
    ulElement.innerHTML = '';
    list.forEach(lang => {
        const li = document.createElement('li');
        li.dataset.code = lang.code;
        li.dataset.name = lang.name.toLowerCase();
        li.innerText = lang.name;
        
        if (lang.code === selectedCode) {
            li.classList.add('selected');
        }
        
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            // Remove previous selected class
            ulElement.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            onSelectCallback(lang.code, lang.name);
        });
        ulElement.appendChild(li);
    });
}

// Custom selector dropdown filters (search)
function filterDropdownOptions(searchInput, ulElement) {
    const query = searchInput.value.toLowerCase().trim();
    const options = ulElement.querySelectorAll('li');
    
    options.forEach(li => {
        const name = li.dataset.name;
        const code = li.dataset.code.toLowerCase();
        if (name.includes(query) || code.includes(query)) {
            li.style.display = 'flex';
        } else {
            li.style.display = 'none';
        }
    });
}

// -------------------------------------------------------------
// Application Event Handlers
// -------------------------------------------------------------
function setupEventListeners() {
    // Sidebar responsive toggle
    elements.sidebarToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
    });

    // Close sidebar on click outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && 
            !elements.sidebar.contains(e.target) && 
            !elements.sidebarToggle.contains(e.target)) {
            elements.sidebar.classList.remove('open');
        }
    });

    // Theme Switch
    elements.themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        saveStateItem('theme', theme);
        showToast(`Switched to ${theme} mode`, 'success');
    });

    // Auto-Translate Switch
    elements.autoTranslateToggle.addEventListener('change', (e) => {
        state.isAutoTranslate = e.target.checked;
        saveStateItem('auto_translate', state.isAutoTranslate);
        adjustUIForPreferences();
        showToast(state.isAutoTranslate ? 'Auto-translation enabled' : 'Auto-translation disabled', 'success');
    });

    // Engine Radio Buttons Change
    elements.engineRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const engine = e.target.value;
            state.engine = engine;
            saveStateItem('translation_engine', engine);
            updateEngineBadge(engine);
            adjustUIForPreferences();
            showToast(`Switched engine to ${engine === 'mymemory' ? 'MyMemory' : engine === 'google' ? 'Google Translate' : 'Microsoft Translator'}`, 'success');
            
            // Re-translate if text is present
            triggerTranslationIfNeeded();
        });
    });

    // Toggle credentials password visibility
    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<i data-lucide="eye-off"></i>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<i data-lucide="eye"></i>';
            }
            if (window.lucide) {
                lucide.createIcons();
            }
        });
    });

    // Save Credentials Keys
    elements.btnSaveKeys.addEventListener('click', () => {
        const googleKey = elements.googleApiKey.value.trim();
        const msKey = elements.microsoftApiKey.value.trim();
        const msRegion = elements.microsoftRegion.value.trim();
        
        saveStateItem('google_translate_key', googleKey);
        saveStateItem('microsoft_translate_key', msKey);
        saveStateItem('microsoft_region', msRegion);
        
        showToast('API Credentials saved successfully', 'success');
        triggerTranslationIfNeeded();
    });

    // Custom dropdown triggers (single listener per button, includes search reset)
    elements.sourceLangBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.targetLangBtn.parentElement.classList.remove('open');
        elements.sourceLangBtn.parentElement.classList.toggle('open');
        elements.sourceLangSearch.value = '';
        filterDropdownOptions(elements.sourceLangSearch, elements.sourceLangOptions);
        setTimeout(() => elements.sourceLangSearch.focus(), 50);
    });
    
    elements.targetLangBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.sourceLangBtn.parentElement.classList.remove('open');
        elements.targetLangBtn.parentElement.classList.toggle('open');
        elements.targetLangSearch.value = '';
        filterDropdownOptions(elements.targetLangSearch, elements.targetLangOptions);
        setTimeout(() => elements.targetLangSearch.focus(), 50);
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        elements.sourceLangBtn.parentElement.classList.remove('open');
        elements.targetLangBtn.parentElement.classList.remove('open');
    });

    // Prevent clicks inside dropdown from bubbling up and closing it
    document.getElementById('source-lang-dropdown').addEventListener('click', (e) => e.stopPropagation());
    document.getElementById('target-lang-dropdown').addEventListener('click', (e) => e.stopPropagation());

    // Search filters in custom selects
    elements.sourceLangSearch.addEventListener('input', () => {
        filterDropdownOptions(elements.sourceLangSearch, elements.sourceLangOptions);
    });
    elements.targetLangSearch.addEventListener('input', () => {
        filterDropdownOptions(elements.targetLangSearch, elements.targetLangOptions);
    });

    // Text area inputs & debouncing
    elements.sourceText.addEventListener('input', (e) => {
        const text = e.target.value;
        const length = text.length;
        
        // Counter
        elements.charCounter.innerText = `${length} / 2000`;
        
        // Show/hide clear button
        if (length > 0) {
            elements.clearTextBtn.classList.remove('hidden');
        } else {
            elements.clearTextBtn.classList.add('hidden');
            clearTranslationOutput();
        }

        // Debounce translating
        if (state.isAutoTranslate && length > 0) {
            clearTimeout(state.debounceTimeout);
            state.debounceTimeout = setTimeout(() => {
                translate();
            }, 800);
        }
    });

    // Clear Text button
    elements.clearTextBtn.addEventListener('click', () => {
        elements.sourceText.value = '';
        elements.charCounter.innerText = '0 / 2000';
        elements.clearTextBtn.classList.add('hidden');
        clearTranslationOutput();
        
        // Cancel speech synthesis if playing
        window.speechSynthesis.cancel();
    });

    // Swap Languages button
    elements.btnSwapLangs.addEventListener('click', () => {
        // Can't swap if source is "Detect Language" (auto)
        if (state.sourceLang === 'auto') {
            showToast('Cannot swap with "Detect Language" active.', 'error');
            return;
        }

        // Add visual rotating class
        elements.btnSwapLangs.classList.add('rotated');
        setTimeout(() => elements.btnSwapLangs.classList.remove('rotated'), 300);

        // Swap codes
        const tempLang = state.sourceLang;
        state.sourceLang = state.targetLang;
        state.targetLang = tempLang;

        // Swap texts if translation exists
        const tempText = elements.sourceText.value;
        const hasTranslation = !elements.translationOutput.classList.contains('hidden');
        const translatedText = elements.translationOutput.innerText;

        if (tempText && hasTranslation && translatedText) {
            elements.sourceText.value = translatedText;
            elements.charCounter.innerText = `${translatedText.length} / 2000`;
            elements.clearTextBtn.classList.remove('hidden');
        }

        // Refresh dropdown active selections
        populateLanguageDropdowns();

        // Perform translation
        triggerTranslationIfNeeded();
    });

    // Manual Translate button click
    elements.btnTranslateManual.addEventListener('click', () => {
        translate();
    });

    // Speech synthesis for source text
    elements.btnSpeakSource.addEventListener('click', () => {
        const text = elements.sourceText.value.trim();
        if (!text) return;
        
        // If "auto" language, we check if speech synthesis supports autodetection (usually not, default to English)
        const langCode = state.sourceLang === 'auto' ? 'en' : state.sourceLang;
        speakText(text, langCode);
    });

    // Speech synthesis for target text
    elements.btnSpeakTarget.addEventListener('click', () => {
        const text = elements.translationOutput.innerText.trim();
        if (!text) return;
        speakText(text, state.targetLang);
    });

    // Copy Translation Clipboard
    elements.btnCopyTarget.addEventListener('click', () => {
        const text = elements.translationOutput.innerText.trim();
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
            // Change button visual temporarily
            const icon = elements.btnCopyTarget.querySelector('i');
            icon.setAttribute('data-lucide', 'check');
            elements.btnCopyTarget.classList.add('success-accent');
            if (window.lucide) lucide.createIcons();
            
            setTimeout(() => {
                icon.setAttribute('data-lucide', 'copy');
                elements.btnCopyTarget.classList.remove('success-accent');
                if (window.lucide) lucide.createIcons();
            }, 2000);
        }).catch(err => {
            showToast('Failed to copy text', 'error');
        });
    });

    // Share button handler
    elements.btnShare.addEventListener('click', () => {
        const text = elements.translationOutput.innerText.trim();
        if (!text) return;

        if (navigator.share) {
            navigator.share({
                title: 'Translation from LinguaFuse',
                text: text
            }).then(() => {
                showToast('Shared successfully!', 'success');
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    showToast('Sharing failed', 'error');
                }
            });
        } else {
            // Fallback: Copy link
            const dummyUrl = window.location.href;
            navigator.clipboard.writeText(dummyUrl).then(() => {
                showToast('Web Share not supported. Site URL copied instead.', 'success');
            });
        }
    });

    // Clear history
    elements.clearHistoryBtn.addEventListener('click', () => {
        if (state.history.length === 0) return;
        
        state.history = [];
        saveStateItem('translation_history', JSON.stringify([]));
        renderHistory();
        showToast('History cleared', 'success');
    });
}

// -------------------------------------------------------------
// Dynamic UI updates based on configurations
// -------------------------------------------------------------
function adjustUIForPreferences() {
    // 1. Credentials panel toggle
    if (state.engine === 'mymemory') {
        elements.credentialsCard.classList.add('hidden');
    } else {
        elements.credentialsCard.classList.remove('hidden');
        if (state.engine === 'google') {
            elements.credentialsTitle.innerText = 'Google Cloud API Config';
            elements.googleKeyGroup.classList.remove('hidden');
            elements.microsoftKeyGroup.classList.add('hidden');
        } else if (state.engine === 'microsoft') {
            elements.credentialsTitle.innerText = 'Microsoft Translator Config';
            elements.googleKeyGroup.classList.add('hidden');
            elements.microsoftKeyGroup.classList.remove('hidden');
        }
    }

    // 2. Manual translate button panel toggle
    if (state.isAutoTranslate) {
        elements.manualTranslatePanel.classList.add('hidden');
    } else {
        elements.manualTranslatePanel.classList.remove('hidden');
    }
}

function updateEngineBadge(engine) {
    let name = 'MyMemory Engine';
    if (engine === 'google') name = 'Google Translate';
    if (engine === 'microsoft') name = 'Microsoft Translator';
    elements.activeEngineBadge.innerText = name;
}

function clearTranslationOutput() {
    elements.translationOutput.innerText = '';
    elements.translationOutput.classList.add('hidden');
    elements.translationPlaceholder.classList.remove('hidden');
    
    // Disable target action buttons
    elements.btnSpeakTarget.disabled = true;
    elements.btnSpeakTarget.classList.add('disabled');
    elements.btnCopyTarget.disabled = true;
    elements.btnCopyTarget.classList.add('disabled');
    elements.btnShare.disabled = true;
    elements.btnShare.classList.add('disabled');
}

function triggerTranslationIfNeeded() {
    const text = elements.sourceText.value.trim();
    if (text) {
        if (state.isAutoTranslate) {
            translate();
        }
    }
}

// -------------------------------------------------------------
// Voice Typing (Speech-to-Text)
// -------------------------------------------------------------
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        // Disable mic button if speech recognition is not supported
        elements.btnVoiceInput.disabled = true;
        elements.btnVoiceInput.classList.add('disabled');
        elements.btnVoiceInput.title = 'Voice Input not supported in this browser';
        return;
    }

    state.speechRecognition = new SpeechRecognition();
    state.speechRecognition.continuous = false;
    state.speechRecognition.interimResults = false;
    
    state.speechRecognition.onstart = () => {
        state.isListening = true;
        elements.btnVoiceInput.classList.add('listening');
        elements.micVisualizer.classList.remove('hidden');
    };

    state.speechRecognition.onend = () => {
        state.isListening = false;
        elements.btnVoiceInput.classList.remove('listening');
        elements.micVisualizer.classList.add('hidden');
    };

    state.speechRecognition.onerror = (event) => {
        console.error('Speech Recognition Error: ', event.error);
        if (event.error === 'not-allowed') {
            showToast('Microphone access blocked. Enable permissions in settings.', 'error');
        } else {
            showToast(`Voice Input error: ${event.error}`, 'error');
        }
        state.isListening = false;
        elements.btnVoiceInput.classList.remove('listening');
        elements.micVisualizer.classList.add('hidden');
    };

    state.speechRecognition.onresult = (event) => {
        const textResult = event.results[0][0].transcript;
        
        // Append text
        const currentValue = elements.sourceText.value;
        const spacing = currentValue.length > 0 && !currentValue.endsWith(' ') ? ' ' : '';
        elements.sourceText.value = currentValue + spacing + textResult;
        
        // Update counts
        elements.charCounter.innerText = `${elements.sourceText.value.length} / 2000`;
        elements.clearTextBtn.classList.remove('hidden');
        
        // Trigger translation
        if (state.isAutoTranslate) {
            translate();
        }
    };

    // Click handler for microphone button
    elements.btnVoiceInput.addEventListener('click', () => {
        if (state.isListening) {
            state.speechRecognition.stop();
        } else {
            // Set recognition language
            const locale = state.sourceLang === 'auto' ? 'en-US' : getLangLocale(state.sourceLang);
            state.speechRecognition.lang = locale;
            
            try {
                state.speechRecognition.start();
            } catch (err) {
                console.error(err);
            }
        }
    });
}

// -------------------------------------------------------------
// Read Aloud (Text-to-Speech)
// -------------------------------------------------------------
function speakText(text, langCode) {
    if (!window.speechSynthesis) {
        showToast('Text-to-Speech not supported in this browser.', 'error');
        return;
    }

    // Cancel current speaking
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangLocale(langCode);
    
    utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        showToast('Speech playback failed', 'error');
    };
    
    window.speechSynthesis.speak(utterance);
}

// -------------------------------------------------------------
// Translation Service
// -------------------------------------------------------------
async function translate() {
    const text = elements.sourceText.value.trim();
    if (!text) {
        clearTranslationOutput();
        return;
    }

    // Check character length
    if (text.length > 2000) {
        showToast('Text exceeds the maximum length of 2000 characters.', 'error');
        return;
    }

    // Show loading spinner
    elements.loadingOverlay.classList.remove('hidden');
    elements.translationOutput.classList.add('hidden');

    try {
        let resultText = '';
        
        if (state.engine === 'mymemory') {
            resultText = await translateWithMyMemory(text, state.sourceLang, state.targetLang);
        } else if (state.engine === 'google') {
            resultText = await translateWithGoogle(text, state.sourceLang, state.targetLang);
        } else if (state.engine === 'microsoft') {
            resultText = await translateWithMicrosoft(text, state.sourceLang, state.targetLang);
        }

        // Display results
        if (resultText) {
            elements.translationOutput.innerText = resultText;
            elements.translationPlaceholder.classList.add('hidden');
            elements.translationOutput.classList.remove('hidden');
            
            // Enable footer options
            elements.btnSpeakTarget.disabled = false;
            elements.btnSpeakTarget.classList.remove('disabled');
            elements.btnCopyTarget.disabled = false;
            elements.btnCopyTarget.classList.remove('disabled');
            elements.btnShare.disabled = false;
            elements.btnShare.classList.remove('disabled');

            // Add translation to history
            addToHistory(text, resultText, state.sourceLang, state.targetLang);
        } else {
            throw new Error('Received empty response from translation API.');
        }

    } catch (error) {
        console.error('Translation error details:', error);
        showToast(error.message || 'Translation failed. Please try again.', 'error');
        
        // Show placeholder and hide translation container
        elements.translationPlaceholder.classList.remove('hidden');
        elements.translationOutput.classList.add('hidden');
    } finally {
        // Hide loading spinner
        elements.loadingOverlay.classList.add('hidden');
    }
}

// --- Engine 1: MyMemory API ---
// MyMemory does NOT support 'auto' as a source language code.
// When the user selects "Detect Language", we default to English.
async function translateWithMyMemory(text, from, to) {
    const effectiveFrom = (from === 'auto') ? 'en' : from;
    const langpair = `${effectiveFrom}|${to}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`MyMemory API HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.responseStatus === 200) {
        return data.responseData.translatedText;
    } else {
        throw new Error(data.responseDetails || 'MyMemory translation rejected.');
    }
}

// --- Engine 2: Google Cloud Translation API ---
async function translateWithGoogle(text, from, to) {
    const apiKey = localStorage.getItem('google_translate_key');
    if (!apiKey) {
        throw new Error('Google Cloud Translation API key is missing. Add it in the settings panel.');
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    // Google v2 uses target and source parameters. We don't send source if 'auto'.
    const body = {
        q: [text],
        target: to
    };
    if (from !== 'auto') {
        body.source = from;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `Google API HTTP error: ${response.status}`;
        throw new Error(msg);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
}

// --- Engine 3: Microsoft Translator API ---
async function translateWithMicrosoft(text, from, to) {
    const key = localStorage.getItem('microsoft_translate_key');
    if (!key) {
        throw new Error('Microsoft Subscription Key is missing. Add it in the settings panel.');
    }
    
    const region = localStorage.getItem('microsoft_region') || '';
    
    // Setup URL query params
    let url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${to}`;
    if (from !== 'auto') {
        url += `&from=${from}`;
    }

    const headers = {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/json'
    };
    
    if (region) {
        headers['Ocp-Apim-Subscription-Region'] = region;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify([{ 'Text': text }])
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `Microsoft API HTTP error: ${response.status}`;
        throw new Error(msg);
    }

    const data = await response.json();
    return data[0].translations[0].text;
}

// -------------------------------------------------------------
// History Management
// -------------------------------------------------------------
function addToHistory(originalText, translatedText, from, to) {
    // Max size of history log is 15 items
    const maxHistoryItems = 15;
    
    // Don't log if identical text & language pair is already the latest item
    if (state.history.length > 0) {
        const latest = state.history[0];
        if (latest.originalText === originalText && 
            latest.translatedText === translatedText && 
            latest.from === from && 
            latest.to === to) {
            return;
        }
    }

    // Clean duplicate entry anywhere in history
    state.history = state.history.filter(item => 
        !(item.originalText === originalText && item.from === from && item.to === to)
    );

    const newItem = {
        id: Date.now().toString(),
        originalText,
        translatedText,
        from,
        to,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.history.unshift(newItem);

    if (state.history.length > maxHistoryItems) {
        state.history.pop();
    }

    saveStateItem('translation_history', JSON.stringify(state.history));
    renderHistory();
}

function renderHistory() {
    elements.historyList.innerHTML = '';
    
    if (state.history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="history-empty">
                <i data-lucide="history"></i>
                <p>No translations yet</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    state.history.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        
        // Find language names
        const fromLang = item.from === 'auto' ? 'Auto' : (languages.find(l => l.code === item.from)?.name || item.from);
        const toLang = languages.find(l => l.code === item.to)?.name || item.to;

        itemDiv.innerHTML = `
            <div class="history-item-langs">
                <span>${fromLang}</span>
                <i data-lucide="arrow-right"></i>
                <span>${toLang}</span>
            </div>
            <div class="history-item-text">${escapeHtml(item.originalText)}</div>
            <div class="history-item-translation">${escapeHtml(item.translatedText)}</div>
            <button class="btn-delete-history" data-id="${item.id}" title="Remove item">
                <i data-lucide="x"></i>
            </button>
        `;

        // Click to restore
        itemDiv.addEventListener('click', (e) => {
            // If delete button clicked, ignore
            if (e.target.closest('.btn-delete-history')) return;

            elements.sourceText.value = item.originalText;
            elements.charCounter.innerText = `${item.originalText.length} / 2000`;
            elements.clearTextBtn.classList.remove('hidden');
            
            state.sourceLang = item.from;
            state.targetLang = item.to;
            
            // Rebuild selects names
            populateLanguageDropdowns();
            
            // Perform translation
            translate();
        });

        // Click to delete
        const btnDelete = itemDiv.querySelector('.btn-delete-history');
        btnDelete.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHistoryItem(item.id);
        });

        elements.historyList.appendChild(itemDiv);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

function deleteHistoryItem(id) {
    state.history = state.history.filter(item => item.id !== id);
    saveStateItem('translation_history', JSON.stringify(state.history));
    renderHistory();
    showToast('Item removed from history', 'success');
}

// -------------------------------------------------------------
// Toast Messages Widget
// -------------------------------------------------------------
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);
    
    if (window.lucide) {
        lucide.createIcons();
    }

    // Auto dismiss after 3 seconds
    setTimeout(() => {
        toast.classList.add('slide-out');
        // Use transitionend (CSS uses transition, not animation for slide-out)
        // with a setTimeout fallback in case the event doesn't fire
        const removeToast = () => toast.remove();
        toast.addEventListener('transitionend', removeToast, { once: true });
        setTimeout(removeToast, 500); // fallback
    }, 3000);
}

// -------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
