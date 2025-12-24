import { AIResponse, ActionOption } from '@/types/game';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const callGroqAPI = async (
  apiKey: string,
  prompt: string
): Promise<string> => {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2048,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Groq API 錯誤: ${response.status} - ${errorData.error?.message || '未知錯誤'}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

export const parseAIResponse = (rawResponse: string): AIResponse => {
  const defaultResponse: AIResponse = {
    story: '',
    actions: [],
    statusChanges: {
      healthChange: 0,
      goldChange: 0,
      expChange: 0,
      itemChanges: [],
      special: [],
    },
    enemyIdToFight: null,
    log: null,
  };

  try {
    const storyMatch = rawResponse.match(/===故事===\s*([\s\S]*?)(?=\n===|$)/);
    defaultResponse.story = storyMatch ? storyMatch[1].trim() : rawResponse.split('===')[0].trim() || rawResponse;

    const actionsMatch = rawResponse.match(/===行動選項===\s*([\s\S]*?)(?=\n===|$)/);
    if (actionsMatch) {
      const actionLines = actionsMatch[1].split('\n').filter(line => line.trim());
      defaultResponse.actions = actionLines
        .map(line => {
          const match = line.match(/\d+\.\s*\[?([^\]>\-]+)\]?\s*->\s*ACTION_CODE:\s*([\w_]+)/i);
          return match ? { description: match[1].trim(), actionCode: match[2].trim() } : null;
        })
        .filter((action): action is ActionOption => action !== null);
    }

    if (defaultResponse.actions.length === 0) {
        defaultResponse.actions.push({ description: '繼續探索', actionCode: 'EXPLORE' });
    }

    const logMatch = rawResponse.match(/===日誌===\s*([\s\S]*?)(?=\n===|$)/);
    if (logMatch) {
        const logContent = logMatch[1].trim();
        defaultResponse.log = logContent;

        const healthMatch = logContent.match(/健康變動:\s*([+-]?\d+)/);
        if (healthMatch) defaultResponse.statusChanges.healthChange = parseInt(healthMatch[1], 10);
  
        const goldMatch = logContent.match(/金幣變動:\s*([+-]?\d+)/);
        if (goldMatch) defaultResponse.statusChanges.goldChange = parseInt(goldMatch[1], 10);
  
        const expMatch = logContent.match(/經驗變動:\s*\+?(\d+)/);
        if (expMatch) defaultResponse.statusChanges.expChange = parseInt(expMatch[1], 10);
  
        const itemRegex = /(獲得|失去)\s*([a-zA-Z_]+)\s*(\d+)/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(logContent)) !== null) {
          defaultResponse.statusChanges.itemChanges.push({
            action: itemMatch[1] === '獲得' ? 'add' : 'remove',
            name: itemMatch[2].trim(),
            quantity: parseInt(itemMatch[3], 10),
          });
        }
  
        const specialMatch = logContent.match(/其他:\s*(.+)/);
        if (specialMatch && !specialMatch[1].includes('無')) {
          defaultResponse.statusChanges.special = specialMatch[1].split(/[、,\/]/).map(s => s.trim());
        }
    }

    const fightMatch = rawResponse.match(/===戰鬥目標===\s*([\s\S]*?)(?=\n===|$)/);
    if (fightMatch && fightMatch[1].trim() !== '無') {
      defaultResponse.enemyIdToFight = fightMatch[1].trim();
    }

    return defaultResponse;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return a safe, default response
    return {
      story: rawResponse || '故事繼續著...',
      actions: [{ description: '繼續探索', actionCode: 'EXPLORE' }],
      statusChanges: {
        healthChange: 0,
        goldChange: 0,
        expChange: 0,
        itemChanges: [],
        special: [],
      },
      enemyIdToFight: null,
      log: null,
    };
  }
};
