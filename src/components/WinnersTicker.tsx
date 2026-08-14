
const maskAccount = (val: any): string => {
  if (!val) return '8***28';
  const str = String(val).trim();
  if (/^\d{5}$/.test(str)) {
    return `${str[0]}***${str.slice(-2)}`;
  }
  if (/^\d+$/.test(str)) {
    if (str.length > 2) {
      return `${str[0]}***${str.slice(-2)}`;
    }
    return str;
  }
  // Consistent hash to 5-digit account number, then mask
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const num = Math.abs(hash % 90000) + 10000;
  const numStr = String(num);
  return `${numStr[0]}***${numStr.slice(-2)}`;
};

export function WinnersTicker() {
  const scrollWinners = (() => {
    const localList = [
      { game: 'Money Time Megaball Win', time: '09:00 PM', name: '84628', prize: '$30', number: '27' },
      { game: 'Money Time Monstaball Win', time: '08:00 PM', name: '29381', prize: '$23', number: '12' },
      { game: 'Pick 2 Double', time: '04:30 PM', name: '74820', prize: '$110', number: '07-36' },
      { game: 'Pick 2 Single', time: '10:00 AM', name: '93721', prize: '$150', number: '63' },
      { game: 'Money Time Megaball Win', time: '11:00 AM', name: '10582', prize: '$300', number: '15' },
      { game: 'Money Time Monstaball Win', time: '07:30 PM', name: '63810', prize: '$180', number: '29' }
    ];

    return localList.map(w => ({
      ...w,
      name: maskAccount(w.name)
    }));
  })();

  return (
    <div className="bg-[#00a651] py-2 overflow-hidden relative z-30 w-full select-none text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer items-center">
        {/* Loop twice for seamless scrolling */}
        {Array(2).fill(scrollWinners).flat().map((w, idx) => (
          <span key={idx} className="mx-6 flex items-center gap-1">
            <span>{w.game.toLowerCase().endsWith('win') ? w.game : `${w.game} Winner`}: {w.name} won {w.prize} {w.number ? `(No. ${w.number})` : ''} @ {w.time}</span>
            <span className="ml-12 text-white/40 font-normal">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
