import React, { useState } from 'react';
import { Award, Check, Gift, Heart, Lock, ShoppingBag, Sparkles, Trophy } from 'lucide-react';
import { EquipmentItem, LearnerProfile, PropItemId, SkinDef, SkinId } from '../types';
import { EQUIPMENT_CATALOG, RANK_TIERS, getRankForStars } from '../data/rewards';
import { ACHIEVEMENTS, KNOWLEDGE_CARDS, getBondLevel, getLevelFromXp } from '../data/rpgData';
import { PROP_CATALOG, SKIN_CATALOG } from '../data/seasonData';
import { DetectiveAvatar } from './DetectiveAvatar';
import { ConfettiBurst } from './ConfettiBurst';
import { sound } from '../utils/sound';

interface Props {
  profile: LearnerProfile;
  onUnlockGear: (item: EquipmentItem) => void;
  onEquipGear: (item: EquipmentItem) => void;
  onUnlockSkin: (skin: SkinDef) => void;
  onEquipSkin: (skinId: SkinId) => void;
  onBuyProp: (propId: PropItemId, cost: number) => void;
  onOpenMysteryBox: () => string;
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
  R: { bg: '#EFF6FF', border: '#93C5FD', badge: 'pill-blue', label: 'R · 经典' },
  SR: { bg: '#F5F3FF', border: '#C4B5FD', badge: 'pill-purple', label: 'SR · 史诗' },
  SSR: { bg: '#FFFBEB', border: '#F59E0B', badge: 'pill-amber', label: 'SSR · 传说' },
  MYTHIC: { bg: 'linear-gradient(135deg, #ECFEFF, #EDE9FE)', border: '#06B6D4', badge: 'pill-purple', label: 'MYTHIC · 神话' },
};

