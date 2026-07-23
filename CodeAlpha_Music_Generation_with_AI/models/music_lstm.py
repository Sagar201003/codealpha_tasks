import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np


class MusicLSTM(nn.Module):
    """LSTM Neural Network for Musical Sequence Modeling & Next-Note Prediction."""

    def __init__(self, vocab_size: int, embedding_dim: int = 128, hidden_dim: int = 256, num_layers: int = 2, dropout: float = 0.2):
        super(MusicLSTM, self).__init__()
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0.0,
            batch_first=True
        )
        self.fc = nn.Linear(hidden_dim, vocab_size)

    def forward(self, x, hidden=None):
        # x shape: (batch_size, seq_len)
        embeds = self.embedding(x)  # (batch_size, seq_len, embedding_dim)
        lstm_out, hidden = self.lstm(embeds, hidden)  # (batch_size, seq_len, hidden_dim)
        
        # Take the output of the last time step for sequence classification
        last_out = lstm_out[:, -1, :]  # (batch_size, hidden_dim)
        logits = self.fc(last_out)  # (batch_size, vocab_size)
        return logits, hidden


def sample_with_temperature(logits: torch.Tensor, temperature: float = 1.0) -> int:
    """Samples next token index from logits using temperature-controlled softmax."""
    if temperature <= 0.01:
        return int(torch.argmax(logits, dim=-1).item())

    # Scale logits by temperature
    scaled_logits = logits / max(temperature, 1e-5)
    probs = F.softmax(scaled_logits, dim=-1).squeeze().detach().cpu().numpy()
    
    # Normalize probabilities to sum to 1.0 (safety check for floating point quirks)
    probs = probs / np.sum(probs)
    
    # Sample index according to probability distribution
    next_index = np.random.choice(len(probs), p=probs)
    return int(next_index)


if __name__ == "__main__":
    vocab_size = 30
    model = MusicLSTM(vocab_size=vocab_size)
    dummy_input = torch.randint(0, vocab_size, (4, 16))  # Batch size 4, sequence length 16
    logits, _ = model(dummy_input)
    print(f"Model forward pass successful! Input: {dummy_input.shape} -> Logits: {logits.shape}")
    sampled_idx = sample_with_temperature(logits[0], temperature=0.8)
    print(f"Sampled note index (temp=0.8): {sampled_idx}")
