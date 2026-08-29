// High-fidelity game achievement badge image assets
// Visual direction based on tiered RPG winged crests, gemstone shields, and royal emblems.

const createSvgDataUrl = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
};

// 1. Back From The Void - Winged Sapphire Shield Crest with Gold Filigree (Discipline)
const sapphireShieldCrestSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFEFA6" />
      <stop offset="35%" stop-color="#F5B838" />
      <stop offset="70%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#854D0E" />
    </linearGradient>
    <linearGradient id="sapphireGem" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="25%" stop-color="#38BDF8" />
      <stop offset="70%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
    <linearGradient id="purpleShield" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4C1D95" />
      <stop offset="50%" stop-color="#581C87" />
      <stop offset="100%" stop-color="#2E1065" />
    </linearGradient>
    <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#E0E7FF" />
      <stop offset="100%" stop-color="#C7D2FE" />
    </linearGradient>
    <filter id="badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Outer Aura Glow -->
  <circle cx="60" cy="60" r="48" fill="#38BDF8" opacity="0.15" filter="url(#badgeGlow)" />

  <!-- Feathered Angel Wings (Left) -->
  <path d="M42 52 C26 42, 10 46, 6 56 C14 56, 26 57, 36 64 C20 64, 12 70, 16 78 C24 76, 34 74, 42 76 Z" fill="url(#wingGrad)" stroke="#A5B4FC" stroke-width="1.2" />
  <path d="M42 46 C24 32, 14 36, 12 44 C22 45, 32 48, 42 54 Z" fill="#FFFFFF" opacity="0.9" />

  <!-- Feathered Angel Wings (Right) -->
  <path d="M78 52 C94 42, 110 46, 114 56 C106 56, 94 57, 84 64 C100 64, 108 70, 104 78 C96 76, 86 74, 78 76 Z" fill="url(#wingGrad)" stroke="#A5B4FC" stroke-width="1.2" />
  <path d="M78 46 C96 32, 106 36, 108 44 C98 45, 88 48, 78 54 Z" fill="#FFFFFF" opacity="0.9" />

  <!-- Royal Purple Base Ribbon / Shield -->
  <path d="M60 22 L86 38 L82 82 L60 102 L38 82 L34 38 Z" fill="url(#purpleShield)" stroke="url(#goldLight)" stroke-width="2.5" />

  <!-- Outer Golden Frame -->
  <path d="M60 26 L82 40 L78 78 L60 94 L42 78 L38 40 Z" fill="none" stroke="url(#goldLight)" stroke-width="3" />

  <!-- Inner Cyan Sapphire Background -->
  <path d="M60 32 L78 44 L74 74 L60 88 L46 74 L42 44 Z" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5" />

  <!-- Faceted Sapphire Diamond Gem Core -->
  <polygon points="60,40 73,58 60,76 47,58" fill="url(#sapphireGem)" stroke="#E0F2FE" stroke-width="1.5" filter="url(#badgeGlow)" />
  <polygon points="60,40 60,76 47,58" fill="#38BDF8" opacity="0.6" />
  <polygon points="60,40 73,58 60,58" fill="#BAE6FD" opacity="0.8" />
  <polygon points="60,58 73,58 60,76" fill="#0369A1" opacity="0.9" />

  <!-- Golden Crown Top Filigree -->
  <path d="M60 14 L66 24 L74 20 L70 28 L60 26 L50 28 L46 20 L54 24 Z" fill="url(#goldLight)" stroke="#78350F" stroke-width="0.8" />
  <circle cx="60" cy="14" r="2.5" fill="#FFEFA6" />

  <!-- Sparkling Specular Stars -->
  <path d="M60 48 Q60 54 66 54 Q60 54 60 60 Q60 54 54 54 Q60 54 60 48 Z" fill="#FFFFFF" />
  <circle cx="72" cy="46" r="1.5" fill="#FFFFFF" />
  <circle cx="48" cy="68" r="1.5" fill="#FFFFFF" />
