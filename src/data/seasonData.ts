import { DailyQuestProgress, PropItemDef, SeasonTier, SkinDef } from '../types';

// ================= 8 款阿探全身限定皮肤 =================
export const SKIN_CATALOG: SkinDef[] = [
  {
    id: 'skin_classic',
    name: '元气暖橘阿探',
    rarity: 'R',
    cost: 0,
    emoji: '🐕',
    description: '经典暖橘色柴犬探员，自带阳光微笑与侦探领结！',
    accentColor: '#F59E0B',
  },
  {
    id: 'skin_ice',
    name: '极地冰雪神探',
    rarity: 'R',
    cost: 60,
    emoji: '❄️',
    description: '冰蓝雪白毛色 + 飘雪光环，思考数学题时大脑超冷静！',
    accentColor: '#0EA5E9',
  },
  {
    id: 'skin_ninja',
    name: '暗影忍者阿探',
    rarity: 'SR',
    cost: 95,
    emoji: '🥷',
    description: '酷黑夜行装 + 疾风红头带，专抓最狡猾的语法小偷！',
    accentColor: '#334155',
  },
  {
    id: 'skin_wizard',
    name: '星空魔法师阿探',
    rarity: 'SR',
    cost: 110,
    emoji: '🧙',
    description: '梦幻星河紫配色 + 魔法星光阵，让难题像变魔术一样解开！',
    accentColor: '#8B5CF6',
  },
  {
    id: 'skin_astronaut',
    name: '太空宇航员阿探',
    rarity: 'SSR',
    cost: 0,
    passOnly: true,
    passTierHint: 'S1 通行证 6 级（免费轨）解锁',
    emoji: '👨‍🚀',
    description: '全透明太空头盔 + 星空漫步光环，遨游四年级知识宇宙！',
    accentColor: '#2563EB',
  },
  {
    id: 'skin_dragon',
    name: '烈焰龙骑士阿探',
    rarity: 'SSR',
    cost: 0,
    passOnly: true,
    passTierHint: 'S1 通行证 12 级（精英轨）解锁',
    emoji: '🐉',
    description: '火红龙角 + 炽热龙翼光环，打 Boss 气场全开！',
    accentColor: '#DC2626',
  },
  {
    id: 'skin_gold_king',
    name: '黄金圣斗士阿探',
    rarity: 'SSR',
    cost: 180,
    emoji: '✨',
    description: '闪耀纯金圣衣配色 + 璀璨金星环绕，学霸专属荣耀！',
    accentColor: '#CA8A04',
  },
  {
    id: 'skin_mecha',
    name: '星际机甲阿探',
    rarity: 'MYTHIC',
    cost: 0,
    passOnly: true,
    passTierHint: 'S1 通行证 20 级终极大奖',
    emoji: '🤖',
    description: '神话级限定皮肤！赛博钛银机甲耳 + 量子蓝光核心 + 霓虹推进器！',
    accentColor: '#06B6D4',
  },
];

// ================= 6 种实战功能道具 =================
export const PROP_CATALOG: PropItemDef[] = [
  {
    id: 'item_scanner',
    name: '透视线索扫描仪',
    emoji: '🔦',
    cost: 18,
    description: '在破案或 Boss 战中使用：瞬间照出本题全部隐藏线索，直接拿线索星并打破 Boss 护盾！',
    usableIn: 'case',
    accentColor: '#2563EB',
  },
  {
    id: 'item_fifty',
    name: '50/50 排除剪刀',
    emoji: '✂️',
    cost: 20,
    description: '咔嚓剪掉 1~2 个错误干扰选项，难题秒变超简单二选一！',
    usableIn: 'case',
    accentColor: '#7C3AED',
  },
  {
    id: 'item_double_star',
    name: '双倍星星药水',
    emoji: '🧪',
    cost: 22,
    description: '使用后本宗案件破案奖励的侦探星直接 ×2 翻倍，攒星星超爽！',
    usableIn: 'case',
    accentColor: '#D97706',
  },
  {
    id: 'item_boss_bomb',
    name: 'Boss 暴击能量弹',
    emoji: '💣',
    cost: 28,
    description: '在冒险地图 Boss 战中投出：直接炸掉大魔王 1 格血量！',
    usableIn: 'boss',
    accentColor: '#DC2626',
  },
  {
    id: 'item_lucky_clover',
    name: '连击守护四叶草',
    emoji: '🍀',
    cost: 15,
    description: '在探案中激活：本关就算不小心选错一次，也能护住你的火焰连击不断！',
    usableIn: 'case',
    accentColor: '#059669',
  },
  {
    id: 'item_mystery_box',
    name: '神探神秘盲盒',
    emoji: '🎁',
    cost: 35,
    description: '在背包直接拆开！随机爆出 25~80 星星、智慧狗粮、实用道具，欧皇还能抽中大礼！',
    usableIn: 'bag',
    accentColor: '#EC4899',
  },
];

