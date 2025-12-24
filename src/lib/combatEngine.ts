/**
 * 戰鬥引擎 - 處理所有傷害計算、暴擊、閃避、狀態效果
 */

import { PlayerData } from '@/types/game';

// 戰鬥中的敵人狀態（包含特殊技能與狀態效果）
export interface CombatEnemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  critChance: number;    // 暴擊率 (0-1)
  evasionChance: number; // 閃避率 (0-1)
  skills: EnemySkill[];
  statusEffects: StatusEffect[];
}

// 敵人技能定義
export interface EnemySkill {
  id: string;
  name: string;
  description: string;
  type: 'POISON' | 'FIRE_BREATH' | 'HEAVY_STRIKE' | 'HEAL' | 'DEFENSE_BUFF';
  chance: number;        // 使用機率 (0-1)
  damage?: number;       // 固定傷害
  damageMultiplier?: number; // 傷害倍率
  duration?: number;     // 持續回合數
  dotDamage?: number;    // 每回合傷害 (毒、火)
  healAmount?: number;   // 回復量
  buffAmount?: number;   // 增益數值
}

// 狀態效果
export interface StatusEffect {
  id: string;
  name: string;
  type: 'DOT' | 'BUFF' | 'DEBUFF';
  remainingTurns: number;
  damagePerTurn?: number;
  statModifier?: { stat: 'attack' | 'defense'; amount: number };
}

// 戰鬥行動結果
export interface CombatActionResult {
  success: boolean;
  damage: number;
  isCritical: boolean;
  isEvaded: boolean;
  message: string;
  skillUsed?: EnemySkill;
  statusApplied?: StatusEffect;
}

// 玩家戰鬥屬性（從 PlayerData 計算）
export interface PlayerCombatStats {
  attack: number;
  defense: number;
  critChance: number;
  evasionChance: number;
  level: number;
}

// 預設敵人技能庫
export const ENEMY_SKILLS: Record<string, EnemySkill[]> = {
  shadow_assassin: [
    {
      id: 'poison_blade',
      name: '淬毒刀刃',
      description: '攻擊附帶劇毒，造成持續傷害。',
      type: 'POISON',
      chance: 0.4,
      damageMultiplier: 0.8,
      duration: 3,
      dotDamage: 8,
    },
  ],
  wyvern: [
    {
      id: 'fire_breath',
      name: '火焰噴吐',
      description: '噴出熾熱的火焰，造成大量傷害並灼燒目標。',
      type: 'FIRE_BREATH',
      chance: 0.35,
      damageMultiplier: 1.5,
      duration: 2,
      dotDamage: 5,
    },
  ],
  orc_berserker: [
    {
      id: 'heavy_strike',
      name: '重擊',
      description: '全力揮擊，造成巨大傷害。',
      type: 'HEAVY_STRIKE',
      chance: 0.3,
      damageMultiplier: 2.0,
    },
  ],
  stone_golem: [
    {
      id: 'fortify',
      name: '石化防禦',
      description: '強化自身防禦。',
      type: 'DEFENSE_BUFF',
      chance: 0.25,
      duration: 2,
      buffAmount: 10,
    },
  ],
  ancient_golem: [
    {
      id: 'rune_heal',
      name: '符文治癒',
      description: '啟動符文恢復生命。',
      type: 'HEAL',
      chance: 0.2,
      healAmount: 50,
    },
    {
      id: 'ancient_strike',
      name: '遠古重擊',
      description: '毀滅性的一擊。',
      type: 'HEAVY_STRIKE',
      chance: 0.3,
      damageMultiplier: 1.8,
    },
  ],
  vibe_overlord: [
    {
      id: 'reality_warp',
      name: '現實扭曲',
      description: '扭曲維度造成巨大傷害。',
      type: 'FIRE_BREATH',
      chance: 0.4,
      damageMultiplier: 2.0,
      duration: 2,
      dotDamage: 10,
    },
    {
      id: 'vibe_heal',
      name: '脈動回復',
      description: '吸收周遭能量回復自身。',
      type: 'HEAL',
      chance: 0.15,
      healAmount: 100,
    },
  ],
};

