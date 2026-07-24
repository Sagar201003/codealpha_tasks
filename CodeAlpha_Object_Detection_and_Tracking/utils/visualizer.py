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
    if track_id < 0:
        return (128, 128, 128)
    return COLOR_PALETTE[track_id % len(COLOR_PALETTE)]


class Visualizer:
    """OpenCV Renderer for Bounding Boxes, Track IDs, Ground Motion Trails & HUD."""

    def __init__(self, max_trail_len: int = 15):
        self.max_trail_len = max_trail_len
        self.track_trails = {}

    def draw_tracking_frame(
        self,
        frame: np.ndarray,
        tracks: list,
        fps: float = 0.0,
        show_trail: bool = True
    ) -> np.ndarray:
        """Renders bounding boxes, Track ID badges, ground motion trails, and HUD stats onto frame."""
        annotated = frame.copy()
        h_img, w_img = annotated.shape[:2]

        active_counts = {}
        active_ids = set()

        for track in tracks:
            # Handle both DeepSORT Track objects and dicts / ByteTrack objects
            if isinstance(track, dict):
                track_id = track.get("track_id", -1)
                class_name = track.get("class_name", "object")
                conf = track.get("confidence", 1.0)
                tlwh = track.get("bbox_tlwh", [0, 0, 1, 1])
                x1, y1, w, h = tlwh
                x2, y2 = x1 + w, y1 + h
            else:
                if hasattr(track, "is_confirmed") and not track.is_confirmed():
                    continue
                if hasattr(track, "time_since_update") and track.time_since_update > 1:
                    continue

                track_id = getattr(track, "track_id", -1)
                class_name = getattr(track, "class_name", "object")
                conf = getattr(track, "confidence", 1.0)
                x1, y1, x2, y2 = [int(v) for v in track.to_tlbr()]

            color = get_color_for_id(track_id)
            active_counts[class_name] = active_counts.get(class_name, 0) + 1
            if track_id >= 0:
                active_ids.add(track_id)

            x1, y1 = max(0, int(x1)), max(0, int(y1))
            x2, y2 = min(w_img, int(x2)), min(h_img, int(y2))

            # Ground contact point (bottom-center of bounding box touching road pavement)
            ground_x = (x1 + x2) // 2
            ground_y = y2

            # 1. Ground Motion Trails (Lies flat on road pavement under wheels)
            if show_trail and track_id >= 0:
                if track_id not in self.track_trails:
                    self.track_trails[track_id] = []
                
                # Distance jump protection
                if len(self.track_trails[track_id]) > 0:
                    last_x, last_y = self.track_trails[track_id][-1]
                    dist = np.hypot(ground_x - last_x, ground_y - last_y)
                    if dist > 60: # Reset if position jumped > 60px
                        self.track_trails[track_id] = []

                self.track_trails[track_id].append((ground_x, ground_y))
                if len(self.track_trails[track_id]) > self.max_trail_len:
                    self.track_trails[track_id].pop(0)

                pts = self.track_trails[track_id]
                for i in range(1, len(pts)):
                    thickness = int(np.sqrt(self.max_trail_len / float(i + 1)) * 2.0)
                    cv2.line(annotated, pts[i - 1], pts[i], color, max(1, thickness))
                    cv2.circle(annotated, pts[i], max(1, thickness // 2), color, -1)

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
            track_label_str = f"ID #{track_id} " if track_id >= 0 else ""
            label_text = f"{track_label_str}{class_name.capitalize()} {int(conf * 100)}%"
            (txt_w, txt_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            badge_y = max(y1 - 10, txt_h + 10)

            # Badge Background
            cv2.rectangle(annotated, (x1, badge_y - txt_h - 4), (x1 + txt_w + 10, badge_y + 4), color, -1)
            cv2.putText(annotated, label_text, (x1 + 5, badge_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # 4. Purge stale track trails
        self.track_trails = {k: v for k, v in self.track_trails.items() if k in active_ids}

        # 5. HUD Top Bar Performance Stats
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
