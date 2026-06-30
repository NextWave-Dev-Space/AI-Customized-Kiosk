'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
          video.onloadedmetadata = () => video.play();
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
        setTimeout(() => sendImageForAgePrediction(), 3000);
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
      const predictions: number[] = [];
      let elderlyConfidence = 0;
      let childConfidence = 0;

      for (let i = 0; i < 5; i++) {
        const imageDataUrl = captureImage();
        if (!imageDataUrl) continue;
        const base64Image = imageDataUrl.split(',')[1];
        try {
          const response = await axios.post(
            'http://localhost:5000/predict-age',
            { image: base64Image },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const { predicted_age } = response.data;
          predictions.push(predicted_age);
          if (predicted_age >= 50) elderlyConfidence++;
          if (predicted_age < 10) childConfidence++;
        } catch (error) {
          console.error('Error predicting age: ', error);
        }
      }

      if (predictions.length === 0) return;
      const averageAge = Math.round(predictions.reduce((s, a) => s + a, 0) / predictions.length);
      setPredictedAge(averageAge);

      if (averageAge < 10 || childConfidence >= 3) {
        setTimeout(() => router.push('/elderly-menu'), 5000);
      } else if (averageAge >= 50 || elderlyConfidence >= 3) {
        setTimeout(() => router.push('/elderly-menu'), 5000);
      } else {
        setTimeout(() => router.push('/general-menu'), 5000);
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
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
      clearInterval(detectionInterval);
      clearTimeout(timeoutId);
    };
  }, [router, recognitionComplete]);

  return (
    <div className="face-recognition-screen">
      <h1 className="facerecognition-main-heading-Face">AI媛 ?쇨뎬?몄떇???쒖옉?⑸땲??</h1>
      <div className="facerecognition-video-container">
        <video ref={videoRef} className="facerecognition-video" playsInline />
        <canvas ref={canvasRef} className="facerecognition-video-canvas" />
        <div className="facerecognition-overlay-text">移대찓??湲곕뒫</div>
      </div>
      <p className="facerecognition-instruction-text">?붾㈃???좎떆 ?묒떆??二쇱꽭??</p>
      {showRecognition && (
        <div className="facerecognition-recognition-popup">
          ?몄떇???꾨즺?덉뒿?덈떎.<br />?좎떆留?湲곕떎?ㅼ＜?몄슂.
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
