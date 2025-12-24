import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sword, Settings, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadPlayer, loadApiKey } from '@/lib/localStorage';

const Index = () => {
  const navigate = useNavigate();
  const [hasPlayer, setHasPlayer] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const player = loadPlayer();
    const apiKey = loadApiKey();
    setHasPlayer(!!player);
    setHasApiKey(!!apiKey);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Sword className="mx-auto mb-6 h-20 w-20 text-primary" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-4 font-display text-6xl font-bold tracking-tight text-foreground md:text-7xl">
          Vibe Quest
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mb-8 text-lg text-muted-foreground md:text-xl">
          AI 驅動的黑暗奇幻文字冒險
        </motion.p>

        {!hasApiKey && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mx-auto mb-6 flex max-w-md items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>請先在設定頁面輸入 Groq API Key 以開始遊戲</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col items-center gap-4">
          <Button size="lg" className="bg-primary px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30" onClick={() => navigate('/game')}>
            <Sparkles className="mr-2 h-5 w-5" />
            {hasPlayer ? '繼續冒險' : '開始遊戲'}
          </Button>

          <Button variant="outline" size="lg" className="border-border/50" onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            設定
          </Button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }} className="mt-12 text-xs text-muted-foreground/60">
          所有資料儲存於本地瀏覽器 · 使用 Groq AI 生成故事
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
