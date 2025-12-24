import { Item } from '@/data/items';

// 讓背包中的物品繼承完整的 Item 屬性，並加上數量
export interface InventoryItem extends Item {
  quantity: number;
}

export interface Companion {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  description: string;
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
  equippedWeapon: string | null;
  equippedArmor: string | null;
  currentLocation: string;
  storyHistory: string[];
  actionLog: string[];
  companion: Companion | null;
}

export interface ActionOption {
  description: string;
  actionCode: string;
}

export interface AIResponse {
  story: string;
  actions: ActionOption[];
  statusChanges: {
    healthChange: number;
    goldChange: number;
    expChange: number;
    itemChanges: { name: string; quantity: number; action: 'add' | 'remove' }[];
    special: string[];
  };
  enemyIdToFight: string | null;
}
