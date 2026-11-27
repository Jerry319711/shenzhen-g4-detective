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
import { EQUIPMENT_CATALOG } from './data/rewards';
import { ACHIEVEMENTS, getLevelFromXp } from './data/rpgData';
import {
  DAILY_SEASON_QUESTS,
  MysteryBoxDef,
  SEASON_TIERS,
  SKIN_CATALOG,
  getTotalBoxesInInventory,
} from './data/seasonData';
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

  const totalBoxes = useMemo(() => getTotalBoxesInInventory(profile.inventory), [profile.inventory]);

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
    // 暗黑刷怪随机掉宝：约 35% 概率爆出皮肤碎片或青铜/白银盲盒！
    let droppedLootText: string | undefined;
    const roll = Math.random();
    const nextProf = { ...res.updated, inventory: { ...(res.updated.inventory || {}) } };

    if (detectiveCase.difficulty === 3 && roll < 0.45) {
      nextProf.inventory.box_silver = (nextProf.inventory.box_silver || 0) + 1;
      droppedLootText = '首领爆出【🥈 白银装备盲盒 ×1】！快去暗黑宝库拆箱！';
    } else if (roll < 0.22) {
      nextProf.inventory.box_bronze = (nextProf.inventory.box_bronze || 0) + 1;
      droppedLootText = '怪物掉落【🥉 青铜探案盲盒 ×1】！';
    } else if (roll < 0.48) {
      const shardGain = detectiveCase.difficulty === 3 ? 2 : 1;
      nextProf.skinShards = (nextProf.skinShards || 0) + shardGain;
      droppedLootText = `怪物掉落【🧩 万能套装碎片 ×${shardGain}】！`;
    }

    setProfile(nextProf);
    return {
      earnedStars: res.earnedStars,
      earnedXp: res.earnedXp,
      earnedSp: res.earnedSp,
      newCombo: res.newCombo,
      unlockedCardId: res.unlockedCardId,
      droppedLootText,
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

  const handleCraftSkin = (skin: SkinDef) => {
    setProfile((prev) => {
      const need = skin.shardCost || 999;
      if ((prev.skinShards || 0) < need || (prev.unlockedSkinIds || []).includes(skin.id)) return prev;
      return {
        ...prev,
        skinShards: (prev.skinShards || 0) - need,
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

  const handleOpenMysteryBox = (boxId: MysteryBoxDef['id']): string => {
    let resultText = '';
    setProfile((prev) => {
      const inv = { ...(prev.inventory || {}) };
      // 兼容旧版 item_mystery_box
      if (boxId === 'box_bronze' && (inv.box_bronze || 0) <= 0 && (inv.item_mystery_box || 0) > 0) {
        inv.item_mystery_box = (inv.item_mystery_box || 0) - 1;
      } else if ((inv[boxId] || 0) > 0) {
        inv[boxId] = (inv[boxId] || 0) - 1;
      } else {
        return prev;
      }

      const roll = Math.random();
      const unownedShopSkins = SKIN_CATALOG.filter(
        (s) => !s.passOnly && s.cost > 0 && !(prev.unlockedSkinIds || []).includes(s.id)
      );
      const unownedGear = EQUIPMENT_CATALOG.filter((g) => !prev.unlockedGearIds.includes(g.id));

      const next: LearnerProfile = {
        ...prev,
        inventory: inv,
        unlockedGearIds: [...prev.unlockedGearIds],
        unlockedSkinIds: [...(prev.unlockedSkinIds || ['skin_classic'])],
      };

      if (boxId === 'box_bronze') {
        const shardGain = 1 + Math.floor(Math.random() * 3); // 1~3
        next.skinShards = (next.skinShards || 0) + shardGain;
        if (roll < 0.15 && unownedGear.length > 0) {
          const g = unownedGear[Math.floor(Math.random() * unownedGear.length)];
          next.unlockedGearIds.push(g.id);
          resultText = `🎉 欧皇小爆！直接开出暗黑神装【${g.emoji} ${g.name}】 + 🧩 ${shardGain} 套装碎片！`;
        } else if (roll < 0.55) {
          inv.item_scanner = (inv.item_scanner || 0) + 1;
          inv.item_fifty = (inv.item_fifty || 0) + 1;
          resultText = `获得 🔦 破盾扫描×1 + ✂️ 破魔剪刀×1 + 🧩 ${shardGain} 套装碎片！`;
        } else {
          next.treats = (next.treats || 0) + 2;
          next.seasonPoints = (next.seasonPoints || 0) + 25;
          resultText = `获得 🔮 圣光精粹×2 + 🏆 +25 赛季点 + 🧩 ${shardGain} 套装碎片！`;
        }
      } else if (boxId === 'box_silver') {
        const shardGain = 3 + Math.floor(Math.random() * 3); // 3~5
        next.skinShards = (next.skinShards || 0) + shardGain;
        if (roll < 0.35 && unownedGear.length > 0) {
          const g = unownedGear[Math.floor(Math.random() * unownedGear.length)];
          next.unlockedGearIds.push(g.id);
          resultText = `⚔️ 银光出货！直接开出暗黑神装【${g.emoji} ${g.name}】 + 🧩 ${shardGain} 套装碎片！`;
        } else {
          inv.item_double_star = (inv.item_double_star || 0) + 1;
          inv.item_boss_bomb = (inv.item_boss_bomb || 0) + 1;
          next.seasonPoints = (next.seasonPoints || 0) + 45;
          resultText = `获得 🧪 双倍药水×1 + 💣 BOSS暴击弹×1 + 🏆 +45 SP + 🧩 ${shardGain} 套装碎片！`;
        }
      } else if (boxId === 'box_gold') {
        const shardGain = 6 + Math.floor(Math.random() * 5); // 6~10
        next.skinShards = (next.skinShards || 0) + shardGain;
        if (roll < 0.22 && unownedShopSkins.length > 0) {
          const sk = unownedShopSkins[Math.floor(Math.random() * unownedShopSkins.length)];
          next.unlockedSkinIds.push(sk.id);
          next.equippedSkinId = sk.id;
          resultText = `🌟 暗金冲天光柱！！欧皇直出全身套装【${sk.emoji} ${sk.name}】并已穿戴 + 🧩 ${shardGain} 碎片！`;
        } else if (roll < 0.55 && unownedGear.length > 0) {
          const g = unownedGear[Math.floor(Math.random() * unownedGear.length)];
          next.unlockedGearIds.push(g.id);
          resultText = `🔥 金光闪耀！开出暗黑神装【${g.emoji} ${g.name}】 + 🧩 ${shardGain} 套装碎片 + 🔮 3 圣光精粹！`;
          next.treats = (next.treats || 0) + 3;
        } else {
          next.treats = (next.treats || 0) + 4;
          next.seasonPoints = (next.seasonPoints || 0) + 80;
          inv.item_boss_bomb = (inv.item_boss_bomb || 0) + 2;
          resultText = `黄金补给大爆发！🧩 ${shardGain} 套装碎片 + 💣 暴击弹×2 + 🔮 4 圣光精粹 + 🏆 +80 SP！`;
        }
      } else {
        // 🌌 传说神话盲盒
        const shardGain = 12 + Math.floor(Math.random() * 7); // 12~18
        next.skinShards = (next.skinShards || 0) + shardGain;
        if (roll < 0.42 && unownedShopSkins.length > 0) {
          const sk = unownedShopSkins[Math.floor(Math.random() * unownedShopSkins.length)];
          next.unlockedSkinIds.push(sk.id);
          next.equippedSkinId = sk.id;
          resultText = `🌌 太古紫光降临！！直出顶级全身套装【${sk.emoji} ${sk.name}】 + 🧩 ${shardGain} 套装碎片！`;
        } else if (unownedGear.length > 0) {
          const g = unownedGear[Math.floor(Math.random() * unownedGear.length)];
          next.unlockedGearIds.push(g.id);
          inv.item_double_star = (inv.item_double_star || 0) + 2;
          inv.item_boss_bomb = (inv.item_boss_bomb || 0) + 2;
          resultText = `🌌 太古神装爆出！【${g.emoji} ${g.name}】 + 🧩 ${shardGain} 套装碎片 + 双倍药水×2 + 暴击弹×2！`;
        } else {
          next.stars += 90;
          next.totalStarsEarned += 90;
          next.seasonPoints = (next.seasonPoints || 0) + 120;
          resultText = `🌌 至尊神话豪礼！⭐ +90 星 + 🏆 +120 SP + 🧩 ${shardGain} 套装碎片！`;
        }
      }

      return next;
    });
    return resultText || '获得庇护所战利品礼包！';
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
        const amt = reward.amount || 20;
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
      const inv = { ...(prev.inventory || {}) };
      const dropBox: PropItemId = chap.order >= 5 ? 'box_mythic' : chap.order >= 3 ? 'box_gold' : 'box_silver';
      inv[dropBox] = (inv[dropBox] || 0) + 1;

      return {
        ...prev,
        stars: prev.stars + chap.chestStars,
        totalStarsEarned: prev.totalStarsEarned + chap.chestStars,
        treats: (prev.treats || 0) + chap.chestTreats,
        xp: (prev.xp || 0) + 100,
        seasonPoints: (prev.seasonPoints || 0) + 100,
        inventory: inv,
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
      const inv = { ...(prev.inventory || {}) };
      // 交卷必掉盲盒（>=85分掉白银箱，否则掉青铜箱！）
      if (record.score >= 85) {
        inv.box_silver = (inv.box_silver || 0) + 1;
      } else {
        inv.box_bronze = (inv.box_bronze || 0) + 1;
      }

      return {
        ...prev,
        stars: prev.stars + Math.round(earnedStars * 0.65),
        totalStarsEarned: prev.totalStarsEarned + Math.round(earnedStars * 0.65),
        treats: (prev.treats || 0) + earnedTreats,
        xp: (prev.xp || 0) + 75,
        seasonPoints: (prev.seasonPoints || 0) + 65,
        inventory: inv,
        dailyQuestProgress: { ...dqp, examsDone: dqp.examsDone + 1 },
        fugitives: nextFugitives,
        examHistory: [record, ...(prev.examHistory || [])].slice(0, 60),
      };
    });
  };

  return (
    <div className="app-shell">
      {/* 暗黑4 顶部庇护所 HUD */}
      <header className="top-bar">
        <button
          className="brand-pill"
          onClick={() => {
            setActiveCase(null);
            setActiveTab('home');
          }}
        >
          <div className="brand-logo">⚔️</div>
          <div>
            <div className="brand-title">暗黑智慧 IV</div>
            <div className="brand-sub">深圳四年级庇护所猎魔学院</div>
          </div>
        </button>

        <div className="top-stats">
          <div className="stat-chip" style={{ borderColor: '#A855F7', color: '#E9D5FF' }}>
            Lv.{lvl.level}
          </div>
          <div className="stat-chip star" title="战利品星币">
            <Star size={15} fill="#FACC15" color="#D97706" />
            <span>{profile.stars}</span>
          </div>
          <div className="stat-chip streak" title="连续试炼天数 / 连杀">
            <Flame size={15} fill="#EF4444" color="#F97316" />
            <span>{profile.currentCombo >= 2 ? `${profile.currentCombo}连杀` : `${profile.streakDays}天`}</span>
          </div>
          <button
            className="icon-btn"
            onClick={() => {
              setActiveCase(null);
              setActiveTab('fugitive');
            }}
            title="复仇通缉榜（错题怪）"
            style={{ position: 'relative' }}
          >
            <Target size={17} />
            {atLargeCount > 0 && <span className="badge-dot" style={{ top: -5, right: -5 }}>{atLargeCount}</span>}
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              setActiveCase(null);
              setActiveTab('tutor');
            }}
            title="圣光祭坛（问导师）"
          >
            <Wand2 size={17} />
          </button>
          <button
            className="icon-btn"
            onClick={handleToggleSound}
            title={profile.soundEnabled ? '关闭音效' : '开启音效'}
          >
            {profile.soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              setActiveCase(null);
              setActiveTab('parent');
            }}
            title="家长洞察控制台"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

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
            onCraftSkin={handleCraftSkin}
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

      {!activeCase && activeTab !== 'parent' && (
        <nav className="bottom-nav" aria-label="主导航">
          <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={19} />
            <span>庇护所</span>
          </button>
          <button className={`nav-item ${activeTab === 'season' ? 'active' : ''}`} onClick={() => setActiveTab('season')}>
            <Crown size={19} />
            <span>通行证</span>
            {claimableSeasonCount > 0 && <span className="badge-dot">{claimableSeasonCount}</span>}
          </button>
          <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            <Compass size={19} />
            <span>地牢BOSS</span>
          </button>
          <button className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>
            <ClipboardCheck size={19} />
            <span>试炼卷</span>
          </button>
          <button className={`nav-item ${activeTab === 'english' ? 'active' : ''}`} onClick={() => setActiveTab('english')}>
            <BookOpen size={19} />
            <span>英语窟</span>
          </button>
          <button className={`nav-item ${activeTab === 'math' ? 'active' : ''}`} onClick={() => setActiveTab('math')}>
            <Calculator size={19} />
            <span>数学牢</span>
          </button>
          <button className={`nav-item ${activeTab === 'wardrobe' ? 'active' : ''}`} onClick={() => setActiveTab('wardrobe')}>
            <Award size={19} />
            <span>暗黑宝库</span>
            {(claimableAchCount > 0 || totalBoxes > 0) && (
              <span className="badge-dot">{claimableAchCount + totalBoxes}</span>
            )}
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
