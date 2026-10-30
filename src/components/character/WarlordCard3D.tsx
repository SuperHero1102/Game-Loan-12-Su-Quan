/**
 * Loạn 12 Sứ Quân — Thẻ Nhân Vật 3D (WarlordCard3D)
 * Thẻ bài 3D vật lý sưu tầm cao cấp (Physical 3D Collector Card):
 * - Hiệu ứng Parallax 3D xoay lật đa chiều (rotateX, rotateY) mượt mà theo trỏ chuột / chạm vuốt ngón tay
 * - Phân lớp chiều sâu thực tế 3D (preserve-3d, translateZ cho Khung chạm nổi, Tướng 3D, Cuộn thư, Ấn Ngũ Hành)
 * - Lớp phản chiếu ánh kim (Gold Foil Sheen) & Cầu vồng Holographic óng ánh phản ứng theo góc nghiêng
 * - Chế độ chuyển động nhịp thở (Ambient Float) sống động khi ở trạng thái nghỉ
 * - Hiển thị chuẩn xác 4 chỉ số HP, ATK, DEF, SPD và kỹ năng đặc trưng
 */

import React, { useState, useRef, useEffect } from 'react';
import { Warlord } from '../../types/game';
import { Warlord3DScene } from './Warlord3DScene';
import { Heart, Shield, Swords, Zap, Star, Sparkles, Eye, X } from 'lucide-react';

interface WarlordCard3DProps {
  warlord: Warlord;
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onSelect?: () => void;
  actionLabel?: string;
  enableAmbientFloat?: boolean;
}

