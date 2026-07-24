import os
import sys
import time
import argparse
import cv2
import numpy as np

# Ensure local imports work
sys.path.append(os.path.dirname(__file__))

from models.detector import YOLOv8Detector
from models.feature_extractor import ReIDFeatureExtractor
from models.deepsort_tracker import DeepSORTTracker, Detection
from utils.visualizer import Visualizer


# ==============================================================================
# 📹 INPUT VIDEO, OUTPUT & MODEL CONFIGURATION
# 
# 1. DEFAULT_VIDEO_PATH: Path to input video or "0" for live webcam
#    Examples: "videos/test1.mp4", "data/sample_traffic.mp4", "0"
# 
# 2. DEFAULT_OUTPUT_PATH: Path where output result video will be saved
#    Examples: "output/out.mp4"
# 
# 3. DEFAULT_MODEL: YOLO Pretrained Weight Tier
#    - "yolov8n.pt"  (Nano  - 6 MB)  -> Blazing Fast Real-Time
#    - "yolov8s.pt"  (Small - 22 MB) -> Fast & Higher Accuracy
#    - "yolov8m.pt"  (Medium - 50 MB)-> Balanced High Precision
#    - "yolov8l.pt"  (Large - 83 MB) -> High Accuracy for Small Objects [Default]
#    - "yolov8x.pt"  (X-Large- 130 MB)-> Maximum Precision
# 
# 4. DEFAULT_TRACKER: Object Tracking Engine
#    - "bytetrack" (High-Speed Native ByteTrack, 30+ FPS, Zero ID Jumping) [DEFAULT]
#    - "deepsort"  (PyTorch CNN Re-ID + 8-State Kalman Association)
# ==============================================================================
DEFAULT_VIDEO_PATH = "videos/test1.mp4"
DEFAULT_OUTPUT_PATH = "output/out.mp4"
DEFAULT_MODEL = "yolov8l.pt"
DEFAULT_TRACKER = "bytetrack"


