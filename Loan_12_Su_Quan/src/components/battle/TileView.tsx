/**
 * Loạn 12 Sứ Quân — Match-3 Tile Component
 * Renders high-fidelity tiles matching the original Java/Ola aesthetics,
 * including the coveted Huyết Kiếm (Kiếm Đỏ Thẫm - x2 Sát thương & Xuyên giáp).
 */

import React from 'react';
import { Tile, TileType } from '../../types/game';

interface TileViewProps {
  tile: Tile;
  isSelected: boolean;
  isTargetHint?: boolean;
  onClick: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const TileView: React.FC<TileViewProps> = ({
  tile,
  isSelected,
  isTargetHint,
  onClick,
  onPointerDown,
}) => {
  const renderTileContent = (tile: Tile) => {
    switch (tile.type) {
      case 'SWORD':
        // Nếu là HUYẾT KIẾM (KIẾM ĐỎ THẪM) - Sát thương x2 & Xuyên 50% Giáp
        if (tile.isBloodSword) {
          return (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Vầng hào quang lửa đỏ ma mị */}
              <div className="absolute inset-1 rounded-full bg-red-600/30 blur-[2px] animate-pulse" />
              <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-[0_0_6px_#ef4444] transform -rotate-45">
                <defs>
                  <linearGradient id="bloodBlade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="30%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>
                </defs>
                {/* Lưỡi Huyết Kiếm đỏ rực */}
                <path d="M24 3 L29 10 L28 34 L24 39 L20 34 L19 10 Z" fill="url(#bloodBlade)" stroke="#f87171" strokeWidth="1.5" />
                {/* Rãnh sống kiếm rực lửa */}
                <line x1="24" y1="6" x2="24" y2="34" stroke="#fef08a" strokeWidth="1.2" />
                {/* Chắn tay vàng rực */}
                <rect x="14" y="34" width="20" height="4.5" rx="1.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                {/* Chuôi kiếm bọc da đen */}
                <rect x="22" y="38.5" width="4" height="8" rx="1" fill="#18181b" stroke="#71717a" strokeWidth="1" />
                <circle cx="24" cy="47" r="2.5" fill="#facc15" />
              </svg>
              {/* Tag Bạo Kích Nhỏ */}
              <span className="absolute bottom-0 right-0 text-[8px] font-black text-yellow-300 drop-shadow">
                x2
              </span>
            </div>
          );
        }

        // Đoản Kiếm Sắt thông thường - Chuôi đỏ, lưỡi thép bạc
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-md transform -rotate-45">
              {/* Lưỡi kiếm bạc */}
              <path d="M24 4 L28 10 L27 34 L24 38 L21 34 L20 10 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
              {/* Sống kiếm rãnh máu */}
              <line x1="24" y1="8" x2="24" y2="34" stroke="#94a3b8" strokeWidth="1" />
              {/* Chuôi kiếm & chắn tay */}
              <rect x="15" y="34" width="18" height="4" rx="1.5" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
              <rect x="22" y="38" width="4" height="8" rx="1" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
              <circle cx="24" cy="46" r="2.5" fill="#ca8a04" />
            </svg>
          </div>
        );

      case 'HEART':
        // Trái Tim Hồng Ngọc - Tươi sáng, hồi phục sinh lực
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-md">
              <defs>
                <radialGradient id="heartGrad" cx="35%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#fda4af" />
                  <stop offset="40%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#9f1239" />
                </radialGradient>
              </defs>
              <path
                d="M24 40 C14 30 6 22 6 15 C6 9 10 5 16 5 C20 5 23 8 24 10 C25 8 28 5 32 5 C38 5 42 9 42 15 C42 22 34 30 24 40 Z"
                fill="url(#heartGrad)"
                stroke="#ffe4e6"
                strokeWidth="1.2"
              />
              <ellipse cx="16" cy="12" rx="4" ry="2.5" fill="#ffffff" opacity="0.6" transform="rotate(-30 16 12)" />
            </svg>
          </div>
        );

      case 'GOLD':
        // Thỏi Vàng Đĩnh Kim Bảo Cổ Truyền
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-md">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
              </defs>
              <ellipse cx="24" cy="20" rx="14" ry="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <path
                d="M10 20 C10 32 16 38 24 38 C32 38 38 32 38 20 C36 28 30 32 24 32 C18 32 12 28 10 20 Z"
                fill="url(#goldGrad)"
                stroke="#ca8a04"
                strokeWidth="1.2"
              />
              <circle cx="24" cy="20" r="5" fill="#fef08a" opacity="0.9" />
            </svg>
          </div>
        );