export const WarlordCard3D: React.FC<WarlordCard3DProps> = ({
  warlord,
  level = 90,
  size = 'md',
  showDetails = false,
  onSelect,
  actionLabel,
  enableAmbientFloat = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Xác định phong cách khung chạm khắc 3D theo vị tướng
  const getFrameTheme = () => {
    if (warlord.id === 'dinh_bo_linh' || warlord.id === 'ngo_nhat_khanh') {
      return {
        borderGrad: 'from-amber-200 via-yellow-500 to-yellow-900',
        innerBg: 'from-amber-950/90 via-stone-950 to-amber-950/90',
        plaqueGrad: 'from-yellow-600 via-amber-400 to-yellow-700',
        gemColor: 'from-amber-300 to-yellow-600',
        cornerTotem: '🐉',
        elementBadge: '土',
        foilTint: 'rgba(251, 191, 36, 0.45)',
        badgeTitle: warlord.id === 'dinh_bo_linh' ? 'ĐẾ VƯƠNG SỨ QUÂN' : 'AN VƯƠNG SỨ QUÂN',
      };
    }
    if (warlord.id === 'pham_bach_ho' || warlord.id === 'do_canh_thac') {
      return {
        borderGrad: 'from-stone-100 via-stone-400 to-amber-900',
        innerBg: 'from-stone-900/90 via-stone-950 to-stone-900/90',
        plaqueGrad: 'from-stone-500 via-amber-300 to-stone-700',
        gemColor: 'from-cyan-300 to-blue-600',
        cornerTotem: '🐯',
        elementBadge: '金',
        foilTint: 'rgba(226, 232, 240, 0.45)',
        badgeTitle: 'MÃNH HỔ SỨ QUÂN',
      };
    }
    if (warlord.id === 'nguyen_sieu' || warlord.id === 'nguyen_khoan') {
      return {
        borderGrad: 'from-amber-300 via-emerald-600 to-amber-950',
        innerBg: 'from-stone-900/90 via-emerald-950/70 to-stone-950/90',
        plaqueGrad: 'from-emerald-700 via-amber-400 to-emerald-800',
        gemColor: 'from-emerald-300 to-teal-700',
        cornerTotem: warlord.id === 'nguyen_sieu' ? '🐘' : '🐃',
        elementBadge: '木',
        foilTint: 'rgba(52, 211, 153, 0.4)',
        badgeTitle: 'THIẾT GIÁP SỨ QUÂN',
      };
    }
    if (warlord.id === 'tran_lam' || warlord.id === 'kieu_cong_han') {
      return {
        borderGrad: 'from-sky-300 via-teal-600 to-cyan-950',
        innerBg: 'from-cyan-950/90 via-stone-950 to-blue-950/90',
        plaqueGrad: 'from-cyan-600 via-amber-300 to-teal-800',
        gemColor: 'from-sky-300 to-blue-700',
        cornerTotem: warlord.id === 'tran_lam' ? '🌊' : '🏹',
        elementBadge: '水',
        foilTint: 'rgba(56, 189, 248, 0.4)',
        badgeTitle: 'HẢI TRIỀU SỨ QUÂN',
      };
    }
    return {
      borderGrad: 'from-rose-400 via-amber-600 to-stone-900',
      innerBg: 'from-stone-900/90 via-rose-950/40 to-stone-950/90',
      plaqueGrad: 'from-amber-700 via-yellow-400 to-red-800',
      gemColor: 'from-rose-400 to-red-700',
      cornerTotem: warlord.avatarEmoji || '⚔️',
      elementBadge: '火',
      foilTint: 'rgba(244, 63, 94, 0.4)',
      badgeTitle: 'HÙNG BA SỨ QUÂN',
    };
  };

  const theme = getFrameTheme();

  // Xử lý di chuột tương tác 3D Parallax Tilt
  const handlePointerMove = (clientX: number, clientY: number, target: HTMLDivElement) => {
    const rect = target.getBoundingClientRect();
    const xRatio = (clientX - rect.left) / rect.width;
    const yRatio = (clientY - rect.top) / rect.height;

    // Góc nghiêng tối đa ±15 độ
    const tiltX = (xRatio - 0.5) * 26;
    const tiltY = (0.5 - yRatio) * 26;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({
      x: xRatio * 100,
      y: yRatio * 100,
      opacity: 0.9,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    handlePointerMove(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  // Hỗ trợ chạm vuốt trên di động (Mobile Touch Drag)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0 && cardRef.current) {
      setIsInteracting(true);
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY, cardRef.current);
    }
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const cardWidthClass =
    size === 'sm' ? 'max-w-[240px]' : size === 'lg' ? 'max-w-[380px]' : 'max-w-[325px]';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsInteracting(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={() => setShowStatsModal(true)}
      className={`relative w-full ${cardWidthClass} mx-auto select-none cursor-pointer group`}
      style={{
        perspective: '1200px',
      }}
    >
      {/* KHUNG THẺ 3D CHÍNH: Xoay lật đa chiều + preserve-3d */}
      <div
        className={`relative rounded-2xl transition-transform ${
          isInteracting ? 'duration-100 ease-out' : 'duration-500 ease-out'
        } ${
          !isInteracting && enableAmbientFloat ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) ${
            isInteracting ? 'scale3d(1.03, 1.03, 1.03)' : 'scale3d(1, 1, 1)'
          }`,
        }}
      >
        {(() => {
          const isEmperor = warlord.id === 'dinh_tien_hoang';
          const isFullCardAsset =
            !!warlord.portrait3D?.includes('IMG_271') ||
            !!warlord.portrait3D?.includes('image_15aa223a') ||
            isEmperor;

          if (isFullCardAsset) {
            return (
              /* TRỌN VẸN THẺ TƯỚNG 3D NGUYÊN BẢN (KHUNG RỒNG VÀNG, TIÊU ĐỀ, 5 SAO, CHỈ SỐ GỐC) */
              <div
                className={`relative rounded-2xl overflow-hidden bg-stone-950 transition-all ${
                  isEmperor
                    ? 'border-4 border-yellow-300 ring-4 ring-amber-500/80 shadow-[0_0_45px_rgba(250,204,21,0.95),0_25px_60px_rgba(0,0,0,0.98)]'
                    : 'border-2 border-yellow-400/80 shadow-[0_22px_50px_rgba(0,0,0,0.95)]'
                }`}
                style={{
                  transform: 'translateZ(20px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={warlord.portrait3D}
                  alt={warlord.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain block select-none drop-shadow-2xl"
                />

                {/* Hiệu ứng viền vàng hoàng kim long lanh lấp lánh riêng cho Hoàng Đế Đinh Tiên Hoàng */}
                {isEmperor && (
                  <>
                    {/* Hào quang lấp lánh chạy quanh viền */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-yellow-200/90 pointer-events-none animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-transparent to-yellow-300/30 pointer-events-none mix-blend-screen" />
                    
                    {/* Bông tuyết & sao hoàng kim lấp lánh trên góc thẻ */}
                    <div className="absolute top-1.5 left-2 text-yellow-300 text-xs font-black animate-ping pointer-events-none drop-shadow">
                      ✨
                    </div>
                    <div className="absolute top-2 right-2 text-yellow-200 text-sm font-black animate-pulse pointer-events-none drop-shadow">
                      ⭐
                    </div>
                    <div className="absolute bottom-2 left-2 text-amber-300 text-xs animate-bounce pointer-events-none drop-shadow">
                      ❄
                    </div>
                    <div className="absolute bottom-2 right-2 text-yellow-300 text-xs animate-spin pointer-events-none drop-shadow">
                      ✨
                    </div>
                  </>
                )}

                {/* Viền kim loại nổi khối tinh xảo */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-yellow-200/50 pointer-events-none" />
              </div>
            );
          }

          return (
            /* 7 TƯỚNG CÒN LẠI: THẺ BÀI SƯU TẬP HOÀNG GIA CHUẨN MỰC ĐỒNG BỘ NGHỆ THUẬT */
            <div
              className={`relative rounded-2xl bg-gradient-to-b ${theme.borderGrad} p-2 border-2 border-yellow-200/90 shadow-[0_22px_50px_rgba(0,0,0,0.95)] overflow-hidden`}
              style={{
                transform: 'translateZ(18px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* LÒNG THẺ NỀN GẤM HOÀNG TỘC */}
              <div className={`rounded-xl bg-gradient-to-b ${theme.innerBg} p-2 border border-amber-500/70`}>
                {/* TIÊU ĐỀ THẺ: TÊN TƯỚNG & 5 SAO VÀNG RỰC RỠ */}
                <div className="text-center mb-1.5">
                  <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${theme.plaqueGrad} border border-yellow-200 shadow-md inline-block max-w-full`}>
                    <h3 className="text-xs sm:text-sm font-black font-display tracking-widest text-yellow-950 uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] truncate">
                      {warlord.name}
                    </h3>
                  </div>
                  {/* 5 Ngôi sao vàng hoàng gia */}
                  <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs mt-0.5 drop-shadow">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>

                {/* TRANH TƯỚNG CƯỠI LINH THÚ — TỰ NHIÊN, RÕ NÉT, KHÔNG MÉO */}
                <div className="relative w-full h-56 sm:h-60 rounded-lg overflow-hidden border border-amber-400/90 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] bg-stone-950 mb-1.5">
                  {warlord.portrait3D ? (
                    <img
                      src={warlord.portrait3D}
                      alt={`${warlord.name} - ${warlord.mountName}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Warlord3DScene warlord={warlord} showMountLabel={false} className="w-full h-full" />
                  )}
                  {/* Dải gradient đáy hòa vào khung */}
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-1 inset-x-2 flex items-center justify-between text-[9px] font-bold text-amber-200 pointer-events-none drop-shadow">
                    <span className="bg-black/75 px-1.5 py-0.5 rounded border border-amber-600/50">{warlord.mountName}</span>
                    <span className="bg-black/75 px-1.5 py-0.5 rounded border border-amber-600/50 text-yellow-300">{warlord.weaponName}</span>
                  </div>
                </div>

                {/* BẢNG CHỈ SỐ GỐC 4 THANH & DANH HIỆU SỨ QUÂN */}
                <div className="rounded-lg bg-stone-950/95 border border-amber-800/80 p-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 border-b border-amber-900/50 pb-1">
                    <span>LV. 90 · SỨ QUÂN</span>
                    <span className="text-yellow-400 uppercase tracking-wide">{warlord.title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 text-[10px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold">HP</span>
                      <span className="text-stone-200">{warlord.hpRating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">ATK</span>
                      <span className="text-stone-200">{warlord.atkRating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sky-400 font-bold">DEF</span>
                      <span className="text-stone-200">{warlord.defRating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">SPD</span>
                      <span className="text-stone-200">{warlord.spd}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-amber-900/50 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/70 text-[9px] font-bold text-yellow-300 uppercase tracking-wider inline-block">
                      {theme.badgeTitle || warlord.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Nút Hành Động nếu có (Khiêu chiến / Chọn tướng) */}
        {onSelect && actionLabel && (
          <button
            type="button"
            onClick={onSelect}
            className="mt-2 w-full py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-stone-950 font-black text-xs rounded-lg uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
            style={{ transform: 'translateZ(35px)' }}
          >
            {actionLabel}
          </button>
        )}

        {/* LỚP 6: LỚP BÓNG PHẢN CHIẾU HOLOGRAPHIC & DÁT VÀNG (GOLD FOIL & PRISMATIC RAINBOW SHEEN) (translateZ 60px) */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 overflow-hidden mix-blend-color-dodge z-40"
          style={{
            transform: 'translateZ(60px)',
            opacity: isInteracting ? 0.75 : 0.25,
            background: `
              radial-gradient(
                circle 240px at ${glare.x}% ${glare.y}%,
                rgba(255, 245, 180, 0.7) 0%,
                rgba(255, 215, 0, 0.35) 30%,
                transparent 70%
              ),
              linear-gradient(
                ${115 + tilt.x * 2.5}deg,
                transparent 15%,
                rgba(255, 0, 128, 0.22) 28%,
                rgba(0, 255, 255, 0.25) 45%,
                rgba(255, 215, 0, 0.3) 60%,
                rgba(147, 51, 234, 0.2) 75%,
                transparent 90%
              )
            `,
          }}
        />

        {/* Lớp vân gân vàng kim loại khắc chìm siêu tinh xảo */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-20 mix-blend-overlay z-40"
          style={{
            transform: 'translateZ(62px)',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 2px, transparent 2px, transparent 6px)',
          }}
        />
      </div>

      {/* POPUP CHI TIẾT THÔNG SỐ NHÂN VẬT KHI ẤN "XEM CHI TIẾT" */}
      {showStatsModal && (
        <div
          className="modal-commercial-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowStatsModal(false);
          }}
        >
          <div
            className="modal-commercial-shell sm:border-x-2 sm:border-amber-500 shadow-2xl text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thanh Đỉnh Hoàng Kim Đông Sơn */}
            <div className="royal-header-bar flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] tracking-widest text-yellow-300 font-bold uppercase block">
                  HỒ SƠ TƯỚNG LĨNH · {warlord.title}
                </span>
                <h3 className="text-sm sm:text-base font-black font-display text-yellow-200 truncate">
                  {warlord.name} ({warlord.shortTerritory || warlord.territory})
                </h3>
              </div>

              {/* Nút đóng */}
              <button
                type="button"
                onClick={() => setShowStatsModal(false)}
                className="w-7 h-7 rounded-lg bg-rose-950/95 hover:bg-rose-900 border border-rose-400/80 text-rose-200 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thân cuộn mượt trên nền Hoa Văn Trống Đồng */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
              {/* Tranh thẻ 3D gốc nguyên bản */}
              {warlord.portrait3D && (
                <div className="w-full max-h-52 rounded-xl overflow-hidden border-2 border-yellow-400/80 bg-amber-950 flex items-center justify-center shadow-lg">
                  <img
                    src={warlord.portrait3D}
                    alt={warlord.name}
                    referrerPolicy="no-referrer"
                    className="max-h-52 w-auto object-contain block mx-auto drop-shadow-md"
                  />
                </div>
              )}

              {/* Bảng 4 chỉ số sinh lực & công thủ */}
              <div className="p-3 rounded-xl bg-amber-950/85 border border-amber-500/80 space-y-2.5 text-xs shadow-lg">
                <div>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-rose-300">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" /> Sinh Lực (HP)
                    </span>
                    <span className="font-mono text-yellow-200">{warlord.hpRating} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-amber-900/90 rounded-full overflow-hidden border border-amber-600/80">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${warlord.hpRating}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-sky-300">
                      <Shield className="w-3.5 h-3.5 fill-sky-500" /> Phòng Thủ (DEF)
                    </span>
                    <span className="font-mono text-yellow-200">{warlord.defRating} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-amber-900/90 rounded-full overflow-hidden border border-amber-600/80">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${warlord.defRating}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Swords className="w-3.5 h-3.5 text-amber-400" /> Công Lực (ATK)
                    </span>
                    <span className="font-mono text-yellow-200">{warlord.atkRating} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-amber-900/90 rounded-full overflow-hidden border border-amber-600/80">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${warlord.atkRating}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <Zap className="w-3.5 h-3.5 fill-emerald-400" /> Tốc Độ (SPD)
                    </span>
                    <span className="font-mono text-yellow-200">{warlord.spd} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-amber-900/90 rounded-full overflow-hidden border border-amber-600/80">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${warlord.spd}%` }} />
                  </div>
                </div>
              </div>

              {/* Binh khí, Chiến thú & Kỹ năng */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-950/85 border border-amber-600/70">
                  <span className="text-amber-200">Binh Khí:</span>
                  <span className="font-bold text-yellow-300">{warlord.weaponName}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-950/85 border border-amber-600/70">
                  <span className="text-amber-200">Chiến Thú:</span>
                  <span className="font-bold text-yellow-300">{warlord.mountName}</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/85 border border-amber-600/70 space-y-1.5">
                  <div>
                    <span className="font-bold text-emerald-300">Nội tại ({warlord.passiveName}): </span>
                    <span className="text-amber-100 text-[11px]">{warlord.passiveDescription}</span>
                  </div>
                  <div>
                    <span className="font-bold text-yellow-300">Tuyệt kỹ ({warlord.skillName}): </span>
                    <span className="text-amber-100 text-[11px]">{warlord.skillDescription}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền */}
            <div className="royal-bottom-dock">
              <div className="w-full max-w-md mx-auto flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowStatsModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl border-2 border-yellow-200 uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
                >
                  ĐÃ RÕ &amp; ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
