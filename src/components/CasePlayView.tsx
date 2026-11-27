import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  HelpCircle,
  Lightbulb,
  PenTool,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Swords,
  Volume2,
} from 'lucide-react';
import { DetectiveCase, EquipmentItem, PropItemId, SkinId } from '../types';
import { DetectiveAvatar, AvatarMood } from './DetectiveAvatar';
import { MathVisualizer } from './MathVisualizer';
import { ConfettiBurst } from './ConfettiBurst';
import { ScratchpadDrawer } from './ScratchpadDrawer';
import { CELEBRATION_QUOTES, COURAGE_QUOTES } from '../data/rewards';
import { KNOWLEDGE_CARDS } from '../data/rpgData';
import { sound, speakEnglish } from '../utils/sound';

interface Props {
  detectiveCase: DetectiveCase;
  nickname: string;
  equippedGear: Partial<Record<EquipmentItem['slot'], string>>;
  skinId: SkinId;
  inventory: Partial<Record<PropItemId, number>>;
  onConsumeProp: (propId: PropItemId) => void;
  onBack: () => void;
  onComplete: (stats: {
    wrongAttempts: number;
    hintsUsed: number;
    cluesFoundBeforeAnswer: boolean;
    durationSec: number;
    bonusStars: number;
    doubleStarsActive?: boolean;
    luckyCloverActive?: boolean;
  }) => {
    earnedStars: number;
    earnedXp?: number;
    earnedSp?: number;
    newCombo?: number;
    unlockedCardId?: string;
    droppedLootText?: string;
  };
  onNextCase?: () => void;
}

const MONSTER_TIERS = {
  1: { label: '普通小怪', emoji: '💀', color: '#93C5FD', maxHp: 100, border: '#3B82F6' },
  2: { label: '精英怪 · 稀有', emoji: '👹', color: '#FDE047', maxHp: 200, border: '#F59E0B' },
  3: { label: '暗金首领 BOSS', emoji: '🐉', color: '#FB923C', maxHp: 300, border: '#EA580C' },
} as const;

