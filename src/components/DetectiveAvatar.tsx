import React from 'react';
import { EquipmentItem } from '../types';

export type AvatarMood = 'happy' | 'thinking' | 'encouraging' | 'celebrating' | 'curious';

interface Props {
  mood?: AvatarMood;
  equippedGear?: Partial<Record<EquipmentItem['slot'], string>>;
  size?: number;
}

export const DetectiveAvatar: React.FC<Props> = ({
  mood = 'happy',
  equippedGear = {},
  size = 110,
}) => {
  const hasClassicHat = equippedGear.hat === 'gear_hat_classic';
  const hasCrown = equippedGear.hat === 'gear_hat_crown';
  const hasGoggles = equippedGear.eyes === 'gear_eyes_goggles';
  const hasStarShades = equippedGear.eyes === 'gear_eyes_star';
  const hasGoldTool = equippedGear.tool === 'gear_tool_gold';
  const hasCape = equippedGear.cape === 'gear_cape_star';
  const hasClover = equippedGear.badge === 'gear_badge_clover';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      style={{ flexShrink: 0, overflow: 'visible' }}
      aria-label="阿探小神探伙伴"
    >
      {/* 柔和光环 */}
      <circle
        cx="70"
        cy="74"
        r="58"
        fill={mood === 'celebrating' ? '#FEF08A' : '#FEF3C7'}
        opacity="0.85"
      />

      {/* 星辰勇气披风 */}
      {hasCape && (
        <path
          d="M32 95 Q16 125 30 132 L110 132 Q124 125 108 95 Z"
          fill="#6366F1"
          stroke="#4338CA"
          strokeWidth="2.5"
        />
      )}

      {/* 身体与领结 */}
      <ellipse cx="70" cy="116" rx="34" ry="20" fill="#F59E0B" />
      <ellipse cx="70" cy="118" rx="22" ry="13" fill="#FFFBEB" />
      {/* 侦探小领结 */}
      <polygon points="60,104 70,110 60,116" fill="#EF4444" />
      <polygon points="80,104 70,110 80,116" fill="#EF4444" />
      <circle cx="70" cy="110" r="3.8" fill="#B91C1C" />

      {/* 冷静四叶草徽章 */}
      {hasClover && (
        <g transform="translate(86, 114)">
          <circle cx="0" cy="-3" r="3.5" fill="#10B981" />
          <circle cx="3" cy="0" r="3.5" fill="#10B981" />
          <circle cx="0" cy="3" r="3.5" fill="#10B981" />
          <circle cx="-3" cy="0" r="3.5" fill="#10B981" />
          <circle cx="0" cy="0" r="1.8" fill="#FEF08A" />
        </g>
      )}

      {/* 柴犬耳朵 */}
      <polygon points="36,54 24,22 54,40" fill="#D97706" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="37,48 30,29 48,41" fill="#FDE68A" />
      <polygon points="104,54 116,22 86,40" fill="#D97706" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="103,48 110,29 92,41" fill="#FDE68A" />

      {/* 柴犬头部 */}
      <circle cx="70" cy="74" r="36" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      {/* 奶油脸颊 */}
      <path d="M38 78 Q50 64 70 72 Q90 64 102 78 Q102 106 70 107 Q38 106 38 78 Z" fill="#FFFBEB" />

      {/* 腮红 */}
      <ellipse cx="47" cy="81" rx="5.5" ry="3.2" fill="#FDA4AF" opacity="0.65" />
      <ellipse cx="93" cy="81" rx="5.5" ry="3.2" fill="#FDA4AF" opacity="0.65" />

      {/* 眼睛（随心情变化） */}
      {mood === 'celebrating' ? (
        <>
          <path d="M49 69 Q55 62 61 69" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M79 69 Q85 62 91 69" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <circle cx="55" cy="68" r="4.8" fill="#1E293B" />
          <circle cx="56.5" cy="66" r="1.7" fill="#FFFFFF" />
          <circle cx="85" cy="66" r="4.8" fill="#1E293B" />
          <circle cx="86.5" cy="64" r="1.7" fill="#FFFFFF" />
          <path d="M78 58 Q85 54 92 58" fill="none" stroke="#92400E" strokeWidth="2.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="55" cy="68" r="5.2" fill="#1E293B" />
          <circle cx="56.8" cy="66.2" r="1.9" fill="#FFFFFF" />
          <circle cx="85" cy="68" r="5.2" fill="#1E293B" />
          <circle cx="86.8" cy="66.2" r="1.9" fill="#FFFFFF" />
        </>
      )}

      {/* 防粗心护目镜 */}
      {hasGoggles && (
        <g>
          <rect x="42" y="59" width="24" height="17" rx="8" fill="rgba(59,130,246,0.22)" stroke="#2563EB" strokeWidth="3" />
          <rect x="74" y="59" width="24" height="17" rx="8" fill="rgba(59,130,246,0.22)" stroke="#2563EB" strokeWidth="3" />
          <line x1="66" y1="67" x2="74" y2="67" stroke="#2563EB" strokeWidth="3" />
        </g>
      )}

      {/* 星际扫描眼镜 */}
      {hasStarShades && (
        <g>
          <polygon points="41,62 67,62 63,75 45,75" fill="rgba(139,92,246,0.78)" stroke="#6D28D9" strokeWidth="2.5" />
          <polygon points="73,62 99,62 95,75 77,75" fill="rgba(139,92,246,0.78)" stroke="#6D28D9" strokeWidth="2.5" />
          <line x1="67" y1="66" x2="73" y2="66" stroke="#FDE047" strokeWidth="3" />
          <line x1="47" y1="66" x2="54" y2="66" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="79" y1="66" x2="86" y2="66" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* 鼻子与嘴巴 */}
      <ellipse cx="70" cy="78" rx="5.5" ry="4" fill="#1E293B" />
      {mood === 'celebrating' ? (
        <path d="M60 85 Q70 96 80 85 Z" fill="#F43F5E" stroke="#92400E" strokeWidth="2" />
      ) : mood === 'thinking' ? (
        <path d="M64 87 Q70 84 76 87" fill="none" stroke="#92400E" strokeWidth="2.8" strokeLinecap="round" />
      ) : (
        <path d="M61 85 Q70 93 79 85" fill="none" stroke="#92400E" strokeWidth="2.8" strokeLinecap="round" />
      )}

      {/* 经典侦探帽 */}
      {hasClassicHat && (
        <g>
          <path d="M35 47 Q70 24 105 47 L96 52 Q70 40 44 52 Z" fill="#78350F" />
          <path d="M44 45 Q70 20 96 45 Z" fill="#92400E" stroke="#78350F" strokeWidth="2" />
          <line x1="56" y1="35" x2="84" y2="35" stroke="#F59E0B" strokeWidth="3" />
        </g>
      )}

      {/* 星光王冠帽 */}
      {hasCrown && (
        <g transform="translate(0, -4)">
          <polygon
            points="44,46 50,24 62,36 70,18 78,36 90,24 96,46"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="36" r="3.5" fill="#EF4444" />
          <circle cx="56" cy="40" r="2.5" fill="#3B82F6" />
          <circle cx="84" cy="40" r="2.5" fill="#10B981" />
        </g>
      )}

      {/* 手持放大镜（基础款或黄金激光款） */}
      <g transform="translate(96, 86)">
        <circle
          cx="12"
          cy="12"
          r="14"
          fill={hasGoldTool ? 'rgba(254, 240, 138, 0.7)' : 'rgba(219, 234, 254, 0.75)'}
          stroke={hasGoldTool ? '#D97706' : '#2563EB'}
          strokeWidth="4.5"
        />
        <line
          x1="22"
          y1="22"
          x2="33"
          y2="33"
          stroke={hasGoldTool ? '#92400E' : '#1E40AF'}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {hasGoldTool && (
          <text x="5" y="17" fontSize="13">✨</text>
        )}
      </g>

      {/* 开心/思考小气泡 */}
      {mood === 'celebrating' && (
        <text x="108" y="34" fontSize="22">⭐</text>
      )}
      {mood === 'encouraging' && (
        <text x="108" y="36" fontSize="20">💪</text>
      )}
      {mood === 'thinking' && (
        <text x="108" y="36" fontSize="20">💡</text>
      )}
    </svg>
  );
};
