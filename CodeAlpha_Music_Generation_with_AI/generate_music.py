import os
import sys
import json
import random
import argparse
import torch

# Ensure UTF-8 output encoding on Windows terminal
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure local imports work
sys.path.append(os.path.dirname(__file__))
from models.music_lstm import MusicLSTM, sample_with_temperature
from utils.midi_builder import create_midi_from_notes


def generate_music_sequence(
    model_path: str = "models/saved_model.pt",
    vocab_path: str = "models/vocab.json",
    num_notes: int = 60,
    temperature: float = 0.8,
    instrument: str = "Piano",
    output_path: str = "data/generated_music.mid"
) -> str:
    """Loads trained model, generates note predictions, and saves to MIDI file."""
    print("=" * 60)
    print("AI Music Generator - Composition Pipeline")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if not os.path.exists(model_path) or not os.path.exists(vocab_path):
        print("Warning: Model checkpoint or vocab JSON not found. Running training step first...")
        from train import train_music_model
        train_music_model(epochs=15)

    with open(vocab_path, "r", encoding="utf-8") as f:
        vocab_data = json.load(f)

    note_to_int = vocab_data["note_to_int"]
    int_to_note = {int(k): v for k, v in vocab_data["int_to_note"].items()}
    vocab_size = vocab_data["vocab_size"]
    seq_length = vocab_data.get("seq_length", 16)

    # Initialize model and load trained parameters
    model = MusicLSTM(vocab_size=vocab_size, embedding_dim=128, hidden_dim=256, num_layers=2, dropout=0.2).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    print(f"Loaded Trained Model: {model_path}")
    print(f"Vocabulary Size: {vocab_size} | Sequence Length: {seq_length}")
    print(f"Generation Settings -> Notes: {num_notes} | Temperature: {temperature} | Instrument: {instrument}")

    # Initialize random seed sequence from vocabulary
    pattern = [random.randint(0, vocab_size - 1) for _ in range(seq_length)]
    prediction_output = []

    print("\nGenerating musical notes...")
    for note_index in range(num_notes):
        input_tensor = torch.tensor([pattern], dtype=torch.long).to(device)
        with torch.no_grad():
            logits, _ = model(input_tensor)
            
        next_idx = sample_with_temperature(logits[0], temperature=temperature)
        result_note = int_to_note[next_idx]
        prediction_output.append(result_note)

        # Shift sequence window for next prediction step
        pattern.append(next_idx)
        pattern = pattern[1:]

    print(f"Generated sequence of {len(prediction_output)} notes/chords.")
    print("Sample generated sequence:", prediction_output[:10], "...")

    # Export generated notes to MIDI file
    saved_file = create_midi_from_notes(prediction_output, output_path, instrument_name=instrument)
    return saved_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate AI Music Sequence to MIDI")
    parser.add_argument("--model_path", type=str, default="models/saved_model.pt", help="Path to trained PyTorch model")
    parser.add_argument("--vocab_path", type=str, default="models/vocab.json", help="Path to vocabulary JSON")
    parser.add_argument("--num_notes", type=int, default=60, help="Number of notes to generate")
    parser.add_argument("--temperature", type=float, default=0.8, help="Creativity temperature (0.1 to 1.5)")
    parser.add_argument("--instrument", type=str, default="Piano", help="Instrument (Piano, Guitar, Organ, Violin, Synthesizer)")
    parser.add_argument("--output", type=str, default="data/generated_music.mid", help="Output MIDI filepath")
    args = parser.parse_args()

    generate_music_sequence(
        model_path=args.model_path,
        vocab_path=args.vocab_path,
        num_notes=args.num_notes,
        temperature=args.temperature,
        instrument=args.instrument,
        output_path=args.output
    )
