"""
Automated unit tests for VisionSentinel AI Computer Vision & Evaluation Engine
Compatible with both standard library unittest and pytest.
"""
import sys
import unittest

try:
    from backend.schemas import (
        ProcessingConfig, VisionEvent, GroundTruthAnnotation,
        EvaluationRequest, BoundingBox
    )
    from backend.pipeline import evaluate_detections, VideoVisionPipeline
    BACKEND_MODULES_AVAILABLE = True
except ImportError as err:
    BACKEND_MODULES_AVAILABLE = False
    IMPORT_ERROR = str(err)

class TestEvaluationEngine(unittest.TestCase):
    def setUp(self):
        if not BACKEND_MODULES_AVAILABLE:
            self.skipTest(f"Backend requirements missing in current Python environment: {IMPORT_ERROR}")

    def test_evaluation_perfect_match(self):
        detected = [
            VisionEvent(
                id="evt1",
                timestamp_seconds=2.0,
                frame_index=60,
                event_type="motion_burst",
                confidence=0.92,
                method="Frame Difference",
                bounding_boxes=[],
                limitations="none",
                reviewer_status="pending"
            ),
            VisionEvent(
                id="evt2",
                timestamp_seconds=5.5,
                frame_index=165,
                event_type="scene_cut",
                confidence=0.88,
                method="Histogram",
                bounding_boxes=[],
                limitations="none",
                reviewer_status="pending"
            )
        ]
        ground_truth = [
            GroundTruthAnnotation(id="gt1", timestamp_seconds=2.1, label="motion_burst"),
            GroundTruthAnnotation(id="gt2", timestamp_seconds=5.4, label="scene_cut")
        ]

        req = EvaluationRequest(
            detected_events=detected,
            ground_truth=ground_truth,
            tolerance_seconds=0.5
        )
        metrics = evaluate_detections(req)
        self.assertEqual(metrics.true_positives, 2)
        self.assertEqual(metrics.false_positives, 0)
        self.assertEqual(metrics.false_negatives, 0)
        self.assertEqual(metrics.precision, 1.0)
        self.assertEqual(metrics.recall, 1.0)
        self.assertEqual(metrics.f1_score, 1.0)

    def test_evaluation_with_false_positives_and_negatives(self):
        detected = [
            VisionEvent(
                id="evt1",
                timestamp_seconds=1.0,
                frame_index=30,
                event_type="motion_burst",
                method="Diff",
                limitations="none",
                reviewer_status="pending"
            ),
            VisionEvent(
                id="evt2",
                timestamp_seconds=10.0,
                frame_index=300,
                event_type="motion_burst",
                method="Diff",
                limitations="none",
                reviewer_status="pending"
            )
        ]
        ground_truth = [
            GroundTruthAnnotation(id="gt1", timestamp_seconds=1.1, label="motion_burst"),
            GroundTruthAnnotation(id="gt2", timestamp_seconds=20.0, label="missed_event")
        ]

        req = EvaluationRequest(
            detected_events=detected,
            ground_truth=ground_truth,
            tolerance_seconds=0.5
        )
        metrics = evaluate_detections(req)
        self.assertEqual(metrics.true_positives, 1)
        self.assertEqual(metrics.false_positives, 1)
        self.assertEqual(metrics.false_negatives, 1)
        self.assertEqual(metrics.precision, 0.5)
        self.assertEqual(metrics.recall, 0.5)
        self.assertEqual(metrics.f1_score, 0.5)

    def test_evaluation_empty_ground_truth(self):
        req = EvaluationRequest(
            detected_events=[
                VisionEvent(
                    id="evt1",
                    timestamp_seconds=1.0,
                    frame_index=30,
                    event_type="motion",
                    method="Diff",
                    limitations="none"
                )
            ],
            ground_truth=[],
            tolerance_seconds=1.0
        )
        metrics = evaluate_detections(req)
        self.assertEqual(metrics.true_positives, 0)
        self.assertEqual(metrics.false_positives, 1)
        self.assertIsNone(metrics.precision)
        self.assertIsNone(metrics.recall)
        self.assertIsNone(metrics.f1_score)

    def test_config_validation(self):
        config = ProcessingConfig(
            motion_threshold=30.0,
            min_contour_area=500.0,
            scene_change_threshold=0.5
        )
        self.assertEqual(config.motion_threshold, 30.0)
        self.assertEqual(config.frame_sample_rate_fps, 2.0)

    def test_pipeline_runtime_info(self):
        info = VideoVisionPipeline.get_runtime_info()
        self.assertIn("cv2_available", info)
        self.assertIn("cv2_version", info)
        self.assertIn("is_opencv_5", info)

if __name__ == "__main__":
    unittest.main()
