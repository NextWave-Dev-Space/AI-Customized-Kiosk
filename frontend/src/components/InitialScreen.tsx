'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './InitialScreen.css';

const InitialScreen = () => {
  const router = useRouter();
  const [isSpeechTriggered, setIsSpeechTriggered] = useState(false);
  const [instructionText, setInstructionText] = useState('화면을 터치해주세요!');

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'ko-KR';
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  };

  const triggerSpeech = () => {
    if (!isSpeechTriggered && 'speechSynthesis' in window) {
      speakText('어서 오세요. 딥러닝을 활용한 사용자 맞춤형 키오스크입니다. 주문을 시작하려면 아래의 주문 시작 버튼을 눌러주세요.');
      setIsSpeechTriggered(true);
      setInstructionText('현금 결제를 원하시는 분과 시각 장애인이신 분은 카운터로 와주세요.');
    }
  };

  useEffect(() => {
    const handleTouch = () => {
      triggerSpeech();
      window.removeEventListener('click', handleTouch);
    };
    window.addEventListener('click', handleTouch);
    return () => window.removeEventListener('click', handleTouch);
  }, [isSpeechTriggered]);

  return (
    <div className="initial-screen">
      <h1 className="initial-main-heading">
        AI가 주문을 <br />
        도와드려요!
      </h1>
      <p className="initial-subtext">
        AI가 사용자의 얼굴을 인식해서 <br />
        연령을 파악한 후 <br />
        <span className="initial-highlight">맞춤형 화면</span>을 제공해 드립니다.
      </p>

      <div className="initial-instruction-text-container">
        <p className="initial-instruction-text">{instructionText}</p>
      </div>

      <div className="initial-button-container">
        <button className="initial-option-button" onClick={() => router.push('/face-recognition')}>
          주문 시작
        </button>
        <button className="initial-option-button-2" onClick={() => router.push('/secret-root')}>
          비상용
        </button>
        <button className="initial-transparent-button" onClick={() => {}}></button>
      </div>
    </div>
  );
};

export default InitialScreen;
