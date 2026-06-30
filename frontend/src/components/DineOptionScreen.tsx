'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import './DineOptionScreen.css';

interface Props {
  nextPage: string;
  backPage: string;
}

const DineOptionScreen = ({ nextPage, backPage }: Props) => {
  const router = useRouter();
  const { setDineOption } = useOrder();

  const handleOptionClick = (option: string) => {
    setDineOption(option);
    router.push(nextPage);
  };

  return (
    <div className="dine-option-screen">
      <h1 className="dine-option-title">식사 방식을<br />선택해 주세요.</h1>
      <div className="dine-option-buttons">
        <button className="dine-option-button" onClick={() => handleOptionClick('매장')}>
          <div className="dineoption-shopandpackaging">
            <img src="/images/shop.png" alt="매장 아이콘" className="dineoption-icon-image" />
          </div>
          <span className="dineoption-option-text">매장</span>
        </button>
        <button className="dine-option-button" onClick={() => handleOptionClick('포장')}>
          <div className="dineoption-shopandpackaging">
            <img src="/images/packaging.png" alt="포장 아이콘" className="dineoption-icon-image" />
          </div>
          <span className="dineoption-option-text">픽업</span>
        </button>
      </div>
      <button className="dine-option-back-button" onClick={() => router.push(backPage)}>
        뒤로 가기
      </button>
    </div>
  );
};

export default DineOptionScreen;
