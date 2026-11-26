import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, ClipboardCheck, HelpCircle, Play, Search, Sparkles, Volume2 } from 'lucide-react';
import { DetectiveCase, EquipmentItem, ExamPaper, ExamRecord, LearnerProfile } from '../types';
import { EXAM_PAPERS } from '../data/exams';
import { DetectiveAvatar } from './DetectiveAvatar';
import { MathVisualizer } from './MathVisualizer';
import { ConfettiBurst } from './ConfettiBurst';
import { sound, speakEnglish } from '../utils/sound';

interface Props {
  profile: LearnerProfile;
  allCases: DetectiveCase[];
  equippedGear: Partial<Record<EquipmentItem['slot'], string>>;
  onFinishExam: (payload: {
    paper: ExamPaper;
    record: ExamRecord;
    missedCases: DetectiveCase[];
    earnedStars: number;
  }) => void;
  onPracticeCase: (c: DetectiveCase) => void;
}

interface AnswerSnapshot {
  caseItem: DetectiveCase;
  selectedOptionIndex: number;
  isCorrect: boolean;
  foundAnyClue: boolean;
}

export const ExamView: React.FC<Props> = ({
  profile,
  allCases,
  equippedGear,
  onFinishExam,
  onPracticeCase,
}) => {
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [foundTokens, setFoundTokens] = useState<number[]>([]);
  const [clueTip, setClueTip] = useState('');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<AnswerSnapshot[]>([]);
  const [finishedRecord, setFinishedRecord] = useState<{
    record: ExamRecord;
    earnedStars: number;
    snapshots: AnswerSnapshot[];
  } | null>(null);
  const startRef = useRef(Date.now());

  const paperCases = useMemo(() => {
    if (!activePaper) return [];
    return activePaper.caseIds
      .map((id) => allCases.find((c) => c.id === id))
      .filter((c): c is DetectiveCase => Boolean(c));
  }, [activePaper, allCases]);

  const startPaper = (paper: ExamPaper) => {
    sound.playStepSuccess();
    setActivePaper(paper);
    setQIdx(0);
    setFoundTokens([]);
    setClueTip('');
    setSelectedOpt(null);
    setShowHint(false);
    setAnswers([]);
    setFinishedRecord(null);
    startRef.current = Date.now();
  };

  // 获取每张试卷历史最高分
  const getBestScore = (examId: string) => {
    const records = (profile.examHistory || []).filter((r) => r.examId === examId);
    if (records.length === 0) return null;
    return Math.max(...records.map((r) => r.score));
  };

  // ================= 试卷列表大厅 =================
  if (!activePaper) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            borderColor: '#F59E0B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <DetectiveAvatar mood="happy" equippedGear={equippedGear} size={82} />
            <div style={{ flex: 1 }}>
              <span className="pill pill-orange">📝 零压力 · 神探段位认证考场</span>
              <h2 style={{ margin: '6px 0 4px', fontSize: 22, fontWeight: 900, color: '#78350F' }}>
                深圳四年级模拟试卷中心（6 套精选卷）
              </h2>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#92400E' }}>
                没有吓人的倒计时！考卷里依然可以用放大镜找线索、看数学图解，交卷就发「神探奖状」，错题还会自动收进抓错怪档案方便巩固！
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))', gap: 14 }}>
          {EXAM_PAPERS.map((paper) => {
            const best = getBestScore(paper.id);
            const tagClass =
              paper.subject === 'english'
                ? 'pill-blue'
                : paper.subject === 'math'
                ? 'pill-green'
                : 'pill-purple';
            const tagLabel =
              paper.subject === 'english'
                ? '英语专项卷'
                : paper.subject === 'math'
                ? '数学专项卷'
                : '英数综合卷';

            return (
              <div
                key={paper.id}
                className="card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderColor: best !== null && best >= 85 ? '#34D399' : 'var(--border-soft)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
                    <span className={`pill ${tagClass}`}>
                      {paper.badgeEmoji} {tagLabel} · {paper.caseIds.length} 题
                    </span>
                    {best !== null ? (
                      <span className="pill pill-green">最高 {best} 分</span>
                    ) : (
                      <span className="pill pill-amber">⭐ 奖 +{paper.rewardStars}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#0F172A' }}>{paper.title}</div>
                  <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginTop: 4 }}>
                    {paper.subtitle}
                  </div>
                  <div style={{ fontSize: 12, color: '#92400E', marginTop: 8, background: '#FFFBEB', padding: '7px 10px', borderRadius: 10 }}>
                    💬 {paper.encouragement}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '11px 14px', fontSize: 15 }}
                  onClick={() => startPaper(paper)}
                >
                  <Play size={16} fill="currentColor" /> {best !== null ? '再刷一次冲满分' : '领取试卷开考！'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= 交卷后的「神探认证成绩单」 =================
  if (finishedRecord) {
    const { record, earnedStars, snapshots } = finishedRecord;
    const medal =
      record.score >= 90
        ? { badge: '🏆 金牌神探认证', color: '#B45309', msg: '太神啦！你的细心度和推理力已经达到深圳四年级学霸水准！' }
        : record.score >= 70
        ? { badge: '🥈 银牌神探认证', color: '#1D4ED8', msg: '非常棒！大部分陷阱都被你轻松识破，把下面几道小错题再看一眼就满级啦！' }
        : { badge: '🌟 勇敢挑战之星', color: '#059669', msg: '敢于完成整套模拟卷就超了不起！我们发现了宝贵的提分线索，点下方一键去拆解它们吧！' };

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ConfettiBurst />
        <div className="card card-warm" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <div style={{ marginBottom: 10 }}>
            <span className="stamp-closed">{medal.badge}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <DetectiveAvatar mood="celebrating" equippedGear={equippedGear} size={116} />
          </div>
          <h2 style={{ margin: '6px 0 4px', fontSize: 26, fontWeight: 900, color: medal.color }}>
            {profile.nickname} 获得了 {record.score} 分！
          </h2>
          <p style={{ margin: '0 auto 14px', maxWidth: 520, fontSize: 15, fontWeight: 700, color: '#78350F' }}>
            {medal.msg}
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: '#FFFFFF',
              padding: '12px 22px',
              borderRadius: 18,
              border: '2px solid #FCD34D',
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 900, color: '#059669' }}>
              ✅ 答对 {record.correctCount} / {record.totalCount} 题
            </span>
            <span style={{ fontWeight: 900, color: '#D97706' }}>⭐ 奖励 +{earnedStars} 侦探星</span>
            <span style={{ fontWeight: 800, color: '#475569' }}>
              ⏱ 用时 {Math.max(1, Math.round(record.durationSec / 60))} 分钟
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-soft" onClick={() => setActivePaper(null)}>
              返回试卷列表
            </button>
            <button className="btn-primary" onClick={() => startPaper(activePaper)}>
              再挑战一次本卷
            </button>
          </div>
        </div>

        {/* 逐题诊断解析 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardCheck size={20} color="#D97706" /> 逐题神探解析（错题已自动加入「抓错怪」档案）
          </h3>
          {snapshots.map((snap, i) => {
            const finalStep = snap.caseItem.steps[snap.caseItem.steps.length - 1];
            const rightAns = finalStep.options[finalStep.correctIndex];
            const chosenAns = finalStep.options[snap.selectedOptionIndex];
            return (
              <div
                key={snap.caseItem.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 16,
                  background: snap.isCorrect ? '#ECFDF5' : '#FFF7ED',
                  border: `2px solid ${snap.isCorrect ? '#6EE7B7' : '#FDBA74'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>
                    第 {i + 1} 题 · {snap.caseItem.title}
                  </div>
                  <span className={`pill ${snap.isCorrect ? 'pill-green' : 'pill-orange'}`}>
                    {snap.isCorrect ? '✓ 完美答对' : '💡 发现提分点'}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  你的选择：<strong>{chosenAns}</strong>
                  {!snap.isCorrect && (
                    <>
                      {' '}· 正确答案：<strong style={{ color: '#059669' }}>{rightAns}</strong>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
                  📜 {snap.caseItem.goldenRule}
                </div>
                {!snap.isCorrect && (
                  <div>
                    <button
                      className="btn-soft"
                      style={{ padding: '6px 12px', fontSize: 13, marginTop: 4 }}
                      onClick={() => onPracticeCase(snap.caseItem)}
                    >
                      <Sparkles size={14} /> 进入分步动画精讲这道题 →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= 正在作答试卷界面 =================
  const currentCase = paperCases[qIdx];
  const targetStep = currentCase.steps[currentCase.steps.length - 1];
  const isLastQuestion = qIdx === paperCases.length - 1;

  const handleTokenClick = (idx: number) => {
    const tok = currentCase.tokens[idx];
    if (tok.isBlank) return;
    if (tok.isClue || tok.isBug) {
      if (!foundTokens.includes(idx)) {
        sound.playClueFound();
        setFoundTokens((prev) => [...prev, idx]);
      }
      if (tok.clueTip) setClueTip(tok.clueTip);
    } else {
      setClueTip(`“${tok.text}”是普通词，找找关键数字、人称或陷阱词哦！`);
    }
  };

  const handleConfirmNext = () => {
    if (selectedOpt === null) return;
    const isCorrect = selectedOpt === targetStep.correctIndex;
    const snapshot: AnswerSnapshot = {
      caseItem: currentCase,
      selectedOptionIndex: selectedOpt,
      isCorrect,
      foundAnyClue: foundTokens.length > 0,
    };
    const nextAnswers = [...answers, snapshot];

    if (!isLastQuestion) {
      sound.playStepSuccess();
      setAnswers(nextAnswers);
      setQIdx((n) => n + 1);
      setFoundTokens([]);
      setClueTip('');
      setSelectedOpt(null);
      setShowHint(false);
    } else {
      // 交卷结算！
      sound.playCaseSolved();
      const correctCount = nextAnswers.filter((a) => a.isCorrect).length;
      const totalCount = nextAnswers.length;
      const score = Math.round((correctCount / totalCount) * 100);
      const durationSec = Math.max(5, Math.round((Date.now() - startRef.current) / 1000));
      const record: ExamRecord = {
        examId: activePaper.id,
        score,
        correctCount,
        totalCount,
        durationSec,
        completedAt: Date.now(),
      };
      const missedCases = nextAnswers.filter((a) => !a.isCorrect).map((a) => a.caseItem);
      // 鼓励机制：哪怕没全对，只要认真交卷就能拿丰厚星星！
      const earnedStars = Math.max(15, Math.round((activePaper.rewardStars * (score + 40)) / 140));
      onFinishExam({ paper: activePaper, record, missedCases, earnedStars });
      setFinishedRecord({ record, earnedStars, snapshots: nextAnswers });
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button className="btn-soft" onClick={() => setActivePaper(null)}>
          <ArrowLeft size={16} /> 退出考场
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="pill pill-amber">
            <Award size={14} /> {activePaper.title}
          </span>
          <span className="pill pill-blue">
            第 {qIdx + 1} / {paperCases.length} 题
          </span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((qIdx + 1) / paperCases.length) * 100}%` }} />
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <span className={`pill ${currentCase.subject === 'english' ? 'pill-blue' : 'pill-green'}`} style={{ marginBottom: 6 }}>
              {currentCase.textbookRef}
            </span>
            <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 900 }}>
              第 {qIdx + 1} 题：{currentCase.title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-muted)' }}>
              {currentCase.storyIntro}
            </p>
          </div>
          {currentCase.readAloudText && (
            <button className="btn-soft" onClick={() => speakEnglish(currentCase.readAloudText!)}>
              <Volume2 size={17} /> 朗读
            </button>
          )}
        </div>

        {/* 考卷中也保留放大镜圈关键词，养成考试先审题好习惯 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#B45309', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Search size={15} /> 审题习惯加分：点击题干里的关键词帮你防粗心！
          </div>
          <div className="clue-board">
            {currentCase.tokens.map((tok, i) => {
              if (tok.isBlank) {
                const chosenText = selectedOpt !== null ? targetStep.options[selectedOpt] : '___';
                return (
                  <span key={i} className={`clue-token ${selectedOpt !== null ? 'blank-filled' : 'blank-slot'}`}>
                    {chosenText}
                  </span>
                );
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
          {clueTip && (
            <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 12, background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700 }}>
              💡 {clueTip}
            </div>
          )}
        </div>

        {currentCase.visual && <MathVisualizer spec={currentCase.visual} stage={0} />}

        <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
          🎯 {currentCase.steps.length > 1 ? `综合解答：${targetStep.prompt.replace(/^第[二三]步（.*?）：|^第[二三]步：/, '')}` : targetStep.prompt}
        </div>

        <div className="option-grid">
          {targetStep.options.map((opt, idx) => {
            const active = selectedOpt === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sound.playClueFound();
                  setSelectedOpt(idx);
                }}
                className="option-btn"
                style={{
                  borderColor: active ? '#F59E0B' : '#E2E8F0',
                  background: active ? '#FFFBEB' : '#FFFFFF',
                  boxShadow: active ? '0 4px 0 #F59E0B' : '0 4px 0 #E2E8F0',
                }}
              >
                <span
                  className="option-letter"
                  style={{
                    background: active ? '#F59E0B' : '#F1F5F9',
                    color: active ? '#FFFFFF' : '#475569',
                  }}
                >
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {showHint && (
          <div style={{ background: '#F5F3FF', border: '2px solid #C4B5FD', borderRadius: 14, padding: '10px 14px', fontSize: 14, color: '#4C1D95', fontWeight: 600 }}>
            💡 阿探思路提示：{targetStep.hints[0]} {targetStep.hints[1]}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 6, borderTop: '1.5px solid #F1E9D6' }}>
          <button type="button" className="btn-soft" onClick={() => setShowHint(true)} disabled={showHint}>
            <HelpCircle size={16} /> {showHint ? '已打开思路提示' : '需要思路提示？'}
          </button>

          <button
            type="button"
            className={isLastQuestion ? 'btn-mint' : 'btn-primary'}
            disabled={selectedOpt === null}
            onClick={handleConfirmNext}
          >
            <CheckCircle2 size={17} /> {isLastQuestion ? '🎉 提交试卷领奖状！' : '确认并进入下一题 →'}
          </button>
        </div>
      </div>
    </div>
  );
};
