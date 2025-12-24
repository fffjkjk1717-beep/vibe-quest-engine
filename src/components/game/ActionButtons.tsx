import { motion } from 'framer-motion';
import { Compass, Swords, MessageCircle, Moon, DoorOpen, Package, Sparkles, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionOption } from '@/types/game';

interface ActionButtonsProps {
  actions: ActionOption[];
  onAction: (action: ActionOption) => void;
  isLoading: boolean;
  isOnCooldown: boolean;
  cooldownTimer: number;
}

const getActionIcon = (actionCode: string) => {
  switch (actionCode.toUpperCase()) {
    case 'EXPLORE': return <Compass className="h-5 w-5" />;
    case 'FIGHT': return <Swords className="h-5 w-5" />;
    case 'TALK': return <MessageCircle className="h-5 w-5" />;
    case 'REST': return <Moon className="h-5 w-5" />;
    case 'LEAVE': return <DoorOpen className="h-5 w-5" />;
    case 'BUY': case 'OPEN_CHEST': return <Package className="h-5 w-5" />;
    default: return <Sparkles className="h-5 w-5" />;
  }
};

const ActionButtons = ({ actions, onAction, isLoading, isOnCooldown, cooldownTimer }: ActionButtonsProps) => {
  const isDisabled = isLoading || isOnCooldown;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border/50 bg-card/80 p-5 shadow-lg backdrop-blur-sm">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">選擇行動</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action, index) => (
          <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
            <Button variant="outline" className="h-auto w-full justify-start gap-3 border-border/50 bg-secondary/30 px-4 py-3 text-left transition-all hover:border-primary/50 hover:bg-primary/10" onClick={() => onAction(action)} disabled={isDisabled}>
              {isDisabled ? <span className="text-muted-foreground">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />}</span> : <span className="text-primary">{getActionIcon(action.actionCode)}</span>}
              <span className="flex-1 text-sm">{isOnCooldown ? `冷卻中 (${cooldownTimer}s)` : action.description}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ActionButtons;
