import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Flame, Heart, PenTool, Play, Search, Shield, Sparkles, Swords, Trophy, Volume2 } from 'lucide-react';
import { AdventureChapter, DetectiveCase, EquipmentItem, LearnerProfile, PropItemId } from '../types';
import { ADVENTURE_CHAPTERS, KNOWLEDGE_CARDS } from '../data/rpgData';
import { generateBossQuestions } from '../data/proceduralGenerator';
import { DetectiveAvatar } from './DetectiveAvatar';
import { MathVisualizer } from './MathVisualizer';
import { ConfettiBurst } from './ConfettiBurst';
import { ScratchpadDrawer } from './ScratchpadDrawer';
import { sound, speakEnglish } from '../utils/sound';

interface Props {
  profile: LearnerProfile;
  allCases: DetectiveCase[];
  equippedGear: Partial<Record<EquipmentItem['slot'], string>>;
  onStartCase: (c: DetectiveCase) => void;
  onDefeatBoss: (chapter: AdventureChapter) => void;
  onConsumeProp: (propId: PropItemId) => void;
}

const ATTACK_SKILLS = [
  '⚡ 黄金放大镜激光斩！',
  '⚖️ 智慧天平冲击波！',
  '🔍 线索破盾连环击！',
  '🌟 勇气星辰必杀技！',
];

