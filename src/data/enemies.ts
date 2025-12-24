export interface EnemyLoot {
  itemId: string; // 對應 items.ts 中的物品 ID
  chance: number; // 掉落機率 (0 到 1)
}

export interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  attack: number;
  defense: number;
  exp: number; // 擊敗後獲得的經驗值
  gold: [min: number, max: number]; // 擊敗後獲得的金幣範圍
  loot: EnemyLoot[]; // 戰利品表
  dangerLevel: number; // 危險等級，用於配對地點
}

export const ENEMIES: Enemy[] = [
  // --- 危險等級 1 ---
  {
    id: 'slime',
    name: '史萊姆',
    description: '一坨晃動的綠色凝膠，是新手冒險者最好的練習對象。',
    health: 15,
    attack: 6,
    defense: 2,
    exp: 2,
    gold: [1, 5],
    loot: [{ itemId: 'herb', chance: 0.2 }],
    dangerLevel: 1,
  },
  {
    id: 'giant_rat',
    name: '巨型老鼠',
    description: '生活在陰暗角落的巨大囓齒動物，比看起來更兇猛。',
    health: 20,
    attack: 8,
    defense: 1,
    exp: 3,
    gold: [2, 8],
    loot: [{ itemId: 'herb', chance: 0.1 }],
    dangerLevel: 1,
  },

  // --- 危險等級 2 ---
  {
    id: 'goblin',
    name: '哥布林',
    description: '狡猾的小型類人生物，喜歡群體行動並偷襲旅人。',
    health: 35,
    attack: 12,
    defense: 4,
    exp: 8,
    gold: [5, 15],
    loot: [
      { itemId: 'copper_sword', chance: 0.05 },
      { itemId: 'leather_armor', chance: 0.1 },
    ],
    dangerLevel: 2,
  },
  {
    id: 'wolf',
    name: '野狼',
    description: '森林中的掠食者，擁有敏銳的直覺和鋒利的牙齒。',
    health: 45,
    attack: 15,
    defense: 3,
    exp: 10,
    gold: [8, 20],
    loot: [],
    dangerLevel: 2,
  },

  // --- 危險等級 3 ---
  {
    id: 'skeleton_warrior',
    name: '骷髏戰士',
    description: '被黑魔法喚醒的古代士兵，即使只剩骨頭依然揮舞著生鏽的劍。',
    health: 70,
    attack: 20,
    defense: 12,
    exp: 25,
    gold: [15, 30],
    loot: [
      { itemId: 'iron_axe', chance: 0.08 },
    ],
    dangerLevel: 3,
  },
  {
    id: 'harpy',
    name: '鷹身女妖',
    description: '長著女人頭和鳥身體的怪物，歌聲可以迷惑人心。',
    health: 60,
    attack: 25,
    defense: 8,
    exp: 22,
    gold: [20, 40],
    loot: [],
    dangerLevel: 3,
  },

  // --- 危險等級 4 ---
  {
    id: 'orc_berserker',
    name: '獸人狂戰士',
    description: '身材魁梧的獸人，進入戰鬥後會陷入瘋狂，攻擊不分敵我。',
    health: 120,
    attack: 35,
    defense: 15,
    exp: 50,
    gold: [40, 80],
    loot: [
      { itemId: 'steel_sword', chance: 0.1 },
    ],
    dangerLevel: 4,
  },
  {
    id: 'stone_golem',
    name: '石頭魔像',
    description: '由魔法驅動的巨大石像，防禦力極高，物理攻擊很難對其奏效。',
    health: 150,
    attack: 30,
    defense: 30,
    exp: 60,
    gold: [50, 100],
    loot: [],
    dangerLevel: 4,
  },

  // --- 危險等級 5 (菁英怪) ---
  {
    id: 'wyvern',
    name: '雙足飛龍',
    description: '龍的亞種，雖然體型較小，但飛行能力和噴吐的火焰依然致命。',
    health: 200,
    attack: 50,
    defense: 25,
    exp: 120,
    gold: [100, 200],
    loot: [],
    dangerLevel: 5,
  },
  {
    id: 'shadow_assassin',
    name: '暗影刺客',
    description: '潛伏在黑暗中的殺手，動作迅捷，攻擊附帶致命的劇毒。',
    health: 150,
    attack: 60,
    defense: 20,
    exp: 110,
    gold: [120, 250],
    loot: [],
    dangerLevel: 5,
  },

  // --- BOSS 等級 ---
  {
    id: 'ancient_golem',
    name: '遠古魔像',
    description: '守護著古代遺蹟的巨大守護者，身上銘刻著失落的符文。',
    health: 500,
    attack: 55,
    defense: 50,
    exp: 500,
    gold: [500, 1000],
    loot: [],
    dangerLevel: 6,
  },
  {
    id: 'vibe_overlord',
    name: '維度魔王・瓦伊布',
    description: '扭曲現實的最終威脅，其存在本身就能讓周遭的空間產生共鳴與脈動。祂是所有冒險的終點，也是最強的試煉。',
    health: 1500,
    attack: 80,
    defense: 40,
    exp: 0,
    gold: [9999, 9999],
    loot: [],
    dangerLevel: 7,
  },
];

/**
 * 根據 ID 獲取敵人資料
 * @param id 敵人 ID
 * @returns Enemy or undefined
 */
export const getEnemyById = (id: string): Enemy | undefined => {
  return ENEMIES.find((enemy) => enemy.id === id);
};
