import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Compass,
  Crown,
  Flame,
  Home,
  Settings,
  Star,
  Target,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import {
  AdventureChapter,
  DetectiveCase,
  EquipmentItem,
  ExamPaper,
  ExamRecord,
  LearnerProfile,
  PropItemId,
  SeasonReward,
  SkinDef,
  SkinId,
} from './types';
import { BUILTIN_CASES } from './data/curriculum';
import { ACHIEVEMENTS, getLevelFromXp } from './data/rpgData';
import { DAILY_SEASON_QUESTS, SEASON_TIERS } from './data/seasonData';
import { createDefaultProfile, loadProfile, recordCaseCompletion, saveProfile } from './utils/storage';
import { sound } from './utils/sound';
import { HomeView } from './components/HomeView';
import { CaseListView } from './components/CaseListView';
import { CasePlayView } from './components/CasePlayView';
import { FugitiveView } from './components/FugitiveView';
import { WardrobeView } from './components/WardrobeView';
import { AiTutorView } from './components/AiTutorView';
import { ExamView } from './components/ExamView';
import { AdventureMapView } from './components/AdventureMapView';
import { SeasonPassView } from './components/SeasonPassView';
import { ParentDashboard } from './components/ParentDashboard';

type Tab = 'home' | 'season' | 'map' | 'exams' | 'english' | 'math' | 'fugitive' | 'wardrobe' | 'tutor' | 'parent';

