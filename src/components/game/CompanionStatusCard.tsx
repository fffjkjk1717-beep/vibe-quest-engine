import { motion } from 'framer-motion';
import { Shield, Sword, Heart, Star, UserSquare } from 'lucide-react';
import { Companion } from '@/types/game';
import { Badge } from '@/components/ui/badge';

interface CompanionStatusCardProps {
  companion: Companion;
}

const CompanionStatusCard = ({ companion }: CompanionStatusCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="order-first rounded-xl border border-border/50 bg-card/80 p-5 shadow-lg backdrop-blur-sm lg:order-none"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground">{companion.name}</h3>
          <p className="text-sm text-muted-foreground">你的忠實夥伴</p>
        </div>
        <UserSquare className="h-10 w-10 text-primary" />
      </div>

      <div className="my-5 h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <motion.div
          className="h-full bg-green-500"
          initial={{ width: '0%' }}
          animate={{ width: `${(companion.health / companion.maxHealth) * 100}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4 text-red-500" />
            <span>生命值</span>
          </div>
          <span className="font-mono font-semibold">{companion.health} / {companion.maxHealth}</span>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>等級</span>
          </div>
          <span className="font-mono font-semibold">{companion.level}</span>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sword className="h-4 w-4 text-orange-500" />
            <span>攻擊</span>
          </div>
          <span className="font-mono font-semibold">{companion.attack}</span>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-sky-500" />
            <span>防禦</span>
          </div>
          <span className="font-mono font-semibold">{companion.defense}</span>
        </div>
      </div>
      <div className="mt-4">
        <Badge variant="secondary">{companion.description}</Badge>
      </div>
    </motion.div>
  );
};

export default CompanionStatusCard;
