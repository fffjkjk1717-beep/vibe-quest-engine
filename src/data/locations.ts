export interface Location {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string; // Lucide icon name
  dangerLevel: number;
}

export const locations: Location[] = [
  {
    id: 'village',
    name: '小村莊',
    description: '一個寧靜的小村莊，是你冒險的起點。簡樸的茅草屋錯落有致，村民們過著平凡的生活。這裡是安全的避風港，可以休息和補給。',
    color: 'from-emerald-900 to-emerald-700',
    icon: 'Home',
    dangerLevel: 0,
  },
  {
    id: 'dark_forest',
    name: '黑暗森林',
    description: '濃密的樹冠遮蔽了陽光，只有零星的光線穿透樹葉。森林深處傳來野獸的低吼，危險與機遇並存。據說有強大的怪物在此徘徊。',
    color: 'from-gray-900 to-green-900',
    icon: 'TreePine',
    dangerLevel: 3,
  },
  {
    id: 'kings_tavern',
    name: '國王酒館',
    description: '熱鬧的酒館裡充滿了各路冒險者。老闆娘笑容可掬，牆上掛滿了傳奇英雄的畫像。這裡是情報交換的最佳場所，也能讓疲憊的旅人好好休息。',
    color: 'from-amber-900 to-orange-800',
    icon: 'Beer',
    dangerLevel: 1,
  },
    {
    id: 'slave_market',
    name: '奴隸市場',
    description: '一個充滿絕望與機會的灰色地帶。空氣中瀰漫著汗水和恐懼的氣味，這裡可以買到被俘虜的戰士或流亡的法師作為夥伴，但價格不菲。',
    color: 'from-amber-800 to-stone-700',
    icon: 'Users',
    dangerLevel: 2,
  },
  {
    id: 'ancient_ruins',
    name: '古老遺跡',
    description: '被遺忘的古代文明遺跡，斷壁殘垣訴說著昔日的輝煌。傳說這裡埋藏著無數寶物，但也有致命的陷阱和守護者。',
    color: 'from-stone-800 to-slate-700',
    icon: 'Landmark',
    dangerLevel: 4,
  },
  {
    id: 'mystic_lake',
    name: '神秘湖泊',
    description: '月光下閃爍著銀色光芒的湖泊，據說湖底住著古老的精靈。湖水有神奇的治癒力量，但也可能引來不速之客。',
    color: 'from-blue-900 to-cyan-800',
    icon: 'Waves',
    dangerLevel: 2,
  },
  {
    id: 'demon_castle',
    name: '魔王城堡入口',
    description: '陰森的城堡矗立在烏雲之下，黑色的尖塔刺破天際。這是魔王的領地，只有最勇敢的冒險者才敢踏入。終局之戰即將在此展開。',
    color: 'from-purple-950 to-red-900',
    icon: 'Castle',
    dangerLevel: 5,
  },
  {
    id: 'crystal_cavern',
    name: '水晶洞窟',
    description: '深埋地底的神秘洞穴，四壁鑲嵌著發光的水晶。這些晶體散發著微弱的魔力，據說能增強法術。但洞穴深處棲息著可怕的穴居生物。',
    color: 'from-indigo-900 to-violet-800',
    icon: 'Gem',
    dangerLevel: 3,
  },
  {
    id: 'merchants_bazaar',
    name: '商人市集',
    description: '來自四面八方的商人齊聚於此，販賣各式珍奇異寶。五顏六色的帳篷下，你能找到稀有的武器、神秘的藥水，甚至是來自異國的魔法道具。',
    color: 'from-rose-900 to-pink-800',
    icon: 'Store',
    dangerLevel: 1,
  },
  {
    id: 'haunted_cemetery',
    name: '鬧鬼墓園',
    description: '荒廢的墓園籠罩在永恆的薄霧中。腐朽的墓碑歪斜傾倒，不時傳來令人毛骨悚然的低語。據說夜晚會有亡靈從墳墓中爬出。',
    color: 'from-slate-900 to-gray-800',
    icon: 'Skull',
    dangerLevel: 4,
  },
  {
    id: 'dragon_peak',
    name: '龍之峰',
    description: '高聳入雲的山峰，傳說是上古巨龍的棲息地。稀薄的空氣和陡峭的懸崖讓攀登極為困難，但峰頂的寶藏吸引著無數勇者前仆後繼。',
    color: 'from-red-950 to-orange-900',
    icon: 'Mountain',
    dangerLevel: 5,
  },
  {
    id: 'elven_sanctuary',
    name: '精靈聖所',
    description: '隱藏在迷霧森林深處的精靈居所，銀白色的建築與古木交織。精靈族對外來者態度謹慎，但若能獲得信任，他們會傳授珍貴的知識。',
    color: 'from-teal-900 to-emerald-800',
    icon: 'Leaf',
    dangerLevel: 1,
  },
  {
    id: 'frozen_wasteland',
    name: '冰封荒原',
    description: '終年被冰雪覆蓋的荒涼之地，刺骨的寒風能凍結一切生命。冰原上埋藏著遠古時代的遺物，但嚴酷的環境是最大的敵人。',
    color: 'from-sky-900 to-blue-800',
    icon: 'Snowflake',
    dangerLevel: 4,
  },
  {
    id: 'shadow_temple',
    name: '暗影神殿',
    description: '供奉黑暗之神的邪惡殿堂，被詛咒的祭壇上仍殘留著古老儀式的痕跡。這裡是黑魔法的發源地，危險程度僅次於魔王城堡。',
    color: 'from-zinc-950 to-neutral-900',
    icon: 'Moon',
    dangerLevel: 5,
  },
];

export const getLocationById = (id: string): Location | undefined => {
  return locations.find((loc) => loc.id === id);
};

export const getLocationName = (id: string): string => {
  const location = getLocationById(id);
  return location?.name || '未知地點';
};
