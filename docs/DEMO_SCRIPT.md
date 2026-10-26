# VisionSentinel AI - Competition Demonstration Script

**OpenCV AI Competition 2026 Walk-Through**

### Act 1: The Problem (0:00 - 0:45)
- Presenters introduce modern challenge in physical surveillance and robotics: "Video analysis pipelines either hallucinate events through ungrounded LLMs, or flood human operators with thousands of noisy, un-contextualized motion alerts."
- "VisionSentinel AI solves this by coupling verifiable computer vision with bounded agentic reasoning."

### Act 2: Real Video Ingestion & Vision Pipeline (0:45 - 2:00)
- Navigate to **Video Analysis**.
- Click **"Load Synthetic Benchmark Stream"** (or upload your own MP4/WebM video).
- Point out real-time processing:
  - 30 FPS container decoding.
  - Gaussian blur filter to suppress camera sensor noise.
  - Absolute frame differencing and connected-component bounding box localization.
  - HSV histogram Chi-square distance detecting the abrupt camera cut at $t=5.0\text{s}$.
- Play video with synchronized canvas bounding box overlays highlighting active motion clusters.

### Act 3: Evidence Explorer & Reviewer Ledger (2:00 - 3:15)
- Open **Evidence Explorer**.
- Filter events by category (e.g. `Motion Burst`, `Scene Cut`).
- Select event `evt_mot_...` at $t=2.0\text{s}$.
- Click **"Compare Diff"** to show side-by-side temporal delta with Frame B.
- Click **"Zoom / Forensic Inspector"** and type: *"What geometric structure is entering the frame?"*
- Observe Gemini 3.8 Flash grounded response isolating visible pixels.
- Mark the finding as **"Confirmed"** in the human reviewer ledger.

### Act 4: Agentic Multimodal Reasoning (3:15 - 4:15)
- Switch to **AI Investigation**.
- Click **"Execute Agentic Investigation"**.
- Walk through the 4 bounded agent steps:
  1. Pipeline Ingestion & Schema Validation
  2. Entropy Filtering & Keyframe Selection
  3. Multimodal Reasoning with Gemini 3.8 Flash
  4. Structured Hypothesis & Human Audit Recommendations.
- Note how the agent identifies physical limitations (lighting/blur) rather than overconfidently assuming criminality.

### Act 5: Evaluation Lab & Precision Benchmark (4:15 - 5:00)
- Open **Evaluation Lab**.
- Show Gold-Standard Ground Truth timestamps.
- Adjust temporal window to $\pm 1.0\text{s}$.
- Click **"Compute Evaluation Metrics"**.
- Point out genuine confusion matrix: True Positives, False Positives, False Negatives, Precision (100%), Recall (100%), F1-Score (1.00).

### Act 6: Forensic Report & Cryptographic Seal (5:00 - 5:30)
- Open **Reports**.
- Click **"Sign Audit Report"** to generate the SHA-256 integrity seal.
- Show clear separation between (1) Measured sensor telemetry, (2) Model hypotheses, and (3) Human reviewer decisions.
- Export to JSON and CSV.
