'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import './OrderDetailsScreen.css';

const calculateTotal = (items: { price: number; quantity: number }[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

interface KeypadProps {
  onApplyDiscount: (amount: number) => void;
  onClose: () => void;
}

const Keypad = ({ onApplyDiscount, onClose }: KeypadProps) => {
  const [inputCode, setInputCode] = useState('');

  const handleApply = () => {
    const codes: Record<string, number> = { '123': 1000, '456': 2000, '789': 3000 };
    const discount = codes[inputCode];
    if (discount) {
      onApplyDiscount(discount);
    } else {
      alert('유효하지 않은 쿠폰번호 입니다.');
    }
    setInputCode('');
    onClose();
  };

  return (
    <div className="orderdetails-keypad-overlay">
      <div className="orderdetails-keypad">
        <div className="orderdetails-keypad-header">
          <span>쿠폰 입력</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="orderdetails-coupon-code-box">
          <span className="orderdetails-coupon-label">코드 번호 :</span>
          <span className="orderdetails-coupon-code">{inputCode}</span>
        </div>
        <div className="orderdetails-keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => setInputCode((p) => p + n)}>{n}</button>
          ))}
          <button onClick={() => setInputCode((p) => p.slice(0, -1))}>삭제</button>
          <button onClick={() => setInputCode((p) => p + '0')}>0</button>
          <button onClick={() => setInputCode('')}>초기화</button>
        </div>
        <div className="orderdetails-keypad-actions">
          <button className="orderdetails-keypad-cancel-button" onClick={onClose}>취소</button>
          <button className="orderdetails-keypad-apply-button" onClick={handleApply}>완료</button>
        </div>
      </div>
    </div>
  );
};

interface Props {
  menuPage: string;
  nextPage: string;
}

const OrderDetailsScreen = ({ menuPage, nextPage }: Props) => {
  const router = useRouter();
  const { selectedItems, discountAmount, setDiscountAmount } = useOrder();
  const baseTotal = calculateTotal(selectedItems);
  const [showKeypad, setShowKeypad] = useState(false);

  const handleApplyDiscount = (amount: number) => {
    setDiscountAmount(amount);
  };

  const finalTotal = Math.max(0, baseTotal - discountAmount);

  return (
    <div className="order-details-screen">
      <h1 className="orderdetails-history-header">주문 내역을<br />확인해 주세요.</h1>
      <div className="orderdetails-order-details">
        <div className="orderdetails-order-summary-header">
          <span>제품명</span>
          <span>수량</span>
          <span>금액</span>
        </div>
        {selectedItems.length > 0 ? (
          selectedItems.map((item, idx) => (
            <div key={idx} className="orderdetails-order-item">
              <span>{item.name} {item.option && `(${item.option})`}</span>
              <span>{item.quantity}</span>
              <span>₩{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className="orderdetails-order-item empty-space">주문하신 제품이 없습니다.</div>
        )}
      </div>
      <div className="orderdetails-total-amount">
        <span className="orderdetails-highlight">총 결제금액</span>
        <span>₩{finalTotal.toLocaleString()}</span>
        {discountAmount > 0 && (
          <div className="orderdetails-discount-amount">
            <span>할인금액: -₩{discountAmount.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="orderdetails-order-controls">
        <button className="orderdetailsscreen-coupon-button" onClick={() => setShowKeypad(true)}>쿠폰 입력</button>
        <button className="orderdetailsscreen-cancel-button" onClick={() => router.push(menuPage)}>취소</button>
        <button className="orderdetailsscreen-pay-button" onClick={() => router.push(nextPage)}>결제</button>
      </div>
      {showKeypad && (
        <Keypad onApplyDiscount={handleApplyDiscount} onClose={() => setShowKeypad(false)} />
      )}
    </div>
  );
};

export default OrderDetailsScreen;
