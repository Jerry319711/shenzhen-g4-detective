import { EquipmentItem } from '../types';

export interface RankTier {
  level: number;
  title: string;
  minStars: number;
  badge: string;
  tagline: string;
}

export const RANK_TIERS: RankTier[] = [
  { level: 1, title: '见习小探员', minStars: 0, badge: '🔍', tagline: '好奇心是神探最强的超能力！' },
  { level: 2, title: '线索小猎手', minStars: 60, badge: '🐾', tagline: '你已经学会用放大镜抓陷阱啦！' },
  { level: 3, title: '铜牌观察家', minStars: 140, badge: '🥉', tagline: '再狡猾的小陷阱也逃不过你的眼睛！' },
  { level: 4, title: '银牌逻辑师', minStars: 260, badge: '🥈', tagline: '画图拆解难题，思路越来越清晰！' },
  { level: 5, title: '金牌大侦探', minStars: 420, badge: '🥇', tagline: '深圳四年级最闪耀的破案新星！' },
  { level: 6, title: '传奇福尔摩斯', minStars: 650, badge: '👑', tagline: '遇到任何难题都能微笑化解的传奇神探！' },
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

export const EQUIPMENT_CATALOG: EquipmentItem[] = [
  {
    id: 'gear_magnifier_basic',
    name: '探员放大镜',
    slot: 'tool',
    cost: 0,
    description: '新人标配！帮你一眼照出句子和题干里的隐藏线索。',
    emoji: '🔍',
  },
  {
    id: 'gear_hat_classic',
    name: '经典格纹侦探帽',
    slot: 'hat',
    cost: 25,
    description: '戴上它，思考数学逻辑时大脑转得飞快！',
    emoji: '🕵️',
  },
  {
    id: 'gear_eyes_goggles',
    name: '防粗心护目镜',
    slot: 'eyes',
    cost: 35,
    description: '能把“往返”“还剩”“三单”这些小陷阱自动高亮！',
    emoji: '🥽',
  },
  {
    id: 'gear_tool_gold',
    name: '黄金激光放大镜',
    slot: 'tool',
    cost: 50,
    description: '传说中能照穿一切语法小偷伪装的神器！',
    emoji: '✨',
  },
  {
    id: 'gear_cape_star',
    name: '星辰勇气披风',
    slot: 'cape',
    cost: 65,
    description: '献给不怕困难、敢于再试一次的勇敢神探！',
    emoji: '🦸',
  },
  {
    id: 'gear_hat_crown',
    name: '星光王冠帽',
    slot: 'hat',
    cost: 90,
    description: '顶级大侦探的荣誉象征，闪闪发光！',
    emoji: '👑',
  },
  {
    id: 'gear_eyes_star',
    name: '星际扫描眼镜',
    slot: 'eyes',
    cost: 80,
    description: '酷炫科幻风，看穿应用题的隐藏数量关系！',
    emoji: '🕶️',
  },
  {
    id: 'gear_badge_clover',
    name: '冷静四叶草徽章',
    slot: 'badge',
    cost: 45,
    description: '提醒自己深呼吸、慢半拍，细心就能赢！',
    emoji: '🍀',
  },
];

// 零惩罚暖心鼓励语录库
export const COURAGE_QUOTES = [
  '发现陷阱不是失败，而是离真相又近了一大步！',
  '大侦探福尔摩斯也要先看错两条线索，才能抓住真凶呢！',
  '慢一点没关系，把题目当成寻宝地图，仔细看才最好玩！',
  '点“向阿探求助”超聪明！真正的高手都懂得借用线索工具！',
  '每一次你停下来多看一眼关键词，大脑里的“神探肌肉”就变强一分！',
  '别怕难题！我们把它切成小块块，一口一口轻松吃掉！',
];

export const CELEBRATION_QUOTES = [
  '太帅了！这波推理简直教科书级别！',
  '抓到啦！再狡猾的小陷阱也骗不过你的火眼金睛！',
  '你看，只要静下心找线索，难题一下子就变简单啦！',
  '完美破案！你的逻辑力正在悄悄升级哦！',
  '阿探给你点一万个赞！你刚才超细心的！',
];
