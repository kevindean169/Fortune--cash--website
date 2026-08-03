export function GoldenTrophyIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gold metal gradient */}
        <linearGradient id="goldGrad" x1="16" y1="8" x2="48" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="30%" stopColor="#F5B041" />
          <stop offset="70%" stopColor="#D4AC0D" />
          <stop offset="100%" stopColor="#8A6B12" />
        </linearGradient>
        {/* Shiny highlights */}
        <linearGradient id="goldHighlight" x1="16" y1="8" x2="16" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* Dark base block */}
        <linearGradient id="baseDark" x1="0" y1="46" x2="0" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2D2D2D" />
          <stop offset="50%" stopColor="#1B1B1B" />
          <stop offset="100%" stopColor="#0B0B0B" />
        </linearGradient>
      </defs>

      {/* Handles */}
      {/* Left Handle */}
      <path d="M21 20 C11 20 9 32 21 34.5" stroke="url(#goldGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M21 20 C13 20 11 30 21 32.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
      
      {/* Right Handle */}
      <path d="M43 20 C53 20 55 32 43 34.5" stroke="url(#goldGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M43 20 C51 20 49 30 43 32.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Cup Body */}
      <path d="M21 14 H43 V28 C43 37.5 35.5 43 32 43 C28.5 43 21 37.5 21 28 V14Z" fill="url(#goldGrad)" stroke="#A0780A" strokeWidth="1" />
      
      {/* Shadow overlay on left side of cup */}
      <path d="M21 14 V28 C21 37.5 28.5 43 32 43 V14 H21Z" fill="#000000" opacity="0.12" />
      
      {/* Highlight overlay on right side of cup */}
      <path d="M32 14 V43 C35.5 43 43 37.5 43 28 V14 H32Z" fill="url(#goldHighlight)" opacity="0.15" />

      {/* Cup Rim Top */}
      <ellipse cx="32" cy="14" rx="11" ry="2" fill="url(#goldGrad)" stroke="#A0780A" strokeWidth="0.75" />
      <ellipse cx="32" cy="14" rx="9.5" ry="1.25" fill="#4B3A08" />

      {/* Cup Stem */}
      <path d="M28 43 H36 V48 H28 V43Z" fill="url(#goldGrad)" />
      <path d="M28 43 H32 V48 H28 V43Z" fill="#000000" opacity="0.12" />

      {/* Collar/Trim above base */}
      <path d="M24 48 H40 V50 H24 V48Z" fill="url(#goldGrad)" stroke="#A0780A" strokeWidth="0.5" />
      
      {/* Base */}
      {/* Black Pedestal Base */}
      <path d="M16 50 H48 V58 C48 59.5 46.5 60 45 60 H19 C17.5 60 16 59.5 16 58 V50Z" fill="url(#baseDark)" stroke="#111111" strokeWidth="1" />
      
      {/* Gold Trim Line at the very bottom of the pedestal */}
      <path d="M19 58.5 H45" stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Highlight on base */}
      <path d="M16 50 H48 V51.5 H16 V50Z" fill="#FFFFFF" opacity="0.2" />

      {/* Star in center of cup */}
      <polygon points="32,20.5 34.3,25.3 39.5,25.8 35.5,29.3 36.8,34.5 32,31.8 27.2,34.5 28.5,29.3 24.5,25.8 29.7,25.3" fill="#FFFFFF" />
      <polygon points="32,21.7 33.7,25.3 37.7,25.7 34.7,28.4 35.7,32.3 32,30.3 28.3,32.3 29.3,28.4 26.3,25.7 30.3,25.3" fill="#FBD249" />
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

export function GoldCoinIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Soft shadow for the coin */}
        <filter id="coinShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.75" floodColor="#000000" floodOpacity="0.3" />
        </filter>
        {/* Outer rim gradient */}
        <linearGradient id="rimGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="20%" stopColor="#E5B445" />
          <stop offset="80%" stopColor="#B3860B" />
          <stop offset="100%" stopColor="#664C00" />
        </linearGradient>
        {/* Inner face gradient */}
        <radialGradient id="faceGrad" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFDE6" />
          <stop offset="35%" stopColor="#FBD249" />
          <stop offset="85%" stopColor="#D4AC0D" />
          <stop offset="100%" stopColor="#9A7D0A" />
        </radialGradient>
      </defs>
      
      <g filter="url(#coinShadow)">
        {/* Outer Rim */}
        <circle cx="12" cy="12" r="10" fill="url(#rimGrad)" stroke="#664C00" strokeWidth="0.5" />
        
        {/* Inner Raised Face */}
        <circle cx="12" cy="12" r="8" fill="url(#faceGrad)" stroke="#B3860B" strokeWidth="0.5" />
        <circle cx="12" cy="12" r="7.5" stroke="#FFFFFF" strokeWidth="0.35" opacity="0.4" />
        
        {/* Clean, bold, crisp black dollar symbol */}
        <text
          x="12"
          y="15.5"
          fill="#111"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          $
        </text>
      </g>
    </svg>
  )
}
