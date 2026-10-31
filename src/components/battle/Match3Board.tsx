/**
 * Loạn 12 Sứ Quân — Match-3 Board Component
 * 8x8 grid enclosed in an ornate Đông Sơn bronze drum frame with touch swipe & click support
 */

import React, { useState, useRef } from 'react';
import { Tile } from '../../types/game';
import { TileView } from './TileView';
import { GRID_ROWS, GRID_COLS, areAdjacent, BoardVfx } from '../../game/match3Engine';
import { soundEngine } from '../../services/audio';

interface Match3BoardProps {
  board: Tile[][];
  selectedCoord: { r: number; c: number } | null;
  onSelectTile: (r: number, c: number) => void;
  onSwapTiles: (r1: number, c1: number, r2: number, c2: number) => void;
  isInteractable: boolean;
  extraTurnAlert: boolean;
  comboAlert: number;
  isMyTurn?: boolean;
  gameMode?: string;
  vfxEvents?: BoardVfx[];
  clearingCoords?: { r: number; c: number }[];
}

export const Match3Board: React.FC<Match3BoardProps> = ({
  board,
  selectedCoord,
  onSelectTile,
  onSwapTiles,
  isInteractable,
  extraTurnAlert,
  comboAlert,
  isMyTurn = true,
  gameMode,
  vfxEvents = [],
  clearingCoords = [],
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
        soundEngine.playGemSlide();
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

        {/* Trạng thái lượt đi rõ ràng cho người chơi */}
        <div className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
          isMyTurn
            ? 'bg-amber-400 text-stone-950 ring-1 ring-white/60 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
            : gameMode === 'PVP_HOTSEAT'
            ? 'bg-rose-600 text-white ring-1 ring-white/60 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse'
            : 'bg-stone-900/90 text-stone-400 border border-stone-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isMyTurn
              ? 'bg-red-600 animate-ping'
              : gameMode === 'PVP_HOTSEAT'
              ? 'bg-yellow-300 animate-ping'
              : 'bg-stone-500'
          }`} />
          <span>{isMyTurn ? 'LƯỢT TA (HÃY XEM ĐÂY)' : 'LƯỢT ĐỊCH (ĐANG CHỜ)'}</span>
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
        className="relative w-full max-w-[412px] mx-auto grid grid-cols-8 gap-0.5 sm:gap-1 p-1 bg-stone-950/95 rounded-lg border-2 border-amber-800/90 shadow-inner touch-none overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {board.map((row, r) =>
          row.map((tile, c) => {
            const isSelected = selectedCoord?.r === r && selectedCoord?.c === c;
            const isNeighborHint =
              selectedCoord &&
              areAdjacent(selectedCoord.r, selectedCoord.c, r, c);
            const isClearing = clearingCoords.some((coord) => coord.r === r && coord.c === c);

            return (
              <TileView
                key={tile.id}
                tile={tile}
                isSelected={isSelected}
                isTargetHint={!!isNeighborHint}
                isClearing={isClearing}
                onClick={() => {
                  if (!isInteractable) return;
                  if (!selectedCoord) {
                    soundEngine.playGemSelect();
                    onSelectTile(r, c);
                  } else if (selectedCoord.r === r && selectedCoord.c === c) {
                    if (tile.special !== 'NORMAL') {
                      soundEngine.playGemSlide();
                      onSwapTiles(r, c, r, c);
                    } else {
                      onSelectTile(-1, -1); // Deselect
                    }
                  } else if (areAdjacent(selectedCoord.r, selectedCoord.c, r, c)) {
                    soundEngine.playGemSlide();
                    onSwapTiles(selectedCoord.r, selectedCoord.c, r, c);
                  } else {
                    soundEngine.playGemSelect();
                    onSelectTile(r, c); // Change selection
                  }
                }}
                onPointerDown={(e) => handlePointerDown(e, r, c)}
              />
            );
          })
        )}

        {/* LỚP PHỦ HIỆU ỨNG ĐỒ HỌA TRÊN BÀN CỜ (HIỆU ỨNG NỔ & TIA SÉT) */}
        {vfxEvents && vfxEvents.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {vfxEvents.map((vfx) => (
              <div
                key={vfx.id}
                className="absolute flex items-center justify-center pointer-events-none transition-all duration-500"
                style={{
                  top: `${vfx.r * 12.5}%`,
                  left: `${vfx.c * 12.5}%`,
                  width: '12.5%',
                  height: '12.5%',
                }}
              >
                {/* 1. HIỆU ỨNG SẤM SÉT (LIGHTNING) */}
                {vfx.type === 'lightning' && (
                  <div className="relative w-full h-full flex items-center justify-center animate-out fade-out duration-700">
                    {/* Vòng điện quang khuếch tán lan tỏa */}
                    <div className="absolute w-12 h-12 rounded-full border-2 border-cyan-300 bg-gradient-to-r from-cyan-400/70 via-sky-300/60 to-yellow-300/80 shadow-[0_0_20px_#38bdf8] animate-ping" />
                    {/* Tia sét quét chữ thập hàng ngang / dọc */}
                    <div className="absolute w-full h-1 bg-cyan-200 shadow-[0_0_10px_#38bdf8] animate-pulse" />
                    <div className="absolute h-full w-1 bg-yellow-200 shadow-[0_0_10px_#fde047] animate-pulse" />
                    {/* Biểu tượng tia chớp điện */}
                    <span className="relative z-10 text-xl sm:text-2xl text-yellow-300 drop-shadow-[0_0_12px_#38bdf8] animate-bounce">
                      ⚡
                    </span>
                    {/* Viền điện trường phát sáng */}
                    <div className="absolute inset-0.5 rounded-md ring-2 ring-cyan-400/90 shadow-[inset_0_0_8px_#38bdf8]" />
                  </div>
                )}

                {/* 2. HIỆU ỨNG NỔ (EXPLOSION) */}
                {vfx.type === 'explosion' && (
                  <div className="relative w-full h-full flex items-center justify-center animate-out fade-out duration-700">
                    {/* Vòng sóng xung kích lửa nổ lan tỏa */}
                    <div className="absolute w-12 h-12 rounded-full border-2 border-amber-300 bg-gradient-to-r from-yellow-400/80 via-orange-500/80 to-red-600/90 shadow-[0_0_22px_#f59e0b] animate-ping" />
                    {/* Tâm nổ hỏa diệm */}
                    <div className="absolute w-8 h-8 rounded-full bg-yellow-200/90 blur-[2px] animate-pulse" />
                    {/* Biểu tượng hỏa diệm bùng nổ */}
                    <span className="relative z-10 text-xl sm:text-2xl drop-shadow-[0_0_10px_#ef4444] animate-bounce">
                      💥
                    </span>
                    {/* Đốm tàn lửa bay */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_6px_#fbbf24] animate-ping" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316] animate-ping" />
                  </div>
                )}

                {/* 3. HIỆU ỨNG CHÉM KIẾM (SLASH) */}
                {vfx.type === 'slash' && (
                  <div className="relative w-full h-full flex items-center justify-center animate-out fade-out duration-500">
                    <div className="absolute w-12 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent rotate-45 shadow-[0_0_10px_#ef4444]" />
                    <div className="absolute w-8 h-8 rounded-full border border-red-500/60 animate-ping" />
                    <span className="relative z-10 text-base drop-shadow-[0_0_8px_#ef4444]">⚔️</span>
                  </div>
                )}

                {/* 4. HIỆU ỨNG PHÁT SÁNG TINH THỂ (BURST) */}
                {vfx.type === 'burst' && (
                  <div className="relative w-full h-full flex items-center justify-center animate-out fade-out duration-500">
                    <div className="absolute w-8 h-8 rounded-full border border-amber-300/70 shadow-[0_0_10px_#fbbf24] animate-ping" />
                    <span className="relative z-10 text-sm drop-shadow-[0_0_6px_#fbbf24]">✨</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