</svg>
`;

// 2. Not Today, Side Quest - Ruby Royal Crown Crest with Star & Ribbons (Focus)
const rubyCrownCrestSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="30%" stop-color="#FBBF24" />
      <stop offset="70%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="rubyGem" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE4E6" />
      <stop offset="30%" stop-color="#F43F5E" />
      <stop offset="70%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#881337" />
    </linearGradient>
    <linearGradient id="pinkRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F472B6" />
      <stop offset="50%" stop-color="#DB2777" />
      <stop offset="100%" stop-color="#9D174D" />
    </linearGradient>
    <filter id="rubyGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Aura -->
  <circle cx="60" cy="60" r="48" fill="#F43F5E" opacity="0.16" filter="url(#rubyGlow)" />

  <!-- Royal Crown Spikes (Top) -->
  <path d="M60 12 L68 28 L82 22 L76 38 L60 34 L44 38 L38 22 L52 28 Z" fill="url(#goldTrim)" stroke="#78350F" stroke-width="1" />
  <circle cx="60" cy="11" r="3" fill="#FFE4E6" />
  <circle cx="38" cy="21" r="2.5" fill="#FFE4E6" />
  <circle cx="82" cy="21" r="2.5" fill="#FFE4E6" />

  <!-- Pink Side Ribbons / Wings -->
  <path d="M40 60 C22 56, 12 66, 8 78 C20 78, 30 74, 38 82 C28 90, 20 102, 34 104 C40 96, 42 88, 46 80 Z" fill="url(#pinkRibbon)" stroke="url(#goldTrim)" stroke-width="1.2" />
  <path d="M80 60 C98 56, 108 66, 112 78 C100 78, 90 74, 82 82 C92 90, 100 102, 86 104 C80 96, 78 88, 74 80 Z" fill="url(#pinkRibbon)" stroke="url(#goldTrim)" stroke-width="1.2" />

  <!-- Main Medallion Outer Ring -->
  <circle cx="60" cy="60" r="34" fill="#500724" stroke="url(#goldTrim)" stroke-width="4" />
  <circle cx="60" cy="60" r="28" fill="url(#pinkRibbon)" stroke="#FBCFE8" stroke-width="1.5" />

  <!-- Central Faceted Ruby Star Gem -->
  <polygon points="60,38 67,52 82,60 67,68 60,82 53,68 38,60 53,52" fill="url(#rubyGem)" stroke="#FFF1F2" stroke-width="1.5" filter="url(#rubyGlow)" />
  <polygon points="60,38 60,82 53,68 38,60 53,52" fill="#F43F5E" opacity="0.6" />
  <polygon points="60,38 67,52 60,60" fill="#FFE4E6" opacity="0.9" />

  <!-- Bottom Gold Star Medal -->
  <polygon points="60,94 63,101 70,102 65,107 66,114 60,110 54,114 55,107 50,102 57,101" fill="url(#goldTrim)" stroke="#78350F" stroke-width="0.8" />
  <circle cx="60" cy="104" r="2" fill="#F43F5E" />

  <!-- Specular Sparkle -->
  <path d="M60 52 Q60 58 66 58 Q60 58 60 64 Q60 58 54 58 Q60 58 60 52 Z" fill="#FFFFFF" />
  <circle cx="70" cy="48" r="1.5" fill="#FFFFFF" />
</svg>
`;

// 3. Touch Grass - Emerald Laurels & Winged Crest (Recovery)
const emeraldLaurelCrestSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="goldBezel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="35%" stop-color="#EAB308" />
      <stop offset="70%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#713F12" />
    </linearGradient>
    <linearGradient id="emeraldGem" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DCFCE7" />
      <stop offset="25%" stop-color="#34D399" />
      <stop offset="65%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <linearGradient id="greenRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Outer Glow -->
  <circle cx="60" cy="60" r="48" fill="#10B981" opacity="0.16" filter="url(#emeraldGlow)" />

  <!-- Emerald Laurels (Left) -->
  <path d="M42 34 C28 32, 18 44, 20 58 C24 58, 30 52, 36 50 C22 62, 24 78, 38 82 C34 74, 38 66, 44 64 Z" fill="url(#greenRibbon)" stroke="url(#goldBezel)" stroke-width="1.2" />
  <!-- Emerald Laurels (Right) -->
  <path d="M78 34 C92 32, 102 44, 100 58 C96 58, 90 52, 84 50 C98 62, 96 78, 82 82 C86 74, 82 66, 76 64 Z" fill="url(#greenRibbon)" stroke="url(#goldBezel)" stroke-width="1.2" />

  <!-- Top Emerald Star Crown -->
  <polygon points="60,14 65,24 76,22 68,30 72,40 60,34 48,40 52,30 44,22 55,24" fill="url(#goldBezel)" stroke="#713F12" stroke-width="1" />
  <circle cx="60" cy="22" r="3" fill="#34D399" />

  <!-- Main Medallion Frame -->
  <circle cx="60" cy="62" r="32" fill="#022C22" stroke="url(#goldBezel)" stroke-width="3.5" />
  <circle cx="60" cy="62" r="26" fill="url(#greenRibbon)" stroke="#A7F3D0" stroke-width="1.2" />

  <!-- Emerald Diamond Core -->
  <polygon points="60,42 74,62 60,82 46,62" fill="url(#emeraldGem)" stroke="#ECFDF5" stroke-width="1.5" filter="url(#emeraldGlow)" />
  <polygon points="60,42 60,82 46,62" fill="#059669" opacity="0.6" />
  <polygon points="60,42 74,62 60,62" fill="#A7F3D0" opacity="0.85" />
  <polygon points="60,62 74,62 60,82" fill="#064E3B" opacity="0.9" />

  <!-- Bottom Spanning Banner -->
  <path d="M30 92 Q60 102 90 92 L86 102 Q60 110 34 102 Z" fill="url(#greenRibbon)" stroke="url(#goldBezel)" stroke-width="1.5" />

  <!-- Specular Sparkles -->
  <path d="M60 52 Q60 58 66 58 Q60 58 60 64 Q60 58 54 58 Q60 58 60 52 Z" fill="#FFFFFF" />
  <circle cx="70" cy="50" r="1.5" fill="#FFFFFF" />
