# app.py
#
# 사용 기술: Python, Flask, TensorFlow, OpenCV, Haar Cascade, Deep Learning
#
# 처리 흐름:
#   1. POST /predict-age 로 Base64 이미지 수신
#   2. Haar Cascade(haarcascade_frontalface_alt.xml)로 얼굴 검출
#   3. MobileNetV2 기반 TensorFlow 모델로 연령대 예측 (7클래스)
#   4. 클래스를 고령층/청년층 인터페이스로 매핑하여 반환
#
# 연령 클래스:
#   0: 0~9세   → elderly
#   1: 10~19세 → general
#   2: 20~29세 → general
#   3: 30~39세 → general
#   4: 40~49세 → general
#   5: 50~59세 → elderly
#   6: 60세+   → elderly

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import logging
import traceback
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # TensorFlow 불필요 로그 억제
import tensorflow as tf

# 개인정보(얼굴 이미지) 보호: 허용된 프론트엔드 origin에서만 요청 가능하도록 제한
ALLOWED_ORIGINS = os.environ.get(
    'ALLOWED_ORIGINS', 'http://localhost:3000'
).split(',')

app = Flask(__name__)
CORS(app, origins=ALLOWED_ORIGINS)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# ── 경로 설정 ──────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR      = os.path.join(BASE_DIR, 'models', 'my_saved_model')
HAAR_PATH      = os.path.join(MODEL_DIR, 'haarcascade_frontalface_alt.xml')
AGE_MODEL_H5   = os.path.join(MODEL_DIR, 'age_model.h5')
AGE_SAVEDMODEL = os.path.join(MODEL_DIR, 'age_savedmodel')

# ── 연령 클래스 정의 ────────────────────────────────────────────────────────
AGE_CLASSES   = ['0-9세', '10-19세', '20-29세', '30-39세', '40-49세', '50-59세', '60세+']
AGE_MIDPOINTS = [5, 15, 25, 35, 45, 55, 70]  # 각 클래스의 대표 나이

# 클래스 → 인터페이스 매핑
# 클래스 0(0~9세): 아동 → 고령층 화면으로 통일
# 클래스 1~4(10~49세): 청년층
# 클래스 5~6(50세+): 고령층
CLASS_TO_INTERFACE = {
    0: 'elderly',   # 0~9세
    1: 'general',   # 10~19세
    2: 'general',   # 20~29세
    3: 'general',   # 30~39세
    4: 'general',   # 40~49세
    5: 'elderly',   # 50~59세
    6: 'elderly',   # 60세+
}

IMG_SIZE = 224  # MobileNetV2 입력 크기


# ── 모델 로드 ───────────────────────────────────────────────────────────────
def load_age_model():
    """학습된 TensorFlow 나이 인식 모델 로드 (비-ASCII 경로 우회를 위해 임시 경로 경유)"""
    import shutil
    import tempfile

    # SavedModel 형식 우선, 없으면 H5
    if os.path.isdir(AGE_SAVEDMODEL):
        logger.info(f"SavedModel 로드: {AGE_SAVEDMODEL}")
        tmp_dir = tempfile.mkdtemp()
        tmp_sm = os.path.join(tmp_dir, "age_savedmodel")
        shutil.copytree(AGE_SAVEDMODEL, tmp_sm)
        model = tf.keras.models.load_model(tmp_sm)
        shutil.rmtree(tmp_dir, ignore_errors=True)
        return model
    elif os.path.isfile(AGE_MODEL_H5):
        logger.info(f"H5 모델 로드: {AGE_MODEL_H5}")
        tmp_dir = tempfile.mkdtemp()
        tmp_h5 = os.path.join(tmp_dir, "age_model.h5")
        shutil.copy2(AGE_MODEL_H5, tmp_h5)
        model = tf.keras.models.load_model(tmp_h5)
        shutil.rmtree(tmp_dir, ignore_errors=True)
        return model
    else:
        raise FileNotFoundError(
            "학습된 모델이 없습니다.\n"
            "먼저 train_model.py를 실행하여 모델을 학습시켜 주세요.\n"
            "  python train_model.py --data_dir ../models"
        )


def load_face_cascade():
    """OpenCV는 비-ASCII(한글) 경로를 읽지 못하므로 임시 경로로 복사 후 로드."""
    import shutil
    import tempfile
    tmp_dir = tempfile.mkdtemp()
    tmp_haar = os.path.join(tmp_dir, "haarcascade_frontalface_alt.xml")
    shutil.copy2(HAAR_PATH, tmp_haar)
    cascade = cv2.CascadeClassifier(tmp_haar)
    shutil.rmtree(tmp_dir, ignore_errors=True)
    return cascade


logger.info("Haar Cascade 얼굴 검출기 로드 중...")
face_cascade = load_face_cascade()
if face_cascade.empty():
    raise IOError(f"Haar Cascade 로드 실패: {HAAR_PATH}")
