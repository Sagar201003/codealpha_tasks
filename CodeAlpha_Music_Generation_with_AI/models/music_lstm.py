import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np


class AttentionMusicLSTM(nn.Module):
    """
    Advanced Self-Attention Enhanced LSTM Neural Network for Musical Sequence Modeling.
    Combines Recurrent LSTM layers with Multi-Head Self-Attention and Layer Normalization
    to capture long-range musical motifs and harmonic structures.
    """

    def __init__(
        self,
        vocab_size: int,
        embedding_dim: int = 128,
        hidden_dim: int = 256,
        num_layers: int = 2,
        num_heads: int = 4,
        dropout: float = 0.2
    ):
        super(AttentionMusicLSTM, self).__init__()
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        # Token Embedding & Spatial Dropout
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.drop = nn.Dropout(dropout)

        # Multi-layer LSTM Core
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0.0,
            batch_first=True
        )

        # Multi-Head Self-Attention Layer (Captures long-range musical themes)
        self.self_attention = nn.MultiheadAttention(
            embed_dim=hidden_dim,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True
        )
        self.layer_norm = nn.LayerNorm(hidden_dim)

        # Output Classification Head
        self.fc1 = nn.Linear(hidden_dim, hidden_dim // 2)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim // 2, vocab_size)

    def forward(self, x, hidden=None):
        # x shape: (batch_size, seq_len)
        embeds = self.drop(self.embedding(x))  # (batch_size, seq_len, embedding_dim)
        
        # LSTM layer forward pass
        lstm_out, hidden = self.lstm(embeds, hidden)  # (batch_size, seq_len, hidden_dim)

        # Self-Attention Layer with Residual Connection & Layer Norm
        attn_out, _ = self.self_attention(lstm_out, lstm_out, lstm_out)
        norm_out = self.layer_norm(lstm_out + attn_out)  # Residual addition

        # Extract last timestep representations
        last_timestep = norm_out[:, -1, :]  # (batch_size, hidden_dim)

        # Classification Head
        dense = self.relu(self.fc1(last_timestep))
        logits = self.fc2(self.drop(dense))  # (batch_size, vocab_size)
        return logits, hidden


# Backwards compatibility alias
MusicLSTM = AttentionMusicLSTM


def sample_with_temperature(
    logits: torch.Tensor,
    temperature: float = 1.0,
    top_k: int = 0,
    top_p: float = 0.9
) -> int:
    """
    Advanced sampling algorithm supporting Temperature Scaling, Top-K Filtering,
    and Top-P (Nucleus) Truncation to guarantee musically harmonious output.
    """
    if temperature <= 0.01:
        return int(torch.argmax(logits, dim=-1).item())

    # Apply Temperature Scaling
    logits = logits / max(temperature, 1e-5)

    # Apply Top-K Truncation
    if top_k > 0:
        top_k = min(top_k, logits.size(-1))
        indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
        logits[indices_to_remove] = -float('Inf')

    # Apply Top-P (Nucleus) Truncation
    if top_p < 1.0:
        sorted_logits, sorted_indices = torch.sort(logits, descending=True)
        cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)

        # Remove tokens with cumulative probability above top_p
        sorted_indices_to_remove = cumulative_probs > top_p
        sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
        sorted_indices_to_remove[..., 0] = 0

        indices_to_remove = sorted_indices[sorted_indices_to_remove]
        logits[indices_to_remove] = -float('Inf')

    # Compute Softmax Probabilities
    probs = F.softmax(logits, dim=-1).squeeze().detach().cpu().numpy()
    
    # Normalize probabilities safely
    prob_sum = np.sum(probs)
    if prob_sum <= 0 or np.isnan(prob_sum):
        return int(torch.argmax(logits, dim=-1).item())
    probs = probs / prob_sum

    # Stochastic Sample
    next_index = np.random.choice(len(probs), p=probs)
    return int(next_index)


if __name__ == "__main__":
    vocab_size = 35
    model = AttentionMusicLSTM(vocab_size=vocab_size)
    dummy_input = torch.randint(0, vocab_size, (4, 16))
    logits, _ = model(dummy_input)
    print(f"AttentionMusicLSTM Forward Pass: OK! Output shape: {logits.shape}")
    sample_idx = sample_with_temperature(logits[0], temperature=0.8, top_p=0.85)
    print(f"Sampled Note Index (Top-P 0.85, Temp 0.8): {sample_idx}")
