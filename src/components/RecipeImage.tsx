import { useState } from 'react';
import type { Art } from '../types';

/** رسوم بديلة تظهر حتى تضع صورة حقيقية للوصفة في public/images/recipes */
function ArtSvg({ art, size }: { art: Art; size: number }) {
  const common = { width: size, height: size, viewBox: '0 0 200 200', 'aria-hidden': true } as const;
  switch (art) {
    case 'shakshuka':
      return (
        <svg {...common}>
          <circle cx="100" cy="100" r="94" fill="#3A2A22" />
          <circle cx="100" cy="100" r="82" fill="#EE5A3C" />
          <ellipse cx="76" cy="84" rx="24" ry="21" fill="#fff" />
          <circle cx="76" cy="84" r="10" fill="#F5B63E" />
          <ellipse cx="126" cy="92" rx="24" ry="21" fill="#fff" />
          <circle cx="126" cy="92" r="10" fill="#F5B63E" />
          <ellipse cx="100" cy="128" rx="24" ry="21" fill="#fff" />
          <circle cx="100" cy="128" r="10" fill="#F5B63E" />
        </svg>
      );
    case 'harira':
      return (
        <svg {...common}>
          <circle cx="100" cy="100" r="94" fill="#fff" />
          <circle cx="100" cy="100" r="80" fill="#8A4A2B" />
          <circle cx="100" cy="100" r="68" fill="#DE7A3C" />
          <circle cx="70" cy="86" r="6" fill="#B5562A" />
          <circle cx="118" cy="76" r="6" fill="#B5562A" />
          <circle cx="92" cy="118" r="6" fill="#B5562A" />
          <circle cx="130" cy="110" r="6" fill="#B5562A" />
          <circle cx="84" cy="64" r="6" fill="#F0CE86" />
          <circle cx="108" cy="100" r="6" fill="#F0CE86" />
          <circle cx="96" cy="86" r="3" fill="#4F8F4A" />
        </svg>
      );
    case 'makroud':
      return (
        <svg {...common}>
          <circle cx="100" cy="100" r="94" fill="#fff" />
          <circle cx="100" cy="100" r="80" fill="#F3E3CF" />
          {[[100, 100], [60, 68], [140, 68], [60, 134], [140, 134]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <polygon points="0,-26 21,0 0,26 -21,0" fill="#D99A3A" />
              <polygon points="0,-15 12,0 0,15 -12,0" fill="#F0BE5E" />
            </g>
          ))}
        </svg>
      );
    case 'bourek':
      return (
        <svg {...common}>
          <circle cx="100" cy="100" r="94" fill="#fff" />
          <circle cx="100" cy="100" r="80" fill="#F3E3CF" />
          <g transform="translate(66,92) rotate(-12)">
            <polygon points="0,-30 30,24 -30,24" fill="#D99A3A" />
            <polygon points="0,-18 18,14 -18,14" fill="#F0BE5E" />
          </g>
          <g transform="translate(136,84) rotate(14)">
            <polygon points="0,-30 30,24 -30,24" fill="#D99A3A" />
            <polygon points="0,-18 18,14 -18,14" fill="#F0BE5E" />
          </g>
          <g transform="translate(102,142)">
            <polygon points="0,-30 30,24 -30,24" fill="#C98A2E" />
            <polygon points="0,-18 18,14 -18,14" fill="#E8B04F" />
          </g>
        </svg>
      );
    case 'chicken':
      return (
        <svg {...common}>
          <circle cx="100" cy="100" r="94" fill="#fff" />
          <circle cx="100" cy="100" r="80" fill="#F3E3CF" />
          <rect x="48" y="86" width="40" height="18" rx="9" fill="#EBC574" transform="rotate(-25 68 95)" />
          <rect x="112" y="110" width="40" height="18" rx="9" fill="#EBC574" transform="rotate(20 132 119)" />
          <rect x="62" y="118" width="40" height="18" rx="9" fill="#EBC574" transform="rotate(10 82 127)" />
          <ellipse cx="100" cy="82" rx="34" ry="24" fill="#B56A33" />
          <ellipse cx="96" cy="76" rx="20" ry="12" fill="#CF8444" />
          <ellipse cx="126" cy="112" rx="26" ry="18" fill="#B56A33" />
          <circle cx="70" cy="70" r="4" fill="#4F8F4A" />
          <circle cx="140" cy="76" r="4" fill="#4F8F4A" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="100" cy="100" r="94" fill="#fff" />
          <circle cx="100" cy="100" r="82" fill="#F3E3CF" />
          <circle cx="100" cy="104" r="58" fill="#F2C35B" />
          <circle cx="84" cy="88" r="9" fill="#E8772E" />
          <circle cx="116" cy="84" r="9" fill="#E8772E" />
          <circle cx="102" cy="118" r="9" fill="#E8772E" />
          <circle cx="100" cy="72" r="10" fill="#B8452E" />
          <circle cx="70" cy="96" r="10" fill="#B8452E" />
          <circle cx="136" cy="122" r="10" fill="#B8452E" />
        </svg>
      );
  }
}

const EXTS = ['webp', 'jpg', 'jpeg', 'png'];

interface Props {
  id: string;
  title: string;
  art: Art;
  className?: string;
  artSize?: number;
  eager?: boolean;
}

/** يجرّب صورة حقيقية باسم معرّف الوصفة، وإن لم توجد يعرض الرسم البديل */
export function RecipeImage({ id, title, art, className = '', artSize = 100, eager }: Props) {
  const [idx, setIdx] = useState(0);
  const failed = idx >= EXTS.length;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-peach ${className}`}>
      {failed ? (
        <ArtSvg art={art} size={artSize} />
      ) : (
        <img
          key={idx}
          src={`/images/recipes/${id}.${EXTS[idx]}`}
          alt={title}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setIdx((i) => i + 1)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
