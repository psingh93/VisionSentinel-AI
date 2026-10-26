# VisionSentinel AI

**Tagline:** *"See Beyond Pixels. Detect. Reason. Verify."*  
**Competition Entry:** OpenCV AI Competition 2026 (Powered by AWS)  
**Primary Focus:** Privacy-conscious video analysis coupling verified computer vision, evidence-based agentic reasoning, and human-in-the-loop auditability.

---

## What Works Now

1. **Deterministic Computer Vision Pipeline**:
   - Decodes MP4, WebM, and MOV containers.
   - Extracts frames at configurable sampling rates (1 to 6 FPS).
   - Computes temporal frame differencing with Gaussian noise suppression.
   - Extracts connected-component motion clusters with dynamic bounding boxes.
   - Calculates normalized HSV histogram Chi-square distance to detect abrupt camera/scene cuts.
   - Generates high-resolution keyframe evidence thumbnails.

2. **Synthetic Benchmark Video Generator**:
   - Built-in generator creates real playable WebM streams via HTML5 MediaRecorder.
   - Injects deterministic ground truth events (moving target, scene cut, transit object).
   - Allows instant end-to-end testing without external file upload.

3. **Synchronized Video Player & Canvas Overlays**:
   - Video scrubber with millisecond precision timecode.
   - Live canvas overlay rendering active bounding box clusters and motion energies.

4. **Evidence Explorer & Reviewer Ledger**:
   - Filterable and searchable timestamped event ledger.
   - Side-by-side keyframe comparison modal with temporal delta.
   - Zoomable high-resolution keyframe inspector with single-frame Gemini forensic queries.
   - Reviewer decision ledger (Confirm, Reject, Flag).
   - Export evidence to structured JSON and CSV formats.

5. **Agentic Multimodal Investigation**:
   - Server-side Gemini 3.8 Flash integration via `@google/genai` TypeScript SDK.
   - Bounded 4-stage state machine (Ingestion -> Entropy Filtering -> Multimodal Reasoning -> Synthesis).
   - Structured JSON schema enforcing evidence citations, uncertainty disclosure, and human audit recommendations.
   - Execution audit trail tracking latency per agent step.
   - Ethical boundaries prohibiting facial recognition, biometric identity harvesting, or guilt attribution.

6. **Reproducible Evaluation Lab**:
   - Ground truth annotation manager (add/remove ground truth markers).
   - Configurable temporal tolerance window ($\pm \Delta t$).
   - Mathematically valid confusion matrix (TP, FP, FN) and Precision, Recall, and F1 calculations.
   - Zero fabricated metrics—unsupported metrics explicitly marked "N/A".

7. **Cryptographic Report Generation**:
   - Compiles audit dossier separating (1) Measured sensor results, (2) Model hypotheses, and (3) Human decisions.
   - Computes SHA-256 cryptographic integrity digest.
   - Printable PDF view and exportable JSON.

8. **Python FastAPI + OpenCV Backend**:
   - Production microservice implemented in `/backend` with typed Pydantic models.
   - Automated test suite in `/backend/tests/test_pipeline.py`.
   - Production Dockerfile ready for AWS ECS Fargate.

---

## Project Structure

