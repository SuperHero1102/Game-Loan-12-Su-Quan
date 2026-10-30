/**
 * Loạn 12 Sứ Quân — Mô Hình Tướng Lĩnh & Linh Thú 3D Chiến Đấu (CombatGeneralRig)
 * Sử dụng trực tiếp tạo hình 3D gốc sắc nét của 13 Tướng Lĩnh cưỡi Linh Thú (portrait3D)
 * kết hợp:
 * - Chuyển động Linh Thú phi nước đại (animate-mount-gallop + bụi tung dưới vó thú) khi xung trận
 * - Chuyển động Thân trên & Tay cầm vũ khí trong ảnh 3D bổ xuống (animate-rider-chop)
 * - Binh khí 3D (Kiếm lệnh Hoàng Đế, Đại đao, Song kích, Thần cung, Thiết chùy) vung chém trực diện vào tướng đối phương
 * - Hiệu ứng Trúng đòn: Tóe máu đỏ tươi + tia lửa va chạm + tiếng kêu "Ựa! 🩸"
 * - Hiệu ứng Ăn Máu / Giáp / Mana & Thắng ("Ha ha! Toàn thắng! 🏆") / Bại ("🏳️ Ta xin hàng!")
 */

import React from 'react';
import { FighterState, Warlord, WeaponVisualType } from '../../types/game';
import { ALL_CHARACTERS } from '../../data/warlords';

interface CombatGeneralRigProps {
  fighter?: FighterState;
  warlord?: Warlord;
  status?: FighterState['status'];
  isFacingRight?: boolean;
  className?: string;
}

