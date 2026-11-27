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

interface ArmorPalette {
  armorLight: string;
  armorDark: string;
  trim: string;
  tabard: string;
  capeMain: string;
  haloA: string;
  haloB: string;
  eyeGlow: string;
  hair: string;
}

const PALADIN_SETS: Record<SkinId, ArmorPalette> = {
  // 1. 萨卡兰姆见习圣甲（经典银蓝圣骑士）
  skin_classic: {
    armorLight: '#E2E8F0', armorDark: '#64748B', trim: '#F59E0B',
    tabard: '#1D4ED8', capeMain: '#1E3A8A',
    haloA: '#FDE68A', haloB: '#3B82F6', eyeGlow: '#38BDF8', hair: '#451A03',
  },
  // 2. 凛冬碎冰圣骑套（冰霜圣骑士）
  skin_ice: {
    armorLight: '#E0F2FE', armorDark: '#0284C7', trim: '#7DD3FC',
    tabard: '#0369A1', capeMain: '#0C4A6E',
    haloA: '#BAE6FD', haloB: '#0EA5E9', eyeGlow: '#38BDF8', hair: '#E0F2FE',
  },
  // 3. 暗影猎魔游侠套（黑曜暗影风）
  skin_ninja: {
    armorLight: '#475569', armorDark: '#0F172A', trim: '#EF4444',
    tabard: '#7F1D1D', capeMain: '#450A0A',
    haloA: '#DC2626', haloB: '#1E293B', eyeGlow: '#FACC15', hair: '#1E293B',
  },
  // 4. 奥术秘法圣殿套（紫金秘法骑士）
  skin_wizard: {
    armorLight: '#DDD6FE', armorDark: '#5B21B6', trim: '#FACC15',
    tabard: '#4C1D95', capeMain: '#3B0764',
    haloA: '#C084FC', haloB: '#F59E0B', eyeGlow: '#E879F9', hair: '#312E81',
  },
  // 5. 泰瑞尔·正义大天使套（暗黑经典大天使！）
  skin_astronaut: {
    armorLight: '#FEF9C3', armorDark: '#92400E', trim: '#FACC15',
    tabard: '#F8FAFC', capeMain: '#1E3A8A',
    haloA: '#E0F2FE', haloB: '#FDE047', eyeGlow: '#38BDF8', hair: '#0F172A',
  },
  // 6. 狱火屠龙圣骑套（暗黑熔岩龙骑士）
  skin_dragon: {
    armorLight: '#7F1D1D', armorDark: '#1C0A0A', trim: '#F97316',
    tabard: '#B91C1C', capeMain: '#7C2D12',
    haloA: '#F97316', haloB: '#DC2626', eyeGlow: '#FDE047', hair: '#290C0C',
  },
  // 7. 阿克汉荣耀圣甲（暗黑3经典纯金圣教军套）
  skin_gold_king: {
    armorLight: '#FEF08A', armorDark: '#B45309', trim: '#FFFFFF',
    tabard: '#B91C1C', capeMain: '#991B1B',
    haloA: '#FEF08A', haloB: '#F59E0B', eyeGlow: '#FEF08A', hair: '#78350F',
  },
  // 8. 太古星穹圣帝套（S1 20级终极神话圣甲！）
  skin_mecha: {
    armorLight: '#E2E8F0', armorDark: '#1E293B', trim: '#22D3EE',
    tabard: '#0E7490', capeMain: '#082F49',
    haloA: '#22D3EE', haloB: '#A855F7', eyeGlow: '#22D3EE', hair: '#ECFEFF',
  },
};

