import { AttemptRecord, DetectiveCase, ErrorCause, LearnerProfile, SkillCategory, Subject } from '../types';
import { KNOWLEDGE_CARDS } from '../data/rpgData';

const STORAGE_KEY = 'detective_academy_g4_profile_v1';

export function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createDefaultProfile(): LearnerProfile {
  return {
    nickname: 'Henry',
    stars: 35,
    totalStarsEarned: 35,
    xp: 20,
    treats: 3, // 新手赠送 3 块智慧狗粮，马上体验喂养阿探的乐趣！
    bondPoints: 10,
    currentCombo: 0,
    maxCombo: 0,
    streakDays: 1,
    lastActiveDate: getTodayStr(),
    dailyGoal: 3,
    todayCompletedIds: [],
    solvedCaseIds: [],
    attempts: [],
    fugitives: [],
    unlockedGearIds: ['gear_magnifier_basic'],
    equippedGear: { tool: 'gear_magnifier_basic' },
    unlockedSkinIds: ['skin_classic'],
    equippedSkinId: 'skin_classic',
    inventory: {
      item_scanner: 2,
      item_fifty: 2,
      item_double_star: 1,
      item_boss_bomb: 1,
      item_lucky_clover: 1,
      item_mystery_box: 1, // 入职先送 1 个盲盒让孩子马上拆！
    },
    seasonPoints: 15,
    seasonEliteUnlocked: false,
    claimedFreeTiers: [],
    claimedEliteTiers: [],
    dailyQuestProgress: {
      casesSolved: 0,
      englishSolved: 0,
      mathSolved: 0,
      cluesAllFound: 0,
      examsDone: 0,
      bossHits: 0,
    },
    claimedDailyQuestIds: [],
    defeatedBossIds: [],
    collectedCardIds: [],
    claimedAchievementIds: [],
    soundEnabled: true,
    geminiApiKey: '',
    customCases: [],
    examHistory: [],
  };
}

export function loadProfile(): LearnerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<LearnerProfile>;
    const base = createDefaultProfile();
    const merged: LearnerProfile = {
      ...base,
      ...parsed,
      equippedGear: { ...base.equippedGear, ...(parsed.equippedGear || {}) },
      unlockedSkinIds: parsed.unlockedSkinIds?.length ? parsed.unlockedSkinIds : base.unlockedSkinIds,
      equippedSkinId: parsed.equippedSkinId || base.equippedSkinId,
      inventory: parsed.inventory ? { ...parsed.inventory } : base.inventory,
      seasonPoints: parsed.seasonPoints ?? base.seasonPoints,
      seasonEliteUnlocked: parsed.seasonEliteUnlocked ?? false,
      claimedFreeTiers: parsed.claimedFreeTiers || [],
      claimedEliteTiers: parsed.claimedEliteTiers || [],
      dailyQuestProgress: parsed.dailyQuestProgress || base.dailyQuestProgress,
      claimedDailyQuestIds: parsed.claimedDailyQuestIds || [],
      defeatedBossIds: parsed.defeatedBossIds || [],
      collectedCardIds: parsed.collectedCardIds || [],
      claimedAchievementIds: parsed.claimedAchievementIds || [],
      examHistory: parsed.examHistory || [],
      xp: parsed.xp ?? base.xp,
      treats: parsed.treats ?? base.treats,
      bondPoints: parsed.bondPoints ?? base.bondPoints,
      currentCombo: parsed.currentCombo ?? 0,
      maxCombo: parsed.maxCombo ?? 0,
    };

    const today = getTodayStr();
    if (merged.lastActiveDate !== today) {
      const prev = new Date(merged.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      merged.streakDays = diffDays === 1 ? merged.streakDays + 1 : 1;
      merged.lastActiveDate = today;
      merged.todayCompletedIds = [];
      merged.dailyQuestProgress = {
        casesSolved: 0,
        englishSolved: 0,
        mathSolved: 0,
        cluesAllFound: 0,
        examsDone: 0,
        bossHits: 0,
      };
      merged.claimedDailyQuestIds = [];
    }
    return merged;
  } catch {
    return createDefaultProfile();
  }
}

export function saveProfile(profile: LearnerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore quota errors
  }
}

