import { motion } from 'framer-motion';
import { Heart, Star, Sword, Shield, Coins } from 'lucide-react';
import { PlayerData } from '@/types/game';
import { Progress } from '@/components/ui/progress';

interface PlayerStatusCardProps {
  player: PlayerData;
}

const PlayerStatusCard = ({ player }: PlayerStatusCardProps) => {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const expForNextLevel = player.level * 100;
  const expPercent = (player.exp / expForNextLevel) * 100;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border/50 bg-card/80 p-5 shadow-lg backdrop-blur-sm">
      <h2 className="mb-4 font-display text-xl font-bold text-foreground">{player.name}</h2>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Star className="h-4 w-4 text-yellow-500" />
        <span>等級 {player.level}</span>
      </div>
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" />生命</span>
            <span>{player.health}/{player.maxHealth}</span>
          </div>
          <Progress value={healthPercent} className="h-2 bg-red-950" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" />經驗</span>
            <span>{player.exp}/{expForNextLevel}</span>
          </div>
          <Progress value={expPercent} className="h-2 bg-yellow-950" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2 text-sm">
            <Sword className="h-4 w-4 text-orange-400" />
            <span>攻擊 {player.attack}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2 text-sm">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>防禦 {player.defense}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-900/30 to-amber-900/30 p-3 text-sm">
          <Coins className="h-5 w-5 text-yellow-400" />
          <span className="font-semibold text-yellow-300">{player.gold} 金幣</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerStatusCard;
