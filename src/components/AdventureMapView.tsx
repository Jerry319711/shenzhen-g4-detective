import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Flame, PenTool, Play, Search, Shield, Sparkles, Swords, Trophy, Volume2 } from 'lucide-react';
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
  '⚡ 圣光放大镜旋风斩！',
  '🔥 逻辑陨石天降打击！',
  '⚔️ 庇护所裁决连环击！',
  '🌟 勇气圣剑终极一击！',
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
  const [bossHp, setBossHp] = useState(400);
  const [bossMaxHp, setBossMaxHp] = useState(400);
  const [shieldBroken, setShieldBroken] = useState(false);
  const [foundTokens, setFoundTokens] = useState<number[]>([]);
  const [battleLog, setBattleLog] = useState('');
  const [bossShake, setBossShake] = useState(false);
  const [dmgPopup, setDmgPopup] = useState('');
  const [triedWrong, setTriedWrong] = useState<number[]>([]);
  const [battleCombo, setBattleCombo] = useState(0);
  const [victory, setVictory] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);

  const defeatedSet = useMemo(() => new Set(profile.defeatedBossIds || []), [profile.defeatedBossIds]);

  const startBossBattle = (chap: AdventureChapter) => {
    sound.playUnlock();
    const matchingCurated = allCases
      .filter((c) => chap.skills.includes(c.skill))
      .sort(() => Math.random() - 0.5)
      .slice(0, chap.bossHp + 2);
    const extraProcedural = generateBossQuestions(chap.skills, chap.bossHp + 2);
    const pool = [...matchingCurated, ...extraProcedural];
    const totalHp = chap.bossHp * 100;

    setActiveBossChapter(chap);
    setBossPool(pool);
    setQIdx(0);
    setBossHp(totalHp);
    setBossMaxHp(totalHp);
    setShieldBroken(false);
    setFoundTokens([]);
    setBattleLog(`🔥 世界 BOSS【${chap.bossName}】降临：“${chap.bossTaunt}”`);
    setTriedWrong([]);
    setBattleCombo(0);
    setVictory(false);
  };

  const triggerBossHit = (dmg: number, crit: boolean) => {
    setBossShake(true);
    setDmgPopup(`${crit ? '⚡暴击 ' : ''}-${dmg} HP!`);
    setTimeout(() => setBossShake(false), 420);
    setTimeout(() => setDmgPopup(''), 950);
  };

  // ================= 世界 BOSS 击杀传奇掉宝 =================
  if (activeBossChapter && victory) {
    const unlockedCard = KNOWLEDGE_CARDS.find((c) => c.id === activeBossChapter.unlockCardId);
    const droppedBoxName = activeBossChapter.order >= 5 ? '🌌 传说神话盲盒 ×1' : activeBossChapter.order >= 3 ? '🥇 黄金皮肤盲盒 ×1' : '🥈 白银装备盲盒 ×1';
    return (
      <div className="fade-in">
        <ConfettiBurst />
        <div className="card card-warm" style={{ textAlign: 'center', padding: '30px 22px' }}>
          <div style={{ marginBottom: 12 }}>
            <span className="stamp-closed">🏆 WORLD BOSS SLAIN · 首领讨伐成功</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <DetectiveAvatar mood="celebrating" skinId={profile.equippedSkinId} equippedGear={equippedGear} size={136} />
          </div>
          <h2 style={{ margin: '8px 0 6px', fontSize: 25, fontWeight: 900, color: '#FDE047' }}>
            {profile.nickname} 讨伐了世界 BOSS「{activeBossChapter.bossName}」！
          </h2>
          <p style={{ margin: '0 auto 16px', maxWidth: 520, color: '#D6C7B2', fontWeight: 600 }}>
            {activeBossChapter.bossEmoji} {activeBossChapter.bossName} 哀嚎倒下：“{activeBossChapter.bossDefeatLine}”
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: '#120F18',
              border: '2px solid #F59E0B',
              borderRadius: 16,
              padding: '14px 22px',
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 900, fontSize: 17, color: '#FDE047' }}>⭐ +{activeBossChapter.chestStars}</span>
            <span style={{ fontWeight: 900, fontSize: 17, color: '#FDBA74' }}>{droppedBoxName}</span>
            <span style={{ fontWeight: 900, fontSize: 17, color: '#C084FC' }}>🏆 +100 SP · +100 XP</span>
          </div>

          {unlockedCard && (
            <div
              style={{
                maxWidth: 480,
                margin: '0 auto 20px',
                background: 'rgba(139, 92, 246, 0.22)',
                border: '2px solid #A855F7',
                borderRadius: 16,
                padding: '12px 16px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: '#D8B4FE' }}>
                🃏 传奇符文掉落 [{unlockedCard.rarity}]
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 3 }}>
                {unlockedCard.emoji} {unlockedCard.title}
              </div>
              <div style={{ fontSize: 13, color: '#F3E8FF', marginTop: 3 }}>{unlockedCard.rule}</div>
            </div>
          )}

          <button className="btn-primary" onClick={() => setActiveBossChapter(null)}>
            返回庇护所地牢大地图 →
          </button>
        </div>
      </div>
    );
  }

  // ================= 世界 BOSS 实时血条战斗 =================
  if (activeBossChapter && bossPool.length > 0) {
    const currentCase = bossPool[qIdx % bossPool.length];
    const targetStep = currentCase.steps[currentCase.steps.length - 1];
    const hpPct = Math.round((bossHp / bossMaxHp) * 100);

    const handleTokenClick = (idx: number) => {
      const tok = currentCase.tokens[idx];
      if (tok.isBlank) return;
      if (tok.isClue || tok.isBug) {
        if (!foundTokens.includes(idx)) {
          sound.playClueFound();
          setFoundTokens((prev) => [...prev, idx]);
          setShieldBroken(true);
        }
        setBattleLog(`⚡ BOSS 护盾粉碎！下击伤害暴击 150 HP！线索：${tok.clueTip || tok.text}`);
      } else {
        setBattleLog('再扫描其他词！找准关键词就能击碎 BOSS 护盾打出 150 暴击伤害！');
      }
    };

    const handleAttackOption = (optIdx: number) => {
      if (optIdx === targetStep.correctIndex) {
        sound.playStepSuccess();
        const skillName = ATTACK_SKILLS[(qIdx + battleCombo) % ATTACK_SKILLS.length];
        const dmg = shieldBroken ? 150 : 100;
        const nextHp = Math.max(0, bossHp - dmg);
        setBossHp(nextHp);
        setBattleCombo((c) => c + 1);
        triggerBossHit(dmg, shieldBroken);

        if (nextHp <= 0) {
          sound.playCaseSolved();
          onDefeatBoss(activeBossChapter);
          setVictory(true);
        } else {
          setBattleLog(`${skillName} 命中 ${activeBossChapter.bossName}，造成 -${dmg} HP 伤害！`);
          setQIdx((n) => n + 1);
          setFoundTokens([]);
          setShieldBroken(false);
          setTriedWrong([]);
        }
      } else {
        sound.playGentleOops();
        if (!triedWrong.includes(optIdx)) setTriedWrong((prev) => [...prev, optIdx]);
        setBattleCombo(0);
        setBattleLog(`🛡️ 圣光护盾挡住了 BOSS 攻击！提示：${targetStep.optionFeedback[optIdx]}`);
      }
    };

    const handleThrowBomb = () => {
      if ((profile.inventory?.item_boss_bomb || 0) <= 0 || !activeBossChapter) return;
      sound.playUnlock();
      onConsumeProp('item_boss_bomb');
      const dmg = 150;
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      triggerBossHit(dmg, true);
      if (nextHp <= 0) {
        sound.playCaseSolved();
        onDefeatBoss(activeBossChapter);
        setVictory(true);
      } else {
        setBattleLog(`💣 轰隆！！烈焰暴击弹直接炸掉 ${activeBossChapter.bossName} 150 HP！`);
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
      setBattleLog('🔦 透视扫描仪秒破 BOSS 护盾！下击必爆 -150 HP！');
    };

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-soft" onClick={() => setActiveBossChapter(null)}>
            <ArrowLeft size={16} /> 暂离副本
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            {battleCombo >= 2 && (
              <span className="pill pill-orange">
                <Flame size={13} /> {battleCombo} 连斩！
              </span>
            )}
            <button
              className="btn-soft"
              style={{ padding: '6px 10px', fontSize: 12 }}
              disabled={(profile.inventory?.item_scanner || 0) <= 0 || shieldBroken}
              onClick={handleBossScanner}
            >
              🔦 破盾扫描 ({profile.inventory?.item_scanner || 0})
            </button>
            <button
              className="btn-primary"
              style={{ padding: '6px 11px', fontSize: 12 }}
              disabled={(profile.inventory?.item_boss_bomb || 0) <= 0}
              onClick={handleThrowBomb}
            >
              💣 暴击弹 -150HP ({profile.inventory?.item_boss_bomb || 0})
            </button>
            {currentCase.subject === 'math' && (
              <button className="btn-soft" onClick={() => setScratchOpen(true)}>
                <PenTool size={15} /> 草稿纸
              </button>
            )}
          </div>
        </div>

        {/* 世界 BOSS 暗黑战斗舞台 */}
        <div className="combat-arena" style={{ borderColor: '#DC2626' }}>
          {dmgPopup && <div className="dmg-popup">{dmgPopup}</div>}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DetectiveAvatar mood={battleCombo > 0 ? 'celebrating' : 'curious'} skinId={profile.equippedSkinId} equippedGear={equippedGear} size={88} />
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#FDE68A' }}>{profile.nickname} · 圣骑士</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#6EE7B7', marginTop: 4 }}>
                  <Shield size={14} /> 圣光护盾：无敌免伤
                </div>
              </div>
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: '#EF4444' }}>⚔️ VS</div>

            <div
              className={bossShake ? 'monster-hit' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 230, justifyContent: 'flex-end' }}
            >
              <div style={{ flex: 1, maxWidth: 310 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 900, fontSize: 16, color: '#FCA5A5' }}>
                    {activeBossChapter.bossName}
                  </span>
                  <span className="pill pill-orange" style={{ fontSize: 11 }}>世界 BOSS</span>
                </div>
                <div className="hp-bar-shell">
                  <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11.5,
                      fontWeight: 900,
                      color: '#FFFFFF',
                      textShadow: '0 1px 3px #000',
                    }}
                  >
                    BOSS HP {bossHp} / {bossMaxHp}
                  </div>
                </div>
                <div className="shield-bar-shell">
                  <div className="shield-bar-fill" style={{ width: shieldBroken ? '0%' : '100%' }} />
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: shieldBroken ? '#FDE047' : '#7DD3FC', marginTop: 3, textAlign: 'right' }}>
                  {shieldBroken ? '⚡ 护盾已破！答对打出 150 暴击伤害！' : '🛡️ 找线索可破盾（伤害 100→150 暴击）'}
                </div>
              </div>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 18,
                  background: 'linear-gradient(145deg, #450A0A, #1C0505)',
                  border: '2.5px solid #EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 38,
                  boxShadow: '0 0 22px rgba(239, 68, 68, 0.5)',
                  flexShrink: 0,
                }}
              >
                {activeBossChapter.bossEmoji}
              </div>
            </div>
          </div>
        </div>

        {battleLog && (
          <div className="fade-in" style={{ background: 'rgba(217, 119, 6, 0.2)', border: '1.5px solid #F59E0B', borderRadius: 12, padding: '9px 14px', fontSize: 13.5, fontWeight: 800, color: '#FEF3C7' }}>
            {battleLog}
          </div>
        )}

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#FDE68A' }}>
              <Swords size={18} style={{ verticalAlign: 'middle', marginRight: 6, color: '#F97316' }} />
              {currentCase.title}
            </div>
            {currentCase.readAloudText && (
              <button className="btn-soft" onClick={() => speakEnglish(currentCase.readAloudText!)}>
                <Volume2 size={16} /> 朗读
              </button>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FBBF24', marginBottom: 6 }}>
              <Search size={14} style={{ verticalAlign: 'middle' }} /> 扫描题干弱点击破 BOSS 护盾（暴击 -150 HP）：
            </div>
            <div className="clue-board">
              {currentCase.tokens.map((tok, i) => {
                if (tok.isBlank) return <span key={i} className="clue-token blank-slot">___</span>;
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

          {currentCase.visual && (
            <div className="math-visual-light">
              <MathVisualizer spec={currentCase.visual} stage={0} />
            </div>
          )}

          <div style={{ fontSize: 16, fontWeight: 800, color: '#FDE68A' }}>
            🎯 选择技能攻击：{currentCase.steps.length > 1 ? targetStep.prompt.replace(/^第[二三]步（.*?）：|^第[二三]步：/, '') : targetStep.prompt}
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

  // ================= 6 大庇护所暗黑地下城地图主页 =================
  const totalDefeated = defeatedSet.size;
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        className="card card-warm"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <DetectiveAvatar mood="happy" skinId={profile.equippedSkinId} equippedGear={equippedGear} size={90} />
          <div>
            <span className="pill pill-orange">🗺️ 暗黑智慧纪元 IV · 6 大地下城地牢</span>
            <h2 style={{ margin: '6px 0 4px', fontSize: 22, fontWeight: 900, color: '#FDE68A' }}>
              庇护所地下城与世界 BOSS 讨伐战
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-muted)' }}>
              每道题目都是带血条的小怪与精英，讨伐世界 BOSS 必掉传奇盲盒、稀有符文卡与海量赛季点数！
            </p>
          </div>
        </div>
        <div style={{ background: '#120F18', padding: '10px 18px', borderRadius: 14, border: '2px solid #D97706', textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#B6A995' }}>世界 BOSS 讨伐</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#FDE047' }}>
            <Trophy size={18} style={{ verticalAlign: 'middle' }} /> {totalDefeated} / {ADVENTURE_CHAPTERS.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {ADVENTURE_CHAPTERS.map((chap) => {
          const chapCases = allCases.filter((c) => chap.skills.includes(c.skill));
          const solvedInChap = chapCases.filter((c) => profile.solvedCaseIds.includes(c.id)).length;
          const nextCase = chapCases.find((c) => !profile.solvedCaseIds.includes(c.id)) || chapCases[0];
          const bossDefeated = defeatedSet.has(chap.id);
          const boxDrop = chap.order >= 5 ? '🌌 神话盲盒' : chap.order >= 3 ? '🥇 黄金盲盒' : '🥈 白银盲盒';

          return (
            <div
              key={chap.id}
              className="card"
              style={{
                borderColor: bossDefeated ? '#10B981' : '#78350F',
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
                    <span className="pill pill-green"><CheckCircle2 size={13} /> 地牢已净化</span>
                  ) : (
                    <span className="pill pill-amber">清怪进度 {solvedInChap}/{chapCases.length}</span>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#FDE68A' }}>{chap.name}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginTop: 2 }}>
                  {chap.subtitle}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    background: '#110D16',
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1.5px solid #4A2525',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{chap.bossEmoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: '#FCA5A5' }}>
                      世界 BOSS：{chap.bossName}（{chap.bossHp * 100} HP）
                    </div>
                    <div style={{ fontSize: 12, color: '#FDE047', fontWeight: 700, marginTop: 2 }}>
                      必掉：{boxDrop} · ⭐+{chap.chestStars} · 符文卡
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
                    <Play size={14} fill="currentColor" /> 刷地牢小怪
                  </button>
                )}
                <button
                  className={bossDefeated ? 'btn-mint' : 'btn-primary'}
                  style={{ flex: 1, padding: '10px 8px', fontSize: 13 }}
                  onClick={() => startBossBattle(chap)}
                >
                  <Swords size={14} /> {bossDefeated ? '再战 BOSS' : '讨伐 BOSS!'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)', fontWeight: 600 }}>
        <Sparkles size={14} style={{ verticalAlign: 'middle' }} /> 讨伐世界 BOSS 拥有圣光免伤护盾，答错绝不阵亡，勇敢发起挑战吧！
      </div>
    </div>
  );
};