export function recordCaseCompletion(
  profile: LearnerProfile,
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
): {
  updated: LearnerProfile;
  earnedStars: number;
  earnedXp: number;
  earnedSp: number;
  newCombo: number;
  unlockedCardId?: string;
  diagnosedCause?: ErrorCause;
} {
  const firstTryPerfect = stats.wrongAttempts === 0;

  let diagnosedCause: ErrorCause | undefined;
  if (stats.wrongAttempts > 0) {
    if (!stats.cluesFoundBeforeAnswer && stats.hintsUsed === 0) {
      diagnosedCause = 'careless';
    } else if (stats.durationSec < 8 && stats.wrongAttempts === 1) {
      diagnosedCause = 'careless';
    } else {
      diagnosedCause = 'concept';
    }
  }

  // 连击系统（使用幸运草时，答错1次也不断连击！）
  const keepCombo = firstTryPerfect || (Boolean(stats.luckyCloverActive) && stats.wrongAttempts <= 1);
  const newCombo = keepCombo ? (profile.currentCombo || 0) + 1 : 0;
  const maxCombo = Math.max(profile.maxCombo || 0, newCombo);
  const comboBonus = newCombo >= 3 ? Math.min(10, newCombo * 2) : 0;

  const baseStars = detectiveCase.rewardStars + stats.bonusStars + (firstTryPerfect ? 5 : 3) + comboBonus;
  const earnedStars = stats.doubleStarsActive ? baseStars * 2 : baseStars;
  const earnedXp = (detectiveCase.difficulty * 15) + (firstTryPerfect ? 15 : 10);
  const earnedSp = 25 + (firstTryPerfect ? 10 : 5) + (stats.bonusStars >= 5 ? 5 : 0);
  const earnedTreats = firstTryPerfect && newCombo % 2 === 0 ? 1 : 0;

  const attempt: AttemptRecord = {
    caseId: detectiveCase.id,
    skill: detectiveCase.skill,
    subject: detectiveCase.subject,
    timestamp: Date.now(),
    firstTryPerfect,
    cluesFoundBeforeAnswer: stats.cluesFoundBeforeAnswer,
    hintsUsed: stats.hintsUsed,
    wrongAttempts: stats.wrongAttempts,
    errorCause: diagnosedCause,
    durationSec: stats.durationSec,
  };

  const solvedCaseIds = profile.solvedCaseIds.includes(detectiveCase.id)
    ? profile.solvedCaseIds
    : [...profile.solvedCaseIds, detectiveCase.id];

  const todayCompletedIds = profile.todayCompletedIds.includes(detectiveCase.id)
    ? profile.todayCompletedIds
    : [...profile.todayCompletedIds, detectiveCase.id];

  // 自动点亮对应口诀卡牌！
  let unlockedCardId: string | undefined;
  let collectedCardIds = [...(profile.collectedCardIds || [])];
  const candidateCardId =
    detectiveCase.cardId ||
    KNOWLEDGE_CARDS.find((c) => c.skill === detectiveCase.skill && !collectedCardIds.includes(c.id))?.id;
  if (candidateCardId && !collectedCardIds.includes(candidateCardId)) {
    collectedCardIds.push(candidateCardId);
    unlockedCardId = candidateCardId;
  }

  // 更新在逃档案
  let fugitives = [...profile.fugitives];
  const existingIdx = fugitives.findIndex((f) => f.caseId === detectiveCase.id);

  if (stats.wrongAttempts > 0) {
    if (existingIdx >= 0) {
      fugitives[existingIdx] = {
        ...fugitives[existingIdx],
        cause: diagnosedCause || 'concept',
        status: 'at_large',
        addedAt: Date.now(),
      };
    } else {
      fugitives.unshift({
        caseId: detectiveCase.id,
        suspectName: detectiveCase.suspectName,
        skill: detectiveCase.skill,
        subject: detectiveCase.subject,
        cause: diagnosedCause || 'concept',
        addedAt: Date.now(),
        capturedCount: 0,
        status: 'at_large',
      });
    }
  } else if (existingIdx >= 0 && fugitives[existingIdx].status === 'at_large') {
    fugitives[existingIdx] = {
      ...fugitives[existingIdx],
      status: 'captured',
      capturedCount: fugitives[existingIdx].capturedCount + 1,
    };
  }

  const dqp = profile.dailyQuestProgress || {
    casesSolved: 0, englishSolved: 0, mathSolved: 0, cluesAllFound: 0, examsDone: 0, bossHits: 0,
  };

  const updated: LearnerProfile = {
    ...profile,
    stars: profile.stars + earnedStars,
    totalStarsEarned: profile.totalStarsEarned + earnedStars,
    xp: (profile.xp || 0) + earnedXp,
    seasonPoints: (profile.seasonPoints || 0) + earnedSp,
    treats: (profile.treats || 0) + earnedTreats,
    currentCombo: newCombo,
    maxCombo,
    solvedCaseIds,
    todayCompletedIds,
    collectedCardIds,
    dailyQuestProgress: {
      ...dqp,
      casesSolved: dqp.casesSolved + 1,
      englishSolved: dqp.englishSolved + (detectiveCase.subject === 'english' ? 1 : 0),
      mathSolved: dqp.mathSolved + (detectiveCase.subject === 'math' ? 1 : 0),
      cluesAllFound: dqp.cluesAllFound + (stats.bonusStars >= 5 ? 1 : 0),
    },
    attempts: [attempt, ...profile.attempts].slice(0, 300),
    fugitives,
  };

  return { updated, earnedStars, earnedXp, earnedSp, newCombo, unlockedCardId, diagnosedCause };
}

export interface SkillMasterySummary {
  skill: SkillCategory;
  subject: Subject;
  attempts: number;
  masteryScore: number;
  carelessCount: number;
  conceptCount: number;
}

export function computeSkillMastery(attempts: AttemptRecord[], skills: { id: SkillCategory; subject: Subject }[]): SkillMasterySummary[] {
  return skills.map(({ id, subject }) => {
    const list = attempts.filter((a) => a.skill === id);
    if (list.length === 0) {
      return {
        skill: id,
        subject,
        attempts: 0,
        masteryScore: 50,
        carelessCount: 0,
        conceptCount: 0,
      };
    }
    const carelessCount = list.filter((a) => a.errorCause === 'careless').length;
    const conceptCount = list.filter((a) => a.errorCause === 'concept').length;
    let weightedSum = 0;
    let totalWeight = 0;
    list.slice(0, 12).forEach((a, idx) => {
      const w = Math.max(1, 12 - idx);
      let score = 100;
      if (a.wrongAttempts === 1) score = 68;
      else if (a.wrongAttempts >= 2) score = 40;
      if (a.hintsUsed >= 2) score = Math.max(35, score - 12);
      weightedSum += score * w;
      totalWeight += w;
    });
    return {
      skill: id,
      subject,
      attempts: list.length,
      masteryScore: Math.round(weightedSum / totalWeight),
      carelessCount,
      conceptCount,
    };
  });
}
