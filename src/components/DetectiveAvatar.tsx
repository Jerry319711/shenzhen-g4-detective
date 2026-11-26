import React from 'react';
import { EquipmentItem, SkinId } from '../types';

export type AvatarMood = 'happy' | 'thinking' | 'encouraging' | 'celebrating' | 'curious';

interface Props {
  mood?: AvatarMood;
  equippedGear?: Partial<Record<EquipmentItem['slot'], string>>;
  skinId?: SkinId;
  size?: number;
}

const SKIN_PALETTES: Record<
  SkinId,
  { fur: string; furDark: string; earInner: string; cheek: string; halo: string; bow: string }
> = {
  skin_classic: { fur: '#F59E0B', furDark: '#D97706', earInner: '#FDE68A', cheek: '#FFFBEB', halo: '#FEF3C7', bow: '#EF4444' },
  skin_ice: { fur: '#38BDF8', furDark: '#0284C7', earInner: '#E0F2FE', cheek: '#F8FAFC', halo: '#E0F2FE', bow: '#2563EB' },
  skin_ninja: { fur: '#334155', furDark: '#1E293B', earInner: '#94A3B8', cheek: '#E2E8F0', halo: '#CBD5E1', bow: '#DC2626' },
  skin_wizard: { fur: '#8B5CF6', furDark: '#6D28D9', earInner: '#DDD6FE', cheek: '#FAF5FF', halo: '#EDE9FE', bow: '#F59E0B' },
  skin_astronaut: { fur: '#E2E8F0', furDark: '#94A3B8', earInner: '#BFDBFE', cheek: '#FFFFFF', halo: '#DBEAFE', bow: '#2563EB' },
  skin_dragon: { fur: '#EF4444', furDark: '#B91C1C', earInner: '#FCA5A5', cheek: '#FEF2F2', halo: '#FEE2E2', bow: '#FACC15' },
  skin_gold_king: { fur: '#FACC15', furDark: '#CA8A04', earInner: '#FEF9C3', cheek: '#FFFBEB', halo: '#FEF08A', bow: '#DC2626' },
  skin_mecha: { fur: '#94A3B8', furDark: '#475569', earInner: '#22D3EE', cheek: '#F1F5F9', halo: '#CFFAFE', bow: '#06B6D4' },
};

