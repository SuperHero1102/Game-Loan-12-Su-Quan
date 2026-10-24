/**
 * Loạn 12 Sứ Quân — Match-3 Board Component
 * 8x8 grid enclosed in an ornate Đông Sơn bronze drum frame with touch swipe & click support
 */

import React, { useState, useRef } from 'react';
import { Tile } from '../../types/game';
import { TileView } from './TileView';
import { GRID_ROWS, GRID_COLS, areAdjacent } from '../../game/match3Engine';

interface Match3BoardProps {
  board: Tile[][];
  selectedCoord: { r: number; c: number } | null;
  onSelectTile: (r: number, c: number) => void;
  onSwapTiles: (r1: number, c1: number, r2: number, c2: number) => void;
  isInteractable: boolean;
  extraTurnAlert: boolean;
  comboAlert: number;
}

export const Match3Board: React.FC<Match3BoardProps> = ({
  board,
  selectedCoord,
  onSelectTile,
  onSwapTiles,
  isInteractable,
  extraTurnAlert,
  comboAlert,
}) => {
  const touchStartRef = useRef<{ x: number; y: number; r: number; c: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, r: number, c: number) => {
    if (!isInteractable) return;
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      r,
      c,
    };
  };

  const handlePointerUpOrMove = (e: React.PointerEvent) => {
    if (!touchStartRef.current || !isInteractable) return;

    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    // If swipe distance exceeds 20px, calculate direction and swap!
    if (dist > 22) {
      const { r, c } = touchStartRef.current;
      touchStartRef.current = null; // Consume swipe

      let targetR = r;
      let targetC = c;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        targetC = dx > 0 ? c + 1 : c - 1;
      } else {
        // Vertical swipe
        targetR = dy > 0 ? r + 1 : r - 1;
      }

      if (
        targetR >= 0 &&
        targetR < GRID_ROWS &&
        targetC >= 0 &&
        targetC < GRID_COLS &&
        areAdjacent(r, c, targetR, targetC)
      ) {
        onSwapTiles(r, c, targetR, targetC);
      }
    }
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto px-1.5 py-1 bg-gradient-to-b from-amber-950 via-[#2b1407] to-amber-950 border-2 border-amber-500/85 rounded-xl shadow-2xl select-none"
      onPointerUp={() => { touchStartRef.current = null; }}
      onPointerMove={handlePointerUpOrMove}
    >
      {/* Khung Mắt Rồng & Họa Tiết Trống Đồng Cổ Điển Trên Đỉnh Bàn Cờ */}
      <div className="w-full flex items-center justify-between px-2.5 py-0.5 mb-1 bg-amber-900/85 border border-yellow-400/70 rounded-md">
        {/* Mắt Rồng Trái */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444] animate-pulse" />
          <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest">ĐÔNG SƠN</span>
        </div>

        {/* Họa tiết mặt trời 14 tia */}
        <div className="w-3.5 h-3.5 rounded-full border border-amber-500/80 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>

        {/* Mắt Rồng Phải */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest">HOA LƯ</span>
          <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444] animate-pulse" />
        </div>
      </div>

      {/* Thông Báo Thêm Lượt / Combo Nổi Bật */}
      {extraTurnAlert && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center z-40 pointer-events-none">
          <div className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-lg shadow-2xl ring-4 ring-white animate-bounce uppercase tracking-wider">
            ⚡ THÊM LƯỢT ĐÁNH!
          </div>
        </div>
      )}

      {comboAlert > 1 && (
        <div className="absolute top-10 right-4 z-40 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-lg animate-ping">
            COMBO x{comboAlert}!
          </div>
        </div>
      )}

      {/* Lưới 8x8 Ô Ngọc */}
      <div 
        className="w-full max-w-[412px] mx-auto grid grid-cols-8 gap-0.5 sm:gap-1 p-1 bg-stone-950/95 rounded-lg border-2 border-amber-800/90 shadow-inner touch-none"
        style={{ touchAction: 'none' }}
      >
        {board.map((row, r) =>
          row.map((tile, c) => {
            const isSelected = selectedCoord?.r === r && selectedCoord?.c === c;
            const isNeighborHint =
              selectedCoord &&
              areAdjacent(selectedCoord.r, selectedCoord.c, r, c);

            return (
              <TileView
                key={tile.id}
                tile={tile}
                isSelected={isSelected}
                isTargetHint={!!isNeighborHint}
                onClick={() => {
                  if (!isInteractable) return;
                  if (!selectedCoord) {
                    onSelectTile(r, c);
                  } else if (selectedCoord.r === r && selectedCoord.c === c) {
                    onSelectTile(-1, -1); // Deselect
                  } else if (areAdjacent(selectedCoord.r, selectedCoord.c, r, c)) {
                    onSwapTiles(selectedCoord.r, selectedCoord.c, r, c);
                  } else {
                    onSelectTile(r, c); // Change selection
                  }
                }}
                onPointerDown={(e) => handlePointerDown(e, r, c)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