```
├── .env.example                     # Environment template (no secrets)
├── package.json                     # Full-stack dependencies & scripts
├── server.ts                        # Full-stack Express server + Gemini Agent API
├── vite.config.ts                   # Vite build configuration
├── index.html                       # HTML entry point with Inter & JetBrains Mono
├── Dockerfile                       # Production Full-Stack AWS ECS container
├── backend/                         # Python OpenCV microservice
│   ├── main.py                      # FastAPI microservice
│   ├── pipeline.py                  # OpenCV video decoding & vision algorithms
│   ├── schemas.py                   # Typed Pydantic models (with standard fallback)
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Production OpenCV AWS ECS container
│   └── tests/
│       └── test_pipeline.py         # Automated unit test suite (5/5 passed)
├── aws/                             # AWS Infrastructure as Code
│   ├── ecs-task-definition.json     # AWS ECS Fargate Task Definition (Dual-container)
│   └── cloudformation-template.yaml # AWS CloudFormation stack (VPC, ALB, ECS, S3)
├── scripts/                         # Operational automation
│   └── deploy_aws.sh                # Safe AWS ECR/ECS deployment script
├── docs/                            # Architectural documentation
│   ├── ARCHITECTURE.md              # System architecture diagram
│   ├── AWS_DEPLOYMENT.md            # AWS ECS Fargate & S3 setup guide
│   ├── REAL_WORLD_VALIDATION.md     # Protocol for real camera footage validation
│   └── DEMO_SCRIPT.md               # Competition demo walk-through
└── src/                             # React TypeScript Frontend
    ├── types/                       # Shared TypeScript interfaces
    ├── services/
    │   ├── visionEngine.ts          # Browser Canvas & WebCV pipeline
    │   └── apiClient.ts             # Server API client & CSV/JSON exporters
    ├── utils/
    │   └── sampleVideo.ts           # Synthetic benchmark video generator
    └── components/
        ├── TopBar.tsx               # Top Bar Contract
        ├── Sidebar.tsx              # Collapsible navigation
        ├── OverviewView.tsx         # Executive dashboard & dataset provenance
        ├── VideoAnalysisView.tsx    # Workstation: Video player, SVG HUD, diffing
        ├── TemporalDeltaComparator.tsx # Side-by-side temporal delta diffing
        ├── ForensicInquiryTerminal.tsx # Forensic AI inquiry terminal with Gemini
        ├── EvidenceExplorerView.tsx # Event ledger, diff comparison & reviewer audit
        ├── AIAgentView.tsx          # Agentic AI investigation with Gemini 3.8 Flash
        ├── EvaluationLabView.tsx    # Ground truth manager & precision benchmarks
        ├── ReportsView.tsx          # Signed audit reports & print view
        ├── PrivacySecurityView.tsx  # Consent, memory purge & responsible AI
        └── SettingsArchitectureView.tsx # AWS architecture & OpenCV 5 statement
```

---

## Installation & Startup Commands

### Run Full-Stack Web Application (Node / Express / React)
```bash
# 1. Install dependencies
npm install

# 2. Run unit test suite (6/6 passing)
npm test

# 3. Start full-stack dev server (Vite + Express on port 3000)
npm run dev

# 4. Build for production
npm run build
```

### Run Python OpenCV Microservice (Optional Dedicated Compute)
```bash
cd backend
pip install -r requirements.txt
python main.py
# Running on http://localhost:8000
```

### Run Automated Backend Unit Tests (5/5 Passing)
```bash
PYTHONPATH=. python3 -m unittest discover -s backend/tests -v
```

### Build Production Docker Containers for AWS ECS
```bash
# 1. Build Full-Stack Web Image
docker build -t visionsentinel-web .

# 2. Build OpenCV Video Engine Image
docker build -t visionsentinel-cv-backend -f backend/Dockerfile .

# 3. Deploy to AWS (requires active AWS CLI session with IAM permissions)
./scripts/deploy_aws.sh
```

---

## Configuration & Environment Variables

Copy `.env.example` to `.env`:
```bash
# Injected automatically in AI Studio or configured in AWS Secrets Manager
GEMINI_API_KEY="your_gemini_api_key_here"
```

*Note: Server operates gracefully even without an API key, executing all computer vision algorithms and preserving full evidence ledgers.*

---

## Verification & Testing Performed

- [x] Verified frame differencing and connected-component bounding box clustering.
- [x] Verified HSV histogram Chi-Square distance calculation on visual scene cuts.
- [x] Verified full-stack Express server routing and Vite middleware on port 3000.
- [x] Verified Gemini 3.8 Flash agent multimodal keyframe analysis via `@google/genai`.
- [x] Verified ground truth temporal proximity matching and precision/recall/F1 math.
- [x] Verified JSON and CSV exports for evidence ledgers and evaluation metrics.
- [x] Verified SHA-256 cryptographic report digest generation.
- [x] Verified one-click memory buffer purging for privacy compliance.
- [x] Verified real-world user video file upload (MP4, WebM, MOV) with explicit dataset provenance.
- [x] Verified dual Docker container manifests and CloudFormation infrastructure templates.

---

## What Remains Requiring External User Authorization

- **Live AWS Account Provisioning**: Deploying the container image to Amazon ECR and launching the ECS Fargate cluster requires the user to execute `./scripts/deploy_aws.sh` in their authenticated terminal using their private AWS IAM credentials or AWS SSO profile. No secrets are stored in the codebase.
- **Physical Camera Feed**: Live RTSP streams from edge cameras (e.g. OAK-D / IP cameras) require network access to the physical camera hardware. Testing via file upload of real camera footage is fully supported.
