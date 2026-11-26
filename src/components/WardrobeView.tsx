import React from 'react';
import { Check, Lock, Sparkles } from 'lucide-react';
import { EquipmentItem, LearnerProfile } from '../types';
import { EQUIPMENT_CATALOG, RANK_TIERS, getRankForStars } from '../data/rewards';
import { DetectiveAvatar } from './DetectiveAvatar';
import { sound } from '../utils/sound';

interface Props {
  profile: LearnerProfile;
  onUnlockGear: (item: EquipmentItem) => void;
  onEquipGear: (item: EquipmentItem) => void;
}

const SLOT_LABELS: Record<EquipmentItem['slot'], string> = {
  hat: '头饰',
  eyes: '眼镜',
  tool: '探案道具',
  cape: '披风',
  badge: '荣誉徽章',
};

export const WardrobeView: React.FC<Props> = ({ profile, onUnlockGear, onEquipGear }) => {
  const rank = getRankForStars(profile.totalStarsEarned);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 阿探实时换装台 */}
      <div
        className="card card-warm"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <DetectiveAvatar mood="celebrating" equippedGear={profile.equippedGear} size={126} />
          <div>
            <span className="pill pill-amber">{rank.current.badge} {rank.current.title}</span>
            <h2 style={{ margin: '8px 0 4px', fontSize: 23, fontWeight: 900 }}>
              {profile.nickname} 的神探装备库
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#78350F', fontWeight: 600 }}>
              点击装备即可立刻穿在阿探身上！努力破案就能攒星星解锁更多酷炫神器~
            </p>
          </div>
        </div>
        <div
          style={{
            background: '#FFFFFF',
            border: '2.5px solid #FBBF24',
            borderRadius: 18,
            padding: '12px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E' }}>可用侦探星</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#D97706' }}>⭐ {profile.stars}</div>
        </div>
      </div>

      {/* 装备货架 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {EQUIPMENT_CATALOG.map((item) => {
          const unlocked = profile.unlockedGearIds.includes(item.id);
          const equipped = profile.equippedGear[item.slot] === item.id;
          const canAfford = profile.stars >= item.cost;

          return (
            <div
              key={item.id}
              className="card"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                borderColor: equipped ? '#10B981' : unlocked ? '#FCD34D' : '#E2E8F0',
                background: equipped ? '#ECFDF5' : '#FFFFFF',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{item.emoji}</span>
                  <span className="pill pill-blue">{SLOT_LABELS[item.slot]}</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{item.name}</div>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>
                  {item.description}
                </p>
              </div>

              {unlocked ? (
                <button
                  className={equipped ? 'btn-mint' : 'btn-soft'}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 14 }}
                  onClick={() => {
                    sound.playClueFound();
                    onEquipGear(item);
                  }}
                >
                  {equipped ? (
                    <>
                      <Check size={16} /> 已穿戴（点击卸下）
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} /> 给阿探戴上
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '9px 12px', fontSize: 14 }}
                  disabled={!canAfford}
                  onClick={() => {
                    sound.playUnlock();
                    onUnlockGear(item);
                  }}
                >
                  {canAfford ? `⭐ ${item.cost} 解锁并穿戴` : <><Lock size={14} /> 还差 {item.cost - profile.stars} ⭐</>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 神探晋升段位表 */}
      <div className="card">
        <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 900 }}>🏅 神探段位晋升之路</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10 }}>
          {RANK_TIERS.map((tier) => {
            const reached = profile.totalStarsEarned >= tier.minStars;
            return (
              <div
                key={tier.level}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  textAlign: 'center',
                  background: reached ? '#FEF3C7' : '#F8FAFC',
                  border: `2px solid ${reached ? '#F59E0B' : '#E2E8F0'}`,
                  opacity: reached ? 1 : 0.65,
                }}
              >
                <div style={{ fontSize: 26 }}>{tier.badge}</div>
                <div style={{ fontWeight: 900, fontSize: 14, marginTop: 4 }}>{tier.title}</div>
                <div style={{ fontSize: 12, color: '#92400E', fontWeight: 700 }}>
                  {tier.minStars} 累计⭐
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
