import { PlayerData } from '@/types/game';
import { Item, getItemById } from '@/data/items';

const PLAYER_KEY = 'vibe_quest_player';
const API_KEY_KEY = 'vibe_quest_groq_api_key';
const THROTTLE_MODE_KEY = 'vibe_quest_throttle_mode';

// --- Experience constant ---
export const EXP_PER_LEVEL = 100;

export const getDefaultPlayer = (name: string): PlayerData => {
  const defaultWeapon = getItemById('cypress_stick');
  const defaultHerb = getItemById('herb');

  const initialInventory = [];
  if (defaultWeapon) {
    initialInventory.push({ ...defaultWeapon, quantity: 1 });
  }
  if (defaultHerb) {
    initialInventory.push({ ...defaultHerb, quantity: 3 });
  }

  const baseAttack = 5;
  const equippedAttack = defaultWeapon?.stats?.attack || 0;

  return {
    name,
    level: 1,
    exp: 0,
    health: 100,
    maxHealth: 100,
    attack: baseAttack + equippedAttack,
    defense: 0,
    gold: 50,
    inventory: initialInventory,
    currentLocation: 'village',
    storyHistory: [],
    actionLog: [],
    equippedWeapon: defaultWeapon?.id || null,
    equippedArmor: null,
  };
};

export const savePlayer = (player: PlayerData): void => {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  } catch (error) {
    console.error('Failed to save player data:', error);
  }
};

export const loadPlayer = (): PlayerData | null => {
  try {
    const data = localStorage.getItem(PLAYER_KEY);
    if (data) {
      const player = JSON.parse(data) as PlayerData;
      // Data migration for old structure
      if (!player.inventory) player.inventory = [];
      if (!player.equippedWeapon) player.equippedWeapon = null;
      if (!player.equippedArmor) player.equippedArmor = null;
      if (!player.attack) player.attack = 5;
      if (!player.defense) player.defense = 0;

      return player;
    }
    return null;
  } catch (error) {
    console.error('Failed to load player data:', error);
    return null;
  }
};

export const deletePlayer = (): void => {
  try {
    localStorage.removeItem(PLAYER_KEY);
  } catch (error) {
    console.error('Failed to delete player data:', error);
  }
};

// --- API Key ---
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_KEY, apiKey);
};

export const loadApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_KEY);
};

export const deleteApiKey = (): void => {
  localStorage.removeItem(API_KEY_KEY);
};

// --- Throttle Setting ---
export const saveThrottleSetting = (isEnabled: boolean): void => {
  localStorage.setItem(THROTTLE_MODE_KEY, JSON.stringify(isEnabled));
};

export const loadThrottleSetting = (): boolean => {
  const setting = localStorage.getItem(THROTTLE_MODE_KEY);
  return setting ? JSON.parse(setting) : false;
};

// Refactored: Now only applies direct stat changes, no longer handles level ups.
export const updatePlayerStats = (
  player: PlayerData,
  changes: {
    healthChange?: number;
    goldChange?: number;
    expChange?: number;
  }
): PlayerData => {
  const newPlayer = { ...player };

  if (changes.healthChange) {
    newPlayer.health = Math.max(0, Math.min(newPlayer.maxHealth, newPlayer.health + changes.healthChange));
  }

  if (changes.goldChange) {
    newPlayer.gold = Math.max(0, newPlayer.gold + changes.goldChange);
  }

  if (changes.expChange) {
    newPlayer.exp += changes.expChange;
  }

  return newPlayer;
};

// New function to handle level ups, as intended in Game.tsx
export const checkForLevelUp = (player: PlayerData): { player: PlayerData, didLevelUp: boolean } => {
  let didLevelUp = false;
  const newPlayer = { ...player };
  let expForNextLevel = newPlayer.level * EXP_PER_LEVEL;

  while (newPlayer.exp >= expForNextLevel) {
    didLevelUp = true;
    newPlayer.level += 1;
    newPlayer.exp -= expForNextLevel;

    // Stat increases on level up
    newPlayer.maxHealth += 10;
    // These are permanent increases to the base stats
    newPlayer.attack += 2;
    newPlayer.defense += 1;

    expForNextLevel = newPlayer.level * EXP_PER_LEVEL;
  }

  if (didLevelUp) {
    // Full heal on level up
    newPlayer.health = newPlayer.maxHealth;
  }

  return { player: newPlayer, didLevelUp };
};

export const addToInventory = (player: PlayerData, itemToAdd: Item, quantity: number): PlayerData => {
  const newInventory = [...player.inventory];
  const existingItemIndex = newInventory.findIndex((item) => item.id === itemToAdd.id);

  if (existingItemIndex > -1) {
    newInventory[existingItemIndex].quantity += quantity;
  } else if (quantity > 0) {
    newInventory.push({ ...itemToAdd, quantity });
  }

  return { ...player, inventory: newInventory.filter(item => item.quantity > 0) };
};

export const removeFromInventory = (player: PlayerData, itemIdToRemove: string, quantity: number): PlayerData => {
  const newInventory = player.inventory
    .map(item => {
      if (item.id === itemIdToRemove) {
        return { ...item, quantity: item.quantity - quantity };
      }
      return item;
    })
    .filter(item => item.quantity > 0);

  return { ...player, inventory: newInventory };
};

export const addToStoryHistory = (player: PlayerData, story: string): PlayerData => {
  return { ...player, storyHistory: [...player.storyHistory, story] };
};

export const addToActionLog = (player: PlayerData, action: string): PlayerData => {
  return { ...player, actionLog: [...player.actionLog, `[${new Date().toLocaleTimeString()}] ${action}`] };
};
