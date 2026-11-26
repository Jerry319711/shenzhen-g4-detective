import React from 'react';
import { BookOpen, Calculator, ClipboardCheck, Play, Sparkles, Target, Wand2, Award } from 'lucide-react';
import { DetectiveCase, LearnerProfile } from '../types';
import { DetectiveAvatar } from './DetectiveAvatar';
import { getRankForStars } from '../data/rewards';
import { SKILL_META } from '../data/curriculum';
import { EXAM_PAPERS } from '../data/exams';
import { computeSkillMastery } from '../utils/storage';

interface Props {
  profile: LearnerProfile;
  allCases: DetectiveCase[];
  onStartCase: (c: DetectiveCase) => void;
  onNavigate: (tab: 'english' | 'math' | 'exams' | 'fugitive' | 'wardrobe' | 'tutor') => void;
}

export const HomeView: React.FC<Props> = ({ profile, allCases, onStartCase, onNavigate }) => {
  const rank = getRankForStars(profile.totalStarsEarned);
  const dailyDone = profile.todayCompletedIds.length;
  const dailyPct = Math.min(100, Math.round((dailyDone / profile.dailyGoal) * 100));
  const atLargeCount = profile.fugitives.filter((f) => f.status === 'at_large').length;

  const mastery = computeSkillMastery(
    profile.attempts,
    SKILL_META.map((s) => ({ id: s.id, subject: s.subject }))
  );

  // 智能推荐下一宗“今日急件”：优先在逃错题 -> 薄弱技能未做题 -> 未做题 -> 随机复习
  const recommendedCase: DetectiveCase = (() => {
    const atLarge = profile.fugitives.find((f) => f.status === 'at_large');
    if (atLarge) {
      const found = allCases.find((c) => c.id === atLarge.caseId);
      if (found) return found;
    }
    const weakest = [...mastery].sort((a, b) => a.masteryScore - b.masteryScore)[0];
    const unsolvedWeak = allCases.find(
      (c) => c.skill === weakest?.skill && !profile.solvedCaseIds.includes(c.id)
    );
    if (unsolvedWeak) return unsolvedWeak;

    const unsolvedAny = allCases.find((c) => !profile.solvedCaseIds.includes(c.id));
    if (unsolvedAny) return unsolvedAny;

    return allCases[profile.attempts.length % allCases.length];
  })();

  const greetingText =
    dailyDone === 0
      ? `嗨，${profile.nickname} 神探！今天事务所收到 ${profile.dailyGoal} 份小急件，只需要 5 分钟，咱们拿放大镜一起去抓陷阱吧！`
      : dailyDone < profile.dailyGoal
      ? `干得漂亮，${profile.nickname}！今天已经破了 ${dailyDone} 宗案子，再破 ${profile.dailyGoal - dailyDone} 宗就能拿今日满分徽章啦！`
      : `太神啦 ${profile.nickname}！今天的 ${profile.dailyGoal} 宗急件全部搞定！想去装备库挑新装备，还是再挑战一关？`;

  const englishSolved = allCases.filter((c) => c.subject === 'english' && profile.solvedCaseIds.includes(c.id)).length;
  const englishTotal = allCases.filter((c) => c.subject === 'english').length;
  const mathSolved = allCases.filter((c) => c.subject === 'math' && profile.solvedCaseIds.includes(c.id)).length;
  const mathTotal = allCases.filter((c) => c.subject === 'math').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Hero 区域：阿探欢迎 + 今日 5 分钟急件 */}
      <div className="hero-grid">
        <div className="card card-warm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <DetectiveAvatar
              mood={dailyDone >= profile.dailyGoal ? 'celebrating' : 'happy'}
              equippedGear={profile.equippedGear}
              size={104}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="pill pill-amber">
                  {rank.current.badge} {rank.current.title}
                </span>
                <span style={{ fontSize: 12, color: '#92400E', fontWeight: 700 }}>
                  累计 {profile.totalStarsEarned} ⭐
                </span>
              </div>
              <div className="speech-bubble">{greetingText}</div>
            </div>
          </div>

          {/* 段位升级进度 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 5 }}>
              <span>{rank.current.tagline}</span>
              <span>
                {rank.next
                  ? `距「${rank.next.title}」还差 ${Math.max(0, rank.next.minStars - profile.totalStarsEarned)} ⭐`
                  : '已达最高传奇段位！'}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${rank.progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* 今日 5 分钟急件卡片 */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(155deg, #FFFBEB, #FEF3C7)',
            borderColor: '#FBBF24',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="pill pill-orange">⚡ 今日 5 分钟急件</span>
              <span style={{ fontWeight: 900, color: '#B45309', fontSize: 15 }}>
                {dailyDone} / {profile.dailyGoal} 宗
              </span>
            </div>
            <div className="progress-track" style={{ marginBottom: 12 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${dailyPct}%`,
                  background: 'linear-gradient(90deg, #34D399, #10B981)',
                }}
              />
            </div>
            <div style={{ fontSize: 13, color: '#78350F', fontWeight: 700 }}>
              下一宗推荐案件：
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>
              {recommendedCase.title}
            </div>
            <div style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>
              {recommendedCase.textbookRef} · 抓捕「{recommendedCase.suspectName}」
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={() => onStartCase(recommendedCase)}>
            <Play size={18} fill="currentColor" /> 立即出发破案！
          </button>
        </div>
      </div>

      {/* 四大功能板块 */}
      <div className="portal-grid">
        <button className="portal-card english" onClick={() => onNavigate('english')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1E3A8A' }}>英语语法探案馆</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>沪教牛津深圳版 4A / 4B</div>
              </div>
            </div>
            <span className="pill pill-blue">{englishSolved}/{englishTotal} 破案</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#1E40AF', fontWeight: 600 }}>
            用放大镜扫出三单、There be、现在进行时线索，专治粗心漏看词，还能抓语法小偷！
          </p>
        </button>

        <button className="portal-card math" onClick={() => onNavigate('math')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#064E3B' }}>数学逻辑实验室</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>北师大版 4上 / 4下</div>
              </div>
            </div>
            <span className="pill pill-green">{mathSolved}/{mathTotal} 破案</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#065F46', fontWeight: 600 }}>
            线段图、魔法方程天平、积木分配律、小数格子本！把抽象大难题切成超简单小步！
          </p>
        </button>

        <button className="portal-card fugitive" onClick={() => onNavigate('fugitive')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#7C2D12' }}>在逃嫌疑人档案</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#EA580C' }}>把错题变成“抓捕悬赏”</div>
              </div>
            </div>
            <span className="pill pill-orange">
              {atLargeCount > 0 ? `${atLargeCount} 个待抓捕` : '全部清零 🎉'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#9A3412', fontWeight: 600 }}>
            曾经中招的小陷阱都藏在这里！再次挑战成功即可盖上「已归案」红章，超有成就感！
          </p>
        </button>

        <button className="portal-card tutor" onClick={() => onNavigate('tutor')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#8B5CF6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wand2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#4C1D95' }}>阿探解惑实验室</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED' }}>分步引导 · 作业克星</div>
              </div>
            </div>
            <span className="pill pill-purple">
              {profile.geminiApiKey ? '✨ AI 导师已就绪' : '🧭 本地引导模式'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#5B21B6', fontWeight: 600 }}>
            平时作业有看不懂的题？发给阿探，用四年级听得懂的比喻一步步带你讲通，还能定制新关卡！
          </p>
        </button>
      </div>

      {/* 模拟试卷中心横幅 */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          background: 'linear-gradient(90deg, #FEF3C7, #FFEDD5)',
          borderColor: '#F59E0B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#78350F' }}>
              📝 神探模拟考场（{EXAM_PAPERS.length} 套深圳四年级专题 & 综合试卷）
            </div>
            <div style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
              包含四上/四下英语卷、数学卷、防粗心特训卷与 10 题综合认证大卷，无压倒计时，考完发奖状！
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('exams')}>
          领取试卷开考 →
        </button>
      </div>

      {/* 装备库快捷横幅 */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          background: 'linear-gradient(90deg, #FFFFFF, #FEF9C3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            <Award size={24} color="#D97706" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>神探装备库（当前拥有 {profile.stars} ⭐）</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              用破案赢得的星星给阿探换上防粗心护目镜、黄金放大镜和星辰披风！
            </div>
          </div>
        </div>
        <button className="btn-soft" onClick={() => onNavigate('wardrobe')}>
          <Sparkles size={16} /> 去换装打扮
        </button>
      </div>
    </div>
  );
};
