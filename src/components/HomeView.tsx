import React from 'react';
import { Award, BookOpen, Calculator, ClipboardCheck, Compass, Crown, Play, Sparkles, Swords, Target, Wand2 } from 'lucide-react';
import { DetectiveCase, LearnerProfile } from '../types';
import { DetectiveAvatar } from './DetectiveAvatar';
import { getRankForStars } from '../data/rewards';
import { ADVENTURE_CHAPTERS, KNOWLEDGE_CARDS, getLevelFromXp } from '../data/rpgData';
import { SKILL_META } from '../data/curriculum';
import { EXAM_PAPERS } from '../data/exams';
import { getSeasonTierInfo } from '../data/seasonData';
import { computeSkillMastery } from '../utils/storage';

interface Props {
  profile: LearnerProfile;
  allCases: DetectiveCase[];
  onStartCase: (c: DetectiveCase) => void;
  onNavigate: (tab: 'season' | 'map' | 'english' | 'math' | 'exams' | 'fugitive' | 'wardrobe' | 'tutor') => void;
}

export const HomeView: React.FC<Props> = ({ profile, allCases, onStartCase, onNavigate }) => {
  const rank = getRankForStars(profile.totalStarsEarned);
  const lvl = getLevelFromXp(profile.xp || 0);
  const dailyDone = profile.todayCompletedIds.length;
  const dailyPct = Math.min(100, Math.round((dailyDone / profile.dailyGoal) * 100));
  const atLargeCount = profile.fugitives.filter((f) => f.status === 'at_large').length;
  const bossDefeated = (profile.defeatedBossIds || []).length;
  const cardsOwned = (profile.collectedCardIds || []).length;
  const seasonInfo = getSeasonTierInfo(profile.seasonPoints || 0);

  const mastery = computeSkillMastery(
    profile.attempts,
    SKILL_META.map((s) => ({ id: s.id, subject: s.subject }))
  );

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
      ? `嗨，${profile.nickname} 神探！今天事务所收到 ${profile.dailyGoal} 份小急件，或者去深圳智慧岛打大 Boss 赢宝箱狗粮吧！`
      : dailyDone < profile.dailyGoal
      ? `太棒啦，${profile.nickname}！今天已破 ${dailyDone} 宗案子，再破 ${profile.dailyGoal - dailyDone} 宗就能拿今日满分徽章！`
      : `神探无敌！今日急件全部搞定！要不要去模拟考场刷一套 12~20 题大卷，或者去喂养阿探、抽口诀卡牌？`;

  const englishSolved = allCases.filter((c) => c.subject === 'english' && profile.solvedCaseIds.includes(c.id)).length;
  const englishTotal = allCases.filter((c) => c.subject === 'english').length;
  const mathSolved = allCases.filter((c) => c.subject === 'math' && profile.solvedCaseIds.includes(c.id)).length;
  const mathTotal = allCases.filter((c) => c.subject === 'math').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero 区域 */}
      <div className="hero-grid">
        <div className="card card-warm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <DetectiveAvatar
              mood={dailyDone >= profile.dailyGoal ? 'celebrating' : 'happy'}
              skinId={profile.equippedSkinId}
              equippedGear={profile.equippedGear}
              size={104}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="pill pill-purple">Lv.{lvl.level}</span>
                <span className="pill pill-amber">
                  {rank.current.badge} {rank.current.title}
                </span>
                <span className="pill pill-orange">🦴 {profile.treats || 0} 狗粮</span>
              </div>
              <div className="speech-bubble">{greetingText}</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 5 }}>
              <span>⚡ 神探经验 Lv.{lvl.level} ({lvl.currentXp}/{lvl.neededXp} XP)</span>
              <span>🃏 图鉴 {cardsOwned}/{KNOWLEDGE_CARDS.length} · 🐉 Boss {bossDefeated}/{ADVENTURE_CHAPTERS.length}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${lvl.pct}%` }} />
            </div>
          </div>
        </div>

        {/* 今日 5 分钟急件 */}
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
            <div style={{ fontSize: 12, color: '#78350F', fontWeight: 700 }}>智能弱项推荐：</div>
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

      {/* S1 赛季通行证高亮横幅 */}
      <button
        className="card"
        onClick={() => onNavigate('season')}
        style={{
          textAlign: 'left',
          background: 'linear-gradient(115deg, #1E1B4B, #312E81 55%, #0E7490)',
          borderColor: '#38BDF8',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #FACC15, #F59E0B)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Crown size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 900, fontSize: 17 }}>🏆 S1 赛季通行证 · 智慧星辰季</span>
              <span className="pill" style={{ background: '#FACC15', color: '#713F12' }}>
                Lv.{seasonInfo.currentTier} / 20
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#BAE6FD', fontWeight: 600, marginTop: 3 }}>
              完成每日悬赏领限定皮肤【👨‍🚀太空宇航员 / 🐉烈焰龙骑士 / 🤖星际机甲】、神秘盲盒与强力道具！
            </div>
          </div>
        </div>
        <span className="btn-primary" style={{ padding: '9px 16px', fontSize: 14 }}>
          进入领大奖 →
        </span>
      </button>

      {/* 两大王牌深玩入口：RPG 冒险大地图 + 16 套完整模拟试卷 */}
      <div className="portal-grid" style={{ marginBottom: 2 }}>
        <button
          className="portal-card"
          style={{
            background: 'linear-gradient(135deg, #FFF1F2, #FEF3C7)',
            borderColor: '#FB7185',
          }}
          onClick={() => onNavigate('map')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E11D48', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#881337' }}>神探冒险地图 · 打 Boss</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#BE123C' }}>6 大深圳智慧岛 · 破盾连击开宝箱</div>
              </div>
            </div>
            <span className="pill pill-orange">
              <Swords size={12} /> {bossDefeated}/{ADVENTURE_CHAPTERS.length}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#9F1239', fontWeight: 600 }}>
            用放大镜打破 Boss 护盾，发动激光斩击败 6 位粗心大魔王，狂拿星星、狗粮和 SSR 口诀神卡！
          </p>
        </button>

        <button
          className="portal-card"
          style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FFEDD5)',
            borderColor: '#F59E0B',
          }}
          onClick={() => onNavigate('exams')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#78350F' }}>神探模拟考场（16 套卷）</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>每卷 12~20 题 · 支持无限换新变式卷</div>
              </div>
            </div>
            <span className="pill pill-amber">已考 {(profile.examHistory || []).length} 次</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#92400E', fontWeight: 600 }}>
            四上/四下期中期末卷、防粗心专卷与 20 题终极大联考！带答题卡、电子草稿纸和考前检查提醒！
          </p>
        </button>
      </div>

      {/* 四大专题馆 */}
      <div className="portal-grid">
        <button className="portal-card english" onClick={() => onNavigate('english')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1E3A8A' }}>英语语法探案馆</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>沪教牛津深圳版 4A/4B · {englishTotal} 宗精选案</div>
              </div>
            </div>
            <span className="pill pill-blue">{englishSolved}/{englishTotal}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#1E40AF', fontWeight: 600 }}>
            覆盖三单、does照妖镜、感官动词、There be、进行时双写、时间介词与抓语法小偷改错！
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
                <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>北师大版 4上/4下 · {mathTotal} 宗图解案</div>
              </div>
            </div>
            <span className="pill pill-green">{mathSolved}/{mathTotal}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#065F46', fontWeight: 600 }}>
            动态线段图、魔法天平、分配律积木、电子草稿纸！覆盖大数、相遇、和差倍、鸡兔同笼与方程！
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
                <div style={{ fontSize: 12, fontWeight: 700, color: '#EA580C' }}>把错题变成“复仇抓捕悬赏”</div>
              </div>
            </div>
            <span className="pill pill-orange">
              {atLargeCount > 0 ? `${atLargeCount} 个待抓捕` : '全部清零 🎉'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#9A3412', fontWeight: 600 }}>
            做题或模考中错过的陷阱会自动收进这里，再次一次破案即可亲手盖上「已归案」红章！
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
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED' }}>苏格拉底讲题 · 按弱项无限出新案</div>
              </div>
            </div>
            <span className="pill pill-purple">
              {profile.geminiApiKey ? '✨ AI 识图就绪' : '🧭 本地引导'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#5B21B6', fontWeight: 600 }}>
            平时作业卡壳直接问阿探（支持拍题），一步步启发听懂，还能按最弱项一键生成专属新关卡！
          </p>
        </button>
      </div>

      {/* 基地快捷横幅 */}
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
          <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} color="#D97706" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              神探基地：换装 · 喂养阿探 · 口诀卡牌图鉴（{cardsOwned}/{KNOWLEDGE_CARDS.length}）· 成就领奖
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              当前拥有 {profile.stars} ⭐ 与 {profile.treats || 0} 块智慧狗粮，还有 {EXAM_PAPERS.length} 套完整模拟卷等你刷新纪录！
            </div>
          </div>
        </div>
        <button className="btn-soft" onClick={() => onNavigate('wardrobe')}>
          <Sparkles size={16} /> 进入神探基地
        </button>
      </div>
    </div>
  );
};
