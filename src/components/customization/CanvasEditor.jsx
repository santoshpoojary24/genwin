import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { 
  Type, Image as ImageIcon, Sparkles, RotateCcw, Trash2, 
  MoveUp, MoveDown, Check, Palette
} from 'lucide-react';
import { CLIPARTS } from '../../data/seedData';

export default function CanvasEditor({ product, onSaveCustomization }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const [viewSide, setViewSide] = useState('front');
  const [garmentColor, setGarmentColor] = useState(product?.colors?.[0]?.hex || '#FFFFFF');
  const [selectedObject, setSelectedObject] = useState(null);

  // Text Controls
  const [textInput, setTextInput] = useState('');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 320,
      height: 400,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    const handleSelection = () => {
      const activeObj = canvas.getActiveObject();
      setSelectedObject(activeObj);
      if (activeObj && activeObj.type === 'i-text') {
        setTextInput(activeObj.text || '');
        setTextColor(activeObj.fill || '#000000');
        setFontSize(activeObj.fontSize || 24);
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedObject(null));

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject || selectedObject.type !== 'i-text') return;

    selectedObject.set({
      text: textInput || 'CUSTOM TEXT',
      fill: textColor,
      fontSize: Number(fontSize),
      fontFamily,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
    });
    canvas.renderAll();
  }, [textInput, textColor, fontSize, fontFamily, isBold, isItalic]);

  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('YOUR TEXT HERE', {
      left: 90,
      top: 150,
      fontFamily: 'Plus Jakarta Sans',
      fill: textColor,
      fontSize: 22,
      cornerColor: '#000000',
      cornerSize: 8,
      transparentCorners: false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTextInput('YOUR TEXT HERE');
  };

  const handleAddClipart = (clipartUrl) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.Image.fromURL(clipartUrl, (img) => {
      img.scaleToWidth(120);
      img.set({
        left: 100,
        top: 130,
        cornerColor: '#000000',
        cornerSize: 8,
        transparentCorners: false,
      });
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
      if (data) {
        fabric.Image.fromURL(data.toString(), (img) => {
          img.scaleToWidth(140);
          img.set({
            left: 90,
            top: 120,
            cornerColor: '#000000',
            cornerSize: 8,
            transparentCorners: false,
          });
          const canvas = fabricCanvasRef.current;
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (activeObj && canvas) {
      canvas.remove(activeObj);
      canvas.discardActiveObject();
      canvas.renderAll();
      setSelectedObject(null);
    }
  };

  const handleBringForward = () => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (activeObj) {
      canvas.bringForward(activeObj);
      canvas.renderAll();
    }
  };

  const handleSendBackward = () => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (activeObj) {
      canvas.sendBackwards(activeObj);
      canvas.renderAll();
    }
  };

  const handleClear = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.clear();
      setSelectedObject(null);
    }
  };

  const handleExportDesign = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const designJson = JSON.stringify(canvas.toJSON());
    const previewUrl = canvas.toDataURL({ format: 'png', quality: 0.8 });

    onSaveCustomization({
      designJson,
      previewUrl,
      garmentColor,
      viewSide,
    });
  };

  const mockupImage = viewSide === 'front' 
    ? (product?.mockupImageFront || product?.images?.[0])
    : (product?.mockupImageBack || product?.images?.[1] || product?.images?.[0]);

  return (
    <div className="bg-white border border-zinc-200 grid grid-cols-1 lg:grid-cols-12 gap-0 font-mono">
      
      {/* Left Garment Stage */}
      <div className="lg:col-span-7 bg-zinc-50 p-6 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-zinc-200 min-h-[480px]">
        
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between mb-4 uppercase text-xs">
          <div className="bg-white p-1 border border-zinc-300 flex gap-1 font-bold">
            <button
              onClick={() => setViewSide('front')}
              className={`px-3 py-1 transition-all ${
                viewSide === 'front' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              FRONT
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`px-3 py-1 transition-all ${
                viewSide === 'back' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              BACK
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-zinc-300">
            <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
              <Palette className="w-3 h-3 text-black" /> COLOR:
            </span>
            {product?.colors?.map((c, i) => (
              <button
                key={i}
                onClick={() => setGarmentColor(c.hex)}
                className={`w-4 h-4 rounded-full border border-zinc-400 ${
                  garmentColor === c.hex ? 'ring-2 ring-black scale-110' : ''
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Canvas Garment Container */}
        <div className="relative w-[340px] h-[430px] flex items-center justify-center border border-zinc-300 overflow-hidden"
             style={{ backgroundColor: garmentColor }}>
          
          <img
            src={mockupImage}
            alt="Garment Mockup"
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-85 pointer-events-none"
          />

          <div className="absolute w-[240px] h-[320px] border border-dashed border-black/40 pointer-events-none flex items-start justify-center pt-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-black bg-white px-2 py-0.5 border border-zinc-300">
              PRINT AREA
            </span>
          </div>

          <div className="relative z-10">
            <canvas ref={canvasRef} className="border border-zinc-200" />
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="w-full flex items-center justify-between mt-4 text-[10px] uppercase text-zinc-500 font-mono">
          <span>DRAG / SCALE OBJECT HANDLES</span>
          <button onClick={handleClear} className="text-black hover:underline flex items-center gap-1 font-bold">
            <RotateCcw className="w-3 h-3" /> CLEAR CANVAS
          </button>
        </div>
      </div>

      {/* Right Controls Panel */}
      <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[600px] uppercase text-xs">
        
        <div className="space-y-6">
          <div className="border-b border-zinc-200 pb-3">
            <h3 className="font-display font-extrabold text-black text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black" /> CUSTOMIZER STUDIO
            </h3>
            <p className="text-[10px] text-zinc-500">ADD TEXT, GRAPHICS OR UPLOAD HIGH-RES ARTWORK.</p>
          </div>

          {/* 1. Typography */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-zinc-500 tracking-widest flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> 1. TYPOGRAPHY
            </label>
            
            <button
              onClick={handleAddText}
              className="w-full py-2 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 flex items-center justify-center gap-2"
            >
              <Type className="w-3.5 h-3.5" /> ADD TEXT LAYER
            </button>

            {selectedObject && selectedObject.type === 'i-text' && (
              <div className="bg-zinc-50 p-3 border border-zinc-200 space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="TYPE TEXT..."
                  className="w-full bg-white border border-zinc-300 text-xs p-2 uppercase font-mono focus:outline-none focus:border-black"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500">TEXT COLOR</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-7 bg-white border border-zinc-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500">FONT SIZE ({fontSize}PX)</label>
                    <input
                      type="range"
                      min="12"
                      max="60"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full accent-black h-1 mt-2"
                    />
                  </div>
                </div>

                <div className="flex gap-2 text-xs font-bold">
                  <button
                    onClick={() => setIsBold(!isBold)}
                    className={`flex-1 py-1 border ${isBold ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 border-zinc-300'}`}
                  >
                    BOLD
                  </button>
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={`flex-1 py-1 border italic ${isItalic ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 border-zinc-300'}`}
                  >
                    ITALIC
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Clipart */}
          <div className="space-y-3 pt-2 border-t border-zinc-200">
            <label className="block text-[10px] font-bold text-zinc-500 tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 2. CLIPART ARTWORK
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CLIPARTS.map(clip => (
                <button
                  key={clip.id}
                  onClick={() => handleAddClipart(clip.url)}
                  className="p-2 bg-zinc-50 border border-zinc-300 hover:border-black flex flex-col items-center gap-1 group"
                  title={clip.name}
                >
                  <img src={clip.url} alt={clip.name} className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" />
                  <span className="text-[9px] font-bold text-zinc-700 line-clamp-1">{clip.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Custom Upload */}
          <div className="space-y-3 pt-2 border-t border-zinc-200">
            <label className="block text-[10px] font-bold text-zinc-500 tracking-widest flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> 3. CUSTOM IMAGE UPLOAD
            </label>
            <label className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 border border-dashed border-zinc-400 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer uppercase">
              <ImageIcon className="w-3.5 h-3.5 text-black" /> SELECT FILE
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Layer Adjustments */}
          {selectedObject && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2 pt-2 border-t border-zinc-200">
              <div className="flex items-center justify-between text-[10px] font-bold text-black">
                <span>LAYER CONTROL</span>
                <button onClick={handleDeleteSelected} className="text-black hover:underline flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> REMOVE
                </button>
              </div>

              <div className="flex gap-2 text-[10px]">
                <button onClick={handleBringForward} className="flex-1 py-1 bg-white border border-zinc-300 text-black font-bold flex items-center justify-center gap-1">
                  <MoveUp className="w-3 h-3" /> FORWARD
                </button>
                <button onClick={handleSendBackward} className="flex-1 py-1 bg-white border border-zinc-300 text-black font-bold flex items-center justify-center gap-1">
                  <MoveDown className="w-3 h-3" /> BACKWARD
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Finalize CTA */}
        <div className="pt-4 border-t border-zinc-200">
          <button
            onClick={handleExportDesign}
            className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-4 h-4 text-white" />
            ATTACH DESIGN TO CART
          </button>
        </div>

      </div>

    </div>
  );
}