def run_object_detection_and_tracking(
    source: str = DEFAULT_VIDEO_PATH,
    model_name: str = DEFAULT_MODEL,
    tracker_type: str = DEFAULT_TRACKER,
    conf_threshold: float = 0.30,
    iou_threshold: float = 0.45,
    classes: list = None,
    show_trail: bool = True,
    save_video: str = DEFAULT_OUTPUT_PATH,
    display: bool = True
):
    """
    Main Computer Vision Pipeline for Real-Time YOLOv8 + ByteTrack / DeepSORT Object Tracking.
    """
    print("=" * 60)
    print(f"OmniTrack AI - Real-Time YOLOv8 & {tracker_type.upper()} Engine")
    print("=" * 60)

    # 1. Parse Video Source (0 for Webcam, or video file path)
    if str(source).isdigit():
        video_src = int(source)
        src_name = f"Webcam Device #{source}"
    else:
        video_src = source
        src_name = f"Video File ({source})"

    cap = cv2.VideoCapture(video_src)
    if not cap.isOpened():
        print(f"Error: Unable to open video source '{source}'. Please check webcam or file path.")
        return

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 800
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 450
    fps_in = cap.get(cv2.CAP_PROP_FPS) or 30.0

    print(f"Input Stream Loaded: {src_name} ({width}x{height} @ {fps_in:.1f} FPS)")
    print(f"Model Selection: {model_name} | Tracker: {tracker_type.upper()} | Conf: {conf_threshold}")

    # 2. Initialize Models & Tracking Engines
    detector = YOLOv8Detector(model_name=model_name, conf_threshold=conf_threshold, iou_threshold=iou_threshold)
    visualizer = Visualizer(max_trail_len=15)

    if tracker_type.lower() == "deepsort":
        feature_extractor = ReIDFeatureExtractor()
        deepsort_tracker = DeepSORTTracker(max_cosine_distance=0.2, max_age=30, n_init=3)

    # 3. Setup Video Writer if saving output
    writer = None
    if save_video:
        os.makedirs(os.path.dirname(os.path.abspath(save_video)), exist_ok=True)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(save_video, fourcc, fps_in, (width, height))
        print(f"Output Video Destination: {save_video}")

    print("\nProcessing frames... Press 'q' or ESC in OpenCV window to quit.")
    frame_count = 0
    start_time = time.time()

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            frame_count += 1
            loop_start = time.time()

            if tracker_type.lower() == "deepsort":
                # Step A: Run YOLOv8 Object Detector
                detections_meta = detector.detect(frame, target_classes=classes)

                # Step B: Extract Re-ID Appearance Feature Vectors
                bboxes_tlwh = [d["bbox_tlwh"] for d in detections_meta]
                features = feature_extractor.extract_features(frame, bboxes_tlwh)

                # Convert to DeepSORT Detection objects
                detections = [
                    Detection(d["bbox_tlwh"], d["confidence"], feat, d["class_name"])
                    for d, feat in zip(detections_meta, features)
                ]

                # Step C: DeepSORT Motion Prediction & Cascaded Track Update
                deepsort_tracker.predict()
                deepsort_tracker.update(detections)
                active_tracks = deepsort_tracker.tracks
            else:
                # High-Speed Native ByteTrack Tracking Engine (Default - 30+ FPS)
                active_tracks = detector.track(frame, target_classes=classes, tracker_type="bytetrack.yaml")

            # Measure Frame Rate (FPS)
            loop_time = time.time() - loop_start
            current_fps = 1.0 / max(loop_time, 1e-5)

            # Render Visual Annotations & HUD
            annotated_frame = visualizer.draw_tracking_frame(
                frame, active_tracks, fps=current_fps, show_trail=show_trail
            )

            # Write output or display window
            if writer is not None:
                writer.write(annotated_frame)

            if display:
                try:
                    cv2.imshow("OmniTrack AI - YOLOv8 + ByteTrack Object Tracking", annotated_frame)
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('q') or key == 27: # 'q' or ESC
                        print("User exit triggered.")
                        break
                except Exception:
                    pass

    except KeyboardInterrupt:
        print("\nProcess interrupted by user.")
    finally:
        cap.release()
        if writer is not None:
            writer.release()
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass

        total_time = time.time() - start_time
        avg_fps = frame_count / max(total_time, 1e-5)
        print(f"\nProcessing Complete!")
        print(f"Total Frames Processed: {frame_count} | Total Time: {total_time:.2f}s | Avg FPS: {avg_fps:.1f}")
        if save_video:
            print(f"Result Saved To: {save_video}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OmniTrack AI - Real-Time YOLOv8 Object Tracking")
    parser.add_argument("--source", type=str, default=DEFAULT_VIDEO_PATH, help=f"Video source path or '0' for webcam (default: {DEFAULT_VIDEO_PATH})")
    parser.add_argument("--save_video", type=str, default=DEFAULT_OUTPUT_PATH, help=f"Output MP4 file path to save annotated result video (default: {DEFAULT_OUTPUT_PATH})")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help=f"YOLO model weight (yolov8n.pt, yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt)")
    parser.add_argument("--tracker", type=str, default=DEFAULT_TRACKER, choices=["bytetrack", "deepsort"], help="Tracker engine: 'bytetrack' (30+ FPS, default) or 'deepsort'")
    parser.add_argument("--conf", type=float, default=0.30, help="Detection confidence threshold (default: 0.30)")
    parser.add_argument("--iou", type=float, default=0.45, help="NMS IoU threshold")
    parser.add_argument("--classes", nargs="+", default=None, help="Filter specific classes (e.g. --classes person car)")
    parser.add_argument("--no_trail", action="store_true", help="Disable glowing trajectory trails")
    parser.add_argument("--no_display", action="store_true", help="Disable GUI display window for headless execution")
    args = parser.parse_args()

    run_object_detection_and_tracking(
        source=args.source,
        model_name=args.model,
        tracker_type=args.tracker,
        conf_threshold=args.conf,
        iou_threshold=args.iou,
        classes=args.classes,
        show_trail=not args.no_trail,
        save_video=args.save_video,
        display=not args.no_display
    )
