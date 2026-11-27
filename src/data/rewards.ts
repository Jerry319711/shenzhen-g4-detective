import { EquipmentItem } from '../types';

export interface RankTier {
  level: number;
  title: string;
  minStars: number;
  badge: string;
  tagline: string;
}

export const RANK_TIERS: RankTier[] = [
  { level: 1, title: '见习圣殿骑士', minStars: 0, badge: '🛡️', tagline: '举起圣光之盾，踏上庇护所试炼之路！' },
  { level: 2, title: '破魔十字军', minStars: 120, badge: '⚔️', tagline: '你已经学会用真视之眼识破一切粗心陷阱！' },
  { level: 3, title: '青铜圣骑士', minStars: 280, badge: '🥉', tagline: '再狡猾的精英怪也挡不住你的圣光连击！' },
  { level: 4, title: '白银审判官', minStars: 520, badge: '🥈', tagline: '画图拆解难题，逻辑与剑术日益精进！' },
  { level: 5, title: '暗金大领主', minStars: 850, badge: '🥇', tagline: '深圳四年级庇护所最耀眼的传奇圣骑士！' },
  { level: 6, title: '太古圣光大帝', minStars: 1400, badge: '👑', tagline: '直面任何世界 BOSS 都能微笑斩杀的传奇王者！' },
];

export function getRankForStars(totalStars: number): { current: RankTier; next: RankTier | null; progressPct: number } {
  let current = RANK_TIERS[0];
  let next: RankTier | null = RANK_TIERS[1] || null;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (totalStars >= RANK_TIERS[i].minStars) {
      current = RANK_TIERS[i];
      next = RANK_TIERS[i + 1] || null;
    }
  }
  if (!next) return { current, next: null, progressPct: 100 };
  const span = next.minStars - current.minStars;
  const into = totalStars - current.minStars;
  return {
    current,
    next,
    progressPct: Math.min(100, Math.max(0, Math.round((into / span) * 100))),
  };
}

