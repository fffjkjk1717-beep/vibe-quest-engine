import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Loader2, Menu, Trash2, Shield, Heart, Gem, Swords, Clock, Package, Zap, Flame, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { PlayerData, ActionOption, AIResponse, InventoryItem } from '@/types/game';
import { loadPlayer, savePlayer, loadApiKey, loadThrottleSetting, updatePlayerStats, addToInventory, removeFromInventory, addToStoryHistory, addToActionLog, deletePlayer, checkForLevelUp } from '@/lib/localStorage';
import { getLocationById } from '@/data/locations';
import { getItemById, Item } from '@/data/items';
import { getEnemyById, Enemy } from '@/data/enemies';
import { buildGamePrompt, buildArrivalPrompt, buildActionPrompt, buildFightResultPrompt } from '@/lib/promptTemplate';
import { callGroqAPI, parseAIResponse } from '@/lib/groqApi';
import { 
  CombatEnemy, 
  StatusEffect, 
  ENEMY_SKILLS, 
  getEnemyCombatStats, 
  getPlayerCombatStats, 
  playerAttack, 
  enemyAttack, 
  processStatusEffects,
  calculateFleeChance
} from '@/lib/combatEngine';
import CharacterCreation from '@/components/game/CharacterCreation';
import PlayerStatusCard from '@/components/game/PlayerStatusCard';
import InventoryCard from '@/components/game/InventoryCard';
import ActionButtons from '@/components/game/ActionButtons';
import LocationPanel from '@/components/game/LocationPanel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const COOLDOWN_SECONDS = 15;
type CombatAction = 'FIGHT' | 'FLEE' | { type: 'USE_ITEM'; itemId: string };

