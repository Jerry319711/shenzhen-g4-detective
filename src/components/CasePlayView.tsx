import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, HelpCircle, Lightbulb, Search, Sparkles, Volume2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DetectiveCase, EquipmentItem } from '../types';
import { DetectiveAvatar, AvatarMood } from './DetectiveAvatar';
import { MathVisualizer } from './MathVisualizer';
import { ConfettiBurst } from './ConfettiBurst';
import { CELEBRATION_QUOTES, COURAGE_QUOTES } from '../data/rewards';
import { sound, speakEnglish } from '../utils/sound';

interface Props {
  detectiveCase: DetectiveCase;
  nickname: string;
  equippedGear: Partial<Record<EquipmentItem['slot'], string>>;
  onBack: () => void;
  onComplete: (stats: {
    wrongAttempts: number;
    hintsUsed: number;
    cluesFoundBeforeAnswer: boolean;
    durationSec: number;
    bonusStars: number;
  }) => { earnedStars: number };
  onNextCase?: () => void;
}

export const CasePlayView: React.FC<Props> = ({
  detectiveCase,
  nickname,
  equippedGear,
  onBack,
  onComplete,
  onNextCase,
}) => {
  const startTimeRef = useRef(Date.now());
  const [stepIdx, setStepIdx] = useState(0);
  const [foundTokenIndices, setFoundTokenIndices] = useState<number[]>([]);
  const [shakenToken, setShakenToken] = useState<number | null>(null);
  const [activeClueTip, setActiveClueTip] = useState<string>('');
  const [triedWrongIndices, setTriedWrongIndices] = useState<number[]>([]);
  const [stepSolved, setStepSolved] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [feedbackTone, setFeedbackTone] = useState<'neutral' | 'warm' | 'success'>('neutral');
  const [hintLevel, setHintLevel] = useState<number>(0); // 0, 1, 2, 3
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [totalWrongAttempts, setTotalWrongAttempts] = useState(0);
  const [cluesFoundBeforeFirstAnswer, setCluesFoundBeforeFirstAnswer] = useState<boolean | null>(null);
  const [caseFinished, setCaseFinished] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [chosenAnswers, setChosenAnswers] = useState<string[]>([]);

  const isSpotBug = detectiveCase.mode === 'eng_spot_bug';

  const targetClueIndices = useMemo(() => {
    return detectiveCase.tokens
      .map((t, i) => ((isSpotBug ? t.isBug : t.isClue) ? i : -1))
      .filter((i) => i >= 0);
  }, [detectiveCase.tokens, isSpotBug]);

  const foundTargetCount = targetClueIndices.filter((i) => foundTokenIndices.includes(i)).length;
  const allTargetsFound = targetClueIndices.length > 0 && foundTargetCount === targetClueIndices.length;

  const currentStep = detectiveCase.steps[stepIdx];

  // 计算阿探心情
  const avatarMood: AvatarMood = caseFinished
    ? 'celebrating'
    : stepSolved
    ? 'celebrating'
    : feedbackTone === 'warm'
    ? 'encouraging'
    : hintLevel > 0
    ? 'thinking'
    : 'curious';

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
      // 点了普通词：温柔提示，绝不打击
      setShakenToken(index);
      setTimeout(() => setShakenToken(null), 380);
      setActiveClueTip(
        isSpotBug
          ? `“${token.text}”看起来挺正常的，再把放大镜移到别的词上检查看看~`
          : `“${token.text}”是普通背景词，找找表示【人称/时间/数量/陷阱】的关键线索哦！`
      );
    }
  };

  const handleRevealHint = () => {
    if (hintLevel >= 3) return;
    sound.playHint();
    setHintLevel((h) => h + 1);
    setTotalHintsUsed((n) => n + 1);
    // 第1级提示自动帮孩子点亮一个还没找到的线索，降低畏难情绪
    if (hintLevel === 0 && !allTargetsFound) {
      const missing = targetClueIndices.find((i) => !foundTokenIndices.includes(i));
      if (missing !== undefined) {
        setFoundTokenIndices((prev) => [...prev, missing]);
        const tip = detectiveCase.tokens[missing].clueTip;
        if (tip) setActiveClueTip(`阿探帮你照出了线索：${tip}`);
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
      setFeedbackMsg(fb);
    }
  };

  const handleContinue = () => {
    if (stepIdx < detectiveCase.steps.length - 1) {
      setStepIdx((i) => i + 1);
      setStepSolved(false);
      setTriedWrongIndices([]);
      setFeedbackMsg('');
      setFeedbackTone('neutral');
      setHintLevel(0);
    } else {
      // 全部步骤完成，破案！
      sound.playCaseSolved();
      const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const bonusStars = allTargetsFound ? 5 : foundTargetCount > 0 ? 2 : 0;
      const res = onComplete({
        wrongAttempts: totalWrongAttempts,
        hintsUsed: totalHintsUsed,
        cluesFoundBeforeAnswer: Boolean(cluesFoundBeforeFirstAnswer),
        durationSec,
        bonusStars,
      });
      setEarnedStars(res.earnedStars);
      setCaseFinished(true);
    }
  };

  const visualStage = stepSolved
    ? currentStep.visualStage ?? stepIdx + 1
    : stepIdx;

  // 抓语法小偷模式下，必须先点出错误词才展开修复选项，强化审题！
  const needsBugFindFirst = isSpotBug && !allTargetsFound;

  const courageBoost =
    triedWrongIndices.length >= 2 && !stepSolved
      ? COURAGE_QUOTES[(detectiveCase.id.length + triedWrongIndices.length) % COURAGE_QUOTES.length]
      : '';

  if (caseFinished) {
    const celebQuote = CELEBRATION_QUOTES[detectiveCase.id.length % CELEBRATION_QUOTES.length];
    return (
      <div className="fade-in">
        <ConfettiBurst />
        <div className="card card-warm" style={{ textAlign: 'center', padding: '28px 22px' }}>
          <div style={{ marginBottom: 14 }}>
            <span className="stamp-closed">CASE CLOSED · 已破案</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <DetectiveAvatar mood="celebrating" equippedGear={equippedGear} size={130} />
          </div>

          <h2 style={{ margin: '8px 0 6px', fontSize: 26, fontWeight: 900, color: '#92400E' }}>
            太棒了，{nickname} 神探！
          </h2>
          <p style={{ margin: '0 auto 18px', maxWidth: 500, color: '#78350F', fontWeight: 600 }}>
            成功抓获「{detectiveCase.suspectName}」！{celebQuote}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              background: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: 18,
              border: '2px solid #FCD34D',
              marginBottom: 20,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 20, color: '#D97706' }}>
              ⭐ +{earnedStars} 侦探星
            </div>
            {allTargetsFound && (
              <span className="pill pill-amber">🔍 放大镜全线索奖励 +5⭐</span>
            )}
            {totalWrongAttempts === 0 ? (
              <span className="pill pill-green">🎯 一次完美破案</span>
            ) : (
              <span className="pill pill-blue">💪 越挫越勇 · 成功排雷</span>
            )}
          </div>

          {/* 破案收获的神探口诀 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2.5px solid #10B981',
              borderRadius: 18,
              padding: '16px 20px',
              textAlign: 'left',
              maxWidth: 620,
              margin: '0 auto 22px',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#059669', marginBottom: 4 }}>
              📜 收录进神探秘籍（{detectiveCase.textbookRef}）
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
              {detectiveCase.goldenRule}
            </div>
            {detectiveCase.readAloudText && (
              <button
                className="btn-soft"
                style={{ marginTop: 10 }}
                onClick={() => speakEnglish(detectiveCase.readAloudText!)}
              >
                <Volume2 size={16} /> 再听一遍标准英文读音
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-soft" onClick={onBack}>
              返回事务所
            </button>
            {onNextCase && (
              <button className="btn-primary" onClick={onNextCase}>
                继续下一宗案件 →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部返回与案件进度 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-soft" onClick={onBack}>
          <ArrowLeft size={17} /> 返回
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className={`pill ${detectiveCase.subject === 'english' ? 'pill-blue' : 'pill-green'}`}>
            {detectiveCase.subject === 'english' ? '🇬🇧 英语语法探案' : '🧮 数学逻辑实验室'}
          </span>
          <span className="pill pill-amber">{detectiveCase.textbookRef}</span>
          <span className="pill pill-orange">👾 {detectiveCase.suspectName}</span>
        </div>
      </div>

      {/* 步骤进度条（数学多步拆解时尤其有成就感） */}
      {detectiveCase.steps.length > 1 && (
        <div className="card" style={{ padding: '12px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 6, color: '#92400E' }}>
            <span>🧩 难题切块进度：第 {stepIdx + 1} / {detectiveCase.steps.length} 小步</span>
            <span>一步一步来，超轻松！</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${((stepIdx + (stepSolved ? 1 : 0.25)) / detectiveCase.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 案件主面板 */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{detectiveCase.title}</h2>
            <p style={{ margin: '6px 0 0', fontSize: 15, color: 'var(--ink-muted)' }}>
              {detectiveCase.storyIntro}
            </p>
          </div>
          {detectiveCase.readAloudText && (
            <button
              className="btn-soft"
              style={{ flexShrink: 0 }}
              onClick={() => speakEnglish(detectiveCase.readAloudText!)}
              title="朗读英语句子"
            >
              <Volume2 size={18} /> 听读音
            </button>
          )}
        </div>

        {/* 放大镜扫线索区 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 14, color: '#B45309' }}>
              <Search size={17} />
              <span>{detectiveCase.clueGoalText}</span>
            </div>
            <span className={`pill ${allTargetsFound ? 'pill-green' : 'pill-amber'}`}>
              {allTargetsFound
                ? '✨ 线索找齐！已锁定 +5⭐ 奖励'
                : `已照出 ${foundTargetCount} / ${targetClueIndices.length} 处`}
            </span>
          </div>

          <div className="clue-board">
            {detectiveCase.tokens.map((tok, idx) => {
              const isFound = foundTokenIndices.includes(idx);
              if (tok.isBlank) {
                const filledWord = chosenAnswers[0];
                return (
                  <span
                    key={idx}
                    className={`clue-token ${filledWord ? 'blank-filled' : 'blank-slot'}`}
                  >
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
                marginTop: 10,
                background: '#FEF3C7',
                border: '2px solid #FCD34D',
                borderRadius: 14,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 700,
                color: '#92400E',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Sparkles size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{activeClueTip}</span>
            </div>
          )}
        </div>

        {/* 数学动态可视化图示 */}
        {detectiveCase.visual && (
          <MathVisualizer spec={detectiveCase.visual} stage={visualStage} />
        )}

        {/* 答题推理区 */}
        {needsBugFindFirst ? (
          <div
            style={{
              background: '#FFF7ED',
              border: '2px dashed #FB923C',
              borderRadius: 16,
              padding: '16px 18px',
              textAlign: 'center',
              fontWeight: 800,
              color: '#9A3412',
            }}
          >
            🕵️ 先在上面的英语句子里，用手指点出那个【写错的语法小偷词】，抓到后就可以修复它啦！
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
              🎯 {currentStep.prompt}
            </div>

            <div className="option-grid">
              {currentStep.options.map((opt, idx) => {
                const isCorrectChosen = stepSolved && idx === currentStep.correctIndex;
                const isWrongTried = triedWrongIndices.includes(idx);
                const letter = ['A', 'B', 'C', 'D'][idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={stepSolved}
                    onClick={() => handleSelectOption(idx)}
                    className={[
                      'option-btn',
                      isCorrectChosen ? 'correct' : '',
                      isWrongTried ? 'tried-wrong' : '',
                    ].join(' ')}
                  >
                    <span className="option-letter">{isCorrectChosen ? '✓' : letter}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 阿探即时温柔反馈区 */}
        {(feedbackMsg || courageBoost) && (
          <div
            className="fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: feedbackTone === 'success' ? '#ECFDF5' : '#FFF7ED',
              border: `2px solid ${feedbackTone === 'success' ? '#34D399' : '#FDBA74'}`,
              borderRadius: 18,
              padding: '14px 16px',
            }}
          >
            <DetectiveAvatar mood={avatarMood} equippedGear={equippedGear} size={76} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: feedbackTone === 'success' ? '#065F46' : '#9A3412',
                }}
              >
                {feedbackMsg}
              </div>
              {courageBoost && (
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#B45309' }}>
                  💛 阿探悄悄话：{courageBoost}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 免费求助锦囊区（零惩罚） + 下一步按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            paddingTop: 6,
            borderTop: '1.5px solid #F1E9D6',
          }}
        >
          {!stepSolved ? (
            <button
              type="button"
              className="btn-soft"
              onClick={handleRevealHint}
              disabled={hintLevel >= 3}
            >
              <HelpCircle size={17} />
              {hintLevel === 0
                ? '向阿探求助（免费不扣星）'
                : hintLevel < 3
                ? `再看一层提示（${hintLevel}/3）`
                : '3 层锦囊已全部打开'}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 800 }}>
              <CheckCircle2 size={20} /> 这一步稳稳拿下！
            </div>
          )}

          {stepSolved && (
            <button type="button" className="btn-mint" onClick={handleContinue}>
              {stepIdx < detectiveCase.steps.length - 1 ? '进入下一小步 →' : '🎉 盖章破案！'}
            </button>
          )}
        </div>

        {/* 展开的 3 级渐进提示 */}
        {hintLevel > 0 && !stepSolved && (
          <div
            className="fade-in"
            style={{
              background: '#F5F3FF',
              border: '2px solid #C4B5FD',
              borderRadius: 16,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13, color: '#6D28D9' }}>
              <Lightbulb size={16} /> 阿探免费提示锦囊（使用提示不扣星星哦！）
            </div>
            {currentStep.hints.slice(0, hintLevel).map((h, i) => (
              <div key={i} style={{ fontSize: 14, fontWeight: 600, color: '#3B0764' }}>
                <strong>锦囊 {i + 1}：</strong> {h}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部心理安全提示 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-muted)' }}>
        <ShieldCheck size={15} color="#10B981" />
        <span>神探守护模式：答错不扣分，求助不扣星，弄懂就是胜利！</span>
      </div>
    </div>
  );
};
