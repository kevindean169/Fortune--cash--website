export function GoldenTrophyIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="10 12 44 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Shiny gold gradient for the cup */}
        <linearGradient id="goldTrophyGrad" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF0" />
          <stop offset="25%" stopColor="#FFE885" />
          <stop offset="65%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6B12" />
        </linearGradient>
        {/* Base dark gradient */}
        <linearGradient id="baseGrad" x1="0" y1="46" x2="0" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#333333" />
          <stop offset="100%" stopColor="#0B0B0B" />
        </linearGradient>
        {/* Drop shadow for 3D depth */}
        <filter id="trophyDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Trophy Group with Shadow */}
      <g filter="url(#trophyDropShadow)">
        {/* Trophy Handles */}
        <path d="M21 21 C13 21 11 31 21 34.5" stroke="url(#goldTrophyGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M43 21 C51 21 53 31 43 34.5" stroke="url(#goldTrophyGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Cup Body */}
        <path d="M21 17 H43 V29 C43 38.5 35.5 44 32 44 C28.5 44 21 38.5 21 29 V17Z" fill="url(#goldTrophyGrad)" />
        
        {/* Rim shine */}
        <ellipse cx="32" cy="17" rx="11" ry="1.75" fill="#FFFDF0" opacity="0.7" />

        {/* Stem */}
        <path d="M28.5 43.5 H35.5 V48 H28.5 V43.5Z" fill="url(#goldTrophyGrad)" />

        {/* Base */}
        {/* Gold trim */}
        <path d="M25 48 H39 V50.5 H25 V48Z" fill="url(#goldTrophyGrad)" />
        {/* Main Base */}
        <rect x="20" y="50.5" width="24" height="5.5" rx="1" fill="url(#baseGrad)" stroke="#1A1A1A" strokeWidth="0.5" />
        <line x1="21" y1="55.5" x2="43" y2="55.5" stroke="url(#goldTrophyGrad)" strokeWidth="0.75" />
        
        {/* Star */}
        <polygon points="32,23.5 33.8,27 37.8,27.3 34.8,30 35.8,34 32,32 28.2,34 29.2,30 26.2,27.3 30.2,27" fill="#FFFFFF" opacity="0.95" />
      </g>
    </svg>
  )
}

export function GameBallGraphic({ gameName, value, isResult = false }: { gameName: string, value: string, isResult?: boolean }) {
  const normalizedName = (gameName || '').toLowerCase()
  const sizeClasses = isResult ? "!w-5 !h-5 !text-[10px]" : "!w-6 !h-6 !text-[11px]"

  if (normalizedName.includes('top prize') || normalizedName.includes('topprize') || normalizedName.includes('jackpot') || normalizedName.includes('top_prize')) {
    return <GoldenTrophyIcon className={isResult ? "size-5" : "size-10"} />
  }
  
  if (normalizedName.includes('cashpot')) {
    return (
      <div className={`number-ball number-ball-result ${sizeClasses}`}>
        {value}
      </div>
    )
  }
  
  if (normalizedName.includes('megaball')) {
    return (
      <div className={`number-ball number-ball-monsta ${sizeClasses}`}>
      </div>
    )
  }
  
  if (normalizedName.includes('monsta')) {
    return (
      <div className={`number-ball number-ball-mega ${sizeClasses}`}>
      </div>
    )
  }
  
  // Default fallback
  if (isResult) {
    return (
      <span className="bg-green-500/10 text-green-400 font-extrabold text-xs px-2 py-0.5 rounded border border-green-500/20">
        {value}
      </span>
    )
  }
  return <span className="font-black text-primary text-base">#{value}</span>
}

export function CashpotLogo({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gold Outer Ring */}
      <circle cx="50" cy="50" r="46" fill="url(#goldGrad)" stroke="#E0AC2C" strokeWidth="3" />
      {/* Red Inner Circle */}
      <circle cx="50" cy="50" r="36" fill="url(#redGrad)" />
      {/* Stars and text */}
      <text x="50" y="42" fill="#FFFFFF" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CASH</text>
      <text x="50" y="66" fill="#FFD700" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">POT</text>
      {/* Star in center */}
      <polygon points="50,45 52,50 57,50 53,53 55,58 50,55 45,58 47,53 43,50 48,50" fill="#FFFFFF" />
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="50%" stopColor="#D1A125" />
          <stop offset="100%" stopColor="#7E5F0E" />
        </linearGradient>
        <linearGradient id="redGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF416C" />
          <stop offset="100%" stopColor="#FF4B2B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function MoneyTimeLogo({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Roulette wheel border */}
      <circle cx="50" cy="50" r="46" fill="#1A1A1A" stroke="#FFD700" strokeWidth="4" />
      {/* Inner wheel with segments */}
      <circle cx="50" cy="50" r="38" fill="#0A5C36" stroke="#FFFFFF" strokeWidth="1" />
      {/* Roulette lines / segments representation */}
      <path d="M50 12 V88 M12 50 H88 M23 23 L77 77 M23 77 L77 23" stroke="#FFD700" strokeWidth="1.5" opacity="0.4" />
      {/* Center Gold Circle */}
      <circle cx="50" cy="50" r="22" fill="url(#goldGradMoney)" stroke="#FFD700" strokeWidth="1" />
      <text x="50" y="44" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">MONEY</text>
      <text x="50" y="60" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">TIME</text>
      <circle cx="68" cy="32" r="3" fill="#FFFFFF" /> {/* Roulette ball */}
      <defs>
        <linearGradient id="goldGradMoney" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3C72" />
          <stop offset="100%" stopColor="#2A5298" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Pick2Logo({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded Square or Capsule */}
      <rect x="4" y="4" width="92" height="92" rx="20" fill="url(#pick2Grad)" stroke="#FFA500" strokeWidth="3" />
      {/* "PICK" text */}
      <text x="50" y="38" fill="#FFFFFF" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">PICK</text>
      {/* Big "2" */}
      <text x="50" y="84" fill="#FFFFFF" fontSize="46" fontWeight="950" textAnchor="middle" fontFamily="sans-serif" filter="drop-shadow(2px 4px 6px rgba(0,0,0,0.3))">2</text>
      <defs>
        <linearGradient id="pick2Grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F9D423" />
          <stop offset="100%" stopColor="#FF4E50" />
        </linearGradient>
      </defs>
    </svg>
  )
}
