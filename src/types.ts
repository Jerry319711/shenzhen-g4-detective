export type Subject = 'english' | 'math';

export type SkillCategory =
  | 'eng_third_person'    // 第三人称单数 & does照妖镜
  | 'eng_be_have_there'   // be动词 / have-has / There be就近原则
  | 'eng_present_prog'    // 现在进行时 & 时间线索
  | 'eng_prep_plural'     // 介词 / 单复数 / some-any / can
  | 'math_trap_reading'   // 审题防陷阱（往返、单位、还剩、植树、大数读零）
  | 'math_word_logic'     // 数量关系与线段图（路程、单价、和差倍、租车、平均数）
  | 'math_calc_laws'      // 运算律与巧算（分配律、结合律、商不变）
  | 'math_eq_geo_dec';    // 方程天平 / 线与角 / 三角形 / 小数

export type ErrorCause = 'careless' | 'concept';

export type CaseMode =
  | 'eng_clue_fill'       // 英语：先点出线索词，再填空
  | 'eng_spot_bug'        // 英语：抓语法小偷（点出写错的词并修复）
  | 'math_scaffold';      // 数学：线索扫描 + 可视化图解 + 分步破案

export interface ClueToken {
  text: string;
  isClue?: boolean;
  clueTip?: string;
  isBug?: boolean;
  isBlank?: boolean;
}

export interface CaseStep {
  prompt: string;
  options: string[];
  correctIndex: number;
  optionFeedback: string[];
  hints: [string, string, string];
  visualStage?: number;
}

export type MathVisualSpec =
  | {
      type: 'bar_model';
      title: string;
      unit: string;
      bars: {
        label: string;
        segments: { valueLabel: string; flex: number; color: string; highlight?: boolean }[];
        totalLabel?: string;
      }[];
      footnote?: string;
    }
  | {
      type: 'balance_scale';
      title: string;
      leftItems: string[];
      rightValue: number;
      subtractEachSide?: number;
      divideBy?: number;
      unknownLabel?: string;
    }
  | {
      type: 'area_split';
      title: string;
      heightLabel: string;
      parts: { widthLabel: string; expr: string; result: string; color: string }[];
      combinedExpr: string;
    }
  | {
      type: 'angle_triangle';
      title: string;
      shape: 'triangle' | 'straight_line' | 'right_angle';
      angles: { label: string; value?: number; isUnknown?: boolean }[];
      ruleText: string;
    }
  | {
      type: 'decimal_align';
      title: string;
      numA: string;
      numB: string;
      operator: '+' | '-';
      result: string;
      tip: string;
    };

export interface DetectiveCase {
  id: string;
  subject: Subject;
  skill: SkillCategory;
  mode: CaseMode;
  difficulty: 1 | 2 | 3;
  textbookRef: string;
  title: string;
  suspectName: string;
  storyIntro: string;
  readAloudText?: string;
  tokens: ClueToken[];
  clueGoalText: string;
  visual?: MathVisualSpec;
  steps: CaseStep[];
  goldenRule: string;
  rewardStars: number;
  isAiGenerated?: boolean;
  cardId?: string; // 解锁对应口诀卡牌
}

export interface AttemptRecord {
  caseId: string;
  skill: SkillCategory;
  subject: Subject;
  timestamp: number;
  firstTryPerfect: boolean;
  cluesFoundBeforeAnswer: boolean;
  hintsUsed: number;
  wrongAttempts: number;
  errorCause?: ErrorCause;
  durationSec: number;
}

export interface FugitiveEntry {
  caseId: string;
  suspectName: string;
  skill: SkillCategory;
  subject: Subject;
  cause: ErrorCause;
  addedAt: number;
  capturedCount: number;
  status: 'at_large' | 'captured';
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: 'hat' | 'eyes' | 'tool' | 'cape' | 'badge';
  cost: number;
  description: string;
  emoji: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  subtitle: string;
  subject: Subject | 'mixed';
  category: 'midterm' | 'final' | 'special' | 'combo';
  gradeTerm: '4上' | '4下' | '全学年';
  badgeEmoji: string;
  caseIds: string[];
  targetSkills: SkillCategory[];
  questionCount: number;
  rewardStars: number;
  rewardTreats: number;
  encouragement: string;
}

export interface ExamRecord {
  examId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  durationSec: number;
  completedAt: number;
  weakSkills?: SkillCategory[];
}

export interface AdventureChapter {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  emoji: string;
  subject: Subject | 'mixed';
  skills: SkillCategory[];
  themeColor: string;
  bgGradient: string;
  bossName: string;
  bossEmoji: string;
  bossTitle: string;
  bossHp: number;
  bossTaunt: string;
  bossDefeatLine: string;
  requiredCasesToUnlockBoss: number;
  chestStars: number;
  chestTreats: number;
  unlockCardId: string;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  subject: Subject;
  skill: SkillCategory;
  rarity: 'R' | 'SR' | 'SSR';
  emoji: string;
  rule: string;
  example: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rewardStars: number;
}

export interface LearnerProfile {
  nickname: string;
  stars: number;
  totalStarsEarned: number;
  xp: number;
  treats: number;           // 智慧狗粮（用来喂养阿探提升亲密度）
  bondPoints: number;       // 阿探亲密度
  currentCombo: number;     // 当前连击
  maxCombo: number;         // 历史最高连击
  streakDays: number;
  lastActiveDate: string;
  dailyGoal: number;
  todayCompletedIds: string[];
  solvedCaseIds: string[];
  attempts: AttemptRecord[];
  fugitives: FugitiveEntry[];
  unlockedGearIds: string[];
  equippedGear: Partial<Record<EquipmentItem['slot'], string>>;
  defeatedBossIds: string[];
  collectedCardIds: string[];
  claimedAchievementIds: string[];
  soundEnabled: boolean;
  geminiApiKey: string;
  customCases: DetectiveCase[];
  examHistory: ExamRecord[];
}

export interface SkillMeta {
  id: SkillCategory;
  subject: Subject;
  name: string;
  shortName: string;
  textbook: string;
  description: string;
  parentTip: string;
}
