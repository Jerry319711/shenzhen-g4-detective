import { DailyQuestProgress, PropItemDef, PropItemId, SeasonTier, SkinDef } from '../types';

// ================= 8 套人类圣骑士暗黑破坏神全身套装 =================
export const SKIN_CATALOG: SkinDef[] = [
  {
    id: 'skin_classic',
    name: '萨卡兰姆见习圣甲',
    rarity: 'R',
    cost: 0,
    emoji: '🛡️',
    description: '经典银蓝精钢全身板甲 + 圣殿蓝十字战袍，庇护所圣骑士启程战装！',
    accentColor: '#3B82F6',
  },
  {
    id: 'skin_ice',
    name: '凛冬碎冰圣骑套装',
    rarity: 'R',
    cost: 180,
    shardCost: 20,
    emoji: '❄️',
    description: '冰蓝晶钻全身重甲 + 极寒战袍，思考数学题时如冰雪般冷静锋利！',
    accentColor: '#0EA5E9',
  },
  {
    id: 'skin_ninja',
    name: '暗影猎魔游侠套装',
    rarity: 'SR',
    cost: 360,
    shardCost: 38,
    emoji: '🌑',
    description: '黑曜石尖刺战甲 + 猩红暗影斗篷 + 黄金猎魔眼，暗夜精英终结者！',
    accentColor: '#EF4444',
  },
  {
    id: 'skin_wizard',
    name: '奥术秘法圣殿套装',
    rarity: 'SR',
    cost: 480,
    shardCost: 48,
    emoji: '🔮',
    description: '紫金奥术全身板甲 + 旋转六芒星魔法阵，用秘法看穿一切逻辑迷宫！',
    accentColor: '#8B5CF6',
  },
  {
    id: 'skin_astronaut',
    name: '泰瑞尔·正义大天使套',
    rarity: 'SSR',
    cost: 0,
    passOnly: true,
    passTierHint: 'S1 通行证 6 级（免费轨）限定解锁',
    emoji: '🕊️',
    description: '暗黑最经典大天使泰瑞尔全身套装！圣白兜帽 + 震撼流光天使双翼！',
    accentColor: '#38BDF8',
  },
  {
    id: 'skin_dragon',
    name: '狱火屠龙圣骑套装',
    rarity: 'SSR',
    cost: 0,
    passOnly: true,
    passTierHint: 'S1 通行证 12 级（精英暗金轨）限定解锁',
    emoji: '🐉',
    description: '熔岩龙鳞重甲 + 巨型燃焰龙翼 + 尖刺火甲，讨伐世界 BOSS 气场全开！',
    accentColor: '#DC2626',
  },
  {
    id: 'skin_gold_king',
    name: '阿克汉荣耀黄金圣甲',
    rarity: 'SSR',
    cost: 880,
    shardCost: 75,
    emoji: '✨',
    description: '暗黑传奇纯金全身圣教军板甲 + 黄金六翼 + 旋转太阳圣轮，学霸至高荣耀！',
    accentColor: '#CA8A04',
  },
  {
    id: 'skin_mecha',
    name: '太古星穹圣帝套装',
    rarity: 'MYTHIC',
    cost: 0,
    passOnly: true,
    passTierHint: 'S1 通行证 20 级终极神话套装',
    emoji: '🌌',
    description: '太古神话级全身神甲！量子蓝晶核心 + 星穹能量翼 + 双层太古符文圣环！',
    accentColor: '#06B6D4',
  },
];

// ================= 4 大梯度盲盒抽卡池（让孩子爱上开盲盒，且绝不落空！）=================
export interface MysteryBoxDef {
  id: 'box_bronze' | 'box_silver' | 'box_gold' | 'box_mythic';
  name: string;
  emoji: string;
  cost: number;
  rarity: 'R' | 'SR' | 'SSR' | 'MYTHIC';
  tagline: string;
  oddsText: string;
  bgGradient: string;
  borderColor: string;
}

