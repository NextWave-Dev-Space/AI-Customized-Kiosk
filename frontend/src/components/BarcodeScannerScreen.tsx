'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { createOrder } from '@/api/orderService';
import './BarcodeScannerScreen.css';

interface Props {
  nextPage: string;
  backPage: string;
  userType: 'general' | 'elderly' | 'children';
}

const BarcodeScannerScreen = ({ nextPage, backPage, userType }: Props) => {
  const router = useRouter();
  const { selectedItems, dineOption, discountAmount, cancelAll } = useOrder();
  const [isScanning, setIsScanning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
            await createOrder({
              userType,
              dineOption: dineOption === '매장' ? 'dine_in' : 'take_out',
              paymentMethod: 'pay',
              items: selectedItems,
              discountAmount,
            });
          } catch (e) {
            console.error('주문 저장 실패:', e);
          }
          setTimeout(() => {
            setShowPopup(false);
            cancelAll();
            router.push(nextPage);
          }, 3000);
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
      <button className="barcodescanner-back-button" onClick={() => router.push(backPage)}>뒤로 가기</button>
      {showPopup && (
        <div className="barcodescanner-popup dimmed">
          <div className="barcodescanner-popup-content">
            <p>인식 완료! 잠시만 기다려주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScannerScreen;
