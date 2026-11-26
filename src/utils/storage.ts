import { AttemptRecord, DetectiveCase, ErrorCause, LearnerProfile, SkillCategory, Subject } from '../types';

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
    stars: 30, // 新手入职礼金，马上可以体验商店的快乐
    totalStarsEarned: 30,
    streakDays: 1,
    lastActiveDate: getTodayStr(),
    dailyGoal: 3,
    todayCompletedIds: [],
    solvedCaseIds: [],
    attempts: [],
    fugitives: [],
    unlockedGearIds: ['gear_magnifier_basic'],
    equippedGear: { tool: 'gear_magnifier_basic' },
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
    };

    const today = getTodayStr();
    if (merged.lastActiveDate !== today) {
      // 检查是否连续打卡
      const prev = new Date(merged.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      merged.streakDays = diffDays === 1 ? merged.streakDays + 1 : 1;
      merged.lastActiveDate = today;
      merged.todayCompletedIds = [];
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
  }
): { updated: LearnerProfile; earnedStars: number; diagnosedCause?: ErrorCause } {
  const firstTryPerfect = stats.wrongAttempts === 0;

  // 智能错因诊断：区分“粗心漏看线索” vs “概念/逻辑理解薄弱”
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

  // 零惩罚激励原则：只要坚持破案成功，基础星星全拿！额外找到线索再送奖励星！
  const earnedStars = detectiveCase.rewardStars + stats.bonusStars + (firstTryPerfect ? 5 : 3);

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

  // 更新“在逃档案”（错题追捕）
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
    // 复仇成功！抓捕归案！
    fugitives[existingIdx] = {
      ...fugitives[existingIdx],
      status: 'captured',
      capturedCount: fugitives[existingIdx].capturedCount + 1,
    };
  }

  const updated: LearnerProfile = {
    ...profile,
    stars: profile.stars + earnedStars,
    totalStarsEarned: profile.totalStarsEarned + earnedStars,
    solvedCaseIds,
    todayCompletedIds,
    attempts: [attempt, ...profile.attempts].slice(0, 200),
    fugitives,
  };

  return { updated, earnedStars, diagnosedCause };
}

export interface SkillMasterySummary {
  skill: SkillCategory;
  subject: Subject;
  attempts: number;
  masteryScore: number; // 0-100
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
        masteryScore: 50, // 未测试初始中性值
        carelessCount: 0,
        conceptCount: 0,
      };
    }
    const carelessCount = list.filter((a) => a.errorCause === 'careless').length;
    const conceptCount = list.filter((a) => a.errorCause === 'concept').length;
    // 越近期的表现权重越高
    let weightedSum = 0;
    let totalWeight = 0;
    list.slice(0, 10).forEach((a, idx) => {
      const w = Math.max(1, 10 - idx);
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
