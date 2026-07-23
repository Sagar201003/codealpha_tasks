import os
import glob
import json
import numpy as np
from typing import List, Tuple, Dict
try:
    import music21
except ImportError:
    music21 = None


def parse_midi_file(filepath: str) -> List[str]:
    """Parses a single MIDI file into a sequence of pitch/chord strings using music21."""
    notes = []
    if music21 is None:
        raise ImportError("music21 is required for MIDI parsing.")

    try:
        midi = music21.converter.parse(filepath)
        notes_to_parse = None

        # Try getting instruments / parts
        parts = music21.instrument.partitionByInstrument(midi)
        if parts:
            notes_to_parse = parts.parts[0].recurse()
        else:
            notes_to_parse = midi.flat.notes

        for element in notes_to_parse:
            if isinstance(element, music21.note.Note):
                notes.append(str(element.pitch))
            elif isinstance(element, music21.chord.Chord):
                # Format chords as dot-separated pitch names (e.g. 'C4.E4.G4')
                notes.append('.'.join(str(n.pitch) for n in element.notes))
    except Exception as e:
        print(f"Warning: Failed to parse {filepath}: {e}")

    return notes


def load_all_midis(midi_dir: str) -> List[str]:
    """Parses all .mid and .midi files in a directory into a unified note stream."""
    all_notes = []
    midi_files = glob.glob(os.path.join(midi_dir, "*.mid")) + glob.glob(os.path.join(midi_dir, "*.midi"))
    
    if not midi_files:
        print(f"No MIDI files found in {midi_dir}")
        return all_notes

    print(f"Parsing {len(midi_files)} MIDI file(s) from {midi_dir}...")
    for f in midi_files:
        file_notes = parse_midi_file(f)
        all_notes.extend(file_notes)
        print(f"  - {os.path.basename(f)}: extracted {len(file_notes)} notes/chords")

    return all_notes


def prepare_sequences(notes: List[str], sequence_length: int = 32) -> Tuple[np.ndarray, np.ndarray, Dict[str, int], Dict[int, str]]:
    """Constructs sliding window input (X) and target (y) token arrays from notes."""
    pitches = sorted(list(set(notes)))
    vocab_size = len(pitches)

    note_to_int = {note: number for number, note in enumerate(pitches)}
    int_to_note = {number: note for number, note in enumerate(pitches)}

    network_input = []
    network_output = []

    for i in range(0, len(notes) - sequence_length):
        sequence_in = notes[i:i + sequence_length]
        sequence_out = notes[i + sequence_length]

        network_input.append([note_to_int[char] for char in sequence_in])
        network_output.append(note_to_int[sequence_out])

    n_patterns = len(network_input)
    if n_patterns == 0:
        raise ValueError(f"Not enough notes ({len(notes)}) to build sequences of length {sequence_length}.")

    X = np.array(network_input)
    y = np.array(network_output)

    print(f"Processed dataset: {n_patterns} sequence patterns | Vocabulary size: {vocab_size}")
    return X, y, note_to_int, int_to_note


if __name__ == "__main__":
    midi_folder = os.path.join(os.path.dirname(__file__), "..", "data", "midi")
    notes = load_all_midis(midi_folder)
    if notes:
        X, y, note_to_int, int_to_note = prepare_sequences(notes, sequence_length=16)
        print("Sample sequence X[0]:", X[0])
        print("Sample target y[0]:", y[0], "->", int_to_note[y[0]])
