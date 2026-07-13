'use client';

import { useEffect, useRef, useState } from 'react';
import './KioskStage.css';

// 디자인 기준 해상도: iPad 세로모드(9.7~10.2인치) 기준
const STAGE_WIDTH = 768;
const STAGE_HEIGHT = 1024;

export default function KioskStage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(
        window.innerWidth / STAGE_WIDTH,
        window.innerHeight / STAGE_HEIGHT
      );
      setScale(nextScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="kiosk-stage-backdrop">
      <div
        ref={containerRef}
        className="kiosk-stage"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
