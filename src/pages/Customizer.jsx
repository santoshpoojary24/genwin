import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, RotateCcw, Type, Upload, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { useCart } from '../context/CartContext';

/* ── T-shirt SVG front & back ───────────────────────────────── */
function TshirtFront({ color, printArea, children }) {
  return (
    <svg viewBox="0 0 300 340" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M95,20 L60,50 L20,65 L35,120 L65,105 L65,310 L235,310 L235,105 L265,120 L280,65 L240,50 L205,20 Q180,35 150,35 Q120,35 95,20Z"
        fill={color}
        stroke="#ddd"
        strokeWidth="1.5"
      />
      {/* Collar */}
      <path d="M95,20 Q115,48 150,48 Q185,48 205,20" fill="none" stroke="#ccc" strokeWidth="1.5"/>
      {/* Chest print zone highlight */}
      {printArea === 'chest' && (
        <rect x="105" y="90" width="90" height="80" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" rx="4"/>
      )}
      {children}
    </svg>
  );
}

function TshirtBack({ color, printArea, children }) {
  return (
    <svg viewBox="0 0 300 340" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M95,20 L60,50 L20,65 L35,120 L65,105 L65,310 L235,310 L235,105 L265,120 L280,65 L240,50 L205,20 Q180,10 150,10 Q120,10 95,20Z"
        fill={color}
        stroke="#ddd"
        strokeWidth="1.5"
      />
      <path d="M95,20 Q115,5 150,5 Q185,5 205,20" fill="none" stroke="#ccc" strokeWidth="1.5"/>
      {/* Back print zone highlight */}
      {printArea === 'back' && (
        <rect x="80" y="80" width="140" height="160" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" rx="4"/>
      )}
      {children}
    </svg>
  );
}

