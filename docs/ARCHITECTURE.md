# VisionSentinel AI - System Architecture

**OpenCV AI Competition 2026**
*Tagline: "See Beyond Pixels. Detect. Reason. Verify."*

```
                                  +---------------------------------------+
                                  |         Video Input Stream            |
                                  | (MP4, WebM, MOV Container / Camera)   |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     Stage 1: Container Ingestion      |
                                  |  - Stream validation & codec check    |
                                  |  - FPS, Resolution & Duration decode  |
                                  |  - Ephemeral client-side buffer       |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  | Stage 2: Classical Vision Engine      |
                                  |  - Grayscale & Gaussian blur          |
                                  |  - Temporal pixel differencing        |
                                  |  - Connected-component contours       |
                                  |  - HSV histogram Chi-square cuts      |
                                  |  - Motion energy & bounding boxes     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |    Stage 3: Evidence Keyframe Store   |
                                  |  - High-entropy frame serialization   |
                                  |  - Timestamped vision event ledger    |
                                  |  - Bounding box overlay alignment     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |  Stage 4: Agentic AI Investigation    |
                                  |  - Google Gemini 3.8 Flash model      |
                                  |  - Bounded ethical state-machine      |
                                  |  - Cross-frame hypothesis generation  |
                                  |  - Sensor limitation documentation    |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |   Stage 5: Human Review & Audit       |
                                  |  - Event confirmation / rejection     |
                                  |  - Temporal tolerance benchmarking    |
                                  |  - SHA-256 cryptographically sealed   |
                                  |    evaluation dossier (JSON / CSV)    |
                                  +---------------------------------------+
```

## Architectural Decoupling

1. **High-Throughput Vision Decoupled from Semantic Reasoning**:
   Real video decoding and temporal differencing execute deterministically at 30+ FPS. Heavy generative language models are only invoked on high-entropy keyframes, guaranteeing bounded latency, predictable token consumption, and zero hallucinated motion detections.

2. **Server-Side Credential Fortress**:
   All Gemini SDK calls (`@google/genai`) are executed in server-side Express handlers (`/api/investigate`, `/api/analyze-frame`). No API keys or secret tokens exist in the client JavaScript bundle.

3. **Responsible AI Guardrails**:
   - Zero facial recognition or biometric indexing.
   - Separate visual facts from AI interpretations.
   - Require human sign-off before consequential determinations.