// 16 件暗黑破坏神经典圣骑士神装（头盔 / 眼甲圣印 / 主手神兵 / 战披风 / 副手圣盾）
export const EQUIPMENT_CATALOG: EquipmentItem[] = [
  {
    id: 'gear_magnifier_basic',
    name: '圣光制式长剑',
    slot: 'tool',
    cost: 0,
    description: '萨卡兰姆新人圣骑士配剑，挥剑斩碎一切粗心迷雾。',
    emoji: '🗡️',
  },
  {
    id: 'gear_hat_classic',
    name: '军帽·谐角之冠',
    slot: 'hat',
    cost: 55,
    description: '暗黑传奇绿兜帽！佩戴后审题全属性 +2，大脑飞速运转！',
    emoji: '🪖',
  },
  {
    id: 'gear_eyes_goggles',
    name: '真视圣光护目镜',
    slot: 'eyes',
    cost: 75,
    description: '穿透暗影迷雾，一眼识破“往返”“还剩”“三单”陷阱词！',
    emoji: '🥽',
  },
  {
    id: 'gear_badge_clover',
    name: '撒卡兰姆使者圣盾',
    slot: 'badge',
    cost: 85,
    description: '暗黑圣骑士最经典绿金十字鸢盾！稳稳格挡粗心伤害！',
    emoji: '🛡️',
  },
  {
    id: 'gear_eyes_cool',
    name: '暗影猎魔战损眼罩',
    slot: 'eyes',
    cost: 110,
    description: '庇护所独行猎魔人的酷炫标志，霸气凛然！',
    emoji: '🏴‍☠️',
  },
  {
    id: 'gear_tool_gold',
    name: '末日使者·圣焰巨剑',
    slot: 'tool',
    cost: 120,
    description: '燃烧圣焰的暗黑传奇双手巨剑，一剑劈碎语法小偷伪装！',
    emoji: '🔥',
  },
  {
    id: 'gear_eyes_monocle',
    name: '赫拉迪姆洞察之眼',
    slot: 'eyes',
    cost: 135,
    description: '古老赫拉迪姆法师锻造的金环符文眼，看穿几何角度奥秘！',
    emoji: '🧐',
  },
  {
    id: 'gear_hat_wizard',
    name: '奥术符文圣殿盔',
    slot: 'hat',
    cost: 140,
    description: '刻满紫金符文的法战重盔，让抽象方程瞬间化繁为简！',
    emoji: '🧙',
  },
  {
    id: 'gear_cape_star',
    name: '萨卡兰姆皇家战披风',
    slot: 'cape',
    cost: 150,
    description: '深蓝镶金的圣殿长披风，献给无畏困难的勇敢骑士！',
    emoji: '🦸',
  },
  {
    id: 'gear_eyes_star',
    name: '天堂圣裁发光眼印',
    slot: 'eyes',
    cost: 165,
    description: '双眸绽放紫金圣裁辉光，直视应用题隐藏数量关系！',
    emoji: '⚡',
  },
  {
    id: 'gear_hat_headset',
    name: '圣光双翼大头盔',
    slot: 'hat',
    cost: 170,
    description: '银金双翼全覆圣骑重盔，自带学霸专注圣光结界！',
    emoji: '🦅',
  },
  {
    id: 'gear_tool_wand',
    name: '圣光裁决雷霆战锤',
    slot: 'tool',
    cost: 190,
    description: '暗黑传奇雷霆圣锤！重锤一落，乘法分配律与天平瞬间对齐！',
    emoji: '🔨',
  },
  {
    id: 'gear_hat_crown',
    name: '李奥瑞克的黄金王冠',
    slot: 'hat',
    cost: 220,
    description: '镶嵌红蓝宝石的庇护所传奇王冠，无上荣耀象征！',
    emoji: '👑',
  },
  {
    id: 'gear_tool_lightsaber',
    name: '碧蓝怒火·冰光神剑',
    slot: 'tool',
    cost: 240,
    description: '暗黑传说级发光圣剑！凛冽冰蓝剑气横扫一切难题首领！',
    emoji: '⚔️',
  },
  {
    id: 'gear_cape_flame',
    name: '地狱火魔王战披风',
    slot: 'cape',
    cost: 260,
    description: '流淌熔岩烈焰的史诗披风，讨伐世界 BOSS 的至高战袍！',
    emoji: '🔥',
  },
  {
    id: 'gear_hat_mecha',
    name: '泰瑞尔·太古圣光面甲',
    slot: 'hat',
    cost: 280,
    description: '太古神话级大天使全覆战盔，青金神光震撼全场！',
    emoji: '🌟',
  },
  {
    id: 'gear_badge_diamond',
    name: '暴风之盾·太古圣盾',
    slot: 'badge',
    cost: 320,
    description: '暗黑至强传说巨盾！闪耀冰蓝雷光，万邪不侵！',
    emoji: '💎',
  },
];

// 零惩罚暖心圣光鼓励语录库
export const COURAGE_QUOTES = [
  '圣光护盾已替你挡下陷阱！发现破绽不是失败，而是离斩杀又近了一步！',
  '最伟大的圣骑士也是在一次次格挡反击中练成无敌剑术的！',
  '慢一点没关系，把题干当成地下城藏宝图，先破盾再出剑最稳！',
  '召唤圣光锦囊超聪明！真正的猎魔大师都懂得借用智慧符文！',
  '每一次你停下来多看一眼关键词，圣骑士的战力就飙升一分！',
  '别怕 300 HP 首领！我们用多段连招一口气把它拆解斩杀！',
];

export const CELEBRATION_QUOTES = [
  '太帅了！这波破盾暴击简直史诗级操作！',
  '完美斩杀！再狡猾的精英怪也逃不过你的圣光真视！',
  '你看，只要静下心破盾找线索，大首领一招就倒下啦！',
  '传奇胜利！你的数学逻辑与英语剑术都在飞速升级！',
  '全庇护所为你欢呼！你刚才这一战超级细心！',
];
