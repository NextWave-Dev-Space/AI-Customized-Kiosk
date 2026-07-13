"""
app.py의 순수 로직 단위 테스트.
실제 모델/Haar Cascade 호출은 monkeypatch로 대체하여 빠르고 결정적으로 검증한다.
"""
import numpy as np
import pytest

import app as app_module
from tests.conftest import make_predictions


class FakeModel:
    def __init__(self, predictions):
        self._predictions = predictions

    def predict(self, input_tensor, verbose=0):
        return np.expand_dims(self._predictions, axis=0)


def test_preprocess_face_resizes_and_converts_to_rgb():
    face_bgr = np.zeros((50, 80, 3), dtype=np.uint8)
    face_bgr[:, :, 0] = 255  # OpenCV BGR에서 파란 채널

    result = app_module.preprocess_face(face_bgr)

    assert result.shape == (1, app_module.IMG_SIZE, app_module.IMG_SIZE, 3)
    assert result.dtype == np.float32
    # BGR(255,0,0) -> RGB(0,0,255): 마지막(R) 채널이 아니라 첫 채널이 0이어야 함
    assert result[0, 0, 0, 0] == 0
    assert result[0, 0, 0, 2] == 255


def test_predict_age_class_returns_argmax_class_and_confidence(monkeypatch):
    fake_predictions = make_predictions(class_idx=3, confidence=0.8)
    monkeypatch.setattr(app_module, "age_model", FakeModel(fake_predictions))

    face_img = np.zeros((100, 100, 3), dtype=np.uint8)
    class_idx, predicted_age, confidence = app_module.predict_age_class(face_img)

    assert class_idx == 3
    assert predicted_age == app_module.AGE_MIDPOINTS[3]
    assert confidence == pytest.approx(0.8, rel=1e-3)


def test_predict_age_class_each_class_maps_to_correct_interface(monkeypatch):
    for class_idx in range(7):
        fake_predictions = make_predictions(class_idx=class_idx, confidence=0.95)
        monkeypatch.setattr(app_module, "age_model", FakeModel(fake_predictions))

        face_img = np.zeros((100, 100, 3), dtype=np.uint8)
        result_class_idx, _, _ = app_module.predict_age_class(face_img)

        assert result_class_idx == class_idx
        assert app_module.CLASS_TO_INTERFACE[result_class_idx] in ("general", "elderly")