export const AdventureMapView: React.FC<Props> = ({
  profile,
  allCases,
  equippedGear,
  onStartCase,
  onDefeatBoss,
  onConsumeProp,
}) => {
  const [activeBossChapter, setActiveBossChapter] = useState<AdventureChapter | null>(null);
  const [bossPool, setBossPool] = useState<DetectiveCase[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [bossHp, setBossHp] = useState(4);
  const [shieldBroken, setShieldBroken] = useState(false);
  const [foundTokens, setFoundTokens] = useState<number[]>([]);
  const [battleLog, setBattleLog] = useState('');
  const [bossShake, setBossShake] = useState(false);
  const [triedWrong, setTriedWrong] = useState<number[]>([]);
  const [battleCombo, setBattleCombo] = useState(0);
  const [victory, setVictory] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);

  const defeatedSet = useMemo(() => new Set(profile.defeatedBossIds || []), [profile.defeatedBossIds]);

  const startBossBattle = (chap: AdventureChapter) => {
    sound.playUnlock();
    // 混合该章节精选真题 + 变式题，确保每回合都新鲜刺激
    const matchingCurated = allCases
      .filter((c) => chap.skills.includes(c.skill))
      .sort(() => Math.random() - 0.5)
      .slice(0, chap.bossHp);
    const extraProcedural = generateBossQuestions(chap.skills, chap.bossHp);
    const pool = [...matchingCurated, ...extraProcedural];

    setActiveBossChapter(chap);
    setBossPool(pool);
    setQIdx(0);
    setBossHp(chap.bossHp);
    setShieldBroken(false);
    setFoundTokens([]);
    setBattleLog(`👾 ${chap.bossName} 出现了：“${chap.bossTaunt}”`);
    setTriedWrong([]);
    setBattleCombo(0);
    setVictory(false);
  };

  // ================= Boss 战胜利开宝箱界面 =================
  if (activeBossChapter && victory) {
    const unlockedCard = KNOWLEDGE_CARDS.find((c) => c.id === activeBossChapter.unlockCardId);
    return (
      <div className="fade-in">
        <ConfettiBurst />
        <div className="card card-warm" style={{ textAlign: 'center', padding: '30px 22px' }}>
          <div style={{ marginBottom: 12 }}>
            <span className="stamp-closed">🏆 BOSS DEFEATED · 大胜凯旋</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <DetectiveAvatar mood="celebrating" skinId={profile.equippedSkinId} equippedGear={equippedGear} size={132} />
          </div>
          <h2 style={{ margin: '8px 0 6px', fontSize: 26, fontWeight: 900, color: '#92400E' }}>
            太燃了，{profile.nickname} 击败了「{activeBossChapter.bossName}」！
          </h2>
          <p style={{ margin: '0 auto 18px', maxWidth: 520, color: '#78350F', fontWeight: 700 }}>
            {activeBossChapter.bossEmoji} {activeBossChapter.bossName} 投降说：“{activeBossChapter.bossDefeatLine}”
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: '#FFFFFF',
              border: '2.5px solid #F59E0B',
              borderRadius: 18,
              padding: '14px 24px',
              marginBottom: 18,
            }}
          >
            <span style={{ fontWeight: 900, fontSize: 18, color: '#D97706' }}>
              🎁 宝箱 ⭐ +{activeBossChapter.chestStars}
            </span>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#EA580C' }}>
              🦴 智慧狗粮 +{activeBossChapter.chestTreats}
            </span>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#7C3AED' }}>
              ⚡ 经验 +100 XP
            </span>
          </div>

          {unlockedCard && (
            <div
              style={{
                maxWidth: 480,
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #FEF3C7, #EDE9FE)',
                border: '2.5px solid #8B5CF6',
                borderRadius: 18,
                padding: '14px 18px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: '#6D28D9' }}>
                🃏 解锁稀有口诀卡牌 [{unlockedCard.rarity}]
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                {unlockedCard.emoji} {unlockedCard.title}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3B0764', marginTop: 4 }}>
                {unlockedCard.rule}
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={() => setActiveBossChapter(null)}>
            返回神探大地图 →
          </button>
        </div>
      </div>
    );
  }

  // ================= Boss 战实时战斗界面 =================
  if (activeBossChapter && bossPool.length > 0) {
    const currentCase = bossPool[qIdx % bossPool.length];
    const targetStep = currentCase.steps[currentCase.steps.length - 1];

    const handleTokenClick = (idx: number) => {
      const tok = currentCase.tokens[idx];
      if (tok.isBlank) return;
      if (tok.isClue || tok.isBug) {
        if (!foundTokens.includes(idx)) {
          sound.playClueFound();
          setFoundTokens((prev) => [...prev, idx]);
          setShieldBroken(true);
        }
        setBattleLog(`⚡ 破盾成功！找到关键线索：${tok.clueTip || tok.text}`);
      } else {
        setBattleLog(`再移一下放大镜，找找隐藏在题干里的关键陷阱词就能打破 Boss 护盾！`);
      }
    };

    const handleAttackOption = (optIdx: number) => {
      if (optIdx === targetStep.correctIndex) {
        sound.playStepSuccess();
        const skillName = ATTACK_SKILLS[(qIdx + battleCombo) % ATTACK_SKILLS.length];
        const nextHp = Math.max(0, bossHp - 1);
        setBossHp(nextHp);
        setBattleCombo((c) => c + 1);
        setBossShake(true);
        setTimeout(() => setBossShake(false), 450);

        if (nextHp <= 0) {
          sound.playCaseSolved();
          onDefeatBoss(activeBossChapter);
          setVictory(true);
        } else {
          setBattleLog(
            `${skillName} 命中 ${activeBossChapter.bossName}（剩余 ${nextHp} 格血）！${shieldBroken ? '破盾暴击超帅！' : ''}`
          );
          setQIdx((n) => n + 1);
          setFoundTokens([]);
          setShieldBroken(false);
          setTriedWrong([]);
        }
      } else {
        // 零惩罚勇气护盾！绝不扣血判负
        sound.playGentleOops();
        if (!triedWrong.includes(optIdx)) {
          setTriedWrong((prev) => [...prev, optIdx]);
        }
        setBattleCombo(0);
        setBattleLog(
          `🛡️ 勇气护盾稳稳挡住了陷阱！阿探提示：${targetStep.optionFeedback[optIdx]}`
        );
      }
    };

    const handleThrowBomb = () => {
      if ((profile.inventory?.item_boss_bomb || 0) <= 0 || !activeBossChapter) return;
      sound.playUnlock();
      onConsumeProp('item_boss_bomb');
      const nextHp = Math.max(0, bossHp - 1);
      setBossHp(nextHp);
      setBossShake(true);
      setTimeout(() => setBossShake(false), 450);
      if (nextHp <= 0) {
        sound.playCaseSolved();
        onDefeatBoss(activeBossChapter);
        setVictory(true);
      } else {
        setBattleLog(`💣 轰隆！！Boss 暴击能量弹正中 ${activeBossChapter.bossName}，直接炸掉 1 格血（剩余 ${nextHp} 血）！`);
      }
    };

    const handleBossScanner = () => {
      if ((profile.inventory?.item_scanner || 0) <= 0) return;
      sound.playUnlock();
      onConsumeProp('item_scanner');
      const clues = currentCase.tokens
        .map((t, idx) => (t.isClue || t.isBug ? idx : -1))
        .filter((idx) => idx >= 0);
      setFoundTokens(clues);
      setShieldBroken(true);
      setBattleLog('🔦 透视扫描仪秒破 Boss 护盾！所有隐藏线索已照亮！');
    };

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-soft" onClick={() => setActiveBossChapter(null)}>
            <ArrowLeft size={16} /> 暂离战场
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {battleCombo >= 2 && (
              <span className="pill pill-orange">
                <Flame size={14} /> {battleCombo} 连击！
              </span>
            )}
            <button
              className="btn-soft"
              style={{ padding: '6px 11px', fontSize: 12 }}
              disabled={(profile.inventory?.item_scanner || 0) <= 0 || shieldBroken}
              onClick={handleBossScanner}
            >
              🔦 破盾扫描 ({profile.inventory?.item_scanner || 0})
            </button>
            <button
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: 12 }}
              disabled={(profile.inventory?.item_boss_bomb || 0) <= 0}
              onClick={handleThrowBomb}
            >
              💣 丢暴击弹 ({profile.inventory?.item_boss_bomb || 0})
            </button>
            {currentCase.subject === 'math' && (
              <button className="btn-soft" onClick={() => setScratchOpen(true)}>
                <PenTool size={15} /> 打草稿
              </button>
            )}
          </div>
        </div>

        {/* 战斗舞台：阿探 vs Boss */}
        <div
          className="card"
          style={{
            background: activeBossChapter.bgGradient,
            borderColor: activeBossChapter.themeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DetectiveAvatar mood={battleCombo > 0 ? 'celebrating' : 'curious'} skinId={profile.equippedSkinId} equippedGear={equippedGear} size={86} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{profile.nickname} & 阿探</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                <Shield size={15} /> 勇气护盾：无敌守护中（答错不扣血！）
              </div>
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: '#DC2626' }}>VS</div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transform: bossShake ? 'translateX(8px) scale(0.95)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: '#7F1D1D' }}>
                {activeBossChapter.bossName}
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 5 }}>
                {Array.from({ length: activeBossChapter.bossHp }, (_, i) => (
                  <Heart
                    key={i}
                    size={18}
                    fill={i < bossHp ? '#EF4444' : '#E2E8F0'}
                    color={i < bossHp ? '#B91C1C' : '#94A3B8'}
                  />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: shieldBroken ? '#059669' : '#B45309', marginTop: 3 }}>
                {shieldBroken ? '⚡ 护盾已击破！' : '🛡️ 找线索可破除 Boss 护盾'}
              </div>
            </div>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: '#FFFFFF',
                border: '3px solid #F87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 38,
              }}
            >
              {activeBossChapter.bossEmoji}
            </div>
          </div>
        </div>

        {/* 战况播报条 */}
        {battleLog && (
          <div
            className="fade-in"
            style={{
              background: '#FFFBEB',
              border: '2px solid #FCD34D',
              borderRadius: 14,
              padding: '10px 15px',
              fontSize: 14,
              fontWeight: 800,
              color: '#92400E',
            }}
          >
            {battleLog}
          </div>
        )}

        {/* 当前攻击招式题目 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 900 }}>
              <Swords size={18} style={{ verticalAlign: 'middle', marginRight: 6, color: '#DC2626' }} />
              {currentCase.title}
            </div>
            {currentCase.readAloudText && (
              <button className="btn-soft" onClick={() => speakEnglish(currentCase.readAloudText!)}>
                <Volume2 size={16} /> 朗读
              </button>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#B45309', marginBottom: 6 }}>
              <Search size={14} style={{ verticalAlign: 'middle' }} /> 先点亮题干线索，打破 Boss 护盾！
            </div>
            <div className="clue-board">
              {currentCase.tokens.map((tok, i) => {
                if (tok.isBlank) {
                  return <span key={i} className="clue-token blank-slot">___</span>;
                }
                const found = foundTokens.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleTokenClick(i)}
                    className={`clue-token ${found ? (tok.isBug ? 'bug-found' : 'found') : ''}`}
                  >
                    {tok.text}
                  </button>
                );
              })}
            </div>
          </div>

          {currentCase.visual && <MathVisualizer spec={currentCase.visual} stage={0} />}

          <div style={{ fontSize: 16, fontWeight: 800 }}>
            🎯 发动攻击：{currentCase.steps.length > 1 ? targetStep.prompt.replace(/^第[二三]步（.*?）：|^第[二三]步：/, '') : targetStep.prompt}
          </div>

          <div className="option-grid">
            {targetStep.options.map((opt, idx) => {
              const wrong = triedWrong.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={wrong}
                  onClick={() => handleAttackOption(idx)}
                  className={`option-btn ${wrong ? 'tried-wrong' : ''}`}
                >
                  <span className="option-letter">{['A', 'B', 'C', 'D'][idx]}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ScratchpadDrawer open={scratchOpen} onClose={() => setScratchOpen(false)} />
      </div>
    );
  }

  // ================= 6 大冒险地图主页 =================
  const totalDefeated = defeatedSet.size;
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FEF3C7, #DBEAFE 120%)',
          borderColor: '#F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <DetectiveAvatar mood="happy" skinId={profile.equippedSkinId} equippedGear={equippedGear} size={86} />
          <div>
            <span className="pill pill-orange">🗺️ 神探冒险 RPG · 深圳智慧岛</span>
            <h2 style={{ margin: '6px 0 4px', fontSize: 22, fontWeight: 900 }}>
              6 大主题岛屿 & 守关大 Boss 挑战
            </h2>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#475569' }}>
              每座岛屿对应深圳四年级核心重难点！先热身破案或直接挑战大 Boss，击败即可开启豪华宝箱拿狗粮和 SSR 卡牌！
            </p>
          </div>
        </div>
        <div style={{ background: '#FFFFFF', padding: '10px 18px', borderRadius: 16, border: '2px solid #F59E0B', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E' }}>已击败 Boss</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#DC2626' }}>
            <Trophy size={18} style={{ verticalAlign: 'middle' }} /> {totalDefeated} / {ADVENTURE_CHAPTERS.length}
          </div>
        </div>
      </div>

      {/* 岛屿章节卡片列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {ADVENTURE_CHAPTERS.map((chap) => {
          const chapCases = allCases.filter((c) => chap.skills.includes(c.skill));
          const solvedInChap = chapCases.filter((c) => profile.solvedCaseIds.includes(c.id)).length;
          const nextCase =
            chapCases.find((c) => !profile.solvedCaseIds.includes(c.id)) || chapCases[0];
          const bossDefeated = defeatedSet.has(chap.id);

          return (
            <div
              key={chap.id}
              className="card"
              style={{
                background: chap.bgGradient,
                borderColor: bossDefeated ? '#10B981' : chap.themeColor,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 30 }}>{chap.emoji}</span>
                  {bossDefeated ? (
                    <span className="pill pill-green">
                      <CheckCircle2 size={13} /> 已收复岛屿
                    </span>
                  ) : (
                    <span className="pill pill-amber">
                      破案进度 {solvedInChap}/{chapCases.length}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>{chap.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginTop: 2 }}>
                  {chap.subtitle}
                </div>

                {/* Boss 信息卡 */}
                <div
                  style={{
                    marginTop: 10,
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: 14,
                    padding: '10px 12px',
                    border: '1.5px solid rgba(15,23,42,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{chap.bossEmoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: '#991B1B' }}>
                      守关 Boss：{chap.bossName}（{chap.bossHp} 格血）
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                      宝箱奖励：⭐+{chap.chestStars} · 🦴+{chap.chestTreats} · 稀有卡牌
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {nextCase && (
                  <button
                    className="btn-soft"
                    style={{ flex: 1, padding: '10px 8px', fontSize: 13 }}
                    onClick={() => onStartCase(nextCase)}
                  >
                    <Play size={14} fill="currentColor" /> 先做小案练手
                  </button>
                )}
                <button
                  className={bossDefeated ? 'btn-mint' : 'btn-primary'}
                  style={{ flex: 1, padding: '10px 8px', fontSize: 13 }}
                  onClick={() => startBossBattle(chap)}
                >
                  <Swords size={14} /> {bossDefeated ? '再战 Boss' : '挑战大 Boss!'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)', fontWeight: 600 }}>
        <Sparkles size={14} style={{ verticalAlign: 'middle' }} /> 提示：打 Boss 拥有无敌“勇气护盾”，答错不会失败只会给提示，大胆挑战吧！
      </div>
    </div>
  );
};
