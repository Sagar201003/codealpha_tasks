# 🎯 OmniTrack AI - Object Detection and Tracking with YOLOv8 & DeepSORT

**OmniTrack AI** is a real-time Computer Vision system that performs single-pass object detection and Multi-Object Tracking (MOT) using **YOLOv8**, **DeepSORT (8-State Kalman Filter + Re-ID CNN Feature Embeddings + Hungarian Cascade Matching)**, **OpenCV visual annotations**, and **glowing motion trajectory trails**.

---

## 🚀 Key Features & Capabilities

* **🎯 YOLOv8 Object Detection**: High-precision single-pass detection across 80 COCO classes (`person`, `car`, `bicycle`, `dog`, `laptop`, `cell phone`, etc.).
* **🧠 DeepSORT Multi-Object Tracking**:
  * **Re-ID CNN Appearance Embeddings**: Extracts 128-dimensional visual feature vectors to recognize objects even after long occlusions.
  * **8-State Kalman Filter**: Predicts object positions and velocities $\mathbf{x} = [x, y, a, h, \dot{x}, \dot{y}, \dot{a}, \dot{h}]^T$.
  * **Cascaded Matching**: Combines Cosine appearance similarity with spatial IoU matrices to maintain persistent Track IDs (`ID #1`, `ID #2`, etc.) with zero ID switching.
* **✨ OpenCV Visualizer & Glowing Trajectories**:
  * Renders neon bounding box corner accents, confidence badges, persistent Track IDs, and glowing motion trajectory trails.
  * HUD top bar displaying real-time FPS, total active tracks, and per-class summary counters.
* **📹 Dual Input & MP4 Video Exporter**: Supports live webcam streams (`--source 0`), local MP4 video files, and saving annotated MP4 output videos.

---

## 🛠️ Project Structure

```text
CodeAlpha_Object_Detection_and_Tracking/
├── data/
│   ├── download_samples.py      # Downloader/generator for sample test videos
│   ├── sample_traffic.mp4       # Sample traffic test video
│   └── sample_pedestrians.mp4   # Sample pedestrian test video
├── models/
│   ├── detector.py              # YOLOv8 Object Detector wrapper (ultralytics)
│   ├── deepsort_tracker.py      # DeepSORT Tracker Manager & Track state handler
│   └── feature_extractor.py     # PyTorch Re-ID CNN feature extractor (128-d embeddings)
├── utils/
│   ├── kalman_filter.py         # 8-State Kalman Filter state propagation module
│   ├── nn_matching.py           # Cosine Distance Nearest Neighbor solver
│   ├── linear_assignment.py     # Cascaded Matching & Hungarian Algorithm solver
│   └── visualizer.py            # OpenCV bounding box & glowing trajectory trail renderer
├── main.py                      # Core CLI Object Detection & Tracking runner
├── requirements.txt             # Dependencies (ultralytics, opencv-python, numpy, scipy, torch)
└── README.md                    # Complete documentation
```

---

## 💻 How to Run Locally on Your System

### Step 1: Clone Repository & Install Dependencies
```bash
cd CodeAlpha_Object_Detection_and_Tracking
pip install -r requirements.txt
```

### Step 2: Generate Sample Test Videos (Optional)
```bash
python data/download_samples.py
```

---

## 💻 CLI Command Examples

### 1. Live Webcam Tracking
```bash
python main.py --source 0
```

### 2. Video File Tracking with Trajectory Trails
```bash
python main.py --source data/sample_traffic.mp4
```

### 3. Filter Specific Object Classes (e.g. Person and Car)
```bash
python main.py --source data/sample_pedestrians.mp4 --classes person car
```

### 4. Headless Execution & Save Annotated Video to File
```bash
python main.py --source data/sample_traffic.mp4 --no_display --save_video data/output_traffic.mp4
```

---

## 📄 License & Internship Notes

Developed under the **CodeAlpha Web Development Internship Program** by **Sagar Shukla**.
