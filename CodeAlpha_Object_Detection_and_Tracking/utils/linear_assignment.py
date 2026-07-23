import numpy as np
from scipy.optimize import linear_sum_assignment


def iou(bbox: np.ndarray, candidates: np.ndarray) -> np.ndarray:
    """Computes Intersection over Union (IoU) between a bbox and candidate bboxes."""
    bbox_tl = bbox[:2]
    bbox_br = bbox[:2] + bbox[2:]

    candidates_tl = candidates[:, :2]
    candidates_br = candidates[:, :2] + candidates[:, 2:]

    tl = np.maximum(bbox_tl, candidates_tl)
    br = np.minimum(bbox_br, candidates_br)

    wh = np.maximum(0.0, br - tl)
    area_intersection = wh[:, 0] * wh[:, 1]

    area_bbox = bbox[2] * bbox[3]
    area_candidates = candidates[:, 2] * candidates[:, 3]

    area_union = area_bbox + area_candidates - area_intersection
    return area_intersection / np.maximum(1e-5, area_union)


def iou_cost(tracks: list, detections: list, track_indices: list = None, detection_indices: list = None) -> np.ndarray:
    """Computes IoU cost matrix between tracks and detections."""
    if track_indices is None:
        track_indices = list(range(len(tracks)))
    if detection_indices is None:
        detection_indices = list(range(len(detections)))

    cost_matrix = np.zeros((len(track_indices), len(detection_indices)))
    for row, track_idx in enumerate(track_indices):
        if tracks[track_idx].time_since_update > 1:
            cost_matrix[row, :] = 1e5
            continue
        bbox = tracks[track_idx].to_tlwh()
        candidates = np.asarray([detections[i].to_tlwh() for i in detection_indices])
        if len(candidates) == 0:
            continue
        cost_matrix[row, :] = 1.0 - iou(bbox, candidates)

    return cost_matrix


def min_cost_matching(
    distance_metric,
    max_distance: float,
    tracks: list,
    detections: list,
    track_indices: list = None,
    detection_indices: list = None
):
    """Solves linear assignment problem using SciPy Hungarian Algorithm."""
    if track_indices is None:
        track_indices = list(range(len(tracks)))
    if detection_indices is None:
        detection_indices = list(range(len(detections)))

    if len(detection_indices) == 0 or len(track_indices) == 0:
        return [], track_indices, detection_indices

    cost_matrix = distance_metric(tracks, detections, track_indices, detection_indices)
    cost_matrix[cost_matrix > max_distance] = max_distance + 1e-5

    row_indices, col_indices = linear_sum_assignment(cost_matrix)

    matches, unmatched_tracks, unmatched_detections = [], [], []

    for col, detection_idx in enumerate(detection_indices):
        if col not in col_indices:
            unmatched_detections.append(detection_idx)

    for row, track_idx in enumerate(track_indices):
        if row not in row_indices:
            unmatched_tracks.append(track_idx)

    for row, col in zip(row_indices, col_indices):
        track_idx = track_indices[row]
        detection_idx = detection_indices[col]

        if cost_matrix[row, col] > max_distance:
            unmatched_tracks.append(track_idx)
            unmatched_detections.append(detection_idx)
        else:
            matches.append((track_idx, detection_idx))

    return matches, unmatched_tracks, unmatched_detections


def matching_cascade(
    distance_metric,
    max_distance: float,
    cascade_depth: int,
    tracks: list,
    detections: list,
    track_indices: list = None,
    detection_indices: list = None
):
    """DeepSORT Cascaded Matching prioritizing recently updated tracks."""
    if track_indices is None:
        track_indices = list(range(len(tracks)))
    if detection_indices is None:
        detection_indices = list(range(len(detections)))

    unmatched_detections = detection_indices
    matches = []

    for level in range(cascade_depth):
        if len(unmatched_detections) == 0:
            break

        track_indices_l = [
            k for k in track_indices if tracks[k].time_since_update == level + 1
        ]
        if len(track_indices_l) == 0:
            continue

        matches_l, _, unmatched_detections = min_cost_matching(
            distance_metric, max_distance, tracks, detections, track_indices_l, unmatched_detections
        )
        matches.extend(matches_l)

    unmatched_tracks = list(set(track_indices) - set(k for k, _ in matches))
    return matches, unmatched_tracks, unmatched_detections
