import { PlayerData } from '@/types/game';
import { getLocationById } from '@/data/locations';
import { items } from '@/data/items';
import { ENEMIES } from '@/data/enemies';

export const buildGamePrompt = (player: PlayerData, context: string): string => {
  const location = getLocationById(player.currentLocation);
  const locationName = location?.name || '未知地點';
  const locationDescription = location?.description || '';
  const locationDanger = location?.dangerLevel || 1;

  const inventoryList =
    player.inventory.length > 0
      ? player.inventory.map((item) => `${item.name} x${item.quantity}`).join('、')
      : '空空如也';

  const itemReferenceList = items.map(item => `${item.name} (ID: ${item.id})`).join('\n');
  const enemyReferenceList = ENEMIES.map(e => `${e.name} (ID: ${e.id}, 危險等級: ${e.dangerLevel})`).join('\n');

  const historySummary =
    player.storyHistory.length > 0
      ? player.storyHistory.slice(-5).join('\n\n')
      : '這是你冒險的開始...';

  return `你是一位專業的黑暗奇幻文字冒險 RPG 敘述者。
所有回覆必須使用繁體中文，使用第二人稱（「你」），語氣優雅、文學性強但不冗長，帶有神秘與危險氛圍。

【玩家狀態】
名字：${player.name}
等級：${player.level}（經驗 ${player.exp}）
生命：${player.health}/${player.maxHealth}
攻擊：${player.attack}　防禦：${player.defense}
金幣：${player.gold}
背包：${inventoryList}

【目前地點】
${locationName} (危險等級: ${locationDanger})：${locationDescription}

【最近故事（請嚴格延續前文）】
${historySummary}

【本次情境】
${context}

【可參考的物品清單（給予物品時，請優先使用這些物品的 ID）】
${itemReferenceList}

【可參考的敵人清單（觸發戰鬥時，請使用這些敵人的 ID）】
${enemyReferenceList}

【重要規則】
1. 根據【本次情境】生成接續的故事，控制在 250-400 字。
2. 當【本次情境】是「戰鬥」或玩家選擇了戰鬥選項 (ACTION_CODE: FIGHT) 時，請遵循以下【戰鬥流程】。

【戰鬥流程】
1. 你的任務不是描述戰鬥過程，而是選擇一個敵人讓戰鬥開始。
2. 根據目前地點的【危險等級: ${locationDanger}】，從【可參考的敵人清單】中選擇一個危險等級最接近的敵人。
3. 在「===故事===」部分，只需描述遭遇此敵人的情景，作為戰鬥的開場白（例如：『陰影中，一個身影浮現，空洞的眼窩鎖定了你...』）。
4. 在「===戰鬥目標===」部分，僅回傳你選擇的敵人 ID。
5. 在「===行動選項===」部分，將選項固定為「迎戰」、「逃跑」。

請生成回覆，並嚴格遵循以下格式：

===故事===
（沉浸式敘述，分段即可）

===行動選項===
1. [清晰描述] -> ACTION_CODE: CUSTOM_ACTION
2. [清晰描述] -> ACTION_CODE: CUSTOM_ACTION
（根據情境提供 3-4 個合理選項。若觸發戰鬥，選項應為「迎戰」和「逃跑」）

===狀態建議===
健康變動: ±X 或 0
金幣變動: ±X 或 0
經驗變動: +X 或 0
物品變動: 獲得/失去 [物品ID] 數量 (例如: 獲得 herb 1)
其他: 無 / 死亡 / 等級提升 / 特殊旗標

===戰鬥目標===
(若觸發戰鬥，請在此填寫敵人 ID，例如: goblin。若無，請填寫「無」)
`;
};

export const buildArrivalPrompt = (locationName: string): string => {
  return `你剛抵達「${locationName}」，請描述周遭環境與氛圍，並提供探索選項。`;
};

export const buildActionPrompt = (actionDescription: string): string => {
  return `玩家選擇：${actionDescription}。請描述此行動的結果與後續發展。`;
};

// 新增一個用於描述戰鬥結果的 prompt builder
export const buildFightResultPrompt = (
  playerName: string,
  enemyName: string,
  result: {
    outcome: 'win' | 'lose' | 'flee';
    playerDamageTaken: number;
    enemyDamageTaken: number;
    expGained: number;
    goldGained: number;
    lootGained: { itemName: string; quantity: number }[] | null;
  }
): string => {
  if (result.outcome === 'win') {
    let lootString = '沒有獲得任何戰利品。';
    if (result.lootGained && result.lootGained.length > 0) {
      lootString = `你獲得了戰利品：${result.lootGained.map(l => `${l.itemName} x${l.quantity}`).join('、')}。`;
    }
    return `戰鬥結束。${playerName} 擊敗了 ${enemyName}。
【戰鬥結果】
- 你對 ${enemyName} 造成了 ${result.enemyDamageTaken} 點傷害。
- 你受到了 ${result.playerDamageTaken} 點傷害。
- 你獲得了 ${result.expGained} 點經驗和 ${result.goldGained} 枚金幣。
- ${lootString}

請根據這個結果，生動地描述戰鬥的結局與你的勝利。`;
  }

  if (result.outcome === 'lose') {
    return `戰鬥結束。${playerName} 被 ${enemyName} 擊敗了。
【戰鬥結果】
- 你受到了 ${result.playerDamageTaken} 點致命傷害。

請根據這個結果，描述你奮力抵抗後，最終不支倒地的悲壯情景。`;
  }

  return `玩家選擇逃跑，請描述成功或失敗的場景。`;
};
