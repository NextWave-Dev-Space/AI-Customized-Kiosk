"""
딥러닝 나이 인식 모델 학습 스크립트
- 기반 모델: MobileNetV2 (ImageNet 사전학습, Transfer Learning)
- 데이터:
    1. models/       : IMDB-WIKI 형식 이미지 (외국인, 62,330장)
    2. --korean_dir  : AI Hub 한국인 얼굴 이미지 (선택)
    3. --child_dir   : 아동 얼굴 이미지 전용 폴더 (선택, AI Hub 아동 데이터 등)
- 출력: AI_server/models/my_saved_model/age_model.h5

연령 클래스 (7개):
    0: 0~9세   → elderly (아동도 고령층 화면 사용)
    1: 10~19세 → general
    2: 20~29세 → general
    3: 30~39세 → general
    4: 40~49세 → general
    5: 50~59세 → elderly
    6: 60세+   → elderly

실행 방법:
    # 기본 (IMDB-WIKI 데이터만)
    python train_model.py

    # 한국인 얼굴 + 아동 데이터 추가
    python train_model.py --korean_dir "C:/data/korean_faces" --child_dir "C:/data/child_faces"

한국인 / 아동 얼굴 데이터 출처:
    - AI Hub 한국인 얼굴 이미지: https://aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=83
    - AI Hub 한국인 연령대별 가족 관계가 있는 얼굴 이미지: https://aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=528
    위 데이터셋에 아동(0~9세) 이미지가 포함되어 있습니다.
    다운로드 후 --child_dir 에 아동 이미지 경로를 지정하세요.
"""

import os
import json
import argparse
import numpy as np
from pathlib import Path
from collections import Counter

import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import (
    EarlyStopping, ModelCheckpoint, ReduceLROnPlateau, Callback
)
from sklearn.model_selection import train_test_split

# ── 하이퍼파라미터 ──────────────────────────────────────────────────────────
IMG_SIZE        = 224   # MobileNetV2 표준 입력 크기
BATCH_SIZE      = 32
EPOCHS_FROZEN   = 10    # backbone 고정 학습
EPOCHS_FINETUNE = 20    # backbone 미세 조정 학습
LEARNING_RATE   = 1e-3
FINETUNE_LR     = 1e-5
NUM_CLASSES     = 7
MIN_AGE, MAX_AGE = 0, 100

# 아동(0)·고령(5,6) 클래스는 데이터가 적으므로 가중치 부스팅
# 30-39세(3)·40-49세(4)는 고령 클래스 부스팅에 밀려 오분류가 많으므로 보정치 추가
MINORITY_BOOST = {0: 2.0, 3: 1.4, 4: 1.8, 5: 1.3, 6: 1.7}
# 30-39/40-49 클래스는 학습 시 샘플을 반복 노출시켜(오버샘플링) 경계 학습을 강화
OVERSAMPLE_FACTOR = {3: 1.5, 4: 2.0}
# ────────────────────────────────────────────────────────────────────────────

AGE_BINS = [0, 10, 20, 30, 40, 50, 60, 101]  # 7개 구간 경계


def age_to_class(age: int) -> int:
    for i in range(len(AGE_BINS) - 1):
        if AGE_BINS[i] <= age < AGE_BINS[i + 1]:
            return i
    return NUM_CLASSES - 1


# ── 파일명 파서 ─────────────────────────────────────────────────────────────

def parse_imdb_wiki(filename: str):
    """
    IMDB-WIKI 형식: {ID}_{생년월일}_{촬영연도}.jpg
    예) 10000217_1981-05-05_2009.jpg → 나이 28
    """
    stem = Path(filename).stem
    parts = stem.split('_')
    if len(parts) < 3:
        return None
    try:
        birth_year = int(parts[1].split('-')[0])
        photo_year = int(parts[2])
        age = photo_year - birth_year
        if MIN_AGE <= age <= MAX_AGE:
            return age
    except (ValueError, IndexError):
        pass
    return None


def parse_aihub_korean(filename: str):
    """
    AI Hub 한국인 얼굴 이미지 파일명에서 나이 추출.
    형식 예시 (데이터셋마다 다를 수 있음):
        F_25_001.jpg, M_60_002.jpg  → 성별_나이_ID
        025F_001.jpg                → 나이+성별_ID
    다운로드한 데이터셋의 실제 파일명 형식에 맞게 수정하세요.
    """
    stem = Path(filename).stem
    parts = stem.split('_')
    # 형식 1: 성별_나이_ID
    if len(parts) >= 2 and parts[0] in ('M', 'F', 'm', 'f'):
        try:
            age = int(parts[1])
            if MIN_AGE <= age <= MAX_AGE:
                return age
        except ValueError:
            pass
    # 형식 2: 나이_성별_ID 또는 나이로 시작하는 경우
    try:
        age = int(parts[0])
        if MIN_AGE <= age <= MAX_AGE:
            return age
    except ValueError:
        pass
    return None


