import os
import mido
from mido import Message, MidiFile, MidiTrack, MetaMessage


def create_classical_midi(filename: str):
    """Creates a sample classical piano MIDI melody & chord progression."""
    mid = MidiFile()
    track = MidiTrack()
    mid.tracks.append(track)

    # Set tempo to 120 BPM (500,000 microseconds per beat)
    track.append(MetaMessage('set_tempo', tempo=500000, time=0))
    track.append(Message('program_change', program=0, channel=0, time=0))  # Acoustic Grand Piano

    # Fur Elise / Classical Motif pitch sequence
    notes = [
        (76, 240), (75, 240), (76, 240), (75, 240), (76, 240), (71, 240), (74, 240), (72, 240), (69, 480),
        (60, 240), (64, 240), (69, 240), (71, 480), (64, 240), (68, 240), (71, 240), (72, 480),
        (76, 240), (75, 240), (76, 240), (75, 240), (76, 240), (71, 240), (74, 240), (72, 240), (69, 480),
        (60, 240), (64, 240), (69, 240), (71, 480), (64, 240), (72, 240), (71, 240), (69, 480),
        # Chord progression section
        (72, 240), (74, 240), (76, 480), (77, 240), (76, 240), (74, 480), (76, 240), (72, 240), (71, 480)
    ]

    for pitch, duration in notes:
        track.append(Message('note_on', note=pitch, velocity=85, time=0))
        track.append(Message('note_off', note=pitch, velocity=0, time=duration))

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    mid.save(filename)
    print(f"Created classical MIDI: {filename}")


def create_jazz_midi(filename: str):
    """Creates a sample jazz chord & swing motif MIDI piece."""
    mid = MidiFile()
    track = MidiTrack()
    mid.tracks.append(track)

    track.append(MetaMessage('set_tempo', tempo=600000, time=0)) # 100 BPM
    track.append(Message('program_change', program=0, channel=0, time=0))

    # Jazz Chords (ii - V - I - VI in C Major: Dm7 -> G7 -> Cmaj7 -> A7)
    chords = [
        ([62, 65, 69, 72], 960),  # Dm7
        ([59, 62, 65, 67], 960),  # G7
        ([60, 64, 67, 71], 960),  # Cmaj7
        ([57, 61, 64, 67], 960),  # A7
        ([62, 65, 69, 72], 960),  # Dm7
        ([59, 65, 67, 71], 960),  # G7 alt
        ([60, 64, 67, 71], 1920), # Cmaj7 extended
    ]

    for chord, duration in chords:
        for p in chord:
            track.append(Message('note_on', note=p, velocity=75, time=0))
        for i, p in enumerate(chord):
            dt = duration if i == 0 else 0
            track.append(Message('note_off', note=p, velocity=0, time=dt))

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    mid.save(filename)
    print(f"Created jazz MIDI: {filename}")


def create_ambient_midi(filename: str):
    """Creates a sample ambient synth arpeggio MIDI piece."""
    mid = MidiFile()
    track = MidiTrack()
    mid.tracks.append(track)

    track.append(MetaMessage('set_tempo', tempo=450000, time=0)) # 133 BPM
    track.append(Message('program_change', program=88, channel=0, time=0)) # Synth Pad

    arpeggio_pitches = [
        60, 64, 67, 72, 76, 72, 67, 64,
        57, 60, 64, 69, 72, 69, 64, 60,
        53, 57, 60, 65, 68, 65, 60, 57,
        55, 59, 62, 67, 71, 67, 62, 59
    ]

    for _ in range(2): # Repeat twice
        for pitch in arpeggio_pitches:
            track.append(Message('note_on', note=pitch, velocity=70, time=0))
            track.append(Message('note_off', note=pitch, velocity=0, time=180))

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    mid.save(filename)
    print(f"Created ambient MIDI: {filename}")


if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), "midi")
    create_classical_midi(os.path.join(base_dir, "classical_fur_elise.mid"))
    create_jazz_midi(os.path.join(base_dir, "jazz_progression.mid"))
    create_ambient_midi(os.path.join(base_dir, "ambient_arpeggio.mid"))