export const MYSTERY_BOX_CATALOG: MysteryBoxDef[] = [
  {
    id: 'box_bronze',
    name: '青铜探案盲盒',
    emoji: '🥉',
    cost: 45,
    rarity: 'R',
    tagline: '高性价比日常盲盒！刷 3~4 宗案就能拆一个！',
    oddsText: '必出实用道具/圣光精粹 + 1~3 枚套装碎片（小概率直出暗黑神装）',
    bgGradient: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
    borderColor: '#FB923C',
  },
  {
    id: 'box_silver',
    name: '白银装备盲盒',
    emoji: '🥈',
    cost: 95,
    rarity: 'SR',
    tagline: '专爆暗黑经典神装（军帽/末日使者/暴风之盾/披风）与强力道具！',
    oddsText: '35% 直出未拥有暗黑神装 · 必出 3~5 枚套装碎片 + 双倍药水/暴击弹',
    bgGradient: 'linear-gradient(135deg, #F1F5F9, #DBEAFE)',
    borderColor: '#3B82F6',
  },
  {
    id: 'box_gold',
    name: '黄金套装盲盒',
    emoji: '🥇',
    cost: 180,
    rarity: 'SSR',
    tagline: '欧皇最爱！高爆套装碎片，更有机会一发入魂直出圣骑士全身套装！',
    oddsText: '22% 欧皇直出未拥有全身套装 · 必出 6~10 枚套装碎片 + 海量赛季点/圣光精粹',
    bgGradient: 'linear-gradient(135deg, #FEF9C3, #FDE68A)',
    borderColor: '#F59E0B',
  },
  {
    id: 'box_mythic',
    name: '传说神话盲盒',
    emoji: '🌌',
    cost: 320,
    rarity: 'MYTHIC',
    tagline: '至尊豪华大盲盒！高概率直出稀有全身套装或暗黑神装，保底狂掉碎片！',
    oddsText: '45% 直出未拥有全身套装/暗黑神装 · 必出 12~18 枚套装碎片 + 全套顶配道具',
    bgGradient: 'linear-gradient(135deg, #EDE9FE, #CFFAFE)',
    borderColor: '#06B6D4',
  },
];

// ================= 5 种实战功能道具（可在做题与 Boss 战中使用）=================
export const PROP_CATALOG: PropItemDef[] = [
  {
    id: 'item_scanner',
    name: '透视线索扫描仪',
    emoji: '🔦',
    cost: 22,
    description: '破案或 Boss 战使用：瞬间照出全部隐藏线索，拿线索星并打破 Boss 护盾！',
    usableIn: 'case',
    accentColor: '#2563EB',
  },
  {
    id: 'item_fifty',
    name: '50/50 排除剪刀',
    emoji: '✂️',
    cost: 25,
    description: '咔嚓剪掉 1~2 个干扰选项，难题秒变超轻松二选一！',
    usableIn: 'case',
    accentColor: '#7C3AED',
  },
  {
    id: 'item_double_star',
    name: '双倍星星药水',
    emoji: '🧪',
    cost: 28,
    description: '使用后本宗案件破案星星直接 ×2 翻倍（配王牌悬案最划算）！',
    usableIn: 'case',
    accentColor: '#D97706',
  },
  {
    id: 'item_boss_bomb',
    name: 'Boss 暴击能量弹',
    emoji: '💣',
    cost: 35,
    description: '在冒险地图 Boss 战中投出：直接炸掉大魔王 1 格血量！',
    usableIn: 'boss',
    accentColor: '#DC2626',
  },
  {
    id: 'item_lucky_clover',
    name: '连击守护四叶草',
    emoji: '🍀',
    cost: 20,
    description: '在探案中激活：本关就算不小心点错一次，也能护住你的火焰连击不断！',
    usableIn: 'case',
    accentColor: '#059669',
  },
];

// ================= S1 赛季通行证（20 级长线双轨奖励 · 总计 3600 SP，满满盲盒与限定皮肤！） =================
export const ELITE_PASS_UNLOCK_STARS = 300; // 累计赚满 300 星星或击败 3 位 Boss 即可免费激活精英轨！

