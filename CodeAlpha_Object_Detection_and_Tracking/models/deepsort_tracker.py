import numpy as np
from utils.kalman_filter import KalmanFilter
from utils.nn_matching import NearestNeighborDistanceMetric
from utils.linear_assignment import min_cost_matching, matching_cascade, iou_cost


class TrackState:
    Tentative = 1
    Confirmed = 2
    Deleted = 3


class Track:
    """Represents a single tracked object with Kalman Filter state and Re-ID history."""

    def __init__(self, mean: np.ndarray, covariance: np.ndarray, track_id: int, n_init: int, max_age: int, feature: np.ndarray = None, class_name: str = "object", confidence: float = 1.0):
        self.mean = mean
        self.covariance = covariance
        self.track_id = track_id
        self.hits = 1
        self.age = 1
        self.time_since_update = 0

        self.state = TrackState.Tentative
        self.features = []
        if feature is not None:
            self.features.append(feature)

        self._n_init = n_init
        self._max_age = max_age
        self.class_name = class_name
        self.confidence = confidence

    def to_tlwh(self) -> np.ndarray:
        """Converts state vector [x, y, a, h, ...] to [top_left_x, top_left_y, width, height]."""
        ret = self.mean[:4].copy()
        ret[2] *= ret[3]
        ret[:2] -= ret[2:] / 2.0
        return ret

    def to_tlbr(self) -> np.ndarray:
        """Converts state vector to [x1, y1, x2, y2]."""
        ret = self.to_tlwh()
        ret[2:] += ret[:2]
        return ret

    def predict(self, kf: KalmanFilter):
        """Predicts track state at next time step."""
        self.mean, self.covariance = kf.predict(self.mean, self.covariance)
        self.age += 1
        self.time_since_update += 1

    def update(self, kf: KalmanFilter, detection, feature: np.ndarray = None):
        """Updates track with new detection measurement and appearance feature."""
        self.mean, self.covariance = kf.update(self.mean, self.covariance, detection.to_xyah())
        self.features.append(feature)
        self.hits += 1
        self.time_since_update = 0
        self.class_name = detection.class_name
        self.confidence = detection.confidence

        if self.state == TrackState.Tentative and self.hits >= self._n_init:
            self.state = TrackState.Confirmed

    def mark_missed(self):
        """Marks track missed if no match found in frame."""
        if self.state == TrackState.Tentative or self.time_since_update > self._max_age:
            self.state = TrackState.Deleted

    def is_confirmed(self) -> bool:
        return self.state == TrackState.Confirmed

    def is_deleted(self) -> bool:
        return self.state == TrackState.Deleted


class Detection:
    """Represents a single frame bounding box detection."""

    def __init__(self, tlwh: np.ndarray, confidence: float, feature: np.ndarray, class_name: str = "object"):
        self.tlwh = np.asarray(tlwh, dtype=np.float32)
        self.confidence = float(confidence)
        self.feature = np.asarray(feature, dtype=np.float32)
        self.class_name = class_name

    def to_tlwh(self) -> np.ndarray:
        return self.tlwh.copy()

    def to_tlbr(self) -> np.ndarray:
        ret = self.tlwh.copy()
        ret[2:] += ret[:2]
        return ret

    def to_xyah(self) -> np.ndarray:
        ret = self.tlwh.copy()
        ret[:2] += ret[2:] / 2.0
        ret[2] /= ret[3]
        return ret


class DeepSORTTracker:
    """DeepSORT Tracker Orchestrator managing track states and feature metrics."""

    def __init__(self, max_cosine_distance: float = 0.2, nn_budget: int = 100, max_age: int = 30, n_init: int = 3):
        self.metric = NearestNeighborDistanceMetric("cosine", max_cosine_distance, nn_budget)
        self.max_age = max_age
        self.n_init = n_init
        self.kf = KalmanFilter()
        self.tracks = []
        self._next_id = 1

    def predict(self):
        """Propagates Kalman states for all active tracks."""
        for track in self.tracks:
            track.predict(self.kf)

    def update(self, detections: list):
        """Matches new frame detections against active tracks using DeepSORT cascade."""
        # 1. Match active tracks using Cascaded Appearance + IoU Matching
        matches, unmatched_tracks, unmatched_detections = self._match(detections)

        # 2. Update matched tracks
        for track_idx, detection_idx in matches:
            self.tracks[track_idx].update(self.kf, detections[detection_idx], detections[detection_idx].feature)

        # 3. Handle unmatched tracks
        for track_idx in unmatched_tracks:
            self.tracks[track_idx].mark_missed()

        # 4. Initialize new tracks for unmatched detections
        for detection_idx in unmatched_detections:
            self._initiate_track(detections[detection_idx])

        # 5. Remove deleted tracks
        self.tracks = [t for t in self.tracks if not t.is_deleted()]

        # 6. Update feature metric gallery
        active_targets = [t.track_id for t in self.tracks if t.is_confirmed()]
        features, targets = [], []
        for track in self.tracks:
            if not track.is_confirmed():
                continue
            features.append(track.features[-1])
            targets.append(track.track_id)
        if len(features) > 0:
            self.metric.partial_fit(np.asarray(features), targets, active_targets)

    def _match(self, detections: list):
        def gated_metric(tracks, detections, track_indices, detection_indices):
            features = np.array([detections[i].feature for i in detection_indices])
            targets = [tracks[i].track_id for i in track_indices]
            cost_matrix = self.metric.distance(features, targets)
            return cost_matrix

        confirmed_tracks = [i for i, t in enumerate(self.tracks) if t.is_confirmed()]
        unconfirmed_tracks = [i for i, t in enumerate(self.tracks) if not t.is_confirmed()]

        # Association Step 1: Cascaded matching on confirmed tracks
        matches_a, unmatched_tracks_a, unmatched_detections = matching_cascade(
            gated_metric, self.metric.matching_threshold, self.max_age, self.tracks, detections, confirmed_tracks
        )

        # Association Step 2: IoU matching for remaining unmatched tracks
        iou_track_candidates = unconfirmed_tracks + [
            k for k in unmatched_tracks_a if self.tracks[k].time_since_update == 1
        ]
        unmatched_tracks_a = [
            k for k in unmatched_tracks_a if self.tracks[k].time_since_update != 1
        ]

        matches_b, unmatched_tracks_b, unmatched_detections = min_cost_matching(
            iou_cost, 0.7, self.tracks, detections, iou_track_candidates, unmatched_detections
        )

        matches = matches_a + matches_b
        unmatched_tracks = list(set(unmatched_tracks_a + unmatched_tracks_b))
        return matches, unmatched_tracks, unmatched_detections

    def _initiate_track(self, detection: Detection):
        mean, covariance = self.kf.initiate(detection.to_xyah())
        self.tracks.append(Track(
            mean, covariance, self._next_id, self.n_init, self.max_age,
            feature=detection.feature, class_name=detection.class_name, confidence=detection.confidence
        ))
        self._next_id += 1