export const CombatGeneralRig: React.FC<CombatGeneralRigProps> = ({
  fighter,
  warlord,
  status: propStatus,
  isFacingRight = true,
  className = '',
}) => {
  const id = fighter?.id || warlord?.id || 'dinh_bo_linh';
  const matchedWarlord = ALL_CHARACTERS.find((w) => w.id === id) || ALL_CHARACTERS[0];

  const name = fighter?.name || warlord?.name || matchedWarlord.name;
  const portrait3D =
    fighter?.portrait3D || warlord?.portrait3D || matchedWarlord.portrait3D || '/assets/aistudio/IMG_2711_a7aea1e8.png';
  const weaponVisual: WeaponVisualType =
    fighter?.weaponVisual || warlord?.weaponVisual || matchedWarlord.weaponVisual || 'imperial_sword';
  const status: FighterState['status'] = propStatus || fighter?.status || 'idle';

  const isAttacking = status === 'attacking';
  const isSkill = status === 'skill';
  const isHurt = status === 'hurt';
  const isHealing = status === 'heal';
  const isShielding = status === 'shield';
  const isMana = status === 'mana';
  const isVictory = status === 'victory';
  const isDefeat = status === 'defeat';

  const isCharging = isAttacking || isSkill;
  const isEmperor = id === 'dinh_tien_hoang';
  const isFullCardAsset = portrait3D.includes('IMG_271') || portrait3D.includes('image_15aa223a') || isEmperor;

  // Bong bóng lời thoại trực tiếp trên đầu tướng ("Ựa!", "Ha ha! Toàn thắng!", "Ta xin hàng!")
  const renderSpeechBubble = () => {
    if (isHurt) {
      return (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-50 px-2.5 py-0.5 rounded-full bg-red-600 border-2 border-yellow-200 text-white font-black text-xs shadow-[0_4px_12px_rgba(220,38,38,0.95)] animate-bounce whitespace-nowrap">
          Ựa! 🩸
        </div>
      );
    }
    if (isVictory) {
      return (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-white text-stone-950 font-black text-xs shadow-[0_0_20px_rgba(250,204,21,0.95)] animate-bounce whitespace-nowrap">
          Ha ha! Toàn thắng! 🏆
        </div>
      );
    }
    if (isDefeat) {
      return (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full bg-stone-200 border-2 border-stone-500 text-stone-900 font-black text-xs shadow-lg animate-pulse whitespace-nowrap">
          🏳️ Ta xin hàng!
        </div>
      );
    }
    return null;
  };

  // Lớp Vũ Khí 3D Vung Chém Trực Diện Tác Động Vào Tướng Đối Phương
  const render3DWeaponStrikeEffect = () => {
    if (!isCharging) return null;

    return (
      <div
        className={`absolute inset-0 z-40 pointer-events-none flex items-center justify-center overflow-visible ${
          !isFacingRight ? '-scale-x-100' : ''
        }`}
      >
        <svg
          viewBox="0 0 200 180"
          className="w-48 h-44 sm:w-56 sm:h-52 overflow-visible animate-weapon-slash"
          style={{ transformOrigin: '38% 58%' }}
        >
          <defs>
            <linearGradient id="bladeFire3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="hiltGold3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {weaponVisual === 'divine_bow' ? (
            /* Thần Cung Giương Lên & Loạt Tên Đồng Rực Lửa Bắn Xuyên Đối Phương */
            <g>
              <path
                d="M 82 28 Q 116 78 82 128"
                fill="none"
                stroke="url(#hiltGold3D)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line x1="82" y1="28" x2="82" y2="128" stroke="#fef08a" strokeWidth="1.5" />
              <line x1="70" y1="55" x2="192" y2="38" stroke="#fef08a" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="195,37 178,31 181,45" fill="#f97316" />
              <line x1="75" y1="78" x2="198" y2="78" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
              <polygon points="200,78 183,71 183,85" fill="#ef4444" />
              <line x1="70" y1="102" x2="192" y2="118" stroke="#fef08a" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="195,119 181,111 178,125" fill="#f97316" />
            </g>
          ) : weaponVisual === 'iron_mace' || weaponVisual === 'battle_axe' ? (
            /* Thiết Chùy Phá Thành / Rìu Chiến Song Diện Bổ Mạnh Vào Đối Phương */
            <g>
              <line x1="58" y1="98" x2="148" y2="26" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
              <circle cx="152" cy="22" r="18" fill="#334155" stroke="#facc15" strokeWidth="3" />
              <polygon points="152,-2 156,6 148,6" fill="#fef08a" />
              <polygon points="176,22 168,26 168,18" fill="#fef08a" />
              <polygon points="168,6 160,12 164,16" fill="#fef08a" />
              <path
                d="M 95 10 Q 185 55 162 152"
                fill="none"
                stroke="url(#bladeFire3D)"
                strokeWidth="15"
                strokeLinecap="round"
              />
            </g>
          ) : weaponVisual === 'twin_halberds' ||
            weaponVisual === 'bronze_spear' ||
            weaponVisual === 'steel_pike' ||
            weaponVisual === 'lance_shield' ? (
            /* Trường Thương / Song Kích Đâm Xuyên Giáp Đối Phương */
            <g>
              <line x1="48" y1="102" x2="165" y2="18" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
              <circle cx="142" cy="34" r="6" fill="#dc2626" />
              <polygon points="165,18 192,-2 174,30 154,26" fill="url(#bladeFire3D)" stroke="#fef08a" strokeWidth="2" />
              <path
                d="M 92 14 Q 186 64 152 154"
                fill="none"
                stroke="url(#bladeFire3D)"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </g>
          ) : (
            /* Kiếm Lệnh Hoàng Đế (Đinh Bộ Lĩnh) / Đại Đao Trảm Mã Vung Chém Rực Lửa */
            <g>
              {/* Chuôi Kiếm Rồng Vàng */}
              <line x1="58" y1="96" x2="82" y2="74" stroke="url(#hiltGold3D)" strokeWidth="6" strokeLinecap="round" />
              <ellipse
                cx="82"
                cy="74"
                rx="9"
                ry="4.5"
                fill="#facc15"
                stroke="#78350f"
                strokeWidth="1.5"
                transform="rotate(-38 82 74)"
              />
              {/* Thân Kiếm Lệnh / Đại Đao Lửa vung chém tới đối phương */}
              <path
                d="M 82 74 Q 128 36 176 4 Q 184 22 146 58 Q 112 82 82 74 Z"
                fill="url(#bladeFire3D)"
                stroke="#fef08a"
                strokeWidth="2.5"
              />
              <path d="M 90 66 Q 132 34 166 12" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              {/* Sóng Kiếm Khí Hoàng Đế quét dọc thân đối phương */}
              <path
                d="M 92 8 Q 190 62 152 158"
                fill="none"
                stroke="url(#bladeFire3D)"
                strokeWidth={isSkill ? '18' : '13'}
                strokeLinecap="round"
              />
              <path
                d="M 106 18 Q 196 68 162 148"
                fill="none"
                stroke="#ffffff"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-end overflow-visible ${className}`}
      title={name}
      style={{ perspective: '900px' }}
    >
      {/* Bong bóng thoại biểu cảm trực tiếp */}
      {renderSpeechBubble()}

      {/* 1. HIỆU ỨNG ĂN MÁU (HỒI PHỤC SINH LỰC) */}
      {isHealing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="w-32 h-32 rounded-full bg-emerald-400/25 border-2 border-emerald-300/90 animate-ping" />
          <div className="absolute -top-3 text-emerald-300 font-black text-xs animate-bounce drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            💚 HỒI MÁU
          </div>
        </div>
      )}

      {/* 2. HIỆU ỨNG ĂN BÁNH CHƯNG (KHIÊN KIM CANG HỘ THỂ) */}
      {isShielding && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.9)] animate-pulse flex items-center justify-center">
            <span className="text-2xl drop-shadow">🛡️</span>
          </div>
        </div>
      )}

      {/* 3. HIỆU ỨNG ĂN NGỌC THÁI CỰC (TỤ NỘ KHÍ MANA) */}
      {isMana && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="w-32 h-32 rounded-full border-4 border-dashed border-sky-400 bg-sky-500/20 animate-spin" />
        </div>
      )}

      {/* 4. HIỆU ỨNG TÓE MÁU ĐỎ & TIA LỬA KHI BỊ CHÉM TRÚNG */}
      {isHurt && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-visible">
          <svg viewBox="0 0 160 160" className="w-40 h-40 animate-blood-burst overflow-visible">
            <circle cx="80" cy="75" r="15" fill="#dc2626" opacity="0.92" />
            <circle cx="50" cy="52" r="7.5" fill="#ef4444" />
            <circle cx="112" cy="46" r="8.5" fill="#b91c1c" />
            <circle cx="42" cy="88" r="6.5" fill="#dc2626" />
            <circle cx="118" cy="94" r="8" fill="#ef4444" />
            <path
              d="M 80 75 L 38 38 M 80 75 L 124 36 M 80 75 L 130 86 M 80 75 L 34 96"
              stroke="#ef4444"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <polygon points="80,44 86,68 110,75 86,82 80,106 74,82 50,75 74,68" fill="#fef08a" />
          </svg>
        </div>
      )}

      {/* 5. KHÓI BỤI & TIA LỬA DƯỚI VÓ LINH THÚ KHI PHI NƯỚC ĐẠI */}
      {isCharging && (
        <div
          className={`absolute bottom-1 ${
            isFacingRight ? '-left-6' : '-right-6'
          } flex items-center gap-1 pointer-events-none z-30`}
        >
          <div className="w-6 h-6 rounded-full bg-amber-400/50 blur-[2px] animate-hoof-dust" />
          <div
            className="w-8 h-5 rounded-full bg-stone-400/60 blur-[3px] animate-hoof-dust"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-5 h-5 rounded-full bg-yellow-300/70 blur-[1px] animate-hoof-dust"
            style={{ animationDelay: '0.18s' }}
          />
        </div>
      )}

      {/* 6. VŨ KHÍ & KIẾM KHÍ 3D VUNG CHÉM TRỰC DIỆN VÀO TƯỚNG ĐỐI PHƯƠNG */}
      {render3DWeaponStrikeEffect()}

      {/* 7. TẠO HÌNH NHÂN VẬT & LINH THÚ 3D GỐC (PORTRAIT 3D) VỚI CHUYỂN ĐỘNG PHI THÚ & BỔ VŨ KHÍ */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${
          isCharging
            ? 'animate-mount-gallop'
            : isVictory
            ? 'animate-bounce'
            : 'animate-rider-breathe'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isHurt
            ? `${isFacingRight ? 'rotate(-10deg)' : 'rotate(10deg)'} scale(0.92)`
            : isDefeat
            ? `${isFacingRight ? 'rotate(12deg)' : 'rotate(-12deg)'} translateY(6px) scale(0.88)`
            : 'none',
          filter: isHurt
            ? 'brightness(1.45) saturate(1.9) drop-shadow(0 0 18px rgba(239,68,68,0.95))'
            : isDefeat
            ? 'grayscale(0.75) brightness(0.7)'
            : isSkill
            ? 'brightness(1.22) contrast(1.14) drop-shadow(0 0 22px rgba(250,204,21,0.98))'
            : isAttacking
            ? 'brightness(1.16) contrast(1.1) drop-shadow(0 0 18px rgba(245,158,11,0.9))'
            : isVictory
            ? 'brightness(1.18) drop-shadow(0 0 20px rgba(250,204,21,0.9))'
            : 'drop-shadow(0 10px 14px rgba(0,0,0,0.9))',
        }}
      >
        {/* Hào quang năng lượng 3D sau lưng tướng */}
        <div
          className={`absolute inset-2 rounded-full blur-md pointer-events-none transition-opacity duration-300 ${
            isEmperor
              ? 'bg-gradient-to-tr from-yellow-500/90 via-amber-400/95 to-yellow-200/90 opacity-100 animate-pulse ring-2 ring-yellow-300'
              : isSkill
              ? 'bg-gradient-to-tr from-red-600/75 via-amber-400/75 to-yellow-300/75 opacity-100 animate-pulse'
              : isAttacking
              ? 'bg-amber-500/50 opacity-95'
              : isVictory
              ? 'bg-yellow-400/50 opacity-95 animate-pulse'
              : 'bg-amber-500/15 opacity-60'
          }`}
        />
        {/* Hào quang Kim Ngưu Đế Vương cho Đinh Tiên Hoàng */}
        {isEmperor && (
          <div className="absolute -inset-3 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.45)_0%,transparent_70%)] pointer-events-none animate-pulse" />
        )}

        {/* LỚP 1: TOÀN THÂN TƯỚNG & LINH THÚ 3D PHI NƯỚC ĐẠI */}
        <div
          className={`relative w-full h-full overflow-hidden rounded-[38%] ${
            !isFacingRight ? '-scale-x-100' : ''
          }`}
          style={{
            WebkitMaskImage:
              'radial-gradient(ellipse 68% 68% at 50% 48%, rgba(0,0,0,1) 64%, rgba(0,0,0,0.82) 82%, rgba(0,0,0,0) 100%)',
            maskImage:
              'radial-gradient(ellipse 68% 68% at 50% 48%, rgba(0,0,0,1) 64%, rgba(0,0,0,0.82) 82%, rgba(0,0,0,0) 100%)',
          }}
        >
          {isFullCardAsset ? (
            <img
              src={portrait3D}
              alt={name}
              referrerPolicy="no-referrer"
              className="absolute max-w-none select-none pointer-events-none"
              style={{
                top: '-27%',
                left: '-7%',
                width: '114%',
                height: '164%',
                objectFit: 'fill',
                filter: 'contrast(1.08) saturate(1.14)',
              }}
            />
          ) : (
            <img
              src={portrait3D}
              alt={name}
              referrerPolicy="no-referrer"
              className="absolute max-w-none select-none pointer-events-none"
              style={{
                top: '-2%',
                left: '-2%',
                width: '104%',
                height: '104%',
                objectFit: 'fill',
                filter: 'contrast(1.08) saturate(1.14)',
              }}
            />
          )}

          {/* LỚP 2 (KHI RA ĐÒN): THÂN TRÊN & VŨ KHÍ TRONG ẢNH 3D VUNG BỔ VỀ PHÍA ĐỐI PHƯƠNG */}
          {isCharging && (
            <div
              className="absolute inset-0 overflow-hidden animate-rider-chop pointer-events-none"
              style={{
                transformOrigin: '50% 68%',
                WebkitMaskImage:
                  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 52%, rgba(0,0,0,0) 72%)',
                maskImage:
                  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 52%, rgba(0,0,0,0) 72%)',
              }}
            >
              {isFullCardAsset ? (
                <img
                  src={portrait3D}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="absolute max-w-none select-none pointer-events-none"
                  style={{
                    top: '-27%',
                    left: '-7%',
                    width: '114%',
                    height: '164%',
                    objectFit: 'fill',
                    filter: 'brightness(1.15) contrast(1.12) saturate(1.2)',
                  }}
                />
              ) : (
                <img
                  src={portrait3D}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="absolute max-w-none select-none pointer-events-none"
                  style={{
                    top: '-2%',
                    left: '-2%',
                    width: '104%',
                    height: '104%',
                    objectFit: 'fill',
                    filter: 'brightness(1.15) contrast(1.12) saturate(1.2)',
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
