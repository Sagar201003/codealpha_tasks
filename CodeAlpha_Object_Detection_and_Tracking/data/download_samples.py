import os
import cv2
import numpy as np


def generate_sample_traffic_video(output_path: str = "data/sample_traffic.mp4", duration_sec: int = 5, fps: int = 30):
    """Generates a synthetic traffic video with moving cars and pedestrians for testing."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 800, 450
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    total_frames = duration_sec * fps
    np.random.seed(42)

    # Define tracked object trajectories
    objects = [
        {"type": "car", "color": (50, 50, 220), "start": (50, 200), "speed": (4, 0), "size": (90, 50)},
        {"type": "car", "color": (220, 100, 50), "start": (700, 280), "speed": (-5, 0), "size": (95, 55)},
        {"type": "person", "color": (50, 200, 50), "start": (350, 80), "speed": (0, 2), "size": (30, 60)},
        {"type": "person", "color": (200, 200, 50), "start": (450, 380), "speed": (-1, -1.5), "size": (28, 58)}
    ]

    for frame_idx in range(total_frames):
        # Background road canvas
        frame = np.ones((height, width, 3), dtype=np.uint8) * 40
        
        # Road lane markings
        cv2.rectangle(frame, (0, 150), (width, 350), (60, 60, 60), -1)
        for x in range(0, width, 60):
            cv2.line(frame, (x, 250), (x + 30, 250), (255, 255, 255), 3)

        # Crosswalk
        for y in range(150, 350, 30):
            cv2.rectangle(frame, (380, y), (420, y + 15), (200, 200, 200), -1)

        # Render moving objects
        for obj in objects:
            curr_x = int(obj["start"][0] + obj["speed"][0] * frame_idx)
            curr_y = int(obj["start"][1] + obj["speed"][1] * frame_idx)
            w, h = obj["size"]

            # Wrap around canvas
            curr_x = curr_x % (width + 100) - 50
            curr_y = curr_y % (height + 100) - 50

            # Draw object body
            cv2.rectangle(frame, (curr_x, curr_y), (curr_x + w, curr_y + h), obj["color"], -1)
            cv2.rectangle(frame, (curr_x, curr_y), (curr_x + w, curr_y + h), (255, 255, 255), 2)
            
            # Label
            cv2.putText(frame, obj["type"], (curr_x, curr_y - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        out.write(frame)

    out.release()
    print(f"Generated sample synthetic video: {output_path} ({total_frames} frames)")


if __name__ == "__main__":
    generate_sample_traffic_video("data/sample_traffic.mp4")
    generate_sample_traffic_video("data/sample_pedestrians.mp4")
