import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen({ message = "LOADING ARCHIVAL SPECIFICATIONS..." }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 font-mono page-enter select-none">
      <div className="max-w-md w-full text-center space-y-6 flex flex-col items-center">

        {/* Rotating Streetwear Spinner Icon */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Outer Rotating Tactical Dashed Ring */}
          <div className="absolute inset-0 border-2 border-dashed border-black rounded-full animate-spin [animation-duration:3s]" />
          
          {/* Inner Fast Rotating Spinner */}
          <Loader2 className="w-10 h-10 text-black animate-spin [animation-duration:1s]" />

          {/* Center Brand Badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-black text-[9px] uppercase tracking-tighter text-black">
              GW.
            </span>
          </div>
        </div>

        {/* Brand Text */}
        <div>
          <span className="font-display font-black text-3xl uppercase tracking-tighter text-black block">
            जेनwin.
          </span>
          <span className="block text-[9px] font-black tracking-[0.3em] text-zinc-400 uppercase mt-0.5">
            STUDIO ARCHIVE
          </span>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-black uppercase tracking-widest animate-pulse">
            {message}
          </p>
          <p className="text-[9px] text-zinc-400 uppercase">
            HEAVYWEIGHT STREETWEAR LOGISTICS
          </p>
        </div>

      </div>
    </div>
  );
}
