

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