// ================= S1 赛季通行证（20 级双轨奖励，全靠学习免费解锁！） =================
export const ELITE_PASS_UNLOCK_STARS = 120; // 累计赚满 120 星星或击败任意 1 位 Boss 即可免费激活精英轨！

export const SEASON_TIERS: SeasonTier[] = [
  {
    tier: 1, requiredSp: 30,
    freeReward: { kind: 'stars', amount: 25, label: '25 侦探星', emoji: '⭐' },
    eliteReward: { kind: 'prop', itemId: 'item_scanner', amount: 2, label: '透视扫描仪 ×2', emoji: '🔦' },
  },
  {
    tier: 2, requiredSp: 70,
    freeReward: { kind: 'prop', itemId: 'item_fifty', amount: 1, label: '50/50 剪刀 ×1', emoji: '✂️' },
    eliteReward: { kind: 'treats', amount: 3, label: '智慧狗粮 ×3', emoji: '🦴' },
  },
  {
    tier: 3, requiredSp: 120,
    freeReward: { kind: 'treats', amount: 2, label: '智慧狗粮 ×2', emoji: '🦴' },
    eliteReward: { kind: 'gear', itemId: 'gear_eyes_cool', label: '限定：酷炫墨镜', emoji: '🕶️' },
  },
  {
    tier: 4, requiredSp: 170,
    freeReward: { kind: 'prop', itemId: 'item_double_star', amount: 1, label: '双倍药水 ×1', emoji: '🧪' },
    eliteReward: { kind: 'prop', itemId: 'item_mystery_box', amount: 1, label: '神秘盲盒 ×1', emoji: '🎁' },
  },
  {
    tier: 5, requiredSp: 230,
    freeReward: { kind: 'stars', amount: 40, label: '40 侦探星', emoji: '⭐' },
    eliteReward: { kind: 'prop', itemId: 'item_boss_bomb', amount: 2, label: 'Boss 暴击弹 ×2', emoji: '💣' },
  },
  {
    tier: 6, requiredSp: 300,
    freeReward: { kind: 'skin', itemId: 'skin_astronaut', label: 'SSR 皮肤：太空宇航员', emoji: '👨‍🚀' },
    eliteReward: { kind: 'stars', amount: 60, label: '60 侦探星', emoji: '⭐' },
  },
  {
    tier: 7, requiredSp: 370,
    freeReward: { kind: 'prop', itemId: 'item_scanner', amount: 2, label: '透视扫描仪 ×2', emoji: '🔦' },
    eliteReward: { kind: 'gear', itemId: 'gear_hat_headset', label: '限定：电竞耳机', emoji: '🎧' },
  },
  {
    tier: 8, requiredSp: 450,
    freeReward: { kind: 'prop', itemId: 'item_mystery_box', amount: 1, label: '神秘盲盒 ×1', emoji: '🎁' },
    eliteReward: { kind: 'prop', itemId: 'item_double_star', amount: 2, label: '双倍药水 ×2', emoji: '🧪' },
  },
  {
    tier: 9, requiredSp: 530,
    freeReward: { kind: 'treats', amount: 3, label: '智慧狗粮 ×3', emoji: '🦴' },
    eliteReward: { kind: 'prop', itemId: 'item_fifty', amount: 3, label: '50/50 剪刀 ×3', emoji: '✂️' },
  },
  {
    tier: 10, requiredSp: 620,
    freeReward: { kind: 'gear', itemId: 'gear_tool_lightsaber', label: '史诗装备：智慧光剑', emoji: '⚔️' },
    eliteReward: { kind: 'prop', itemId: 'item_mystery_box', amount: 2, label: '神秘盲盒 ×2', emoji: '🎁' },
  },
  {
    tier: 11, requiredSp: 720,
    freeReward: { kind: 'stars', amount: 55, label: '55 侦探星', emoji: '⭐' },
    eliteReward: { kind: 'prop', itemId: 'item_lucky_clover', amount: 3, label: '守护四叶草 ×3', emoji: '🍀' },
  },
  {
    tier: 12, requiredSp: 830,
    freeReward: { kind: 'prop', itemId: 'item_boss_bomb', amount: 2, label: 'Boss 暴击弹 ×2', emoji: '💣' },
    eliteReward: { kind: 'skin', itemId: 'skin_dragon', label: 'SSR 皮肤：烈焰龙骑士', emoji: '🐉' },
  },
  {
    tier: 13, requiredSp: 940,
    freeReward: { kind: 'prop', itemId: 'item_double_star', amount: 2, label: '双倍药水 ×2', emoji: '🧪' },
    eliteReward: { kind: 'treats', amount: 5, label: '智慧狗粮 ×5', emoji: '🦴' },
  },
  {
    tier: 14, requiredSp: 1060,
    freeReward: { kind: 'stars', amount: 70, label: '70 侦探星', emoji: '⭐' },
    eliteReward: { kind: 'gear', itemId: 'gear_cape_flame', label: '史诗装备：烈焰王者披风', emoji: '🔥' },
  },
  {
    tier: 15, requiredSp: 1190,
    freeReward: { kind: 'prop', itemId: 'item_mystery_box', amount: 2, label: '神秘盲盒 ×2', emoji: '🎁' },
    eliteReward: { kind: 'stars', amount: 100, label: '100 侦探星', emoji: '⭐' },
  },
  {
    tier: 16, requiredSp: 1330,
    freeReward: { kind: 'treats', amount: 4, label: '智慧狗粮 ×4', emoji: '🦴' },
    eliteReward: { kind: 'prop', itemId: 'item_scanner', amount: 4, label: '透视扫描仪 ×4', emoji: '🔦' },
  },
  {
    tier: 17, requiredSp: 1480,
    freeReward: { kind: 'prop', itemId: 'item_fifty', amount: 3, label: '50/50 剪刀 ×3', emoji: '✂️' },
    eliteReward: { kind: 'gear', itemId: 'gear_hat_mecha', label: '传说装备：赛博机甲头盔', emoji: '⚡' },
  },
  {
    tier: 18, requiredSp: 1640,
    freeReward: { kind: 'stars', amount: 90, label: '90 侦探星', emoji: '⭐' },
    eliteReward: { kind: 'prop', itemId: 'item_mystery_box', amount: 3, label: '神秘盲盒 ×3', emoji: '🎁' },
  },
  {
    tier: 19, requiredSp: 1810,
    freeReward: { kind: 'prop', itemId: 'item_boss_bomb', amount: 3, label: 'Boss 暴击弹 ×3', emoji: '💣' },
    eliteReward: { kind: 'gear', itemId: 'gear_badge_diamond', label: '传说徽章：钻石神探勋章', emoji: '💎' },
  },
  {
    tier: 20, requiredSp: 2000,
    freeReward: { kind: 'stars', amount: 150, label: '150 侦探星大礼包', emoji: '👑' },
    eliteReward: { kind: 'skin', itemId: 'skin_mecha', label: '神话终极皮肤：星际机甲阿探', emoji: '🤖' },
  },
];

