"""
Flask test client를 통한 통합 테스트.
HTTP 요청→JSON 파싱→얼굴 검출→나이 예측→응답까지 전체 파이프라인을 검증한다.
실제 카메라 얼굴 이미지 없이도 결정적으로 테스트할 수 있도록 Haar Cascade 검출 결과와
모델 예측만 monkeypatch로 대체한다.
"""
import base64

import numpy as np

import app as app_module
from tests.conftest import make_predictions


class FakeModel:
    def __init__(self, predictions):
        self._predictions = predictions

    def predict(self, input_tensor, verbose=0):
        return np.expand_dims(self._predictions, axis=0)


class FakeCascade:
    """cv2.CascadeClassifier는 C 확장 타입이라 메서드를 직접 patch할 수 없어 대체 객체로 교체."""

    def __init__(self, faces):
        self._faces = faces

    def detectMultiScale(self, *args, **kwargs):
        return self._faces


def test_health_endpoint_returns_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "model": "MobileNetV2-AgeClassifier"}


def test_predict_age_rejects_non_json_request(client):
    response = client.post("/predict-age", data="not json", content_type="text/plain")

    assert response.status_code == 400
    assert "application/json" in response.get_json()["error"]


def test_predict_age_rejects_missing_image_field(client):
    response = client.post("/predict-age", json={})

    assert response.status_code == 400
    assert "image" in response.get_json()["error"]


def test_predict_age_rejects_invalid_base64_image(client):
    response = client.post("/predict-age", json={"image": "not-a-valid-base64!!"})

    assert response.status_code in (400, 500)


def test_predict_age_returns_400_when_no_face_detected(client, valid_base64_image, monkeypatch):
    monkeypatch.setattr(app_module, "face_cascade", FakeCascade([]))

    response = client.post("/predict-age", json={"image": valid_base64_image})

    assert response.status_code == 400
    assert "얼굴" in response.get_json()["error"]


def test_predict_age_returns_prediction_when_face_detected(client, valid_base64_image, monkeypatch):
    # 얼굴 하나가 (10,10)~(60,60) 위치에서 검출됐다고 가정
    monkeypatch.setattr(app_module, "face_cascade", FakeCascade([(10, 10, 50, 50)]))
    fake_predictions = make_predictions(class_idx=2, confidence=0.87)
    monkeypatch.setattr(app_module, "age_model", FakeModel(fake_predictions))

    response = client.post("/predict-age", json={"image": valid_base64_image})

    assert response.status_code == 200
    body = response.get_json()
    assert body["age_class"] == "20-29세"
    assert body["interface"] == "general"
    assert body["predicted_age"] == app_module.AGE_MIDPOINTS[2]
    assert body["confidence"] == 0.87


def test_predict_age_picks_largest_face_when_multiple_detected(client, valid_base64_image, monkeypatch):
    # 작은 얼굴과 큰 얼굴이 함께 검출됨: 큰 얼굴 기준으로 예측해야 함
    monkeypatch.setattr(
        app_module, "face_cascade", FakeCascade([(0, 0, 20, 20), (30, 30, 60, 60)])
    )
    fake_predictions = make_predictions(class_idx=6, confidence=0.99)
    monkeypatch.setattr(app_module, "age_model", FakeModel(fake_predictions))

    response = client.post("/predict-age", json={"image": valid_base64_image})

    assert response.status_code == 200
    body = response.get_json()
    assert body["age_class"] == "60세+"
    assert body["interface"] == "elderly"


def test_predict_age_elderly_child_class_maps_to_elderly_interface(client, valid_base64_image, monkeypatch):
    monkeypatch.setattr(app_module, "face_cascade", FakeCascade([(10, 10, 50, 50)]))
    fake_predictions = make_predictions(class_idx=0, confidence=0.7)
    monkeypatch.setattr(app_module, "age_model", FakeModel(fake_predictions))

    response = client.post("/predict-age", json={"image": valid_base64_image})

    assert response.status_code == 200
    body = response.get_json()
    assert body["age_class"] == "0-9세"
    assert body["interface"] == "elderly"


def test_predict_age_returns_500_on_unexpected_exception(client, valid_base64_image, monkeypatch):
    class BoomCascade:
        def detectMultiScale(self, *args, **kwargs):
            raise RuntimeError("unexpected failure")

    monkeypatch.setattr(app_module, "face_cascade", BoomCascade())

    response = client.post("/predict-age", json={"image": valid_base64_image})

    assert response.status_code == 500
    assert "오류" in response.get_json()["error"]
