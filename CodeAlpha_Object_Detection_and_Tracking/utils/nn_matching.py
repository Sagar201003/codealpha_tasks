import numpy as np


def _cosine_distance(a: np.ndarray, b: np.ndarray, data_is_normalized: bool = False) -> np.ndarray:
    """Computes cosine distance matrix between feature vectors in a and b."""
    if not data_is_normalized:
        a = a / np.linalg.norm(a, axis=1, keepdims=True)
        b = b / np.linalg.norm(b, axis=1, keepdims=True)
    return 1.0 - np.dot(a, b.T)


class NearestNeighborDistanceMetric(object):
    """
    Nearest Neighbor distance metric solver for DeepSORT Re-ID feature vectors.
    Supports Cosine distance and Mahalanobis gating thresholding.
    """

    def __init__(self, metric: str = "cosine", matching_threshold: float = 0.2, budget: int = 100):
        if metric == "cosine":
            self._metric = _cosine_distance
        else:
            raise ValueError(f"Invalid metric: {metric}. Supported: 'cosine'")
        
        self.matching_threshold = matching_threshold
        self.budget = budget
        self.samples = {}

    def distance(self, features: np.ndarray, targets: list) -> np.ndarray:
        """Computes distance matrix between features and target track samples."""
        cost_matrix = np.zeros((len(targets), len(features)))
        for i, target in enumerate(targets):
            if target not in self.samples or len(self.samples[target]) == 0:
                cost_matrix[i, :] = 1.0
            else:
                target_features = np.asarray(self.samples[target])
                distances = self._metric(target_features, features)
                cost_matrix[i, :] = distances.min(axis=0)
        return cost_matrix

    def partial_fit(self, features: np.ndarray, targets: list, active_targets: list):
        """Updates internal feature gallery for active tracks."""
        for feature, target in zip(features, targets):
            self.samples.setdefault(target, []).append(feature)
            if self.budget is not None:
                self.samples[target] = self.samples[target][-self.budget:]
        
        # Purge inactive track samples
        self.samples = {k: v for k, v in self.samples.items() if k in active_targets}
