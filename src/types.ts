export type Subject = 'english' | 'math';

export type SkillCategory =
  | 'eng_third_person'    // 第三人称单数 & does照妖镜
  | 'eng_be_have_there'   // be动词 / have-has / There be就近原则
  | 'eng_present_prog'    // 现在进行时 & 时间线索
  | 'eng_prep_plural'     // 介词 / 单复数 / some-any / can
  | 'math_trap_reading'   // 审题防陷阱（往返、单位、还剩、买几送几）
  | 'math_word_logic'     // 数量关系与线段图（路程、单价、和差倍、方案）
  | 'math_calc_laws'      // 运算律与巧算（分配律、结合律）
  | 'math_eq_geo_dec';    // 方程天平 / 线与角 / 三角形 / 小数对齐

export type ErrorCause = 'careless' | 'concept';

export type CaseMode =
  | 'eng_clue_fill'       // 英语：先点出线索词，再填空
  | 'eng_spot_bug'        // 英语：抓语法小偷（点出写错的词并修复）
  | 'math_scaffold';      // 数学：线索扫描 + 可视化图解 + 分步破案

export interface ClueToken {
  text: string;
  isClue?: boolean;
  clueTip?: string;       // 点中线索词时阿探的即时小贴士
  isBug?: boolean;        // 抓语法小偷模式中的错误词
  isBlank?: boolean;      // 填空槽位
}

export interface CaseStep {
  prompt: string;
  options: string[];
  correctIndex: number;
  optionFeedback: string[]; // 针对每个选项的温柔、具体解释（绝不出现打击性词汇）
  hints: [string, string, string]; // 3级免费提示：1线索 -> 2直观比喻 -> 3手把手带算
  visualStage?: number;    // 联动数学可视化组件的状态阶段
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
  difficulty: 1 | 2 | 3; // 1=热身小案, 2=进阶密案, 3=王牌悬案
  textbookRef: string;   // 例如：沪教牛津深圳版 4A M2 / 北师大版 4下 第五单元
  title: string;
  suspectName: string;   // 例如："三单偷帽子怪"、"往返迷雾狐"
  storyIntro: string;    // 简短有趣的案件背景
  readAloudText?: string;// 英语朗读文本
  tokens: ClueToken[];   // 可点击的线索词/错词序列
  clueGoalText: string;  // 例如："先用放大镜找出句子里的 2 个时间/人称线索！"
  visual?: MathVisualSpec;
  steps: CaseStep[];
  goldenRule: string;    // 破案后收获的「神探口诀」
  rewardStars: number;
  isAiGenerated?: boolean;
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
  capturedCount: number; // 连续答对1次即可归案，保留历史荣誉
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
  badgeEmoji: string;
  caseIds: string[];
  rewardStars: number;
  encouragement: string;
}

export interface ExamRecord {
  examId: string;
  score: number;       // 0-100
  correctCount: number;
  totalCount: number;
  durationSec: number;
  completedAt: number;
}

export interface LearnerProfile {
  nickname: string;
  stars: number;
  totalStarsEarned: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoal: number;      // 默认每天3关（约5分钟）
  todayCompletedIds: string[];
  solvedCaseIds: string[];
  attempts: AttemptRecord[];
  fugitives: FugitiveEntry[];
  unlockedGearIds: string[];
  equippedGear: Partial<Record<EquipmentItem['slot'], string>>;
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
