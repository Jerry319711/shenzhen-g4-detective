import React, { useState } from 'react';
import { Award, Check, Gift, Heart, Lock, ShoppingBag, Sparkles, Trophy } from 'lucide-react';
import { EquipmentItem, LearnerProfile, PropItemId, SkinDef, SkinId } from '../types';
import { EQUIPMENT_CATALOG, RANK_TIERS, getRankForStars } from '../data/rewards';
import { ACHIEVEMENTS, KNOWLEDGE_CARDS, getBondLevel, getLevelFromXp } from '../data/rpgData';
import { MYSTERY_BOX_CATALOG, MysteryBoxDef, PROP_CATALOG, SKIN_CATALOG, getTotalBoxesInInventory } from '../data/seasonData';
import { DetectiveAvatar, AvatarMood } from './DetectiveAvatar';
import { ConfettiBurst } from './ConfettiBurst';
import { sound } from '../utils/sound';

interface Props {
  profile: LearnerProfile;
  onUnlockGear: (item: EquipmentItem) => void;
  onEquipGear: (item: EquipmentItem) => void;
  onUnlockSkin: (skin: SkinDef) => void;
  onCraftSkin: (skin: SkinDef) => void;
  onEquipSkin: (skinId: SkinId) => void;
  onBuyProp: (propId: PropItemId, cost: number) => void;
  onOpenMysteryBox: (boxId: MysteryBoxDef['id']) => string;
  onFeedPet: () => void;
  onClaimAchievement: (achId: string, rewardStars: number) => void;
}

const SLOT_LABELS: Record<EquipmentItem['slot'], string> = {
  hat: '传说头盔',
  eyes: '眼甲/圣印',
  tool: '主手神兵',
  cape: '战披风',
  badge: '副手圣盾',
};

const RARITY_STYLES = {
  R: { border: '#3B82F6', badge: 'pill-blue', label: 'R · 魔法' },
  SR: { border: '#A855F7', badge: 'pill-purple', label: 'SR · 史诗' },
  SSR: { border: '#F59E0B', badge: 'pill-amber', label: 'SSR · 暗金传奇' },
  MYTHIC: { border: '#06B6D4', badge: 'pill-purple', label: 'MYTHIC · 太古神话' },
};

