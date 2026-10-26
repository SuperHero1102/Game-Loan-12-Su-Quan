/**
 * Loạn 12 Sứ Quân — Chibi Character Visual Component
 * Renders expressive Chibi heroes and warlords inspired by Ola Java classic art
 * with rich combat animations: sword slash, hurt reaction, heal aura, and shield barrier.
 */

import React from 'react';
import { FighterState } from '../../types/game';

interface ChibiCharacterProps {
  fighter: FighterState;
  isFacingRight?: boolean;
}

export const ChibiCharacter: React.FC<ChibiCharacterProps> = ({
  fighter,
  isFacingRight = true,
}) => {
  const isAttacking = fighter.status === 'attacking';
  const isHurt = fighter.status === 'hurt';
  const isHealing = fighter.status === 'heal';
  const isShielding = fighter.status === 'shield';
  const isSkill = fighter.status === 'skill';

  return (
    <div className={`relative flex flex-col items-center select-none transition-all duration-200 ${
      isAttacking ? (isFacingRight ? 'translate-x-10 scale-110' : '-translate-x-10 scale-110') :
      isHurt ? (isFacingRight ? '-translate-x-4 rotate-6' : 'translate-x-4 -rotate-6') :
      'translate-y-0'
    }`}>
      {/* HIỆU ỨNG HÀO QUANG KHI HỒI MÁU (HEAL AURA) */}
      {isHealing && (
        <div className="absolute -inset-3 rounded-full bg-emerald-400/30 blur-md animate-pulse z-0 pointer-events-none" />
      )}

      {/* HIỆU ỨNG KHIÊN ĐỒNG PHÒNG THỦ (SHIELD BARRIER) */}
      {(isShielding || fighter.armor > 40) && (
        <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_12px_rgba(34,197,94,0.4)] animate-pulse z-0 pointer-events-none" />
      )}

      {/* HIỆU ỨNG TÍCH NỘ ĐẠI CHIÊU (SKILL FLAMES) */}
      {isSkill && (
        <div className="absolute -inset-4 rounded-full bg-gradient-to-t from-red-600/40 via-amber-500/30 to-yellow-400/40 blur-lg animate-ping z-0 pointer-events-none" />
      )}

      {/* CHIBI SVG CHARACTER BODY */}
      <div 
        className={`relative w-20 h-24 sm:w-24 sm:h-28 transition-transform duration-150 ${
          isHurt ? 'filter brightness-150 contrast-125' : ''
        } ${!isFacingRight ? 'transform -scale-x-100' : ''}`}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            {/* Đổ bóng & kim loại */}
            <linearGradient id="bronzeArmor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="capeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
          </defs>

          {/* 1. ÁO CHOÀNG PHÍA SAU (CAPE) */}
          <path
            d="M25 45 Q 10 80 15 105 Q 45 108 55 95 Q 40 70 45 45 Z"
            fill="url(#capeGrad)"
            stroke="#991b1b"
            strokeWidth="1.5"
            className={isAttacking ? 'animate-pulse' : ''}
          />

          {/* 2. CHÂN & BỐT CHIẾN ĐỒNG */}
          <rect x="32" y="85" width="12" height="22" rx="4" fill="#3f3f46" stroke="#18181b" strokeWidth="1.5" />
          <rect x="52" y="85" width="12" height="22" rx="4" fill="#3f3f46" stroke="#18181b" strokeWidth="1.5" />
          <ellipse cx="38" cy="107" rx="7" ry="3.5" fill="#71717a" />
          <ellipse cx="58" cy="107" rx="7" ry="3.5" fill="#71717a" />

          {/* 3. THÂN & GIÁP NGỰC KIM BÀI ĐÔNG SƠN */}
          <rect x="30" y="50" width="36" height="38" rx="8" fill="url(#bronzeArmor)" stroke="#854d0e" strokeWidth="2" />
          {/* Họa tiết chim Lạc / mặt trời trên giáp */}
          <circle cx="48" cy="68" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
          <circle cx="48" cy="68" r="3" fill="#dc2626" />
          {/* Thắt lưng ngọc */}
          <rect x="28" y="78" width="40" height="6" rx="2" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
          <circle cx="48" cy="81" r="3" fill="#facc15" />

          {/* 4. ĐẦU CHIBI VÀ KHUÔN MẶT */}
          {/* Tóc sau */}
          <path d="M22 25 C15 45 20 65 30 65 L66 65 C76 65 81 45 74 25 Z" fill="#18181b" />

          {/* Mặt tròn Chibi */}
          <circle cx="48" cy="36" r="24" fill={isHurt ? '#fecaca' : '#fde047'} stroke="#ca8a04" strokeWidth="1.5" />

          {/* Mái tóc trước & Tóc mai */}
          <path d="M26 28 Q 38 12 55 18 Q 72 24 70 32 Q 58 26 46 28 Q 36 30 26 28 Z" fill="#18181b" />

          {/* KHĂN BUỘC ĐẦU HOÀNG GIA / DẢI LỤA ĐỎ */}
          <path d="M24 24 Q 48 18 72 24 L74 30 Q 48 24 22 30 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          {/* Dải lụa bay phấp phới phía sau */}
          <path d="M24 26 Q 10 32 4 45 Q 12 40 22 32 Z" fill="#dc2626" />
          <path d="M24 28 Q 12 38 8 52 Q 16 44 24 34 Z" fill="#b91c1c" />

          {/* ĐẶC ĐIỂM RIÊNG CỦA TỪNG LOẠI TƯỚNG */}
          {fighter.characterVisual === 'warlord_bearded' && (
            /* Râu quai nón rậm rạp của Đỗ Cảnh Thạc / Lữ Đường */
            <path d="M34 46 Q 48 60 62 46 Q 58 54 48 56 Q 38 54 34 46 Z" fill="#27272a" />
          )}

          {/* MẮT CHIBI BIỂU CẢM */}
          {isHurt ? (
            /* Nhắm tịt mắt đau đớn (X X) */
            <g stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="36" y1="32" x2="44" y2="40" />
              <line x1="44" y1="32" x2="36" y2="40" />
              <line x1="52" y1="32" x2="60" y2="40" />
              <line x1="60" y1="32" x2="52" y2="40" />
            </g>
          ) : (
            /* Mắt to sáng ngời dũng mãnh */
            <g>
              {/* Lông mày quyết đoán */}
              <line x1="34" y1="28" x2="44" y2="31" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="62" y1="28" x2="52" y2="31" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
              {/* Tròng mắt */}
              <circle cx="39" cy="36" r="4.5" fill="#18181b" />
              <circle cx="57" cy="36" r="4.5" fill="#18181b" />
              {/* Điểm sáng trong mắt */}
              <circle cx="40.5" cy="34.5" r="1.8" fill="#ffffff" />
              <circle cx="58.5" cy="34.5" r="1.8" fill="#ffffff" />
            </g>
          )}

          {/* Miệng mỉm cười quyết thắng */}
          <path d="M44 45 Q 48 48 52 45" fill="none" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />

          {/* 5. TAY & VŨ KHÍ (BẢO KIẾM / ĐẠI ĐAO) */}
          <g className={isAttacking ? 'animate-bounce' : ''}>
            {/* Cánh tay cầm kiếm */}
            <rect x="64" y="55" width="10" height="20" rx="4" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" transform="rotate(-25 64 55)" />
            {/* Lưỡi kiếm thép ánh bạc rực rỡ */}
            <path
              d="M72 40 L96 15 L98 20 L76 46 Z"
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Sống kiếm rãnh xanh phát sáng */}
            <line x1="74" y1="38" x2="94" y2="18" stroke="#38bdf8" strokeWidth="1.2" />
            {/* Chuôi kiếm & tua đỏ */}
            <circle cx="70" cy="44" r="3.5" fill="#ca8a04" />
            <path d="M68 47 Q 66 58 70 65" fill="none" stroke="#dc2626" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* TIA SÁNG ĐAO KIẾM KHI VUNG ĐÒN (SWORD WAVE ARC) */}
      {isAttacking && (
        <div className={`absolute top-4 ${isFacingRight ? '-right-6' : '-left-6'} pointer-events-none z-20`}>
          <svg viewBox="0 0 60 60" className="w-16 h-16 animate-ping">
            <path
              d="M10 50 Q 30 10 50 10"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="6"
              strokeLinecap="round"
              className="drop-shadow-[0_0_10px_#38bdf8]"
            />
          </svg>
        </div>
      )}

      {/* TIA LỬA BẮN RA KHI DÍNH ĐÒN (SPARKS) */}
      {isHurt && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <span className="text-xl animate-ping">💥</span>
        </div>
      )}

      {/* BÓNG ĐỔ DƯỚI CHÂN */}
      <div className="w-16 h-3 bg-black/50 rounded-full blur-[1.5px] mt-0.5" />
    </div>
  );
};