logger.info("Haar Cascade 로드 완료")

logger.info("나이 인식 모델 로드 중...")
age_model = load_age_model()
logger.info("나이 인식 모델 로드 완료")


# ── 예측 함수 ───────────────────────────────────────────────────────────────
def preprocess_face(face_img: np.ndarray) -> np.ndarray:
    """얼굴 이미지를 모델 입력 형식으로 전처리"""
    face_rgb    = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
    face_resized = cv2.resize(face_rgb, (IMG_SIZE, IMG_SIZE))
    face_array  = np.expand_dims(face_resized.astype(np.float32), axis=0)
    return face_array


def predict_age_class(face_img: np.ndarray):
    """
    얼굴 이미지에서 연령 클래스와 대표 나이 예측
    Returns: (class_idx, predicted_age, confidence)
    """
    input_tensor = preprocess_face(face_img)
    predictions  = age_model.predict(input_tensor, verbose=0)[0]  # shape: (7,)

    class_idx    = int(np.argmax(predictions))
    confidence   = float(predictions[class_idx])
    predicted_age = AGE_MIDPOINTS[class_idx]

    logger.debug(f"클래스별 확률: {dict(zip(AGE_CLASSES, predictions.tolist()))}")
    logger.debug(f"예측 클래스: {AGE_CLASSES[class_idx]} (신뢰도: {confidence:.3f})")

    return class_idx, predicted_age, confidence


# ── API 엔드포인트 ──────────────────────────────────────────────────────────
@app.route('/predict-age', methods=['POST'])
def predict_age():
    """
    Base64 인코딩된 이미지를 받아 나이 및 인터페이스 유형을 반환

    Request body (JSON):
        { "image": "<base64 문자열>" }

    Response (JSON):
        { "predicted_age": 35, "age_class": "30-39세", "interface": "general", "confidence": 0.91 }
    """
    try:
        logger.debug("요청 수신")

        # 요청 검증
        if not request.is_json:
            return jsonify({'error': 'Content-Type은 application/json이어야 합니다.'}), 400
        if 'image' not in request.json:
            return jsonify({'error': "요청 본문에 'image' 필드가 없습니다."}), 400

        # Base64 디코딩 → OpenCV 이미지 변환
        image_data = request.json['image']
        img_bytes  = base64.b64decode(image_data)
        np_arr     = np.frombuffer(img_bytes, np.uint8)
        img        = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': '이미지 디코딩에 실패했습니다.'}), 400

        # 얼굴 검출 (Haar Cascade + 히스토그램 평탄화로 조명 보정)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(48, 48),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        if len(faces) == 0:
            logger.warning("얼굴이 검출되지 않았습니다.")
            return jsonify({'error': '얼굴이 감지되지 않았습니다.'}), 400

        # 가장 큰 얼굴 선택 (카메라에 가장 가까운 사람)
        x, y, w, h = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]

        # 얼굴 영역에 여백 추가
        margin = int(min(w, h) * 0.1)
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(img.shape[1], x + w + margin)
        y2 = min(img.shape[0], y + h + margin)
        face_crop = img[y1:y2, x1:x2]

        # 나이 예측
        class_idx, predicted_age, confidence = predict_age_class(face_crop)
        interface = CLASS_TO_INTERFACE[class_idx]

        logger.info(
            f"예측 완료 — 연령대: {AGE_CLASSES[class_idx]}, "
            f"대표 나이: {predicted_age}, 인터페이스: {interface}, "
            f"신뢰도: {confidence:.3f}"
        )

        result = {
            'predicted_age': predicted_age,
            'age_class':     AGE_CLASSES[class_idx],
            'interface':     interface,
            'confidence':    round(confidence, 3)
        }

        # 개인정보(얼굴 이미지) 최소 보유 원칙: 응답 생성 직후 이미지 관련 지역 변수를
        # 명시적으로 폐기하여, 이후 예외가 나더라도 콜스택에 이미지 데이터가 남지 않도록 한다.
        del image_data, img_bytes, np_arr, img, gray, face_crop

        return jsonify(result), 200

    except Exception as e:
        logger.error(traceback.format_exc())
        return jsonify({'error': '서버 내부 오류가 발생했습니다.'}), 500


@app.route('/health', methods=['GET'])
def health():
    """서버 상태 확인"""
    return jsonify({'status': 'ok', 'model': 'MobileNetV2-AgeClassifier'}), 200


if __name__ == '__main__':
    # 개인정보(얼굴 이미지) 보호: 운영 환경에서 디버그 모드가 켜져 있으면
    # 예외 발생 시 Werkzeug 인터랙티브 디버거가 요청 변수(이미지 base64 포함)를
    # 브라우저에 그대로 노출할 수 있으므로 기본값은 반드시 False로 둔다.
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    host = os.environ.get('FLASK_HOST', '127.0.0.1')
    app.run(host=host, port=5000, debug=debug_mode)