export const SEASON_TIERS: SeasonTier[] = [
  {
    tier: 1, requiredSp: 50,
    freeReward: { kind: 'prop', itemId: 'box_bronze', amount: 1, label: '青铜探案盲盒 ×1', emoji: '🥉' },
    eliteReward: { kind: 'prop', itemId: 'item_scanner', amount: 2, label: '透视扫描仪 ×2', emoji: '🔦' },
  },
  {
    tier: 2, requiredSp: 120,
    freeReward: { kind: 'stars', amount: 18, label: '18 侦探星', emoji: '⭐' },
    eliteReward: { kind: 'prop', itemId: 'box_silver', amount: 1, label: '白银装备盲盒 ×1', emoji: '🥈' },
  },
  {
    tier: 3, requiredSp: 210,
    freeReward: { kind: 'treats', amount: 2, label: '圣光精粹 ×2', emoji: '🔮' },
    eliteReward: { kind: 'gear', itemId: 'gear_eyes_cool', label: '限定：暗影猎魔眼罩', emoji: '🏴‍☠️' },
  },
  {
    tier: 4, requiredSp: 310,
    freeReward: { kind: 'prop', itemId: 'box_bronze', amount: 1, label: '青铜探案盲盒 ×1', emoji: '🥉' },
    eliteReward: { kind: 'prop', itemId: 'box_silver', amount: 1, label: '白银装备盲盒 ×1', emoji: '🥈' },
  },
  {
    tier: 5, requiredSp: 430,
    freeReward: { kind: 'prop', itemId: 'box_silver', amount: 1, label: '白银装备盲盒 ×1', emoji: '🥈' },
    eliteReward: { kind: 'prop', itemId: 'item_boss_bomb', amount: 2, label: 'BOSS 暴击弹 ×2', emoji: '💣' },
  },
  {
    tier: 6, requiredSp: 570,
    freeReward: { kind: 'skin', itemId: 'skin_astronaut', label: 'SSR 套装：泰瑞尔大天使套', emoji: '🕊️' },
    eliteReward: { kind: 'prop', itemId: 'box_gold', amount: 1, label: '黄金皮肤盲盒 ×1', emoji: '🥇' },
  },
  {
    tier: 7, requiredSp: 720,
    freeReward: { kind: 'prop', itemId: 'item_fifty', amount: 2, label: '破魔剪刀 ×2', emoji: '✂️' },
    eliteReward: { kind: 'gear', itemId: 'gear_hat_headset', label: '限定：圣光双翼大头盔', emoji: '🦅' },
  },
  {
    tier: 8, requiredSp: 890,
    freeReward: { kind: 'prop', itemId: 'box_silver', amount: 1, label: '白银装备盲盒 ×1', emoji: '🥈' },
    eliteReward: { kind: 'prop', itemId: 'box_gold', amount: 1, label: '黄金皮肤盲盒 ×1', emoji: '🥇' },
  },
  {
    tier: 9, requiredSp: 1070,
    freeReward: { kind: 'treats', amount: 3, label: '圣光精粹 ×3', emoji: '🔮' },
    eliteReward: { kind: 'prop', itemId: 'item_double_star', amount: 2, label: '双倍药水 ×2', emoji: '🧪' },
  },
  {
    tier: 10, requiredSp: 1270,
    freeReward: { kind: 'gear', itemId: 'gear_tool_lightsaber', label: '传说神兵：碧蓝怒火神剑', emoji: '⚔️' },
    eliteReward: { kind: 'prop', itemId: 'box_mythic', amount: 1, label: '传说神话盲盒 ×1', emoji: '🌌' },
  },
  {
    tier: 11, requiredSp: 1480,
    freeReward: { kind: 'prop', itemId: 'box_bronze', amount: 2, label: '青铜探案盲盒 ×2', emoji: '🥉' },
    eliteReward: { kind: 'prop', itemId: 'item_lucky_clover', amount: 3, label: '守护四叶草 ×3', emoji: '🍀' },
  },
  {
    tier: 12, requiredSp: 1700,
    freeReward: { kind: 'prop', itemId: 'box_gold', amount: 1, label: '黄金皮肤盲盒 ×1', emoji: '🥇' },
    eliteReward: { kind: 'skin', itemId: 'skin_dragon', label: 'SSR 套装：狱火屠龙圣骑套', emoji: '🐉' },
  },
  {
    tier: 13, requiredSp: 1930,
    freeReward: { kind: 'stars', amount: 35, label: '35 侦探星', emoji: '⭐' },
    eliteReward: { kind: 'prop', itemId: 'box_silver', amount: 2, label: '白银装备盲盒 ×2', emoji: '🥈' },
  },
  {
    tier: 14, requiredSp: 2170,
    freeReward: { kind: 'prop', itemId: 'box_silver', amount: 1, label: '白银装备盲盒 ×1', emoji: '🥈' },
    eliteReward: { kind: 'gear', itemId: 'gear_cape_flame', label: '史诗战袍：地狱火魔王披风', emoji: '🔥' },
  },
  {
    tier: 15, requiredSp: 2420,
    freeReward: { kind: 'prop', itemId: 'box_gold', amount: 1, label: '黄金皮肤盲盒 ×1', emoji: '🥇' },
    eliteReward: { kind: 'prop', itemId: 'box_mythic', amount: 1, label: '传说神话盲盒 ×1', emoji: '🌌' },
  },
  {
    tier: 16, requiredSp: 2680,
    freeReward: { kind: 'treats', amount: 4, label: '圣光精粹 ×4', emoji: '🔮' },
    eliteReward: { kind: 'prop', itemId: 'item_scanner', amount: 4, label: '透视扫描仪 ×4', emoji: '🔦' },
  },
  {
    tier: 17, requiredSp: 2940,
    freeReward: { kind: 'prop', itemId: 'box_silver', amount: 2, label: '白银装备盲盒 ×2', emoji: '🥈' },
    eliteReward: { kind: 'gear', itemId: 'gear_hat_mecha', label: '太古战盔：泰瑞尔圣光面甲', emoji: '🌟' },
  },
  {
    tier: 18, requiredSp: 3180,
    freeReward: { kind: 'prop', itemId: 'box_gold', amount: 1, label: '黄金皮肤盲盒 ×1', emoji: '🥇' },
    eliteReward: { kind: 'prop', itemId: 'box_mythic', amount: 1, label: '传说神话盲盒 ×1', emoji: '🌌' },
  },
  {
    tier: 19, requiredSp: 3400,
    freeReward: { kind: 'prop', itemId: 'box_mythic', amount: 1, label: '传说神话盲盒 ×1', emoji: '🌌' },
    eliteReward: { kind: 'gear', itemId: 'gear_badge_diamond', label: '太古圣盾：暴风之盾', emoji: '💎' },
  },
  {
    tier: 20, requiredSp: 3600,
    freeReward: { kind: 'prop', itemId: 'box_mythic', amount: 2, label: '传说神话盲盒 ×2', emoji: '🌌' },
    eliteReward: { kind: 'skin', itemId: 'skin_mecha', label: '神话终极套装：太古星穹圣帝套', emoji: '🌌' },
  },
];