const CombatPanel = ({ 
  enemy, 
  playerInventory, 
  onCombatAction, 
  isLoading, 
  isOnCooldown, 
  cooldownTimer,
  playerStatusEffects,
  playerBuffs
}: { 
  enemy: CombatEnemy, 
  playerInventory: InventoryItem[], 
  onCombatAction: (action: CombatAction) => void, 
  isLoading: boolean, 
  isOnCooldown: boolean, 
  cooldownTimer: number,
  playerStatusEffects: StatusEffect[],
  playerBuffs: StatusEffect[]
}) => {
  const combatItems = playerInventory.filter(item => 
    item.type === 'consumable' && 
    (item.effect?.type === 'DEAL_DAMAGE' || 
     item.effect?.type === 'GUARANTEE_FLEE' ||
     item.effect?.type === 'ELEMENTAL_DAMAGE' ||
     item.effect?.type === 'TEMP_BUFF' ||
     item.effect?.type === 'CURE_STATUS')
  );
  const isDisabled = isLoading || isOnCooldown;

  const healthPercent = (enemy.health / enemy.maxHealth) * 100;

  return (
    <Card className="border-destructive bg-destructive/10">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl text-destructive flex items-center gap-2">
          <Swords /> 遭遇敵人！
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 敵人資訊 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{enemy.name}</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1" title="暴擊率">
                <Zap className="h-3 w-3 text-yellow-400" /> {Math.round(enemy.critChance * 100)}%
              </span>
              <span className="flex items-center gap-1" title="閃避率">
                <Shield className="h-3 w-3 text-cyan-400" /> {Math.round(enemy.evasionChance * 100)}%
              </span>
            </div>
          </div>
          
          {/* 敵人血條 */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" /> 生命</span>
              <span>{enemy.health} / {enemy.maxHealth}</span>
            </div>
            <Progress value={healthPercent} className="h-2" />
          </div>

          {/* 敵人狀態效果 */}
          {enemy.statusEffects.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {enemy.statusEffects.map((effect, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {effect.name} ({effect.remainingTurns})
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 玩家狀態效果 */}
        {(playerStatusEffects.length > 0 || playerBuffs.length > 0) && (
          <div className="p-2 bg-background/50 rounded-md space-y-1">
            <p className="text-xs text-muted-foreground">你的狀態：</p>
            <div className="flex gap-1 flex-wrap">
              {playerStatusEffects.map((effect, i) => (
                <Badge key={`dot-${i}`} variant="destructive" className="text-xs">
                  <Flame className="h-3 w-3 mr-1" /> {effect.name} ({effect.remainingTurns})
                </Badge>
              ))}
              {playerBuffs.map((effect, i) => (
                <Badge key={`buff-${i}`} variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" /> {effect.name} ({effect.remainingTurns})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 戰鬥按鈕 */}
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => onCombatAction('FIGHT')} disabled={isDisabled} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isOnCooldown ? <Clock className="mr-2 h-4 w-4" /> : <Swords className="mr-2 h-4 w-4" />}
            {isOnCooldown ? `冷卻中 (${cooldownTimer}s)` : '迎戰'}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={isDisabled || combatItems.length === 0} className="w-full">
                <Package className="mr-2 h-4 w-4" /> 物品
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">戰鬥物品</h4>
                  <p className="text-sm text-muted-foreground">選擇要使用的物品。</p>
                </div>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {combatItems.map((item) => (
                    <Button 
                      key={item.id} 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => onCombatAction({ type: 'USE_ITEM', itemId: item.id })}
                    >
                      <div>
                        <div className="font-medium">{item.name} (x{item.quantity})</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => onCombatAction('FLEE')} disabled={isDisabled} className="w-full">
            逃跑
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [currentStory, setCurrentStory] = useState('');
  const [actions, setActions] = useState<ActionOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [currentCombatEnemy, setCurrentCombatEnemy] = useState<CombatEnemy | null>(null);
  const [isThrottlingEnabled, setIsThrottlingEnabled] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(COOLDOWN_SECONDS);
  // 新增：玩家狀態效果
  const [playerStatusEffects, setPlayerStatusEffects] = useState<StatusEffect[]>([]);
  const [playerBuffs, setPlayerBuffs] = useState<StatusEffect[]>([]);

  useEffect(() => {
    const savedPlayer = loadPlayer();
    const apiKey = loadApiKey();
    const throttleSetting = loadThrottleSetting();
    setPlayer(savedPlayer);
    setHasApiKey(!!apiKey);
    setIsThrottlingEnabled(throttleSetting);
    setIsInitialized(true);
    if (savedPlayer && savedPlayer.storyHistory.length > 0) {
      setCurrentStory(savedPlayer.storyHistory[savedPlayer.storyHistory.length - 1]);
      setActions([{ description: '繼續探索此地', actionCode: 'EXPLORE' }, { description: '休息恢復體力', actionCode: 'REST' }, { description: '查看四周環境', actionCode: 'TALK' }]);
    }
  }, []);

  useEffect(() => {
    if (!isOnCooldown) return;
    const interval = setInterval(() => {
      setCooldownTimer(prev => { if (prev <= 1) { clearInterval(interval); setIsOnCooldown(false); return COOLDOWN_SECONDS; } return prev - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnCooldown]);

  const triggerCooldown = () => { if (isThrottlingEnabled) { setIsOnCooldown(true); setCooldownTimer(COOLDOWN_SECONDS); } };

  const callAI = useCallback(async (context: string, playerData: PlayerData, forceUpdate: boolean = false) => {
    const apiKey = loadApiKey();
    if (!apiKey) { toast({ title: '缺少 API Key', variant: 'destructive' }); return; }
    triggerCooldown();
    setIsLoading(true);
    try {
      const prompt = buildGamePrompt(playerData, context);
      const rawResponse = await callGroqAPI(apiKey, prompt);
      const parsedResponse = parseAIResponse(rawResponse);
      processAIResponse(parsedResponse, playerData, forceUpdate);
    } catch (error) {
      toast({ title: 'AI 錯誤', description: '連線失敗', variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [toast, isThrottlingEnabled]);

  const processAIResponse = useCallback((response: AIResponse, playerData: PlayerData, forceUpdate: boolean = false) => {
    let updatedPlayer = { ...playerData };
    if (response.enemyIdToFight && !forceUpdate) {
      const enemy = getEnemyById(response.enemyIdToFight);
      if (enemy) { 
        setCurrentEnemy(enemy); 
        // 將 Enemy 轉換為 CombatEnemy
        const combatStats = getEnemyCombatStats(enemy.id, enemy.dangerLevel);
        const combatEnemy: CombatEnemy = {
          id: enemy.id,
          name: enemy.name,
          health: enemy.health,
          maxHealth: enemy.health,
          attack: enemy.attack,
          defense: enemy.defense,
          critChance: combatStats.critChance,
          evasionChance: combatStats.evasionChance,
          skills: ENEMY_SKILLS[enemy.id] || [],
          statusEffects: [],
        };
        setCurrentCombatEnemy(combatEnemy); 
        setPlayerStatusEffects([]); // 重置玩家狀態效果
        setPlayerBuffs([]);
        setCurrentStory(response.story); 
        setActions(response.actions); 
        savePlayer(updatedPlayer); 
        setPlayer(updatedPlayer); 
        return; 
      }
    }
    setCurrentEnemy(null); setCurrentCombatEnemy(null);
    updatedPlayer = updatePlayerStats(updatedPlayer, response.statusChanges);
    response.statusChanges.itemChanges.forEach((itemChange) => {
      const itemData = getItemById(itemChange.name);
      if (itemData) {
        if (itemChange.action === 'add') { updatedPlayer = addToInventory(updatedPlayer, itemData, itemChange.quantity); toast({ title: '獲得物品', description: `你獲得了 ${itemData.name}` }); }
        else { updatedPlayer = removeFromInventory(updatedPlayer, itemData.id, itemChange.quantity); }
      }
    });
    updatedPlayer = addToStoryHistory(updatedPlayer, response.story);
    if (updatedPlayer.storyHistory.length > 5) { updatedPlayer.storyHistory.splice(0, updatedPlayer.storyHistory.length - 5); }
    const { player: leveledUpPlayer, didLevelUp } = checkForLevelUp(updatedPlayer);
    updatedPlayer = leveledUpPlayer;
    if (didLevelUp) toast({ title: '等級提升！' });
    if (response.statusChanges.special.includes('死亡') || updatedPlayer.health <= 0) { updatedPlayer.health = 0; }
    savePlayer(updatedPlayer); setPlayer(updatedPlayer); setCurrentStory(response.story); setActions(response.actions);
  }, [toast]);

  const handleAction = useCallback((action: ActionOption) => {
    if (!player || isOnCooldown) return;
    const updatedPlayer = addToActionLog(player, action.description);
    setPlayer(updatedPlayer); savePlayer(updatedPlayer);
    callAI(buildActionPrompt(action.description), updatedPlayer);
  }, [player, callAI, isOnCooldown]);

  const handleCombatAction = useCallback((action: CombatAction) => {
    if (!player || !currentCombatEnemy || !currentEnemy || isOnCooldown) return;
    let updatedPlayer = { ...player };
    let updatedEnemy = { ...currentCombatEnemy };
    let combatLog = "";
    let currentPlayerEffects = [...playerStatusEffects];
    let currentPlayerBuffs = [...playerBuffs];

    // 處理玩家狀態效果（回合開始）
    if (currentPlayerEffects.length > 0) {
      const { damage, messages, remainingEffects } = processStatusEffects(currentPlayerEffects);
      if (damage > 0) {
        updatedPlayer.health -= damage;
        messages.forEach(msg => toast({ description: msg, variant: 'destructive' }));
        combatLog += messages.join(' ');
      }
      currentPlayerEffects = remainingEffects;
    }

    // 處理玩家增益效果倒數
    currentPlayerBuffs = currentPlayerBuffs.map(b => ({ ...b, remainingTurns: b.remainingTurns - 1 })).filter(b => b.remainingTurns > 0);

    // 計算玩家戰鬥屬性（包含增益）
    const basePlayerStats = getPlayerCombatStats(updatedPlayer);
    let playerStats = { ...basePlayerStats };
    currentPlayerBuffs.forEach(buff => {
      if (buff.statModifier) {
        if (buff.statModifier.stat === 'attack') playerStats.attack += buff.statModifier.amount;
        if (buff.statModifier.stat === 'defense') playerStats.defense += buff.statModifier.amount;
      }
    });

    if (typeof action === 'object' && action.type === 'USE_ITEM') {
      const item = getItemById(action.itemId);
      if (!item) return;
      updatedPlayer = removeFromInventory(updatedPlayer, item.id, 1);
      
      if (item.effect?.type === 'GUARANTEE_FLEE') {
        toast({ title: '使用煙霧彈！', description: '成功逃離戰場。' });
        setPlayerStatusEffects([]); setPlayerBuffs([]);
        setCurrentEnemy(null); setCurrentCombatEnemy(null); 
        setActions([{ description: '繼續探索', actionCode: 'EXPLORE' }]); 
        savePlayer(updatedPlayer); setPlayer(updatedPlayer); 
        return;
      }
      
      if (item.effect?.type === 'DEAL_DAMAGE' || item.effect?.type === 'ELEMENTAL_DAMAGE') {
        const damage = item.effect.amount;
        updatedEnemy.health -= damage;
        const elementText = item.effect.type === 'ELEMENTAL_DAMAGE' ? `${item.effect.element === 'fire' ? '火焰' : item.effect.element === 'ice' ? '冰霜' : '雷電'}` : '';
        toast({ title: `你使用了 ${item.name}`, description: `對 ${updatedEnemy.name} 造成 ${damage} 點${elementText}傷害！` });
        combatLog += `使用了 ${item.name}，對 ${updatedEnemy.name} 造成了 ${damage} 點傷害。`;
      }
      
      if (item.effect?.type === 'TEMP_BUFF') {
        const newBuff: StatusEffect = {
          id: item.id,
          name: item.effect.stat === 'attack' ? '攻擊強化' : '防禦強化',
          type: 'BUFF',
          remainingTurns: item.effect.duration,
          statModifier: { stat: item.effect.stat, amount: item.effect.amount },
        };
        currentPlayerBuffs.push(newBuff);
        toast({ title: `你使用了 ${item.name}`, description: `${item.effect.stat === 'attack' ? '攻擊力' : '防禦力'} +${item.effect.amount}，持續 ${item.effect.duration} 回合！` });
      }
      
      if (item.effect?.type === 'CURE_STATUS') {
        currentPlayerEffects = [];
        toast({ title: `你使用了 ${item.name}`, description: '異常狀態已解除！' });
      }
    } else if (action === 'FLEE') {
      const fleeChance = calculateFleeChance(player.level, currentEnemy.dangerLevel);
      if (Math.random() < fleeChance) { 
        toast({ title: '逃跑成功', description: '你成功甩開了敵人！' }); 
        setPlayerStatusEffects([]); setPlayerBuffs([]);
        setCurrentEnemy(null); setCurrentCombatEnemy(null); 
        setActions([{ description: '繼續探索', actionCode: 'EXPLORE' }]); 
        return; 
      } else { 
        toast({ title: '逃跑失敗', description: '你未能逃脫，敵人發動追擊！', variant: 'destructive' }); 
        combatLog = '試圖逃跑但失敗了。'; 
      }
    } else if (action === 'FIGHT') {
      const attackResult = playerAttack(playerStats, updatedEnemy);
      if (attackResult.isEvaded) {
        toast({ description: attackResult.message });
      } else {
        updatedEnemy.health -= attackResult.damage;
        toast({ 
          title: attackResult.isCritical ? '暴擊！' : '攻擊！', 
          description: `造成 ${attackResult.damage} 點傷害${attackResult.isCritical ? '（暴擊）' : ''}` 
        });
      }
      combatLog = attackResult.message;
    }

    // 檢查敵人是否死亡
    if (updatedEnemy.health <= 0) {
      const exp = currentEnemy.exp;
      const gold = Math.floor(Math.random() * (currentEnemy.gold[1] - currentEnemy.gold[0] + 1)) + currentEnemy.gold[0];
      let loot: { itemName: string; quantity: number }[] = [];
      currentEnemy.loot.forEach(l => { 
        if (Math.random() < l.chance) { 
          const item = getItemById(l.itemId); 
          if (item) { loot.push({ itemName: item.name, quantity: 1 }); updatedPlayer = addToInventory(updatedPlayer, item, 1); } 
        } 
      });
      updatedPlayer = updatePlayerStats(updatedPlayer, { healthChange: 0, expChange: exp, goldChange: gold });
      toast({ title: '戰鬥勝利！', description: `獲得 ${exp} 經驗與 ${gold} 金幣！` });
      const { player: leveledUpPlayer, didLevelUp } = checkForLevelUp(updatedPlayer);
      if (didLevelUp) toast({ title: '等級提升！' });
      const resCtx = buildFightResultPrompt(player.name, currentEnemy.name, { outcome: 'win', playerDamageTaken: player.health - updatedPlayer.health, enemyDamageTaken: currentEnemy.health, expGained: exp, goldGained: gold, lootGained: loot });
      callAI(combatLog + " " + resCtx, leveledUpPlayer, true);
      setPlayerStatusEffects([]); setPlayerBuffs([]);
      savePlayer(leveledUpPlayer); setPlayer(leveledUpPlayer); setCurrentEnemy(null); setCurrentCombatEnemy(null); 
      return;
    }

    // 敵人回合
    const enemyResult = enemyAttack(updatedEnemy, playerStats);
    if (enemyResult.isEvaded) {
      toast({ description: enemyResult.message });
    } else {
      updatedPlayer.health -= enemyResult.damage;
      toast({ description: enemyResult.message, variant: 'destructive' });
      combatLog += ` ${enemyResult.message}`;
      
      // 如果敵人使用了治療技能
      if (enemyResult.skillUsed?.type === 'HEAL') {
        updatedEnemy.health = Math.min(updatedEnemy.maxHealth, updatedEnemy.health + (enemyResult.skillUsed.healAmount || 0));
      }
      
      // 如果敵人使用了防禦增益
      if (enemyResult.statusApplied && enemyResult.skillUsed?.type === 'DEFENSE_BUFF') {
        updatedEnemy.statusEffects = [...updatedEnemy.statusEffects, enemyResult.statusApplied];
        updatedEnemy.defense += enemyResult.statusApplied.statModifier?.amount || 0;
      }
      
      // 如果敵人對玩家施加了狀態效果
      if (enemyResult.statusApplied && (enemyResult.skillUsed?.type === 'POISON' || enemyResult.skillUsed?.type === 'FIRE_BREATH')) {
        currentPlayerEffects.push(enemyResult.statusApplied);
      }
    }

    // 檢查玩家是否死亡
    if (updatedPlayer.health <= 0) {
      updatedPlayer.health = 0;
      toast({ title: '戰鬥失敗', variant: 'destructive' });
      const resCtx = buildFightResultPrompt(player.name, currentEnemy.name, { outcome: 'lose', playerDamageTaken: player.health, enemyDamageTaken: currentEnemy.health - updatedEnemy.health, expGained: 0, goldGained: 0, lootGained: null });
      callAI(combatLog + " " + resCtx, updatedPlayer, true);
      setPlayerStatusEffects([]); setPlayerBuffs([]);
      savePlayer(updatedPlayer); setPlayer(updatedPlayer); setCurrentEnemy(null); setCurrentCombatEnemy(null); 
      return;
    }
    
    setPlayerStatusEffects(currentPlayerEffects);
    setPlayerBuffs(currentPlayerBuffs);
    setPlayer(updatedPlayer); setCurrentCombatEnemy(updatedEnemy); savePlayer(updatedPlayer);
  }, [player, currentCombatEnemy, currentEnemy, callAI, isOnCooldown, toast, playerStatusEffects, playerBuffs]);

  const handleLocationChange = useCallback((locationId: string) => {
    if (!player || player.currentLocation === locationId || isOnCooldown) return;
    setCurrentEnemy(null); setCurrentCombatEnemy(null);
    const location = getLocationById(locationId);
    if (!location) return;
    const updatedPlayer = { ...player, currentLocation: locationId };
    const loggedPlayer = addToActionLog(updatedPlayer, `前往${location.name}`);
    setPlayer(loggedPlayer); savePlayer(loggedPlayer);
    callAI(buildArrivalPrompt(location.name), loggedPlayer);
  }, [player, callAI, isOnCooldown]);

  const handleCreateCharacter = useCallback((newPlayer: PlayerData) => {
    savePlayer(newPlayer); setPlayer(newPlayer);
    callAI(buildArrivalPrompt(getLocationById(newPlayer.currentLocation)?.name || '小村莊'), newPlayer);
  }, [callAI]);

  const handleResetGame = () => { if (window.confirm('重置遊戲？')) { deletePlayer(); setTimeout(() => window.location.reload(), 500); } };

  const applyItemEffect = useCallback((playerData: PlayerData, item: Item): PlayerData => {
    let upP = { ...playerData };
    if (!item.effect) return upP;
    if (item.effect.type === 'HEAL') { upP.health = Math.min(upP.maxHealth, upP.health + item.effect.amount); }
    else if (item.effect.type === 'PERMANENT_STAT') { const stat = item.effect.stat; upP[stat] += item.effect.amount; if (stat === 'maxHealth') upP.health += item.effect.amount; }
    return upP;
  }, []);

  const handleUseItem = useCallback((itemId: string) => {
    if (!player) return;
    const item = player.inventory.find(i => i.id === itemId);
    if (!item || item.type !== 'consumable') return;
    let upP = applyItemEffect(player, item);
    upP = removeFromInventory(upP, itemId, 1);
    setPlayer(upP); savePlayer(upP);
  }, [player, applyItemEffect]);

  const handleEquipItem = useCallback((itemId: string) => {
    if (!player) return;
    const newItem = getItemById(itemId);
    if (!newItem || (newItem.type !== 'weapon' && newItem.type !== 'armor')) return;
    let upP = { ...player };
    if (newItem.type === 'weapon') {
      const old = getItemById(player.equippedWeapon || '');
      if (old) upP.attack -= (old.stats?.attack || 0);
      upP.equippedWeapon = itemId; upP.attack += (newItem.stats?.attack || 0);
    } else {
      const old = getItemById(player.equippedArmor || '');
      if (old) upP.defense -= (old.stats?.defense || 0);
      upP.equippedArmor = itemId; upP.defense += (newItem.stats?.defense || 0);
    }
    setPlayer(upP); savePlayer(upP);
  }, [player]);

  if (!isInitialized) return <div className="flex h-screen items-center justify-center bg-background text-foreground">載入中...</div>;
  if (!player) return <CharacterCreation onCreateCharacter={handleCreateCharacter} />;
  if (!hasApiKey) return <div className="flex h-screen items-center justify-center bg-background"><Button onClick={() => navigate('/settings')}>請先設定 API Key</Button></div>;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Sheet>
        <SheetTrigger asChild><Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50"><Menu /></Button></SheetTrigger>
        <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
          <SheetHeader className="p-6"><SheetTitle className="font-display text-2xl">冒險者選單</SheetTitle></SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4">
            <PlayerStatusCard player={player} />
            <InventoryCard inventory={player.inventory} equippedWeapon={player.equippedWeapon} equippedArmor={player.equippedArmor} onUseItem={handleUseItem} onEquipItem={handleEquipItem} />
            <LocationPanel currentLocationId={player.currentLocation} onLocationChange={handleLocationChange} isLoading={isLoading || isOnCooldown} />
          </div>
          <SheetFooter className="p-6 border-t flex-col gap-2"><Button variant="outline" className="w-full" onClick={() => navigate('/settings')}>設定</Button><Button variant="destructive" className="w-full" onClick={handleResetGame}>重置</Button></SheetFooter>
        </SheetContent>
      </Sheet>

      <main className="container mx-auto flex h-screen max-w-3xl flex-col gap-4 p-4 pt-20">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {player.storyHistory.length > 1 && (
            <Accordion type="single" collapsible><AccordionItem value="history"><AccordionTrigger>歷史回顧</AccordionTrigger><AccordionContent className="space-y-4 pt-4">{player.storyHistory.slice(0, -1).reverse().map((s, i) => <p key={i} className="text-muted-foreground">{s}</p>)}</AccordionContent></AccordionItem></Accordion>
          )}
          <Card className="flex-1">
            <CardHeader><CardTitle className="font-display text-xl">當前情節</CardTitle></CardHeader>
            <CardContent className="text-foreground/90">{isLoading && !currentStory ? <Loader2 className="animate-spin" /> : currentStory || '冒險即將開始...'}</CardContent>
          </Card>
        </div>
        {currentCombatEnemy ? (
          <CombatPanel enemy={currentCombatEnemy} playerInventory={player.inventory} onCombatAction={handleCombatAction} isLoading={isLoading} isOnCooldown={isOnCooldown} cooldownTimer={cooldownTimer} playerStatusEffects={playerStatusEffects} playerBuffs={playerBuffs} />
        ) : (
          <ActionButtons actions={actions} onAction={handleAction} isLoading={isLoading} isOnCooldown={isOnCooldown} cooldownTimer={cooldownTimer} />
        )}
      </main>
    </div>
  );
};

export default Game;