</svg>
`;

// 4. Ship It - Grand Celestial Angelic Crown Crest (Completion / Milestone)
const celestialGrandCrestSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="celestialGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="20%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="85%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="diamondAura" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#BAE6FD" />
      <stop offset="70%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="grandWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#F0F9FF" />
      <stop offset="80%" stop-color="#BAE6FD" />
      <stop offset="100%" stop-color="#E0E7FF" />
    </linearGradient>
    <filter id="grandGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Radiant Solar Starburst Glow -->
  <circle cx="60" cy="60" r="54" fill="#38BDF8" opacity="0.22" filter="url(#grandGlow)" />
  <circle cx="60" cy="60" r="44" fill="#FDE047" opacity="0.18" filter="url(#grandGlow)" />

  <!-- Multi-tiered Majestic Wings (Left) -->
  <path d="M42 46 C20 28, 4 36, 2 52 C14 50, 26 54, 38 64 C18 64, 8 74, 12 86 C24 82, 34 78, 42 82 Z" fill="url(#grandWing)" stroke="url(#celestialGold)" stroke-width="1.5" />
  <path d="M44 38 C26 18, 12 24, 8 36 C22 36, 34 42, 44 50 Z" fill="#FFFFFF" opacity="0.95" />

  <!-- Multi-tiered Majestic Wings (Right) -->
  <path d="M78 46 C100 28, 116 36, 118 52 C106 50, 94 54, 82 64 C102 64, 112 74, 108 86 C96 82, 86 78, 78 82 Z" fill="url(#grandWing)" stroke="url(#celestialGold)" stroke-width="1.5" />
  <path d="M76 38 C94 18, 108 24, 112 36 C98 36, 86 42, 76 50 Z" fill="#FFFFFF" opacity="0.95" />

  <!-- Grand Golden Shield Frame -->
  <path d="M60 16 L88 34 L82 86 L60 110 L38 86 L32 34 Z" fill="#0F172A" stroke="url(#celestialGold)" stroke-width="3" />
  <path d="M60 22 L82 38 L76 80 L60 100 L44 80 L38 38 Z" fill="url(#celestialGold)" opacity="0.3" stroke="url(#celestialGold)" stroke-width="1.5" />

  <!-- Golden Imperial Filigree Tiara -->
  <path d="M60 8 L68 20 L80 14 L74 26 L60 24 L46 26 L40 14 L52 20 Z" fill="url(#celestialGold)" stroke="#78350F" stroke-width="1" />
  <circle cx="60" cy="8" r="3" fill="#FFFFFF" />

  <!-- Radiant Diamond Centerpiece -->
  <polygon points="60,34 76,56 60,82 44,56" fill="url(#diamondAura)" stroke="#FFFFFF" stroke-width="2" filter="url(#grandGlow)" />
  <polygon points="60,34 60,82 44,56" fill="#38BDF8" opacity="0.6" />
  <polygon points="60,34 76,56 60,56" fill="#FFFFFF" opacity="0.9" />
  <polygon points="60,56 76,56 60,82" fill="#1E40AF" opacity="0.9" />

  <!-- Tiered Gold Ribbon Bottom -->
  <path d="M36 94 Q60 106 84 94 L80 106 Q60 116 40 106 Z" fill="url(#celestialGold)" stroke="#78350F" stroke-width="1.2" />

  <!-- Brilliant Specular Glints -->
  <path d="M60 44 Q60 52 68 52 Q60 52 60 60 Q60 52 52 52 Q60 52 60 44 Z" fill="#FFFFFF" />
  <circle cx="72" cy="40" r="2" fill="#FFFFFF" />
  <circle cx="48" cy="70" r="1.8" fill="#FFFFFF" />
</svg>
`;