// 根據敵人等級計算暴擊/閃避率
export function getEnemyCombatStats(enemyId: string, dangerLevel: number): { critChance: number; evasionChance: number } {
  const baseCrit = 0.05;
  const baseEvasion = 0.02;
  
  // 特定敵人有特殊屬性
  const specialStats: Record<string, { crit: number; evasion: number }> = {
    shadow_assassin: { crit: 0.25, evasion: 0.20 },
    harpy: { crit: 0.10, evasion: 0.25 },
    wolf: { crit: 0.15, evasion: 0.15 },
    wyvern: { crit: 0.15, evasion: 0.10 },
  };

  if (specialStats[enemyId]) {
    return { critChance: specialStats[enemyId].crit, evasionChance: specialStats[enemyId].evasion };
  }

  return {
    critChance: Math.min(0.25, baseCrit + dangerLevel * 0.02),
    evasionChance: Math.min(0.15, baseEvasion + dangerLevel * 0.02),
  };
}

// 根據玩家等級計算暴擊/閃避率
export function getPlayerCombatStats(player: PlayerData): PlayerCombatStats {
  const baseCrit = 0.05;
  const baseEvasion = 0.03;
  
  return {
    attack: player.attack,
    defense: player.defense,
    critChance: Math.min(0.30, baseCrit + player.level * 0.01),
    evasionChance: Math.min(0.20, baseEvasion + player.level * 0.008),
    level: player.level,
  };
}

/**
 * 計算傷害（新公式）
 * 傷害 = (攻擊力 * 隨機係數) * (100 / (100 + 防禦力)) * 等級修正
 */
export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  attackerLevel: number,
  defenderLevel: number
): number {
  // 基礎傷害：攻擊力 * 隨機係數 (0.85 ~ 1.15)
  const randomMultiplier = 0.85 + Math.random() * 0.30;
  const baseDamage = attackerAttack * randomMultiplier;
  
  // 防禦減傷：100 / (100 + 防禦) 讓防禦有遞減收益
  const defenseMultiplier = 100 / (100 + defenderDefense);
  
  // 等級差異修正：每差一級 ±5%，最多 ±50%
  const levelDiff = attackerLevel - defenderLevel;
  const levelModifier = Math.max(0.5, Math.min(1.5, 1 + levelDiff * 0.05));
  
  const finalDamage = Math.floor(baseDamage * defenseMultiplier * levelModifier);
  
  // 最低傷害為 1
  return Math.max(1, finalDamage);
}

/**
 * 檢查是否暴擊
 */
export function rollCritical(critChance: number): boolean {
  return Math.random() < critChance;
}

/**
 * 檢查是否閃避
 */
export function rollEvasion(evasionChance: number): boolean {
  return Math.random() < evasionChance;
}

/**
 * 玩家攻擊敵人
 */
export function playerAttack(
  playerStats: PlayerCombatStats,
  enemy: CombatEnemy
): CombatActionResult {
  // 檢查敵人閃避
  if (rollEvasion(enemy.evasionChance)) {
    return {
      success: false,
      damage: 0,
      isCritical: false,
      isEvaded: true,
      message: `${enemy.name} 敏捷地閃開了你的攻擊！`,
    };
  }

  // 計算傷害
  let damage = calculateDamage(
    playerStats.attack,
    enemy.defense,
    playerStats.level,
    Math.ceil(enemy.maxHealth / 30) // 估算敵人等級
  );

  // 檢查暴擊
  const isCritical = rollCritical(playerStats.critChance);
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  return {
    success: true,
    damage,
    isCritical,
    isEvaded: false,
    message: isCritical
      ? `暴擊！你對 ${enemy.name} 造成了 ${damage} 點傷害！`
      : `你對 ${enemy.name} 造成了 ${damage} 點傷害。`,
  };
}

/**
 * 敵人攻擊玩家（可能使用技能）
 */
