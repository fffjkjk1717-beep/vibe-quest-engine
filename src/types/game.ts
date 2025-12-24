import { Item } from '@/data/items';

// 讓背包中的物品繼承完整的 Item 屬性，並加上數量
export interface InventoryItem extends Item {
  quantity: number;
}

export interface PlayerData {
  name: string;
  level: number;
  exp: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  gold: number;
  inventory: InventoryItem[];
  currentLocation: string;
  storyHistory: string[];
  actionLog: string[];
  // 新增裝備欄位
  equippedWeapon: string | null;
  equippedArmor: string | null;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  dangerLevel: number;
}

export interface ActionOption {
  description: string;
  actionCode: string;
}

export interface StatusChange {
  healthChange: number;
  goldChange: number;
  expChange: number;
  // itemChanges 的 name 現在代表 item ID
  itemChanges: { action: 'add' | 'remove'; name: string; quantity: number }[];
  special: string[];
}

export interface AIResponse {
  story: string;
  actions: ActionOption[];
  statusChanges: StatusChange;
  enemyIdToFight: string | null; // 新增：用於觸發戰鬥的敵人 ID
}
