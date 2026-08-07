import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, Type, Upload, ShoppingCart } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { useCart, getProductSizeStock } from '../context/CartContext';

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
function PrintLayer({ items, activeId, setActiveId, printZone, onMove }) {
  const svgRef = useRef(null);
  const dragging = useRef(null); // { id, startPos, startX, startY, hasMoved }

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
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const startPos = getSVGPos(clientX, clientY);
    const item = items.find(i => i.id === id);
    if (!item) return;
    setActiveId(id);
    // Pre-compute half-extents so the drag handler can clamp item edges to zone
    const hw = item.type === 'text'
      ? Math.max(44, (item.text?.length || 4) * (item.fontSize || 20) * 0.32)
      : (item.size || 70) / 2 + 6;
    const hh = item.type === 'text'
      ? (item.fontSize || 20) / 2 + 8
      : (item.size || 70) / 2 + 6;
    dragging.current = { id, startPos, startX: item.x, startY: item.y, hasMoved: false, hw, hh };
  };

  useEffect(() => {
    const MOVE_THRESHOLD = 4; // SVG units — below this = a click, not a drag

    const handleMove = (e) => {
      if (!dragging.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX == null) return;
      const pos = getSVGPos(clientX, clientY);
      const dx = pos.x - dragging.current.startPos.x;
      const dy = pos.y - dragging.current.startPos.y;
      if (!dragging.current.hasMoved) {
        if (Math.abs(dx) < MOVE_THRESHOLD && Math.abs(dy) < MOVE_THRESHOLD) return;
        dragging.current.hasMoved = true;
      }
      const z = printZone;
      // Clamp using the item's own half-extents so edges never cross the zone border
      const hw = dragging.current.hw ?? 10;
      const hh = dragging.current.hh ?? 10;
      const nx = Math.max(z.x + hw, Math.min(z.x + z.w - hw, dragging.current.startX + dx));
      const ny = Math.max(z.y + hh, Math.min(z.y + z.h - hh, dragging.current.startY + dy));
      onMove(dragging.current.id, nx, ny);
    };

    const handleUp = () => { dragging.current = null; };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [printZone, onMove, getSVGPos]);

  // Clicking directly on the SVG background (not on a child) deselects
  const handleBgDown = (e) => {
    if (e.target === svgRef.current) setActiveId(null);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 440"
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
      onMouseDown={handleBgDown}
      onTouchStart={handleBgDown}
    >
      {items.map(item => {
        const isActive = activeId === item.id;
        let imgW = item.size || 70;
        let imgH = item.size || 70;
        if (item.type === 'image' && item.aspectRatio) {
          const aspect = item.aspectRatio;
          if (aspect > 1) {
            imgW = item.size || 70;
            imgH = (item.size || 70) / aspect;
          } else {
            imgH = item.size || 70;
            imgW = (item.size || 70) * aspect;
          }
        }

        const hw = item.type === 'text'
          ? Math.max(44, (item.text?.length || 4) * (item.fontSize || 20) * 0.32)
          : imgW / 2 + 6;
        const hh = item.type === 'text'
          ? (item.fontSize || 20) / 2 + 8
          : imgH / 2 + 6;

        return (
          <g
            key={item.id}
            transform={`translate(${item.x},${item.y})`}
            onMouseDown={e => handlePointerDown(e, item.id)}
            onTouchStart={e => handlePointerDown(e, item.id)}
            style={{ cursor: 'move', userSelect: 'none' }}
          >
            {/* Transparent hit-area — makes entire bounding box clickable */}
            <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} fill="transparent" stroke="none" />

            {item.type === 'text' && (
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={item.fontSize || 20}
                fontFamily={item.fontFamily || 'Arial'}
                fill={item.color || '#000'}
                fontWeight={item.bold ? 'bold' : 'normal'}
                style={{ pointerEvents: 'none' }}
              >
                {item.text}
              </text>
            )}
            {item.type === 'image' && (
              <image
                href={item.src}
                x={-imgW / 2}
                y={-imgH / 2}
                width={imgW}
                height={imgH}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Selection outline */}
            {isActive && (
              <rect
                x={-hw} y={-hh}
                width={hw * 2} height={hh * 2}
                fill="rgba(99,102,241,0.06)"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="5,3"
                rx="4"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}


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

  // Image cropping state
  const [croppingFile, setCroppingFile] = useState(null);
  const [croppingImageSrc, setCroppingImageSrc] = useState(null);
  const [cropShape, setCropShape] = useState('original');
  const [cropParams, setCropParams] = useState({ x: 15, y: 15, w: 70, h: 70 });
  const [cropRotation, setCropRotation] = useState(0);

  const selectedSizeStock = product ? getProductSizeStock(product, selectedSize) : 0;
  const isSelectedSizeOut = selectedSizeStock <= 0;

  // Clamp quantity to remaining stock whenever size/product changes
  useEffect(() => {
    if (selectedSizeStock > 0) {
      setQty(q => Math.max(1, Math.min(q, selectedSizeStock)));
    } else {
      setQty(1);
    }
  }, [selectedSize, selectedSizeStock]);

  const [frontItems, setFrontItems] = useState([]);
  const [backItems, setBackItems] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [tool, setTool] = useState('text'); // 'text' | 'image'


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
        const sizes = p.sizes || ['XS','S','M','L','XL','2XL'];
        const firstAvailable = sizes.find(sz => getProductSizeStock(p, sz) > 0) || sizes[0];
        setSelectedSize(firstAvailable);
        
        const colorsList = p.colors && p.colors.length > 0
          ? p.colors.map(c => typeof c === 'string' ? { name: c, hex: c } : c)
          : GARMENT_COLORS;
        setGarmentColor(colorsList[0]?.hex || '#FFFFFF');
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

  const availableColors = product && product.colors && product.colors.length > 0 
    ? product.colors.map(c => typeof c === 'string' ? { name: c, hex: c } : c)
    : GARMENT_COLORS;

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



  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCroppingFile(file);
      setCroppingImageSrc(ev.target.result);
      setCropShape('original');
      setCropParams({ x: 15, y: 15, w: 70, h: 70 });
      setCropRotation(0);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const containerRef = useRef(null);
  const dragInfo = useRef({ active: false, handle: null, startX: 0, startY: 0, startParams: null });

  const handlePointerDown = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragInfo.current = {
      active: true,
      handle,
      startX: clientX,
      startY: clientY,
      startParams: { ...cropParams }
    };
  };

  const handlePointerMove = (e) => {
    if (!dragInfo.current.active) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = ((clientX - dragInfo.current.startX) / rect.width) * 100;
    const deltaY = ((clientY - dragInfo.current.startY) / rect.height) * 100;
    
    const { handle, startParams } = dragInfo.current;

    let newX = startParams.x;
    let newY = startParams.y;
    let newW = startParams.w;
    let newH = startParams.h;

    if (handle === 'move') {
      newX = Math.max(0, Math.min(100 - startParams.w, startParams.x + deltaX));
      newY = Math.max(0, Math.min(100 - startParams.h, startParams.y + deltaY));
    } else {
      if (handle.includes('e')) {
        newW = Math.max(10, Math.min(100 - startParams.x, startParams.w + deltaX));
      }
      if (handle.includes('w')) {
        const potentialX = Math.max(0, Math.min(startParams.x + startParams.w - 10, startParams.x + deltaX));
        newW = startParams.x + startParams.w - potentialX;
        newX = potentialX;
      }
      if (handle.includes('s')) {
        newH = Math.max(10, Math.min(100 - startParams.y, startParams.h + deltaY));
      }
      if (handle.includes('n')) {
        const potentialY = Math.max(0, Math.min(startParams.y + startParams.h - 10, startParams.y + deltaY));
        newH = startParams.y + startParams.h - potentialY;
        newY = potentialY;
      }
    }

    setCropParams({ x: newX, y: newY, w: newW, h: newH });
  };

  const handlePointerUp = () => {
    dragInfo.current.active = false;
  };

  const applyCrop = () => {
    if (!croppingImageSrc) return;
    const img = new Image();
    img.onload = () => {
      const rotateCanvas = document.createElement('canvas');
      const rotateCtx = rotateCanvas.getContext('2d');
      
      const rad = (cropRotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));
      const rotW = img.width * absCos + img.height * absSin;
      const rotH = img.width * absSin + img.height * absCos;
      
      rotateCanvas.width = rotW;
      rotateCanvas.height = rotH;
      
      rotateCtx.translate(rotW / 2, rotH / 2);
      rotateCtx.rotate(rad);
      rotateCtx.drawImage(img, -img.width / 2, -img.height / 2);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const absX = (cropParams.x / 100) * rotW;
      const absY = (cropParams.y / 100) * rotH;
      const absW = (cropParams.w / 100) * rotW;
      const absH = (cropParams.h / 100) * rotH;

      const targetSize = 650;
      let targetW = targetSize;
      let targetH = targetSize;

      if (cropShape !== 'circle') {
        const aspect = absW / absH;
        if (aspect > 1) {
          targetW = targetSize;
          targetH = Math.round(targetSize / aspect);
        } else {
          targetH = targetSize;
          targetW = Math.round(targetSize * aspect);
        }
      }

      canvas.width = targetW;
      canvas.height = targetH;

      if (cropShape === 'circle') {
        ctx.beginPath();
        ctx.arc(targetW / 2, targetH / 2, targetW / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(rotateCanvas, absX, absY, absW, absH, 0, 0, targetW, targetH);

      const fileType = (cropShape === 'circle' || croppingFile?.type === 'image/png')
        ? 'image/png'
        : 'image/jpeg';
      
      const compressedDataUrl = fileType === 'image/png'
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', 0.85);

      const initialSize = Math.round(zone.w * 0.85);

      setCurrentItems(prev => [...prev, {
        id: Date.now(),
        type: 'image',
        src: compressedDataUrl,
        x: cx,
        y: cy,
        size: initialSize,
        aspectRatio: targetW / targetH
      }]);

      setCroppingImageSrc(null);
      setCroppingFile(null);
    };
    img.src = croppingImageSrc;
  };

  const moveItem = useCallback((id, x, y) => {
    setCurrentItems(prev => prev.map(it => it.id === id ? { ...it, x, y } : it));
  }, [setCurrentItems]);

  const resizeItem = useCallback((id, newSize) => {
    // Cap size so the image can't overflow the zone boundary
    const maxSize = Math.min(zone.w, zone.h) - 4;
    const clamped = Math.max(30, Math.min(maxSize, newSize));
    setCurrentItems(prev => prev.map(it => it.id === id ? { ...it, size: clamped } : it));
  }, [setCurrentItems, zone]);

  // get the currently active item object
  const activeItem = currentItems.find(it => it.id === activeId) || null;

  const deleteActive = () => {
    setCurrentItems(prev => prev.filter(it => it.id !== activeId));
    setActiveId(null);
  };

  const fitActiveToZone = () => {
    if (!activeItem) return;
    const maxW = zone.w - 4;
    const maxH = zone.h - 4;
    const maxDimension = Math.min(maxW, maxH);
    
    setCurrentItems(prev => prev.map(it => {
      if (it.id !== activeId) return it;
      if (it.type === 'text') {
        return {
          ...it,
          x: cx,
          y: cy,
          fontSize: 28
        };
      }
      return {
        ...it,
        size: maxDimension,
        x: cx,
        y: cy
      };
    }));
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
          {selectedSizeStock > 0 && selectedSizeStock <= 5 && (
            <span className="text-[9px] text-amber-400 font-extrabold uppercase animate-pulse hidden md:inline">
              ⚠️ ONLY {selectedSizeStock} LEFT
            </span>
          )}
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1 border border-zinc-700">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center text-sm leading-none">−</button>
            <span className="text-xs font-bold w-4 text-center">{qty}</span>
            <button onClick={() => setQty(q => Math.min(selectedSizeStock, q + 1))} className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center text-sm leading-none">+</button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isSelectedSizeOut}
            className={`flex items-center gap-1.5 px-3 py-2 text-white text-[11px] font-bold uppercase rounded-xl transition-all shadow-lg ${
              isSelectedSizeOut 
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed' 
                : 'bg-violet-600 hover:bg-violet-500 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSelectedSizeOut ? 'SOLD OUT' : 'ADD TO CART'}</span>
            <span className="sm:hidden">{isSelectedSizeOut ? 'SOLD' : 'ADD'}</span>
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

          {/* ── Active item controls ── */}
          {activeItem && (
            <div className="mt-3 w-full max-w-[320px] bg-zinc-800/80 border border-zinc-700 rounded-2xl p-3 space-y-3">
              {/* Resize slider — only for images */}
              {activeItem.type === 'image' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Resize Image</span>
                    <span className="text-[10px] font-bold text-violet-400">{activeItem.size || 80}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resizeItem(activeItem.id, (activeItem.size || 80) - 10)}
                      className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded-lg text-white font-bold flex items-center justify-center text-lg leading-none"
                    >−</button>
                    <input
                      type="range"
                      min={30}
                      max={Math.min(zone.w, zone.h) - 4}
                      value={activeItem.size || 80}
                      onChange={e => resizeItem(activeItem.id, Number(e.target.value))}
                      className="flex-1 h-1.5 accent-violet-500 cursor-pointer"
                    />
                    <button
                      onClick={() => resizeItem(activeItem.id, (activeItem.size || 80) + 10)}
                      className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded-lg text-white font-bold flex items-center justify-center text-lg leading-none"
                    >+</button>
                  </div>
                </div>
              )}
              {/* Fit to Print Area */}
              <button
                onClick={fitActiveToZone}
                className="w-full py-2 bg-violet-900/40 hover:bg-violet-900/70 border border-violet-800 text-violet-300 text-[11px] font-bold uppercase rounded-xl transition-all font-mono"
              >
                📐 Fit to Print Area
              </button>

              {/* Delete */}
              <button
                onClick={deleteActive}
                className="w-full py-2 bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-400 text-[11px] font-bold uppercase rounded-xl transition-all"
              >
                🗑 Remove selected
              </button>
            </div>
          )}

          {/* Size Selector */}
          <div className="mt-5 w-full max-w-[320px]">
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">SIZE</p>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || ['XS','S','M','L','XL','2XL']).map(s => {
                const stock = product ? getProductSizeStock(product, s) : 0;
                const isOut = stock <= 0;
                return (
                  <button
                    key={s}
                    disabled={isOut}
                    onClick={() => {
                      setSelectedSize(s);
                      const sStock = getProductSizeStock(product, s);
                      setQty(q => Math.max(1, Math.min(q, sStock)));
                    }}
                    className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                      isOut
                        ? 'border-zinc-800 text-zinc-600 line-through cursor-not-allowed opacity-40'
                        : selectedSize === s
                        ? 'bg-white text-black border-white'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    {s} {isOut ? '(OUT)' : (stock <= 5 ? `(${stock} LEFT)` : '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Garment Color Swatches */}
          <div className="mt-4 w-full max-w-[320px] mb-6">
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">GARMENT COLOR</p>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(c => (
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
              { id: 'text',  label: '✏️ Add Text',    icon: <Type className="w-3.5 h-3.5" /> },
              { id: 'image', label: '🖼 Upload Image', icon: <Upload className="w-3.5 h-3.5" /> },
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
                  className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-300 font-bold text-center">Tap to upload image</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center">PNG with transparent background</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {/* Fixed size note */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-[10px] text-zinc-500 space-y-1">
                  <p>📐 Placed at fixed 80×80px on the shirt</p>
                  <p>✅ PNG with transparent background recommended</p>
                  <p>✅ Drag to reposition after placing</p>
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

      {/* ── Cropping Modal ── */}
      {croppingImageSrc && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm select-none"
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-md w-full space-y-4 font-mono text-white pointer-events-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Crop & Rotate Sticker</span>
              <button 
                onClick={() => { setCroppingImageSrc(null); setCroppingFile(null); }}
                className="text-zinc-500 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Image Preview Container with Interactive Crop Box */}
            <div 
              ref={containerRef}
              className="relative w-full aspect-square bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden flex items-center justify-center pointer-events-auto cursor-crosshair"
            >
              <img 
                src={croppingImageSrc} 
                alt="Source to crop" 
                className="max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-100"
                style={{ transform: `rotate(${cropRotation}deg)` }}
              />

              {/* Draggable & Resizable Highlight Crop Area */}
              <div 
                className="absolute border-2 border-dashed border-violet-400 bg-white/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-auto flex items-center justify-center"
                style={{
                  left: `${cropParams.x}%`,
                  top: `${cropParams.y}%`,
                  width: `${cropParams.w}%`,
                  height: `${cropParams.h}%`,
                  borderRadius: cropShape === 'circle' ? '50%' : '0px'
                }}
                onMouseDown={(e) => handlePointerDown(e, 'move')}
                onTouchStart={(e) => handlePointerDown(e, 'move')}
              >
                {/* Drag handles at corners */}
                {/* nw */}
                <div 
                  className="absolute top-0 left-0 w-6 h-6 -translate-x-3 -translate-y-3 flex items-center justify-center cursor-nwse-resize active:scale-125 transition-transform pointer-events-auto" 
                  onMouseDown={(e) => handlePointerDown(e, 'nw')}
                  onTouchStart={(e) => handlePointerDown(e, 'nw')}
                >
                  <div className="w-3.5 h-3.5 bg-violet-500 border-2 border-white rounded-full shadow" />
                </div>
                {/* ne */}
                <div 
                  className="absolute top-0 right-0 w-6 h-6 translate-x-3 -translate-y-3 flex items-center justify-center cursor-nesw-resize active:scale-125 transition-transform pointer-events-auto" 
                  onMouseDown={(e) => handlePointerDown(e, 'ne')}
                  onTouchStart={(e) => handlePointerDown(e, 'ne')}
                >
                  <div className="w-3.5 h-3.5 bg-violet-500 border-2 border-white rounded-full shadow" />
                </div>
                {/* sw */}
                <div 
                  className="absolute bottom-0 left-0 w-6 h-6 -translate-x-3 translate-y-3 flex items-center justify-center cursor-nesw-resize active:scale-125 transition-transform pointer-events-auto" 
                  onMouseDown={(e) => handlePointerDown(e, 'sw')}
                  onTouchStart={(e) => handlePointerDown(e, 'sw')}
                >
                  <div className="w-3.5 h-3.5 bg-violet-500 border-2 border-white rounded-full shadow" />
                </div>
                {/* se */}
                <div 
                  className="absolute bottom-0 right-0 w-6 h-6 translate-x-3 translate-y-3 flex items-center justify-center cursor-nwse-resize active:scale-125 transition-transform pointer-events-auto" 
                  onMouseDown={(e) => handlePointerDown(e, 'se')}
                  onTouchStart={(e) => handlePointerDown(e, 'se')}
                >
                  <div className="w-3.5 h-3.5 bg-violet-500 border-2 border-white rounded-full shadow" />
                </div>
              </div>
            </div>

            {/* Shape Selectors */}
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">1. Crop Shape:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'original', label: '🖼️ Original', desc: 'No Mask' },
                  { id: 'square', label: '⬜ Square', desc: '1:1 ratio' },
                  { id: 'circle', label: '🟡 Circle', desc: 'Logo Mask' }
                ].map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => setCropShape(shape.id)}
                    className={`py-1.5 px-0.5 text-center rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      cropShape === shape.id 
                        ? 'bg-white text-black border-white font-extrabold shadow-lg' 
                        : 'border-zinc-800 text-zinc-400 bg-zinc-950/40 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px]">{shape.label}</span>
                    <span className="text-[7px] opacity-60 uppercase">{shape.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] text-zinc-500 uppercase font-bold">
                <span>2. Rotate Sticker (Freestyle):</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCropRotation(r => (r - 90 + 360) % 360)}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded text-[8px] font-bold"
                  >
                    ↺ -90°
                  </button>
                  <button
                    onClick={() => setCropRotation(r => (r + 90) % 360)}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded text-[8px] font-bold"
                  >
                    🔄 +90°
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={cropRotation > 180 ? cropRotation - 360 : cropRotation}
                  onChange={e => setCropRotation(Number(e.target.value))}
                  className="flex-1 accent-violet-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[10px] font-bold text-violet-400 w-10 text-right">
                  {cropRotation}°
                </span>
              </div>
            </div>

            <p className="text-[8px] text-zinc-500 text-center uppercase tracking-wider">
              Drag corners of box to crop · drag center to move · slide to rotate
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setCroppingImageSrc(null); setCroppingFile(null); }}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 font-bold uppercase text-[10px] rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold uppercase text-[10px] rounded-xl transition-all shadow-lg"
              >
                Crop & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
