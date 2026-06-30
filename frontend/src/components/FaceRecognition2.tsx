'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import './FaceRecognition2.css';

const FaceRecognition2 = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [recognitionComplete, setRecognitionComplete] = useState(false);
  const [predictedAge, setPredictedAge] = useState<number | null>(null);
  const [showRecognition, setShowRecognition] = useState(false);

  useEffect(() => {
    let detectionInterval: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = videoRef.current;
        if (video) { video.srcObject = stream; video.onloadedmetadata = () => video.play(); }
      } catch (err) { console.error('Camera error:', err); }
    };

    const captureImage = () => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return null;
      const canvas = document.createElement('canvas');
      canvas.width = 227; canvas.height = 227;
      canvas.getContext('2d')?.drawImage(video, 0, 0, 227, 227);
      return canvas.toDataURL('image/jpeg');
    };

    const sendImageForAgePrediction = async () => {
      const predictions: number[] = [];
      let elderlyConfidence = 0; let childConfidence = 0;
      for (let i = 0; i < 5; i++) {
        const imageDataUrl = captureImage();
        if (!imageDataUrl) continue;
        const base64Image = imageDataUrl.split(',')[1];
        try {
          const res = await axios.post('http://localhost:5000/predict-age', { image: base64Image });
          const { predicted_age } = res.data;
          predictions.push(predicted_age);
          if (predicted_age >= 50) elderlyConfidence++;
          if (predicted_age < 10) childConfidence++;
        } catch (e) { console.error('Age prediction error:', e); }
      }
      if (!predictions.length) return;
      const avg = Math.round(predictions.reduce((s, a) => s + a, 0) / predictions.length);
      setPredictedAge(avg);
      if (avg < 10 || childConfidence >= 3) setTimeout(() => router.push('/children-menu'), 5000);
      else if (avg >= 50 || elderlyConfidence >= 3) setTimeout(() => router.push('/elderly-menu'), 5000);
      else setTimeout(() => router.push('/general-menu'), 5000);
    };

    const detectFaces = async (model: import('@tensorflow-models/blazeface').BlazeFaceModel) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const predictions = await model.estimateFaces(video, false);
      if (!predictions.length) return;
      predictions.forEach((p) => {
        const [x1, y1] = p.topLeft as [number, number];
        const [x2, y2] = p.bottomRight as [number, number];
        ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = 'blue';
        ctx.rect(x1, y1, x2 - x1, y2 - y1); ctx.stroke();
      });
      setShowRecognition(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setShowRecognition(false), 5000);
      if (!recognitionComplete) {
        setRecognitionComplete(true);
        setTimeout(() => sendImageForAgePrediction(), 3000);
      }
    };

    const load = async () => {
      const blazeface = await import('@tensorflow-models/blazeface');
      await import('@tensorflow/tfjs-backend-webgl');
      const model = await blazeface.load();
      await startVideo();
      detectionInterval = setInterval(() => detectFaces(model), 50);
    };
    load();

    return () => {
      const video = videoRef.current;
      if (video?.srcObject) (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      clearInterval(detectionInterval);
      clearTimeout(timeoutId);
    };
  }, [router, recognitionComplete]);

  return (
    <div className="face-recognition-screen">
      <h1 className="facerecognition-main-heading-Face">AI가 얼굴인식을 시작합니다.</h1>
      <div className="facerecognition-video-container">
        <video ref={videoRef} className="facerecognition-video" playsInline />
        <canvas ref={canvasRef} className="facerecognition-video-canvas" />
        <div className="facerecognition-overlay-text">카메라 기능</div>
      </div>
      <p className="facerecognition-instruction-text">화면을 잠시 응시해 주세요.</p>
      {showRecognition && (
        <div className="facerecognition-recognition-popup">인식을 완료했습니다.<br />잠시만 기다려주세요.</div>
      )}
    </div>
  );
};

export default FaceRecognition2;
