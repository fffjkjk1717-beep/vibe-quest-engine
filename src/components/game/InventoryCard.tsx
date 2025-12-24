import { motion } from 'framer-motion';
import { Package, Swords, Shield, FlaskConical, Sparkles } from 'lucide-react';
import { InventoryItem } from '@/types/game';
import { Button } from '@/components/ui/button';

interface InventoryCardProps {
  inventory: InventoryItem[];
  equippedWeapon: string | null;
  equippedArmor: string | null;
  onUseItem: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
}

const getItemIcon = (item: InventoryItem) => {
  switch (item.type) {
    case 'weapon': return <Swords className="h-4 w-4 text-orange-400" />;
    case 'armor': return <Shield className="h-4 w-4 text-cyan-400" />;
    case 'consumable':
      if (item.effect?.type === 'HEAL') return <FlaskConical className="h-4 w-4 text-red-400" />;
      if (item.effect?.type === 'PERMANENT_STAT') return <Sparkles className="h-4 w-4 text-yellow-400" />;
      return <FlaskConical className="h-4 w-4 text-green-400" />;
    default: return <Package className="h-4 w-4 text-muted-foreground" />;
  }
};

const InventoryCard = ({ inventory, equippedWeapon, equippedArmor, onUseItem, onEquipItem }: InventoryCardProps) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border/50 bg-card/80 p-5 shadow-lg backdrop-blur-sm">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Package className="h-5 w-5" />背包
      </h3>
      {inventory.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">背包空空如也...</p>
      ) : (
        <ul className="space-y-2">
          {inventory.map((item, index) => {
            const isEquipped = item.id === equippedWeapon || item.id === equippedArmor;
            return (
              <motion.li key={`${item.id}-${index}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 text-sm">
                <div className="flex flex-1 items-center gap-2">
                  {getItemIcon(item)}
                  <span className="flex-grow">{item.name}{isEquipped && <span className='text-xs text-green-400 ml-1'>(已裝備)</span>}</span>
                  <span className="mr-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">x{item.quantity}</span>
                </div>
                {item.type === 'consumable' && <Button size="sm" variant="outline" onClick={() => onUseItem(item.id)}>使用</Button>}
                {(item.type === 'weapon' || item.type === 'armor') && !isEquipped && <Button size="sm" variant="outline" onClick={() => onEquipItem(item.id)}>裝備</Button>}
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
};

export default InventoryCard;
