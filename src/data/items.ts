export type ItemEffect =
  | { type: 'HEAL'; amount: number }
  | { type: 'PERMANENT_STAT'; stat: 'maxHealth' | 'attack' | 'defense'; amount: number }
  | { type: 'GUARANTEE_FLEE' }
  | { type: 'DEAL_DAMAGE'; amount: number }
  | { type: 'TEMP_BUFF'; stat: 'attack' | 'defense'; amount: number; duration: number }
  | { type: 'CURE_STATUS' }  // 解除異常狀態
  | { type: 'ELEMENTAL_DAMAGE'; element: 'fire' | 'ice' | 'lightning'; amount: number };

export type ItemStats = {
  attack?: number;
  defense?: number;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'weapon' | 'armor';
  equipSlot?: 'weapon' | 'armor';
  effect?: ItemEffect;
  stats?: ItemStats;
};

export const items: Item[] = [
  // --- Consumables (消耗品) ---
  {
    id: 'herb',
    name: '藥草',
    description: '熟悉的綠色葉片，咀嚼後能稍微恢復生命。',
    type: 'consumable',
    effect: { type: 'HEAL', amount: 25 },
  },
  {
    id: 'strong_herb',
    name: '上等藥草',
    description: '經過精心挑選的藥草，擁有更強的療效。',
    type: 'consumable',
    effect: { type: 'HEAL', amount: 60 },
  },
  {
    id: 'smoke_bomb',
    name: '煙霧彈',
    description: '產生濃厚的煙霧，是從戰鬥中脫身的可靠手段。',
    type: 'consumable',
    effect: { type: 'GUARANTEE_FLEE' },
  },
  {
    id: 'bomb',
    name: '炸彈',
    description: '一個簡單的爆炸裝置，能對敵人造成約 30 點傷害。',
    type: 'consumable',
    effect: { type: 'DEAL_DAMAGE', amount: 30 },
  },
  {
    id: 'seed_of_strength',
    name: '力量種子',
    description: '蘊含著力量的奇異種子，服用後能永久提升攻擊力。',
    type: 'consumable',
    effect: { type: 'PERMANENT_STAT', stat: 'attack', amount: 1 },
  },
  {
    id: 'seed_of_life',
    name: '生命種子',
    description: '充滿生命能量的種子，能永久提升最大生命值。',
    type: 'consumable',
    effect: { type: 'PERMANENT_STAT', stat: 'maxHealth', amount: 3 },
  },
  
  // --- 新增戰術性消耗品 ---
  {
    id: 'iron_skin_potion',
    name: '鐵皮藥水',
    description: '服用後皮膚暫時變得如鐵般堅硬，3 回合內防禦力 +8。',
    type: 'consumable',
    effect: { type: 'TEMP_BUFF', stat: 'defense', amount: 8, duration: 3 },
  },
  {
    id: 'berserker_potion',
    name: '狂戰士藥劑',
    description: '喝下後戰意沸騰，3 回合內攻擊力 +10。',
    type: 'consumable',
    effect: { type: 'TEMP_BUFF', stat: 'attack', amount: 10, duration: 3 },
  },
  {
    id: 'antidote',
    name: '解毒劑',
    description: '能解除中毒、灼燒等持續傷害狀態。',
    type: 'consumable',
    effect: { type: 'CURE_STATUS' },
  },
  {
    id: 'fire_scroll',
    name: '火焰卷軸',
    description: '釋放卷軸中封印的火焰魔法，對敵人造成 40 點火焰傷害。',
    type: 'consumable',
    effect: { type: 'ELEMENTAL_DAMAGE', element: 'fire', amount: 40 },
  },
  {
    id: 'ice_scroll',
    name: '冰霜卷軸',
    description: '釋放刺骨的寒氣，對敵人造成 35 點冰霜傷害。',
    type: 'consumable',
    effect: { type: 'ELEMENTAL_DAMAGE', element: 'ice', amount: 35 },
  },
  {
    id: 'lightning_scroll',
    name: '閃電卷軸',
    description: '召喚雷霆之力，對敵人造成 45 點雷電傷害。',
    type: 'consumable',
    effect: { type: 'ELEMENTAL_DAMAGE', element: 'lightning', amount: 45 },
  },

  // --- Weapons (武器) ---
  {
    id: 'cypress_stick',
    name: '檜木棒',
    description: '隨處可見的木棒，總比空手好。',
    type: 'weapon',
    equipSlot: 'weapon',
    stats: { attack: 2 },
  },
  {
    id: 'copper_sword',
    name: '銅劍',
    description: '新手冒險者的標準配備，一把用青銅打造的短劍。',
    type: 'weapon',
    equipSlot: 'weapon',
    stats: { attack: 5 },
  },
  {
    id: 'iron_axe',
    name: '鐵斧',
    description: '沉重的鐵斧，雖然揮舞較慢，但破壞力十足。',
    type: 'weapon',
    equipSlot: 'weapon',
    stats: { attack: 9 },
  },
  {
    id: 'steel_sword',
    name: '鋼劍',
    description: '由熟練工匠鍛造的長劍，鋒利且可靠。',
    type: 'weapon',
    equipSlot: 'weapon',
    stats: { attack: 15 },
  },

  // --- Armor (防具) ---
  {
    id: 'leather_armor',
    name: '皮甲',
    description: '由鞣製獸皮製成的輕便護甲，能提供基礎的防護。',
    type: 'armor',
    equipSlot: 'armor',
    stats: { defense: 3 },
  },
  {
    id: 'chain_mail',
    name: '鎖子甲',
    description: '以金屬環編織而成的護甲，能有效抵禦劈砍。',
    type: 'armor',
    equipSlot: 'armor',
    stats: { defense: 6 },
  },
  {
    id: 'iron_armor',
    name: '鐵甲',
    description: '厚重的鐵製盔甲，提供絕佳的防禦，但稍微有點笨重。',
    type: 'armor',
    equipSlot: 'armor',
    stats: { defense: 10 },
  },
  {
    id: 'magic_shield',
    name: '魔法盾',
    description: '刻有魔法符文的盾牌，能小幅提升防禦力，並抵禦微弱的詛咒。',
    type: 'armor',
    equipSlot: 'armor',
    stats: { defense: 12 },
  },
];

export const getItemById = (id: string): Item | undefined => {
  return items.find((item) => item.id === id);
};