export function App() {
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile());
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeCase, setActiveCase] = useState<DetectiveCase | null>(null);

  useEffect(() => {
    sound.enabled = profile.soundEnabled;
    saveProfile(profile);
  }, [profile]);

  const allCases = useMemo(
    () => [...profile.customCases, ...BUILTIN_CASES],
    [profile.customCases]
  );

  const atLargeCount = useMemo(
    () => profile.fugitives.filter((f) => f.status === 'at_large').length,
    [profile.fugitives]
  );

  const claimableAchCount = useMemo(() => {
    const claimed = new Set(profile.claimedAchievementIds || []);
    return ACHIEVEMENTS.filter((a) => a.check(profile) && !claimed.has(a.id)).length;
  }, [profile]);

  const claimableSeasonCount = useMemo(() => {
    const sp = profile.seasonPoints || 0;
    const cf = new Set(profile.claimedFreeTiers || []);
    const ce = new Set(profile.claimedEliteTiers || []);
    let count = 0;
    SEASON_TIERS.forEach((t) => {
      if (sp >= t.requiredSp) {
        if (!cf.has(t.tier)) count += 1;
        if (profile.seasonEliteUnlocked && !ce.has(t.tier)) count += 1;
      }
    });
    const cq = new Set(profile.claimedDailyQuestIds || []);
    const dqp = profile.dailyQuestProgress || {
      casesSolved: 0, englishSolved: 0, mathSolved: 0, cluesAllFound: 0, examsDone: 0, bossHits: 0,
    };
    DAILY_SEASON_QUESTS.forEach((q) => {
      if (!cq.has(q.id) && q.getCurrent(dqp) >= q.target) count += 1;
    });
    return count;
  }, [profile]);

  const lvl = getLevelFromXp(profile.xp || 0);

  const handleToggleSound = () => {
    setProfile((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleCaseComplete = (
    detectiveCase: DetectiveCase,
    stats: {
      wrongAttempts: number;
      hintsUsed: number;
      cluesFoundBeforeAnswer: boolean;
      durationSec: number;
      bonusStars: number;
      doubleStarsActive?: boolean;
      luckyCloverActive?: boolean;
    }
  ) => {
    const res = recordCaseCompletion(profile, detectiveCase, stats);
    setProfile(res.updated);
    return {
      earnedStars: res.earnedStars,
      earnedXp: res.earnedXp,
      earnedSp: res.earnedSp,
      newCombo: res.newCombo,
      unlockedCardId: res.unlockedCardId,
    };
  };

  const handleNextCase = () => {
    if (!activeCase) return;
    const sameSubjectUnsolved = allCases.filter(
      (c) =>
        c.subject === activeCase.subject &&
        c.id !== activeCase.id &&
        !profile.solvedCaseIds.includes(c.id)
    );
    const pool =
      sameSubjectUnsolved.length > 0
        ? sameSubjectUnsolved
        : allCases.filter((c) => c.id !== activeCase.id);
    if (pool.length > 0) {
      setActiveCase(pool[0]);
    } else {
      setActiveCase(null);
    }
  };

  const handleUnlockGear = (item: EquipmentItem) => {
    setProfile((prev) => {
      if (prev.stars < item.cost || prev.unlockedGearIds.includes(item.id)) return prev;
      return {
        ...prev,
        stars: prev.stars - item.cost,
        unlockedGearIds: [...prev.unlockedGearIds, item.id],
        equippedGear: { ...prev.equippedGear, [item.slot]: item.id },
      };
    });
  };

  const handleEquipGear = (item: EquipmentItem) => {
    setProfile((prev) => {
      const currentlyEquipped = prev.equippedGear[item.slot] === item.id;
      const nextGear = { ...prev.equippedGear };
      if (currentlyEquipped) {
        delete nextGear[item.slot];
      } else {
        nextGear[item.slot] = item.id;
      }
      return { ...prev, equippedGear: nextGear };
    });
  };

  const handleUnlockSkin = (skin: SkinDef) => {
    setProfile((prev) => {
      if (prev.stars < skin.cost || (prev.unlockedSkinIds || []).includes(skin.id)) return prev;
      return {
        ...prev,
        stars: prev.stars - skin.cost,
        unlockedSkinIds: [...(prev.unlockedSkinIds || ['skin_classic']), skin.id],
        equippedSkinId: skin.id,
      };
    });
  };

  const handleEquipSkin = (skinId: SkinId) => {
    setProfile((prev) => ({ ...prev, equippedSkinId: skinId }));
  };

  const handleBuyProp = (propId: PropItemId, cost: number) => {
    setProfile((prev) => {
      if (prev.stars < cost) return prev;
      const cur = prev.inventory?.[propId] || 0;
      return {
        ...prev,
        stars: prev.stars - cost,
        inventory: { ...(prev.inventory || {}), [propId]: cur + 1 },
      };
    });
  };

  const handleConsumeProp = (propId: PropItemId) => {
    setProfile((prev) => {
      const cur = prev.inventory?.[propId] || 0;
      if (cur <= 0) return prev;
      return {
        ...prev,
        inventory: { ...(prev.inventory || {}), [propId]: cur - 1 },
      };
    });
  };

  const handleOpenMysteryBox = (): string => {
    // 丰厚且绝对不会“谢谢惠顾”的盲盒奖励池！
    const roll = Math.random();
    let msg = '';
    setProfile((prev) => {
      const curBox = prev.inventory?.item_mystery_box || 0;
      if (curBox <= 0) return prev;
      const inv = { ...(prev.inventory || {}), item_mystery_box: curBox - 1 };

      if (roll < 0.25) {
        const bonus = 55 + Math.floor(Math.random() * 35);
        msg = `欧皇金星大爆发！获得 ⭐ +${bonus} 侦探星 + 🦴 2 块狗粮！`;
        return {
          ...prev,
          stars: prev.stars + bonus,
          totalStarsEarned: prev.totalStarsEarned + bonus,
          treats: (prev.treats || 0) + 2,
          inventory: inv,
        };
      } else if (roll < 0.52) {
        inv.item_scanner = (inv.item_scanner || 0) + 2;
        inv.item_fifty = (inv.item_fifty || 0) + 1;
        msg = '神探工具大礼包！获得 🔦 透视扫描仪 ×2 + ✂️ 50/50剪刀 ×1！';
        return { ...prev, inventory: inv };
      } else if (roll < 0.78) {
        inv.item_double_star = (inv.item_double_star || 0) + 2;
        inv.item_boss_bomb = (inv.item_boss_bomb || 0) + 1;
        msg = '战力拉满！获得 🧪 双倍星星药水 ×2 + 💣 Boss 暴击弹 ×1！';
        return { ...prev, inventory: inv };
      } else {
        inv.item_lucky_clover = (inv.item_lucky_clover || 0) + 2;
        msg = '超级幸运星！获得 ⭐ +45 侦探星 + 🏆 +40 赛季点数 + 🍀 幸运草 ×2！';
        return {
          ...prev,
          stars: prev.stars + 45,
          totalStarsEarned: prev.totalStarsEarned + 45,
          seasonPoints: (prev.seasonPoints || 0) + 40,
          inventory: inv,
        };
      }
    });
    return msg || '获得神秘幸运大礼包！';
  };

  const handleUnlockElitePass = () => {
    setProfile((prev) => ({ ...prev, seasonEliteUnlocked: true }));
  };

  const handleClaimTierReward = (tier: number, track: 'free' | 'elite', reward: SeasonReward) => {
    setProfile((prev) => {
      const cf = prev.claimedFreeTiers || [];
      const ce = prev.claimedEliteTiers || [];
      if (track === 'free' && cf.includes(tier)) return prev;
      if (track === 'elite' && ce.includes(tier)) return prev;

      const next: LearnerProfile = {
        ...prev,
        claimedFreeTiers: track === 'free' ? [...cf, tier] : cf,
        claimedEliteTiers: track === 'elite' ? [...ce, tier] : ce,
        inventory: { ...(prev.inventory || {}) },
        unlockedGearIds: [...prev.unlockedGearIds],
        unlockedSkinIds: [...(prev.unlockedSkinIds || ['skin_classic'])],
      };

      if (reward.kind === 'stars') {
        const amt = reward.amount || 30;
        next.stars += amt;
        next.totalStarsEarned += amt;
      } else if (reward.kind === 'treats') {
        next.treats = (next.treats || 0) + (reward.amount || 2);
      } else if (reward.kind === 'prop' && reward.itemId) {
        const pid = reward.itemId as PropItemId;
        next.inventory[pid] = (next.inventory[pid] || 0) + (reward.amount || 1);
      } else if (reward.kind === 'skin' && reward.itemId) {
        const sid = reward.itemId as SkinId;
        if (!next.unlockedSkinIds.includes(sid)) next.unlockedSkinIds.push(sid);
        next.equippedSkinId = sid;
      } else if (reward.kind === 'gear' && reward.itemId) {
        if (!next.unlockedGearIds.includes(reward.itemId)) next.unlockedGearIds.push(reward.itemId);
      }
      return next;
    });
  };

  const handleClaimDailyQuest = (questId: string, rewardSp: number, rewardStars: number) => {
    setProfile((prev) => {
      const cq = prev.claimedDailyQuestIds || [];
      if (cq.includes(questId)) return prev;
      return {
        ...prev,
        seasonPoints: (prev.seasonPoints || 0) + rewardSp,
        stars: prev.stars + rewardStars,
        totalStarsEarned: prev.totalStarsEarned + rewardStars,
        claimedDailyQuestIds: [...cq, questId],
      };
    });
  };

  const handleFeedPet = () => {
    setProfile((prev) => {
      if ((prev.treats || 0) <= 0) return prev;
      return {
        ...prev,
        treats: prev.treats - 1,
        bondPoints: (prev.bondPoints || 0) + 15,
        xp: (prev.xp || 0) + 20,
      };
    });
  };

  const handleClaimAchievement = (achId: string, rewardStars: number) => {
    setProfile((prev) => {
      if ((prev.claimedAchievementIds || []).includes(achId)) return prev;
      return {
        ...prev,
        stars: prev.stars + rewardStars,
        totalStarsEarned: prev.totalStarsEarned + rewardStars,
        claimedAchievementIds: [...(prev.claimedAchievementIds || []), achId],
      };
    });
  };

  const handleDefeatBoss = (chap: AdventureChapter) => {
    setProfile((prev) => {
      const defeatedBossIds = (prev.defeatedBossIds || []).includes(chap.id)
        ? prev.defeatedBossIds
        : [...(prev.defeatedBossIds || []), chap.id];
      const collectedCardIds = (prev.collectedCardIds || []).includes(chap.unlockCardId)
        ? prev.collectedCardIds
        : [...(prev.collectedCardIds || []), chap.unlockCardId];
      const dqp = prev.dailyQuestProgress || {
        casesSolved: 0, englishSolved: 0, mathSolved: 0, cluesAllFound: 0, examsDone: 0, bossHits: 0,
      };
      return {
        ...prev,
        stars: prev.stars + chap.chestStars,
        totalStarsEarned: prev.totalStarsEarned + chap.chestStars,
        treats: (prev.treats || 0) + chap.chestTreats,
        xp: (prev.xp || 0) + 100,
        seasonPoints: (prev.seasonPoints || 0) + 100,
        dailyQuestProgress: { ...dqp, bossHits: dqp.bossHits + 1 },
        defeatedBossIds,
        collectedCardIds,
      };
    });
  };

  const handleAddCustomCase = (newCase: DetectiveCase) => {
    setProfile((prev) => ({
      ...prev,
      customCases: [newCase, ...prev.customCases].slice(0, 30),
    }));
  };

  const handleFinishExam = ({
    record,
    missedCases,
    earnedStars,
    earnedTreats,
  }: {
    paper: ExamPaper;
    record: ExamRecord;
    missedCases: DetectiveCase[];
    earnedStars: number;
    earnedTreats: number;
  }) => {
    setProfile((prev) => {
      const nextFugitives = [...prev.fugitives];
      missedCases.forEach((mc) => {
        const idx = nextFugitives.findIndex((f) => f.caseId === mc.id);
        if (idx >= 0) {
          nextFugitives[idx] = { ...nextFugitives[idx], status: 'at_large', addedAt: Date.now() };
        } else {
          nextFugitives.unshift({
            caseId: mc.id,
            suspectName: mc.suspectName,
            skill: mc.skill,
            subject: mc.subject,
            cause: 'concept',
            addedAt: Date.now(),
            capturedCount: 0,
            status: 'at_large',
          });
        }
      });

      const dqp = prev.dailyQuestProgress || {
        casesSolved: 0, englishSolved: 0, mathSolved: 0, cluesAllFound: 0, examsDone: 0, bossHits: 0,
      };

      return {
        ...prev,
        stars: prev.stars + earnedStars,
        totalStarsEarned: prev.totalStarsEarned + earnedStars,
        treats: (prev.treats || 0) + earnedTreats,
        xp: (prev.xp || 0) + 80,
        seasonPoints: (prev.seasonPoints || 0) + 80,
        dailyQuestProgress: { ...dqp, examsDone: dqp.examsDone + 1 },
        fugitives: nextFugitives,
        examHistory: [record, ...(prev.examHistory || [])].slice(0, 60),
      };
    });
  };

  return (
    <div className="app-shell">
      {/* 顶部栏 */}
      <header className="top-bar">
        <button
          className="brand-pill"
          onClick={() => {
            setActiveCase(null);
            setActiveTab('home');
          }}
        >
          <div className="brand-logo">🕵️</div>
          <div>
            <div className="brand-title">神探星途</div>
            <div className="brand-sub">深圳四年级智慧探案学院</div>
          </div>
        </button>

        <div className="top-stats">
          <div className="stat-chip" style={{ background: '#EDE9FE', color: '#6D28D9', borderColor: '#C4B5FD' }}>
            Lv.{lvl.level}
          </div>
          <div className="stat-chip star" title="当前可用侦探星">
            <Star size={16} fill="#F59E0B" color="#D97706" />
            <span>{profile.stars}</span>
          </div>
          <div className="stat-chip streak" title="连续探案天数 / 连击">
            <Flame size={16} fill="#FB923C" color="#EA580C" />
            <span>{profile.currentCombo >= 2 ? `${profile.currentCombo}连击` : `${profile.streakDays}天`}</span>
          </div>
          <button
            className="icon-btn"
            onClick={() => {
              setActiveCase(null);
              setActiveTab('fugitive');
            }}
            title="在逃错题抓捕档案"
            style={{ position: 'relative' }}
          >
            <Target size={18} />
            {atLargeCount > 0 && (
              <span className="badge-dot" style={{ top: -5, right: -5 }}>{atLargeCount}</span>
            )}
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              setActiveCase(null);
              setActiveTab('tutor');
            }}
            title="问阿探（AI 苏格拉底讲题）"
          >
            <Wand2 size={18} />
          </button>
          <button
            className="icon-btn"
            onClick={handleToggleSound}
            title={profile.soundEnabled ? '关闭音效' : '开启音效'}
          >
            {profile.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              setActiveCase(null);
              setActiveTab('parent');
            }}
            title="家长洞察控制台"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* 主内容区域 */}
      <main>
        {activeCase ? (
          <CasePlayView
            key={activeCase.id}
            detectiveCase={activeCase}
            nickname={profile.nickname}
            equippedGear={profile.equippedGear}
            skinId={profile.equippedSkinId}
            inventory={profile.inventory || {}}
            onConsumeProp={handleConsumeProp}
            onBack={() => setActiveCase(null)}
            onComplete={(stats) => handleCaseComplete(activeCase, stats)}
            onNextCase={handleNextCase}
          />
        ) : activeTab === 'home' ? (
          <HomeView
            profile={profile}
            allCases={allCases}
            onStartCase={(c) => setActiveCase(c)}
            onNavigate={(t) => setActiveTab(t)}
          />
        ) : activeTab === 'season' ? (
          <SeasonPassView
            profile={profile}
            onUnlockElitePass={handleUnlockElitePass}
            onClaimTierReward={handleClaimTierReward}
            onClaimDailyQuest={handleClaimDailyQuest}
          />
        ) : activeTab === 'map' ? (
          <AdventureMapView
            profile={profile}
            allCases={allCases}
            equippedGear={profile.equippedGear}
            onStartCase={(c) => setActiveCase(c)}
            onDefeatBoss={handleDefeatBoss}
            onConsumeProp={handleConsumeProp}
          />
        ) : activeTab === 'exams' ? (
          <ExamView
            profile={profile}
            allCases={allCases}
            equippedGear={profile.equippedGear}
            onFinishExam={handleFinishExam}
            onPracticeCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'english' ? (
          <CaseListView
            subject="english"
            cases={allCases}
            solvedIds={profile.solvedCaseIds}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'math' ? (
          <CaseListView
            subject="math"
            cases={allCases}
            solvedIds={profile.solvedCaseIds}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'fugitive' ? (
          <FugitiveView
            fugitives={profile.fugitives}
            allCases={allCases}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'wardrobe' ? (
          <WardrobeView
            profile={profile}
            onUnlockGear={handleUnlockGear}
            onEquipGear={handleEquipGear}
            onUnlockSkin={handleUnlockSkin}
            onEquipSkin={handleEquipSkin}
            onBuyProp={handleBuyProp}
            onOpenMysteryBox={handleOpenMysteryBox}
            onFeedPet={handleFeedPet}
            onClaimAchievement={handleClaimAchievement}
          />
        ) : activeTab === 'tutor' ? (
          <AiTutorView
            profile={profile}
            equippedGear={profile.equippedGear}
            onAddCustomCase={handleAddCustomCase}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : (
          <ParentDashboard
            profile={profile}
            onUpdateProfile={(updater) => setProfile(updater)}
            onResetAll={() => setProfile(createDefaultProfile())}
            onBack={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* 底部平板/手机常驻导航 */}
      {!activeCase && activeTab !== 'parent' && (
        <nav className="bottom-nav" aria-label="主导航">
          <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={19} />
            <span>事务所</span>
          </button>
          <button className={`nav-item ${activeTab === 'season' ? 'active' : ''}`} onClick={() => setActiveTab('season')}>
            <Crown size={19} />
            <span>通行证</span>
            {claimableSeasonCount > 0 && <span className="badge-dot">{claimableSeasonCount}</span>}
          </button>
          <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            <Compass size={19} />
            <span>冒险图</span>
          </button>
          <button className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>
            <ClipboardCheck size={19} />
            <span>模拟卷</span>
          </button>
          <button className={`nav-item ${activeTab === 'english' ? 'active' : ''}`} onClick={() => setActiveTab('english')}>
            <BookOpen size={19} />
            <span>英语馆</span>
          </button>
          <button className={`nav-item ${activeTab === 'math' ? 'active' : ''}`} onClick={() => setActiveTab('math')}>
            <Calculator size={19} />
            <span>数学馆</span>
          </button>
          <button className={`nav-item ${activeTab === 'wardrobe' ? 'active' : ''}`} onClick={() => setActiveTab('wardrobe')}>
            <Award size={19} />
            <span>商城基地</span>
            {(claimableAchCount > 0 || (profile.inventory?.item_mystery_box || 0) > 0) && (
              <span className="badge-dot">
                {claimableAchCount + (profile.inventory?.item_mystery_box || 0)}
              </span>
            )}
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
