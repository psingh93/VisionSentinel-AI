"""
VisionSentinel AI - FastAPI Microservice
OpenCV AI Competition 2026 - Video Intelligence Backend
"""
import os
import shutil
import tempfile
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from backend.schemas import (
    ProcessingConfig, AnalysisResult, EvaluationRequest, EvaluationMetrics
)
from backend.pipeline import VideoVisionPipeline, evaluate_detections

app = FastAPI(
    title="VisionSentinel AI Vision Engine",
    description="Privacy-conscious computer vision and frame evidence service for OpenCV AI Competition 2026",
    version="1.0.0"
)

# Configurable CORS
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("APP_URL", "*")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if "*" not in CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024  # 200 MB maximum

@app.get("/health")
def health_check():
    info = VideoVisionPipeline.get_runtime_info()
    return {
        "status": "healthy",
        "service": "VisionSentinel AI Video Engine",
        "runtime": info,
        "aws_ready": True,
        "deployment_target": "AWS ECS Fargate / Lambda container"
    }

@app.get("/capabilities")
def get_capabilities():
    info = VideoVisionPipeline.get_runtime_info()
    return {
        "engine": "OpenCV Video Processing Engine",
        "opencv_version": info["cv2_version"],
        "is_opencv_5": info["is_opencv_5"],
        "notice": (
            "OpenCV 5 APIs are utilized conditionally where supported by the underlying platform build. "
            "Transparent fallback to OpenCV 4.x/headless is strictly adhered to with zero false claims."
        ),
        "supported_codecs": ["h264", "mp4v", "vp8", "vp9", "av1"],
        "max_video_size_mb": 200,
        "privacy_compliance": "Zero-retention temporary buffer processing"
    }

@app.post("/process-video", response_model=AnalysisResult)
async def process_video_endpoint(
    video: UploadFile = File(...),
    motion_threshold: float = Form(25.0),
    min_contour_area: float = Form(400.0),
    scene_change_threshold: float = Form(0.38),
    frame_sample_rate_fps: float = Form(2.5)
):
    if not video.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "MISSING_FILENAME", "message": "No video file provided."}
        )

    # 1. Extension validation & path traversal protection
    allowed_exts = {".mp4", ".mov", ".webm", ".avi", ".mkv", ".ogg"}
    base_name = os.path.basename(video.filename)
    ext = os.path.splitext(base_name)[1].lower()

    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "UNSUPPORTED_FORMAT",
                "message": f"Unsupported format '{ext}'. Allowed: {', '.join(sorted(allowed_exts))}"
            }
        )

    # 2. Parameter validation
    if not (5.0 <= motion_threshold <= 100.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_PARAM", "message": "motion_threshold must be between 5.0 and 100.0."}
        )
    if not (50.0 <= min_contour_area <= 5000.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_PARAM", "message": "min_contour_area must be between 50.0 and 5000.0."}
        )
    if not (0.1 <= scene_change_threshold <= 0.9):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_PARAM", "message": "scene_change_threshold must be between 0.10 and 0.90."}
        )
    if not (0.5 <= frame_sample_rate_fps <= 10.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_PARAM", "message": "frame_sample_rate_fps must be between 0.5 and 10.0."}
        )

    # 3. Safe temporary file creation with random UUID to prevent collision/traversal
    temp_dir = tempfile.mkdtemp(prefix="visionsentinel_")
    secure_filename = f"stream_{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(temp_dir, secure_filename)

    total_bytes = 0
    chunk_size = 1024 * 1024  # 1MB chunk

    try:
        with open(temp_path, "wb") as buffer:
            while chunk := await video.read(chunk_size):
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail={
                            "code": "FILE_TOO_LARGE",
                            "message": f"Video exceeds maximum allowed size of {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB."
                        }
                    )
                buffer.write(chunk)

        if total_bytes == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "EMPTY_FILE", "message": "Uploaded video file is empty (0 bytes)."}
            )

        config = ProcessingConfig(
            motion_threshold=motion_threshold,
            min_contour_area=min_contour_area,
            scene_change_threshold=scene_change_threshold,
            frame_sample_rate_fps=frame_sample_rate_fps
        )

        pipeline = VideoVisionPipeline(config=config)

        # Execute CPU-bound OpenCV decoding in threadpool so FastAPI event loop is unblocked
        result = await run_in_threadpool(pipeline.process_video_file, temp_path)
        # Restore original sanitized basename in metadata
        result.video_metadata.filename = base_name

        return result

    except HTTPException:
        raise
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "DECODING_FAILURE", "message": str(val_err)}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "PIPELINE_ERROR", "message": f"Computer vision analysis error: {str(exc)}"}
        )
    finally:
        # Guarantee prompt cleanup of temporary files
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/evaluate", response_model=EvaluationMetrics)
def evaluate_endpoint(req: EvaluationRequest):
    return evaluate_detections(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