      case 'CHUNG_CAKE':
        // Bánh Chưng Xanh Lạt Chéo - Tăng Giáp / Thể Lực (Thanh xanh lá)
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-md">
              <rect x="8" y="8" width="32" height="32" rx="4" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
              <rect x="11" y="11" width="26" height="26" rx="2" fill="#22c55e" opacity="0.8" />
              <line x1="8" y1="24" x2="40" y2="24" stroke="#fef08a" strokeWidth="2.5" />
              <line x1="24" y1="8" x2="24" y2="40" stroke="#fef08a" strokeWidth="2.5" />
              <line x1="12" y1="12" x2="36" y2="36" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3,2" />
              <line x1="36" y1="12" x2="12" y2="36" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3,2" />
            </svg>
          </div>
        );

      case 'YIN_YANG':
        // Ngọc Âm Dương Thái Cực - Tích Nộ Tuyệt Kỹ (Thanh xanh lam)
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-md">
              <circle cx="24" cy="24" r="18" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.2" />
              <path d="M24 6 A18 18 0 0 0 24 42 A9 9 0 0 1 24 24 A9 9 0 0 0 24 6 Z" fill="#ef4444" />
              <circle cx="24" cy="15" r="3.5" fill="#3b82f6" />
              <circle cx="24" cy="33" r="3.5" fill="#ef4444" />
              <circle cx="24" cy="24" r="18" fill="none" stroke="#dbeafe" strokeWidth="1.2" opacity="0.6" />
            </svg>
          </div>
        );

      case 'ELIXIR':
        // Túi Gấm / Dược Liệu Tím Nạm Vàng
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-md">
              <path
                d="M24 14 C16 14 12 22 12 30 C12 36 17 40 24 40 C31 40 36 36 36 30 C36 22 32 14 24 14 Z"
                fill="#8b5cf6"
                stroke="#a78bfa"
                strokeWidth="1.2"
              />
              <path d="M19 12 L29 12 L31 8 L17 8 Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
              <ellipse cx="24" cy="14" rx="7" ry="2.5" fill="#facc15" />
              <circle cx="24" cy="14" r="2.5" fill="#dc2626" />
              <circle cx="24" cy="27" r="4" fill="#c084fc" opacity="0.6" />
            </svg>
          </div>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`relative w-full aspect-square rounded-md flex items-center justify-center transition-all duration-150 select-none cursor-pointer ${
        isSelected
          ? 'ring-3 ring-amber-400 bg-amber-950/70 scale-105 z-10 shadow-lg shadow-amber-500/40'
          : isTargetHint
          ? 'bg-stone-800/80 ring-2 ring-emerald-400/80'
          : tile.isBloodSword
          ? 'bg-red-950/60 ring-1 ring-red-500/80 hover:bg-red-900/70'
          : 'bg-stone-900/70 hover:bg-stone-800/80 active:scale-95'
      } border ${tile.isBloodSword ? 'border-red-600/80' : 'border-stone-800/80'}`}
      aria-label={`Ô ${tile.isBloodSword ? 'Huyết Kiếm' : tile.type} hàng ${tile.row + 1} cột ${tile.col + 1}`}
    >
      {renderTileContent(tile)}

      {/* Hiệu ứng ngọc đặc biệt */}
      {tile.special === 'BOMB_4' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow ring-1 ring-white">
          💣
        </span>
      )}
      {tile.special === 'LIGHTNING_5' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[9px] font-bold text-black shadow ring-1 ring-white animate-pulse">
          ⚡
        </span>
      )}
    </button>
  );
};