// 5. Novice Operative / Level Rank Crest (Level 1)
const rankNoviceCrestSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="rankGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#EAB308" />
      <stop offset="80%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#854D0E" />
    </linearGradient>
    <linearGradient id="rankShield" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <filter id="rankGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="46" fill="#F59E0B" opacity="0.14" filter="url(#rankGlow)" />
  
  <!-- Outer Beveled Shield -->
  <path d="M60 16 L90 32 L84 84 L60 106 L36 84 L30 32 Z" fill="url(#rankShield)" stroke="url(#rankGold)" stroke-width="3" />
  <path d="M60 24 L82 38 L78 78 L60 96 L42 78 L38 38 Z" fill="#18181B" stroke="url(#rankGold)" stroke-width="1.5" />

  <!-- Level 1 Insignia Jewel -->
  <polygon points="60,36 74,54 60,74 46,54" fill="#38BDF8" stroke="#E0F2FE" stroke-width="1.5" />
  <polygon points="60,36 60,74 46,54" fill="#0284C7" opacity="0.7" />
  <polygon points="60,36 74,54 60,54" fill="#BAE6FD" opacity="0.9" />

  <!-- Top Crown Star -->
  <polygon points="60,10 63,17 70,18 65,23 66,30 60,26 54,30 55,23 50,18 57,17" fill="url(#rankGold)" stroke="#78350F" stroke-width="0.8" />
  
  <!-- Star Specular -->
  <circle cx="60" cy="46" r="2" fill="#FFFFFF" />
</svg>
`;

// 6. Milestone Trophy Crest / Header Asset
const milestoneTrophyBadgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="30%" stop-color="#FBBF24" />
      <stop offset="70%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <filter id="trophyGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="48" fill="#FBBF24" opacity="0.16" filter="url(#trophyGlow)" />

  <!-- Golden Laurel Wreath -->
  <path d="M40 32 C26 30, 16 42, 18 56 C22 56, 28 50, 34 48 C20 60, 22 76, 36 80 C32 72, 36 64, 42 62 Z" fill="url(#trophyGold)" opacity="0.9" />
  <path d="M80 32 C94 30, 104 42, 102 56 C98 56, 92 50, 86 48 C100 60, 98 76, 84 80 C88 72, 84 64, 78 62 Z" fill="url(#trophyGold)" opacity="0.9" />

  <!-- Trophy Cup Body -->
  <path d="M44 32 L76 32 L72 64 C72 74, 60 76, 60 76 C60 76, 48 74, 48 64 Z" fill="url(#trophyGold)" stroke="#78350F" stroke-width="1.5" />
  <!-- Trophy Handles -->
  <path d="M44 36 C32 36, 32 54, 46 56" fill="none" stroke="url(#trophyGold)" stroke-width="3.5" />
  <path d="M76 36 C88 36, 88 54, 74 56" fill="none" stroke="url(#trophyGold)" stroke-width="3.5" />

  <!-- Trophy Pedestal -->
  <path d="M56 76 L64 76 L66 90 L54 90 Z" fill="url(#trophyGold)" stroke="#78350F" stroke-width="1.2" />
  <path d="M46 90 L74 90 L78 98 L42 98 Z" fill="url(#trophyGold)" stroke="#78350F" stroke-width="1.5" />

  <!-- Crown Star in Cup -->
  <polygon points="60,40 63,46 70,47 65,52 66,58 60,55 54,58 55,52 50,47 57,46" fill="#FFFFFF" />
  <circle cx="60" cy="48" r="2.5" fill="#38BDF8" />
</svg>
`;

// 7. Sparkling XP Power Crystal Asset
const xpCrystalSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="xpGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="25%" stop-color="#38BDF8" />
      <stop offset="65%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#075985" />
    </linearGradient>
    <filter id="xpGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="44" fill="#38BDF8" opacity="0.25" filter="url(#xpGlow)" />

  <!-- Faceted Hex Crystal -->
  <polygon points="60,20 86,42 86,78 60,100 34,78 34,42" fill="url(#xpGemGrad)" stroke="#F0F9FF" stroke-width="2" />
  <polygon points="60,20 60,100 34,78 34,42" fill="#0284C7" opacity="0.65" />
  <polygon points="60,20 86,42 60,60" fill="#BAE6FD" opacity="0.9" />
  <polygon points="60,60 86,42 86,78" fill="#0369A1" opacity="0.8" />
  <polygon points="60,60 86,78 60,100" fill="#075985" opacity="0.95" />

  <!-- Sparkles -->
  <path d="M60 36 Q60 44 68 44 Q60 44 60 52 Q60 44 52 44 Q60 44 60 36 Z" fill="#FFFFFF" />
  <circle cx="74" cy="34" r="2" fill="#FFFFFF" />
