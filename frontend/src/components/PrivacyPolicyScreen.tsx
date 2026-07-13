'use client';

import { useRouter } from 'next/navigation';
import './PrivacyPolicyScreen.css';

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  return (
    <div className="privacy-policy-screen">
      <h1 className="privacy-policy-heading">개인정보처리방침</h1>
      <p className="privacy-policy-subheading">얼굴 이미지 처리 안내</p>

      <div className="privacy-policy-content">
        <section>
          <h2>1. 수집하는 정보</h2>
          <p>
            키오스크 카메라로 촬영한 얼굴 이미지 프레임을 연령대 추정 목적으로만
            일시적으로 사용합니다(5회 촬영 후 평균값 사용). 이름, 연락처 등
            다른 개인 식별 정보는 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2>2. 처리 목적</h2>
          <p>
            촬영된 얼굴 이미지는 오직 연령대(7단계 구간)를 추정하여 화면을
            일반용/고령자용으로 자동 전환하는 데에만 사용됩니다. 그 외의
            목적(신원 확인, 통계 축적, 마케팅 등)으로 사용하지 않습니다.
          </p>
        </section>

        <section>
          <h2>3. 보유 및 폐기</h2>
          <p>
            촬영된 이미지는 디스크나 데이터베이스에 저장되지 않습니다. 이미지는
            브라우저 메모리에서 처리되어 나이 인식 서버로 전송되고, 서버는 이를
            메모리에서만 처리하여 연령대 예측 결과만 반환한 뒤 이미지 관련
            데이터를 즉시 폐기합니다. 연령대 추정이 끝나면 카메라 촬영도 즉시
            종료됩니다.
          </p>
        </section>

        <section>
          <h2>4. 제3자 제공</h2>
          <p>얼굴 이미지 및 그로부터 도출된 연령 정보를 제3자에게 제공하거나 판매하지 않습니다.</p>
        </section>

        <section>
          <h2>5. 통신 구간</h2>
          <p>
            나이 인식 서버와 프론트엔드는 동일 키오스크 기기 내부에서만
            통신하도록 구성되어 있어, 얼굴 이미지가 외부 네트워크를 거치지
            않습니다.
          </p>
        </section>

        <section>
          <h2>6. 이용자 권리</h2>
          <p>
            언제든지 얼굴 인식을 거치지 않고 직원에게 직접 요청하여 서비스를
            이용할 권리가 있습니다.
          </p>
        </section>
      </div>

      <button className="privacy-policy-back-button" onClick={() => router.back()}>
        돌아가기
      </button>
    </div>
  );
};

export default PrivacyPolicyScreen;
