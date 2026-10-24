/**
 * Loạn 12 Sứ Quân — Kẻ Địch / Đại Côn Đồ / Sứ Quân Chibi (Warlord Enemy)
 * Tái hiện chuẩn xác theo hình ảnh tham khảo 2 (quấn khăn vàng, mắt xếch giận dữ, lăm lăm đại đao bản rộng)
 */

import React from 'react';
import { FighterState } from '../../types/game';

interface WarlordEnemyProps {
  fighter: FighterState;
  isFacingRight?: boolean;
}

export const WarlordEnemy: React.FC<WarlordEnemyProps> = ({
  fighter,
  isFacingRight = false,
}) => {
  const isAttacking = fighter.status === 'attacking';
  const isHurt = fighter.status === 'hurt';
  const isSkill = fighter.status === 'skill';

  return (
    <div className={`relative flex flex-col items-center select-none transition-all duration-200 ${
      isAttacking ? '-translate-x-12 scale-110' :
      isHurt ? 'translate-x-5 -rotate-6 filter brightness-150' :
      'translate-y-0'
    } ${!isFacingRight ? '' : 'transform -scale-x-100'}`}>
      {/* VÒNG NĂNG LƯỢNG KHI TUNG CHIÊU */}
      {isSkill && (
        <div className="absolute -inset-4 rounded-full bg-red-600/40 blur-lg animate-ping z-0 pointer-events-none" />
      )}

      {/* SVG ĐẠI CÔN ĐỒ / SỨ QUÂN (CHUẨN ẢNH 2) */}
      <div className="relative w-24 h-28 sm:w-28 sm:h-32">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            <linearGradient id="enemyBlade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="yellowRobe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* 1. CHÂN & BỐT CHIẾN */}
          <rect x="34" y="86" width="10" height="22" rx="3" fill="#18181b" />
          <rect x="52" y="86" width="10" height="22" rx="3" fill="#18181b" />
          <ellipse cx="39" cy="108" rx="6" ry="3" fill="#3f3f46" />
          <ellipse cx="57" cy="108" rx="6" ry="3" fill="#3f3f46" />

          {/* 2. THÂN & ÁO BÀO VÀNG SƠN TẶC (NHƯ ẢNH 2) */}
          <rect x="30" y="52" width="36" height="36" rx="6" fill="url(#yellowRobe)" stroke="#a16207" strokeWidth="1.5" />
          {/* Thắt lưng đen */}
          <rect x="28" y="74" width="40" height="6" rx="2" fill="#18181b" />
          <circle cx="48" cy="77" r="2.5" fill="#facc15" />

          {/* 3. ĐẦU CHIBI ĐỐI THỦ */}
          <circle cx="48" cy="36" r="20" fill={isHurt ? '#fecaca' : '#fde047'} stroke="#ca8a04" strokeWidth="1.5" />

          {/* KHĂN VÀNG QUẤN ĐẦU SƠN TẶC / SỨ QUÂN (NHƯ ẢNH 2) */}
          <path d="M26 30 C 26 12 70 12 70 30 L 72 36 L 24 36 Z" fill="url(#yellowRobe)" stroke="#a16207" strokeWidth="1.2" />
          {/* Nút thắt khăn buông thõng */}
          <path d="M68 32 Q 78 38 80 50 Q 74 44 68 36 Z" fill="#eab308" />

          {/* MẮT XẾCH GIẬN DỮ & VẾT SẸO / MẶT NẠ (NHƯ ẢNH 2) */}
          {isHurt ? (
            <g stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="36" y1="34" x2="44" y2="42" />
              <line x1="44" y1="34" x2="36" y2="42" />
              <line x1="52" y1="34" x2="60" y2="42" />
              <line x1="60" y1="34" x2="52" y2="42" />
            </g>
          ) : (
            <g>
              {/* Lông mày xếch ngược dữ tợn */}
              <line x1="34" y1="31" x2="44" y2="34" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="62" y1="31" x2="52" y2="34" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Mắt trái với vệt đỏ */}
              <circle cx="39" cy="37" r="3.5" fill="#dc2626" />
              <circle cx="39" cy="37" r="1.5" fill="#18181b" />

              {/* Mắt phải hung hãn */}
              <circle cx="57" cy="37" r="3.5" fill="#18181b" />
              <circle cx="58" cy="36" r="1.2" fill="#ffffff" />

              {/* Miệng cười nham hiểm / nghiến răng (như ảnh 2) */}
              <path d="M42 46 Q 48 50 54 46" fill="none" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
              <line x1="48" y1="46" x2="48" y2="49" stroke="#7f1d1d" strokeWidth="1.2" />
            </g>
          )}

          {/* 4. TAY LĂM LĂM ĐẠI ĐAO BẢN RỘNG (NHƯ ẢNH 2) */}
          <g className={isAttacking ? 'animate-bounce' : ''}>
            <rect x="22" y="56" width="10" height="18" rx="4" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(35 22 56)" />
            {/* Chuôi đao đỏ */}
            <rect x="12" y="66" width="8" height="4" rx="1" fill="#dc2626" />
            
            {/* LƯỠI ĐẠI ĐAO BẢN RỘNG SẮC BÉN */}
            <path
              d="M12 68 L -18 52 Q -22 65 -15 78 L 10 74 Z"
              fill="url(#enemyBlade)"
              stroke="#334155"
              strokeWidth="1.5"
              className="filter drop-shadow-[0_0_6px_rgba(148,163,184,0.6)]"
            />
            {/* Lỗ khuyên trên sống đao */}
            <circle cx="-10" cy="58" r="2" fill="#1e293b" />
            <circle cx="-4" cy="62" r="2" fill="#1e293b" />
          </g>
        </svg>
      </div>

      {/* TIA LỬA BẮN RA KHI TRÚNG ĐÒN */}
      {isHurt && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <span className="text-xl animate-ping">💥</span>
        </div>
      )}

      {/* BÓNG ĐỔ DƯỚI ĐẤT */}
      <div className="w-20 h-3.5 bg-black/50 rounded-full blur-[2px] mt-0.5" />
    </div>
  );
};