def parse_utkface(filename: str):
    """
    UTKFace Cropped 형식: {나이}_{성별}_{인종}_{날짜}.jpg.chip.jpg
    예) 5_1_1_20170103140724315.jpg.chip.jpg → 나이 5
    인종 코드: 0=White, 1=Asian, 2=Black, 3=Indian, 4=Others
    """
    # .jpg.chip.jpg 또는 .chip.jpg 제거
    stem = filename.replace('.jpg.chip.jpg', '').replace('.chip.jpg', '')
    parts = stem.split('_')
    if len(parts) < 1:
        return None
    try:
        age = int(parts[0])
        if MIN_AGE <= age <= MAX_AGE:
            return age
    except ValueError:
        pass
    return None


def parse_child_dir(filename: str):
    """
    아동 전용 폴더 파일명 파서.
    폴더 구조 예:
        child_faces/
            age_3/  ← 하위 폴더명 = 나이 (load_dataset_by_folder 사용)
            age_7/
    또는 파일명에 나이 포함:
        child_001_age5.jpg, 003_F_6.jpg 등
    파일명에서 나이를 추출하지 못할 경우 load_dataset_by_folder() 사용을 권장.
    """
    stem = Path(filename).stem.lower()
    # "age5", "age_5", "_5_", "_05_" 패턴 탐색
    import re
    match = re.search(r'age[_]?(\d{1,2})', stem)
    if match:
        age = int(match.group(1))
        if MIN_AGE <= age <= MAX_AGE:
            return age
    # 숫자 세그먼트 탐색 (마지막 우선)
    nums = re.findall(r'\d+', stem)
    for n in reversed(nums):
        age = int(n)
        if MIN_AGE <= age <= 15:  # 아동 폴더이므로 범위 제한
            return age
    return None


# ── 데이터 로드 ─────────────────────────────────────────────────────────────

def load_dataset(data_dir: str, parser_fn, desc: str = ""):
    """디렉토리에서 이미지 경로와 클래스 레이블을 로드 (파일명 기반)"""
    paths, labels = [], []
    data_path = Path(data_dir)
    if not data_path.exists():
        print(f"[경고] 경로 없음: {data_dir}")
        return paths, labels

    image_files = list(data_path.glob("*.jpg")) + list(data_path.glob("*.png")) \
                + list(data_path.glob("*.jpeg")) + list(data_path.glob("*.chip.jpg"))
    print(f"[{desc}] 발견된 이미지: {len(image_files)}장")

    skipped = 0
    for img_path in image_files:
        age = parser_fn(img_path.name)
        if age is None:
            skipped += 1
            continue
        paths.append(str(img_path))
        labels.append(age_to_class(age))

    print(f"[{desc}] 유효: {len(paths)}장, 건너뜀: {skipped}장")
    return paths, labels


def load_dataset_by_folder(data_dir: str, desc: str = ""):
    """
    하위 폴더명이 나이(또는 연령대)인 경우 사용.
    예: child_faces/3/*.jpg  → 3세
        child_faces/0-9/*.jpg → 0~9세 (폴더명 파싱 시 범위 중간값 사용)
    """
    paths, labels = [], []
    data_path = Path(data_dir)
    if not data_path.exists():
        return paths, labels

    import re
    for sub in data_path.iterdir():
        if not sub.is_dir():
            continue
        # 폴더명에서 나이 파싱
        name = sub.name
        age = None
        # 단일 숫자: "3", "10", "age_5"
        m = re.fullmatch(r'(\d+)', name)
        if m:
            age = int(m.group(1))
        # 범위: "0-9", "0_9"
        if age is None:
            m = re.match(r'(\d+)[_\-](\d+)', name)
            if m:
                age = (int(m.group(1)) + int(m.group(2))) // 2
        if age is None or not (MIN_AGE <= age <= MAX_AGE):
            continue
        cls = age_to_class(age)
        for img_path in list(sub.glob("*.jpg")) + list(sub.glob("*.png")):
            paths.append(str(img_path))
            labels.append(cls)

    print(f"[{desc}/폴더 구조] 로드: {len(paths)}장")
    return paths, labels