</svg>
`;

// 8. Main Quest Emblem - Winged Golden Solar Crest with Royal Shield
const mainQuestEmblemSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="mqGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#FDE047" />
      <stop offset="60%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#854D0E" />
    </linearGradient>
    <linearGradient id="mqCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#60A5FA" />
      <stop offset="70%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1E3A8A" />
    </linearGradient>
    <linearGradient id="mqWings" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#FEF08A" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <filter id="mqGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="48" fill="#F59E0B" opacity="0.18" filter="url(#mqGlow)" />

  <!-- Gold Feathered Wings Left -->
  <path d="M42 48 C22 34, 8 40, 4 54 C16 52, 28 56, 38 66 C20 66, 10 74, 14 84 C26 80, 36 78, 44 80 Z" fill="url(#mqWings)" stroke="url(#mqGold)" stroke-width="1.2" />
  <path d="M44 42 C28 24, 16 30, 12 40 C24 40, 34 44, 44 50 Z" fill="#FFFFFF" opacity="0.9" />

  <!-- Gold Feathered Wings Right -->
  <path d="M78 48 C98 34, 112 40, 116 54 C104 52, 92 56, 82 66 C100 66, 110 74, 106 84 C94 80, 84 78, 76 80 Z" fill="url(#mqWings)" stroke="url(#mqGold)" stroke-width="1.2" />
  <path d="M76 42 C92 24, 104 30, 108 40 C96 40, 86 44, 76 50 Z" fill="#FFFFFF" opacity="0.9" />

  <!-- Royal Shield Body -->
  <path d="M60 18 L86 34 L80 82 L60 104 L40 82 L34 34 Z" fill="#0F172A" stroke="url(#mqGold)" stroke-width="3" />
  <path d="M60 26 L80 38 L76 76 L60 94 L44 76 L40 38 Z" fill="url(#mqGold)" opacity="0.25" stroke="url(#mqGold)" stroke-width="1.2" />

  <!-- Diamond Solar Core -->
  <polygon points="60,34 76,56 60,80 44,56" fill="url(#mqCore)" stroke="#FFFFFF" stroke-width="1.8" filter="url(#mqGlow)" />
  <polygon points="60,34 60,80 44,56" fill="#3B82F6" opacity="0.6" />
  <polygon points="60,34 76,56 60,56" fill="#FFFFFF" opacity="0.9" />

  <!-- Crown Top Star -->
  <polygon points="60,10 64,18 72,19 66,25 68,32 60,28 52,32 54,25 48,19 56,18" fill="url(#mqGold)" stroke="#78350F" stroke-width="0.8" />
  <circle cx="60" cy="10" r="2.5" fill="#FFFFFF" />

  <!-- Specular -->
  <path d="M60 46 Q60 52 66 52 Q60 52 60 58 Q60 52 54 52 Q60 52 60 46 Z" fill="#FFFFFF" />
  <circle cx="70" cy="44" r="1.5" fill="#FFFFFF" />
</svg>
`;

// 9. Next Action Emblem - Sapphire Winged Speed Dagger / Execution Crest
const nextActionEmblemSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="naSilver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#E2E8F0" />
      <stop offset="70%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="naSapphire" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="30%" stop-color="#38BDF8" />
      <stop offset="70%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0C4A6E" />
    </linearGradient>
    <linearGradient id="naCyanWings" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#BAE6FD" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
    <filter id="naGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="48" fill="#38BDF8" opacity="0.18" filter="url(#naGlow)" />

  <!-- Swift Cyan Wings Left -->
  <path d="M44 50 C26 36, 12 40, 8 52 C20 52, 30 56, 40 64 C24 64, 16 72, 20 80 C30 78, 38 76, 46 78 Z" fill="url(#naCyanWings)" stroke="#E0F2FE" stroke-width="1.2" />
  <!-- Swift Cyan Wings Right -->
  <path d="M76 50 C94 36, 108 40, 112 52 C100 52, 90 56, 80 64 C96 64, 104 72, 100 80 C90 78, 82 76, 74 78 Z" fill="url(#naCyanWings)" stroke="#E0F2FE" stroke-width="1.2" />

  <!-- Outer Silver/White Octagon -->
  <polygon points="60,18 84,30 92,60 84,90 60,102 36,90 28,60 36,30" fill="#09090B" stroke="url(#naSilver)" stroke-width="3" />

  <!-- Speed Blade / Execution Gem -->
  <polygon points="60,26 74,60 60,94 46,60" fill="url(#naSapphire)" stroke="#FFFFFF" stroke-width="1.8" filter="url(#naGlow)" />
  <polygon points="60,26 60,94 46,60" fill="#0284C7" opacity="0.6" />
  <polygon points="60,26 74,60 60,60" fill="#E0F2FE" opacity="0.9" />

  <!-- Center Bolt / Target -->
  <polygon points="60,42 66,54 58,58 64,74 54,62 62,58" fill="#FFFFFF" />
  <circle cx="60" cy="22" r="2.5" fill="#38BDF8" />
  <circle cx="60" cy="98" r="2" fill="#FFFFFF" />