export const WardrobeView: React.FC<Props> = ({
  profile,
  onUnlockGear,
  onEquipGear,
  onUnlockSkin,
  onEquipSkin,
  onBuyProp,
  onOpenMysteryBox,
  onFeedPet,
  onClaimAchievement,
}) => {
  const [subTab, setSubTab] = useState<'skins' | 'props' | 'gear' | 'pet' | 'cards' | 'achievements'>('skins');
  const [toastMsg, setToastMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const rank = getRankForStars(profile.totalStarsEarned);
  const lvl = getLevelFromXp(profile.xp || 0);
  const bond = getBondLevel(profile.bondPoints || 0);
  const collectedSet = new Set(profile.collectedCardIds || []);
  const claimedSet = new Set(profile.claimedAchievementIds || []);
  const unlockedSkins = new Set(profile.unlockedSkinIds || ['skin_classic']);
  const inv = profile.inventory || {};

  const claimableCount = ACHIEVEMENTS.filter((a) => a.check(profile) && !claimedSet.has(a.id)).length;
  const mysteryBoxCount = inv.item_mystery_box || 0;

  const popToast = (msg: string, confetti = false) => {
    setToastMsg(msg);
    if (confetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }
    setTimeout(() => setToastMsg(''), 3600);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {showConfetti && <ConfettiBurst />}

      {/* 阿探实时换装展示台 */}
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
          <DetectiveAvatar
            mood={toastMsg ? 'celebrating' : 'happy'}
            skinId={profile.equippedSkinId}
            equippedGear={profile.equippedGear}
            size={128}
          />
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className="pill pill-amber">Lv.{lvl.level} 神探</span>
              <span className="pill pill-blue">{rank.current.badge} {rank.current.title}</span>
              <span className="pill pill-orange">💛 亲密度 Lv.{bond.level} · {bond.title}</span>
            </div>
            <h2 style={{ margin: '4px 0', fontSize: 22, fontWeight: 900 }}>
              {profile.nickname} 的皮肤商城 · 道具背包 · 图鉴基地
            </h2>
            <div style={{ fontSize: 13, color: '#78350F', fontWeight: 700 }}>
              皮肤 {unlockedSkins.size}/{SKIN_CATALOG.length} · 装备 {profile.unlockedGearIds.length}/{EQUIPMENT_CATALOG.length} · 口诀卡 {collectedSet.size}/{KNOWLEDGE_CARDS.length}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ background: '#FFFFFF', border: '2px solid #FBBF24', borderRadius: 16, padding: '10px 15px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E' }}>可用侦探星</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#D97706' }}>⭐ {profile.stars}</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '2px solid #FB923C', borderRadius: 16, padding: '10px 15px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9A3412' }}>智慧狗粮</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#EA580C' }}>🦴 {profile.treats || 0}</div>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div
          className="card fade-in"
          style={{
            background: '#FEF3C7',
            borderColor: '#F59E0B',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: 15,
            color: '#92400E',
            padding: '12px 16px',
          }}
        >
          🎉 {toastMsg}
        </div>
      )}

      {/* 6 大基地子页签 */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {(
          [
            { id: 'skins', label: `🎨 全身皮肤 (${unlockedSkins.size}/${SKIN_CATALOG.length})` },
            { id: 'props', label: `🎒 道具与盲盒 ${mysteryBoxCount > 0 ? `(🎁${mysteryBoxCount}!)` : ''}` },
            { id: 'gear', label: `🕵️ 穿戴装备 (${profile.unlockedGearIds.length}/${EQUIPMENT_CATALOG.length})` },
            { id: 'pet', label: '🦴 喂养阿探' },
            { id: 'cards', label: `🃏 口诀图鉴 (${collectedSet.size}/${KNOWLEDGE_CARDS.length})` },
            { id: 'achievements', label: `🏆 成就 ${claimableCount > 0 ? `(可领${claimableCount}!)` : ''}` },
          ] as { id: typeof subTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            className="btn-soft"
            style={{
              background: subTab === t.id ? '#F59E0B' : '#FFFFFF',
              color: subTab === t.id ? '#FFFFFF' : '#475569',
              borderColor: subTab === t.id ? '#D97706' : '#E2E8F0',
              fontSize: 13,
              padding: '8px 13px',
            }}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: 8 款全身限定皮肤 */}
      {subTab === 'skins' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))', gap: 14 }}>
          {SKIN_CATALOG.map((skin) => {
            const owned = unlockedSkins.has(skin.id);
            const equipped = profile.equippedSkinId === skin.id;
            const st = RARITY_STYLES[skin.rarity];
            const canBuy = !skin.passOnly && profile.stars >= skin.cost;

            return (
              <div
                key={skin.id}
                className="card"
                style={{
                  padding: 16,
                  background: equipped ? '#ECFDF5' : st.bg,
                  borderColor: equipped ? '#10B981' : st.border,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className={`pill ${st.badge}`}>{st.label}</span>
                    {equipped && <span className="pill pill-green">穿戴中 ✓</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
                    <DetectiveAvatar mood="happy" skinId={skin.id} equippedGear={profile.equippedGear} size={96} />
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16, textAlign: 'center' }}>
                    {skin.emoji} {skin.name}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#475569', textAlign: 'center', fontWeight: 600 }}>
                    {skin.description}
                  </p>
                </div>

                {owned ? (
                  <button
                    className={equipped ? 'btn-mint' : 'btn-primary'}
                    style={{ width: '100%', padding: '9px 12px', fontSize: 14 }}
                    disabled={equipped}
                    onClick={() => {
                      sound.playUnlock();
                      onEquipSkin(skin.id);
                      popToast(`阿探换上了超酷皮肤【${skin.name}】！`);
                    }}
                  >
                    {equipped ? <><Check size={15} /> 正在穿戴</> : <><Sparkles size={15} /> 换上这套皮肤</>}
                  </button>
                ) : skin.passOnly ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '8px 10px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.85)',
                      border: '1.5px dashed #8B5CF6',
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#6D28D9',
                    }}
                  >
                    🏆 {skin.passTierHint}
                  </div>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '9px 12px', fontSize: 14 }}
                    disabled={!canBuy}
                    onClick={() => {
                      sound.playCaseSolved();
                      onUnlockSkin(skin);
                      popToast(`恭喜解锁限定皮肤【${skin.name}】并已自动穿戴！`, true);
                    }}
                  >
                    {canBuy ? `⭐ ${skin.cost} 购买并穿戴` : <><Lock size={14} /> 还差 {skin.cost - profile.stars} ⭐</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 实战道具背包 & 神秘盲盒拆箱 */}
      {subTab === 'props' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 盲盒拆箱特区 */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #FDF2F8, #FEF3C7)',
              borderColor: '#EC4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 44 }}>🎁</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#9D174D' }}>
                  神探神秘盲盒抽奖机（当前拥有 {mysteryBoxCount} 个）
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#831843' }}>
                  拆开随机爆出 30~90 侦探星、智慧狗粮、透视仪、排除剪刀、Boss 暴击弹，欧皇更有双倍大礼！
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-primary"
                disabled={mysteryBoxCount <= 0}
                onClick={() => {
                  sound.playCaseSolved();
                  const rewardText = onOpenMysteryBox();
                  popToast(`🎁 拆开盲盒大爆奖：${rewardText}`, true);
                }}
              >
                <Gift size={17} /> 拆开 1 个盲盒！
              </button>
              <button
                className="btn-soft"
                disabled={profile.stars < 35}
                onClick={() => {
                  sound.playClueFound();
                  onBuyProp('item_mystery_box', 35);
                  popToast('购买了 1 个神探神秘盲盒，快拆开看看吧！');
                }}
              >
                ⭐ 35 买 1 个
              </button>
            </div>
          </div>

          {/* 6 种道具卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {PROP_CATALOG.map((prop) => {
              const qty = inv[prop.id] || 0;
              const canBuy = profile.stars >= prop.cost;
              return (
                <div
                  key={prop.id}
                  className="card"
                  style={{
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                    borderColor: qty > 0 ? prop.accentColor : '#E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 32 }}>{prop.emoji}</span>
                      <span className="pill pill-amber">背包拥有：{qty} 个</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{prop.name}</div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-muted)', fontWeight: 600 }}>
                      {prop.description}
                    </p>
                  </div>

                  <button
                    className="btn-soft"
                    style={{ width: '100%', padding: '9px 12px', fontSize: 14 }}
                    disabled={!canBuy}
                    onClick={() => {
                      sound.playUnlock();
                      onBuyProp(prop.id, prop.cost);
                      popToast(`购入 ${prop.emoji} ${prop.name} ×1！做题或打 Boss 时可直接点击使用！`);
                    }}
                  >
                    <ShoppingBag size={15} /> {canBuy ? `⭐ ${prop.cost} 补货 1 个` : `还差 ${prop.cost - profile.stars} ⭐`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: 16 件穿戴装备 */}
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
                      {equipped ? <><Check size={16} /> 已穿戴（点击卸下）</> : <><Sparkles size={15} /> 给阿探戴上</>}
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ width: '100%', padding: '9px 12px', fontSize: 14 }}
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playUnlock();
                        onUnlockGear(item);
                        popToast(`解锁装备【${item.name}】并已戴在阿探身上！`);
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

      {/* Tab 4: 喂养阿探 */}
      {subTab === 'pet' && (
        <div className="card" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <DetectiveAvatar mood={toastMsg ? 'celebrating' : 'happy'} skinId={profile.equippedSkinId} equippedGear={profile.equippedGear} size={140} />
          </div>
          <h3 style={{ margin: '4px 0', fontSize: 21, fontWeight: 900 }}>
            <Heart size={20} fill="#F43F5E" color="#E11D48" style={{ verticalAlign: 'middle', marginRight: 6 }} />
            默契等级 Lv.{bond.level} · {bond.title}
          </h3>
          <p style={{ margin: '6px auto 14px', maxWidth: 460, fontSize: 14, color: 'var(--ink-muted)', fontWeight: 600 }}>
            通过赛季通行证、打赢 Boss 和完成模拟卷都能赢取「🦴 智慧狗粮」！喂给阿探能增加亲密度与经验值！
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
          <button
            className="btn-primary"
            disabled={(profile.treats || 0) <= 0}
            onClick={() => {
              sound.playUnlock();
              onFeedPet();
              popToast('阿探开心地摇尾巴：“汪呜！谢谢喂我智慧狗粮，亲密度 +15、经验 +20！” 💛');
            }}
          >
            🦴 喂一块智慧狗粮（剩余 {profile.treats || 0} 块，亲密度 +15）
          </button>
        </div>
      )}

      {/* Tab 5: 口诀卡牌图鉴 */}
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
                  <span className={`pill ${owned ? st.badge : 'pill-amber'}`}>{owned ? st.label : '待点亮'}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>{card.title}</div>
                {owned ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', lineHeight: 1.55 }}>{card.rule}</div>
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

      {/* Tab 6: 成就勋章墙 */}
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
                      popToast(`领取成就【${ach.title}】奖励 ⭐+${ach.rewardStars}！`, true);
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
