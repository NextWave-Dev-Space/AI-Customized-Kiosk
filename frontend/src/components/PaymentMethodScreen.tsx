'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import './PaymentMethodScreen.css';

interface Props {
  cardPage: string;
  barcodePage: string;
  backPage: string;
}

const PaymentMethodScreen = ({ cardPage, barcodePage, backPage }: Props) => {
  const router = useRouter();
  const { setPaymentMethod } = useOrder();
  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);

  const handlePaymentMethodClick = (method: string) => {
    setPaymentMethod(method);
    if (method === '카드') {
      router.push(cardPage);
    } else {
      router.push(barcodePage);
    }
  };

  const handleCallEmployee = () => {
    setIsEmployeePopupVisible(true);
    setTimeout(() => setIsEmployeePopupVisible(false), 5000);
  };

  return (
    <div className="payment-method-screen">
      <h1 className="payment-method-title">결제 방식을<br />선택하세요.</h1>
      <div className="payment-method-options">
        <button className="payment-method-option-button" onClick={() => handlePaymentMethodClick('카드')}>카드</button>
        <button className="payment-method-option-button" onClick={() => handlePaymentMethodClick('페이')}>페이</button>
      </div>
      <button className="payment-method-employee-call-button" onClick={handleCallEmployee}>직원 호출</button>
      <button className="paymentmethod-back-button" onClick={() => router.push(backPage)}>뒤로 가기</button>
      {isEmployeePopupVisible && (
        <div className="paymentmethod-employee-popup dimmed">
          <div className="paymentmethod-employee-popup-content">
            <p>직원을 호출했습니다!<br />도움을 드릴테니 잠시만 기다려주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodScreen;