</svg>
`;

// 10. Parking Lot Emblem - Amethyst Distraction Shield & Starlight Vault
const parkingLotEmblemSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="plGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="35%" stop-color="#FBBF24" />
      <stop offset="75%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="plAmethyst" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5D0FE" />
      <stop offset="30%" stop-color="#C084FC" />
      <stop offset="70%" stop-color="#7E22CE" />
      <stop offset="100%" stop-color="#3B0764" />
    </linearGradient>
    <linearGradient id="plWings" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF5FF" />
      <stop offset="45%" stop-color="#E9D5FF" />
      <stop offset="100%" stop-color="#C084FC" />
    </linearGradient>
    <filter id="plGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="48" fill="#A855F7" opacity="0.18" filter="url(#plGlow)" />

  <!-- Amethyst Wings Left -->
  <path d="M42 46 C24 32, 10 38, 6 50 C18 50, 28 54, 38 64 C20 64, 12 72, 16 82 C28 78, 36 76, 44 78 Z" fill="url(#plWings)" stroke="url(#plGold)" stroke-width="1.2" />
  <!-- Amethyst Wings Right -->
  <path d="M78 46 C96 32, 110 38, 114 50 C102 50, 92 54, 82 64 C100 64, 108 72, 104 82 C92 78, 84 76, 76 78 Z" fill="url(#plWings)" stroke="url(#plGold)" stroke-width="1.2" />

  <!-- Vault Shield Outer Frame -->
  <path d="M60 20 L86 36 L82 82 L60 102 L38 82 L34 36 Z" fill="#180B26" stroke="url(#plGold)" stroke-width="3" />

  <!-- Amethyst Star Core -->
  <polygon points="60,36 68,52 84,60 68,68 60,84 52,68 36,60 52,52" fill="url(#plAmethyst)" stroke="#FAF5FF" stroke-width="1.8" filter="url(#plGlow)" />
  <polygon points="60,36 60,84 52,68 36,60 52,52" fill="#7E22CE" opacity="0.6" />
  <polygon points="60,36 68,52 60,60" fill="#F5D0FE" opacity="0.9" />

  <!-- Lock Seal in Center -->
  <circle cx="60" cy="60" r="4" fill="#FFFFFF" />
  <path d="M60 64 L60 70" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />

  <!-- Top Crown Jewel -->
  <polygon points="60,12 64,20 72,20 66,26 68,34 60,29 52,34 54,26 48,20 56,20" fill="url(#plGold)" stroke="#581C87" stroke-width="0.8" />
  <circle cx="60" cy="12" r="2.5" fill="#E9D5FF" />
</svg>
`;

// 11. Player State Emblem - Amber & Gold Core Sunburst Crest
const playerStateEmblemSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="psGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="35%" stop-color="#F59E0B" />
      <stop offset="75%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="psAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="30%" stop-color="#FBBF24" />
      <stop offset="70%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#451A03" />
    </linearGradient>
    <filter id="psGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="48" fill="#F59E0B" opacity="0.18" filter="url(#psGlow)" />

  <!-- Outer Sun Rays Medallion -->
  <path d="M60 14 L68 28 L82 22 L76 38 L92 40 L80 52 L94 62 L78 68 L86 82 L72 82 L72 98 L60 88 L48 98 L48 82 L34 82 L42 68 L26 62 L40 52 L28 40 L44 38 L38 22 L52 28 Z" fill="url(#psGold)" stroke="#78350F" stroke-width="1.2" />

  <!-- Inner Dark Core Shield -->
  <circle cx="60" cy="60" r="30" fill="#1C1917" stroke="url(#psGold)" stroke-width="3" />

  <!-- Faceted Amber Core -->
  <polygon points="60,38 74,54 60,76 46,54" fill="url(#psAmber)" stroke="#FFFBEB" stroke-width="1.5" filter="url(#psGlow)" />
  <polygon points="60,38 60,76 46,54" fill="#D97706" opacity="0.6" />
  <polygon points="60,38 74,54 60,54" fill="#FEF08A" opacity="0.9" />

  <!-- Center Sparkle -->
  <circle cx="60" cy="50" r="2.5" fill="#FFFFFF" />
</svg>
`;

// 12. Focus Energy Orb - Topaz Lightning Medallion
const focusEnergyOrbSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="feGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#EAB308" />
      <stop offset="80%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#713F12" />
    </linearGradient>
    <linearGradient id="feSun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF9C3" />
      <stop offset="35%" stop-color="#FACC15" />
      <stop offset="70%" stop-color="#EA580C" />
      <stop offset="100%" stop-color="#7C2D12" />
    </linearGradient>
    <filter id="feGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="46" fill="#FACC15" opacity="0.2" filter="url(#feGlow)" />
  <circle cx="60" cy="60" r="38" fill="#1C1917" stroke="url(#feGold)" stroke-width="3.5" />
  <circle cx="60" cy="60" r="30" fill="url(#feSun)" stroke="#FEF08A" stroke-width="1.5" />

  <!-- Lightning Bolt -->
  <polygon points="62,32 46,60 58,60 52,86 74,54 62,54" fill="#FFFFFF" stroke="#FEF08A" stroke-width="1" filter="url(#feGlow)" />
  <circle cx="60" cy="40" r="2" fill="#FFFFFF" />
</svg>
`;

