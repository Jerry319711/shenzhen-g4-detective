import React, { useState } from 'react';
import { Award, Check, Heart, Lock, Sparkles, Trophy } from 'lucide-react';
import { EquipmentItem, LearnerProfile } from '../types';
import { EQUIPMENT_CATALOG, RANK_TIERS, getRankForStars } from '../data/rewards';
import { ACHIEVEMENTS, KNOWLEDGE_CARDS, getBondLevel, getLevelFromXp } from '../data/rpgData';
import { DetectiveAvatar } from './DetectiveAvatar';
import { sound } from '../utils/sound';

interface Props {
  profile: LearnerProfile;
  onUnlockGear: (item: EquipmentItem) => void;
  onEquipGear: (item: EquipmentItem) => void;
  onFeedPet: () => void;
  onClaimAchievement: (achId: string, rewardStars: number) => void;
}

const SLOT_LABELS: Record<EquipmentItem['slot'], string> = {
  hat: '头饰',
  eyes: '眼镜',
  tool: '探案道具',
  cape: '披风',
  badge: '荣誉徽章',
};

const RARITY_STYLES = {
  R: { bg: '#EFF6FF', border: '#93C5FD', badge: 'pill-blue', label: 'R · 基础秘籍' },
  SR: { bg: '#F5F3FF', border: '#C4B5FD', badge: 'pill-purple', label: 'SR · 史诗口诀' },
  SSR: { bg: '#FFFBEB', border: '#F59E0B', badge: 'pill-amber', label: 'SSR · 传说神诀' },
};

