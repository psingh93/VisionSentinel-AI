# Real-World Video Validation Guide
**VisionSentinel AI — OpenCV AI Competition 2026 (Powered by AWS)**

---

## 1. Objective & Scope

While synthetic benchmark vectors verify mathematical correctness and pipeline baseline behavior under controlled conditions, **real-world camera footage validation** tests algorithm robustness against:
* Uncontrolled variable lighting, shadows, and flicker.
* Low-light sensor noise and lens distortion.
* Complex backgrounds (foliage, reflections, atmospheric haze).
* Diverse camera frame rates (15 FPS, 24 FPS, 30 FPS, 60 FPS) and container bitrates.

---

## 2. Segregation Principle: Synthetic vs. Real-World

VisionSentinel AI enforces strict architectural separation between synthetic benchmark data and real-world data:

| Dimension | Synthetic Benchmark | Real-World Video Footage |
| :--- | :--- | :--- |
| **Source Type** | `synthetic_benchmark` | `real_world_upload` |
| **Ground Truth** | Automated deterministic injection | Manual human annotator ledger |
| **Provenance Tag** | `[SYNTHETIC BENCHMARK VECTOR]` | `[REAL-WORLD CAMERA FOOTAGE]` |
| **Audit Status** | Baseline Algorithm Sanity Passed | Evaluated on physical sensor feed |
| **Privacy Scope** | Fully synthetic in-memory canvas | Zero-retention client memory purge |

---

## 3. Recommended Real-World Test Video Specifications

For standard competition validation, use short representative clips meeting the following criteria:

* **Container Format:** MP4 (H.264 / AAC), WebM (VP8 / VP9 / Opus), or MOV.
* **Duration:** 5 to 45 seconds (optimal for local client-side memory safety and rapid review).
* **Resolution:** 720p ($1280 \times 720$) or 1080p ($1920 \times 1080$).
* **File Size:** Under 150 MB.
* **Suggested Scenarios:**
  1. *Perimeter Walkway:* A subject walking across a static hallway, patio, or driveway.
  2. *Doorway Ingress/Egress:* Door opening, transit, and closure.
  3. *Parking Lot / Transit:* Vehicle or bicycle passing through camera field of view.
  4. *Camera Lighting Shift:* Room light turned off or daylight cloud transition.

### Public Reference Datasets (Permitted Open Benchmarks)
If you do not have immediate access to proprietary camera clips, you can test with standard public domain or CC-BY research datasets:
* **VIRAT Video Dataset:** Static surveillance security cameras (aerial and ground).
* **CDnet 2014 (ChangeDetection.net):** Standard thermal, low-framerate, and baseline surveillance video categories.
* **CAVIAR Test Sequences:** Indoor corridor and hallway surveillance benchmarks.

---

## 4. Step-by-Step Real-World Validation Procedure

1. **Navigate to the Workstation:**
   Open the **Video Analysis Workstation** tab.
2. **Select Footage:**
   Drag and drop your real-world camera video file into the drop zone, or click to browse.
3. **Verify Metadata:**
   Confirm the displayed filename, dimensions, duration, and file size match your camera output.
4. **Calibrate Parameters (Optional):**
   * *Motion Threshold:* Default 25 (increase to 35+ for noisy or low-light cameras).
   * *Min Contour Area:* Default 400 px² (increase to 1,000 px² for distant perimeter cameras).
   * *Scene Change Threshold:* Default 0.38 (for abrupt illumination cuts).
5. **Execute Analysis:**
   Click **"Start Computer Vision Pipeline"**. Observe real-time frame-by-frame progress.
6. **Inspect Evidence:**
   * Scrub the timeline to verify bounding boxes overlay actual moving targets.
   * Switch between **Raw Keyframe** and **Annotated Keyframe** in the Workstation.
   * Open the **Temporal Delta Comparator** to inspect pixel differences across adjacent frames.
7. **Conduct Forensic Audit:**
   * Review detected events in the **Evidence Explorer**.
   * Mark events as **Confirmed**, **Flagged**, or **Rejected**.
   * Run Gemini 3.8 Flash agentic inquiry to generate structured hypothesis notes.
8. **Export Signed Dossier:**
   Navigate to **Reports & Dossiers**, click **Sign Audit Report**, and download the cryptographically signed JSON/PDF report containing the SHA-256 digest.
