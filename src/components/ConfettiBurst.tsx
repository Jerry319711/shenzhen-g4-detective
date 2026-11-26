import React from 'react';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F97316'];

export const ConfettiBurst: React.FC = () => {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 4.2 + (i % 3) * 2) % 98}%`,
    delay: `${(i % 6) * 0.08}s`,
    color: COLORS[i % COLORS.length],
    rotate: `${(i * 37) % 360}deg`,
  }));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 80,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(85vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: 11,
            height: 11,
            borderRadius: p.id % 2 === 0 ? '50%' : '2px',
            background: p.color,
            animation: `confettiFall 1.55s ease-out ${p.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
};
