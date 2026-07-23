# 🎵 MelodyMind AI - Music Generation with Deep Learning

**MelodyMind AI** is an intelligent AI music generation platform developed with **Attention-Enhanced PyTorch LSTM Neural Networks**, **`music21` MIDI Processing**, and an interactive **Web Audio Synthesizer Studio**. It allows users to train deep learning models on MIDI datasets, compose original melodies and chords with controllable creativity (temperature and nucleus top-p sampling), visualize real-time piano rolls, and export compositions to standard `.mid` MIDI files.

---

## 🚀 Key Features & Capabilities

* **🧠 Deep Learning Attention-Enhanced LSTM Architecture (`AttentionMusicLSTM`)**:
  * **Multi-Head Self-Attention Layer**: Captures long-range musical motifs and harmonic themes across sequence bars.
  * **Residual Skip-Connections & Layer Normalization**: Stabilizes gradient flow and accelerates training convergence.
  * **Advanced Nucleus (Top-P) & Top-K Sampler**: Truncates unlikely/discordant note tails to guarantee harmonious outputs while maintaining creativity ($T \in [0.2, 1.5], \text{top\_p} \in [0.5, 1.0]$).
  * **AdamW Optimizer & Gradient Clipping**: Uses `torch.optim.AdamW` with weight decay, gradient norm clipping (`max_norm=1.0`), and `ReduceLROnPlateau` learning rate scheduling.

* **🎼 MIDI Preprocessing & Sequence Modeling (`music21` & `mido`)**:
  * Parses multi-track MIDI files, extracts single notes and polyphonic chords (e.g. `C4.E4.G4`), constructs integer vocabulary mappings, and builds sliding window sequence arrays ($X, y$).

* **✨ Glassmorphic Web Audio Synthesizer Studio**:
  * **Interactive Synthesizer Keyboard**: 2-octave piano keyboard with live note playback and key illumination.
  * **Real-time Piano Roll Visualizer**: Animated canvas rendering pitch blocks and a vertical scrolling playhead cursor.
  * **Genre Profiles**: Compose across **Classical Piano**, **Jazz Quartet**, **Ambient Lo-Fi**, and **Synthwave Cyberpunk**.
  * **Customizable Parameters**: Adjust Tempo (BPM), Note Sequence Length, Creativity Temperature, and Synthesizer Voices (Grand Piano, Lead Synth, Church Organ, Marimba).
  * **📥 Direct `.mid` File Export**: Built-in binary MIDI file encoder for instant browser download.

---

## 🛠️ Project Structure

```text
CodeAlpha_Music_Generation_with_AI/
├── data/
│   ├── midi/                 # Sample MIDI training datasets (Classical, Jazz, Ambient)
│   ├── create_sample_midis.py# Script to generate sample dataset files
│   └── generated_music.mid   # Generated MIDI file output
├── models/
│   ├── music_lstm.py         # PyTorch AttentionMusicLSTM neural network & Top-P sampler
│   ├── saved_model.pt        # Trained PyTorch model checkpoint
│   └── vocab.json            # Vocabulary mapping & model metadata
├── utils/
│   ├── midi_parser.py        # music21 sequence extractor & vocabulary builder
│   └── midi_builder.py       # Converts pitch token sequences back to .mid files
├── web/
│   ├── index.html            # Web Audio AI Studio dashboard UI
│   ├── style.css             # Glassmorphic dark styling, equalizers & piano roll
│   └── app.js                # Web Audio Synthesizer, Piano Roll renderer & MIDI exporter
├── train.py                  # CLI training pipeline with AdamW, Loss Tracking & Checkpointing
├── generate_music.py         # CLI AI music composition script with Self-Attention & Top-P
├── requirements.txt          # Python dependencies (torch, music21, mido, numpy, scipy)
└── README.md                 # Complete documentation
```

---

## 💻 How to Run Locally on Your System

### Step 1: Download or Clone the Repository
* **Git Clone:**
  ```bash
  git clone https://github.com/Sagar201003/codealpha_tasks.git
  cd codealpha_tasks/CodeAlpha_Music_Generation_with_AI
  ```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

---

## 🎹 Option 1: Launch Interactive Web Audio Studio (Recommended)

1. Navigate to the project directory:
   ```bash
   cd CodeAlpha_Music_Generation_with_AI
   ```
2. Start a local HTTP server:
   ```bash
   npx http-server web -p 8080
   ```
3. Open your browser and visit: `http://localhost:8080`
4. Click **✨ Compose AI Music**, customize tempo/temperature, play synthesized audio, and click **📥 Download .MID**!

---

## 🐍 Option 2: Run Python CLI Model Training & Generator

### 1. Train the Attention-Enhanced LSTM Model:
```bash
python train.py --epochs 30 --batch_size 16
```
*(Saves model weights to `models/saved_model.pt` and vocabulary metadata to `models/vocab.json`)*

### 2. Generate Original Music MIDI File:
```bash
python generate_music.py --num_notes 60 --temperature 0.8 --top_p 0.85 --instrument Piano --output data/generated_music.mid
```

---

## 📄 License & Internship Notes

Developed under the **CodeAlpha Web Development Internship Program** by **Sagar Shukla**.