export const DetectiveAvatar: React.FC<Props> = ({
  mood = 'happy',
  equippedGear = {},
  skinId = 'skin_classic',
  size = 110,
}) => {
  const pal = SKIN_PALETTES[skinId] || SKIN_PALETTES.skin_classic;

  const hat = equippedGear.hat;
  const eyes = equippedGear.eyes;
  const tool = equippedGear.tool;
  const cape = equippedGear.cape;
  const badge = equippedGear.badge;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      style={{ flexShrink: 0, overflow: 'visible' }}
      aria-label="阿探小神探伙伴"
    >
      {/* 主题光环 */}
      <circle
        cx="70"
        cy="74"
        r="58"
        fill={mood === 'celebrating' ? '#FEF08A' : pal.halo}
        opacity="0.9"
      />
      {/* 特殊皮肤光圈特效 */}
      {(skinId === 'skin_mecha' || skinId === 'skin_gold_king' || skinId === 'skin_dragon') && (
        <circle
          cx="70"
          cy="74"
          r="62"
          fill="none"
          stroke={skinId === 'skin_mecha' ? '#06B6D4' : skinId === 'skin_dragon' ? '#EF4444' : '#F59E0B'}
          strokeWidth="2.5"
          strokeDasharray="8 5"
        />
      )}

      {/* 披风（星辰披风 / 烈焰王者披风 / 龙骑士自带龙翼） */}
      {(cape === 'gear_cape_star' || cape === 'gear_cape_flame' || skinId === 'skin_dragon') && (
        <path
          d="M28 95 Q12 126 28 134 L112 134 Q128 126 112 95 Z"
          fill={cape === 'gear_cape_flame' || skinId === 'skin_dragon' ? '#DC2626' : '#6366F1'}
          stroke={cape === 'gear_cape_flame' || skinId === 'skin_dragon' ? '#FACC15' : '#4338CA'}
          strokeWidth="2.8"
        />
      )}

      {/* 身体与领结/核心 */}
      <ellipse cx="70" cy="116" rx="34" ry="20" fill={pal.fur} />
      <ellipse cx="70" cy="118" rx="22" ry="13" fill={pal.cheek} />

      {skinId === 'skin_mecha' ? (
        <g>
          <circle cx="70" cy="114" r="7" fill="#06B6D4" stroke="#0891B2" strokeWidth="2.5" />
          <circle cx="70" cy="114" r="3" fill="#ECFEFF" />
        </g>
      ) : (
        <g>
          <polygon points="60,104 70,110 60,116" fill={pal.bow} />
          <polygon points="80,104 70,110 80,116" fill={pal.bow} />
          <circle cx="70" cy="110" r="3.8" fill="#7F1D1D" />
        </g>
      )}

      {/* 徽章（四叶草 / 钻石） */}
      {badge === 'gear_badge_clover' && (
        <g transform="translate(88, 115)">
          <circle cx="0" cy="-3" r="3.5" fill="#10B981" />
          <circle cx="3" cy="0" r="3.5" fill="#10B981" />
          <circle cx="0" cy="3" r="3.5" fill="#10B981" />
          <circle cx="-3" cy="0" r="3.5" fill="#10B981" />
          <circle cx="0" cy="0" r="1.8" fill="#FEF08A" />
        </g>
      )}
      {badge === 'gear_badge_diamond' && (
        <polygon points="88,108 95,115 88,123 81,115" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
      )}

      {/* 柴犬耳朵 */}
      <polygon points="36,54 24,22 54,40" fill={pal.furDark} stroke={pal.furDark} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="37,48 30,29 48,41" fill={pal.earInner} />
      <polygon points="104,54 116,22 86,40" fill={pal.furDark} stroke={pal.furDark} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="103,48 110,29 92,41" fill={pal.earInner} />

      {/* 烈焰龙角（皮肤专属） */}
      {skinId === 'skin_dragon' && (
        <g>
          <path d="M46 42 Q38 22 48 16 Q50 28 54 39 Z" fill="#FACC15" stroke="#B45309" strokeWidth="1.8" />
          <path d="M94 42 Q102 22 92 16 Q90 28 86 39 Z" fill="#FACC15" stroke="#B45309" strokeWidth="1.8" />
        </g>
      )}

      {/* 柴犬头部 */}
      <circle cx="70" cy="74" r="36" fill={pal.fur} stroke={pal.furDark} strokeWidth="2" />
      <path d="M38 78 Q50 64 70 72 Q90 64 102 78 Q102 106 70 107 Q38 106 38 78 Z" fill={pal.cheek} />

      {/* 忍者疾风红头带（皮肤专属） */}
      {skinId === 'skin_ninja' && (
        <g>
          <rect x="35" y="48" width="70" height="10" rx="5" fill="#DC2626" />
          <rect x="61" y="49" width="18" height="8" rx="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
          <path d="M104 52 L119 46 L116 56 Z" fill="#DC2626" />
        </g>
      )}

      {/* 腮红 */}
      <ellipse cx="47" cy="81" rx="5.5" ry="3.2" fill="#FDA4AF" opacity="0.65" />
      <ellipse cx="93" cy="81" rx="5.5" ry="3.2" fill="#FDA4AF" opacity="0.65" />

      {/* 眼睛 */}
      {mood === 'celebrating' ? (
        <>
          <path d="M49 69 Q55 62 61 69" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M79 69 Q85 62 91 69" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <circle cx="55" cy="68" r="4.8" fill={skinId === 'skin_mecha' ? '#06B6D4' : '#1E293B'} />
          <circle cx="56.5" cy="66" r="1.7" fill="#FFFFFF" />
          <circle cx="85" cy="66" r="4.8" fill={skinId === 'skin_mecha' ? '#06B6D4' : '#1E293B'} />
          <circle cx="86.5" cy="64" r="1.7" fill="#FFFFFF" />
          <path d="M78 58 Q85 54 92 58" fill="none" stroke="#92400E" strokeWidth="2.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="55" cy="68" r="5.2" fill={skinId === 'skin_mecha' ? '#06B6D4' : '#1E293B'} />
          <circle cx="56.8" cy="66.2" r="1.9" fill="#FFFFFF" />
          <circle cx="85" cy="68" r="5.2" fill={skinId === 'skin_mecha' ? '#06B6D4' : '#1E293B'} />
          <circle cx="86.8" cy="66.2" r="1.9" fill="#FFFFFF" />
        </>
      )}

      {/* 太空宇航员透明头盔罩（皮肤专属） */}
      {skinId === 'skin_astronaut' && (
        <g>
          <circle cx="70" cy="74" r="44" fill="rgba(186, 230, 253, 0.22)" stroke="#38BDF8" strokeWidth="3" />
          <path d="M40 50 Q50 38 66 40" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      )}

      {/* 眼镜槽位（4 款） */}
      {eyes === 'gear_eyes_goggles' && (
        <g>
          <rect x="42" y="59" width="24" height="17" rx="8" fill="rgba(59,130,246,0.22)" stroke="#2563EB" strokeWidth="3" />
          <rect x="74" y="59" width="24" height="17" rx="8" fill="rgba(59,130,246,0.22)" stroke="#2563EB" strokeWidth="3" />
          <line x1="66" y1="67" x2="74" y2="67" stroke="#2563EB" strokeWidth="3" />
        </g>
      )}
      {eyes === 'gear_eyes_star' && (
        <g>
          <polygon points="41,62 67,62 63,75 45,75" fill="rgba(139,92,246,0.8)" stroke="#6D28D9" strokeWidth="2.5" />
          <polygon points="73,62 99,62 95,75 77,75" fill="rgba(139,92,246,0.8)" stroke="#6D28D9" strokeWidth="2.5" />
          <line x1="67" y1="66" x2="73" y2="66" stroke="#FDE047" strokeWidth="3" />
        </g>
      )}
      {eyes === 'gear_eyes_cool' && (
        <g>
          <rect x="41" y="61" width="26" height="15" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <rect x="73" y="61" width="26" height="15" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <line x1="67" y1="66" x2="73" y2="66" stroke="#0F172A" strokeWidth="3" />
          <line x1="45" y1="64" x2="54" y2="64" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <line x1="77" y1="64" x2="86" y2="64" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </g>
      )}
      {eyes === 'gear_eyes_monocle' && (
        <g>
          <circle cx="85" cy="68" r="11" fill="rgba(254,240,138,0.22)" stroke="#CA8A04" strokeWidth="3" />
          <line x1="96" y1="70" x2="100" y2="92" stroke="#CA8A04" strokeWidth="2" strokeDasharray="3 2" />
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

      {/* 头饰槽位（5 款） */}
      {hat === 'gear_hat_classic' && (
        <g>
          <path d="M35 47 Q70 24 105 47 L96 52 Q70 40 44 52 Z" fill="#78350F" />
          <path d="M44 45 Q70 20 96 45 Z" fill="#92400E" stroke="#78350F" strokeWidth="2" />
          <line x1="56" y1="35" x2="84" y2="35" stroke="#F59E0B" strokeWidth="3" />
        </g>
      )}
      {hat === 'gear_hat_crown' && (
        <g transform="translate(0, -4)">
          <polygon points="44,46 50,24 62,36 70,18 78,36 90,24 96,46" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="70" cy="36" r="3.5" fill="#EF4444" />
          <circle cx="56" cy="40" r="2.5" fill="#3B82F6" />
          <circle cx="84" cy="40" r="2.5" fill="#10B981" />
        </g>
      )}
      {hat === 'gear_hat_wizard' && (
        <g transform="translate(0, -6)">
          <ellipse cx="70" cy="49" rx="36" ry="7" fill="#4C1D95" />
          <polygon points="46,48 70,8 94,48" fill="#6D28D9" stroke="#4C1D95" strokeWidth="2" strokeLinejoin="round" />
          <text x="64" y="38" fontSize="13">⭐</text>
        </g>
      )}
      {hat === 'gear_hat_headset' && (
        <g>
          <path d="M32 66 A38 38 0 0 1 108 66" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          <rect x="25" y="56" width="12" height="24" rx="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="103" y="56" width="12" height="24" rx="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
        </g>
      )}
      {hat === 'gear_hat_mecha' && (
        <g>
          <path d="M36 48 Q70 16 104 48 L98 54 Q70 38 42 54 Z" fill="#0F172A" stroke="#06B6D4" strokeWidth="2.5" />
          <polygon points="70,14 64,34 76,34" fill="#22D3EE" />
        </g>
      )}

      {/* 手持道具槽位（4 款） */}
      {tool === 'gear_tool_lightsaber' ? (
        <g transform="translate(106, 56) rotate(18)">
          <rect x="4" y="42" width="8" height="20" rx="3" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="5" y="0" width="6" height="44" rx="3" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="2" />
        </g>
      ) : tool === 'gear_tool_wand' ? (
        <g transform="translate(104, 62) rotate(16)">
          <line x1="8" y1="14" x2="8" y2="56" stroke="#7C3AED" strokeWidth="5" strokeLinecap="round" />
          <text x="-2" y="16" fontSize="20">🌟</text>
        </g>
      ) : (
        <g transform="translate(96, 86)">
          <circle
            cx="12"
            cy="12"
            r="14"
            fill={tool === 'gear_tool_gold' ? 'rgba(254, 240, 138, 0.78)' : 'rgba(219, 234, 254, 0.75)'}
            stroke={tool === 'gear_tool_gold' ? '#D97706' : '#2563EB'}
            strokeWidth="4.5"
          />
          <line
            x1="22"
            y1="22"
            x2="33"
            y2="33"
            stroke={tool === 'gear_tool_gold' ? '#92400E' : '#1E40AF'}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {tool === 'gear_tool_gold' && <text x="5" y="17" fontSize="13">✨</text>}
        </g>
      )}

      {/* 皮肤或心情漂浮小粒子 */}
      {skinId === 'skin_ice' && <text x="10" y="34" fontSize="18">❄️</text>}
      {skinId === 'skin_wizard' && <text x="10" y="34" fontSize="18">✨</text>}
      {skinId === 'skin_mecha' && <text x="10" y="34" fontSize="18">⚡</text>}
      {mood === 'celebrating' && <text x="108" y="34" fontSize="22">⭐</text>}
      {mood === 'encouraging' && <text x="108" y="36" fontSize="20">💪</text>}
      {mood === 'thinking' && <text x="108" y="36" fontSize="20">💡</text>}
    </svg>
  );
};