export const DetectiveAvatar: React.FC<Props> = ({
  mood = 'happy',
  equippedGear = {},
  skinId = 'skin_classic',
  size = 116,
  animated = true,
}) => {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const pal = PALADIN_SETS[skinId] || PALADIN_SETS.skin_classic;

  const hat = equippedGear.hat;
  const eyes = equippedGear.eyes;
  const tool = equippedGear.tool;
  const cape = equippedGear.cape;
  const shield = equippedGear.badge; // 副手圣盾槽

  const isTyraelHood = skinId === 'skin_astronaut';
  const isFullHelm = hat === 'gear_hat_mecha' || hat === 'gear_hat_headset';

  const capeFill =
    cape === 'gear_cape_flame'
      ? `url(#flame-${uid})`
      : cape === 'gear_cape_star'
      ? '#1D4ED8'
      : pal.capeMain;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      className={animated ? 'avatar-float' : undefined}
      style={{ flexShrink: 0, overflow: 'visible' }}
      aria-label="人类圣骑士英雄"
    >
      <defs>
        <linearGradient id={`armor-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={pal.armorLight} />
          <stop offset="100%" stopColor={pal.armorDark} />
        </linearGradient>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id={`flame-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="55%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>
        <linearGradient id={`angel-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id={`mythic-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={pal.haloA} stopOpacity="0.65" />
          <stop offset="68%" stopColor={pal.haloB} stopOpacity="0.22" />
          <stop offset="100%" stopColor={pal.haloB} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ==================== 1. 圣光背景光环 & 旋转魔法阵 ==================== */}
      <circle cx="90" cy="92" r="80" fill={`url(#halo-${uid})`} />

      {/* 秘法套：旋转六芒星奥术阵 */}
      {skinId === 'skin_wizard' && (
        <g className="avatar-spin-slow" style={{ transformOrigin: '90px 92px' }}>
          <circle cx="90" cy="92" r="72" fill="none" stroke="#FDE047" strokeWidth="1.8" strokeDasharray="6 6" />
          <polygon points="90,22 150,126 30,126" fill="none" stroke="#C084FC" strokeWidth="1.6" opacity="0.75" />
          <polygon points="90,162 150,58 30,58" fill="none" stroke="#C084FC" strokeWidth="1.6" opacity="0.75" />
        </g>
      )}

      {/* 太古星穹圣帝套：双层太古符文光环 */}
      {skinId === 'skin_mecha' && (
        <g className="avatar-spin-slow" style={{ transformOrigin: '90px 92px' }}>
          <circle cx="90" cy="92" r="74" fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="16 8 4 8" />
          <circle cx="90" cy="92" r="64" fill="none" stroke="#C084FC" strokeWidth="1.8" strokeDasharray="8 10" />
        </g>
      )}

      {/* 阿克汉黄金套：神圣太阳光轮 */}
      {skinId === 'skin_gold_king' && (
        <g className="avatar-spin-slow" style={{ transformOrigin: '90px 88px' }}>
          <circle cx="90" cy="88" r="68" fill="none" stroke="#FACC15" strokeWidth="2.8" strokeDasharray="10 6" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="90" y1="12" x2="90" y2="23" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" transform={`rotate(${deg} 90 88)`} />
          ))}
        </g>
      )}

      {/* ==================== 2. 圣骑士背后光翼 / 龙翼 / 披风 ==================== */}
      {/* 泰瑞尔正义大天使：经典白色圣光流光羽翼 */}
      {skinId === 'skin_astronaut' && (
        <g filter={`url(#glow-${uid})`} className="avatar-pulse">
          <path d="M62 82 Q16 32 8 62 Q34 74 14 92 Q42 94 24 114 Q52 108 66 96 Z" fill={`url(#angel-${uid})`} opacity="0.92" />
          <path d="M118 82 Q164 32 172 62 Q146 74 166 92 Q138 94 156 114 Q128 108 114 96 Z" fill={`url(#angel-${uid})`} opacity="0.92" />
        </g>
      )}

      {/* 狱火屠龙套：暗黑火焰恶魔龙翼 */}
      {skinId === 'skin_dragon' && (
        <g filter={`url(#glow-${uid})`}>
          <path d="M60 88 L10 38 L24 72 L8 88 L32 100 L18 118 L64 112 Z" fill={`url(#flame-${uid})`} stroke="#7F1D1D" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M120 88 L170 38 L156 72 L172 88 L148 100 L162 118 L116 112 Z" fill={`url(#flame-${uid})`} stroke="#7F1D1D" strokeWidth="2.2" strokeLinejoin="round" />
        </g>
      )}

      {/* 阿克汉荣耀套：璀璨黄金六翼 */}
      {skinId === 'skin_gold_king' && (
        <g filter={`url(#glow-${uid})`}>
          <path d="M62 84 Q14 44 12 70 Q32 80 18 96 Q38 100 28 116 L64 108 Z" fill={`url(#gold-${uid})`} stroke="#A16207" strokeWidth="1.8" />
          <path d="M118 84 Q166 44 168 70 Q148 80 162 96 Q142 100 152 116 L116 108 Z" fill={`url(#gold-${uid})`} stroke="#A16207" strokeWidth="1.8" />
        </g>
      )}

      {/* 太古星穹圣帝套：赛博太古能量圣翼 */}
      {skinId === 'skin_mecha' && (
        <g filter={`url(#glow-${uid})`}>
          <polygon points="62,84 10,44 24,80 12,106 38,116 64,106" fill={`url(#mythic-${uid})`} stroke="#ECFEFF" strokeWidth="1.8" />
          <polygon points="118,84 170,44 156,80 168,106 142,116 116,106" fill={`url(#mythic-${uid})`} stroke="#ECFEFF" strokeWidth="1.8" />
        </g>
      )}

      {/* 圣骑士飘逸战披风（所有圣骑士标配，随套装/披风装备变色） */}
      <path
        d="M54 84 L38 164 Q90 174 142 164 L126 84 Z"
        fill={capeFill}
        stroke={pal.trim}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* ==================== 3. 全身铠甲躯干、腿甲与战靴 ==================== */}
      {/* 腿部护胫甲与战靴 */}
      <rect x="68" y="132" width="16" height="32" rx="5" fill={`url(#armor-${uid})`} stroke={pal.trim} strokeWidth="1.8" />
      <rect x="96" y="132" width="16" height="32" rx="5" fill={`url(#armor-${uid})`} stroke={pal.trim} strokeWidth="1.8" />
      {/* 铁靴 */}
      <path d="M64 160 L85 160 L85 169 L61 169 Q61 160 64 160 Z" fill={pal.armorDark} stroke={pal.trim} strokeWidth="1.8" />
      <path d="M95 160 L116 160 Q119 160 119 169 L95 169 Z" fill={pal.armorDark} stroke={pal.trim} strokeWidth="1.8" />

      {/* 圣骑士全身胸甲 (Breastplate) */}
      <path
        d="M58 80 L122 80 L116 132 L90 140 L64 132 Z"
        fill={`url(#armor-${uid})`}
        stroke={pal.trim}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* 圣殿垂摆战袍 (Paladin Tabard) */}
      <path d="M77 84 L103 84 L100 148 L90 156 L80 148 Z" fill={pal.tabard} stroke={pal.trim} strokeWidth="1.6" />
      {/* 胸口圣光十字徽章 / 太古核心 */}
      {skinId === 'skin_mecha' ? (
        <g filter={`url(#glow-${uid})`}>
          <polygon points="90,92 100,104 90,116 80,104" fill="#22D3EE" stroke="#ECFEFF" strokeWidth="1.8" />
          <circle cx="90" cy="104" r="3.8" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          <rect x="87.5" y="93" width="5" height="22" rx="1.5" fill={pal.trim} />
          <rect x="81" y="99" width="18" height="5" rx="1.5" fill={pal.trim} />
        </g>
      )}

      {/* 圣骑士腰带与带扣 */}
      <rect x="63" y="122" width="54" height="9" rx="3" fill="#271C19" stroke={pal.trim} strokeWidth="1.6" />
      <rect x="84" y="120.5" width="12" height="12" rx="2.5" fill={`url(#gold-${uid})`} stroke="#78350F" strokeWidth="1.4" />

      {/* 宽大霸气的暗黑重型肩甲 (Pauldrons) */}
      <path
        d="M42 86 Q44 68 68 74 L65 96 Q46 98 42 86 Z"
        fill={`url(#armor-${uid})`}
        stroke={pal.trim}
        strokeWidth="2.4"
      />
      <path
        d="M138 86 Q136 68 112 74 L115 96 Q134 98 138 86 Z"
        fill={`url(#armor-${uid})`}
        stroke={pal.trim}
        strokeWidth="2.4"
      />
      {/* 狱火套 / 暗影套肩甲尖刺 */}
      {(skinId === 'skin_dragon' || skinId === 'skin_ninja' || skinId === 'skin_mecha') && (
        <g>
          <polygon points="44,77 32,63 52,72" fill={pal.trim} />
          <polygon points="136,77 148,63 128,72" fill={pal.trim} />
        </g>
      )}

      {/* 装甲双臂 */}
      <rect x="46" y="92" width="14" height="28" rx="6" fill={`url(#armor-${uid})`} stroke={pal.trim} strokeWidth="1.8" />
      <rect x="120" y="92" width="14" height="28" rx="6" fill={`url(#armor-${uid})`} stroke={pal.trim} strokeWidth="1.8" />

      {/* ==================== 4. 人类圣骑士头部与俊朗英雄面庞 ==================== */}
      {/* 脖颈护领 */}
      <rect x="81" y="70" width="18" height="12" rx="4" fill="#E6B89C" />

      {isTyraelHood ? (
        /* 泰瑞尔大天使：经典神秘兜帽 + 发光圣目 */
        <g>
          <path d="M58 64 Q60 24 90 22 Q120 24 122 64 L116 78 L64 78 Z" fill="#F8FAFC" stroke="#FACC15" strokeWidth="2.5" />
          <ellipse cx="90" cy="56" rx="20" ry="20" fill="#0F172A" />
          <ellipse cx="82" cy="54" rx="4.5" ry="2.2" fill="#38BDF8" filter={`url(#glow-${uid})`} />
          <ellipse cx="98" cy="54" rx="4.5" ry="2.2" fill="#38BDF8" filter={`url(#glow-${uid})`} />
        </g>
      ) : (
        <g>
          {/* 后发 */}
          <path d="M62 50 Q62 24 90 24 Q118 24 118 50 L116 68 L64 68 Z" fill={pal.hair} />
          {/* 人类英气面庞 */}
          <path
            d="M68 42 Q68 30 90 30 Q112 30 112 42 L111 58 Q110 74 90 76 Q70 74 69 58 Z"
            fill="#FDE2C8"
            stroke="#C28E6B"
            strokeWidth="1.6"
          />
          {/* 飘逸前刘海 */}
          <path
            d="M66 44 Q74 26 92 27 Q110 27 115 44 Q106 36 98 42 Q90 34 80 42 Q73 36 66 44 Z"
            fill={pal.hair}
          />

          {/* 眉眼（随情绪变化） */}
          <line x1="74" y1="47" x2="84" y2="49" stroke={pal.hair} strokeWidth="2.4" strokeLinecap="round" />
          <line x1="106" y1="47" x2="96" y2="49" stroke={pal.hair} strokeWidth="2.4" strokeLinecap="round" />

          {mood === 'celebrating' ? (
            <>
              <path d="M75 55 Q80 50 85 55" fill="none" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M95 55 Q100 50 105 55" fill="none" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="80" cy="54" r="3.6" fill={skinId === 'skin_dragon' || skinId === 'skin_mecha' ? pal.eyeGlow : '#1E293B'} />
              <circle cx="81.2" cy="52.8" r="1.3" fill="#FFFFFF" />
              <circle cx="100" cy="54" r="3.6" fill={skinId === 'skin_dragon' || skinId === 'skin_mecha' ? pal.eyeGlow : '#1E293B'} />
              <circle cx="101.2" cy="52.8" r="1.3" fill="#FFFFFF" />
            </>
          )}

          {/* 自信坚定的英雄微笑 */}
          {mood === 'celebrating' ? (
            <path d="M83 64 Q90 71 97 64 Z" fill="#EF4444" stroke="#9A3412" strokeWidth="1.4" />
          ) : mood === 'thinking' ? (
            <line x1="85" y1="65" x2="95" y2="65" stroke="#9A5B3E" strokeWidth="2.2" strokeLinecap="round" />
          ) : (
            <path d="M84 64 Q90 69 96 64" fill="none" stroke="#9A5B3E" strokeWidth="2.2" strokeLinecap="round" />
          )}
        </g>
      )}

      {/* ==================== 5. 暗黑破坏神头盔槽 (5 款传说头盔) ==================== */}
      {/* 军帽·谐角之冠 (Harlequin Crest) */}
      {hat === 'gear_hat_classic' && !isTyraelHood && (
        <g>
          <path d="M63 45 Q66 18 90 17 Q114 18 117 45 Q102 36 90 38 Q78 36 63 45 Z" fill="#15803D" stroke="#FACC15" strokeWidth="2.2" />
          <circle cx="90" cy="27" r="4" fill="#FACC15" />
        </g>
      )}
      {/* 李奥瑞克的黄金王冠 */}
      {hat === 'gear_hat_crown' && (
        <g transform="translate(0, -2)">
          <polygon points="66,38 71,16 82,28 90,11 98,28 109,16 114,38" fill={`url(#gold-${uid})`} stroke="#92400E" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="90" cy="29" r="3.6" fill="#DC2626" />
          <circle cx="76" cy="32" r="2.4" fill="#38BDF8" />
          <circle cx="104" cy="32" r="2.4" fill="#38BDF8" />
        </g>
      )}
      {/* 奥术符文尖盔 */}
      {hat === 'gear_hat_wizard' && (
        <g>
          <path d="M62 42 Q76 12 90 6 Q104 12 118 42 Q90 32 62 42 Z" fill="#5B21B6" stroke="#FACC15" strokeWidth="2.2" />
          <polygon points="90,18 85,29 95,29" fill="#FDE047" />
        </g>
      )}
      {/* 圣光羽翼重盔（双翼头盔） */}
      {hat === 'gear_hat_headset' && (
        <g>
          <path d="M64 48 Q66 20 90 19 Q114 20 116 48 L112 68 L90 74 L68 68 Z" fill={`url(#armor-${uid})`} stroke="#FACC15" strokeWidth="2.2" />
          <rect x="74" y="48" width="32" height="7" rx="3" fill="#0F172A" />
          <line x1="78" y1="51.5" x2="102" y2="51.5" stroke="#38BDF8" strokeWidth="2.6" filter={`url(#glow-${uid})`} />
          <path d="M64 40 L44 22 L52 44 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
          <path d="M116 40 L136 22 L128 44 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
        </g>
      )}
      {/* 泰瑞尔太古圣光面甲 */}
      {hat === 'gear_hat_mecha' && (
        <g filter={`url(#glow-${uid})`}>
          <path d="M64 48 Q65 18 90 15 Q115 18 116 48 L113 70 L90 77 L67 70 Z" fill="#0F172A" stroke="#22D3EE" strokeWidth="2.4" />
          <polygon points="90,14 68,28 90,34 112,28" fill={`url(#gold-${uid})`} />
          <polygon points="73,50 87,53 75,57" fill="#22D3EE" />
          <polygon points="107,50 93,53 105,57" fill="#22D3EE" />
        </g>
      )}

      {/* ==================== 6. 圣印/护目槽 (4 款) ==================== */}
      {!isFullHelm && !isTyraelHood && eyes === 'gear_eyes_goggles' && (
        <g>
          <rect x="69" y="48" width="18" height="11" rx="4" fill="rgba(56,189,248,0.28)" stroke="#38BDF8" strokeWidth="2.2" />
          <rect x="93" y="48" width="18" height="11" rx="4" fill="rgba(56,189,248,0.28)" stroke="#38BDF8" strokeWidth="2.2" />
          <line x1="87" y1="53" x2="93" y2="53" stroke="#38BDF8" strokeWidth="2.2" />
        </g>
      )}
      {!isFullHelm && !isTyraelHood && eyes === 'gear_eyes_cool' && (
        <g>
          <line x1="68" y1="49" x2="112" y2="58" stroke="#1E293B" strokeWidth="3.5" />
          <ellipse cx="100" cy="54" rx="7" ry="6" fill="#0F172A" stroke="#EF4444" strokeWidth="2" />
        </g>
      )}
      {!isFullHelm && !isTyraelHood && eyes === 'gear_eyes_monocle' && (
        <g>
          <circle cx="100" cy="54" r="8" fill="rgba(250,204,21,0.22)" stroke="#FACC15" strokeWidth="2.4" />
          <line x1="108" y1="56" x2="111" y2="74" stroke="#FACC15" strokeWidth="1.6" strokeDasharray="3 2" />
        </g>
      )}
      {!isFullHelm && !isTyraelHood && eyes === 'gear_eyes_star' && (
        <g filter={`url(#glow-${uid})`}>
          <polygon points="69,50 88,52 85,58 71,57" fill="#C084FC" opacity="0.85" />
          <polygon points="111,50 92,52 95,58 109,57" fill="#C084FC" opacity="0.85" />
        </g>
      )}

      {/* ==================== 7. 右手暗黑神兵 (4 款武器) ==================== */}
      {tool === 'gear_tool_lightsaber' ? (
        /* 碧蓝怒火·圣光符文神剑 (Azurewrath) */
        <g transform="translate(132, 34) rotate(14)" filter={`url(#glow-${uid})`}>
          <polygon points="12,0 18,12 16,74 8,74 6,12" fill="#38BDF8" stroke="#ECFEFF" strokeWidth="2" />
          <line x1="12" y1="10" x2="12" y2="70" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="0" y="72" width="24" height="6" rx="2.5" fill={`url(#gold-${uid})`} stroke="#78350F" strokeWidth="1.4" />
          <rect x="9" y="78" width="6" height="16" rx="2" fill="#1E3A8A" />
          <circle cx="12" cy="96" r="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.4" />
        </g>
      ) : tool === 'gear_tool_gold' ? (
        /* 末日使者·圣焰双手巨剑 (Doombringer) */
        <g transform="translate(132, 30) rotate(15)" filter={`url(#glow-${uid})`}>
          <polygon points="13,0 21,16 18,78 8,78 5,16" fill={`url(#flame-${uid})`} stroke="#FEF08A" strokeWidth="2" />
          <rect x="-2" y="76" width="30" height="7" rx="3" fill={`url(#gold-${uid})`} stroke="#7F1D1D" strokeWidth="1.6" />
          <rect x="10" y="83" width="6" height="16" rx="2" fill="#7F1D1D" />
          <circle cx="13" cy="101" r="4.5" fill="#FACC15" />
        </g>
      ) : tool === 'gear_tool_wand' ? (
        /* 圣光裁决雷霆战锤 (Schaefer's Hammer) */
        <g transform="translate(130, 40) rotate(15)" filter={`url(#glow-${uid})`}>
          <rect x="10" y="28" width="6" height="66" rx="2.5" fill="#78350F" stroke="#FACC15" strokeWidth="1.4" />
          <rect x="-4" y="6" width="34" height="24" rx="5" fill={`url(#gold-${uid})`} stroke="#FEF9C3" strokeWidth="2" />
          <polygon points="13,10 9,19 14,19 11,27 19,17 14,17" fill="#38BDF8" />
        </g>
      ) : (
        /* 圣光制式长剑（默认武器） */
        <g transform="translate(132, 42) rotate(14)">
          <polygon points="11,0 16,12 15,66 7,66 6,12" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.8" />
          <line x1="11" y1="8" x2="11" y2="62" stroke="#FFFFFF" strokeWidth="1.8" />
          <rect x="1" y="65" width="20" height="5.5" rx="2.5" fill={`url(#gold-${uid})`} stroke="#92400E" strokeWidth="1.3" />
          <rect x="8.5" y="70.5" width="5" height="15" rx="2" fill="#451A03" />
          <circle cx="11" cy="87" r="3.5" fill="#F59E0B" />
        </g>
      )}

      {/* ==================== 8. 左手暗黑圣骑士盾牌 (基础圆盾 / 撒卡兰姆圣盾 / 暴风之盾) ==================== */}
      {shield === 'gear_badge_diamond' ? (
        /* 暴风之盾·太古圣盾 (Stormshield) */
        <g transform="translate(22, 96)" filter={`url(#glow-${uid})`}>
          <path d="M4,4 L44,4 L40,36 L24,52 L8,36 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="24,12 34,25 24,40 14,25" fill="#38BDF8" stroke="#ECFEFF" strokeWidth="1.8" />
          <circle cx="24" cy="25" r="4" fill="#FFFFFF" />
        </g>
      ) : shield === 'gear_badge_clover' ? (
        /* 撒卡兰姆使者圣盾 (Herald of Zakarum) */
        <g transform="translate(22, 96)" filter={`url(#glow-${uid})`}>
          <path d="M4,4 L44,4 L40,36 L24,52 L8,36 Z" fill="#065F46" stroke="#FACC15" strokeWidth="3" strokeLinejoin="round" />
          <rect x="21" y="11" width="6" height="30" rx="1.5" fill={`url(#gold-${uid})`} />
          <rect x="12" y="19" width="24" height="6" rx="1.5" fill={`url(#gold-${uid})`} />
        </g>
      ) : (
        /* 圣骑士制式铁盾 */
        <g transform="translate(26, 100)">
          <path d="M4,4 L36,4 L33,30 L20,44 L7,30 Z" fill={`url(#armor-${uid})`} stroke={pal.trim} strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="18" y="11" width="4" height="22" rx="1" fill={pal.trim} />
          <rect x="12" y="17" width="16" height="4" rx="1" fill={pal.trim} />
        </g>
      )}

      {/* 皮肤或状态飘浮特效粒子 */}
      {skinId === 'skin_ice' && <text x="14" y="34" fontSize="18">❄️</text>}
      {skinId === 'skin_dragon' && <text x="14" y="34" fontSize="19">🔥</text>}
      {skinId === 'skin_gold_king' && <text x="14" y="34" fontSize="18">✨</text>}
      {skinId === 'skin_mecha' && <text x="14" y="34" fontSize="19">⚡</text>}
      {skinId === 'skin_astronaut' && <text x="14" y="34" fontSize="18">🕊️</text>}
      {mood === 'celebrating' && <text x="144" y="30" fontSize="22">⚔️</text>}
      {mood === 'thinking' && <text x="146" y="34" fontSize="20">💡</text>}
    </svg>
  );
};
