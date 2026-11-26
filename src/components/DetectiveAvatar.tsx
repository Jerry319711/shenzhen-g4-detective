import React, { useId } from 'react';
import { EquipmentItem, SkinId } from '../types';

export type AvatarMood = 'happy' | 'thinking' | 'encouraging' | 'celebrating' | 'curious';

interface Props {
  mood?: AvatarMood;
  equippedGear?: Partial<Record<EquipmentItem['slot'], string>>;
  skinId?: SkinId;
  size?: number;
  animated?: boolean;
}

const SKIN_STYLES: Record<
  SkinId,
  {
    furTop: string;
    furBottom: string;
    furStroke: string;
    earInner: string;
    cheek: string;
    haloA: string;
    haloB: string;
    eyeColor: string;
    bow: string;
  }
> = {
  skin_classic: {
    furTop: '#FBBF24', furBottom: '#EA580C', furStroke: '#B45309',
    earInner: '#FEF3C7', cheek: '#FFFBEB', haloA: '#FEF08A', haloB: '#FDE68A',
    eyeColor: '#1E293B', bow: '#EF4444',
  },
  skin_ice: {
    furTop: '#7DD3FC', furBottom: '#0284C7', furStroke: '#0369A1',
    earInner: '#F0F9FF', cheek: '#F8FAFC', haloA: '#BAE6FD', haloB: '#E0F2FE',
    eyeColor: '#0C4A6E', bow: '#2563EB',
  },
  skin_ninja: {
    furTop: '#475569', furBottom: '#0F172A', furStroke: '#020617',
    earInner: '#94A3B8', cheek: '#CBD5E1', haloA: '#334155', haloB: '#991B1B',
    eyeColor: '#FACC15', bow: '#DC2626',
  },
  skin_wizard: {
    furTop: '#A78BFA', furBottom: '#5B21B6', furStroke: '#4C1D95',
    earInner: '#EDE9FE', cheek: '#FAF5FF', haloA: '#C4B5FD', haloB: '#FDE047',
    eyeColor: '#3B0764', bow: '#F59E0B',
  },
  skin_astronaut: {
    furTop: '#F8FAFC', furBottom: '#94A3B8', furStroke: '#475569',
    earInner: '#DBEAFE', cheek: '#FFFFFF', haloA: '#1E3A8A', haloB: '#38BDF8',
    eyeColor: '#0F172A', bow: '#2563EB',
  },
  skin_dragon: {
    furTop: '#F87171', furBottom: '#991B1B', furStroke: '#7F1D1D',
    earInner: '#FDE047', cheek: '#FEF2F2', haloA: '#FCA5A5', haloB: '#F97316',
    eyeColor: '#FEF08A', bow: '#FACC15',
  },
  skin_gold_king: {
    furTop: '#FEF08A', furBottom: '#CA8A04', furStroke: '#854D0E',
    earInner: '#FFFBEB', cheek: '#FEFCE8', haloA: '#FDE047', haloB: '#F59E0B',
    eyeColor: '#1E3A8A', bow: '#DC2626',
  },
  skin_mecha: {
    furTop: '#E2E8F0', furBottom: '#334155', furStroke: '#0E7490',
    earInner: '#22D3EE', cheek: '#F1F5F9', haloA: '#083344', haloB: '#22D3EE',
    eyeColor: '#22D3EE', bow: '#06B6D4',
  },
};

