import { motion } from 'framer-motion';
import { MapPin, Home, TreePine, Beer, Landmark, Waves, Castle, AlertTriangle, Gem, Store, Skull, Mountain, Leaf, Snowflake, Moon } from 'lucide-react';
import { locations, getLocationById } from '@/data/locations';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LocationPanelProps {
  currentLocationId: string;
  onLocationChange: (locationId: string) => void;
  isLoading: boolean;
}

const getLocationIcon = (iconName: string) => {
  switch (iconName) {
    case 'Home': return <Home className="h-5 w-5" />;
    case 'TreePine': return <TreePine className="h-5 w-5" />;
    case 'Beer': return <Beer className="h-5 w-5" />;
    case 'Landmark': return <Landmark className="h-5 w-5" />;
    case 'Waves': return <Waves className="h-5 w-5" />;
    case 'Castle': return <Castle className="h-5 w-5" />;
    case 'Gem': return <Gem className="h-5 w-5" />;
    case 'Store': return <Store className="h-5 w-5" />;
    case 'Skull': return <Skull className="h-5 w-5" />;
    case 'Mountain': return <Mountain className="h-5 w-5" />;
    case 'Leaf': return <Leaf className="h-5 w-5" />;
    case 'Snowflake': return <Snowflake className="h-5 w-5" />;
    case 'Moon': return <Moon className="h-5 w-5" />;
    default: return <MapPin className="h-5 w-5" />;
  }
};

const getDangerColor = (level: number) => {
  if (level === 0) return 'text-green-400';
  if (level <= 2) return 'text-yellow-400';
  if (level <= 4) return 'text-orange-400';
  return 'text-red-400';
};

const LocationPanel = ({ currentLocationId, onLocationChange, isLoading }: LocationPanelProps) => {
  const currentLocation = getLocationById(currentLocationId);

  return (
    <div className="flex h-full flex-col gap-4">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`rounded-xl border border-border/50 bg-gradient-to-br ${currentLocation?.color || 'from-gray-900 to-gray-800'} p-5 shadow-lg`}>
        <div className="mb-2 flex items-center gap-2 text-sm text-white/70"><MapPin className="h-4 w-4" />目前位置</div>
        <h3 className="mb-2 font-display text-xl font-bold text-white">{currentLocation?.name || '未知地點'}</h3>
        <p className="text-sm leading-relaxed text-white/80">{currentLocation?.description || ''}</p>
        {currentLocation && currentLocation.dangerLevel > 0 && (
          <div className={`mt-3 flex items-center gap-1 text-sm ${getDangerColor(currentLocation.dangerLevel)}`}>
            <AlertTriangle className="h-4 w-4" />危險等級: {'⚔️'.repeat(currentLocation.dangerLevel)}
          </div>
        )}
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1 rounded-xl border border-border/50 bg-card/80 shadow-lg backdrop-blur-sm">
        <div className="border-b border-border/30 p-4"><h3 className="font-display text-lg font-semibold text-foreground">地點目錄</h3></div>
        <ScrollArea className="h-[300px] p-3">
          <div className="space-y-2">
            {locations.map((location) => (
              <Button key={location.id} variant={location.id === currentLocationId ? 'secondary' : 'ghost'} className={`w-full justify-start gap-3 ${location.id === currentLocationId ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => onLocationChange(location.id)} disabled={isLoading || location.id === currentLocationId}>
                <span className={location.id === currentLocationId ? 'text-primary' : ''}>{getLocationIcon(location.icon)}</span>
                <span className="flex-1 text-left">{location.name}</span>
                <span className={`text-xs ${getDangerColor(location.dangerLevel)}`}>{location.dangerLevel > 0 ? '⚔️'.repeat(location.dangerLevel) : '🏠'}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default LocationPanel;