export const CasePlayView: React.FC<Props> = ({
  detectiveCase,
  nickname,
  equippedGear,
  skinId,
  inventory,
  onConsumeProp,
  onBack,
  onComplete,
  onNextCase,
}) => {
  const startTimeRef = useRef(Date.now());
  const tierInfo = MONSTER_TIERS[detectiveCase.difficulty];
  const maxHp = tierInfo.maxHp;

  const [stepIdx, setStepIdx] = useState(0);
  const [monsterHp, setMonsterHp] = useState<number>(maxHp);
  const [monsterHitAnim, setMonsterHitAnim] = useState(false);
  const [dmgPopup, setDmgPopup] = useState('');

  const [foundTokenIndices, setFoundTokenIndices] = useState<number[]>([]);
  const [shakenToken, setShakenToken] = useState<number | null>(null);
  const [activeClueTip, setActiveClueTip] = useState<string>('');
  const [triedWrongIndices, setTriedWrongIndices] = useState<number[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [stepSolved, setStepSolved] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [feedbackTone, setFeedbackTone] = useState<'neutral' | 'warm' | 'success'>('neutral');
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [totalWrongAttempts, setTotalWrongAttempts] = useState(0);
  const [cluesFoundBeforeFirstAnswer, setCluesFoundBeforeFirstAnswer] = useState<boolean | null>(null);
  const [caseFinished, setCaseFinished] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedSp, setEarnedSp] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [unlockedCardId, setUnlockedCardId] = useState<string | undefined>(undefined);
  const [droppedLootText, setDroppedLootText] = useState<string | undefined>(undefined);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [doubleStarsActive, setDoubleStarsActive] = useState(false);
  const [luckyCloverActive, setLuckyCloverActive] = useState(false);
  const [propToast, setPropToast] = useState('');
  const [chosenAnswers, setChosenAnswers] = useState<string[]>([]);

  const isSpotBug = detectiveCase.mode === 'eng_spot_bug';

  const targetClueIndices = useMemo(() => {
    return detectiveCase.tokens
      .map((t, i) => ((isSpotBug ? t.isBug : t.isClue) ? i : -1))
      .filter((i) => i >= 0);
  }, [detectiveCase.tokens, isSpotBug]);

  const foundTargetCount = targetClueIndices.filter((i) => foundTokenIndices.includes(i)).length;
  const allTargetsFound = targetClueIndices.length > 0 && foundTargetCount === targetClueIndices.length;
  const shieldPct = targetClueIndices.length === 0 ? 0 : Math.round(((targetClueIndices.length - foundTargetCount) / targetClueIndices.length) * 100);

  const currentStep = detectiveCase.steps[stepIdx];

  const avatarMood: AvatarMood = caseFinished
    ? 'celebrating'
    : stepSolved
    ? 'celebrating'
    : feedbackTone === 'warm'
    ? 'encouraging'
    : hintLevel > 0
    ? 'thinking'
    : 'curious';

  const triggerHitEffect = (dmg: number, isCrit: boolean) => {
    setMonsterHitAnim(true);
    setDmgPopup(`${isCrit ? '⚡暴击 ' : ''}-${dmg} HP!`);
    setTimeout(() => setMonsterHitAnim(false), 400);
    setTimeout(() => setDmgPopup(''), 950);
  };

  const handleTokenClick = (index: number) => {
    const token = detectiveCase.tokens[index];
    if (token.isBlank) return;

    if (token.isClue || token.isBug) {
      if (!foundTokenIndices.includes(index)) {
        sound.playClueFound();
        setFoundTokenIndices((prev) => [...prev, index]);
      }
      if (token.clueTip) {
        setActiveClueTip(token.clueTip);
      }
    } else {
      setShakenToken(index);
      setTimeout(() => setShakenToken(null), 380);
      setActiveClueTip(
        isSpotBug
          ? `“${token.text}”没有异常，再扫描其他词寻找怪物的语法破绽！`
          : `“${token.text}”是普通掩体，击中【人称/时间/数字/陷阱词】即可击碎怪物护盾！`
      );
    }
  };

  const handleRevealHint = () => {
    if (hintLevel >= 3) return;
    sound.playHint();
    setHintLevel((h) => h + 1);
    setTotalHintsUsed((n) => n + 1);
    if (hintLevel === 0 && !allTargetsFound) {
      const missing = targetClueIndices.find((i) => !foundTokenIndices.includes(i));
      if (missing !== undefined) {
        setFoundTokenIndices((prev) => [...prev, missing]);
        const tip = detectiveCase.tokens[missing].clueTip;
        if (tip) setActiveClueTip(`阿探施放侦测术破盾：${tip}`);
      }
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (stepSolved) return;

    if (cluesFoundBeforeFirstAnswer === null) {
      setCluesFoundBeforeFirstAnswer(allTargetsFound || foundTargetCount > 0);
    }

    const fb = currentStep.optionFeedback[optIndex];

    if (optIndex === currentStep.correctIndex) {
      sound.playStepSuccess();
      const totalSteps = detectiveCase.steps.length;
      const isLast = stepIdx === totalSteps - 1;
      const stepDmg = isLast ? monsterHp : Math.round(maxHp / totalSteps);
      const nextHp = Math.max(0, monsterHp - stepDmg);
      setMonsterHp(nextHp);
      triggerHitEffect(stepDmg, allTargetsFound);

      setStepSolved(true);
      setFeedbackTone('success');
      setFeedbackMsg(fb);
      setChosenAnswers((prev) => {
        const next = [...prev];
        next[stepIdx] = currentStep.options[optIndex];
        return next;
      });
    } else {
      sound.playGentleOops();
      setTotalWrongAttempts((n) => n + 1);
      if (!triedWrongIndices.includes(optIndex)) {
        setTriedWrongIndices((prev) => [...prev, optIndex]);
      }
      setFeedbackTone('warm');
      setFeedbackMsg(`🛡️ 圣光护盾挡住了怪物的反击！${fb}`);
    }
  };

  const handleContinue = () => {
    if (stepIdx < detectiveCase.steps.length - 1) {
      setStepIdx((i) => i + 1);
      setStepSolved(false);
      setTriedWrongIndices([]);
      setEliminatedOptions([]);
      setFeedbackMsg('');
      setFeedbackTone('neutral');
      setHintLevel(0);
    } else {
      sound.playCaseSolved();
      const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const bonusStars = allTargetsFound ? 5 : foundTargetCount > 0 ? 2 : 0;
      const res = onComplete({
        wrongAttempts: totalWrongAttempts,
        hintsUsed: totalHintsUsed,
        cluesFoundBeforeAnswer: Boolean(cluesFoundBeforeFirstAnswer),
        durationSec,
        bonusStars,
        doubleStarsActive,
        luckyCloverActive,
      });
      setEarnedStars(res.earnedStars);
      setEarnedXp(res.earnedXp || 20);
      setEarnedSp(res.earnedSp || 20);
      setComboCount(res.newCombo || 0);
      setUnlockedCardId(res.unlockedCardId);
      setDroppedLootText(res.droppedLootText);
      setCaseFinished(true);
    }
  };

  const handleUseScanner = () => {
    if ((inventory.item_scanner || 0) <= 0 || allTargetsFound) return;
    sound.playUnlock();
    onConsumeProp('item_scanner');
    setFoundTokenIndices(targetClueIndices);
    const tips = targetClueIndices
      .map((i) => detectiveCase.tokens[i].clueTip)
      .filter(Boolean)
      .join(' ｜ ');
    setActiveClueTip(`🔦 透视扫描仪秒破怪物全部护盾！${tips}`);
    setPropToast('🔦 护盾粉碎！下一次攻击将造成全额暴击！');
    setTimeout(() => setPropToast(''), 2800);
  };

  const handleUseFifty = () => {
    if ((inventory.item_fifty || 0) <= 0 || stepSolved || needsBugFindFirst) return;
    const wrongPool = currentStep.options
      .map((_, i) => i)
      .filter((i) => i !== currentStep.correctIndex && !eliminatedOptions.includes(i) && !triedWrongIndices.includes(i));
    if (wrongPool.length === 0) return;
    sound.playUnlock();
    onConsumeProp('item_fifty');
    const toCut = wrongPool.slice(0, Math.min(2, wrongPool.length - (wrongPool.length > 2 ? 1 : 0)));
    setEliminatedOptions((prev) => [...prev, ...toCut]);
    setPropToast(`✂️ 破魔剪刀斩断了 ${toCut.length} 个虚假幻象选项！`);
    setTimeout(() => setPropToast(''), 2800);
  };

  const handleUseDoubleStar = () => {
    if ((inventory.item_double_star || 0) <= 0 || doubleStarsActive) return;
    sound.playUnlock();
    onConsumeProp('item_double_star');
    setDoubleStarsActive(true);
    setPropToast('🧪 贪婪双倍药水生效：斩杀怪物掉落星星直接 ×2！');
    setTimeout(() => setPropToast(''), 2800);
  };

  const handleUseClover = () => {
    if ((inventory.item_lucky_clover || 0) <= 0 || luckyCloverActive) return;
    sound.playUnlock();
    onConsumeProp('item_lucky_clover');
    setLuckyCloverActive(true);
    setPropToast('🍀 圣光守护草激活：本战失误一次不断连击！');
    setTimeout(() => setPropToast(''), 2800);
  };

  const visualStage = stepSolved ? currentStep.visualStage ?? stepIdx + 1 : stepIdx;
  const needsBugFindFirst = isSpotBug && !allTargetsFound;
  const courageBoost =
    triedWrongIndices.length >= 2 && !stepSolved
      ? COURAGE_QUOTES[(detectiveCase.id.length + triedWrongIndices.length) % COURAGE_QUOTES.length]
      : '';

  // ================= 击杀掉宝结算（暗黑4 传奇光柱！） =================
  if (caseFinished) {
    const celebQuote = CELEBRATION_QUOTES[detectiveCase.id.length % CELEBRATION_QUOTES.length];
    return (
      <div className="fade-in">
        <ConfettiBurst />
        <div className="card card-warm" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ marginBottom: 12 }}>
            <span className="stamp-closed">⚔️ MONSTER SLAIN · 斩杀掉宝</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <DetectiveAvatar mood="celebrating" skinId={skinId} equippedGear={equippedGear} size={136} />
          </div>

          <h2 style={{ margin: '8px 0 6px', fontSize: 25, fontWeight: 900, color: '#FDE047' }}>
            {nickname} 斩杀了 {tierInfo.emoji}「{detectiveCase.suspectName}」！
          </h2>
          <p style={{ margin: '0 auto 16px', maxWidth: 500, color: '#D6C7B2', fontWeight: 600 }}>
            {celebQuote}
          </p>

          {/* 暗黑战利品掉落区 */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: '#120F18',
              padding: '12px 22px',
              borderRadius: 16,
              border: '2px solid #D97706',
              marginBottom: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 19, color: '#FDE047' }}>
              ⭐ +{earnedStars} 战利品星 {doubleStarsActive ? '(×2!)' : ''}
            </div>
            <span className="pill pill-purple">⚡ +{earnedXp} XP</span>
            <span className="pill pill-blue">🏆 +{earnedSp} 赛季点</span>
            {comboCount >= 2 && (
              <span className="pill pill-orange">
                <Flame size={13} /> {comboCount} 连杀！
              </span>
            )}
          </div>

          {droppedLootText && (
            <div
              className="fade-in"
              style={{
                maxWidth: 520,
                margin: '0 auto 14px',
                background: 'linear-gradient(90deg, rgba(234,88,12,0.32), rgba(217,119,6,0.28))',
                border: '2px solid #F97316',
                borderRadius: 14,
                padding: '10px 16px',
                fontWeight: 900,
                fontSize: 15,
                color: '#FEF08A',
                boxShadow: '0 0 22px rgba(249, 115, 22, 0.35)',
              }}
            >
              ✨ 传奇光柱掉落！{droppedLootText}
            </div>
          )}

          {unlockedCardId && (() => {
            const card = KNOWLEDGE_CARDS.find((c) => c.id === unlockedCardId);
            if (!card) return null;
            return (
              <div
                style={{
                  maxWidth: 520,
                  margin: '0 auto 14px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '2px solid #A855F7',
                  borderRadius: 14,
                  padding: '10px 16px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 900, color: '#D8B4FE' }}>
                  🃏 掉落新技能符文卡 [{card.rarity}]！已收录图鉴
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2, color: '#FFFFFF' }}>
                  {card.emoji} {card.title}
                </div>
              </div>
            );
          })()}

          <div
            style={{
              background: '#120F18',
              border: '2px solid #10B981',
              borderRadius: 16,
              padding: '14px 18px',
              textAlign: 'left',
              maxWidth: 620,
              margin: '0 auto 20px',
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#6EE7B7', marginBottom: 4 }}>
              📜 缴获智慧符文（{detectiveCase.textbookRef}）
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: '#F5EFE4' }}>
              {detectiveCase.goldenRule}
            </div>
            {detectiveCase.readAloudText && (
              <button
                className="btn-soft"
                style={{ marginTop: 10 }}
                onClick={() => speakEnglish(detectiveCase.readAloudText!)}
              >
                <Volume2 size={15} /> 听英文标准读音
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-soft" onClick={onBack}>
              返回庇护所
            </button>
            {onNextCase && (
              <button className="btn-primary" onClick={onNextCase}>
                继续猎杀下一只怪 →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hpPct = Math.round((monsterHp / maxHp) * 100);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 顶栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-soft" onClick={onBack}>
          <ArrowLeft size={16} /> 撤回庇护所
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span className={`pill ${detectiveCase.subject === 'english' ? 'pill-blue' : 'pill-green'}`}>
            {detectiveCase.subject === 'english' ? '🇬🇧 英语魔窟' : '🧮 数学地牢'}
          </span>
          <span className="pill pill-amber">{detectiveCase.textbookRef}</span>
        </div>
      </div>

      {/* ================= 暗黑4 实时怪物战斗舞台（每题都有血条 + 护盾条！） ================= */}
      <div className="combat-arena" style={{ borderColor: tierInfo.border }}>
        {dmgPopup && <div className="dmg-popup">{dmgPopup}</div>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          {/* 左侧：英雄阿探 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DetectiveAvatar mood={avatarMood} skinId={skinId} equippedGear={equippedGear} size={86} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#FDE68A' }}>
                {nickname} · 人类圣骑士
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6EE7B7', fontWeight: 700, marginTop: 3 }}>
                <Shield size={14} /> 圣光护盾：无敌守护（答错免伤）
              </div>
              {detectiveCase.steps.length > 1 && (
                <div style={{ fontSize: 12, color: '#93C5FD', fontWeight: 700, marginTop: 2 }}>
                  ⚔️ 多段连招：第 {stepIdx + 1} / {detectiveCase.steps.length} 击
                </div>
              )}
            </div>
          </div>

          <div style={{ fontWeight: 900, fontSize: 18, color: '#EF4444' }}>⚔️ VS</div>

          {/* 右侧：当前题目的小怪 / 精英 / 首领 + 血条 */}
          <div
            className={monsterHitAnim ? 'monster-hit' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220, justifyContent: 'flex-end' }}
          >
            <div style={{ flex: 1, maxWidth: 290 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 900, fontSize: 15, color: tierInfo.color }}>
                  {detectiveCase.suspectName}
                </span>
                <span className="pill pill-orange" style={{ fontSize: 11, padding: '2px 8px' }}>
                  {tierInfo.label}
                </span>
              </div>

              {/* 怪物红色血条 */}
              <div className="hp-bar-shell">
                <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px #000',
                  }}
                >
                  HP {monsterHp} / {maxHp}
                </div>
              </div>

              {/* 蓝色护盾条（圈出线索即破盾！） */}
              <div className="shield-bar-shell">
                <div className="shield-bar-fill" style={{ width: `${shieldPct}%` }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: allTargetsFound ? '#FDE047' : '#7DD3FC', marginTop: 3, textAlign: 'right' }}>
                {allTargetsFound
                  ? '⚡ 护盾已粉碎！下击必触发暴击 (+3⭐)！'
                  : `🛡️ 护盾 ${shieldPct}% · 找线索 ${foundTargetCount}/${targetClueIndices.length} 可破盾`}
              </div>
            </div>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(145deg, #2B1319, #150A0E)',
                border: `2.5px solid ${tierInfo.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                boxShadow: `0 0 18px ${tierInfo.border}55`,
                flexShrink: 0,
              }}
            >
              {tierInfo.emoji}
            </div>
          </div>
        </div>
      </div>

      {/* 题目与技能攻击面板 */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#FDE68A' }}>{detectiveCase.title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-muted)' }}>{detectiveCase.storyIntro}</p>
          </div>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            {detectiveCase.readAloudText && (
              <button className="btn-soft" onClick={() => speakEnglish(detectiveCase.readAloudText!)}>
                <Volume2 size={16} /> 朗读
              </button>
            )}
            {detectiveCase.subject === 'math' && (
              <button className="btn-soft" onClick={() => setScratchOpen(true)}>
                <PenTool size={15} /> 打草稿
              </button>
            )}
          </div>
        </div>

        {/* 破盾线索区 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, flexWrap: 'wrap', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13.5, color: '#FBBF24' }}>
              <Search size={16} />
              <span>破盾操作：{detectiveCase.clueGoalText}</span>
            </div>
            <span className={`pill ${allTargetsFound ? 'pill-green' : 'pill-amber'}`}>
              {allTargetsFound ? '⚡ 护盾击破！' : `破盾进度 ${foundTargetCount}/${targetClueIndices.length}`}
            </span>
          </div>

          <div className="clue-board">
            {detectiveCase.tokens.map((tok, idx) => {
              const isFound = foundTokenIndices.includes(idx);
              if (tok.isBlank) {
                const filledWord = chosenAnswers[0];
                return (
                  <span key={idx} className={`clue-token ${filledWord ? 'blank-filled' : 'blank-slot'}`}>
                    {filledWord || '___'}
                  </span>
                );
              }
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTokenClick(idx)}
                  className={[
                    'clue-token',
                    isFound && tok.isBug ? 'bug-found' : isFound ? 'found' : '',
                    shakenToken === idx ? 'shake' : '',
                  ].join(' ')}
                >
                  {tok.text}
                </button>
              );
            })}
          </div>

          {activeClueTip && (
            <div
              className="fade-in"
              style={{
                marginTop: 9,
                background: 'rgba(217, 119, 6, 0.2)',
                border: '1.5px solid #F59E0B',
                borderRadius: 12,
                padding: '9px 13px',
                fontSize: 13.5,
                fontWeight: 700,
                color: '#FEF3C7',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Sparkles size={17} style={{ flexShrink: 0, marginTop: 2, color: '#FACC15' }} />
              <span>{activeClueTip}</span>
            </div>
          )}
        </div>

        {/* 数学可视化图解（保持清晰高亮底方便看清每个数字） */}
        {detectiveCase.visual && (
          <div className="math-visual-light">
            <MathVisualizer spec={detectiveCase.visual} stage={visualStage} />
          </div>
        )}

        {/* 攻击招式选择区 */}
        {needsBugFindFirst ? (
          <div
            style={{
              background: 'rgba(234, 88, 12, 0.16)',
              border: '2px dashed #FB923C',
              borderRadius: 14,
              padding: '15px 16px',
              textAlign: 'center',
              fontWeight: 800,
              color: '#FED7AA',
            }}
          >
            ⚔️ 先在上方句子中点出那个【隐藏语法破绽词】击碎怪物护盾，即可发动致命一击！
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: '#FDE68A', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Swords size={18} color="#F97316" /> {currentStep.prompt}
            </div>

            <div className="option-grid">
              {currentStep.options.map((opt, idx) => {
                const isEliminated = eliminatedOptions.includes(idx);
                const isCorrectChosen = stepSolved && idx === currentStep.correctIndex;
                const isWrongTried = triedWrongIndices.includes(idx);
                const letter = ['A', 'B', 'C', 'D'][idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={stepSolved || isEliminated}
                    onClick={() => handleSelectOption(idx)}
                    style={isEliminated ? { opacity: 0.3, textDecoration: 'line-through' } : undefined}
                    className={[
                      'option-btn',
                      isCorrectChosen ? 'correct' : '',
                      isWrongTried ? 'tried-wrong' : '',
                    ].join(' ')}
                  >
                    <span className="option-letter">{isCorrectChosen ? '⚔️' : isEliminated ? '✂️' : letter}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 暗黑道具技能快捷腰带 */}
        {!stepSolved && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              flexWrap: 'wrap',
              background: '#120F18',
              border: '1.5px solid #3D3124',
              borderRadius: 12,
              padding: '8px 11px',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 900, color: '#B6A995' }}>🎒 快捷道具：</span>
            <button
              type="button"
              className="btn-soft"
              style={{ padding: '5px 9px', fontSize: 12 }}
              disabled={(inventory.item_scanner || 0) <= 0 || allTargetsFound}
              onClick={handleUseScanner}
            >
              🔦 破盾扫描 ({inventory.item_scanner || 0})
            </button>
            <button
              type="button"
              className="btn-soft"
              style={{ padding: '5px 9px', fontSize: 12 }}
              disabled={(inventory.item_fifty || 0) <= 0 || needsBugFindFirst}
              onClick={handleUseFifty}
            >
              ✂️ 破魔剪刀 ({inventory.item_fifty || 0})
            </button>
            <button
              type="button"
              className="btn-soft"
              style={{ padding: '5px 9px', fontSize: 12, borderColor: doubleStarsActive ? '#FACC15' : undefined }}
              disabled={(inventory.item_double_star || 0) <= 0 || doubleStarsActive}
              onClick={handleUseDoubleStar}
            >
              🧪 {doubleStarsActive ? '双倍生效!' : `双倍药水 (${inventory.item_double_star || 0})`}
            </button>
            <button
              type="button"
              className="btn-soft"
              style={{ padding: '5px 9px', fontSize: 12, borderColor: luckyCloverActive ? '#34D399' : undefined }}
              disabled={(inventory.item_lucky_clover || 0) <= 0 || luckyCloverActive}
              onClick={handleUseClover}
            >
              🍀 {luckyCloverActive ? '护连杀中!' : `守护草 (${inventory.item_lucky_clover || 0})`}
            </button>
          </div>
        )}

        {propToast && (
          <div className="fade-in" style={{ background: 'rgba(139, 92, 246, 0.25)', border: '1.5px solid #A855F7', borderRadius: 12, padding: '8px 12px', fontSize: 13, fontWeight: 800, color: '#E9D5FF' }}>
            {propToast}
          </div>
        )}

        {/* 阿探战报反馈 */}
        {(feedbackMsg || courageBoost) && (
          <div
            className="fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              background: feedbackTone === 'success' ? 'rgba(6, 78, 59, 0.45)' : 'rgba(124, 45, 18, 0.35)',
              border: `1.5px solid ${feedbackTone === 'success' ? '#34D399' : '#FB923C'}`,
              borderRadius: 15,
              padding: '12px 14px',
            }}
          >
            <DetectiveAvatar mood={avatarMood} skinId={skinId} equippedGear={equippedGear} size={72} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: feedbackTone === 'success' ? '#A7F3D0' : '#FED7AA' }}>
                {feedbackMsg}
              </div>
              {courageBoost && (
                <div style={{ marginTop: 5, fontSize: 13, fontWeight: 700, color: '#FDE047' }}>
                  ✨ 圣光助威：{courageBoost}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 底部操作条 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid #332940' }}>
          {!stepSolved ? (
            <button type="button" className="btn-soft" onClick={handleRevealHint} disabled={hintLevel >= 3}>
              <HelpCircle size={16} />
              {hintLevel === 0 ? '召唤圣光锦囊（免费不扣星）' : hintLevel < 3 ? `再看一层秘术（${hintLevel}/3）` : '3 层秘术已全开'}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34D399', fontWeight: 800 }}>
              <CheckCircle2 size={18} /> 命中弱点！怪物重伤！
            </div>
          )}

          {stepSolved && (
            <button type="button" className="btn-primary" onClick={handleContinue}>
              {stepIdx < detectiveCase.steps.length - 1 ? '⚔️ 发动下一段连招 →' : '💎 终结怪物拾取战利品！'}
            </button>
          )}
        </div>

        {hintLevel > 0 && !stepSolved && (
          <div className="fade-in" style={{ background: 'rgba(88, 28, 135, 0.25)', border: '1.5px solid #A855F7', borderRadius: 14, padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13, color: '#D8B4FE' }}>
              <Lightbulb size={15} /> 圣光智慧锦囊（免费不扣星）
            </div>
            {currentStep.hints.slice(0, hintLevel).map((h, i) => (
              <div key={i} style={{ fontSize: 13.5, fontWeight: 600, color: '#F3E8FF' }}>
                <strong>秘术 {i + 1}：</strong> {h}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-muted)' }}>
        <ShieldCheck size={14} color="#34D399" />
        <span>庇护所圣光守护：答错触发护盾格挡绝不阵亡，弄懂斩杀就是胜利！</span>
      </div>

      <ScratchpadDrawer open={scratchOpen} onClose={() => setScratchOpen(false)} />
    </div>
  );
};
