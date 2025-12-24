import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, Trash2, ArrowLeft, Save, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loadApiKey, saveApiKey, deleteApiKey, loadPlayer, deletePlayer, saveThrottleSetting, loadThrottleSetting } from '@/lib/localStorage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasPlayer, setHasPlayer] = useState(false);
  const [isThrottlingEnabled, setIsThrottlingEnabled] = useState(false);

  useEffect(() => {
    const savedKey = loadApiKey();
    const savedPlayer = loadPlayer();
    const throttleSetting = loadThrottleSetting();
    if (savedKey) { setApiKey(savedKey); setHasApiKey(true); }
    setHasPlayer(!!savedPlayer);
    setIsThrottlingEnabled(throttleSetting);
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setHasApiKey(true);
      toast({ title: 'API Key 已儲存', description: '你的 Groq API Key 已安全儲存於本地。' });
    }
  };

  const handleDeleteApiKey = () => {
    deleteApiKey();
    setApiKey('');
    setHasApiKey(false);
    toast({ title: 'API Key 已刪除', description: 'API Key 已從本地儲存中移除。' });
  };

  const handleResetGame = () => {
    deletePlayer();
    setHasPlayer(false);
    toast({ title: '遊戲進度已重置', description: '所有角色資料已清除，可以開始新遊戲。' });
  };

  const handleThrottleToggle = (checked: boolean) => {
    setIsThrottlingEnabled(checked);
    saveThrottleSetting(checked);
    toast({ title: '設定已更新', description: `API 節流模式已${checked ? '開啟' : '關閉'}。` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="font-display text-3xl font-bold text-foreground">設定</h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2"><Key className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold text-foreground">Groq API Key</h2></div>
            <p className="mb-4 text-sm text-muted-foreground">
              輸入你的 Groq API Key 以啟用 AI 故事生成功能。你可以在 <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">Groq Console</a> 免費取得 API Key。
            </p>
            <div className="flex gap-2">
              <Input type="password" placeholder="gsk_..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="flex-1 border-border/50 bg-secondary/30" />
              <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}><Save className="mr-2 h-4 w-4" />儲存</Button>
            </div>
            {hasApiKey && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-green-900/20 p-3">
                <span className="flex items-center gap-2 text-sm text-green-400"><CheckCircle className="h-4 w-4" />API Key 已設定</span>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={handleDeleteApiKey}><Trash2 className="mr-1 h-4 w-4" />刪除</Button>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-blue-400" /><h2 className="text-xl font-semibold text-foreground">API 節流</h2></div>
            <p className="mb-4 text-sm text-muted-foreground">開啟此選項後，每次操作之間會有 15 秒的冷卻時間，以防止達到 API 的速率限制。</p>
            <div className="flex items-center space-x-2">
              <Switch id="throttle-mode" checked={isThrottlingEnabled} onCheckedChange={handleThrottleToggle} />
              <Label htmlFor="throttle-mode">啟用 API 節流模式</Label>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" /><h2 className="text-xl font-semibold text-foreground">遊戲資料</h2></div>
            <p className="mb-4 text-sm text-muted-foreground">重置遊戲將刪除所有角色資料和進度。此操作無法復原。</p>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" disabled={!hasPlayer}><Trash2 className="mr-2 h-4 w-4" />重置遊戲進度</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>確定要重置遊戲嗎？</AlertDialogTitle><AlertDialogDescription>此操作將刪除所有角色資料、背包物品和故事紀錄。無法復原。</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleResetGame}>確定重置</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {!hasPlayer && <p className="mt-3 text-sm text-muted-foreground">目前沒有已儲存的遊戲進度。</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Button variant="outline" className="w-full" onClick={() => navigate('/game')}>返回遊戲</Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
