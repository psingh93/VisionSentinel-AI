"""
VisionSentinel AI - Pydantic Data Schemas
OpenCV AI Competition 2026 - AWS-Ready Video Processing Microservice
"""
from typing import List, Optional, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class _FieldInfo:
        def __init__(self, default=None):
            self.default = default

    def Field(default=None, **kwargs):
        return _FieldInfo(default=default)

    class BaseModel:
        def __init__(self, **kwargs):
            # Resolve class annotations and default values
            for cls in reversed(self.__class__.__mro__):
                for k, v in getattr(cls, '__dict__', {}).items():
                    if not k.startswith('_') and not callable(v):
                        if isinstance(v, _FieldInfo):
                            setattr(self, k, v.default)
                        else:
                            setattr(self, k, v)
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self) -> Dict[str, Any]:
            res = {}
            for k, v in self.__dict__.items():
                if not k.startswith('_'):
                    if hasattr(v, 'dict'):
                        res[k] = v.dict()
                    elif isinstance(v, list):
                        res[k] = [item.dict() if hasattr(item, 'dict') else item for item in v]
                    else:
                        res[k] = v
            return res

        def model_dump(self) -> Dict[str, Any]:
            return self.dict()


class VideoMetadata(BaseModel):
    filename: str
    width: int
    height: int
    fps: float
    total_frames: int
    duration_seconds: float
    codec: str = "unknown"
    file_size_bytes: int = 0

class ProcessingConfig(BaseModel):
    motion_threshold: float = Field(default=25.0, ge=1.0, le=100.0, description="Minimum pixel intensity diff for motion")
    min_contour_area: float = Field(default=400.0, ge=50.0, le=10000.0, description="Minimum bounding area in pixels")
    scene_change_threshold: float = Field(default=0.45, ge=0.1, le=1.0, description="Normalized Chi-square/histogram difference threshold")
    frame_sample_rate_fps: float = Field(default=2.0, ge=0.5, le=30.0, description="Sampling rate for analysis")
    enable_optical_flow: bool = True
    enable_contour_tracking: bool = True

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int
    confidence: Optional[float] = None
    motion_intensity: Optional[float] = None
    area_pixels: Optional[int] = None
    label: Optional[str] = None

class VisionEvent(BaseModel):
    id: str
    timestamp_seconds: float
    frame_index: int
    event_type: str  # e.g., 'motion_burst', 'scene_cut', 'stationary_anomaly'
    confidence: Optional[float] = None
    motion_intensity: Optional[float] = None
    method: str  # e.g. 'OpenCV Frame Differencing', 'Color Histogram Chi-Square', 'MOG2'
    bounding_boxes: List[BoundingBox] = []
    motion_energy: float = 0.0
    limitations: str
    reviewer_status: str = "pending"  # 'pending', 'confirmed', 'rejected', 'requires_review'
    reviewer_notes: Optional[str] = None

class Keyframe(BaseModel):
    id: str
    frame_index: int
    timestamp_seconds: float
    thumbnail_data: Optional[str] = None  # Base64 JPEG clean original
    annotated_thumbnail_data: Optional[str] = None  # Base64 JPEG with bounding boxes
    motion_score: float
    is_scene_boundary: bool = False
    associated_event_id: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None

class AnalysisResult(BaseModel):
    analysis_id: str
    video_metadata: VideoMetadata
    config: ProcessingConfig
    events: List[VisionEvent]
    keyframes: List[Keyframe]
    processing_time_ms: float
    effective_fps: float
    opencv_version: str
    environment_notes: str

class GroundTruthAnnotation(BaseModel):
    id: str
    timestamp_seconds: float
    duration_seconds: float = 1.0
    label: str
    notes: Optional[str] = None
    bounding_box: Optional[BoundingBox] = None

class EvaluationRequest(BaseModel):
    detected_events: List[VisionEvent]
    ground_truth: List[GroundTruthAnnotation]
    tolerance_seconds: float = 1.0

class EvaluationMetrics(BaseModel):
    true_positives: int
    false_positives: int
    false_negatives: int
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    tolerance_window_seconds: float
    total_ground_truth_events: int
    total_detected_events: int
    mathematical_notes: str
