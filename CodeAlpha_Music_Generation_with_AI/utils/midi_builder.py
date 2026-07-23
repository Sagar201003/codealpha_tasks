import os
from typing import List
try:
    import music21
except ImportError:
    music21 = None


def create_midi_from_notes(prediction_output: List[str], output_filepath: str, instrument_name: str = "Piano") -> str:
    """Converts a sequence of pitch/chord strings into a MIDI file using music21."""
    if music21 is None:
        raise ImportError("music21 is required for MIDI creation.")

    offset = 0
    output_notes = []

    # Choose instrument safely
    try:
        instrument_map = {
            "Piano": music21.instrument.Piano(),
            "Guitar": music21.instrument.Guitar(),
            "Organ": music21.instrument.Organ(),
            "Violin": music21.instrument.Violin(),
            "Synthesizer": music21.instrument.ElectricPiano()
        }
        inst = instrument_map.get(instrument_name, music21.instrument.Piano())
    except Exception:
        inst = music21.instrument.Piano()

    output_notes.append(inst)

    for pattern in prediction_output:
        # Check if pattern is a chord (contains dot e.g. 'C4.E4.G4' or pitch numbers)
        if ('.' in pattern) or pattern.isdigit():
            notes_in_chord = pattern.split('.')
            chord_notes = []
            for current_note in notes_in_chord:
                try:
                    if current_note.isdigit():
                        new_note = music21.note.Note(int(current_note))
                    else:
                        new_note = music21.note.Note(current_note)
                    new_note.storedInstrument = inst
                    chord_notes.append(new_note)
                except Exception:
                    pass
            if chord_notes:
                new_chord = music21.chord.Chord(chord_notes)
                new_chord.offset = offset
                output_notes.append(new_chord)
        else:
            # Single note
            try:
                new_note = music21.note.Note(pattern)
                new_note.offset = offset
                new_note.storedInstrument = inst
                output_notes.append(new_note)
            except Exception:
                pass

        # Increase offset for next note/chord (fixed quarter note step 0.5)
        offset += 0.5

    midi_stream = music21.stream.Stream(output_notes)
    
    # Ensure parent directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)
    midi_stream.write('midi', fp=output_filepath)
    print(f"MIDI file generated successfully: {output_filepath}")
    return output_filepath


if __name__ == "__main__":
    test_sequence = ["C4", "E4", "G4", "C4.E4.G4", "D4", "F4", "A4", "G4"]
    test_file = os.path.join(os.path.dirname(__file__), "..", "data", "test_output.mid")
    create_midi_from_notes(test_sequence, test_file)
