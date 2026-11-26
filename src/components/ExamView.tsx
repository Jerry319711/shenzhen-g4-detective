import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  HelpCircle,
  PenTool,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { DetectiveCase, EquipmentItem, ExamPaper, ExamRecord, LearnerProfile, SkillCategory } from '../types';
import { EXAM_PAPERS } from '../data/exams';
import { SKILL_META } from '../data/curriculum';
import { generateVariantPaperCases } from '../data/proceduralGenerator';
import { DetectiveAvatar } from './DetectiveAvatar';
import { MathVisualizer } from './MathVisualizer';
import { ConfettiBurst } from './ConfettiBurst';
import { ScratchpadDrawer } from './ScratchpadDrawer';
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
    earnedTreats: number;
  }) => void;
  onPracticeCase: (c: DetectiveCase) => void;
}

type FilterMode = 'all' | 'english' | 'math' | 'mixed' | 'special';

export const ExamView: React.FC<Props> = ({
  profile,
  allCases,
  equippedGear,
  onFinishExam,
  onPracticeCase,
}) => {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(null);
  const [paperCases, setPaperCases] = useState<DetectiveCase[]>([]);
  const [isVariantMode, setIsVariantMode] = useState(false);

  const [qIdx, setQIdx] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [foundMap, setFoundMap] = useState<Record<number, number[]>>({});
  const [clueTip, setClueTip] = useState('');
  const [showHintMap, setShowHintMap] = useState<Record<number, boolean>>({});
  const [scratchOpen, setScratchOpen] = useState(false);
  const [submitWarning, setSubmitWarning] = useState('');

  const [finishedData, setFinishedData] = useState<{
    record: ExamRecord;
    earnedStars: number;
    earnedTreats: number;
    skillStats: { skill: SkillCategory; name: string; correct: number; total: number }[];
  } | null>(null);

  const startRef = useRef(Date.now());

  const filteredPapers = useMemo(() => {
    return EXAM_PAPERS.filter((p) => {
      if (filter === 'all') return true;
      if (filter === 'special') return p.category === 'special';
      return p.subject === filter;
    });
  }, [filter]);

  const getBestScore = (examId: string) => {
    const list = (profile.examHistory || []).filter((r) => r.examId === examId);
    if (list.length === 0) return null;
    return Math.max(...list.map((r) => r.score));
  };

  const launchPaper = (paper: ExamPaper, useFreshVariants = false) => {
    sound.playStepSuccess();
    const cases = useFreshVariants
      ? generateVariantPaperCases(paper.targetSkills, paper.questionCount)
      : paper.caseIds
          .map((id) => allCases.find((c) => c.id === id))
          .filter((c): c is DetectiveCase => Boolean(c));

    setActivePaper(paper);
    setPaperCases(cases);
    setIsVariantMode(useFreshVariants);
    setQIdx(0);
    setSelections({});
    setFlagged({});
    setFoundMap({});
    setClueTip('');
    setShowHintMap({});
    setSubmitWarning('');
    setFinishedData(null);
    startRef.current = Date.now();
  };

  // ================= 16 套完整模拟试卷大厅 =================
  if (!activePaper) {
    const completedPaperCount = new Set((profile.examHistory || []).map((h) => h.examId)).size;
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          className="card card-warm"
          style={{
            borderColor: '#D97706',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <DetectiveAvatar mood="happy" skinId={profile.equippedSkinId} equippedGear={equippedGear} size={86} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="pill pill-orange">📝 {EXAM_PAPERS.length} 套深圳四年级秘境试炼卷</span>
                <span className="pill pill-green">每卷 12~20 题 · 交卷必掉青铜/白银盲盒！</span>
                <span className="pill pill-blue">已通关 {completedPaperCount}/{EXAM_PAPERS.length} 套</span>
              </div>
              <h2 style={{ margin: '4px 0 4px', fontSize: 22, fontWeight: 900, color: '#FDE68A' }}>
                秘境试炼考场（期中 / 期末 / 专题 / 20题压轴大卷）
              </h2>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-muted)' }}>
                带答题卡跳题、插旗标记待检查、内置电子草稿纸与考前防粗心复查提醒——真正培养四年级高分考试习惯！
              </p>
            </div>
          </div>
        </div>

        {/* 试卷分类筛选 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(
            [
              { id: 'all', label: `全部试炼卷 (${EXAM_PAPERS.length})` },
              { id: 'english', label: '🇬🇧 英语卷 (9)' },
              { id: 'math', label: '🧮 数学卷 (9)' },
              { id: 'mixed', label: '🏆 英数大联考 (2)' },
              { id: 'special', label: '🎯 防粗心/重难点专题 (8)' },
            ] as { id: FilterMode; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              className="btn-soft"
              style={{
                background: filter === tab.id ? '#DC2626' : '#221C2C',
                color: filter === tab.id ? '#FEF3C7' : '#D6C7B2',
                borderColor: filter === tab.id ? '#F59E0B' : '#4A3D58',
              }}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 试卷网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filteredPapers.map((paper) => {
            const best = getBestScore(paper.id);
            const tagClass =
              paper.subject === 'english' ? 'pill-blue' : paper.subject === 'math' ? 'pill-green' : 'pill-purple';
            return (
              <div
                key={paper.id}
                className="card"
                style={{
                  padding: 17,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderColor: best !== null && best >= 90 ? '#10B981' : '#3D3124',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className={`pill ${tagClass}`}>
                      {paper.badgeEmoji} {paper.gradeTerm} · {paper.questionCount} 题
                    </span>
                    {best !== null ? (
                      <span className="pill pill-green">最高 {best} 分</span>
                    ) : (
                      <span className="pill pill-amber">🎁 必掉盲盒 · ⭐+{Math.round(paper.rewardStars * 0.65)}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 16.5, fontWeight: 900, color: '#FDE68A' }}>{paper.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', fontWeight: 600, marginTop: 4 }}>
                    {paper.subtitle}
                  </div>
                  <div style={{ fontSize: 12, color: '#FDBA74', marginTop: 8, background: '#110D16', padding: '7px 10px', borderRadius: 10, border: '1px solid #332940' }}>
                    💬 {paper.encouragement}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1.4, padding: '10px 10px', fontSize: 14 }}
                    onClick={() => launchPaper(paper, false)}
                  >
                    <Play size={15} fill="currentColor" /> {best !== null ? '刷精选原卷' : '领取开考'}
                  </button>
                  <button
                    className="btn-soft"
                    style={{ flex: 1, padding: '10px 8px', fontSize: 13 }}
                    onClick={() => launchPaper(paper, true)}
                    title="用相同知识点生成全新数字和句子的新试卷"
                  >
                    <RefreshCw size={14} /> 新变式卷
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= 交卷后的深度诊断成绩单 =================
  if (finishedData) {
    const { record, earnedStars, earnedTreats, skillStats } = finishedData;
    const medal =
      record.score >= 90
        ? { badge: '🏆 金牌神探认证', color: '#B45309', msg: '超强实力！你的细心度和逻辑推理已经稳稳达到深圳四年级学霸水准！' }
        : record.score >= 75
        ? { badge: '🥈 银牌神探认证', color: '#1D4ED8', msg: '表现很棒！已经攻克了绝大多数考点，下面几道提分题点一下精讲就满级啦！' }
        : { badge: '🌟 勇敢挑战之星', color: '#059669', msg: '认真答完一整套大卷超级了不起！我们精准定位出了提分突破口，一道道吃掉它们吧！' };

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ConfettiBurst />
        <div className="card card-warm" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <div style={{ marginBottom: 10 }}>
            <span className="stamp-closed">{medal.badge}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <DetectiveAvatar mood="celebrating" skinId={profile.equippedSkinId} equippedGear={equippedGear} size={114} />
          </div>
          <h2 style={{ margin: '6px 0 4px', fontSize: 27, fontWeight: 900, color: medal.color }}>
            {profile.nickname} 考了 {record.score} 分！
          </h2>
          <p style={{ margin: '0 auto 14px', maxWidth: 540, fontSize: 15, fontWeight: 700, color: '#78350F' }}>
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
            <span style={{ fontWeight: 900, color: '#D97706' }}>⭐ +{earnedStars} 侦探星</span>
            <span style={{ fontWeight: 900, color: '#EA580C' }}>🦴 +{earnedTreats} 智慧狗粮</span>
            <span style={{ fontWeight: 800, color: '#475569' }}>
              ⏱ 用时 {Math.max(1, Math.round(record.durationSec / 60))} 分钟
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-soft" onClick={() => setActivePaper(null)}>
              返回 16 套试卷大厅
            </button>
            <button className="btn-primary" onClick={() => launchPaper(activePaper, true)}>
              <RefreshCw size={16} /> 换一套全新变式卷再战！
            </button>
          </div>
        </div>

        {/* 按知识点分模块得分率报告 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>📊 本卷知识点掌握透视</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {skillStats.map((st) => {
              const pct = Math.round((st.correct / st.total) * 100);
              return (
                <div key={st.skill} style={{ background: '#F8FAFC', borderRadius: 14, padding: '10px 14px', border: '1.5px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 5 }}>
                    <span>{st.name}</span>
                    <span style={{ color: pct >= 80 ? '#059669' : '#D97706' }}>
                      {st.correct}/{st.total} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: 8 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? '#10B981' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 逐题深度解析 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardCheck size={20} color="#D97706" /> 逐题神探解析（错题已自动收进「抓错怪」复仇档案）
          </h3>
          {paperCases.map((c, i) => {
            const targetStep = c.steps[c.steps.length - 1];
            const chosenIdx = selections[i];
            const isCorrect = chosenIdx === targetStep.correctIndex;
            const chosenText = chosenIdx !== undefined ? targetStep.options[chosenIdx] : '未作答';
            const rightText = targetStep.options[targetStep.correctIndex];

            return (
              <div
                key={`${c.id}-${i}`}
                style={{
                  padding: '13px 16px',
                  borderRadius: 16,
                  background: isCorrect ? '#ECFDF5' : '#FFF7ED',
                  border: `2px solid ${isCorrect ? '#6EE7B7' : '#FDBA74'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>
                    第 {i + 1} 题 · {c.title}
                  </div>
                  <span className={`pill ${isCorrect ? 'pill-green' : 'pill-orange'}`}>
                    {isCorrect ? '✓ 答对' : '💡 提分宝藏题'}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  你的选择：<strong>{chosenText}</strong>
                  {!isCorrect && (
                    <>
                      {' '}· 正确答案：<strong style={{ color: '#059669' }}>{rightText}</strong>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>📜 {c.goldenRule}</div>
                {!isCorrect && (
                  <div>
                    <button
                      className="btn-soft"
                      style={{ padding: '6px 12px', fontSize: 13, marginTop: 4 }}
                      onClick={() => onPracticeCase(c)}
                    >
                      <Sparkles size={14} /> 马上进入分步动画精讲这道题 →
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

  // ================= 正在答题界面（带答题卡 + 标记复查 + 电子草稿纸） =================
  const currentCase = paperCases[qIdx];
  const targetStep = currentCase.steps[currentCase.steps.length - 1];
  const selectedOpt = selections[qIdx];
  const currentFound = foundMap[qIdx] || [];
  const answeredCount = Object.keys(selections).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  const handleTokenClick = (tokIdx: number) => {
    const tok = currentCase.tokens[tokIdx];
    if (tok.isBlank) return;
    if (tok.isClue || tok.isBug) {
      if (!currentFound.includes(tokIdx)) {
        sound.playClueFound();
        setFoundMap((prev) => ({ ...prev, [qIdx]: [...(prev[qIdx] || []), tokIdx] }));
      }
      if (tok.clueTip) setClueTip(tok.clueTip);
    } else {
      setClueTip(`“${tok.text}”是普通词，找找数字、人称或陷阱词哦！`);
    }
  };

  const handleTrySubmit = (force = false) => {
    const unanswered = paperCases.length - answeredCount;
    if (!force && (unanswered > 0 || flaggedCount > 0)) {
      setSubmitWarning(
        `神探考前检查提醒：${unanswered > 0 ? `还有 ${unanswered} 题未选` : ''}${
          unanswered > 0 && flaggedCount > 0 ? '，且' : ''
        }${flaggedCount > 0 ? `有 ${flaggedCount} 题插了待检查小旗子` : ''}！点击下方题号可以快速复查，或者点“确认交卷”。`
      );
      return;
    }

    sound.playCaseSolved();
    let correctCount = 0;
    const missedCases: DetectiveCase[] = [];
    const skillMap = new Map<SkillCategory, { correct: number; total: number }>();

    paperCases.forEach((c, idx) => {
      const step = c.steps[c.steps.length - 1];
      const ok = selections[idx] === step.correctIndex;
      if (ok) correctCount += 1;
      else missedCases.push(c);

      const prev = skillMap.get(c.skill) || { correct: 0, total: 0 };
      skillMap.set(c.skill, { correct: prev.correct + (ok ? 1 : 0), total: prev.total + 1 });
    });

    const totalCount = paperCases.length;
    const score = Math.round((correctCount / totalCount) * 100);
    const durationSec = Math.max(10, Math.round((Date.now() - startRef.current) / 1000));
    const skillStats = Array.from(skillMap.entries()).map(([skill, val]) => ({
      skill,
      name: SKILL_META.find((s) => s.id === skill)?.shortName || skill,
      ...val,
    }));
    const weakSkills = skillStats.filter((s) => s.correct / s.total < 0.7).map((s) => s.skill);

    const record: ExamRecord = {
      examId: activePaper.id,
      score,
      correctCount,
      totalCount,
      durationSec,
      completedAt: Date.now(),
      weakSkills,
    };

    const earnedStars = Math.max(20, Math.round((activePaper.rewardStars * (score + 40)) / 140));
    const earnedTreats = activePaper.rewardTreats;
    onFinishExam({ paper: activePaper, record, missedCases, earnedStars, earnedTreats });
    setFinishedData({ record, earnedStars, earnedTreats, skillStats });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 顶栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <button className="btn-soft" onClick={() => setActivePaper(null)}>
          <ArrowLeft size={16} /> 退出考场
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="pill pill-amber">
            <Award size={14} /> {activePaper.title} {isVariantMode ? '（新变式版）' : ''}
          </span>
          <span className="pill pill-blue">
            已答 {answeredCount} / {paperCases.length}
          </span>
          {currentCase.subject === 'math' && (
            <button className="btn-soft" onClick={() => setScratchOpen(true)}>
              <PenTool size={15} /> 打草稿
            </button>
          )}
        </div>
      </div>

      {/* 答题卡导航条 */}
      <div className="card" style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 12, fontWeight: 800, color: '#475569' }}>
          <span>📋 答题卡（点击题号随时跳题/检查）</span>
          <span>蓝色=已答 · 🚩=待复查</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {paperCases.map((_, idx) => {
            const isCurr = idx === qIdx;
            const isAns = selections[idx] !== undefined;
            const isFlag = flagged[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQIdx(idx);
                  setClueTip('');
                  setSubmitWarning('');
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  fontWeight: 900,
                  fontSize: 13,
                  position: 'relative',
                  border: isCurr ? '2.5px solid #D97706' : '1.5px solid #CBD5E1',
                  background: isCurr ? '#FEF3C7' : isAns ? '#DBEAFE' : '#FFFFFF',
                  color: isCurr ? '#92400E' : isAns ? '#1D4ED8' : '#64748B',
                }}
              >
                {idx + 1}
                {isFlag && (
                  <span style={{ position: 'absolute', top: -6, right: -4, fontSize: 11 }}>🚩</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 题目主面板 */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <span className={`pill ${currentCase.subject === 'english' ? 'pill-blue' : 'pill-green'}`} style={{ marginBottom: 6 }}>
              第 {qIdx + 1} 题 · {currentCase.textbookRef}
            </span>
            <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 900 }}>{currentCase.title}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-muted)' }}>{currentCase.storyIntro}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {currentCase.readAloudText && (
              <button className="btn-soft" onClick={() => speakEnglish(currentCase.readAloudText!)}>
                <Volume2 size={16} /> 朗读
              </button>
            )}
            <button
              className="btn-soft"
              style={{
                background: flagged[qIdx] ? '#FFEDD5' : '#FFFFFF',
                borderColor: flagged[qIdx] ? '#FB923C' : '#E2E8F0',
                color: flagged[qIdx] ? '#C2410C' : '#64748B',
              }}
              onClick={() => setFlagged((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }))}
            >
              <Flag size={15} /> {flagged[qIdx] ? '已插旗复查' : '标记待检查'}
            </button>
          </div>
        </div>

        {/* 放大镜圈关键词 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#B45309', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Search size={15} /> 防粗心习惯：点击题干关键词高亮标出！
          </div>
          <div className="clue-board">
            {currentCase.tokens.map((tok, i) => {
              if (tok.isBlank) {
                const chosenText = selectedOpt !== undefined ? targetStep.options[selectedOpt] : '___';
                return (
                  <span key={i} className={`clue-token ${selectedOpt !== undefined ? 'blank-filled' : 'blank-slot'}`}>
                    {chosenText}
                  </span>
                );
              }
              const found = currentFound.includes(i);
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

        {currentCase.visual && (
          <div className="math-visual-light">
            <MathVisualizer spec={currentCase.visual} stage={0} />
          </div>
        )}

        <div style={{ fontSize: 16, fontWeight: 800, color: '#FDE68A' }}>
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
                  setSelections((prev) => ({ ...prev, [qIdx]: idx }));
                  setSubmitWarning('');
                }}
                className="option-btn"
                style={{
                  borderColor: active ? '#F59E0B' : '#453953',
                  background: active ? '#35261A' : '#211C2B',
                  boxShadow: active ? '0 0 14px rgba(245, 158, 11, 0.35)' : '0 4px 0 #0F0C14',
                }}
              >
                <span
                  className="option-letter"
                  style={{
                    background: active ? '#F59E0B' : '#352D44',
                    color: active ? '#1C1008' : '#FDE68A',
                  }}
                >
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {showHintMap[qIdx] && (
          <div style={{ background: '#F5F3FF', border: '2px solid #C4B5FD', borderRadius: 14, padding: '10px 14px', fontSize: 14, color: '#4C1D95', fontWeight: 600 }}>
            💡 阿探思路提示：{targetStep.hints[0]} {targetStep.hints[1]}
          </div>
        )}

        {submitWarning && (
          <div
            className="fade-in"
            style={{
              background: '#FFF7ED',
              border: '2px solid #FB923C',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
              fontSize: 13,
              fontWeight: 700,
              color: '#9A3412',
            }}
          >
            <span>🕵️ {submitWarning}</span>
            <button className="btn-mint" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => handleTrySubmit(true)}>
              检查好了，确认交卷！
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 6, borderTop: '1.5px solid #F1E9D6' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn-soft"
              disabled={qIdx === 0}
              onClick={() => {
                setQIdx((n) => n - 1);
                setClueTip('');
              }}
            >
              ← 上一题
            </button>
            <button
              type="button"
              className="btn-soft"
              disabled={Boolean(showHintMap[qIdx])}
              onClick={() => setShowHintMap((prev) => ({ ...prev, [qIdx]: true }))}
            >
              <HelpCircle size={15} /> 思路提示
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {qIdx < paperCases.length - 1 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setQIdx((n) => n + 1);
                  setClueTip('');
                }}
              >
                下一题 →
              </button>
            ) : (
              <button type="button" className="btn-mint" onClick={() => handleTrySubmit(false)}>
                <CheckCircle2 size={17} /> 交卷领神探奖状！
              </button>
            )}
          </div>
        </div>
      </div>

      <ScratchpadDrawer open={scratchOpen} onClose={() => setScratchOpen(false)} />
    </div>
  );
};