// ================= 每日赛季悬赏任务 =================
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
    id: 'dq_any_3',
    title: '今日破获 3 宗任意案件',
    emoji: '🔍',
    target: 3,
    rewardSp: 35,
    rewardStars: 10,
    getCurrent: (d) => d.casesSolved,
  },
  {
    id: 'dq_eng_2',
    title: '完成 2 宗英语语法探案',
    emoji: '🇬🇧',
    target: 2,
    rewardSp: 30,
    rewardStars: 8,
    getCurrent: (d) => d.englishSolved,
  },
  {
    id: 'dq_math_2',
    title: '完成 2 宗数学逻辑探案',
    emoji: '🧮',
    target: 2,
    rewardSp: 30,
    rewardStars: 8,
    getCurrent: (d) => d.mathSolved,
  },
  {
    id: 'dq_clue_2',
    title: '用放大镜找齐 2 宗案的全部线索',
    emoji: '✨',
    target: 2,
    rewardSp: 28,
    rewardStars: 10,
    getCurrent: (d) => d.cluesAllFound,
  },
  {
    id: 'dq_exam_1',
    title: '完成 1 套完整模拟卷或击败 1 位 Boss',
    emoji: '🏆',
    target: 1,
    rewardSp: 55,
    rewardStars: 15,
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

export function getTotalBoxesInInventory(inv: Partial<Record<PropItemId, number>> | undefined): number {
  if (!inv) return 0;
  return (inv.box_bronze || 0) + (inv.box_silver || 0) + (inv.box_gold || 0) + (inv.box_mythic || 0) + (inv.item_mystery_box || 0);
}
