'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { predictAge } from '@/api/orderService';
import './FaceRecognition.css';

const FaceRecognition = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [recognitionComplete, setRecognitionComplete] = useState(false);
  const [predictedAge, setPredictedAge] = useState<number | null>(null);
  const [showRecognition, setShowRecognition] = useState(false);

  useEffect(() => {
    let detectionInterval: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;
    let blazeModel: import('@tensorflow-models/blazeface').BlazeFaceModel | null = null;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch((playErr) => console.error('비디오 재생 실패: ', playErr));
          };
        }
      } catch (err) {
        console.error('Error accessing the camera: ', err);
      }
    };

    const detectFaces = async (model: import('@tensorflow-models/blazeface').BlazeFaceModel) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const predictions = await model.estimateFaces(video, false);
      if (predictions.length === 0) return;

      predictions.forEach((prediction) => {
        const [x1, y1] = prediction.topLeft as [number, number];
        const [x2, y2] = prediction.bottomRight as [number, number];
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'red';
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.stroke();

        const label = predictedAge !== null ? `Age: ${predictedAge}` : 'Age loading...';
        ctx.font = '16px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(label, x1, y1 - 10);
      });

      setShowRecognition(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setShowRecognition(false), 5000);

      if (!recognitionComplete) {
        setRecognitionComplete(true);
        setTimeout(() => sendImageForAgePrediction(), 1000);
      }
    };

    const stopCamera = () => {
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
    };

    const captureImage = (): string | null => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return null;
      const canvas = document.createElement('canvas');
      canvas.width = 227;
      canvas.height = 227;
      canvas.getContext('2d')?.drawImage(video, 0, 0, 227, 227);
      return canvas.toDataURL('image/jpeg');
    };

    const sendImageForAgePrediction = async () => {
      // 5장을 하나씩 순차 요청하면 네트워크 왕복 시간이 5번 누적되므로,
      // 동시에 요청해서 왕복 시간을 사실상 1번으로 줄인다.
      const captures = Array.from({ length: 5 }, () => captureImage()).filter(
        (img): img is string => img !== null
      );

      const results = await Promise.allSettled(
        captures.map((imageDataUrl) => predictAge(imageDataUrl.split(',')[1]))
      );

      const predictions: number[] = [];
      let elderlyConfidence = 0;
      let childConfidence = 0;

      results.forEach((result) => {
        if (result.status !== 'fulfilled') {
          console.error('Error predicting age: ', result.reason);
          return;
        }
        const { predicted_age } = result.value;
        predictions.push(predicted_age);
        if (predicted_age >= 50) elderlyConfidence++;
        if (predicted_age < 10) childConfidence++;
      });

      if (predictions.length === 0) return;

      // 나이 판별이 끝났으므로 더 이상 촬영이 필요 없음 → 카메라 즉시 종료(개인정보 최소 보유)
      stopCamera();
      clearInterval(detectionInterval);

      const averageAge = Math.round(predictions.reduce((s, a) => s + a, 0) / predictions.length);
      setPredictedAge(averageAge);

      if (averageAge < 10 || childConfidence >= 3) {
        setTimeout(() => router.push('/elderly-menu'), 2000);
      } else if (averageAge >= 50 || elderlyConfidence >= 3) {
        setTimeout(() => router.push('/elderly-menu'), 2000);
      } else {
        setTimeout(() => router.push('/general-menu'), 2000);
      }
    };

    const loadModelAndStart = async () => {
      const blazeface = await import('@tensorflow-models/blazeface');
      await import('@tensorflow/tfjs-backend-webgl');
      blazeModel = await blazeface.load();
      await startVideo();
      detectionInterval = setInterval(() => {
        if (blazeModel) detectFaces(blazeModel);
      }, 50);
    };

    loadModelAndStart();

    return () => {
      stopCamera();
      clearInterval(detectionInterval);
      clearTimeout(timeoutId);
    };
  }, [router, recognitionComplete]);

  return (
    <div className="face-recognition-screen">
      <h1 className="facerecognition-main-heading-Face">AI가 얼굴인식을 시작합니다</h1>
      <div className="facerecognition-video-container">
        <video ref={videoRef} className="facerecognition-video" playsInline autoPlay muted />
        <canvas ref={canvasRef} className="facerecognition-video-canvas" />
        <div className="facerecognition-overlay-text">카메라 기능</div>
      </div>
      <p className="facerecognition-privacy-notice">
        촬영된 얼굴 이미지는 연령대 추정에만 사용되며,<br />
        어디에도 저장되지 않고 그 즉시 폐기됩니다.
      </p>
      <p className="facerecognition-instruction-text">화면을 잠시 응시해주세요</p>
      {showRecognition && (
        <div className="facerecognition-recognition-popup">
          인식이 완료되었습니다.<br />잠시만 기다려주세요.
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
