import cv2
import numpy as np
import torch


# Minimum confidence thresholds per class to eliminate static object misdetections (e.g. bollards/poles as "person")
CLASS_CONF_THRESHOLDS = {
    "person": 0.45,   # Sidewalk bollards/poles score ~25-40% false positive, real humans score > 45%
    "umbrella": 0.45, # Sidewalk shadows score low false positive, real umbrellas score > 45%
}


class YOLOv8Detector:
    """YOLOv8 Object Detector & High-Speed ByteTrack Tracker wrapper using Ultralytics."""

    def __init__(self, model_name: str = "yolov8n.pt", conf_threshold: float = 0.30, iou_threshold: float = 0.45):
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.yolo_model = None

        # Standard 80 COCO classes map
        self.coco_classes = [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
            'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
            'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
            'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
            'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
            'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
            'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
            'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
            'hair drier', 'toothbrush'
        ]

        try:
            from ultralytics import YOLO
            self.yolo_model = YOLO(model_name)
            print(f"Loaded YOLOv8 Model: {model_name}")
        except Exception as e:
            print(f"Notice: Ultralytics load warning ({e}). Initialized fallback vision detector.")

    def detect(self, frame_bgr: np.ndarray, target_classes: list = None) -> list:
        """Runs single-frame object detection with class-specific confidence filtering."""
        results_list = []
        if self.yolo_model is not None:
            results = self.yolo_model(frame_bgr, conf=self.conf_threshold, iou=self.iou_threshold, verbose=False)[0]
            for box in results.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                class_name = self.coco_classes[cls_id] if cls_id < len(self.coco_classes) else f"class_{cls_id}"

                # Apply per-class confidence filter to eliminate static pole false positives
                min_conf = CLASS_CONF_THRESHOLDS.get(class_name, self.conf_threshold)
                if conf < min_conf:
                    continue

                if target_classes and class_name not in target_classes:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                tlwh = [x1, y1, x2 - x1, y2 - y1]
                results_list.append({
                    "bbox_tlwh": tlwh,
                    "confidence": conf,
                    "class_name": class_name
                })
        return results_list

    def track(self, frame_bgr: np.ndarray, target_classes: list = None, tracker_type: str = "bytetrack.yaml") -> list:
        """
        Runs High-Speed Native ByteTrack / BotSORT Tracking directly inside YOLOv8.
        Returns list of track dicts: [{'bbox_tlwh': [x, y, w, h], 'confidence': float, 'class_name': str, 'track_id': int}]
        """
        tracks_list = []
        if self.yolo_model is not None:
            results = self.yolo_model.track(
                frame_bgr,
                persist=True,
                tracker=tracker_type,
                conf=self.conf_threshold,
                iou=self.iou_threshold,
                verbose=False
            )[0]

            if results.boxes is not None and len(results.boxes) > 0:
                for box in results.boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    class_name = self.coco_classes[cls_id] if cls_id < len(self.coco_classes) else f"class_{cls_id}"

                    # Apply per-class confidence filter to eliminate static pole false positives
                    min_conf = CLASS_CONF_THRESHOLDS.get(class_name, self.conf_threshold)
                    if conf < min_conf:
                        continue

                    if target_classes and class_name not in target_classes:
                        continue

                    track_id = int(box.id[0].item()) if (box.id is not None and len(box.id) > 0) else -1
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    tlwh = [x1, y1, x2 - x1, y2 - y1]

                    tracks_list.append({
                        "bbox_tlwh": tlwh,
                        "confidence": conf,
                        "class_name": class_name,
                        "track_id": track_id
                    })
        return tracks_list
