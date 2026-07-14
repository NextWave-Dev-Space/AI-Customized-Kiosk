'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useOrder } from '@/context/OrderContext';
import { createOrder } from '@/api/orderService';
import { PENDING_PAYMENT_KEY } from './CardPaymentScreen';
import './BarcodeScannerScreen.css';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';

interface Props {
  nextPage: string;
  backPage: string;
  userType: 'general' | 'elderly' | 'children';
}

const BarcodeScannerScreen = ({ nextPage, backPage, userType }: Props) => {
  const router = useRouter();
  const { selectedItems, dineOption, discountAmount } = useOrder();
  const [isScanning, setIsScanning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isScanning) return;
    let scanner: import('html5-qrcode').Html5QrcodeScanner;

    const initScanner = async () => {
      const { Html5QrcodeScanner, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      scanner = new Html5QrcodeScanner('barcodescanner-reader', {
        fps: 30,
        qrbox: { width: 500, height: 500 },
        supportedScanFormats: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.CODE_128,
        ],
      }, false);

      scanner.render(
        async () => {
          scanner.clear();
          setShowPopup(true);

          try {
            const order = await createOrder({
              userType,
              dineOption: dineOption === '매장' ? 'dine_in' : 'take_out',
              paymentMethod: 'pay',
              items: selectedItems,
              discountAmount,
            });

            sessionStorage.setItem(
              PENDING_PAYMENT_KEY,
              JSON.stringify({ orderId: order.id, nextPage })
            );

            if (!TOSS_CLIENT_KEY) {
              throw new Error('결제 모듈 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
            }

            const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
            await tossPayments.requestPayment('네이버페이', {
              amount: order.totalAmount,
              orderId: `order-${order.id}`,
              orderName:
                selectedItems.length > 1
                  ? `${selectedItems[0].name} 외 ${selectedItems.length - 1}건`
                  : selectedItems[0].name,
              successUrl: `${window.location.origin}/payment-success`,
              failUrl: `${window.location.origin}/payment-fail`,
            });
            // requestPayment가 성공하면 브라우저가 successUrl로 이동하므로 이 아래 코드는 실행되지 않음
          } catch (error) {
            console.error('간편결제 처리 실패:', error);
            setShowPopup(false);
            setErrorMessage(
              error instanceof Error ? error.message : '결제 진행 중 오류가 발생했습니다.'
            );
          }
        },
        (error) => console.warn(`QR scanning failed: ${error}`)
      );
    };

    initScanner();
    return () => { scanner?.clear().catch(() => {}); };
  }, [isScanning]);

  return (
    <div className="barcode-scanner-screen">
      <h1 className="barcodescanner-title">바코드/QR을<br />스캔해 주세요.</h1>
      <div id="barcodescanner-reader" className="barcodescanner-reader-box"></div>
      {!isScanning && (
        <button className="barcodescanner-start-button" onClick={() => setIsScanning(true)}>
          스캔 시작
        </button>
      )}
      {errorMessage && <p className="barcodescanner-error-message">{errorMessage}</p>}
      <button className="barcodescanner-back-button" onClick={() => router.push(backPage)}>뒤로 가기</button>
      {showPopup && (
        <div className="barcodescanner-popup dimmed">
          <div className="barcodescanner-popup-content">
            <p>인식 완료! 결제창으로 이동합니다.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScannerScreen;
