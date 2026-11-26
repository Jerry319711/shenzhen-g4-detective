import React, { useEffect, useRef, useState } from 'react';
import { Eraser, PenTool, Trash2, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PEN_COLORS = ['#1E293B', '#2563EB', '#DC2626', '#059669', '#D97706'];

export const ScratchpadDrawer: React.FC<Props> = ({ open, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState('#1E293B');
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(rect.width * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [open]);

  if (!open) return null;

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPosRef.current = getPos(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !lastPosRef.current) return;
    const pos = getPos(e);
    ctx.strokeStyle = isEraser ? '#FFFDF7' : color;
    ctx.lineWidth = isEraser ? 22 : 3.2;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.42)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      <div
        className="card fade-in"
        style={{
          width: 'min(96vw, 760px)',
          padding: 14,
          background: '#FFFDF7',
          borderColor: '#F59E0B',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: '#92400E' }}>
            ✏️ 神探电子草稿纸（可列竖式、画线段图，手指/鼠标直接写！）
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: c,
                  border: !isEraser && color === c ? '3px solid #F59E0B' : '2px solid #FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              />
            ))}
            <button
              type="button"
              className="btn-soft"
              style={{
                padding: '6px 10px',
                fontSize: 12,
                background: !isEraser ? '#FEF3C7' : '#FFFFFF',
              }}
              onClick={() => setIsEraser(false)}
            >
              <PenTool size={14} /> 画笔
            </button>
            <button
              type="button"
              className="btn-soft"
              style={{
                padding: '6px 10px',
                fontSize: 12,
                background: isEraser ? '#FEF3C7' : '#FFFFFF',
              }}
              onClick={() => setIsEraser(true)}
            >
              <Eraser size={14} /> 橡皮
            </button>
            <button type="button" className="btn-soft" style={{ padding: '6px 10px', fontSize: 12 }} onClick={handleClear}>
              <Trash2 size={14} /> 清空
            </button>
            <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            width: '100%',
            height: 280,
            borderRadius: 14,
            border: '2px dashed #CBD5E1',
            touchAction: 'none',
            cursor: isEraser ? 'cell' : 'crosshair',
            backgroundColor: '#FFFDF7',
            backgroundImage:
              'linear-gradient(to right, rgba(203,213,225,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(203,213,225,0.35) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>
    </div>
  );
};
