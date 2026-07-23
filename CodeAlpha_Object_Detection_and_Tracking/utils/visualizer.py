import cv2
import numpy as np


# Palette of vibrant neon colors for track IDs
COLOR_PALETTE = [
    (255, 99, 71),   # Tomato
    (50, 205, 50),   # Lime Green
    (0, 191, 255),   # Deep Sky Blue
    (255, 0, 255),   # Magenta
    (255, 215, 0),   # Gold
    (138, 43, 226),  # Blue Violet
    (0, 255, 127),   # Spring Green
    (255, 140, 0),   # Dark Orange
    (186, 85, 211),  # Medium Orchid
    (0, 255, 255)    # Cyan
]


def get_color_for_id(track_id: int) -> tuple:
    """Returns persistent BGR color tuple based on Track ID."""
    return COLOR_PALETTE[track_id % len(COLOR_PALETTE)]


class Visualizer:
    """OpenCV Renderer for Bounding Boxes, DeepSORT Track IDs, Trajectory Trails & HUD."""

    def __init__(self, max_trail_len: int = 30):
        self.max_trail_len = max_trail_len
        self.track_trails = {}

    def draw_tracking_frame(
        self,
        frame: np.ndarray,
        tracks: list,
        fps: float = 0.0,
        show_trail: bool = True
    ) -> np.ndarray:
        """Renders bounding boxes, Track ID badges, motion trajectories, and HUD stats onto frame."""
        annotated = frame.copy()
        h_img, w_img = annotated.shape[:2]

        active_counts = {}

        for track in tracks:
            if not track.is_confirmed() or track.time_since_update > 1:
                continue

            track_id = track.track_id
            class_name = track.class_name
            conf = track.confidence
            color = get_color_for_id(track_id)

            active_counts[class_name] = active_counts.get(class_name, 0) + 1

            # Get bounding box [x1, y1, x2, y2]
            x1, y1, x2, y2 = [int(v) for v in track.to_tlbr()]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w_img, x2), min(h_img, y2)

            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2

            # 1. Trajectory Trails
            if show_trail:
                if track_id not in self.track_trails:
                    self.track_trails[track_id] = []
                self.track_trails[track_id].append((center_x, center_y))
                if len(self.track_trails[track_id]) > self.max_trail_len:
                    self.track_trails[track_id].pop(0)

                pts = self.track_trails[track_id]
                for i in range(1, len(pts)):
                    thickness = int(np.sqrt(self.max_trail_len / float(i + 1)) * 2.5)
                    cv2.line(annotated, pts[i - 1], pts[i], color, max(1, thickness))

            # 2. Bounding Box (Corner lines style)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

            # Corner accents
            length = min(15, (x2 - x1) // 4, (y2 - y1) // 4)
            if length > 0:
                cv2.line(annotated, (x1, y1), (x1 + length, y1), color, 4)
                cv2.line(annotated, (x1, y1), (x1, y1 + length), color, 4)
                cv2.line(annotated, (x2, y1), (x2 - length, y1), color, 4)
                cv2.line(annotated, (x2, y1), (x2, y1 + length), color, 4)
                cv2.line(annotated, (x1, y2), (x1 + length, y2), color, 4)
                cv2.line(annotated, (x1, y2), (x1, y2 - length), color, 4)
                cv2.line(annotated, (x2, y2), (x2 - length, y2), color, 4)
                cv2.line(annotated, (x2, y2), (x2, y2 - length), color, 4)

            # 3. Label Badge
            label_text = f"ID #{track_id} {class_name.capitalize()} {int(conf * 100)}%"
            (txt_w, txt_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            badge_y = max(y1 - 10, txt_h + 10)

            # Badge Background
            cv2.rectangle(annotated, (x1, badge_y - txt_h - 4), (x1 + txt_w + 10, badge_y + 4), color, -1)
            cv2.putText(annotated, label_text, (x1 + 5, badge_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # 4. HUD Top Bar Performance Stats
        hud_bg = np.zeros((50, w_img, 3), dtype=np.uint8)
        cv2.addWeighted(annotated[0:50, 0:w_img], 0.3, hud_bg, 0.7, 0, annotated[0:50, 0:w_img])

        total_tracked = sum(active_counts.values())
        summary_str = " | ".join([f"{k.capitalize()}: {v}" for k, v in active_counts.items()])
        if not summary_str:
            summary_str = "Active Tracks: 0"

        cv2.putText(annotated, f"OmniTrack AI | FPS: {fps:.1f} | Total: {total_tracked}", (15, 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.putText(annotated, summary_str, (15, 42),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)

        return annotated