export const DetectiveAvatar: React.FC<Props> = ({
  mood = 'happy',
  equippedGear = {},
  skinId = 'skin_classic',
  size = 110,
  animated = true,
}) => {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const pal = SKIN_STYLES[skinId] || SKIN_STYLES.skin_classic;

  const hat = equippedGear.hat;
  const eyes = equippedGear.eyes;
  const tool = equippedGear.tool;
  const cape = equippedGear.cape;
  const badge = equippedGear.badge;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={animated ? 'avatar-float' : undefined}
      style={{ flexShrink: 0, overflow: 'visible' }}
      aria-label="阿探小神探伙伴"
    >
      <defs>
        <linearGradient id={`fur-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.furTop} />
          <stop offset="100%" stopColor={pal.furBottom} />
        </linearGradient>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={pal.haloA} stopOpacity="0.9" />
          <stop offset="72%" stopColor={pal.haloB} stopOpacity="0.38" />
          <stop offset="100%" stopColor={pal.haloB} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id={`cyber-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`flame-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="55%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ==================== 1. 炫酷主题背景光环与魔法阵 ==================== */}
      <circle cx="80" cy="84" r="72" fill={`url(#halo-${uid})`} />

      {/* 机甲 HUD 旋转激光环 */}
      {skinId === 'skin_mecha' && (
        <g className="avatar-spin-slow" style={{ transformOrigin: '80px 84px' }}>
          <circle cx="80" cy="84" r="66" fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="14 8 4 8" />
          <circle cx="80" cy="84" r="57" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.7" />
        </g>
      )}

      {/* 星空魔法师旋转魔法阵 */}
      {skinId === 'skin_wizard' && (
        <g className="avatar-spin-slow" style={{ transformOrigin: '80px 84px' }}>
          <circle cx="80" cy="84" r="66" fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="6 6" />
          <polygon points="80,20 135,116 25,116" fill="none" stroke="#C4B5FD" strokeWidth="1.5" opacity="0.75" />
          <polygon points="80,148 135,52 25,52" fill="none" stroke="#C4B5FD" strokeWidth="1.5" opacity="0.75" />
        </g>
      )}

      {/* 黄金圣斗士神圣太阳光轮 */}
      {skinId === 'skin_gold_king' && (
        <g className="avatar-spin-slow" style={{ transformOrigin: '80px 84px' }}>
          <circle cx="80" cy="84" r="65" fill="none" stroke="#FACC15" strokeWidth="3" strokeDasharray="10 6" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="80"
              y1="14"
              x2="80"
              y2="24"
              stroke="#FEF08A"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${deg} 80 84)`}
            />
          ))}
        </g>
      )}

      {/* 太空宇航员轨道星环 */}
      {skinId === 'skin_astronaut' && (
        <g>
          <ellipse cx="80" cy="88" rx="70" ry="22" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="8 6" transform="rotate(-18 80 88)" opacity="0.75" />
          <circle cx="22" cy="108" r="5" fill="#FACC15" />
          <circle cx="139" cy="64" r="4" fill="#38BDF8" />
        </g>
      )}

      {/* 极地冰雪晶环 */}
      {skinId === 'skin_ice' && (
        <g opacity="0.85">
          <circle cx="80" cy="84" r="64" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 8" />
          <text x="14" y="42" fontSize="16">❄️</text>
          <text x="130" y="46" fontSize="14">💎</text>
          <text x="18" y="132" fontSize="14">❄️</text>
        </g>
      )}

      {/* ==================== 2. 专属羽翼 / 机甲推进器 / 龙翼 / 火箭背包 ==================== */}
      {/* 烈焰龙骑士：巨型火焰龙翼 */}
      {skinId === 'skin_dragon' && (
        <g filter={`url(#glow-${uid})`}>
          <path d="M44 92 L8 50 L18 76 L6 88 L26 98 L16 112 L48 112 Z" fill={`url(#flame-${uid})`} stroke="#7F1D1D" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M116 92 L152 50 L142 76 L154 88 L134 98 L144 112 L112 112 Z" fill={`url(#flame-${uid})`} stroke="#7F1D1D" strokeWidth="2.2" strokeLinejoin="round" />
        </g>
      )}

      {/* 黄金圣斗士：璀璨黄金圣翼 */}
      {skinId === 'skin_gold_king' && (
        <g filter={`url(#glow-${uid})`}>
          <path d="M46 92 Q10 56 12 80 Q24 88 18 100 Q30 104 26 114 L50 112 Z" fill={`url(#gold-${uid})`} stroke="#A16207" strokeWidth="2" />
          <path d="M114 92 Q150 56 148 80 Q136 88 142 100 Q130 104 134 114 L110 112 Z" fill={`url(#gold-${uid})`} stroke="#A16207" strokeWidth="2" />
        </g>
      )}

      {/* 星际机甲：赛博能量翼 + 霓虹推进器 */}
      {skinId === 'skin_mecha' && (
        <g filter={`url(#glow-${uid})`}>
          <polygon points="46,90 8,62 18,90 10,110 48,112" fill={`url(#cyber-${uid})`} stroke="#ECFEFF" strokeWidth="2" />
          <polygon points="114,90 152,62 142,90 150,110 112,112" fill={`url(#cyber-${uid})`} stroke="#ECFEFF" strokeWidth="2" />
          <line x1="18" y1="78" x2="40" y2="96" stroke="#ECFEFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="142" y1="78" x2="120" y2="96" stroke="#ECFEFF" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 太空宇航员：双管喷射火箭背包 */}
      {skinId === 'skin_astronaut' && (
        <g>
          <rect x="30" y="92" width="16" height="32" rx="6" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          <rect x="114" y="92" width="16" height="32" rx="6" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          <path d="M33 124 L38 140 L43 124 Z" fill="#38BDF8" className="avatar-pulse" />
          <path d="M117 124 L122 140 L127 124 Z" fill="#38BDF8" className="avatar-pulse" />
        </g>
      )}

      {/* 暗影忍者：背后交叉忍刀 + 飞舞手里剑 */}
      {skinId === 'skin_ninja' && (
        <g>
          <line x1="36" y1="54" x2="112" y2="124" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
          <line x1="124" y1="54" x2="48" y2="124" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
          <circle cx="34" cy="52" r="5" fill="#DC2626" />
          <circle cx="126" cy="52" r="5" fill="#DC2626" />
          {/* 悬浮手里剑 */}
          <g transform="translate(20, 74)" className="avatar-spin-slow" style={{ transformOrigin: '0px 0px' }}>
            <polygon points="0,-11 3,-3 11,0 3,3 0,11 -3,3 -11,0 -3,-3" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.2" fill="#DC2626" />
          </g>
        </g>
      )}

      {/* 穿戴披风（或魔法师自带星空斗篷） */}
      {(cape === 'gear_cape_star' || cape === 'gear_cape_flame' || skinId === 'skin_wizard') && (
        <path
          d="M36 102 Q20 136 36 144 L124 144 Q140 136 124 102 Z"
          fill={
            cape === 'gear_cape_flame'
              ? `url(#flame-${uid})`
              : skinId === 'skin_wizard'
              ? '#4C1D95'
              : '#6366F1'
          }
          stroke={cape === 'gear_cape_flame' ? '#FACC15' : '#C4B5FD'}
          strokeWidth="2.5"
        />
      )}

      {/* ==================== 3. 身体、战甲与胸口核心 ==================== */}
      <ellipse cx="80" cy="126" rx="36" ry="22" fill={`url(#fur-${uid})`} stroke={pal.furStroke} strokeWidth="2" />
      <ellipse cx="80" cy="128" rx="23" ry="14" fill={pal.cheek} />

      {/* 不同皮肤的专属胸甲/围巾/反应堆 */}
      {skinId === 'skin_mecha' ? (
        <g>
          <path d="M52 114 L80 124 L108 114 L104 138 L80 144 L56 138 Z" fill="#1E293B" stroke="#22D3EE" strokeWidth="2.2" />
          <circle cx="80" cy="127" r="9" fill="#06B6D4" filter={`url(#glow-${uid})`} className="avatar-pulse" />
          <circle cx="80" cy="127" r="4.5" fill="#ECFEFF" />
        </g>
      ) : skinId === 'skin_gold_king' ? (
        <g>
          <path d="M52 114 L80 124 L108 114 L104 138 L80 144 L56 138 Z" fill={`url(#gold-${uid})`} stroke="#92400E" strokeWidth="2" />
          <polygon points="80,119 88,128 80,137 72,128" fill="#EF4444" stroke="#FEF08A" strokeWidth="1.5" />
        </g>
      ) : skinId === 'skin_dragon' ? (
        <g>
          <path d="M52 114 L80 124 L108 114 L104 138 L80 144 L56 138 Z" fill="#7F1D1D" stroke="#FACC15" strokeWidth="2.2" />
          <polygon points="80,118 87,132 73,132" fill="#FACC15" />
        </g>
      ) : skinId === 'skin_astronaut' ? (
        <g>
          <rect x="64" y="118" width="32" height="19" rx="5" fill="#E2E8F0" stroke="#2563EB" strokeWidth="2" />
          <circle cx="72" cy="127" r="3.5" fill="#EF4444" />
          <circle cx="81" cy="127" r="3.5" fill="#22C55E" />
          <rect x="87" y="124" width="6" height="6" rx="1" fill="#3B82F6" />
        </g>
      ) : skinId === 'skin_ninja' ? (
        <g>
          <path d="M52 112 Q80 126 108 112 L106 125 Q80 137 54 125 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.8" />
        </g>
      ) : (
        <g>
          {/* 经典/冰雪/魔法师侦探领结 */}
          <polygon points="69,113 80,120 69,127" fill={pal.bow} />
          <polygon points="91,113 80,120 91,127" fill={pal.bow} />
          <circle cx="80" cy="120" r="4.2" fill="#991B1B" />
        </g>
      )}

      {/* 徽章槽位 */}
      {badge === 'gear_badge_clover' && (
        <g transform="translate(101, 125)">
          <circle cx="0" cy="-3.5" r="3.8" fill="#10B981" />
          <circle cx="3.5" cy="0" r="3.8" fill="#10B981" />
          <circle cx="0" cy="3.5" r="3.8" fill="#10B981" />
          <circle cx="-3.5" cy="0" r="3.8" fill="#10B981" />
          <circle cx="0" cy="0" r="2" fill="#FEF08A" />
        </g>
      )}
      {badge === 'gear_badge_diamond' && (
        <polygon points="101,117 109,125 101,134 93,125" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.2" filter={`url(#glow-${uid})`} />
      )}

      {/* ==================== 4. 耳朵 & 龙角 / 机甲天线 ==================== */}
      <polygon points="46,62 32,26 64,46" fill={pal.furStroke} stroke={pal.furStroke} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="47,55 39,34 58,47" fill={pal.earInner} />
      <polygon points="114,62 128,26 96,46" fill={pal.furStroke} stroke={pal.furStroke} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="113,55 121,34 102,47" fill={pal.earInner} />

      {/* 烈焰龙角 */}
      {skinId === 'skin_dragon' && (
        <g>
          <path d="M54 50 Q42 22 58 14 Q58 30 64 46 Z" fill={`url(#gold-${uid})`} stroke="#92400E" strokeWidth="2" />
          <path d="M106 50 Q118 22 102 14 Q102 30 96 46 Z" fill={`url(#gold-${uid})`} stroke="#92400E" strokeWidth="2" />
        </g>
      )}

      {/* 星际机甲：高达风 V 型能量天线 */}
      {skinId === 'skin_mecha' && (
        <g filter={`url(#glow-${uid})`}>
          <polygon points="80,46 50,22 58,36 80,52 102,36 110,22" fill="#FACC15" stroke="#B45309" strokeWidth="1.8" strokeLinejoin="round" />
          <polygon points="80,34 74,47 86,47" fill="#22D3EE" stroke="#ECFEFF" strokeWidth="1.5" />
        </g>
      )}

      {/* ==================== 5. 柴犬头部 & 皮肤专属面部装甲 ==================== */}
      <circle cx="80" cy="82" r="38" fill={`url(#fur-${uid})`} stroke={pal.furStroke} strokeWidth="2.2" />
      <path d="M46 86 Q59 71 80 80 Q101 71 114 86 Q114 116 80 117 Q46 116 46 86 Z" fill={pal.cheek} />

      {/* 机甲金属额甲与发光线条 */}
      {skinId === 'skin_mecha' && (
        <g>
          <path d="M45 68 Q80 54 115 68 L110 75 Q80 65 50 75 Z" fill="#1E293B" stroke="#22D3EE" strokeWidth="2" />
          <rect x="46" y="71" width="68" height="17" rx="8" fill="rgba(6, 182, 212, 0.25)" stroke="#22D3EE" strokeWidth="2.2" />
        </g>
      )}

      {/* 忍者酷红护额头带 + 暗影面罩 */}
      {skinId === 'skin_ninja' && (
        <g>
          <rect x="42" y="54" width="76" height="12" rx="6" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
          <rect x="68" y="55" width="24" height="10" rx="3" fill="#CBD5E1" stroke="#334155" strokeWidth="1.5" />
          <line x1="74" y1="60" x2="86" y2="60" stroke="#0F172A" strokeWidth="1.8" />
          <path d="M116 58 L138 50 L133 63 Z" fill="#DC2626" />
          <path d="M116 61 L134 69 L126 74 Z" fill="#B91C1C" />
        </g>
      )}

      {/* 腮红 */}
      {skinId !== 'skin_mecha' && (
        <>
          <ellipse cx="55" cy="89" rx="5.8" ry="3.4" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="105" cy="89" rx="5.8" ry="3.4" fill="#FDA4AF" opacity="0.65" />
        </>
      )}

      {/* 眼睛 */}
      {mood === 'celebrating' ? (
        <>
          <path d="M58 78 Q64 70 70 78" fill="none" stroke={pal.eyeColor} strokeWidth="3.8" strokeLinecap="round" />
          <path d="M90 78 Q96 70 102 78" fill="none" stroke={pal.eyeColor} strokeWidth="3.8" strokeLinecap="round" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <circle cx="64" cy="77" r="5.2" fill={pal.eyeColor} />
          <circle cx="65.8" cy="75" r="1.8" fill="#FFFFFF" />
          <circle cx="96" cy="75" r="5.2" fill={pal.eyeColor} />
          <circle cx="97.8" cy="73" r="1.8" fill="#FFFFFF" />
          <path d="M88 66 Q96 62 103 66" fill="none" stroke={pal.furStroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="64" cy="77" r="5.5" fill={pal.eyeColor} />
          <circle cx="66" cy="75" r="2" fill="#FFFFFF" />
          <circle cx="96" cy="77" r="5.5" fill={pal.eyeColor} />
          <circle cx="98" cy="75" r="2" fill="#FFFFFF" />
        </>
      )}

      {/* 鼻子与嘴巴 */}
      <ellipse cx="80" cy="87" rx="5.8" ry="4.2" fill="#1E293B" />
      {mood === 'celebrating' ? (
        <path d="M69 94 Q80 106 91 94 Z" fill="#F43F5E" stroke="#92400E" strokeWidth="2" />
      ) : mood === 'thinking' ? (
        <path d="M74 96 Q80 93 86 96" fill="none" stroke="#92400E" strokeWidth="2.8" strokeLinecap="round" />
      ) : (
        <path d="M70 94 Q80 103 90 94" fill="none" stroke="#92400E" strokeWidth="2.8" strokeLinecap="round" />
      )}

      {/* 太空宇航员：炫彩玻璃透明太空头盔 */}
      {skinId === 'skin_astronaut' && (
        <g>
          <circle cx="80" cy="82" r="47" fill="rgba(186, 230, 253, 0.22)" stroke="#38BDF8" strokeWidth="3.5" />
          <path d="M46 58 Q58 42 78 44" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
          <circle cx="116" cy="60" r="3" fill="#FFFFFF" opacity="0.85" />
        </g>
      )}

      {/* ==================== 6. 可自由混搭的 16 件穿戴装备 ==================== */}
      {/* 眼镜槽位（4款） */}
      {eyes === 'gear_eyes_goggles' && (
        <g>
          <rect x="50" y="68" width="26" height="18" rx="8" fill="rgba(59,130,246,0.24)" stroke="#2563EB" strokeWidth="3" />
          <rect x="84" y="68" width="26" height="18" rx="8" fill="rgba(59,130,246,0.24)" stroke="#2563EB" strokeWidth="3" />
          <line x1="76" y1="77" x2="84" y2="77" stroke="#2563EB" strokeWidth="3" />
        </g>
      )}
      {eyes === 'gear_eyes_star' && (
        <g>
          <polygon points="49,70 77,70 73,85 53,85" fill="rgba(139,92,246,0.85)" stroke="#6D28D9" strokeWidth="2.5" />
          <polygon points="83,70 111,70 107,85 87,85" fill="rgba(139,92,246,0.85)" stroke="#6D28D9" strokeWidth="2.5" />
          <line x1="77" y1="75" x2="83" y2="75" stroke="#FDE047" strokeWidth="3" />
        </g>
      )}
      {eyes === 'gear_eyes_cool' && (
        <g>
          <rect x="49" y="69" width="28" height="16" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <rect x="83" y="69" width="28" height="16" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <line x1="77" y1="75" x2="83" y2="75" stroke="#0F172A" strokeWidth="3" />
          <line x1="54" y1="73" x2="64" y2="73" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          <line x1="88" y1="73" x2="98" y2="73" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
        </g>
      )}
      {eyes === 'gear_eyes_monocle' && (
        <g>
          <circle cx="96" cy="77" r="12" fill="rgba(254,240,138,0.22)" stroke="#CA8A04" strokeWidth="3" />
          <line x1="108" y1="79" x2="112" y2="103" stroke="#CA8A04" strokeWidth="2" strokeDasharray="3 2" />
        </g>
      )}

      {/* 头饰槽位（5款） */}
      {hat === 'gear_hat_classic' && (
        <g>
          <path d="M43 54 Q80 28 117 54 L108 60 Q80 46 52 60 Z" fill="#78350F" />
          <path d="M52 52 Q80 24 108 52 Z" fill="#92400E" stroke="#78350F" strokeWidth="2" />
          <line x1="64" y1="41" x2="96" y2="41" stroke="#F59E0B" strokeWidth="3.2" />
        </g>
      )}
      {hat === 'gear_hat_crown' && (
        <g transform="translate(0, -4)">
          <polygon points="52,52 58,28 71,41 80,20 89,41 102,28 108,52" fill={`url(#gold-${uid})`} stroke="#CA8A04" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="80" cy="41" r="3.8" fill="#EF4444" />
          <circle cx="65" cy="45" r="2.8" fill="#3B82F6" />
          <circle cx="95" cy="45" r="2.8" fill="#10B981" />
        </g>
      )}
      {hat === 'gear_hat_wizard' && (
        <g transform="translate(0, -6)">
          <ellipse cx="80" cy="56" rx="38" ry="8" fill="#4C1D95" />
          <polygon points="54,54 80,10 106,54" fill="#6D28D9" stroke="#FDE047" strokeWidth="2" strokeLinejoin="round" />
          <text x="73" y="43" fontSize="14">⭐</text>
        </g>
      )}
      {hat === 'gear_hat_headset' && (
        <g>
          <path d="M39 74 A41 41 0 0 1 121 74" fill="none" stroke="#1E293B" strokeWidth="6.5" strokeLinecap="round" />
          <rect x="32" y="64" width="13" height="26" rx="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="115" y="64" width="13" height="26" rx="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
        </g>
      )}
      {hat === 'gear_hat_mecha' && (
        <g>
          <path d="M43 54 Q80 20 117 54 L110 61 Q80 44 50 61 Z" fill="#0F172A" stroke="#22D3EE" strokeWidth="2.5" />
          <polygon points="80,18 73,40 87,40" fill="#22D3EE" />
        </g>
      )}

      {/* 手持武器/道具槽位 */}
      {tool === 'gear_tool_lightsaber' ? (
        <g transform="translate(120, 62) rotate(18)" filter={`url(#glow-${uid})`}>
          <rect x="4" y="46" width="9" height="22" rx="3" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="5" y="0" width="7" height="48" rx="3.5" fill="#38BDF8" stroke="#ECFEFF" strokeWidth="2.2" />
        </g>
      ) : tool === 'gear_tool_wand' ? (
        <g transform="translate(116, 68) rotate(16)">
          <line x1="8" y1="14" x2="8" y2="60" stroke="#7C3AED" strokeWidth="5.5" strokeLinecap="round" />
          <text x="-3" y="16" fontSize="22">🌟</text>
        </g>
      ) : (
        <g transform="translate(108, 94)">
          <circle
            cx="13"
            cy="13"
            r="15"
            fill={tool === 'gear_tool_gold' ? 'rgba(254, 240, 138, 0.85)' : 'rgba(219, 234, 254, 0.78)'}
            stroke={tool === 'gear_tool_gold' ? '#D97706' : '#2563EB'}
            strokeWidth="4.5"
          />
          <line
            x1="24"
            y1="24"
            x2="36"
            y2="36"
            stroke={tool === 'gear_tool_gold' ? '#92400E' : '#1E40AF'}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          {tool === 'gear_tool_gold' && <text x="6" y="18" fontSize="14">✨</text>}
        </g>
      )}

      {/* 皮肤与心情飘浮粒子 */}
      {skinId === 'skin_dragon' && <text x="12" y="40" fontSize="19">🔥</text>}
      {skinId === 'skin_gold_king' && <text x="14" y="40" fontSize="18">✨</text>}
      {skinId === 'skin_mecha' && <text x="14" y="40" fontSize="19">⚡</text>}
      {skinId === 'skin_wizard' && <text x="14" y="40" fontSize="18">🌙</text>}
      {mood === 'celebrating' && <text x="122" y="36" fontSize="22">⭐</text>}
      {mood === 'encouraging' && <text x="122" y="38" fontSize="20">💪</text>}
      {mood === 'thinking' && <text x="122" y="38" fontSize="20">💡</text>}
    </svg>
  );
};
