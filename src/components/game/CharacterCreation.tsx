import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDefaultPlayer } from '@/lib/localStorage';
import { PlayerData } from '@/types/game';

interface CharacterCreationProps {
  onCreateCharacter: (player: PlayerData) => void;
}

const randomNames = [
  '艾爾文', '莉亞娜', '索爾', '凱特琳', '達瑞斯',
  '艾希', '格雷', '維奧拉', '雷恩', '瑟蘭妮',
];

const CharacterCreation = ({ onCreateCharacter }: CharacterCreationProps) => {
  const [name, setName] = useState('');

  const handleRandomName = () => {
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    setName(randomName);
  };

  const handleCreate = () => {
    if (name.trim()) {
      const newPlayer = getDefaultPlayer(name.trim());
      onCreateCharacter(newPlayer);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/90 p-8 shadow-2xl backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">創建角色</h1>
          <p className="text-muted-foreground">為你的冒險者命名</p>
        </motion.div>

        <div className="space-y-6">
          <div className="flex gap-2">
            <Input placeholder="輸入角色名稱..." value={name} onChange={(e) => setName(e.target.value)} className="flex-1 border-border/50 bg-secondary/30" maxLength={20} />
            <Button variant="outline" size="icon" onClick={handleRandomName} className="shrink-0" title="隨機名稱">
              <Dices className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-lg bg-secondary/30 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">初始屬性</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>生命: 100</div>
              <div>攻擊: 7</div>
              <div>防禦: 0</div>
              <div>金幣: 50</div>
            </div>
          </div>

          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full bg-primary py-6 text-lg font-semibold">
            <Sparkles className="mr-2 h-5 w-5" />
            開始冒險
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterCreation;