export const WardrobeView: React.FC<Props> = ({
  profile,
  onUnlockGear,
  onEquipGear,
  onFeedPet,
  onClaimAchievement,
}) => {
  const [subTab, setSubTab] = useState<'gear' | 'pet' | 'cards' | 'achievements'>('gear');
  const [feedToast, setFeedToast] = useState('');

  const rank = getRankForStars(profile.totalStarsEarned);
  const lvl = getLevelFromXp(profile.xp || 0);
  const bond = getBondLevel(profile.bondPoints || 0);
  const collectedSet = new Set(profile.collectedCardIds || []);
  const claimedSet = new Set(profile.claimedAchievementIds || []);

  const claimableCount = ACHIEVEMENTS.filter((a) => a.check(profile) && !claimedSet.has(a.id)).length;

  const handleFeed = () => {
    if ((profile.treats || 0) <= 0) return;
    sound.playUnlock();
    onFeedPet();
    setFeedToast('阿探开心地摇尾巴：“汪呜！谢谢喂我智慧狗粮，我们的默契又升级啦！” 💛');
    setTimeout(() => setFeedToast(''), 3200);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 阿探实时状态大卡片 */}
      <div
        className="card card-warm"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <DetectiveAvatar mood={feedToast ? 'celebrating' : 'happy'} equippedGear={profile.equippedGear} size={122} />
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className="pill pill-amber">Lv.{lvl.level} 神探</span>
              <span className="pill pill-blue">{rank.current.badge} {rank.current.title}</span>
              <span className="pill pill-orange">💛 亲密度 Lv.{bond.level} · {bond.title}</span>
            </div>
            <h2 style={{ margin: '4px 0', fontSize: 22, fontWeight: 900 }}>
              {profile.nickname} 的神探基地与图鉴
            </h2>
            <div style={{ fontSize: 13, color: '#78350F', fontWeight: 700 }}>
              经验值 {lvl.currentXp}/{lvl.neededXp} XP · 已收集口诀卡牌 {collectedSet.size}/{KNOWLEDGE_CARDS.length} 张
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ background: '#FFFFFF', border: '2px solid #FBBF24', borderRadius: 16, padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E' }}>可用侦探星</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#D97706' }}>⭐ {profile.stars}</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '2px solid #FB923C', borderRadius: 16, padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9A3412' }}>智慧狗粮</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#EA580C' }}>🦴 {profile.treats || 0}</div>
          </div>
        </div>
      </div>

      {/* 4 大养成子页签 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn-soft"
          style={{
            background: subTab === 'gear' ? '#F59E0B' : '#FFFFFF',
            color: subTab === 'gear' ? '#FFFFFF' : '#475569',
            borderColor: subTab === 'gear' ? '#D97706' : '#E2E8F0',
          }}
          onClick={() => setSubTab('gear')}
        >
          🕵️ 神探换装 ({profile.unlockedGearIds.length}/{EQUIPMENT_CATALOG.length})
        </button>
        <button
          className="btn-soft"
          style={{
            background: subTab === 'pet' ? '#F59E0B' : '#FFFFFF',
            color: subTab === 'pet' ? '#FFFFFF' : '#475569',
            borderColor: subTab === 'pet' ? '#D97706' : '#E2E8F0',
          }}
          onClick={() => setSubTab('pet')}
        >
          🦴 喂养阿探
        </button>
        <button
          className="btn-soft"
          style={{
            background: subTab === 'cards' ? '#F59E0B' : '#FFFFFF',
            color: subTab === 'cards' ? '#FFFFFF' : '#475569',
            borderColor: subTab === 'cards' ? '#D97706' : '#E2E8F0',
          }}
          onClick={() => setSubTab('cards')}
        >
          🃏 口诀卡牌图鉴 ({collectedSet.size}/{KNOWLEDGE_CARDS.length})
        </button>
        <button
          className="btn-soft"
          style={{
            background: subTab === 'achievements' ? '#F59E0B' : '#FFFFFF',
            color: subTab === 'achievements' ? '#FFFFFF' : '#475569',
            borderColor: subTab === 'achievements' ? '#D97706' : '#E2E8F0',
          }}
          onClick={() => setSubTab('achievements')}
        >
          🏆 成就勋章 {claimableCount > 0 ? `(可领 ${claimableCount}!)` : ''}
        </button>
      </div>

      {/* Tab 1: 装备商店 */}
      {subTab === 'gear' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))', gap: 14 }}>
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
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>{item.description}</p>
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
                    <div style={{ fontSize: 12, color: '#92400E', fontWeight: 700 }}>{tier.minStars} 累计⭐</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tab 2: 喂养阿探 */}
      {subTab === 'pet' && (
        <div className="card" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <DetectiveAvatar mood={feedToast ? 'celebrating' : 'happy'} equippedGear={profile.equippedGear} size={140} />
          </div>
          <h3 style={{ margin: '4px 0', fontSize: 21, fontWeight: 900 }}>
            <Heart size={20} fill="#F43F5E" color="#E11D48" style={{ verticalAlign: 'middle', marginRight: 6 }} />
            默契等级 Lv.{bond.level} · {bond.title}
          </h3>
          <p style={{ margin: '6px auto 14px', maxWidth: 460, fontSize: 14, color: 'var(--ink-muted)', fontWeight: 600 }}>
            通过连击破案、打赢 Boss 和完成模拟试卷都能赢取「🦴 智慧狗粮」！喂给阿探能增加亲密度与经验值哦！
          </p>
          <div style={{ maxWidth: 420, margin: '0 auto 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>
              <span>当前亲密度：{profile.bondPoints || 0}</span>
              <span>目标：{bond.nextNeed}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.round(((profile.bondPoints || 0) / bond.nextNeed) * 100))}%`,
                  background: 'linear-gradient(90deg, #FB7185, #F43F5E)',
                }}
              />
            </div>
          </div>

          {feedToast && (
            <div
              className="fade-in"
              style={{
                maxWidth: 480,
                margin: '0 auto 14px',
                background: '#FEF3C7',
                border: '2px solid #F59E0B',
                borderRadius: 14,
                padding: '10px 14px',
                fontWeight: 800,
                color: '#92400E',
              }}
            >
              {feedToast}
            </div>
          )}

          <button className="btn-primary" disabled={(profile.treats || 0) <= 0} onClick={handleFeed}>
            🦴 喂一块智慧狗粮（剩余 {profile.treats || 0} 块，亲密度 +15）
          </button>
        </div>
      )}

      {/* Tab 3: 口诀卡牌图鉴 */}
      {subTab === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {KNOWLEDGE_CARDS.map((card) => {
            const owned = collectedSet.has(card.id);
            const st = RARITY_STYLES[card.rarity];
            return (
              <div
                key={card.id}
                className="card"
                style={{
                  padding: 16,
                  background: owned ? st.bg : '#F8FAFC',
                  borderColor: owned ? st.border : '#CBD5E1',
                  opacity: owned ? 1 : 0.72,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 28 }}>{owned ? card.emoji : '🔒'}</span>
                  <span className={`pill ${owned ? st.badge : 'pill-amber'}`}>
                    {owned ? st.label : '待点亮'}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>{card.title}</div>
                {owned ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', lineHeight: 1.55 }}>
                      {card.rule}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', background: 'rgba(255,255,255,0.8)', padding: '6px 9px', borderRadius: 10 }}>
                      例：{card.example}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                    去完成对应考点的探案案件或击败守关 Boss，即可永久点亮这张稀有口诀卡！
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: 成就勋章墙 */}
      {subTab === 'achievements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = ach.check(profile);
            const claimed = claimedSet.has(ach.id);
            return (
              <div
                key={ach.id}
                className="card"
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: claimed ? '#ECFDF5' : unlocked ? '#FFFBEB' : '#FFFFFF',
                  borderColor: claimed ? '#34D399' : unlocked ? '#F59E0B' : '#E2E8F0',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 28 }}>{ach.emoji}</span>
                    <span className={`pill ${claimed ? 'pill-green' : unlocked ? 'pill-orange' : 'pill-amber'}`}>
                      {claimed ? '已领取 ✓' : `⭐ +${ach.rewardStars}`}
                    </span>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{ach.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 3 }}>{ach.description}</div>
                </div>

                {unlocked && !claimed ? (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '9px 12px', fontSize: 14 }}
                    onClick={() => {
                      sound.playCaseSolved();
                      onClaimAchievement(ach.id, ach.rewardStars);
                    }}
                  >
                    <Trophy size={15} /> 领取 ⭐ +{ach.rewardStars} 奖励！
                  </button>
                ) : (
                  <div style={{ fontSize: 12, fontWeight: 800, color: claimed ? '#059669' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Award size={14} /> {claimed ? '荣誉已收入囊中' : '继续探案即可解锁'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
