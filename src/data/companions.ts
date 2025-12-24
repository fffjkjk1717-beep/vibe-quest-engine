import { Companion } from '@/types/game';

export const COMPANIONS: Companion[] = [
  {
    id: 'slave_warrior_1',
    name: '克里圖斯',
    level: 1,
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 10,
    description: '一位在鬥技場百戰生還的奴隸戰士，眼神中透露著不屈的意志。'
  }
];

export const getCompanionById = (id: string): Companion | undefined => {
  return COMPANIONS.find(c => c.id === id);
};
