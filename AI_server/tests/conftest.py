import base64
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app as app_module  # noqa: E402


@pytest.fixture
def client():
    app_module.app.config["TESTING"] = True
    with app_module.app.test_client() as c:
        yield c


@pytest.fixture
def valid_base64_image():
    """디코드 가능한 최소한의 JPEG 바이트를 base64로 인코딩해 반환."""
    import cv2

    img = np.zeros((100, 100, 3), dtype=np.uint8)
    ok, buf = cv2.imencode(".jpg", img)
    assert ok
    return base64.b64encode(buf.tobytes()).decode("utf-8")


def make_predictions(class_idx: int, confidence: float = 0.9):
    """7클래스 softmax 출력 흉내: class_idx에 confidence, 나머지 분배."""
    remaining = (1 - confidence) / 6
    preds = np.full(7, remaining, dtype=np.float32)
    preds[class_idx] = confidence
    return preds
