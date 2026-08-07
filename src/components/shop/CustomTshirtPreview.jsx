import React from 'react';

function TshirtFront({ color }) {
  const isLight = color === '#FFFFFF' || color === '#F5F5F5' || color === '#D7C5A0' || color === '#87CEEB';
  const shadow = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.25)';
  const highlight = isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)';
  const midShadow = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.20)';

  return (
    <svg viewBox="0 0 400 440" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bodyGrad_f_preview_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="12%"  stopColor={midShadow} />
          <stop offset="40%"  stopColor="transparent" />
          <stop offset="60%"  stopColor={highlight} />
          <stop offset="80%"  stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <linearGradient id={`sleeveL_f_preview_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="50%"  stopColor="transparent" />
          <stop offset="100%" stopColor={midShadow} />
        </linearGradient>
        <linearGradient id={`sleeveR_f_preview_${color.replace('#','')}`} x1="100%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="50%"  stopColor="transparent" />
          <stop offset="100%" stopColor={midShadow} />
        </linearGradient>
        <filter id="tshirtShadowPreview" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>
        <radialGradient id="collarInnerPreview" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </radialGradient>
      </defs>

      <g filter="url(#tshirtShadowPreview)">
        {/* Left Sleeve */}
        <path
          d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1"
        />
        <path d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={`url(#sleeveL_f_preview_${color.replace('#','')})`} />
        <path d="M10,110 L28,145 L44,152 L52,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* Right Sleeve */}
        <path
          d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1"
        />
        <path d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={`url(#sleeveR_f_preview_${color.replace('#','')})`} />
        <path d="M390,110 L372,145 L356,152 L348,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* Main Body */}
        <path
          d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,74 200,74 Q105,74 78,58 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1"
        />
        <path
          d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,74 200,74 Q105,74 78,58 Z"
          fill={`url(#bodyGrad_f_preview_${color.replace('#','')})`}
        />

        {/* Neck / Collar */}
        <ellipse cx="200" cy="70" rx="58" ry="22" fill={color} stroke={isLight ? '#bbb' : '#444'} strokeWidth="2" />
        <ellipse cx="200" cy="68" rx="52" ry="18" fill="url(#collarInnerPreview)" />
        <ellipse cx="200" cy="70" rx="58" ry="22" fill="none" stroke={isLight ? '#c8c8c8' : '#333'} strokeWidth="1.2" />

        {/* Shoulder seams */}
        <path d="M88,78 Q120,82 142,78" fill="none" stroke={isLight ? '#c8c8c8' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M312,78 Q280,82 258,78" fill="none" stroke={isLight ? '#c8c8c8' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function TshirtBack({ color }) {
  const isLight = color === '#FFFFFF' || color === '#F5F5F5' || color === '#D7C5A0' || color === '#87CEEB';
  const shadow = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.22)';
  const highlight = isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)';
  const midShadow = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.18)';

  return (
    <svg viewBox="0 0 400 440" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bodyGrad_b_preview_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="15%"  stopColor={midShadow} />
          <stop offset="45%"  stopColor="transparent" />
          <stop offset="65%"  stopColor={highlight} />
          <stop offset="85%"  stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <linearGradient id={`sleeveLB_preview_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={shadow} />
          <stop offset="60%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id={`sleeveRB_preview_${color.replace('#','')}`} x1="100%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor={shadow} />
          <stop offset="60%" stopColor="transparent" />
        </linearGradient>
        <filter id="tshirtShadowBPreview">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#tshirtShadowBPreview)">
        {/* Left Sleeve */}
        <path d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1" />
        <path d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={`url(#sleeveLB_preview_${color.replace('#','')})`} />
        <path d="M10,110 L28,145 L44,152 L52,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* Right Sleeve */}
        <path d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1" />
        <path d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={`url(#sleeveRB_preview_${color.replace('#','')})`} />
        <path d="M390,110 L372,145 L356,152 L348,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* Main Body */}
        <path d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,50 200,50 Q105,50 78,58 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1" />
        <path d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,50 200,50 Q105,50 78,58 Z"
          fill={`url(#bodyGrad_b_preview_${color.replace('#','')})`} />

        {/* Back neck collar */}
        <path d="M145,55 Q200,42 255,55" fill={color} stroke={isLight ? '#ccc' : '#555'} strokeWidth="1.5" strokeLinecap="round"/>

        {/* Shoulder seams */}
        <path d="M88,78 Q120,76 142,74" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M312,78 Q280,76 258,74" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

export function CustomTshirtPreview({ customization, className = "w-full h-full", forceSide }) {
  if (!customization) return null;
  const { frontLayers = [], backLayers = [], garmentColor = '#FFFFFF' } = customization;

  const hasFront = frontLayers.length > 0;
  const hasBack = backLayers.length > 0;
  const side = forceSide || (hasFront ? 'front' : (hasBack ? 'back' : 'front'));
  const items = side === 'front' ? frontLayers : backLayers;

  return (
    <div className={`relative aspect-[400/440] ${className}`}>
      {side === 'front' ? (
        <TshirtFront color={garmentColor} />
      ) : (
        <TshirtBack color={garmentColor} />
      )}
      <svg
        viewBox="0 0 400 440"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {items.map(item => (
          <g
            key={item.id}
            transform={`translate(${item.x},${item.y}) rotate(${item.rotation || 0})`}
          >
            {item.type === 'text' && (
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={item.fontSize || 20}
                fontFamily={item.fontFamily || 'Arial'}
                fill={item.color || '#000'}
                fontWeight={item.bold ? 'bold' : 'normal'}
              >
                {item.text}
              </text>
            )}
            {item.type === 'image' && (() => {
              const size = item.size || 70;
              const aspect = item.aspectRatio || 1;
              const w = aspect > 1 ? size : size * aspect;
              const h = aspect > 1 ? size / aspect : size;
              return (
                <image
                  href={item.src}
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                />
              );
            })()}
          </g>
        ))}
      </svg>
    </div>
  );
}

export default CustomTshirtPreview;