# ── tf.data 파이프라인 ───────────────────────────────────────────────────────

def create_tf_dataset(paths, labels, augment: bool = False):
    def load_and_preprocess(path, label):
        img = tf.io.read_file(path)
        img = tf.image.decode_jpeg(img, channels=3)
        img = tf.image.resize(img, [IMG_SIZE, IMG_SIZE])
        img = tf.cast(img, tf.float32)

        if augment:
            img = tf.image.random_flip_left_right(img)
            img = tf.image.random_brightness(img, 0.25)
            img = tf.image.random_contrast(img, 0.75, 1.25)
            img = tf.image.random_saturation(img, 0.7, 1.3)
            img = tf.image.random_hue(img, 0.08)
            # 랜덤 크롭으로 위치 불변성 강화
            img = tf.image.resize_with_crop_or_pad(img, IMG_SIZE + 24, IMG_SIZE + 24)
            img = tf.image.random_crop(img, [IMG_SIZE, IMG_SIZE, 3])

        img = tf.clip_by_value(img, 0.0, 255.0)
        label_onehot = tf.one_hot(label, NUM_CLASSES)
        return img, label_onehot

    ds = tf.data.Dataset.from_tensor_slices(
        (tf.constant(paths), tf.constant(labels, dtype=tf.int32))
    )
    ds = ds.map(load_and_preprocess, num_parallel_calls=tf.data.AUTOTUNE)
    if augment:
        ds = ds.shuffle(buffer_size=min(len(paths), 5000))
    return ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)


# ── 클래스 가중치 ────────────────────────────────────────────────────────────

def compute_class_weights(labels):
    counts = Counter(labels)
    total  = len(labels)
    weights = {}
    class_names = ['0-9세', '10-19세', '20-29세', '30-39세', '40-49세', '50-59세', '60세+']

    print("\n[클래스 분포]")
    for cls in range(NUM_CLASSES):
        count = counts.get(cls, 1)
        w = (total / (NUM_CLASSES * count)) * MINORITY_BOOST.get(cls, 1.0)
        weights[cls] = w
        print(f"  {class_names[cls]}: {counts.get(cls, 0):,}장  가중치={w:.3f}")
    return weights


# ── 모델 빌드 ────────────────────────────────────────────────────────────────

def build_model():
    """
    MobileNetV2 backbone + 분류 헤드
    head: GAP → BN → Dense(256,relu) → Dropout(0.5) → Dense(128,relu) → Dropout(0.3) → Dense(7,softmax)
    """
    base = MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    base.trainable = False

    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(NUM_CLASSES, activation='softmax')(x)

    return Model(inputs, outputs), base


# ── 학습 상태 저장 콜백 ──────────────────────────────────────────────────────

class SaveStateCallback(Callback):
    """에포크 완료 시마다 현재 phase와 epoch를 JSON으로 저장 (resume 지원)"""
    def __init__(self, state_path: str, phase: int):
        super().__init__()
        self.state_path = state_path
        self.phase = phase

    def on_epoch_end(self, epoch, logs=None):
        state = {'phase': self.phase, 'completed_epoch': epoch + 1}
        with open(self.state_path, 'w') as f:
            json.dump(state, f)


# ── 메인 ─────────────────────────────────────────────────────────────────────