// 13. Recovery Heart Emblem - Emerald Winged Life Crystal
const recoveryHeartBadgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="rhGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <linearGradient id="rhEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D1FAE5" />
      <stop offset="30%" stop-color="#34D399" />
      <stop offset="70%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <filter id="rhGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="46" fill="#10B981" opacity="0.2" filter="url(#rhGlow)" />
  <circle cx="60" cy="60" r="36" fill="#022C22" stroke="#34D399" stroke-width="3" />

  <!-- Faceted Emerald Heart Gem -->
  <path d="M60 40 C66 32, 78 32, 82 42 C86 52, 74 68, 60 82 C46 68, 34 52, 38 42 C42 32, 54 32, 60 40 Z" fill="url(#rhEmerald)" stroke="#ECFDF5" stroke-width="1.8" filter="url(#rhGlow)" />
  <circle cx="54" cy="42" r="2.5" fill="#FFFFFF" />
  <circle cx="66" cy="42" r="2.5" fill="#FFFFFF" />
</svg>
`;

// 14. Momentum Fire Emblem - Ruby & Gold Star Insignia
const momentumFireBadgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="mfGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="mfRuby" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE4E6" />
      <stop offset="30%" stop-color="#F43F5E" />
      <stop offset="70%" stop-color="#BE123C" />
      <stop offset="100%" stop-color="#4C0519" />
    </linearGradient>
    <filter id="mfGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="46" fill="#F43F5E" opacity="0.2" filter="url(#mfGlow)" />
  <circle cx="60" cy="60" r="36" fill="#2A0815" stroke="url(#mfGold)" stroke-width="3" />

  <!-- Dual Flame Blades -->
  <path d="M60 26 C68 40, 78 48, 74 66 C70 78, 60 84, 60 84 C60 84, 50 78, 46 66 C42 48, 52 40, 60 26 Z" fill="url(#mfRuby)" stroke="#FFF1F2" stroke-width="1.8" filter="url(#mfGlow)" />
  <circle cx="60" cy="54" r="3" fill="#FFFFFF" />
</svg>
`;

// 15. Movement Swiftness Emblem - Celestial Winged Medallion
const movementSwiftnessBadgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="msGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="msCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="40%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
    <filter id="msGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="46" fill="#38BDF8" opacity="0.18" filter="url(#msGlow)" />
  <circle cx="60" cy="60" r="36" fill="#0C4A6E" stroke="url(#msGold)" stroke-width="3" />

  <!-- Winged Agility Boot Icon -->
  <path d="M42 48 C32 40, 22 42, 18 50 C26 50, 34 54, 40 60 Z" fill="#FFFFFF" opacity="0.9" />
  <path d="M78 48 C88 40, 98 42, 102 50 C94 50, 86 54, 80 60 Z" fill="#FFFFFF" opacity="0.9" />
  
  <polygon points="60,34 74,54 60,78 46,54" fill="url(#msCyan)" stroke="#FFFFFF" stroke-width="1.5" />
  <circle cx="60" cy="46" r="2.5" fill="#FFFFFF" />
</svg>
`;

// 16. Resume Thread Emblem - Chrono Sapphire Timekeeper Winged Crest
const resumeThreadEmblemSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="rtGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#FEF08A" />
      <stop offset="70%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="rtSapphire" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="35%" stop-color="#38BDF8" />
      <stop offset="75%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <filter id="rtGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="48" fill="#38BDF8" opacity="0.18" filter="url(#rtGlow)" />

  <!-- Silver Wings Left -->
  <path d="M42 48 C24 34, 10 40, 6 52 C18 52, 28 56, 38 66 C20 66, 12 74, 16 84 C28 80, 36 78, 44 80 Z" fill="#F0F9FF" stroke="#38BDF8" stroke-width="1.2" />
  <!-- Silver Wings Right -->
  <path d="M78 48 C96 34, 110 40, 114 52 C102 52, 92 56, 82 66 C100 66, 108 74, 104 84 C92 80, 84 78, 76 80 Z" fill="#F0F9FF" stroke="#38BDF8" stroke-width="1.2" />

  <!-- Main Shield -->
  <path d="M60 18 L86 34 L80 82 L60 104 L40 82 L34 34 Z" fill="#09090B" stroke="url(#rtGold)" stroke-width="3" />

  <!-- Chrono Gem -->
  <polygon points="60,34 74,56 60,78 46,56" fill="url(#rtSapphire)" stroke="#FFFFFF" stroke-width="1.8" filter="url(#rtGlow)" />

  <!-- Rewind Arrow -->
  <path d="M52 56 L64 48 L64 64 Z" fill="#FFFFFF" />
  <circle cx="60" cy="22" r="2.5" fill="#38BDF8" />
</svg>
`;