export function enemyAttack(
  enemy: CombatEnemy,
  playerStats: PlayerCombatStats
): CombatActionResult {
  // 檢查玩家閃避
  if (rollEvasion(playerStats.evasionChance)) {
    return {
      success: false,
      damage: 0,
      isCritical: false,
      isEvaded: true,
      message: `你靈活地閃避了 ${enemy.name} 的攻擊！`,
    };
  }

  // 檢查是否使用技能
  let skillUsed: EnemySkill | undefined;
  for (const skill of enemy.skills) {
    if (Math.random() < skill.chance) {
      skillUsed = skill;
      break;
    }
  }

  let damage = 0;
  let statusApplied: StatusEffect | undefined;
  let message = '';

  if (skillUsed) {
    // 使用技能
    switch (skillUsed.type) {
      case 'POISON':
      case 'FIRE_BREATH':
        damage = calculateDamage(
          enemy.attack * (skillUsed.damageMultiplier || 1),
          playerStats.defense,
          Math.ceil(enemy.maxHealth / 30),
          playerStats.level
        );
        if (skillUsed.duration && skillUsed.dotDamage) {
          statusApplied = {
            id: skillUsed.id,
            name: skillUsed.type === 'POISON' ? '中毒' : '灼燒',
            type: 'DOT',
            remainingTurns: skillUsed.duration,
            damagePerTurn: skillUsed.dotDamage,
          };
        }
        message = `${enemy.name} 使用了【${skillUsed.name}】！造成 ${damage} 點傷害${statusApplied ? `，並使你陷入${statusApplied.name}狀態！` : '！'}`;
        break;

      case 'HEAVY_STRIKE':
        damage = calculateDamage(
          enemy.attack * (skillUsed.damageMultiplier || 2),
          playerStats.defense,
          Math.ceil(enemy.maxHealth / 30),
          playerStats.level
        );
        message = `${enemy.name} 使用了【${skillUsed.name}】！造成 ${damage} 點巨大傷害！`;
        break;

      case 'HEAL':
        message = `${enemy.name} 使用了【${skillUsed.name}】，恢復了 ${skillUsed.healAmount} 點生命！`;
        break;

      case 'DEFENSE_BUFF':
        statusApplied = {
          id: skillUsed.id,
          name: '防禦強化',
          type: 'BUFF',
          remainingTurns: skillUsed.duration || 2,
          statModifier: { stat: 'defense', amount: skillUsed.buffAmount || 10 },
        };
        message = `${enemy.name} 使用了【${skillUsed.name}】，防禦力提升！`;
        break;
    }
  } else {
    // 普通攻擊
    damage = calculateDamage(
      enemy.attack,
      playerStats.defense,
      Math.ceil(enemy.maxHealth / 30),
      playerStats.level
    );

    const isCritical = rollCritical(enemy.critChance);
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
      message = `${enemy.name} 發動暴擊！造成 ${damage} 點傷害！`;
    } else {
      message = `${enemy.name} 攻擊你，造成 ${damage} 點傷害。`;
    }

    return {
      success: true,
      damage,
      isCritical,
      isEvaded: false,
      message,
    };
  }

  return {
    success: true,
    damage,
    isCritical: false,
    isEvaded: false,
    message,
    skillUsed,
    statusApplied,
  };
}

/**
 * 處理狀態效果（每回合開始時）
 */
export function processStatusEffects(
  effects: StatusEffect[]
): { damage: number; messages: string[]; remainingEffects: StatusEffect[] } {
  let totalDamage = 0;
  const messages: string[] = [];
  const remainingEffects: StatusEffect[] = [];

  for (const effect of effects) {
    if (effect.type === 'DOT' && effect.damagePerTurn) {
      totalDamage += effect.damagePerTurn;
      messages.push(`${effect.name}效果造成 ${effect.damagePerTurn} 點傷害！`);
    }

    const newEffect = { ...effect, remainingTurns: effect.remainingTurns - 1 };
    if (newEffect.remainingTurns > 0) {
      remainingEffects.push(newEffect);
    } else {
      messages.push(`${effect.name}效果已消退。`);
    }
  }

  return { damage: totalDamage, messages, remainingEffects };
}

/**
 * 計算逃跑成功率（根據敵人危險等級）
 */
export function calculateFleeChance(playerLevel: number, enemyDangerLevel: number): number {
  const baseChance = 0.5;
  const levelDiff = playerLevel - enemyDangerLevel * 2;
  return Math.max(0.1, Math.min(0.9, baseChance + levelDiff * 0.05));
}
