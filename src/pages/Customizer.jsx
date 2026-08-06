import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, Type, Upload, ShoppingCart, Smile } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { useCart } from '../context/CartContext';

/* ═══════════════════════════════════════════════════════════════
   3D Realistic T-Shirt SVG — Front
   Matches reference image with proper shading, collar, sleeves
═══════════════════════════════════════════════════════════════ */
function TshirtFront({ color, showZone }) {
  const isLight = color === '#FFFFFF' || color === '#F5F5F5' || color === '#D7C5A0' || color === '#87CEEB';
  const shadow = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.25)';
  const highlight = isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)';
  const midShadow = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.20)';

  return (
    <svg viewBox="0 0 400 440" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Main body gradient - 3D shading */}
        <linearGradient id={`bodyGrad_f_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="12%"  stopColor={midShadow} />
          <stop offset="40%"  stopColor="transparent" />
          <stop offset="60%"  stopColor={highlight} />
          <stop offset="80%"  stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        {/* Sleeve gradient */}
        <linearGradient id={`sleeveL_f_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="50%"  stopColor="transparent" />
          <stop offset="100%" stopColor={midShadow} />
        </linearGradient>
        <linearGradient id={`sleeveR_f_${color.replace('#','')}`} x1="100%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="50%"  stopColor="transparent" />
          <stop offset="100%" stopColor={midShadow} />
        </linearGradient>
        {/* Drop shadow */}
        <filter id="tshirtShadow" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.18" />
        </filter>
        {/* Collar inner shadow */}
        <radialGradient id="collarInner" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </radialGradient>
      </defs>

      <g filter="url(#tshirtShadow)">
        {/* ── Left Sleeve ── */}
        <path
          d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1"
        />
        <path d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={`url(#sleeveL_f_${color.replace('#','')})`} />
        {/* Left sleeve cuff */}
        <path d="M10,110 L28,145 L44,152 L52,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* ── Right Sleeve ── */}
        <path
          d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1"
        />
        <path d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={`url(#sleeveR_f_${color.replace('#','')})`} />
        {/* Right sleeve cuff */}
        <path d="M390,110 L372,145 L356,152 L348,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* ── Main Body ── */}
        <path
          d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,74 200,74 Q105,74 78,58 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1"
        />
        {/* Body shading overlay */}
        <path
          d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,74 200,74 Q105,74 78,58 Z"
          fill={`url(#bodyGrad_f_${color.replace('#','')})`}
        />
        {/* Subtle bottom fade */}
        <linearGradient id="bottomFade" x1="0%" y1="80%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <path d="M65,410 L335,410 L332,360 L68,360 Z" fill="url(#bottomFade)" />

        {/* ── Neck / Collar ── */}
        <ellipse cx="200" cy="70" rx="58" ry="22" fill={color} stroke={isLight ? '#bbb' : '#444'} strokeWidth="2" />
        {/* Collar inner shadow for depth */}
        <ellipse cx="200" cy="68" rx="52" ry="18" fill="url(#collarInner)" />
        {/* Collar rib texture lines */}
        <ellipse cx="200" cy="70" rx="58" ry="22" fill="none" stroke={isLight ? '#c8c8c8' : '#333'} strokeWidth="1.2" />
        <ellipse cx="200" cy="70" rx="54" ry="19" fill="none" stroke={isLight ? '#d5d5d5' : '#3a3a3a'} strokeWidth="0.6" />

        {/* ── Shoulder seams ── */}
        <path d="M88,78 Q120,82 142,78" fill="none" stroke={isLight ? '#c8c8c8' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M312,78 Q280,82 258,78" fill="none" stroke={isLight ? '#c8c8c8' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
        {/* Side seams */}
        <path d="M68,160 L65,410" fill="none" stroke={isLight ? '#d0d0d0' : '#444'} strokeWidth="1" strokeDasharray="4,3"/>
        <path d="M332,160 L335,410" fill="none" stroke={isLight ? '#d0d0d0' : '#444'} strokeWidth="1" strokeDasharray="4,3"/>

        {/* Sleeve-body join seams */}
        <path d="M78,58 L70,135" fill="none" stroke={isLight ? '#ccc' : '#555'} strokeWidth="1.5" />
        <path d="M322,58 L330,135" fill="none" stroke={isLight ? '#ccc' : '#555'} strokeWidth="1.5" />
        {/* Under-sleeve seam */}
        <path d="M70,135 L68,160" fill="none" stroke={isLight ? '#d0d0d0' : '#555'} strokeWidth="1.5" />
        <path d="M330,135 L332,160" fill="none" stroke={isLight ? '#d0d0d0' : '#555'} strokeWidth="1.5" />
      </g>

      {/* ── Chest Print Zone Indicator ── */}
      {showZone && (
        <rect x="140" y="130" width="120" height="110" fill="rgba(99,102,241,0.08)"
          stroke="#6366f1" strokeWidth="1.8" strokeDasharray="6,4" rx="6"/>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D Realistic T-Shirt SVG — Back
═══════════════════════════════════════════════════════════════ */
function TshirtBack({ color, showZone }) {
  const isLight = color === '#FFFFFF' || color === '#F5F5F5' || color === '#D7C5A0' || color === '#87CEEB';
  const shadow = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.22)';
  const highlight = isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)';
  const midShadow = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.18)';

  return (
    <svg viewBox="0 0 400 440" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bodyGrad_b_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={shadow} />
          <stop offset="15%"  stopColor={midShadow} />
          <stop offset="45%"  stopColor="transparent" />
          <stop offset="65%"  stopColor={highlight} />
          <stop offset="85%"  stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <linearGradient id={`sleeveLB_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={shadow} />
          <stop offset="60%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id={`sleeveRB_${color.replace('#','')}`} x1="100%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor={shadow} />
          <stop offset="60%" stopColor="transparent" />
        </linearGradient>
        <filter id="tshirtShadowB">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter="url(#tshirtShadowB)">
        {/* ── Left Sleeve (back) ── */}
        <path d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1" />
        <path d="M78,58 L18,82 L12,88 L10,110 L28,145 L44,152 L52,148 L70,135 L80,115 L88,100 L92,82 Z"
          fill={`url(#sleeveLB_${color.replace('#','')})`} />
        <path d="M10,110 L28,145 L44,152 L52,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* ── Right Sleeve (back) ── */}
        <path d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1" />
        <path d="M322,58 L382,82 L388,88 L390,110 L372,145 L356,152 L348,148 L330,135 L320,115 L312,100 L308,82 Z"
          fill={`url(#sleeveRB_${color.replace('#','')})`} />
        <path d="M390,110 L372,145 L356,152 L348,148" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="2.5" strokeLinecap="round"/>

        {/* ── Main Body (back) ── */}
        <path d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,50 200,50 Q105,50 78,58 Z"
          fill={color} stroke={isLight ? '#ddd' : '#555'} strokeWidth="1" />
        <path d="M78,58 L70,135 L68,160 L65,410 L335,410 L332,160 L330,135 L322,58 Q295,50 200,50 Q105,50 78,58 Z"
          fill={`url(#bodyGrad_b_${color.replace('#','')})`} />
        <linearGradient id="bottomFadeB" x1="0%" y1="80%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <path d="M65,410 L335,410 L332,360 L68,360 Z" fill="url(#bottomFadeB)" />

        {/* ── Back neck collar ── */}
        <path d="M145,55 Q200,42 255,55" fill={color} stroke={isLight ? '#ccc' : '#555'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M145,55 Q200,48 255,55" fill="none" stroke={isLight ? '#d5d5d5' : '#444'} strokeWidth="1" strokeLinecap="round"/>

        {/* ── Shoulder seams ── */}
        <path d="M88,78 Q120,76 142,74" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M312,78 Q280,76 258,74" fill="none" stroke={isLight ? '#ccc' : '#444'} strokeWidth="1.5" strokeLinecap="round"/>
        {/* Center seam back */}
        <path d="M200,52 L200,410" fill="none" stroke={isLight ? '#e0e0e0' : '#3a3a3a'} strokeWidth="0.8" strokeDasharray="5,4"/>
        {/* Side seams */}
        <path d="M68,160 L65,410" fill="none" stroke={isLight ? '#d0d0d0' : '#444'} strokeWidth="1" strokeDasharray="4,3"/>
        <path d="M332,160 L335,410" fill="none" stroke={isLight ? '#d0d0d0' : '#444'} strokeWidth="1" strokeDasharray="4,3"/>

        {/* Sleeve-body seams */}
        <path d="M78,58 L70,135" fill="none" stroke={isLight ? '#ccc' : '#555'} strokeWidth="1.5" />
        <path d="M322,58 L330,135" fill="none" stroke={isLight ? '#ccc' : '#555'} strokeWidth="1.5" />
      </g>

      {/* ── Back Print Zone Indicator ── */}
      {showZone && (
        <rect x="110" y="100" width="180" height="230" fill="rgba(99,102,241,0.08)"
          stroke="#6366f1" strokeWidth="1.8" strokeDasharray="6,4" rx="6"/>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Draggable Print / Sticker Layer
═══════════════════════════════════════════════════════════════ */
function PrintLayer({ items, activeId, setActiveId, printZone, onMove, onScale }) {
  const svgRef = useRef(null);
  const dragging = useRef(null);

  const getSVGPos = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }, []);

  const handlePointerDown = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveId(id);
    const cx = e.clientX ?? e.touches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY;
    const startPos = getSVGPos(cx, cy);
    const item = items.find(i => i.id === id);
    dragging.current = { id, startPos, startX: item.x, startY: item.y };
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      if (cx == null) return;
      const pos = getSVGPos(cx, cy);
      const dx = pos.x - dragging.current.startPos.x;
      const dy = pos.y - dragging.current.startPos.y;
      const z = printZone;
      const nx = Math.max(z.x + 10, Math.min(z.x + z.w - 10, dragging.current.startX + dx));
      const ny = Math.max(z.y + 10, Math.min(z.y + z.h - 10, dragging.current.startY + dy));
      onMove(dragging.current.id, nx, ny);
    };
    const up = () => { dragging.current = null; };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [printZone, onMove, getSVGPos]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 440"
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
      onClick={() => setActiveId(null)}
    >
      {items.map(item => (
        <g
          key={item.id}
          transform={`translate(${item.x},${item.y})`}
          onMouseDown={e => handlePointerDown(e, item.id)}
          onTouchStart={e => handlePointerDown(e, item.id)}
          style={{ cursor: 'move', userSelect: 'none' }}
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
          {item.type === 'image' && (
            <image
              href={item.src}
              x={-(item.size || 70) / 2}
              y={-(item.size || 70) / 2}
              width={item.size || 70}
              height={item.size || 70}
            />
          )}
          {item.type === 'sticker' && (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={item.size || 36}
            >
              {item.emoji}
            </text>
          )}
          {/* Selection box */}
          {activeId === item.id && (() => {
            const hw = item.type === 'text' ? 55 : (item.size || 70) / 2 + 6;
            const hh = item.type === 'text' ? (item.fontSize || 20) / 2 + 6 : (item.size || 70) / 2 + 6;
            return (
              <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2}
                fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" rx="4" />
            );
          })()}
        </g>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sticker Panel Emojis
═══════════════════════════════════════════════════════════════ */
const STICKER_SETS = {
  '🔥 Vibes': ['🔥','⚡','💎','👑','🌟','💯','🎯','🚀','🏆','💪','🤙','✌️','😈','🦋','🌊'],
  '❤️ Love':  ['❤️','💜','🖤','🤍','💙','🧡','💛','💚','🩷','💕','💞','💝','😍','🥰','💋'],
  '😂 Fun':   ['😂','🤣','😎','🥶','🤯','🫡','👻','💀','☠️','🤡','👾','🤖','👽','🦊','🐉'],
  '🎨 Art':   ['🎨','🎭','🎪','🎬','🎵','🎸','🎹','🥁','🎤','🎧','🎮','🕹️','🎲','🃏','🎴'],
  '🌿 Nature':['🌿','🍃','🌴','🌸','🌺','🌻','🌹','🦁','🐺','🦅','🌙','⭐','☀️','🌈','❄️'],
};

/* ═══════════════════════════════════════════════════════════════
   Main Customizer
═══════════════════════════════════════════════════════════════ */
const GARMENT_COLORS = [
  { name: 'White',    hex: '#FFFFFF' },
  { name: 'Black',    hex: '#111111' },
  { name: 'Grey',     hex: '#9E9E9E' },
  { name: 'Navy',     hex: '#1A237E' },
  { name: 'Maroon',   hex: '#7B1515' },
  { name: 'Olive',    hex: '#5B6A0A' },
  { name: 'Beige',    hex: '#D7C5A0' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Forest',   hex: '#2D5016' },
  { name: 'Burgundy', hex: '#800020' },
];

const FONTS = ['Arial', 'Impact', 'Georgia', 'Courier New', 'Verdana', 'Trebuchet MS'];

export default function Customizer() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('front');
  const [garmentColor, setGarmentColor] = useState('#FFFFFF');
  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const [frontItems, setFrontItems] = useState([]);
  const [backItems, setBackItems] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [tool, setTool] = useState('sticker'); // 'text' | 'image' | 'sticker'
  const [stickerSet, setStickerSet] = useState('🔥 Vibes');

  // Text tool state
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFont, setTextFont] = useState('Arial');
  const [textBold, setTextBold] = useState(false);
  const [textSize, setTextSize] = useState(20);

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await FirebaseService.getProducts();
      let p = productId
        ? all.find(x => x.slug === productId || x.id === productId)
        : null;
      if (!p) p = all.find(x => x.isCustomizable) || all[0];
      setProduct(p);
      if (p) {
        setSelectedSize(p.sizes?.[0] || 'M');
        setGarmentColor(p.colors?.[0]?.hex || '#FFFFFF');
      }
      setLoading(false);
    }
    load();
  }, [productId]);

  const printZones = {
    front: { x: 140, y: 130, w: 120, h: 110 },
    back:  { x: 110, y: 100, w: 180, h: 230 },
  };
  const zone = printZones[view];
  const cx = zone.x + zone.w / 2;
  const cy = zone.y + zone.h / 2;

  const currentItems = view === 'front' ? frontItems : backItems;
  const setCurrentItems = view === 'front' ? setFrontItems : setBackItems;

  const addText = () => {
    if (!textInput.trim()) return;
    setCurrentItems(prev => [...prev, {
      id: Date.now(), type: 'text', text: textInput,
      x: cx, y: cy, color: textColor, fontFamily: textFont,
      fontSize: textSize, bold: textBold,
    }]);
    setTextInput('');
  };

  const addSticker = (emoji) => {
    setCurrentItems(prev => [...prev, {
      id: Date.now(), type: 'sticker', emoji,
      x: cx + (Math.random() * 40 - 20),
      y: cy + (Math.random() * 40 - 20),
      size: 36,
    }]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCurrentItems(prev => [...prev, {
        id: Date.now(), type: 'image', src: ev.target.result,
        x: cx, y: cy, size: 80,
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const moveItem = useCallback((id, x, y) => {
    setCurrentItems(prev => prev.map(it => it.id === id ? { ...it, x, y } : it));
  }, [setCurrentItems]);

  const deleteActive = () => {
    setCurrentItems(prev => prev.filter(it => it.id !== activeId));
    setActiveId(null);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, { name: garmentColor, hex: garmentColor }, qty, {
      frontLayers: frontItems, backLayers: backItems, garmentColor,
    });
    setJustAdded(true);
    setTimeout(() => { setJustAdded(false); navigate('/'); }, 2000);
  };

  const basePrice = product ? (product.discountPrice || product.basePrice || 999) : 999;
  const printFee  = product ? (product.customizationFee || 150) : 150;
  const total     = (basePrice + printFee) * qty;

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 font-mono">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] text-zinc-400 uppercase tracking-widest">LOADING STUDIO...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-white">
      <div className="text-center space-y-4">
        <Sparkles className="w-12 h-12 text-zinc-600 mx-auto" />
        <p className="text-sm font-bold uppercase">No Product Found</p>
        <Link to="/shop" className="block px-6 py-3 bg-violet-600 text-white text-xs font-bold uppercase rounded-xl">
          Back to Shop
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 font-mono text-white flex flex-col">

      {/* ── Top Nav ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/95 border-b border-white/10 shrink-0 backdrop-blur">
        <Link to={`/product/${product.slug || product.id}`} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-violet-600 rounded flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-bold uppercase text-white tracking-widest">CUSTOM PRINT STUDIO</span>
        </div>
        {/* Qty + Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1 border border-zinc-700">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center text-sm leading-none">−</button>
            <span className="text-xs font-bold w-4 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center text-sm leading-none">+</button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold uppercase rounded-xl transition-all shadow-lg"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ADD TO CART</span>
            <span className="sm:hidden">ADD</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout: stacked on mobile, side-by-side on desktop ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">

        {/* ══ LEFT: T-Shirt Preview Canvas ══ */}
        <div className="flex flex-col items-center pt-5 px-4 lg:w-[52%] lg:min-h-0">

          {/* Front / Back Toggle */}
          <div className="flex bg-zinc-800 rounded-2xl p-1 mb-5 w-full max-w-[320px] shadow-inner">
            {[{ id: 'front', label: '👕 Front' }, { id: 'back', label: '🔄 Back' }].map(v => (
              <button
                key={v.id}
                onClick={() => { setView(v.id); setActiveId(null); }}
                className={`flex-1 py-2.5 text-[11px] font-bold uppercase rounded-xl transition-all ${view === v.id ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* T-Shirt 3D Canvas */}
          <div className="relative w-full max-w-[320px]"
            style={{ aspectRatio: '400/440', background: 'radial-gradient(ellipse at center, #2a2a4a 0%, #0f0f1f 100%)', borderRadius: '20px', padding: '10px' }}>
            <div className="relative w-full h-full">
              {view === 'front'
                ? <TshirtFront color={garmentColor} showZone={currentItems.length === 0} />
                : <TshirtBack color={garmentColor} showZone={currentItems.length === 0} />
              }
              <PrintLayer
                items={currentItems}
                activeId={activeId}
                setActiveId={setActiveId}
                printZone={zone}
                onMove={moveItem}
              />
            </div>
          </div>

          {/* Zone hint */}
          <p className="text-[9px] text-violet-400/70 uppercase tracking-widest mt-3 text-center">
            {view === 'front' ? '📌 Chest print area' : '📌 Full back print area'} · Drag to reposition
          </p>

          {/* Selected item controls */}
          {activeId && (
            <button
              onClick={deleteActive}
              className="mt-3 px-4 py-2 bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-400 text-[11px] font-bold uppercase rounded-xl transition-all"
            >
              🗑 Remove selected
            </button>
          )}

          {/* Size Selector */}
          <div className="mt-5 w-full max-w-[320px]">
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">SIZE</p>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || ['XS','S','M','L','XL','2XL']).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${selectedSize === s ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Color Swatches */}
          <div className="mt-4 w-full max-w-[320px] mb-6">
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">GARMENT COLOR</p>
            <div className="flex flex-wrap gap-2">
              {GARMENT_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setGarmentColor(c.hex)}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${garmentColor === c.hex ? 'border-violet-400 scale-110 shadow-lg shadow-violet-500/30' : 'border-zinc-700 hover:border-zinc-400 hover:scale-105'}`}
                  style={{ backgroundColor: c.hex, boxShadow: garmentColor === c.hex ? undefined : (c.hex === '#FFFFFF' ? 'inset 0 0 0 1px #bbb' : undefined) }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT: Tool Panel ══ */}
        <div className="lg:w-[48%] flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-zinc-900/40">

          {/* Tool Tabs */}
          <div className="flex border-b border-white/10 shrink-0">
            {[
              { id: 'sticker', label: '😊 Stickers', icon: <Smile className="w-3.5 h-3.5" /> },
              { id: 'text',    label: '✏️ Text',     icon: <Type className="w-3.5 h-3.5" /> },
              { id: 'image',   label: '🖼 Upload',   icon: <Upload className="w-3.5 h-3.5" /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold uppercase transition-all border-b-2 ${tool === t.id ? 'text-violet-400 border-violet-500 bg-zinc-800/60' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/30'}`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* ══ STICKER TOOL ══ */}
            {tool === 'sticker' && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">STICKER CATEGORY</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(STICKER_SETS).map(k => (
                      <button
                        key={k}
                        onClick={() => setStickerSet(k)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all ${stickerSet === k ? 'bg-violet-600 border-violet-500 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'}`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    TAP TO ADD TO {view === 'front' ? 'CHEST' : 'BACK'}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {STICKER_SETS[stickerSet].map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => addSticker(emoji)}
                        className="aspect-square bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-500 rounded-xl text-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[9px] text-zinc-600 text-center">
                  Stickers print at your chosen size. Tap to add, drag to reposition.
                </p>
              </div>
            )}

            {/* ══ TEXT TOOL ══ */}
            {tool === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">YOUR TEXT</label>
                  <input
                    type="text"
                    placeholder="Type your custom text..."
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    maxLength={30}
                    onKeyDown={e => e.key === 'Enter' && addText()}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-3 rounded-xl focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">FONT</label>
                    <select
                      value={textFont}
                      onChange={e => setTextFont(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-2.5 rounded-xl focus:outline-none focus:border-violet-500"
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">SIZE</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTextSize(s => Math.max(12, s - 2))} className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white flex items-center justify-center">−</button>
                      <span className="flex-1 text-center text-sm font-bold">{textSize}</span>
                      <button onClick={() => setTextSize(s => Math.min(50, s + 2))} className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white flex items-center justify-center">+</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">COLOR</label>
                    <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-6 h-6 cursor-pointer bg-transparent border-0 rounded" />
                      <span className="text-xs text-zinc-400 font-mono">{textColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">STYLE</label>
                    <button
                      onClick={() => setTextBold(b => !b)}
                      className={`w-full py-2 text-xs font-extrabold rounded-xl border transition-all ${textBold ? 'bg-violet-600 border-violet-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                    >
                      B Bold
                    </button>
                  </div>
                </div>

                <button
                  onClick={addText}
                  disabled={!textInput.trim()}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-xs uppercase rounded-xl transition-all press"
                >
                  + ADD TEXT TO {view === 'front' ? 'CHEST' : 'BACK'}
                </button>
              </div>
            )}

            {/* ══ IMAGE UPLOAD TOOL ══ */}
            {tool === 'image' && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <Upload className="w-7 h-7 text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-300 font-bold text-center">Tap to upload your image</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center">PNG with transparent background recommended</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-[10px] text-zinc-500 space-y-1">
                  <p>✅ PNG with clear/transparent background</p>
                  <p>✅ High resolution (300 DPI) for best print quality</p>
                  <p>✅ Max file size: 10 MB</p>
                </div>
              </div>
            )}

            {/* ══ Design Summary ══ */}
            {(frontItems.length > 0 || backItems.length > 0) && (
              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">YOUR DESIGN</p>
                {frontItems.length > 0 && (
                  <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2 border border-zinc-700">
                    <span className="text-xs text-zinc-300">👕 Chest: {frontItems.length} element{frontItems.length > 1 ? 's' : ''}</span>
                    <button onClick={() => setView('front')} className="text-[10px] text-violet-400 font-bold uppercase hover:text-violet-300">EDIT</button>
                  </div>
                )}
                {backItems.length > 0 && (
                  <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2 border border-zinc-700">
                    <span className="text-xs text-zinc-300">🔄 Back: {backItems.length} element{backItems.length > 1 ? 's' : ''}</span>
                    <button onClick={() => setView('back')} className="text-[10px] text-violet-400 font-bold uppercase hover:text-violet-300">EDIT</button>
                  </div>
                )}
                <button
                  onClick={() => { setCurrentItems([]); setActiveId(null); }}
                  className="w-full py-1.5 text-[10px] text-zinc-600 hover:text-red-400 uppercase font-bold transition-colors"
                >
                  Clear {view} design
                </button>
              </div>
            )}

            {/* ══ Price Summary ══ */}
            <div className="border-t border-white/10 pt-4">
              <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Base price</span>
                  <span className="font-bold text-white">₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>DTG print fee</span>
                  <span className="font-bold text-violet-400">+₹{printFee}</span>
                </div>
                {qty > 1 && (
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Qty × {qty}</span>
                    <span className="font-bold text-white">× {qty}</span>
                  </div>
                )}
                <div className="border-t border-zinc-600 pt-2.5 flex justify-between">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-base font-black text-white">₹{total}</span>
                </div>
              </div>
            </div>

            {/* ══ Big Add to Cart Button ══ */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all press shadow-2xl shadow-violet-500/30 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              ADD TO CART — ₹{total}
            </button>

          </div>
        </div>
      </div>

      {/* ── Success Toast ── */}
      {justAdded && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-3 bg-violet-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-mono animate-fade-in">
          <Check className="w-5 h-5" />
          <div>
            <p className="text-sm font-bold">Added to Cart! 🎨</p>
            <p className="text-[11px] text-violet-200">Redirecting home...</p>
          </div>
        </div>
      )}
    </div>
  );
}