// 17. Today Progress Emblem - Victorious Dual Laurels & Golden Star Crest
const todayProgressEmblemSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="tpGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#FEF08A" />
      <stop offset="70%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#713F12" />
    </linearGradient>
    <filter id="tpGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="48" fill="#EAB308" opacity="0.18" filter="url(#tpGlow)" />

  <!-- Laurels Left -->
  <path d="M42 32 C26 30, 16 42, 18 56 C22 56, 28 50, 34 48 C20 60, 22 76, 36 80 C32 72, 36 64, 42 62 Z" fill="url(#tpGold)" />
  <!-- Laurels Right -->
  <path d="M78 32 C94 30, 104 42, 102 56 C98 56, 92 50, 86 48 C100 60, 98 76, 84 80 C88 72, 84 64, 78 62 Z" fill="url(#tpGold)" />

  <!-- Center Grand Star Shield -->
  <circle cx="60" cy="60" r="28" fill="#18181B" stroke="url(#tpGold)" stroke-width="3" />
  <polygon points="60,40 64,50 75,50 67,58 70,68 60,62 50,68 53,58 45,50 56,50" fill="url(#tpGold)" stroke="#FFFFFF" stroke-width="1" filter="url(#tpGlow)" />
  <circle cx="60" cy="54" r="2.5" fill="#FFFFFF" />
</svg>
`;

// 18. Focus Sprints Flame Crest
const focusSprintsFlameSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="fsFlame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="35%" stop-color="#F97316" />
      <stop offset="70%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#7F1D1D" />
    </linearGradient>
    <filter id="fsGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <circle cx="60" cy="60" r="44" fill="#F97316" opacity="0.2" filter="url(#fsGlow)" />
  <circle cx="60" cy="60" r="34" fill="#1C1917" stroke="#F97316" stroke-width="2.5" />
  <path d="M60 26 C68 38, 76 46, 72 64 C68 76, 60 82, 60 82 C60 82, 52 76, 48 64 C44 46, 52 38, 60 26 Z" fill="url(#fsFlame)" stroke="#FEF08A" stroke-width="1.5" filter="url(#fsGlow)" />
  <circle cx="60" cy="56" r="3" fill="#FFFFFF" />
</svg>
`;

/**
 * Map of achievement IDs / keys to high-fidelity badge artworks
 */
export const achievementImages = {
  // Achievements
  backFromTheVoid: createSvgDataUrl(sapphireShieldCrestSvg),
  notTodaySideQuest: createSvgDataUrl(rubyCrownCrestSvg),
  touchGrass: createSvgDataUrl(emeraldLaurelCrestSvg),
  shipIt: createSvgDataUrl(celestialGrandCrestSvg),
  rankNovice: createSvgDataUrl(rankNoviceCrestSvg),
  milestonesHeader: createSvgDataUrl(milestoneTrophyBadgeSvg),
  xpReward: createSvgDataUrl(xpCrystalSvg),

  // Home Page / Dashboard Card Emblems
  mainQuestEmblem: createSvgDataUrl(mainQuestEmblemSvg),
  nextActionEmblem: createSvgDataUrl(nextActionEmblemSvg),
  parkingLotEmblem: createSvgDataUrl(parkingLotEmblemSvg),
  playerStateEmblem: createSvgDataUrl(playerStateEmblemSvg),
  focusEnergyOrb: createSvgDataUrl(focusEnergyOrbSvg),
  recoveryHeartBadge: createSvgDataUrl(recoveryHeartBadgeSvg),
  momentumFireBadge: createSvgDataUrl(momentumFireBadgeSvg),
  movementSwiftnessBadge: createSvgDataUrl(movementSwiftnessBadgeSvg),
  resumeThreadEmblem: createSvgDataUrl(resumeThreadEmblemSvg),
  todayProgressEmblem: createSvgDataUrl(todayProgressEmblemSvg),
  focusSprintsFlame: createSvgDataUrl(focusSprintsFlameSvg),
} as const;

/**
 * Resolves badge image asset by achievement ID or category fallback
 */
export function getAchievementBadge(id: string, category?: string): string {
  switch (id) {
    case "back-from-void":
    case "backFromTheVoid":
      return achievementImages.backFromTheVoid;
    case "not-today-side-quest":
    case "notTodaySideQuest":
      return achievementImages.notTodaySideQuest;
    case "touch-grass":
    case "touchGrass":
      return achievementImages.touchGrass;
    case "ship-it":
    case "shipIt":
      return achievementImages.shipIt;
    default:
      if (category === "discipline") return achievementImages.backFromTheVoid;
      if (category === "focus") return achievementImages.notTodaySideQuest;
      if (category === "recovery") return achievementImages.touchGrass;
      if (category === "completion") return achievementImages.shipIt;
      return achievementImages.backFromTheVoid;
  }
}
