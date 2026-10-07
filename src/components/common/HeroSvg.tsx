import React from 'react';

interface HeroSvgProps {
  heroKey: string;
  color?: string;
  className?: string;
}

export default function HeroSvg({ heroKey, color = '#B8F23C', className = 'hero-svg' }: HeroSvgProps) {
  switch (heroKey) {
    case 'captain-bolt':
      return (
        <svg viewBox="0 0 160 160" className={`${className} bolt-anim`}>
          {/* Cape */}
          <path d="M40 70 Q20 120 28 148 Q80 135 120 148 Q140 120 120 70 Z" fill={color} opacity="0.85" className="cape-wave" />
          {/* Body */}
          <rect x="52" y="65" width="56" height="60" rx="16" fill="#2A1450" />
          <path d="M72 80 L88 80 L76 98 L88 98 L68 116 L76 102 L66 102 Z" fill={color} />
          {/* Head & Mask */}
          <circle cx="80" cy="46" r="32" fill="#FFE0B2" />
          <path d="M52 38 Q80 20 108 38 L104 54 Q80 44 56 54 Z" fill="#2A1450" />
          {/* Eyes */}
          <circle cx="68" cy="46" r="5" fill={color} className="hero-eye" />
          <circle cx="92" cy="46" r="5" fill={color} className="hero-eye" />
          {/* Lightning Antenna */}
          <path d="M80 18 L86 6 L78 6 L84 -2" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'pixel-pup':
      return (
        <svg viewBox="0 0 160 160" className={`${className} pup-anim`}>
          {/* Body */}
          <rect x="46" y="70" width="68" height="54" rx="20" fill="#2A1450" />
          <circle cx="80" cy="98" r="14" fill={color} opacity="0.3" />
          {/* Head */}
          <rect x="44" y="28" width="72" height="60" rx="24" fill="#3B1F6D" />
          {/* Floppy Ears */}
          <rect x="26" y="32" width="22" height="42" rx="11" fill={color} className="ear-left" />
          <rect x="112" y="32" width="22" height="42" rx="11" fill={color} className="ear-right" />
          {/* Snout & Eyes */}
          <ellipse cx="80" cy="65" rx="18" ry="14" fill="#FFF8E7" />
          <ellipse cx="80" cy="58" rx="7" ry="5" fill="#2A1450" />
          <circle cx="62" cy="46" r="6" fill={color} className="hero-eye" />
          <circle cx="98" cy="46" r="6" fill={color} className="hero-eye" />
          {/* Collar */}
          <rect x="52" y="78" width="56" height="8" rx="4" fill={color} />
        </svg>
      );
    case 'nova-fox':
      return (
        <svg viewBox="0 0 160 160" className={`${className} fox-anim`}>
          {/* Big Fluffy Tail */}
          <path d="M104 100 Q146 110 148 70 Q140 40 115 54 Q108 80 104 100 Z" fill={color} className="tail-wag" />
          {/* Suit */}
          <rect x="50" y="72" width="60" height="56" rx="18" fill="#180A31" />
          <circle cx="80" cy="100" r="12" fill={color} />
          {/* Head */}
          <polygon points="40,24 60,60 30,55" fill={color} />
          <polygon points="120,24 100,60 130,55" fill={color} />
          <ellipse cx="80" cy="52" rx="36" ry="28" fill="#FF8A65" />
          <polygon points="80,72 68,54 92,54" fill="#2A1450" />
          {/* Space Visor */}
          <path d="M52 46 Q80 34 108 46 Q80 62 52 46 Z" fill={color} opacity="0.85" />
        </svg>
      );
    case 'robo-sprout':
      return (
        <svg viewBox="0 0 160 160" className={`${className} sprout-anim`}>
          {/* Pot/Body */}
          <rect x="52" y="74" width="56" height="52" rx="14" fill="#2A1450" />
          <rect x="46" y="68" width="68" height="12" rx="6" fill={color} />
          {/* Robot Head */}
          <rect x="54" y="28" width="52" height="42" rx="14" fill="#3B1F6D" />
          {/* Glowing Pill Visor */}
          <rect x="62" y="40" width="36" height="18" rx="9" fill={color} className="hero-glow" />
          {/* Sprout Leaf Antenna */}
          <path d="M80 28 L80 12 Q80 2 96 2 Q96 14 80 14 Z" fill={color} className="leaf-sway" />
          <path d="M80 16 Q80 6 64 6 Q64 18 80 18 Z" fill="#FFF8E7" opacity="0.8" className="leaf-sway" />
        </svg>
      );
    case 'luna-owl':
      return (
        <svg viewBox="0 0 160 160" className={`${className} owl-anim`}>
          {/* Wings */}
          <ellipse cx="44" cy="85" rx="14" ry="32" fill={color} opacity="0.75" />
          <ellipse cx="116" cy="85" rx="14" ry="32" fill={color} opacity="0.75" />
          {/* Body */}
          <ellipse cx="80" cy="80" rx="38" ry="46" fill="#2A1450" />
          {/* Feather tummy */}
          <path d="M72 84 Q80 90 88 84 Q80 96 72 84 Z" fill={color} />
          <path d="M72 96 Q80 102 88 96 Q80 108 72 96 Z" fill={color} />
          {/* Big Goggle Eyes */}
          <circle cx="64" cy="52" r="18" fill="#FFF8E7" stroke={color} strokeWidth="4" />
          <circle cx="96" cy="52" r="18" fill="#FFF8E7" stroke={color} strokeWidth="4" />
          <circle cx="64" cy="52" r="7" fill="#2A1450" className="hero-eye" />
          <circle cx="96" cy="52" r="7" fill="#2A1450" className="hero-eye" />
          {/* Beak & Ear Feathers */}
          <polygon points="76,64 84,64 80,74" fill="#FFB74D" />
          <polygon points="50,22 58,40 44,38" fill={color} />
          <polygon points="110,22 102,40 116,38" fill={color} />
        </svg>
      );
    case 'turbo-turtle':
      return (
        <svg viewBox="0 0 160 160" className={`${className} turtle-anim`}>
          {/* Rocket Thrusters */}
          <rect x="34" y="92" width="16" height="30" rx="6" fill="#3B1F6D" />
          <polygon points="34,122 50,122 42,142" fill="#FF7043" className="rocket-flame" />
          <rect x="110" y="92" width="16" height="30" rx="6" fill="#3B1F6D" />
          <polygon points="110,122 126,122 118,142" fill="#FF7043" className="rocket-flame" />
          {/* Shell */}
          <ellipse cx="80" cy="78" rx="42" ry="38" fill="#2A1450" />
          <ellipse cx="80" cy="78" rx="34" ry="30" fill={color} opacity="0.3" />
          <circle cx="80" cy="78" r="12" fill={color} />
          {/* Head & Goggles */}
          <circle cx="80" cy="38" r="20" fill="#81C784" />
          <rect x="66" y="32" width="28" height="14" rx="7" fill={color} />
          <circle cx="73" cy="39" r="4" fill="#2A1450" />
          <circle cx="87" cy="39" r="4" fill="#2A1450" />
        </svg>
      );
    case 'glitch-cat':
      return (
        <svg viewBox="0 0 160 160" className={`${className} cat-anim`}>
          {/* Cyber Tail */}
          <path d="M106 100 Q138 90 134 58" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" className="tail-wag" />
          {/* Body */}
          <rect x="52" y="70" width="56" height="54" rx="16" fill="#180A31" />
          <path d="M66 84 L94 84 M70 94 L90 94 M74 104 L86 104" stroke={color} strokeWidth="3" opacity="0.6" />
          {/* Cat Head */}
          <polygon points="46,26 62,54 42,50" fill={color} />
          <polygon points="114,26 98,54 118,50" fill={color} />
          <rect x="48" y="36" width="64" height="46" rx="20" fill="#2A1450" />
          {/* Visor / Neon Eyes */}
          <polygon points="62,54 72,46 72,62" fill={color} className="hero-eye" />
          <polygon points="98,54 88,46 88,62" fill={color} className="hero-eye" />
          <circle cx="80" cy="64" r="3" fill="#FFF8E7" />
        </svg>
      );
    case 'pip-dragon':
      return (
        <svg viewBox="0 0 160 160" className={`${className} dragon-anim`}>
          {/* Dragon Wings */}
          <path d="M42 60 Q10 40 22 84 Q34 76 46 74 Z" fill={color} className="wing-flap" />
          <path d="M118 60 Q150 40 138 84 Q126 76 114 74 Z" fill={color} className="wing-flap" />
          {/* Body */}
          <ellipse cx="80" cy="88" rx="34" ry="38" fill="#2A1450" />
          <ellipse cx="80" cy="94" rx="18" ry="22" fill={color} opacity="0.35" />
          {/* Head & Horns */}
          <polygon points="56,36 64,16 70,36" fill="#FFB74D" />
          <polygon points="104,36 96,16 90,36" fill="#FFB74D" />
          <circle cx="80" cy="48" r="28" fill="#4DB6AC" />
          {/* Snout & Eyes */}
          <circle cx="70" cy="46" r="5" fill="#2A1450" />
          <circle cx="90" cy="46" r="5" fill="#2A1450" />
          <ellipse cx="80" cy="58" rx="14" ry="8" fill="#80CBC4" />
          <circle cx="76" cy="56" r="2" fill="#2A1450" />
          <circle cx="84" cy="56" r="2" fill="#2A1450" />
          {/* Tiny Fire Spark */}
          <circle cx="80" cy="70" r="4" fill={color} className="fire-spark" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 160 160" className={className}>
          <rect x="40" y="40" width="80" height="80" rx="20" fill="#2A1450" stroke={color} strokeWidth="4" />
          <circle cx="80" cy="80" r="16" fill={color} />
        </svg>
      );
  }
}
