import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import {
  Type, Image as ImageIcon, Sparkles, RotateCcw, Trash2,
  MoveUp, MoveDown, Check, Palette, Download, Copy, Lock,
  AlignLeft, AlignCenter, AlignRight, Minus, Plus, Bold, Italic,
  Underline, Layers, Upload, Grid, Shapes, Sliders, RefreshCw,
  Maximize2, ZoomIn, ZoomOut, Undo2, Redo2, FlipHorizontal, Move
} from 'lucide-react';
import { CLIPARTS } from '../../data/seedData';

const FONTS = [
  'Plus Jakarta Sans', 'Arial', 'Impact', 'Georgia', 'Verdana',
  'Courier New', 'Times New Roman', 'Trebuchet MS', 'Comic Sans MS',
  'Bebas Neue', 'Oswald', 'Montserrat', 'Roboto', 'Playfair Display'
];

const BG_COLORS = [
  '#FFFFFF', '#000000', '#1a1a2e', '#16213e', '#e63946',
  '#f4a261', '#2a9d8f', '#457b9d', '#6a0572', '#ffb703',
  '#e9c46a', '#a8dadc', '#f1faee', '#dee2e6', '#adb5bd'
];

const SHAPE_DEFS = [
  { name: 'Rectangle', icon: '▬', type: 'rect' },
  { name: 'Circle', icon: '●', type: 'circle' },
  { name: 'Triangle', icon: '▲', type: 'triangle' },
  { name: 'Star', icon: '★', type: 'star' },
  { name: 'Line', icon: '━', type: 'line' },
  { name: 'Rounded Rect', icon: '▢', type: 'roundrect' },
];

const STICKER_EMOJIS = [
  '🔥','⚡','💎','👑','🌟','☠️','🎯','🚀','🦋','🌊',
  '❤️','💜','🖤','💪','🤙','✌️','🎨','🎭','🌹','🏆'
];