// ================= 每日赛季任务（轻松完成拿海量赛季点！） =================
export interface DailyQuestDef {
  id: string;
  title: string;
  emoji: string;
  target: number;
  rewardSp: number;
  rewardStars: number;
  getCurrent: (p: DailyQuestProgress) => number;
}

export const DAILY_SEASON_QUESTS: DailyQuestDef[] = [
  {
    id: 'dq_any_2',
    title: '今日破获 2 宗任意案件',
    emoji: '🔍',
    target: 2,
    rewardSp: 40,
    rewardStars: 15,
    getCurrent: (d) => d.casesSolved,
  },
  {
    id: 'dq_eng_1',
    title: '完成 1 宗英语语法探案',
    emoji: '🇬🇧',
    target: 1,
    rewardSp: 35,
    rewardStars: 12,
    getCurrent: (d) => d.englishSolved,
  },
  {
    id: 'dq_math_1',
    title: '完成 1 宗数学逻辑探案',
    emoji: '🧮',
    target: 1,
    rewardSp: 35,
    rewardStars: 12,
    getCurrent: (d) => d.mathSolved,
  },
  {
    id: 'dq_clue_1',
    title: '用放大镜找齐 1 宗案的全部线索',
    emoji: '✨',
    target: 1,
    rewardSp: 30,
    rewardStars: 15,
    getCurrent: (d) => d.cluesAllFound,
  },
  {
    id: 'dq_exam_1',
    title: '挑战完成 1 套模拟试卷或击败 1 位 Boss',
    emoji: '🏆',
    target: 1,
    rewardSp: 60,
    rewardStars: 25,
    getCurrent: (d) => d.examsDone + d.bossHits,
  },
];

export function getSeasonTierInfo(sp: number) {
  let currentTier = 0;
  let nextTier = SEASON_TIERS[0];
  for (let i = 0; i < SEASON_TIERS.length; i++) {
    if (sp >= SEASON_TIERS[i].requiredSp) {
      currentTier = SEASON_TIERS[i].tier;
      nextTier = SEASON_TIERS[i + 1] || SEASON_TIERS[i];
    }
  }
  const prevSp = currentTier === 0 ? 0 : SEASON_TIERS[currentTier - 1].requiredSp;
  const maxReached = currentTier === SEASON_TIERS.length;
  const pct = maxReached
    ? 100
    : Math.min(100, Math.max(0, Math.round(((sp - prevSp) / (nextTier.requiredSp - prevSp)) * 100)));
  return { currentTier, nextTier, pct, maxReached };
}