/* ── Draggable Print Item on SVG ────────────────────────────── */
function PrintLayer({ items, activeId, setActiveId, printZone, onMove }) {
  const svgRef = useRef(null);
  const dragging = useRef(null);

  const handlePointerDown = (e, id) => {
    e.stopPropagation();
    setActiveId(id);
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    const getPos = (ev) => {
      pt.x = ev.clientX || (ev.touches && ev.touches[0].clientX);
      pt.y = ev.clientY || (ev.touches && ev.touches[0].clientY);
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };
    const startPos = getPos(e.nativeEvent || e);
    const item = items.find(i => i.id === id);
    const startX = item.x;
    const startY = item.y;
    dragging.current = { id, startPos, startX, startY };
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current || !svgRef.current) return;
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX || (e.touches && e.touches[0].clientX);
      pt.y = e.clientY || (e.touches && e.touches[0].clientY);
      const pos = pt.matrixTransform(svg.getScreenCTM().inverse());
      const dx = pos.x - dragging.current.startPos.x;
      const dy = pos.y - dragging.current.startPos.y;
      const zone = printZone;
      const nx = Math.max(zone.x, Math.min(zone.x + zone.w, dragging.current.startX + dx));
      const ny = Math.max(zone.y, Math.min(zone.y + zone.h, dragging.current.startY + dy));
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
  }, [printZone, onMove]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 340"
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
          {item.type === 'text' ? (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={item.fontSize || 18}
              fontFamily={item.fontFamily || 'Arial'}
              fill={item.color || '#000'}
              fontWeight={item.bold ? 'bold' : 'normal'}
              style={{ pointerEvents: 'all' }}
            >
              {item.text}
            </text>
          ) : item.type === 'image' ? (
            <image
              href={item.src}
              x={-(item.size || 60) / 2}
              y={-(item.size || 60) / 2}
              width={item.size || 60}
              height={item.size || 60}
              style={{ pointerEvents: 'all' }}
            />
          ) : null}
          {activeId === item.id && (
            <rect
              x={item.type === 'text' ? -50 : -(item.size || 60) / 2 - 4}
              y={item.type === 'text' ? -(item.fontSize || 18) / 2 - 4 : -(item.size || 60) / 2 - 4}
              width={item.type === 'text' ? 100 : (item.size || 60) + 8}
              height={item.type === 'text' ? (item.fontSize || 18) + 8 : (item.size || 60) + 8}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="4,2"
              rx="3"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

/* ── Main Customizer ────────────────────────────────────────── */
export default function Customizer() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('front'); // 'front' | 'back'
  const [garmentColor, setGarmentColor] = useState('#FFFFFF');
  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Print layers per side
  const [frontItems, setFrontItems] = useState([]);
  const [backItems, setBackItems] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Current text input
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFont, setTextFont] = useState('Arial');
  const [textBold, setTextBold] = useState(false);
  const [textSize, setTextSize] = useState(18);

  // Tool panel: 'text' | 'image'
  const [tool, setTool] = useState('text');

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await FirebaseService.getProducts();
      let p = null;
      if (productId) p = all.find(x => x.slug === productId || x.id === productId);
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

  const currentItems = view === 'front' ? frontItems : backItems;
  const setCurrentItems = view === 'front' ? setFrontItems : setBackItems;

  const printZones = {
    front: { x: 105, y: 90, w: 90, h: 80 },
    back:  { x: 80,  y: 80, w: 140, h: 160 },
  };
  const zone = printZones[view];
  const zoneCenterX = zone.x + zone.w / 2;
  const zoneCenterY = zone.y + zone.h / 2;

  const addText = () => {
    if (!textInput.trim()) return;
    setCurrentItems(prev => [...prev, {
      id: Date.now(),
      type: 'text',
      text: textInput,
      x: zoneCenterX,
      y: zoneCenterY,
      color: textColor,
      fontFamily: textFont,
      fontSize: textSize,
      bold: textBold,
    }]);
    setTextInput('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCurrentItems(prev => [...prev, {
        id: Date.now(),
        type: 'image',
        src: ev.target.result,
        x: zoneCenterX,
        y: zoneCenterY,
        size: 60,
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const moveItem = (id, x, y) => {
    setCurrentItems(prev => prev.map(it => it.id === id ? { ...it, x, y } : it));
  };

  const deleteActive = () => {
    setCurrentItems(prev => prev.filter(it => it.id !== activeId));
    setActiveId(null);
  };

  const clearAll = () => {
    setCurrentItems([]);
    setActiveId(null);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const customization = {
      frontLayers: frontItems,
      backLayers: backItems,
      garmentColor,
    };
    addToCart(product, selectedSize, { name: garmentColor, hex: garmentColor }, qty, customization);
    setJustAdded(true);
    setTimeout(() => { setJustAdded(false); navigate('/'); }, 2000);
  };

  const GARMENT_COLORS = [
    { name: 'White',       hex: '#FFFFFF' },
    { name: 'Black',       hex: '#111111' },
    { name: 'Grey',        hex: '#9E9E9E' },
    { name: 'Navy',        hex: '#1A237E' },
    { name: 'Maroon',      hex: '#7B1515' },
    { name: 'Olive',       hex: '#5B6A0A' },
    { name: 'Beige',       hex: '#D7C5A0' },
    { name: 'Sky Blue',    hex: '#87CEEB' },
  ];

  const FONTS = ['Arial', 'Georgia', 'Impact', 'Courier New', 'Verdana', 'Trebuchet MS'];

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 font-mono">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] text-zinc-400 uppercase tracking-widest">LOADING STUDIO...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 font-mono text-white">
      <Sparkles className="w-12 h-12 text-zinc-600" />
      <p className="text-sm font-bold uppercase">No Product Found</p>
      <Link to="/shop" className="px-6 py-2.5 bg-violet-600 text-white text-xs font-bold uppercase rounded-xl">
        Back to Shop
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 font-mono text-white flex flex-col">

      {/* ── Top Nav ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10 shrink-0">
        <Link to={`/product/${product.slug || product.id}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold uppercase text-white">CUSTOM PRINT STUDIO</span>
        </div>
        {/* Qty + Add to Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-zinc-400 hover:text-white text-xs w-5 h-5 flex items-center justify-center">−</button>
            <span className="text-xs font-bold w-4 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="text-zinc-400 hover:text-white text-xs w-5 h-5 flex items-center justify-center">+</button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase rounded-xl transition-all press shadow-lg"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ADD TO CART</span>
            <span className="sm:hidden">ADD</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto">

        {/* ── Left: T-shirt Preview ── */}
        <div className="flex flex-col items-center justify-start pt-4 px-4 lg:w-[55%]">

          {/* Front / Back Toggle */}
          <div className="flex bg-zinc-800 rounded-xl p-1 mb-4 w-full max-w-xs">
            {['front', 'back'].map(v => (
              <button
                key={v}
                onClick={() => { setView(v); setActiveId(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${view === v ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                {v === 'front' ? '👕 Front (Chest)' : '🔄 Back'}
              </button>
            ))}
          </div>

          {/* T-Shirt Canvas */}
          <div className="relative w-full max-w-xs aspect-[300/340] select-none">
            {view === 'front' ? (
              <TshirtFront color={garmentColor} printArea="chest" />
            ) : (
              <TshirtBack color={garmentColor} printArea="back" />
            )}
            <PrintLayer
              items={currentItems}
              activeId={activeId}
              setActiveId={setActiveId}
              printZone={zone}
              onMove={moveItem}
            />
          </div>

          {/* Print Zone Label */}
          <p className="text-[10px] text-violet-400 uppercase tracking-widest mt-2 text-center">
            {view === 'front' ? '📌 Chest Print Area' : '📌 Full Back Print Area'}
            {' '}· Drag items to reposition
          </p>

          {/* Size Selector */}
          <div className="mt-4 w-full max-w-xs">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">SELECT SIZE</p>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || ['XS','S','M','L','XL','2XL']).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${selectedSize === s ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Color */}
          <div className="mt-4 w-full max-w-xs mb-6">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">GARMENT COLOR</p>
            <div className="flex flex-wrap gap-2">
              {GARMENT_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setGarmentColor(c.hex)}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${garmentColor === c.hex ? 'border-violet-400 scale-110' : 'border-zinc-700 hover:border-zinc-400'}`}
                  style={{ backgroundColor: c.hex, boxShadow: c.hex === '#FFFFFF' ? 'inset 0 0 0 1px #ccc' : 'none' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Tool Panel ── */}
        <div className="lg:w-[45%] flex flex-col border-t lg:border-t-0 lg:border-l border-white/10">

          {/* Tool Tabs */}
          <div className="flex bg-zinc-900 border-b border-white/10">
            <button
              onClick={() => setTool('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase transition-all ${tool === 'text' ? 'bg-zinc-800 text-violet-400 border-b-2 border-violet-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Type className="w-3.5 h-3.5" /> Add Text
            </button>
            <button
              onClick={() => setTool('image')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase transition-all ${tool === 'image' ? 'bg-zinc-800 text-violet-400 border-b-2 border-violet-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload Image
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* ── TEXT TOOL ── */}
            {tool === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">YOUR TEXT</label>
                  <input
                    type="text"
                    placeholder="Type something..."
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    maxLength={30}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">FONT</label>
                    <select
                      value={textFont}
                      onChange={e => setTextFont(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-2 rounded-xl focus:outline-none focus:border-violet-500"
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">SIZE</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTextSize(s => Math.max(10, s - 2))} className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center text-sm">−</button>
                      <span className="flex-1 text-center text-sm font-bold">{textSize}</span>
                      <button onClick={() => setTextSize(s => Math.min(48, s + 2))} className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center text-sm">+</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">TEXT COLOR</label>
                    <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5">
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                      <span className="text-xs text-zinc-400">{textColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">STYLE</label>
                    <button
                      onClick={() => setTextBold(b => !b)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${textBold ? 'bg-violet-600 border-violet-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                    >
                      <span style={{ fontWeight: 'bold' }}>B</span> Bold
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

            {/* ── IMAGE UPLOAD TOOL ── */}
            {tool === 'image' && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-violet-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 text-zinc-600" />
                  <p className="text-sm text-zinc-400 font-bold">Tap to upload image</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest">PNG, JPG, SVG accepted</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

                <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                  Best results: PNG with transparent background. Image will be placed in the {view === 'front' ? 'chest' : 'back'} print area.
                </p>
              </div>
            )}

            {/* ── Active Layer Controls ── */}
            {activeId && (
              <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                <p className="text-[10px] text-violet-400 uppercase tracking-widest">SELECTED ITEM</p>
                <button
                  onClick={deleteActive}
                  className="w-full py-2.5 bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-400 font-bold text-xs uppercase rounded-xl transition-all"
                >
                  🗑 Remove Selected Item
                </button>
              </div>
            )}

            {/* ── Layer Summary ── */}
            {(frontItems.length > 0 || backItems.length > 0) && (
              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">YOUR DESIGN</p>
                {frontItems.length > 0 && (
                  <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2">
                    <span className="text-xs text-zinc-300">👕 Chest: {frontItems.length} item{frontItems.length > 1 ? 's' : ''}</span>
                    <button onClick={() => { setView('front'); }} className="text-[10px] text-violet-400 font-bold uppercase">EDIT</button>
                  </div>
                )}
                {backItems.length > 0 && (
                  <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2">
                    <span className="text-xs text-zinc-300">🔄 Back: {backItems.length} item{backItems.length > 1 ? 's' : ''}</span>
                    <button onClick={() => { setView('back'); }} className="text-[10px] text-violet-400 font-bold uppercase">EDIT</button>
                  </div>
                )}
                <button
                  onClick={clearAll}
                  className="w-full py-2 text-[10px] text-zinc-500 hover:text-red-400 uppercase font-bold transition-colors"
                >
                  Clear {view === 'front' ? 'chest' : 'back'} design
                </button>
              </div>
            )}

            {/* ── Pricing Summary ── */}
            <div className="border-t border-white/10 pt-4">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Base price</span>
                  <span className="font-bold">₹{product.discountPrice || product.basePrice || 999}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">DTG print fee</span>
                  <span className="font-bold text-violet-400">+₹{product.customizationFee || 150}</span>
                </div>
                {qty > 1 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Qty × {qty}</span>
                    <span className="font-bold">= ₹{((product.discountPrice || product.basePrice || 999) + (product.customizationFee || 150)) * qty}</span>
                  </div>
                )}
                <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span className="text-white">₹{((product.discountPrice || product.basePrice || 999) + (product.customizationFee || 150)) * qty}</span>
                </div>
              </div>
            </div>

            {/* ── Add to Cart (Bottom CTA) ── */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all press shadow-xl flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              ADD TO CART — ₹{((product.discountPrice || product.basePrice || 999) + (product.customizationFee || 150)) * qty}
            </button>

          </div>
        </div>
      </div>

      {/* ── Success Toast ── */}
      {justAdded && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-violet-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl font-mono animate-fade-in">
          <Check className="w-5 h-5" />
          <div>
            <p className="text-sm font-bold">Added to Cart!</p>
            <p className="text-[11px] text-violet-200">Redirecting to home...</p>
          </div>
        </div>
      )}
    </div>
  );
}