export default function CanvasEditor({ product, onSaveCustomization }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const historyRef = useRef({ states: [], index: -1, isReplaying: false });

  const [viewSide, setViewSide] = useState('front');
  const [garmentColor, setGarmentColor] = useState(product?.colors?.[0]?.hex || '#FFFFFF');
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('text');
  const [zoom, setZoom] = useState(1);

  // Text props
  const [textInput, setTextInput] = useState('');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('center');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);

  // Object props (shared)
  const [opacity, setOpacity] = useState(100);
  const [fillColor, setFillColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // History helpers
  const saveState = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyRef.current.isReplaying) return;
    const json = JSON.stringify(canvas.toJSON(['id', 'locked']));
    const h = historyRef.current;
    h.states = h.states.slice(0, h.index + 1);
    h.states.push(json);
    h.index = h.states.length - 1;
  }, []);

  const undo = useCallback(() => {
    const canvas = fabricRef.current;
    const h = historyRef.current;
    if (!canvas || h.index <= 0) return;
    h.index--;
    h.isReplaying = true;
    canvas.loadFromJSON(h.states[h.index], () => {
      canvas.renderAll();
      h.isReplaying = false;
    });
  }, []);

  const redo = useCallback(() => {
    const canvas = fabricRef.current;
    const h = historyRef.current;
    if (!canvas || h.index >= h.states.length - 1) return;
    h.index++;
    h.isReplaying = true;
    canvas.loadFromJSON(h.states[h.index], () => {
      canvas.renderAll();
      h.isReplaying = false;
    });
  }, []);

  // Init canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 380,
      height: 460,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const syncSelectedObject = () => {
      const obj = canvas.getActiveObject();
      setSelectedObject(obj || null);
      if (!obj) return;
      setOpacity(Math.round((obj.opacity ?? 1) * 100));
      setFillColor(obj.fill || '#000000');
      setStrokeColor(obj.stroke || '#000000');
      setStrokeWidth(obj.strokeWidth || 0);
      setIsLocked(!!obj.locked);
      if (obj.type === 'i-text') {
        setTextInput(obj.text || '');
        setTextColor(obj.fill || '#000000');
        setFontSize(obj.fontSize || 28);
        setFontFamily(obj.fontFamily || 'Plus Jakarta Sans');
        setIsBold(obj.fontWeight === 'bold');
        setIsItalic(obj.fontStyle === 'italic');
        setIsUnderline(!!obj.underline);
        setTextAlign(obj.textAlign || 'center');
        setLetterSpacing(obj.charSpacing || 0);
        setLineHeight(obj.lineHeight || 1.2);
      }
    };

    canvas.on('selection:created', syncSelectedObject);
    canvas.on('selection:updated', syncSelectedObject);
    canvas.on('selection:cleared', () => setSelectedObject(null));
    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);

    saveState();

    return () => canvas.dispose();
  }, []);

  // Sync text props to selected text
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedObject || selectedObject.type !== 'i-text') return;
    selectedObject.set({
      text: textInput || ' ',
      fill: textColor,
      fontSize: Number(fontSize),
      fontFamily,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
      textAlign,
      charSpacing: Number(letterSpacing),
      lineHeight: Number(lineHeight),
    });
    canvas.renderAll();
  }, [textInput, textColor, fontSize, fontFamily, isBold, isItalic, isUnderline, textAlign, letterSpacing, lineHeight]);

  // Sync opacity/stroke to any selected object
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedObject) return;
    selectedObject.set({ opacity: opacity / 100 });
    if (selectedObject.type !== 'i-text') {
      selectedObject.set({ fill: fillColor, stroke: strokeColor, strokeWidth: Number(strokeWidth) });
    }
    canvas.renderAll();
  }, [opacity, fillColor, strokeColor, strokeWidth]);

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText('YOUR TEXT', {
      left: 120, top: 180,
      fontFamily: 'Plus Jakarta Sans',
      fill: '#000000',
      fontSize: 28,
      textAlign: 'center',
      cornerColor: '#5c6ac4',
      cornerSize: 10,
      transparentCorners: false,
      borderColor: '#5c6ac4',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTextInput('YOUR TEXT');
    setActiveLeftTab('text');
  };

  const addShape = (type) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    let shape;
    const common = { left: 140, top: 180, fill: '#000000', cornerColor: '#5c6ac4', cornerSize: 10, transparentCorners: false, borderColor: '#5c6ac4' };
    if (type === 'rect') shape = new fabric.Rect({ ...common, width: 100, height: 80 });
    else if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
    else if (type === 'triangle') shape = new fabric.Triangle({ ...common, width: 100, height: 100 });
    else if (type === 'star') {
      const points = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 50 : 22;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        points.push({ x: 60 + r * Math.cos(a), y: 60 + r * Math.sin(a) });
      }
      shape = new fabric.Polygon(points, { ...common, top: 160, left: 130 });
    }
    else if (type === 'line') shape = new fabric.Line([50, 0, 200, 0], { ...common, stroke: '#000000', strokeWidth: 4, fill: 'transparent' });
    else if (type === 'roundrect') shape = new fabric.Rect({ ...common, width: 100, height: 80, rx: 16, ry: 16 });
    if (shape) { canvas.add(shape); canvas.setActiveObject(shape); canvas.renderAll(); }
  };

  const addSticker = (emoji) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText(emoji, {
      left: 150, top: 180, fontSize: 60,
      cornerColor: '#5c6ac4', cornerSize: 10, transparentCorners: false, borderColor: '#5c6ac4',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addClipart = (url) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(100);
      img.set({ left: 140, top: 180, cornerColor: '#5c6ac4', cornerSize: 10, transparentCorners: false, borderColor: '#5c6ac4' });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (!data) return;
      fabric.Image.fromURL(data.toString(), (img) => {
        img.scaleToWidth(160);
        img.set({ left: 110, top: 150, cornerColor: '#5c6ac4', cornerSize: 10, transparentCorners: false, borderColor: '#5c6ac4' });
        const canvas = fabricRef.current;
        canvas?.add(img);
        canvas?.setActiveObject(img);
        canvas?.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (obj && canvas) { canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); setSelectedObject(null); }
  };

  const duplicateSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj || !canvas) return;
    obj.clone((cloned) => {
      cloned.set({ left: obj.left + 20, top: obj.top + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  const flipSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.set('flipX', !obj.flipX);
    canvas.renderAll();
  };

  const toggleLock = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    const lock = !obj.locked;
    obj.set({
      locked: lock,
      lockMovementX: lock, lockMovementY: lock,
      lockRotation: lock, lockScalingX: lock, lockScalingY: lock,
      selectable: !lock, evented: !lock,
    });
    setIsLocked(lock);
    canvas.renderAll();
  };

  const bringForward = () => { const c = fabricRef.current; const o = c?.getActiveObject(); if (o) { c.bringForward(o); c.renderAll(); } };
  const sendBackward = () => { const c = fabricRef.current; const o = c?.getActiveObject(); if (o) { c.sendBackwards(o); c.renderAll(); } };
  const bringToFront = () => { const c = fabricRef.current; const o = c?.getActiveObject(); if (o) { c.bringToFront(o); c.renderAll(); } };
  const sendToBack = () => { const c = fabricRef.current; const o = c?.getActiveObject(); if (o) { c.sendToBack(o); c.renderAll(); } };

  const clearCanvas = () => {
    if (!window.confirm('Clear all design elements?')) return;
    const canvas = fabricRef.current;
    if (canvas) { canvas.clear(); setSelectedObject(null); }
  };

  const exportDesign = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    onSaveCustomization({
      designJson: JSON.stringify(canvas.toJSON(['id', 'locked'])),
      previewUrl: canvas.toDataURL({ format: 'png', quality: 0.85 }),
      garmentColor,
      viewSide,
    });
  };

  const mockupImage = viewSide === 'front'
    ? (product?.mockupImageFront || product?.images?.[0])
    : (product?.mockupImageBack || product?.images?.[1] || product?.images?.[0]);

  const isTextSelected = selectedObject?.type === 'i-text';
  const hasSelection = !!selectedObject;

  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e] font-mono overflow-hidden" style={{ minHeight: 0 }}>

      {/* ── TOP TOOLBAR ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-[#16213e] border-b border-white/10 px-4 py-2 shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button onClick={undo} title="Undo" className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-all">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} title="Redo" className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-all">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Object Actions — only when something selected */}
          {hasSelection && (
            <div className="flex gap-1">
              <button onClick={duplicateSelected} title="Duplicate" className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-all">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={flipSelected} title="Flip Horizontal" className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-all">
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button onClick={bringToFront} title="Bring to Front" className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-all">
                <MoveUp className="w-4 h-4" />
              </button>
              <button onClick={sendToBack} title="Send to Back" className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-all">
                <MoveDown className="w-4 h-4" />
              </button>
              <button onClick={toggleLock} title={isLocked ? 'Unlock' : 'Lock'} className={`p-1.5 rounded transition-all ${isLocked ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                <Lock className="w-4 h-4" />
              </button>
              <button onClick={deleteSelected} title="Delete" className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Opacity when selected */}
          {hasSelection && (
            <>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Opacity</span>
                <input
                  type="range" min="0" max="100" value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))}
                  className="w-20 accent-violet-500 h-1"
                />
                <span className="text-[10px] text-white w-7">{opacity}%</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Garment Colour Dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider mr-1">Garment</span>
            {product?.colors?.map((c, i) => (
              <button
                key={i}
                onClick={() => setGarmentColor(c.hex)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${garmentColor === c.hex ? 'border-violet-400 scale-125' : 'border-zinc-600 hover:border-zinc-400'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* View Switch */}
          <div className="flex bg-black/30 rounded p-0.5 gap-0.5 border border-white/10">
            {['front', 'back'].map(side => (
              <button key={side}
                onClick={() => setViewSide(side)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${viewSide === side ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Clear */}
          <button onClick={clearCanvas} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-all" title="Clear canvas">
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export CTA */}
          <button
            onClick={exportDesign}
            className="ml-2 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Add to Cart
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────── */}
        <div className="flex shrink-0">
          {/* Icon Rail */}
          <div className="w-14 bg-[#16213e] border-r border-white/10 flex flex-col items-center pt-3 gap-1 z-10">
            {[
              { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
              { id: 'shapes', icon: <Shapes className="w-5 h-5" />, label: 'Shapes' },
              { id: 'stickers', icon: <Sparkles className="w-5 h-5" />, label: 'Stickers' },
              { id: 'graphics', icon: <Grid className="w-5 h-5" />, label: 'Graphics' },
              { id: 'upload', icon: <Upload className="w-5 h-5" />, label: 'Upload' },
              { id: 'bg', icon: <Palette className="w-5 h-5" />, label: 'Background' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveLeftTab(activeLeftTab === t.id ? null : t.id)}
                className={`w-10 h-10 flex flex-col items-center justify-center rounded-lg transition-all gap-0.5 ${activeLeftTab === t.id ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/10'}`}
                title={t.label}
              >
                {t.icon}
                <span className="text-[7px] font-bold uppercase">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Expanded Panel */}
          {activeLeftTab && (
            <div className="w-56 bg-[#1e2a45] border-r border-white/10 overflow-y-auto flex flex-col">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">
                  {activeLeftTab === 'text' && 'Text'}
                  {activeLeftTab === 'shapes' && 'Shapes'}
                  {activeLeftTab === 'stickers' && 'Stickers'}
                  {activeLeftTab === 'graphics' && 'Graphics'}
                  {activeLeftTab === 'upload' && 'Upload Image'}
                  {activeLeftTab === 'bg' && 'Background'}
                </h3>
              </div>

              <div className="p-3 flex-1 space-y-3">

                {/* TEXT TAB */}
                {activeLeftTab === 'text' && (
                  <div className="space-y-2">
                    <button onClick={addText} className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add Text
                    </button>
                    <div className="space-y-1.5">
                      {[
                        { label: 'HEADING', size: 36, weight: 'bold', family: 'Impact' },
                        { label: 'Subheading', size: 24, weight: 'normal', family: 'Plus Jakarta Sans' },
                        { label: 'Body text', size: 16, weight: 'normal', family: 'Plus Jakarta Sans' },
                        { label: 'UPPERCASE', size: 20, weight: 'bold', family: 'Oswald' },
                        { label: 'Script Style', size: 22, weight: 'normal', family: 'Georgia' },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            const canvas = fabricRef.current;
                            if (!canvas) return;
                            const text = new fabric.IText(preset.label, {
                              left: 100, top: 180, fontFamily: preset.family,
                              fill: '#000000', fontSize: preset.size, fontWeight: preset.weight,
                              cornerColor: '#5c6ac4', cornerSize: 10, transparentCorners: false, borderColor: '#5c6ac4',
                            });
                            canvas.add(text);
                            canvas.setActiveObject(text);
                            canvas.renderAll();
                            setTextInput(preset.label);
                            setFontSize(preset.size);
                            setFontFamily(preset.family);
                          }}
                          className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white transition-all"
                          style={{ fontFamily: preset.family, fontSize: preset.size > 20 ? 14 : 12, fontWeight: preset.weight }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SHAPES TAB */}
                {activeLeftTab === 'shapes' && (
                  <div className="grid grid-cols-2 gap-2">
                    {SHAPE_DEFS.map(s => (
                      <button
                        key={s.type}
                        onClick={() => addShape(s.type)}
                        className="py-4 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-violet-500 rounded flex flex-col items-center gap-1.5 transition-all"
                      >
                        <span className="text-2xl text-white">{s.icon}</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* STICKERS TAB */}
                {activeLeftTab === 'stickers' && (
                  <div className="grid grid-cols-4 gap-2">
                    {STICKER_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-violet-500 rounded text-2xl flex items-center justify-center transition-all"
                        title={`Add ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* GRAPHICS TAB */}
                {activeLeftTab === 'graphics' && (
                  <div className="grid grid-cols-2 gap-2">
                    {CLIPARTS.map(clip => (
                      <button
                        key={clip.id}
                        onClick={() => addClipart(clip.url)}
                        className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-violet-500 rounded flex flex-col items-center gap-1.5 group transition-all"
                        title={clip.name}
                      >
                        <img src={clip.url} alt={clip.name} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase line-clamp-1">{clip.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* UPLOAD TAB */}
                {activeLeftTab === 'upload' && (
                  <div className="space-y-3">
                    <label className="w-full flex flex-col items-center justify-center gap-3 py-8 bg-white/5 border-2 border-dashed border-white/20 hover:border-violet-500 rounded cursor-pointer transition-all group">
                      <Upload className="w-8 h-8 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                      <div className="text-center">
                        <p className="text-[11px] font-bold text-white">Upload Image</p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">PNG, JPG, WEBP, SVG</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <p className="text-[9px] text-zinc-500 text-center leading-relaxed uppercase tracking-wider">
                      For best print quality use images 300 DPI or higher
                    </p>
                  </div>
                )}

                {/* BG TAB */}
                {activeLeftTab === 'bg' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Garment Color</p>
                    <div className="grid grid-cols-5 gap-2">
                      {BG_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setGarmentColor(color)}
                          className={`w-8 h-8 rounded border-2 transition-all ${garmentColor === color ? 'border-violet-400 scale-110' : 'border-zinc-600 hover:border-zinc-400'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 uppercase">Custom</span>
                      <input
                        type="color"
                        value={garmentColor}
                        onChange={e => setGarmentColor(e.target.value)}
                        className="w-8 h-8 bg-transparent border border-white/20 rounded cursor-pointer"
                      />
                      <span className="text-[10px] text-zinc-300 font-mono">{garmentColor}</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* ── CENTER CANVAS ─────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center bg-[#1a1a2e] overflow-auto p-8 relative">
          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#16213e] border border-white/10 rounded-full px-3 py-1.5 z-10">
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="text-zinc-400 hover:text-white transition-colors p-0.5">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-zinc-300 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="text-zinc-400 hover:text-white transition-colors p-0.5">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3 bg-white/20" />
            <button onClick={() => setZoom(1)} className="text-[9px] text-zinc-400 hover:text-white uppercase font-bold transition-colors">FIT</button>
          </div>

          {/* T-shirt Stage */}
          <div
            className="relative shadow-2xl"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
            }}
          >
            {/* Garment Background */}
            <div
              className="relative flex items-center justify-center rounded-sm"
              style={{
                width: 460,
                height: 540,
                backgroundColor: garmentColor,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Mockup Image overlay */}
              {mockupImage && (
                <img
                  src={mockupImage}
                  alt="Garment"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 pointer-events-none rounded-sm"
                />
              )}

              {/* Print area guide */}
              <div className="absolute border-2 border-dashed border-white/20 pointer-events-none" style={{ width: 380, height: 460, top: 40, left: 40 }}>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-white/30 font-mono uppercase tracking-widest whitespace-nowrap">
                  ✦ Print Area ✦
                </span>
              </div>

              {/* Fabric Canvas */}
              <div className="relative z-10 mt-8">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PROPERTIES PANEL ────────────────────────────────── */}
        <div className="w-60 bg-[#16213e] border-l border-white/10 overflow-y-auto flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-violet-400" /> Properties
            </h3>
          </div>

          {!hasSelection ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <Move className="w-8 h-8 text-zinc-600" />
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider leading-relaxed">
                Select an element to edit its properties
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-4">

              {/* TEXT PROPERTIES */}
              {isTextSelected && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Text Content</label>
                    <textarea
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 text-white text-xs p-2 focus:outline-none focus:border-violet-500 rounded resize-none font-mono"
                      placeholder="Type your text..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Font</label>
                    <select
                      value={fontFamily}
                      onChange={e => setFontFamily(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white text-xs p-2 focus:outline-none focus:border-violet-500 rounded"
                    >
                      {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Size</label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setFontSize(s => Math.max(8, s - 2))} className="p-0.5 text-zinc-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                        <input
                          type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                          className="w-12 bg-white/5 border border-white/10 text-white text-[10px] text-center p-1 rounded focus:outline-none focus:border-violet-500"
                        />
                        <button onClick={() => setFontSize(s => Math.min(120, s + 2))} className="p-0.5 text-zinc-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <input type="range" min="8" max="120" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1" />
                  </div>

                  {/* Style Buttons */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Style</label>
                    <div className="flex gap-1.5">
                      {[
                        { icon: <Bold className="w-3.5 h-3.5" />, active: isBold, toggle: () => setIsBold(!isBold) },
                        { icon: <Italic className="w-3.5 h-3.5" />, active: isItalic, toggle: () => setIsItalic(!isItalic) },
                        { icon: <Underline className="w-3.5 h-3.5" />, active: isUnderline, toggle: () => setIsUnderline(!isUnderline) },
                      ].map((btn, i) => (
                        <button key={i} onClick={btn.toggle}
                          className={`flex-1 py-1.5 flex items-center justify-center rounded transition-all border ${btn.active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                          {btn.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Alignment</label>
                    <div className="flex gap-1.5">
                      {[
                        { icon: <AlignLeft className="w-3.5 h-3.5" />, val: 'left' },
                        { icon: <AlignCenter className="w-3.5 h-3.5" />, val: 'center' },
                        { icon: <AlignRight className="w-3.5 h-3.5" />, val: 'right' },
                      ].map(a => (
                        <button key={a.val} onClick={() => setTextAlign(a.val)}
                          className={`flex-1 py-1.5 flex items-center justify-center rounded transition-all border ${textAlign === a.val ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                          {a.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer" />
                      <span className="text-[10px] text-zinc-300 font-mono">{textColor.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Letter Spacing</label>
                      <span className="text-[9px] text-zinc-400">{letterSpacing}</span>
                    </div>
                    <input type="range" min="-200" max="800" value={letterSpacing} onChange={e => setLetterSpacing(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1" />
                  </div>

                  {/* Line Height */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Line Height</label>
                      <span className="text-[9px] text-zinc-400">{lineHeight.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0.5" max="3" step="0.1" value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1" />
                  </div>
                </>
              )}

              {/* SHAPE / IMAGE PROPERTIES */}
              {!isTextSelected && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fill Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)}
                        className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer" />
                      <span className="text-[10px] text-zinc-300 font-mono">{fillColor.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stroke</label>
                      <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)}
                        className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer" />
                    </div>
                    <input type="range" min="0" max="20" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1" />
                    <span className="text-[9px] text-zinc-500">{strokeWidth}px stroke</span>
                  </div>
                </>
              )}

              {/* SHARED: Opacity */}
              <div className="space-y-1.5 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Opacity</label>
                  <span className="text-[9px] text-zinc-400">{opacity}%</span>
                </div>
                <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(Number(e.target.value))}
                  className="w-full accent-violet-500 h-1" />
              </div>

              {/* Layer Order */}
              <div className="space-y-1.5 border-t border-white/10 pt-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Layer Order</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={bringForward} className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] text-zinc-300 uppercase font-bold flex items-center justify-center gap-1 transition-all">
                    <MoveUp className="w-3 h-3" /> Forward
                  </button>
                  <button onClick={sendBackward} className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] text-zinc-300 uppercase font-bold flex items-center justify-center gap-1 transition-all">
                    <MoveDown className="w-3 h-3" /> Backward
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-1.5 border-t border-white/10 pt-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Actions</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={duplicateSelected} className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] text-zinc-300 uppercase font-bold flex items-center justify-center gap-1 transition-all">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button onClick={flipSelected} className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] text-zinc-300 uppercase font-bold flex items-center justify-center gap-1 transition-all">
                    <FlipHorizontal className="w-3 h-3" /> Flip
                  </button>
                </div>
                <button onClick={deleteSelected} className="w-full py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 rounded text-[9px] text-red-400 uppercase font-bold flex items-center justify-center gap-1 transition-all">
                  <Trash2 className="w-3 h-3" /> Delete Element
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
