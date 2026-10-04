import React from 'react';

export default function SvgSprite() {
  return (
    <svg className="sprite" width="0" height="0" aria-hidden="true" focusable="false">
      <symbol id="seedai-mark" viewBox="0 0 200 200">
        <rect x="0" y="0" width="200" height="200" rx="44" fill="#2A1450" />
        <rect x="52" y="70" width="96" height="84" rx="28" fill="#B8F23C" />
        <rect x="38" y="104" width="20" height="36" rx="8" fill="#B8F23C" />
        <rect x="142" y="104" width="20" height="36" rx="8" fill="#B8F23C" />
        <rect x="88" y="150" width="24" height="12" rx="4" fill="#B8F23C" />
        <rect x="66" y="92" width="68" height="40" rx="18" fill="#2A1450" />
        <rect x="81" y="103" width="11" height="18" rx="5.5" fill="#B8F23C" />
        <rect x="108" y="103" width="11" height="18" rx="5.5" fill="#B8F23C" />
        <line x1="100" y1="70" x2="100" y2="52" stroke="#B8F23C" strokeWidth="5" strokeLinecap="round" />
        <path d="M100 54 C100 40 112 32 128 30 C128 44 116 54 100 54Z" fill="#B8F23C" />
      </symbol>
    </svg>
  );
}
