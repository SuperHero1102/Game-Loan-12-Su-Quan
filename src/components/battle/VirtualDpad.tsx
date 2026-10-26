/**
 * Loạn 12 Sứ Quân — Virtual Retro Keypad / D-Pad
 * Replicates the beloved classic Java mobile phone keypad layout (2, 4, 6, 8, 5)
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface VirtualDpadProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onClose: () => void;
}

export const VirtualDpad: React.FC<VirtualDpadProps> = ({
  onMove,
  onSelect,
  onClose,
}) => {
  return (
    <div className="w-full max-w-xs mx-auto mt-2 p-2 bg-stone-900/95 border border-amber-800/80 rounded-xl shadow-2xl flex flex-col items-center select-none">
      <div className="w-full flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
          📱 BÀN PHÍM JAVA (2-4-6-8-5)
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] text-stone-400 hover:text-stone-200 underline"
        >
          Ẩn phím
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 w-48 h-36">
        {/* Row 1 */}
        <div />
        <button
          type="button"
          onClick={() => onMove('up')}
          className="bg-stone-800 hover:bg-stone-700 active:bg-amber-600 rounded-lg flex flex-col items-center justify-center border border-amber-900/50 shadow text-amber-200 font-bold"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-[9px]">2</span>
        </button>
        <div />

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => onMove('left')}
          className="bg-stone-800 hover:bg-stone-700 active:bg-amber-600 rounded-lg flex flex-col items-center justify-center border border-amber-900/50 shadow text-amber-200 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[9px]">4</span>
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="bg-amber-700 hover:bg-amber-600 active:scale-95 rounded-lg flex flex-col items-center justify-center border-2 border-amber-400 shadow text-stone-950 font-black"
        >
          <Check className="w-5 h-5" />
          <span className="text-[9px]">CHỌN (5)</span>
        </button>
        <button
          type="button"
          onClick={() => onMove('right')}
          className="bg-stone-800 hover:bg-stone-700 active:bg-amber-600 rounded-lg flex flex-col items-center justify-center border border-amber-900/50 shadow text-amber-200 font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-[9px]">6</span>
        </button>

        {/* Row 3 */}
        <div />
        <button
          type="button"
          onClick={() => onMove('down')}
          className="bg-stone-800 hover:bg-stone-700 active:bg-amber-600 rounded-lg flex flex-col items-center justify-center border border-amber-900/50 shadow text-amber-200 font-bold"
        >
          <ArrowDown className="w-4 h-4" />
          <span className="text-[9px]">8</span>
        </button>
        <div />
      </div>
    </div>
  );
};