def main(data_dir: str, korean_dir: str, utkface_dir: str, child_dir: str,
         output_dir: str, resume: bool):
    print("=" * 60)
    print("나이 인식 모델 학습 시작")
    print("=" * 60)

    # 1. 데이터 수집
    paths, labels = load_dataset(data_dir, parse_imdb_wiki, "IMDB-WIKI(외국인)")

    if korean_dir:
        kp, kl = load_dataset(korean_dir, parse_aihub_korean, "AI Hub 한국인")
        kp2, kl2 = load_dataset_by_folder(korean_dir, "AI Hub 한국인")
        paths  += kp + kp2
        labels += kl + kl2

    if utkface_dir:
        # utkcropped 하위 폴더가 있으면 우선 사용, 없으면 루트 탐색
        sub = os.path.join(utkface_dir, 'utkcropped')
        if os.path.isdir(sub):
            up, ul = load_dataset(sub, parse_utkface, "UTKFace/utkcropped")
        else:
            up, ul = load_dataset(utkface_dir, parse_utkface, "UTKFace")
        paths  += up
        labels += ul
        print(f"[UTKFace] 최종 {len(up):,}장 추가")

    if child_dir:
        # 파일명 파싱 먼저
        cp, cl = load_dataset(child_dir, parse_child_dir, "아동 얼굴(파일명)")
        # 폴더 구조도 시도 (중복 제거는 set으로)
        cp2, cl2 = load_dataset_by_folder(child_dir, "아동 얼굴(폴더명)")
        seen = set(cp)
        for p, l in zip(cp2, cl2):
            if p not in seen:
                cp.append(p); cl.append(l); seen.add(p)
        paths  += cp
        labels += cl
        print(f"[아동 데이터] 최종 {len(cp)}장 추가")

    if not paths:
        raise RuntimeError("유효한 이미지가 없습니다. 데이터 경로를 확인하세요.")

    print(f"\n[전체] 총 데이터: {len(paths):,}장")

    # 2. 학습/검증/테스트 분리 (70:15:15)
    train_p, temp_p, train_l, temp_l = train_test_split(
        paths, labels, test_size=0.3, stratify=labels, random_state=42
    )
    val_p, test_p, val_l, test_l = train_test_split(
        temp_p, temp_l, test_size=0.5, stratify=temp_l, random_state=42
    )
    print(f"[분할] 학습: {len(train_p):,}  검증: {len(val_p):,}  테스트: {len(test_p):,}")

    # 3. 클래스 가중치 (원본 분포 기준, 아동·고령 클래스 부스팅 포함)
    class_weights = compute_class_weights(train_l)

    # 3-1. 30-39/40-49 오버샘플링 (고령 부스팅에 밀려 오분류되는 경계 클래스 보강)
    if OVERSAMPLE_FACTOR:
        extra_p, extra_l = [], []
        for cls, factor in OVERSAMPLE_FACTOR.items():
            idx = [i for i, l in enumerate(train_l) if l == cls]
            n_extra = int(len(idx) * (factor - 1.0))
            if n_extra > 0:
                chosen = np.random.choice(idx, size=n_extra, replace=True)
                extra_p.extend(train_p[i] for i in chosen)
                extra_l.extend(train_l[i] for i in chosen)
        if extra_p:
            print(f"[오버샘플링] 추가 샘플: {len(extra_p):,}장")
            train_p = train_p + extra_p
            train_l = train_l + extra_l

    # 4. tf.data 파이프라인
    train_ds = create_tf_dataset(train_p, train_l, augment=True)
    val_ds   = create_tf_dataset(val_p,   val_l,   augment=False)
    test_ds  = create_tf_dataset(test_p,  test_l,  augment=False)

    # 5. 출력 경로 및 상태 파일 설정
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    h5_path    = str(out_path / "age_model.h5")
    state_path = str(out_path / "training_state.json")

    # 6. resume 시 저장된 상태 읽기
    start_phase = 1
    start_epoch = 0
    if resume:
        if not os.path.isfile(h5_path):
            raise FileNotFoundError(f"resume 할 모델이 없습니다: {h5_path}")
        if not os.path.isfile(state_path):
            raise FileNotFoundError(f"학습 상태 파일이 없습니다: {state_path}")
        with open(state_path) as f:
            state = json.load(f)
        start_phase = state['phase']
        start_epoch = state['completed_epoch']
        print(f"\n[Resume] Phase {start_phase}, Epoch {start_epoch + 1}부터 이어서 학습합니다.")

    # 7. 모델 구성 또는 로드
    if resume:
        print("[Resume] 저장된 모델 로드 중...")
        import shutil, tempfile
        tmp_dir = tempfile.mkdtemp()
        tmp_h5 = os.path.join(tmp_dir, "age_model.h5")
        shutil.copy2(h5_path, tmp_h5)
        model = tf.keras.models.load_model(tmp_h5)
        shutil.rmtree(tmp_dir, ignore_errors=True)
        # base_model 참조 추출 (Phase 2 fine-tuning 시 필요)
        base_model = next(l for l in model.layers if isinstance(l, tf.keras.Model))
        print(f"[Resume] 모델 로드 완료 (파라미터: {model.count_params():,})")
    else:
        model, base_model = build_model()
        print(f"\n[모델] 파라미터: {model.count_params():,}")

    def make_callbacks(phase: int):
        return [
            EarlyStopping(monitor='val_accuracy', patience=6,
                          restore_best_weights=True, verbose=1),
            ModelCheckpoint(h5_path, monitor='val_accuracy',
                            save_best_only=False, verbose=1),
            ReduceLROnPlateau(monitor='val_loss', factor=0.5,
                              patience=3, min_lr=1e-7, verbose=1),
            SaveStateCallback(state_path, phase=phase),
        ]

    # ── Phase 1: backbone 고정, 분류 헤드 학습 ───────────────────────────
    if start_phase == 1:
        print(f"\n[Phase 1] Backbone 고정 - 분류 헤드 학습 "
              f"(Epoch {start_epoch + 1}/{EPOCHS_FROZEN}부터)")
        base_model.trainable = False
        model.compile(
            optimizer=tf.keras.optimizers.Adam(LEARNING_RATE),
            loss='categorical_crossentropy',
            metrics=['accuracy',
                     tf.keras.metrics.TopKCategoricalAccuracy(k=2, name='top2_acc')]
        )
        model.fit(
            train_ds, epochs=EPOCHS_FROZEN, initial_epoch=start_epoch,
            validation_data=val_ds, class_weight=class_weights,
            callbacks=make_callbacks(phase=1),
        )
        start_epoch = 0  # Phase 2는 처음부터

    # ── Phase 2: 상위 30% 레이어 미세 조정 ───────────────────────────────
    print("\n[Phase 2] Fine-tuning - MobileNetV2 상위 30% 레이어 개방"
          + (f" (Epoch {start_epoch + 1}/{EPOCHS_FINETUNE}부터)"
             if start_phase == 2 else ""))
    base_model.trainable = True
    freeze_until = int(len(base_model.layers) * 0.7)
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False
    print(f"  미세 조정 레이어: {len(base_model.layers) - freeze_until}개 / "
          f"전체 {len(base_model.layers)}개")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(FINETUNE_LR),
        loss='categorical_crossentropy',
        metrics=['accuracy',
                 tf.keras.metrics.TopKCategoricalAccuracy(k=2, name='top2_acc')]
    )
    model.fit(
        train_ds, epochs=EPOCHS_FINETUNE,
        initial_epoch=(start_epoch if start_phase == 2 else 0),
        validation_data=val_ds, class_weight=class_weights,
        callbacks=make_callbacks(phase=2),
    )

    # ── 최종 평가 ────────────────────────────────────────────────────────
    print("\n[최종 평가] 테스트 셋")
    loss, acc, top2 = model.evaluate(test_ds, verbose=1)
    print(f"  정확도: {acc*100:.2f}%  Top-2 정확도: {top2*100:.2f}%")

    # ── 저장 ─────────────────────────────────────────────────────────────
    import shutil, tempfile
    # H5 저장: 임시 경로 경유 (한국어 경로 TF 버그 우회)
    tmp_dir = tempfile.mkdtemp()
    tmp_h5 = os.path.join(tmp_dir, "age_model.h5")
    model.save(tmp_h5)
    shutil.copy2(tmp_h5, h5_path)

    # SavedModel 저장: 임시 경로에 저장 후 이동
    tmp_sm = os.path.join(tmp_dir, "age_savedmodel")
    model.save(tmp_sm, save_format='tf')
    saved_model_path = str(out_path / "age_savedmodel")
    if os.path.exists(saved_model_path):
        shutil.rmtree(saved_model_path)
    shutil.copytree(tmp_sm, saved_model_path)
    shutil.rmtree(tmp_dir, ignore_errors=True)

    print(f"\n[저장 완료]")
    print(f"  H5 모델      : {h5_path}")
    print(f"  SavedModel   : {saved_model_path}")
    print("=" * 60)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='나이 인식 모델 학습')
    parser.add_argument(
        '--data_dir',
        default=os.path.join(os.path.dirname(__file__), '..', 'models'),
        help='IMDB-WIKI 이미지 폴더 (기본: ../models)'
    )
    parser.add_argument(
        '--korean_dir', default='',
        help='AI Hub 한국인 얼굴 이미지 폴더 (선택)'
    )
    parser.add_argument(
        '--utkface_dir', default='',
        help='UTKFace Cropped 이미지 폴더 (선택). 파일명 형식: 나이_성별_인종_날짜.jpg.chip.jpg'
    )
    parser.add_argument(
        '--child_dir', default='',
        help='아동 얼굴 이미지 전용 폴더 (선택). 파일명 또는 하위 폴더명에 나이 포함.'
    )
    parser.add_argument(
        '--output_dir',
        default=os.path.join(os.path.dirname(__file__), 'models', 'my_saved_model'),
        help='학습된 모델 저장 경로'
    )
    parser.add_argument(
        '--resume', action='store_true',
        help='이전에 중단된 학습을 이어서 진행 (age_model.h5 + training_state.json 필요)'
    )
    args = parser.parse_args()
    main(args.data_dir, args.korean_dir, args.utkface_dir, args.child_dir,
         args.output_dir, args.resume)
