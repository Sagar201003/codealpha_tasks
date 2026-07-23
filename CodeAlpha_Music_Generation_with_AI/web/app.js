/**
 * MelodyMind AI - Web Audio Synthesizer, Piano Roll & AI Music Generation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Object
    const state = {
        isPlaying: false,
        playbackTimer: null,
        currentNoteIndex: 0,
        generatedSequence: [],
        audioCtx: null,
        tempo: 120,
        temperature: 0.8,
        genre: 'classical',
        instrument: 'piano',
        sequenceLength: 48,
        trackCount: 1
    };

    // DOM Elements
    const elements = {
        genreSelect: document.getElementById('genre-select'),
        tempSlider: document.getElementById('temp-slider'),
        tempValue: document.getElementById('temp-value'),
        instrumentSelect: document.getElementById('instrument-select'),
        lengthSlider: document.getElementById('length-slider'),
        lengthValue: document.getElementById('length-value'),
        tempoSlider: document.getElementById('tempo-slider'),
        tempoValue: document.getElementById('tempo-value'),
        btnGenerate: document.getElementById('btn-generate'),
        btnPlay: document.getElementById('btn-play'),
        btnStop: document.getElementById('btn-stop'),
        btnDownloadMidi: document.getElementById('btn-download-midi'),
        btnToggleTheme: document.getElementById('btn-toggle-theme'),
        pianoKeyboard: document.getElementById('piano-keyboard'),
        pianoRollCanvas: document.getElementById('piano-roll-canvas'),
        visualizerOverlay: document.getElementById('visualizer-overlay'),
        playbackProgress: document.getElementById('playback-progress'),
        currentTrackTitle: document.getElementById('current-track-title'),
        currentTrackMeta: document.getElementById('current-track-meta'),
        equalizer: document.getElementById('equalizer')
    };

    // Pitch Mappings (MIDI Numbers)
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const KEYBOARD_KEYS = [
        { note: 'C4', pitch: 60, type: 'white' },
        { note: 'C#4', pitch: 61, type: 'black' },
        { note: 'D4', pitch: 62, type: 'white' },
        { note: 'D#4', pitch: 63, type: 'black' },
        { note: 'E4', pitch: 64, type: 'white' },
        { note: 'F4', pitch: 65, type: 'white' },
        { note: 'F#4', pitch: 66, type: 'black' },
        { note: 'G4', pitch: 67, type: 'white' },
        { note: 'G#4', pitch: 68, type: 'black' },
        { note: 'A4', pitch: 69, type: 'white' },
        { note: 'A#4', pitch: 70, type: 'black' },
        { note: 'B4', pitch: 71, type: 'white' },
        { note: 'C5', pitch: 72, type: 'white' },
        { note: 'C#5', pitch: 73, type: 'black' },
        { note: 'D5', pitch: 74, type: 'white' },
        { note: 'D#5', pitch: 75, type: 'black' },
        { note: 'E5', pitch: 76, type: 'white' }
    ];

    // Initialize Web Audio Context
    function getAudioContext() {
        if (!state.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            state.audioCtx = new AudioContextClass();
        }
        if (state.audioCtx.state === 'suspended') {
            state.audioCtx.resume();
        }
        return state.audioCtx;
    }

    // Convert MIDI pitch to frequency (Hz)
    function midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    // Play Synthesized Note Audio
    function playAudioNote(midiPitch, durationSeconds = 0.4, type = 'piano') {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            const freq = midiToFreq(midiPitch);
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Instrument Oscillator Waveform Selection
            if (type === 'synth') {
                osc.type = 'sawtooth';
            } else if (type === 'organ') {
                osc.type = 'square';
            } else if (type === 'marimba') {
                osc.type = 'triangle';
            } else {
                osc.type = 'sine';
            }

            // ADSR Envelope
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05); // Attack
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds); // Decay

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + durationSeconds);
        } catch (e) {
            console.error('Audio playback error:', e);
        }
    }

    // Render Keyboard UI
    function renderKeyboard() {
        elements.pianoKeyboard.innerHTML = '';
        KEYBOARD_KEYS.forEach((keyData) => {
            const keyEl = document.createElement('div');
            keyEl.className = `piano-key ${keyData.type}`;
            keyEl.dataset.pitch = keyData.pitch;
            keyEl.dataset.note = keyData.note;

            keyEl.addEventListener('mousedown', () => {
                keyEl.classList.add('active');
                playAudioNote(keyData.pitch, 0.5, state.instrument);
            });

            keyEl.addEventListener('mouseup', () => keyEl.classList.remove('active'));
            keyEl.addEventListener('mouseleave', () => keyEl.classList.remove('active'));

            elements.pianoKeyboard.appendChild(keyEl);
        });
    }

    // Genre Neural Pattern Composition Generators
    const GENRE_PROFILES = {
        classical: {
            pitches: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79], // C Major / A Minor
            chords: [[60, 64, 67], [62, 65, 69], [65, 69, 72], [67, 71, 74]],
            scaleName: 'C Major Classical'
        },
        jazz: {
            pitches: [60, 62, 63, 65, 67, 69, 70, 72, 74, 75], // C Dorian / Jazz Blues
            chords: [[62, 65, 69, 72], [59, 62, 65, 67], [60, 64, 67, 71], [57, 61, 64, 67]],
            scaleName: 'Jazz 7th & Swing'
        },
        ambient: {
            pitches: [57, 60, 64, 67, 69, 72, 76, 79], // Pentatonic Pad
            chords: [[57, 64, 69], [60, 67, 72], [53, 60, 65]],
            scaleName: 'Ambient Pentatonic'
        },
        synthwave: {
            pitches: [48, 51, 53, 55, 58, 60, 63, 65, 67, 70, 72], // Minor Cyber
            chords: [[48, 55, 60], [44, 51, 56], [46, 53, 58]],
            scaleName: 'Cyber Minor Arp'
        }
    };

    // AI Sequence Generator Algorithm
    function generateAIComposition() {
        const profile = GENRE_PROFILES[state.genre] || GENRE_PROFILES.classical;
        const notes = [];
        const length = state.sequenceLength;
        const temp = state.temperature;

        let currentPitch = profile.pitches[Math.floor(Math.random() * profile.pitches.length)];

        for (let i = 0; i < length; i++) {
            // Chance of chord insertion (higher for classical/jazz)
            if (Math.random() < 0.25) {
                const chordPitches = profile.chords[Math.floor(Math.random() * profile.chords.length)];
                notes.push({
                    type: 'chord',
                    pitches: chordPitches,
                    pitchStr: chordPitches.join('.'),
                    duration: 1
                });
            } else {
                // Next pitch selection with temperature variance
                const step = (Math.random() - 0.5) * 6 * temp;
                let nextIdx = Math.round(profile.pitches.indexOf(currentPitch) + step);
                nextIdx = Math.max(0, Math.min(profile.pitches.length - 1, nextIdx));
                
                currentPitch = profile.pitches[nextIdx];
                notes.push({
                    type: 'note',
                    pitch: currentPitch,
                    pitchStr: currentPitch.toString(),
                    duration: 1
                });
            }
        }

        state.generatedSequence = notes;
        state.trackCount++;
        
        // Update UI info
        elements.currentTrackTitle.innerText = `AI Composition #${state.trackCount} (${state.genre.toUpperCase()})`;
        elements.currentTrackMeta.innerText = `${profile.scaleName} • ${notes.length} Notes • ${state.tempo} BPM`;
        elements.visualizerOverlay.classList.add('hidden');

        renderPianoRoll();
    }

    // Render Piano Roll Canvas
    function renderPianoRoll() {
        const canvas = elements.pianoRollCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const totalNotes = state.generatedSequence.length || 48;
        const noteWidth = width / totalNotes;

        for (let i = 0; i <= totalNotes; i++) {
            ctx.beginPath();
            ctx.moveTo(i * noteWidth, 0);
            ctx.lineTo(i * noteWidth, height);
            ctx.stroke();
        }

        if (state.generatedSequence.length === 0) return;

        // Find pitch range for Y scaling
        let minPitch = 127;
        let maxPitch = 0;

        state.generatedSequence.forEach(n => {
            const pList = n.type === 'chord' ? n.pitches : [n.pitch];
            pList.forEach(p => {
                if (p < minPitch) minPitch = p;
                if (p > maxPitch) maxPitch = p;
            });
        });

        const minP = Math.max(36, minPitch - 2);
        const maxP = Math.min(96, maxPitch + 2);
        const pitchRange = Math.max(12, maxP - minP);
        const rowHeight = height / pitchRange;

        // Draw note blocks
        state.generatedSequence.forEach((n, idx) => {
            const x = idx * noteWidth;
            const pList = n.type === 'chord' ? n.pitches : [n.pitch];

            pList.forEach(p => {
                const y = height - ((p - minP) * rowHeight) - rowHeight;
                
                // Color gradient based on index & type
                if (n.type === 'chord') {
                    ctx.fillStyle = '#ec4899';
                } else if (idx === state.currentNoteIndex && state.isPlaying) {
                    ctx.fillStyle = '#10b981';
                } else {
                    ctx.fillStyle = '#06b6d4';
                }

                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 8;
                ctx.fillRect(x + 2, y + 1, noteWidth - 4, Math.max(rowHeight - 2, 4));
                ctx.shadowBlur = 0;
            });
        });

        // Draw playhead vertical cursor
        if (state.isPlaying && state.generatedSequence.length > 0) {
            const playheadX = state.currentNoteIndex * noteWidth;
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(playheadX, 0);
            ctx.lineTo(playheadX, height);
            ctx.stroke();
        }
    }

    // Playback Engine
    function startPlayback() {
        if (state.generatedSequence.length === 0) {
            generateAIComposition();
        }

        getAudioContext();
        state.isPlaying = true;
        elements.equalizer.classList.remove('paused');
        elements.btnPlay.innerHTML = '<span>⏸</span>';

        const stepMs = (60 / state.tempo) * 1000 * 0.5; // Eighth note timing

        function playStep() {
            if (!state.isPlaying) return;

            if (state.currentNoteIndex >= state.generatedSequence.length) {
                stopPlayback();
                return;
            }

            const item = state.generatedSequence[state.currentNoteIndex];
            if (item.type === 'chord') {
                item.pitches.forEach(p => playAudioNote(p, 0.4, state.instrument));
            } else {
                playAudioNote(item.pitch, 0.4, state.instrument);
                
                // Highlight matching keyboard key
                const keyEl = elements.pianoKeyboard.querySelector(`[data-pitch="${item.pitch}"]`);
                if (keyEl) {
                    keyEl.classList.add('active');
                    setTimeout(() => keyEl.classList.remove('active'), 250);
                }
            }

            // Update Progress Bar
            const progress = ((state.currentNoteIndex + 1) / state.generatedSequence.length) * 100;
            elements.playbackProgress.style.width = `${progress}%`;

            renderPianoRoll();
            state.currentNoteIndex++;
            state.playbackTimer = setTimeout(playStep, stepMs);
        }

        playStep();
    }

    function stopPlayback() {
        state.isPlaying = false;
        clearTimeout(state.playbackTimer);
        state.currentNoteIndex = 0;
        elements.equalizer.classList.add('paused');
        elements.btnPlay.innerHTML = '<span>▶</span>';
        elements.playbackProgress.style.width = '0%';
        renderPianoRoll();
    }

    // Binary Standard MIDI File (.mid) Generator
    function generateBinaryMidiBlob() {
        if (state.generatedSequence.length === 0) return null;

        const header = [
            0x4D, 0x54, 0x68, 0x64, // 'MThd'
            0x00, 0x00, 0x00, 0x06, // Header length (6 bytes)
            0x00, 0x00,             // Format 0
            0x00, 0x01,             // 1 track
            0x00, 0x60              // 96 ticks per quarter note
        ];

        const trackData = [];
        
        // Track Name Meta Event
        trackData.push(0x00, 0xFF, 0x03, 0x0A, ...Array.from('MelodyMind').map(c => c.charCodeAt(0)));
        // Set Tempo Meta Event (120 BPM = 500,000 us/beat)
        trackData.push(0x00, 0xFF, 0x51, 0x03, 0x07, 0xA1, 0x20);

        // Convert sequence items into MIDI Note On / Note Off events
        state.generatedSequence.forEach(item => {
            const pitches = item.type === 'chord' ? item.pitches : [item.pitch];
            
            // Note ON
            pitches.forEach(p => {
                trackData.push(0x00, 0x90, p & 0x7F, 0x50);
            });

            // Note OFF (duration step = 48 ticks)
            pitches.forEach((p, idx) => {
                const delta = idx === 0 ? 0x30 : 0x00;
                trackData.push(delta, 0x80, p & 0x7F, 0x00);
            });
        });

        // End of Track Meta Event
        trackData.push(0x00, 0xFF, 0x2F, 0x00);

        const trackHeader = [
            0x4D, 0x54, 0x72, 0x6B, // 'MTrk'
            (trackData.length >> 24) & 0xFF,
            (trackData.length >> 16) & 0xFF,
            (trackData.length >> 8) & 0xFF,
            trackData.length & 0xFF
        ];

        const fullMidiBytes = new Uint8Array([...header, ...trackHeader, ...trackData]);
        return new Blob([fullMidiBytes], { type: 'audio/midi' });
    }

    function downloadMidiFile() {
        if (state.generatedSequence.length === 0) {
            generateAIComposition();
        }

        const blob = generateBinaryMidiBlob();
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_composition_${state.genre}_${Date.now()}.mid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Setup Event Listeners
    function setupEventListeners() {
        elements.tempSlider.addEventListener('input', (e) => {
            state.temperature = parseFloat(e.target.value);
            elements.tempValue.innerText = state.temperature.toFixed(1);
        });

        elements.lengthSlider.addEventListener('input', (e) => {
            state.sequenceLength = parseInt(e.target.value, 10);
            elements.lengthValue.innerText = state.sequenceLength;
        });

        elements.tempoSlider.addEventListener('input', (e) => {
            state.tempo = parseInt(e.target.value, 10);
            elements.tempoValue.innerText = state.tempo;
        });

        elements.genreSelect.addEventListener('change', (e) => {
            state.genre = e.target.value;
        });

        elements.instrumentSelect.addEventListener('change', (e) => {
            state.instrument = e.target.value;
        });

        elements.btnGenerate.addEventListener('click', () => {
            stopPlayback();
            generateAIComposition();
        });

        elements.btnPlay.addEventListener('click', () => {
            if (state.isPlaying) {
                stopPlayback();
            } else {
                startPlayback();
            }
        });

        elements.btnStop.addEventListener('click', stopPlayback);
        elements.btnDownloadMidi.addEventListener('click', downloadMidiFile);

        elements.btnToggleTheme.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            document.body.classList.toggle('dark-theme');
            renderPianoRoll();
        });
    }

    // Initialize App
    renderKeyboard();
    setupEventListeners();
    elements.equalizer.classList.add('paused');
    renderPianoRoll();
});
