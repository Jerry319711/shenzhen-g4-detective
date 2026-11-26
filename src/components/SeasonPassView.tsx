import React, { useState } from 'react';
import { Check, Crown, Flame, Gift, Lock, Sparkles, Star } from 'lucide-react';
import { LearnerProfile, SeasonReward } from '../types';
import {
  DAILY_SEASON_QUESTS,
  ELITE_PASS_UNLOCK_STARS,
  SEASON_TIERS,
  getSeasonTierInfo,
} from '../data/seasonData';
import { DetectiveAvatar } from './DetectiveAvatar';
import { ConfettiBurst } from './ConfettiBurst';
import { sound } from '../utils/sound';

interface Props {
  profile: LearnerProfile;
  onUnlockElitePass: () => void;
  onClaimTierReward: (tier: number, track: 'free' | 'elite', reward: SeasonReward) => void;
  onClaimDailyQuest: (questId: string, rewardSp: number, rewardStars: number) => void;
}

export const SeasonPassView: React.FC<Props> = ({
  profile,
  onUnlockElitePass,
  onClaimTierReward,
  onClaimDailyQuest,
}) => {
  const [celebrateMsg, setCelebrateMsg] = useState('');
  const sp = profile.seasonPoints || 0;
  const info = getSeasonTierInfo(sp);

  const canFreeUnlockElite =
    profile.totalStarsEarned >= ELITE_PASS_UNLOCK_STARS || (profile.defeatedBossIds || []).length >= 3;
  const eliteActive = Boolean(profile.seasonEliteUnlocked);

  const claimedFree = new Set(profile.claimedFreeTiers || []);
  const claimedElite = new Set(profile.claimedEliteTiers || []);
  const claimedQuests = new Set(profile.claimedDailyQuestIds || []);
  const dqp = profile.dailyQuestProgress || {
    casesSolved: 0, englishSolved: 0, mathSolved: 0, cluesAllFound: 0, examsDone: 0, bossHits: 0,
  };

  const triggerToast = (msg: string) => {
    setCelebrateMsg(msg);
    setTimeout(() => setCelebrateMsg(''), 3000);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {celebrateMsg && <ConfettiBurst />}

      {/* 赛季主视觉 Hero 横幅 */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 55%, #0E7490 100%)',
          borderColor: '#38BDF8',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className="pill" style={{ background: '#FACC15', color: '#713F12' }}>
              🏆 S1 赛季 · 智慧星辰季
            </span>
            <span className="pill" style={{ background: 'rgba(56,189,248,0.22)', color: '#E0F2FE', border: '1px solid #38BDF8' }}>
              全免费 · 100% 靠学习升级领大奖
            </span>
          </div>

          <h2 style={{ margin: '4px 0', fontSize: 24, fontWeight: 900 }}>
            当前通行证等级：Lv.{info.currentTier} / 20
          </h2>
          <p style={{ margin: '4px 0 12px', fontSize: 13, color: '#CBD5E1', fontWeight: 600 }}>
            破案、刷模拟卷、打 Boss、完成每日任务都能狂涨赛季奖杯点（SP）！20 级终极大奖送神话限定皮肤【🤖 星际机甲阿探】！
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#BAE6FD', marginBottom: 5 }}>
            <span>⚡ 赛季点数：{sp} SP</span>
            <span>
              {info.maxReached
                ? '🎉 已达 20 级满级巅峰！'
                : `距 Lv.${info.nextTier.tier} 还差 ${Math.max(0, info.nextTier.requiredSp - sp)} SP`}
            </span>
          </div>
          <div className="progress-track" style={{ background: 'rgba(255,255,255,0.18)', height: 14 }}>
            <div
              className="progress-fill"
              style={{
                width: `${info.pct}%`,
                background: 'linear-gradient(90deg, #38BDF8, #FACC15)',
              }}
            />
          </div>

          {/* 免费激活精英轨按钮 */}
          <div style={{ marginTop: 14 }}>
            {eliteActive ? (
              <span className="pill" style={{ background: 'linear-gradient(90deg, #F59E0B, #FACC15)', color: '#78350F', padding: '6px 14px', fontSize: 13 }}>
                <Crown size={15} /> 精英神探双轨已激活！（免费双倍领奖中）
              </span>
            ) : (
              <button
                className="btn-primary"
                disabled={!canFreeUnlockElite}
                onClick={() => {
                  sound.playCaseSolved();
                  onUnlockElitePass();
                  triggerToast('👑 恭喜免费激活【精英神探轨】！现在可以领取整条黄金轨道的限定皮肤与盲盒啦！');
                }}
              >
                <Crown size={17} />
                {canFreeUnlockElite
                  ? '免费激活【精英神探双轨】！'
                  : `累计 ${ELITE_PASS_UNLOCK_STARS} ⭐（当前 ${profile.totalStarsEarned}）或击败 3 位世界 BOSS 免费解锁`}
              </button>
            )}
          </div>
        </div>

        {/* 20级终极神话皮肤预览 */}
        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(56,189,248,0.6)',
            borderRadius: 20,
            padding: '12px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, color: '#67E8F9', marginBottom: 4 }}>
            ✨ 20 级终极神话皮肤预览
          </div>
          <DetectiveAvatar
            mood="celebrating"
            skinId="skin_mecha"
            equippedGear={{ hat: 'gear_hat_mecha', tool: 'gear_tool_lightsaber', badge: 'gear_badge_diamond' }}
            size={112}
          />
          <div style={{ fontSize: 13, fontWeight: 900, color: '#FDE047', marginTop: 4 }}>
            🤖 星际机甲阿探
          </div>
        </div>
      </div>

      {celebrateMsg && (
        <div
          className="card fade-in"
          style={{
            background: '#FEF3C7',
            borderColor: '#F59E0B',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: 16,
            color: '#92400E',
            padding: 14,
          }}
        >
          🎉 {celebrateMsg}
        </div>
      )}

      {/* 每日赛季任务（快速升级通行证引擎） */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Flame size={20} color="#EA580C" /> 今日赛季悬赏任务（每天刷新 · 秒升通行证！）
          </h3>
          <span className="pill pill-amber">完成即领 SP + 侦探星</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {DAILY_SEASON_QUESTS.map((q) => {
            const cur = Math.min(q.target, q.getCurrent(dqp));
            const done = cur >= q.target;
            const claimed = claimedQuests.has(q.id);
            return (
              <div
                key={q.id}
                style={{
                  background: claimed ? 'rgba(6,78,59,0.35)' : done ? 'rgba(120,53,15,0.35)' : '#120F18',
                  border: `1.5px solid ${claimed ? '#34D399' : done ? '#F59E0B' : '#332940'}`,
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 14, color: '#F5EFE4' }}>
                    <span>{q.emoji} {q.title}</span>
                    <span style={{ color: done ? '#34D399' : '#B6A995' }}>{cur}/{q.target}</span>
                  </div>
                  <div className="progress-track" style={{ height: 7, marginTop: 6 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.round((cur / q.target) * 100)}%`,
                        background: done ? '#10B981' : '#3B82F6',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FDE047' }}>
                    +{q.rewardSp} SP · ⭐+{q.rewardStars}
                  </span>
                  {claimed ? (
                    <span className="pill pill-green"><Check size={12} /> 已领取</span>
                  ) : done ? (
                    <button
                      className="btn-primary"
                      style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => {
                        sound.playUnlock();
                        onClaimDailyQuest(q.id, q.rewardSp, q.rewardStars);
                        triggerToast(`完成今日任务！获得 +${q.rewardSp} 赛季点数 与 +${q.rewardStars} 侦探星！`);
                      }}
                    >
                      领取奖励！
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>进行中...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 20 级双轨奖励路线 */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Gift size={20} color="#D97706" /> S1 赛季 20 级双轨奖励路线
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {SEASON_TIERS.map((t) => {
            const reached = sp >= t.requiredSp;
            const freeClaimed = claimedFree.has(t.tier);
            const eliteClaimed = claimedElite.has(t.tier);
            const isMilestone = t.tier === 6 || t.tier === 10 || t.tier === 12 || t.tier === 20;

            return (
              <div
                key={t.tier}
                style={{
                  borderRadius: 16,
                  padding: 14,
                  background: isMilestone ? 'linear-gradient(145deg, #2B1D35, #1E1728)' : '#120F18',
                  border: `2px solid ${reached ? '#F59E0B' : '#332940'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`pill ${reached ? 'pill-amber' : 'pill-blue'}`} style={{ fontSize: 13 }}>
                    Lv.{t.tier} {isMilestone ? '🌟 大奖层' : ''}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: reached ? '#34D399' : '#B6A995' }}>
                    {reached ? '✓ 已达成' : `需 ${t.requiredSp} SP`}
                  </span>
                </div>

                {/* 基础轨 */}
                <div
                  style={{
                    background: '#1C1726',
                    borderRadius: 11,
                    padding: '9px 11px',
                    border: '1.5px solid #3B304D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#93C5FD' }}>🌟 基础轨</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#F5EFE4' }}>
                      {t.freeReward.emoji} {t.freeReward.label}
                    </div>
                  </div>
                  {freeClaimed ? (
                    <span className="pill pill-green"><Check size={12} /> 已领</span>
                  ) : reached ? (
                    <button
                      className="btn-mint"
                      style={{ padding: '6px 11px', fontSize: 12 }}
                      onClick={() => {
                        sound.playCaseSolved();
                        onClaimTierReward(t.tier, 'free', t.freeReward);
                        triggerToast(`领取 Lv.${t.tier} 奖励：${t.freeReward.emoji} ${t.freeReward.label}！`);
                      }}
                    >
                      领取
                    </button>
                  ) : (
                    <Lock size={15} color="#786D5F" />
                  )}
                </div>

                {/* 精英轨 */}
                <div
                  style={{
                    background: 'linear-gradient(90deg, rgba(120,53,15,0.42), rgba(154,52,18,0.35))',
                    borderRadius: 11,
                    padding: '9px 11px',
                    border: '1.5px solid #D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#FACC15', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Crown size={11} /> 精英暗金轨
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#FEF3C7' }}>
                      {t.eliteReward.emoji} {t.eliteReward.label}
                    </div>
                  </div>
                  {eliteClaimed ? (
                    <span className="pill pill-green"><Check size={12} /> 已领</span>
                  ) : reached && eliteActive ? (
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 11px', fontSize: 12 }}
                      onClick={() => {
                        sound.playCaseSolved();
                        onClaimTierReward(t.tier, 'elite', t.eliteReward);
                        triggerToast(`领取精英大奖：${t.eliteReward.emoji} ${t.eliteReward.label}！`);
                      }}
                    >
                      <Sparkles size={12} /> 领取
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#FDBA74', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Lock size={13} /> {eliteActive ? '待升级' : '未激活'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)', fontWeight: 600 }}>
        <Star size={14} style={{ verticalAlign: 'middle' }} /> 赛季通行证完全免费！每一份皮肤、盲盒和强力道具都只靠孩子认真学习获得！
      </div>
    </div>
  );
};