export const WardrobeView: React.FC<Props> = ({
  profile,
  onUnlockGear,
  onEquipGear,
  onUnlockSkin,
  onCraftSkin,
  onEquipSkin,
  onBuyProp,
  onOpenMysteryBox,
  onFeedPet,
  onClaimAchievement,
}) => {
  const [subTab, setSubTab] = useState<'boxes' | 'skins' | 'gear' | 'pet' | 'cards' | 'achievements'>('boxes');
  const [previewSkinId, setPreviewSkinId] = useState<SkinId>(profile.equippedSkinId);
  const [stageMood, setStageMood] = useState<AvatarMood>('happy');
  const [toastMsg, setToastMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const rank = getRankForStars(profile.totalStarsEarned);
  const lvl = getLevelFromXp(profile.xp || 0);
  const bond = getBondLevel(profile.bondPoints || 0);
  const collectedSet = new Set(profile.collectedCardIds || []);
  const claimedSet = new Set(profile.claimedAchievementIds || []);
  const unlockedSkins = new Set(profile.unlockedSkinIds || ['skin_classic']);
  const inv = profile.inventory || {};
  const shards = profile.skinShards || 0;

  const claimableCount = ACHIEVEMENTS.filter((a) => a.check(profile) && !claimedSet.has(a.id)).length;
  const totalBoxes = getTotalBoxesInInventory(inv);

  const previewSkin = SKIN_CATALOG.find((s) => s.id === previewSkinId) || SKIN_CATALOG[0];
  const isPreviewOwned = unlockedSkins.has(previewSkin.id);
  const isPreviewEquipped = profile.equippedSkinId === previewSkin.id;

  const popToast = (msg: string, confetti = false) => {
    setToastMsg(msg);
    if (confetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }
    setTimeout(() => setToastMsg(''), 4200);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {showConfetti && <ConfettiBurst />}

      {/* 暗黑全息英雄大舞台 */}
      <div
        className="skin-stage"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 185, margin: '0 auto' }}>
          <DetectiveAvatar
            mood={toastMsg ? 'celebrating' : stageMood}
            skinId={previewSkinId}
            equippedGear={profile.equippedGear}
            size={168}
          />
          <div className="skin-pedestal" />
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {(
              [
                { m: 'happy', label: '😊 战备' },
                { m: 'thinking', label: '💡 蓄力' },
                { m: 'celebrating', label: '⚔️ 斩杀欢呼' },
              ] as { m: AvatarMood; label: string }[]
            ).map((btn) => (
              <button
                key={btn.m}
                type="button"
                onClick={() => setStageMood(btn.m)}
                style={{
                  padding: '4px 9px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  background: stageMood === btn.m ? '#F59E0B' : 'rgba(255,255,255,0.12)',
                  color: stageMood === btn.m ? '#1C1008' : '#E2E8F0',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 250, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="pill pill-amber">Lv.{lvl.level} · {rank.current.badge} {rank.current.title}</span>
            <span className="pill pill-purple">🧩 套装碎片：{shards} 枚</span>
            <span className="pill pill-blue">
              {isPreviewEquipped ? '✅ 穿戴中' : isPreviewOwned ? '👀 试穿（已拥有）' : '👀 全息试穿中'}
            </span>
          </div>

          <div>
            <h2 style={{ margin: '2px 0', fontSize: 23, fontWeight: 900, color: '#FDE68A' }}>
              {previewSkin.emoji} {previewSkin.name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#D6C7B2', fontWeight: 600 }}>
              {previewSkin.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {isPreviewOwned ? (
              <button
                className={isPreviewEquipped ? 'btn-mint' : 'btn-primary'}
                disabled={isPreviewEquipped}
                onClick={() => {
                  sound.playUnlock();
                  onEquipSkin(previewSkin.id);
                  popToast(`圣骑士换上全身套装【${previewSkin.name}】！全地牢同步生效！`, true);
                }}
              >
                {isPreviewEquipped ? <><Check size={16} /> 已出战穿戴</> : <><Sparkles size={16} /> 换上这套全身套装出战！</>}
              </button>
            ) : previewSkin.passOnly ? (
              <span className="pill pill-purple" style={{ padding: '7px 12px', fontSize: 12.5 }}>
                🏆 {previewSkin.passTierHint}
              </span>
            ) : (
              <>
                <button
                  className="btn-primary"
                  disabled={profile.stars < previewSkin.cost}
                  onClick={() => {
                    sound.playCaseSolved();
                    onUnlockSkin(previewSkin);
                    popToast(`解锁全身套装【${previewSkin.name}】并已穿戴！`, true);
                  }}
                >
                  {profile.stars >= previewSkin.cost
                    ? `⭐ ${previewSkin.cost} 购买`
                    : <><Lock size={14} /> 需 {previewSkin.cost} ⭐</>}
                </button>
                {previewSkin.shardCost && (
                  <button
                    className="btn-sky"
                    disabled={shards < previewSkin.shardCost}
                    onClick={() => {
                      sound.playCaseSolved();
                      onCraftSkin(previewSkin);
                      popToast(`🧩 碎片保底合成成功！获得【${previewSkin.name}】！`, true);
                    }}
                  >
                    🧩 {previewSkin.shardCost} 碎片合成（已有 {shards}）
                  </button>
                )}
              </>
            )}

            <span className="pill pill-amber" style={{ fontSize: 13.5 }}>⭐ {profile.stars}</span>
            <span className="pill pill-purple" style={{ fontSize: 13.5 }}>🔮 {profile.treats || 0}</span>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div
          className="card fade-in"
          style={{
            background: 'linear-gradient(90deg, rgba(234,88,12,0.32), rgba(217,119,6,0.28))',
            borderColor: '#F59E0B',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: 15,
            color: '#FEF08A',
            padding: '12px 16px',
            boxShadow: '0 0 22px rgba(245, 158, 11, 0.35)',
          }}
        >
          ✨ {toastMsg}
        </div>
      )}

      {/* 6 大基地页签 */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {(
          [
            { id: 'boxes', label: `🎁 4 档暗黑盲盒 & 道具 ${totalBoxes > 0 ? `(待拆${totalBoxes}!)` : ''}` },
            { id: 'skins', label: `🛡️ 全身套装 (${unlockedSkins.size}/${SKIN_CATALOG.length})` },
            { id: 'gear', label: `⚔️ 暗黑神装 (${profile.unlockedGearIds.length}/${EQUIPMENT_CATALOG.length})` },
            { id: 'pet', label: '🔮 圣光灌注' },
            { id: 'cards', label: `🃏 符文图鉴 (${collectedSet.size}/${KNOWLEDGE_CARDS.length})` },
            { id: 'achievements', label: `🏆 成就 ${claimableCount > 0 ? `(可领${claimableCount}!)` : ''}` },
          ] as { id: typeof subTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            className="btn-soft"
            style={{
              background: subTab === t.id ? '#DC2626' : '#221C2C',
              color: subTab === t.id ? '#FEF3C7' : '#D6C7B2',
              borderColor: subTab === t.id ? '#F59E0B' : '#4A3D58',
              fontSize: 13,
              padding: '8px 12px',
            }}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= Tab 1: 4 档暗黑盲盒抽卡池 + 5 种实战道具 ================= */}
      {subTab === 'boxes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {MYSTERY_BOX_CATALOG.map((box) => {
              const ownedQty =
                (inv[box.id] || 0) + (box.id === 'box_bronze' ? inv.item_mystery_box || 0 : 0);
              const canBuy = profile.stars >= box.cost;
              const st = RARITY_STYLES[box.rarity];

              return (
                <div
                  key={box.id}
                  className="card"
                  style={{
                    borderColor: box.borderColor,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                    background: 'linear-gradient(155deg, #211A2B, #130F1A)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 34 }}>{box.emoji}</span>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <span className={`pill ${st.badge}`}>{st.label}</span>
                        <span className="pill pill-amber">持有：{ownedQty}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#FDE68A' }}>{box.name}</div>
                    <div style={{ fontSize: 13, color: '#D6C7B2', fontWeight: 600, marginTop: 4 }}>{box.tagline}</div>
                    <div style={{ fontSize: 12, color: '#93C5FD', marginTop: 6, background: '#110E18', padding: '7px 10px', borderRadius: 10, border: '1px solid #2D263B' }}>
                      🎲 {box.oddsText}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1.2, padding: '9px 10px', fontSize: 13.5 }}
                      disabled={ownedQty <= 0}
                      onClick={() => {
                        sound.playCaseSolved();
                        const res = onOpenMysteryBox(box.id);
                        popToast(`${box.emoji} 拆开【${box.name}】：${res}`, true);
                      }}
                    >
                      <Gift size={15} /> 拆 1 个
                    </button>
                    <button
                      className="btn-soft"
                      style={{ flex: 1, padding: '9px 8px', fontSize: 13 }}
                      disabled={!canBuy}
                      onClick={() => {
                        sound.playClueFound();
                        onBuyProp(box.id, box.cost);
                        popToast(`购入 ${box.emoji} ${box.name} ×1，快点“拆 1 个”看爆什么！`);
                      }}
                    >
                      ⭐ {box.cost} 买 1 个
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5 种实战道具补给 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#FDE68A' }}>
              🎒 实战药水与破盾道具补给站
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {PROP_CATALOG.map((prop) => {
                const qty = inv[prop.id] || 0;
                const canBuy = profile.stars >= prop.cost;
                return (
                  <div
                    key={prop.id}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      background: '#120F18',
                      border: `1.5px solid ${qty > 0 ? prop.accentColor : '#332940'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 28 }}>{prop.emoji}</span>
                        <span className="pill pill-amber">背包：{qty}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#F5EFE4' }}>{prop.name}</div>
                      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-muted)' }}>{prop.description}</p>
                    </div>
                    <button
                      className="btn-soft"
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13 }}
                      disabled={!canBuy}
                      onClick={() => {
                        sound.playUnlock();
                        onBuyProp(prop.id, prop.cost);
                        popToast(`购入 ${prop.emoji} ${prop.name} ×1！战斗中可直接点击释放！`);
                      }}
                    >
                      <ShoppingBag size={14} /> {canBuy ? `⭐ ${prop.cost} 补货 1 个` : `还差 ${prop.cost - profile.stars} ⭐`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= Tab 2: 8 款英雄皮肤（支持星星买 & 碎片合成 & 点击试穿） ================= */}
      {subTab === 'skins' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))', gap: 14 }}>
          {SKIN_CATALOG.map((skin) => {
            const owned = unlockedSkins.has(skin.id);
            const equipped = profile.equippedSkinId === skin.id;
            const isSelected = previewSkinId === skin.id;
            const st = RARITY_STYLES[skin.rarity];
            const canBuy = !skin.passOnly && profile.stars >= skin.cost;
            const canCraft = Boolean(skin.shardCost && shards >= skin.shardCost);

            return (
              <div
                key={skin.id}
                className="card"
                onClick={() => {
                  sound.playClueFound();
                  setPreviewSkinId(skin.id);
                }}
                style={{
                  cursor: 'pointer',
                  padding: 15,
                  borderColor: isSelected ? '#FACC15' : equipped ? '#10B981' : st.border,
                  boxShadow: isSelected ? '0 0 18px rgba(250, 204, 21, 0.35)' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className={`pill ${st.badge}`}>{st.label}</span>
                    {equipped ? (
                      <span className="pill pill-green">出战中 ✓</span>
                    ) : isSelected ? (
                      <span className="pill pill-amber">👀 试穿中</span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '8px 0',
                      borderRadius: 14,
                      background: 'radial-gradient(circle, #2A1F3D 0%, #100D16 100%)',
                      margin: '4px 0 8px',
                    }}
                  >
                    <DetectiveAvatar mood="happy" skinId={skin.id} equippedGear={profile.equippedGear} size={114} animated={false} />
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16, textAlign: 'center', color: '#FDE68A' }}>
                    {skin.emoji} {skin.name}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-muted)', textAlign: 'center' }}>
                    {skin.description}
                  </p>
                </div>

                {owned ? (
                  <button
                    className={equipped ? 'btn-mint' : 'btn-primary'}
                    style={{ width: '100%', padding: '9px 10px', fontSize: 13.5 }}
                    disabled={equipped}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playUnlock();
                      setPreviewSkinId(skin.id);
                      onEquipSkin(skin.id);
                      popToast(`圣骑士换上全身套装【${skin.name}】出战！`, true);
                    }}
                  >
                    {equipped ? <><Check size={14} /> 正在穿戴</> : <><Sparkles size={14} /> 换上这套套装</>}
                  </button>
                ) : skin.passOnly ? (
                  <button
                    type="button"
                    className="btn-soft"
                    style={{ width: '100%', padding: '8px 8px', fontSize: 12 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClueFound();
                      setPreviewSkinId(skin.id);
                    }}
                  >
                    👀 试穿 · {skin.passTierHint}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      className="btn-primary"
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13 }}
                      disabled={!canBuy}
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playCaseSolved();
                        setPreviewSkinId(skin.id);
                        onUnlockSkin(skin);
                        popToast(`解锁全身套装【${skin.name}】！`, true);
                      }}
                    >
                      {canBuy ? `⭐ ${skin.cost} 购买` : <><Lock size={13} /> 需 {skin.cost} ⭐</>}
                    </button>
                    {skin.shardCost && (
                      <button
                        className="btn-sky"
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12 }}
                        disabled={!canCraft}
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playCaseSolved();
                          setPreviewSkinId(skin.id);
                          onCraftSkin(skin);
                          popToast(`🧩 消耗 ${skin.shardCost} 碎片合成【${skin.name}】！`, true);
                        }}
                      >
                        🧩 {skin.shardCost} 碎片保底合成（已有 {shards}）
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= Tab 3: 16 件传奇穿戴装备 ================= */}
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
                    padding: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                    borderColor: equipped ? '#10B981' : unlocked ? '#D97706' : '#3D3124',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 30 }}>{item.emoji}</span>
                      <span className="pill pill-blue">{SLOT_LABELS[item.slot]}</span>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 15.5, color: '#FDE68A' }}>{item.name}</div>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-muted)' }}>{item.description}</p>
                  </div>

                  {unlocked ? (
                    <button
                      className={equipped ? 'btn-mint' : 'btn-soft'}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13.5 }}
                      onClick={() => {
                        sound.playClueFound();
                        onEquipGear(item);
                      }}
                    >
                      {equipped ? <><Check size={15} /> 已装备（点击卸下）</> : <><Sparkles size={14} /> 装备上阵</>}
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13.5 }}
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playUnlock();
                        onUnlockGear(item);
                        popToast(`打造装备【${item.name}】成功！`);
                      }}
                    >
                      {canAfford ? `⭐ ${item.cost} 打造` : <><Lock size={13} /> 需 {item.cost} ⭐（白银箱可爆）</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 900, color: '#FDE68A' }}>🏅 庇护所段位晋升之路</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10 }}>
              {RANK_TIERS.map((tier) => {
                const reached = profile.totalStarsEarned >= tier.minStars;
                return (
                  <div
                    key={tier.level}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      textAlign: 'center',
                      background: reached ? 'rgba(217, 119, 6, 0.22)' : '#120F18',
                      border: `2px solid ${reached ? '#F59E0B' : '#332940'}`,
                      opacity: reached ? 1 : 0.6,
                    }}
                  >
                    <div style={{ fontSize: 26 }}>{tier.badge}</div>
                    <div style={{ fontWeight: 900, fontSize: 13.5, marginTop: 4, color: '#FDE68A' }}>{tier.title}</div>
                    <div style={{ fontSize: 12, color: '#B6A995', fontWeight: 700 }}>{tier.minStars} 累计⭐</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tab 4: 圣光精粹灌注 */}
      {subTab === 'pet' && (
        <div className="card" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <DetectiveAvatar mood={toastMsg ? 'celebrating' : 'happy'} skinId={profile.equippedSkinId} equippedGear={profile.equippedGear} size={140} />
          </div>
          <h3 style={{ margin: '4px 0', fontSize: 21, fontWeight: 900, color: '#FDE68A' }}>
            <Heart size={20} fill="#F59E0B" color="#FACC15" style={{ verticalAlign: 'middle', marginRight: 6 }} />
            圣光祝福 Lv.{bond.level} · {bond.title}
          </h3>
          <p style={{ margin: '6px auto 14px', maxWidth: 460, fontSize: 14, color: 'var(--ink-muted)' }}>
            开盲盒、打赢世界 BOSS 和完成试炼卷都能赢取「🔮 圣光精粹」，灌注给圣骑士提升圣光境界与英雄经验！
          </p>
          <div style={{ maxWidth: 420, margin: '0 auto 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#FDE68A', marginBottom: 4 }}>
              <span>当前圣光祝福值：{profile.bondPoints || 0}</span>
              <span>下一阶：{bond.nextNeed}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.round(((profile.bondPoints || 0) / bond.nextNeed) * 100))}%`,
                  background: 'linear-gradient(90deg, #F59E0B, #FDE047)',
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
              popToast('圣光涌动！圣骑士高举神剑：“为了庇护所！圣光祝福 +15、经验 +20 XP！” ✨');
            }}
          >
            🔮 灌注 1 颗圣光精粹（剩余 {profile.treats || 0} 颗）
          </button>
        </div>
      )}

      {/* Tab 5: 符文图鉴 */}
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
                  padding: 15,
                  borderColor: owned ? st.border : '#332940',
                  opacity: owned ? 1 : 0.65,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 28 }}>{owned ? card.emoji : '🔒'}</span>
                  <span className={`pill ${owned ? st.badge : 'pill-amber'}`}>{owned ? st.label : '待掉落'}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#FDE68A' }}>{card.title}</div>
                {owned ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F5EFE4', lineHeight: 1.55 }}>{card.rule}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', background: '#110E18', padding: '6px 9px', borderRadius: 9 }}>
                      例：{card.example}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                    击杀对应考点的小怪或世界 BOSS 即可掉落并永久点亮这张符文卡！
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 6: 成就勋章 */}
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
                  padding: 15,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                  borderColor: claimed ? '#10B981' : unlocked ? '#F59E0B' : '#332940',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 28 }}>{ach.emoji}</span>
                    <span className={`pill ${claimed ? 'pill-green' : unlocked ? 'pill-orange' : 'pill-amber'}`}>
                      {claimed ? '已领取 ✓' : `⭐ +${Math.round(ach.rewardStars * 0.6)}`}
                    </span>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: '#FDE68A' }}>{ach.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 3 }}>{ach.description}</div>
                </div>

                {unlocked && !claimed ? (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13.5 }}
                    onClick={() => {
                      const amt = Math.round(ach.rewardStars * 0.6);
                      sound.playCaseSolved();
                      onClaimAchievement(ach.id, amt);
                      popToast(`领取成就【${ach.title}】奖励 ⭐+${amt}！`, true);
                    }}
                  >
                    <Trophy size={15} /> 领取 ⭐ +{Math.round(ach.rewardStars * 0.6)}！
                  </button>
                ) : (
                  <div style={{ fontSize: 12, fontWeight: 800, color: claimed ? '#34D399' : '#786D5F', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Award size={14} /> {claimed ? '荣誉已入库' : '继续讨伐即可解锁'}
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
