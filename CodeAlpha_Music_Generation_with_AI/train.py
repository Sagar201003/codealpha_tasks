import os
import sys
import json
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

# Ensure UTF-8 output encoding on Windows terminal
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure local imports work
sys.path.append(os.path.dirname(__file__))
from utils.midi_parser import load_all_midis, prepare_sequences
from models.music_lstm import AttentionMusicLSTM


def train_music_model(
    midi_dir: str = "data/midi",
    epochs: int = 50,
    batch_size: int = 16,
    seq_length: int = 16,
    lr: float = 0.003,
    save_path: str = "models/saved_model.pt",
    vocab_path: str = "models/vocab.json"
):
    """Trains the AttentionMusicLSTM neural network on MIDI sequences."""
    print("=" * 60)
    print("AI Music Generator - Attention-Enhanced Model Training Pipeline")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using Compute Device: {device}")

    # Load and preprocess dataset
    all_notes = load_all_midis(midi_dir)
    if not all_notes:
        print(f"Error: No notes extracted from {midi_dir}. Aborting training.")
        return

    X, y, note_to_int, int_to_note = prepare_sequences(all_notes, sequence_length=seq_length)
    vocab_size = len(note_to_int)

    # Convert to PyTorch tensors
    X_tensor = torch.tensor(X, dtype=torch.long)
    y_tensor = torch.tensor(y, dtype=torch.long)

    dataset = TensorDataset(X_tensor, y_tensor)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    # Initialize Attention-Enhanced LSTM model
    model = AttentionMusicLSTM(
        vocab_size=vocab_size,
        embedding_dim=128,
        hidden_dim=256,
        num_layers=2,
        num_heads=4,
        dropout=0.2
    ).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=5)

    print(f"\nStarting training for {epochs} epochs | Vocabulary Size: {vocab_size} notes/chords...")
    best_loss = float('inf')

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        
        for batch_X, batch_y in dataloader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            
            optimizer.zero_grad()
            logits, _ = model(batch_X)
            loss = criterion(logits, batch_y)
            loss.backward()

            # Gradient Clipping to prevent exploding gradients
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            total_loss += loss.item()
            
        avg_loss = total_loss / len(dataloader)
        scheduler.step(avg_loss)

        if avg_loss < best_loss:
            best_loss = avg_loss
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            torch.save(model.state_dict(), save_path)

        if epoch == 1 or epoch % 5 == 0 or epoch == epochs:
            current_lr = optimizer.param_groups[0]['lr']
            print(f"Epoch [{epoch:02d}/{epochs:02d}] -> Loss: {avg_loss:.4f} (Best: {best_loss:.4f}) | LR: {current_lr:.5f}")

    # Save vocabulary metadata
    vocab_data = {
        "note_to_int": note_to_int,
        "int_to_note": {str(k): v for k, v in int_to_note.items()},
        "vocab_size": vocab_size,
        "seq_length": seq_length,
        "architecture": "AttentionMusicLSTM"
    }
    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(vocab_data, f, indent=2)

    print(f"\nTraining Complete!")
    print(f"Saved Best Model Checkpoint: {save_path}")
    print(f"Saved Vocabulary JSON: {vocab_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PyTorch Attention-Enhanced LSTM Music Generator")
    parser.add_argument("--midi_dir", type=str, default="data/midi", help="Directory containing training MIDI files")
    parser.add_argument("--epochs", type=int, default=40, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--seq_length", type=int, default=16, help="Sequence window length")
    parser.add_argument("--lr", type=float, default=0.003, help="Learning rate")
    args = parser.parse_args()

    train_music_model(
        midi_dir=args.midi_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        seq_length=args.seq_length,
        lr=args.lr
    )
