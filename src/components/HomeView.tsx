import React from 'react';
import { Award, BookOpen, Calculator, ClipboardCheck, Compass, Crown, Gift, Play, Sparkles, Swords, Target, Wand2 } from 'lucide-react';
import { DetectiveCase, LearnerProfile } from '../types';
import { DetectiveAvatar } from './DetectiveAvatar';
import { getRankForStars } from '../data/rewards';
import { ADVENTURE_CHAPTERS, KNOWLEDGE_CARDS, getLevelFromXp } from '../data/rpgData';
import { SKILL_META } from '../data/curriculum';
import { EXAM_PAPERS } from '../data/exams';
import { getSeasonTierInfo, getTotalBoxesInInventory } from '../data/seasonData';
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
  const totalBoxes = getTotalBoxesInInventory(profile.inventory);

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
      ? `欢迎回到庇护所，${profile.nickname}！今日有 ${profile.dailyGoal} 份悬赏猎杀任务，斩杀小怪和世界 BOSS 可爆出 4 档暗黑盲盒与皮肤碎片！`
      : dailyDone < profile.dailyGoal
      ? `战况大捷，${profile.nickname}！今天已斩杀 ${dailyDone} 只怪物，再斩 ${profile.dailyGoal - dailyDone} 只就能达成今日猎魔目标！`
      : `传奇猎魔人！今日悬赏已全部横扫！去挑战 20 套地下城试炼卷、讨伐世界 BOSS，或者去拆暗黑盲盒合成皮肤吧！`;

  const englishSolved = allCases.filter((c) => c.subject === 'english' && profile.solvedCaseIds.includes(c.id)).length;
  const englishTotal = allCases.filter((c) => c.subject === 'english').length;
  const mathSolved = allCases.filter((c) => c.subject === 'math' && profile.solvedCaseIds.includes(c.id)).length;
  const mathTotal = allCases.filter((c) => c.subject === 'math').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero 区域：暗黑庇护所英雄台 + 今日悬赏怪物 */}
      <div className="hero-grid">
        <div className="card card-warm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <DetectiveAvatar
                mood={dailyDone >= profile.dailyGoal ? 'celebrating' : 'happy'}
                skinId={profile.equippedSkinId}
                equippedGear={profile.equippedGear}
                size={112}
              />
              <button
                type="button"
                className="btn-soft"
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => onNavigate('wardrobe')}
              >
                🎨 换皮肤 / 拆盲盒
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="pill pill-purple">Lv.{lvl.level}</span>
                <span className="pill pill-amber">{rank.current.badge} {rank.current.title}</span>
                <span className="pill pill-blue">🧩 {profile.skinShards || 0} 碎片</span>
              </div>
              <div className="speech-bubble">{greetingText}</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#FDE68A', marginBottom: 5 }}>
              <span>⚡ 英雄经验 Lv.{lvl.level} ({lvl.currentXp}/{lvl.neededXp} XP)</span>
              <span>🃏 符文 {cardsOwned}/{KNOWLEDGE_CARDS.length} · 🐉 BOSS {bossDefeated}/{ADVENTURE_CHAPTERS.length}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${lvl.pct}%` }} />
            </div>
          </div>
        </div>

        {/* 今日悬赏猎杀卡片 */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(155deg, #2A1419, #17111C)',
            borderColor: '#DC2626',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="pill pill-orange">⚔️ 今日庇护所悬赏</span>
              <span style={{ fontWeight: 900, color: '#FDE047', fontSize: 15 }}>
                {dailyDone} / {profile.dailyGoal} 斩杀
              </span>
            </div>
            <div className="progress-track" style={{ marginBottom: 12 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${dailyPct}%`,
                  background: 'linear-gradient(90deg, #10B981, #34D399)',
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 700 }}>
              下一个悬赏目标（{recommendedCase.difficulty * 100} HP）：
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#FDE68A', marginTop: 2 }}>
              {recommendedCase.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
              {recommendedCase.textbookRef} · 怪物：{recommendedCase.suspectName}
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={() => onStartCase(recommendedCase)}>
            <Swords size={18} /> 拔剑出战斩杀！
          </button>
        </div>
      </div>

      {/* S1 赛季通行证高亮横幅 */}
      <button
        className="card"
        onClick={() => onNavigate('season')}
        style={{
          textAlign: 'left',
          background: 'linear-gradient(115deg, #26143D, #1B1733 55%, #0D3342)',
          borderColor: '#F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          padding: '15px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg, #FACC15, #D97706)', color: '#1C1008', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Crown size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 900, fontSize: 17, color: '#FDE047' }}>🏆 S1 暗黑赛季通行证 · 智慧星辰季</span>
              <span className="pill pill-amber">Lv.{seasonInfo.currentTier} / 20</span>
            </div>
            <div style={{ fontSize: 13, color: '#BAE6FD', fontWeight: 600, marginTop: 3 }}>
              20 级双轨狂送青铜/白银/黄金/神话盲盒与终极神话皮肤【🤖 星际机甲阿探】！
            </div>
          </div>
        </div>
        <span className="btn-primary" style={{ padding: '9px 16px', fontSize: 14 }}>
          进入领战利品 →
        </span>
      </button>

      {/* 两大王牌深玩入口：地下城世界 BOSS + 20 套完整试炼卷 */}
      <div className="portal-grid" style={{ marginBottom: 0 }}>
        <button
          className="portal-card"
          style={{
            background: 'linear-gradient(135deg, #2F1118, #190D16)',
            borderColor: '#DC2626',
          }}
          onClick={() => onNavigate('map')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#DC2626', color: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#FCA5A5' }}>庇护所地牢 · 世界 BOSS</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FDE047' }}>6 大地下城 · 400~800 HP 首领讨伐</div>
              </div>
            </div>
            <span className="pill pill-orange">
              <Swords size={12} /> {bossDefeated}/{ADVENTURE_CHAPTERS.length}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#D6C7B2', fontWeight: 600 }}>
            破盾暴击 -150 HP！讨伐世界 BOSS 必掉白银/黄金/神话盲盒与稀有符文卡！
          </p>
        </button>

        <button
          className="portal-card"
          style={{
            background: 'linear-gradient(135deg, #2D1F0D, #18130E)',
            borderColor: '#D97706',
          }}
          onClick={() => onNavigate('exams')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#D97706', color: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#FDE68A' }}>秘境试炼考场（{EXAM_PAPERS.length} 套卷）</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FDBA74' }}>每卷 12~20 题 · 交卷必掉暗黑盲盒！</div>
              </div>
            </div>
            <span className="pill pill-amber">已考 {(profile.examHistory || []).length} 次</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#D6C7B2', fontWeight: 600 }}>
            20 套深圳四年级期中期末/压轴大卷 + 无限换新变式卷！自带电子草稿纸和考前复查提醒！
          </p>
        </button>
      </div>

      {/* 四大刷怪与解惑地牢 */}
      <div className="portal-grid">
        <button className="portal-card english" onClick={() => onNavigate('english')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 17.5, fontWeight: 900, color: '#93C5FD' }}>英语语法魔窟</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#BFDBFE' }}>沪教牛津深圳版 4A/4B · {englishTotal} 只怪</div>
              </div>
            </div>
            <span className="pill pill-blue">{englishSolved}/{englishTotal}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#CBD5E1', fontWeight: 600 }}>
            每道语法题都是带血条的小怪与精英！覆盖三单、照妖镜、There be、进行时、代词与全真改错！
          </p>
        </button>

        <button className="portal-card math" onClick={() => onNavigate('math')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={22} />
              </div>
              <div>
                <div style={{ fontSize: 17.5, fontWeight: 900, color: '#6EE7B7' }}>数学逻辑地牢</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#A7F3D0' }}>北师大版 4上/4下 · {mathTotal} 只怪</div>
              </div>
            </div>
            <span className="pill pill-green">{mathSolved}/{mathTotal}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#CBD5E1', fontWeight: 600 }}>
            动态线段图、魔法天平、钟表角、鸡兔同笼与蜗牛爬井！多段连招打爆 300 HP 暗金首领！
          </p>
        </button>

        <button className="portal-card fugitive" onClick={() => onNavigate('fugitive')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EA580C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={22} />
              </div>
              <div>
                <div style={{ fontSize: 17.5, fontWeight: 900, color: '#FDBA74' }}>复仇通缉榜（错题怪）</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FED7AA' }}>曾经溜走的错题怪都在这里</div>
              </div>
            </div>
            <span className="pill pill-orange">
              {atLargeCount > 0 ? `${atLargeCount} 只在逃` : '全境肃清 🎉'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#D6C7B2', fontWeight: 600 }}>
            战斗和模考中错过的陷阱怪会自动登榜，再次一击必杀即可彻底净化并领复仇星！
          </p>
        </button>

        <button className="portal-card tutor" onClick={() => onNavigate('tutor')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wand2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: 17.5, fontWeight: 900, color: '#D8B4FE' }}>圣光祭坛 · 问阿探</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#E9D5FF' }}>苏格拉底讲题 · 召唤弱项新怪</div>
              </div>
            </div>
            <span className="pill pill-purple">
              {profile.geminiApiKey ? '✨ AI 识图就绪' : '🧭 本地引导'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#D6C7B2', fontWeight: 600 }}>
            作业卡壳直接问阿探，一步步拆解听懂，还能按最弱知识点召唤全新精英怪实战演练！
          </p>
        </button>
      </div>

      {/* 盲盒宝库快捷横幅 */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.2)', border: '1.5px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gift size={23} color="#FDE047" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#FDE68A' }}>
              暗黑宝库：4 档盲盒（待拆 {totalBoxes} 个）· 🧩 {profile.skinShards || 0} 皮肤碎片 · 8 款酷炫皮肤
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              攒星星或用盲盒爆出的万能碎片保底合成酷炫皮肤，还能给阿探叠戴 16 件传奇装备！
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('wardrobe')}>
          <Sparkles size={15} /> 进入暗黑宝库
        </button>
      </div>
    </div>
  );
};
