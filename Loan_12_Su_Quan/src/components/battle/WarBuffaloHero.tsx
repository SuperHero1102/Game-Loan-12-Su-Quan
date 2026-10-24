/**
 * Loạn 12 Sứ Quân — Đinh Bộ Lĩnh Cưỡi Trâu Chiến Hoàng Gia (War Buffalo Hero)
 * Tái hiện chuẩn xác theo cốt truyện cờ lau tập trận và vũ khí Đại Đao Lửa (ảnh tham khảo 2)
 */

import React from 'react';
import { FighterState } from '../../types/game';

interface WarBuffaloHeroProps {
  fighter: FighterState;
  isFacingRight?: boolean;
}

export const WarBuffaloHero: React.FC<WarBuffaloHeroProps> = ({
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
      isAttacking ? 'translate-x-12 scale-110' :
      isHurt ? '-translate-x-5 rotate-6 filter brightness-150' :
      'translate-y-0'
    } ${!isFacingRight ? 'transform -scale-x-100' : ''}`}>
      {/* VÒNG HÀO QUANG KHI HỒI PHỤC HOẶC TĂNG GIÁP */}
      {isHealing && (
        <div className="absolute -inset-4 rounded-full bg-emerald-400/30 blur-md animate-pulse z-0 pointer-events-none" />
      )}
      {(isShielding || fighter.armor > 30) && (
        <div className="absolute -inset-3 rounded-full border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse z-0 pointer-events-none" />
      )}
      {isSkill && (
        <div className="absolute -inset-5 rounded-full bg-gradient-to-t from-red-600/50 via-amber-500/40 to-yellow-400/40 blur-lg animate-ping z-0 pointer-events-none" />
      )}

      {/* SVG ĐINH BỘ LĨNH CƯỠI TRÂU CHIẾN HOÀNG GIA */}
      <div className="relative w-28 h-32 sm:w-32 sm:h-36">
        <svg viewBox="0 0 120 130" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            {/* Vàng kim & sừng trâu */}
            <linearGradient id="goldHorns" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            {/* Thân trâu đen mun khỏe khoắn */}
            <linearGradient id="buffaloSkin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="50%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            {/* Lưỡi Đại Đao Lửa (ảnh tham khảo 2) */}
            <linearGradient id="flameBlade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* 1. NGỌN CỜ LAU LỆNH (GẮN PHÍA SAU LƯNG) */}
          <g className="origin-bottom transform -rotate-12">
            <line x1="25" y1="80" x2="10" y2="15" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bông lau trắng muốt phấp phới */}
            <ellipse cx="9" cy="18" rx="6" ry="14" fill="#f8fafc" opacity="0.9" transform="rotate(-15 9 18)" />
            <ellipse cx="12" cy="24" rx="5" ry="10" fill="#e2e8f0" opacity="0.8" />
            <ellipse cx="7" cy="14" rx="4" ry="8" fill="#ffffff" />
            {/* Dải lụa cờ lệnh đỏ thắm */}
            <path d="M10 25 Q 0 35 6 45 Q 12 35 10 25 Z" fill="#dc2626" />
          </g>

          {/* 2. CHÚ TRÂU CHIẾN HOÀNG GIA (WAR BUFFALO) */}
          <g className={isAttacking ? 'animate-bounce' : ''}>
            {/* Thân trâu vạm vỡ */}
            <ellipse cx="60" cy="95" rx="35" ry="22" fill="url(#buffaloSkin)" stroke="#09090b" strokeWidth="2" />
            
            {/* Chân trâu & móng đồng */}
            <rect x="36" y="105" width="9" height="18" rx="3" fill="#27272a" />
            <rect x="48" y="107" width="9" height="17" rx="3" fill="#18181b" />
            <rect x="70" y="107" width="9" height="17" rx="3" fill="#18181b" />
            <rect x="80" y="105" width="9" height="18" rx="3" fill="#27272a" />
            {/* Móng guốc */}
            <rect x="35" y="120" width="11" height="5" rx="2" fill="#ca8a04" />
            <rect x="47" y="121" width="11" height="5" rx="2" fill="#ca8a04" />
            <rect x="69" y="121" width="11" height="5" rx="2" fill="#ca8a04" />
            <rect x="79" y="120" width="11" height="5" rx="2" fill="#ca8a04" />

            {/* Đuôi trâu ngoe nguẩy */}
            <path d="M26 95 Q 16 100 20 115" fill="none" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="116" r="3" fill="#18181b" />

            {/* Đầu trâu dũng mãnh */}
            <ellipse cx="88" cy="85" rx="16" ry="14" fill="url(#buffaloSkin)" stroke="#09090b" strokeWidth="1.5" />
            {/* Mõm trâu & mũi xỏ khuyên vàng */}
            <ellipse cx="98" cy="88" rx="8" ry="7" fill="#52525b" />
            <circle cx="97" cy="86" r="1.5" fill="#18181b" />
            <circle cx="101" cy="87" r="1.5" fill="#18181b" />
            <circle cx="100" cy="94" r="3.5" fill="none" stroke="#facc15" strokeWidth="1.8" />

            {/* Mắt trâu tinh anh */}
            <ellipse cx="87" cy="80" rx="3" ry="3" fill="#ffffff" />
            <circle cx="88" cy="80" r="1.8" fill="#18181b" />

            {/* CẶP SỪNG TRÂU UỐN CONG BỌC VÀNG KIÊN CỐ */}
            <path
              d="M84 76 C 75 60 85 50 96 56 C 88 56 80 66 84 76 Z"
              fill="url(#goldHorns)"
              stroke="#78350f"
              strokeWidth="1.2"
            />
            <path
              d="M92 76 C 98 58 112 55 118 64 C 110 62 100 68 92 76 Z"
              fill="url(#goldHorns)"
              stroke="#78350f"
              strokeWidth="1.2"
            />
            {/* Yếm đeo cổ ngực trâu đúc đồng */}
            <path d="M78 95 Q 86 104 94 96" fill="none" stroke="#dc2626" strokeWidth="3" />
            <circle cx="86" cy="103" r="3" fill="#facc15" />
          </g>

          {/* 3. ANH HÙNG ĐINH BỘ LĨNH NGỒI TRÊN LƯNG TRÂU */}
          <g>
            {/* Yên cương & đệm ngồi thổ cẩm */}
            <ellipse cx="54" cy="78" rx="16" ry="7" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <rect x="42" y="77" width="24" height="4" rx="2" fill="#facc15" />

            {/* Chân dũng tướng buông hai bên */}
            <path d="M52 75 L 56 90 L 62 92" fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="63" cy="93" rx="4" ry="2.5" fill="#78350f" />

            {/* Thân áo chiến võ phục lam viền vàng (như ảnh 2) */}
            <rect x="44" y="48" width="22" height="26" rx="5" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
            {/* Khuyên ngực kim bài */}
            <circle cx="55" cy="58" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="55" cy="58" r="2" fill="#dc2626" />

            {/* Đầu Chibi Đinh Bộ Lĩnh */}
            <circle cx="55" cy="32" r="16" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Tóc đen búi cao & mái tóc spiky lãng tử (như ảnh 2) */}
            <path d="M42 28 Q 50 14 62 20 Q 72 26 70 32 Q 58 24 44 30 Z" fill="#18181b" />
            <path d="M52 14 L 56 4 L 62 14 Z" fill="#18181b" />

            {/* KHĂN BUỘC ĐẦU ĐỎ HOÀNG GIA */}
            <path d="M41 26 Q 55 20 69 26 L 70 30 Q 55 24 40 30 Z" fill="#dc2626" />
            {/* Dải lụa đỏ bay phấp phới phía sau */}
            <path d="M40 28 Q 28 32 24 42" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />

            {/* Mắt to sáng ngời & biểu cảm kiên định */}
            {isHurt ? (
              <g stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round">
                <line x1="47" y1="30" x2="53" y2="36" />
                <line x1="53" y1="30" x2="47" y2="36" />
                <line x1="57" y1="30" x2="63" y2="36" />
                <line x1="63" y1="30" x2="57" y2="36" />
              </g>
            ) : (
              <g>
                <circle cx="50" cy="33" r="3.2" fill="#18181b" />
                <circle cx="60" cy="33" r="3.2" fill="#18181b" />
                <circle cx="51" cy="32" r="1.2" fill="#ffffff" />
                <circle cx="61" cy="32" r="1.2" fill="#ffffff" />
                <path d="M52 40 Q 55 43 58 40" fill="none" stroke="#991b1b" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}

            {/* 4. TAY CẦM ĐẠI ĐAO LỬA (FLAMING BLADE - CHUẨN ẢNH 2) */}
            <g className={isAttacking ? 'animate-bounce' : ''}>
              {/* Tay vung đao */}
              <path d="M60 55 L 75 60" stroke="#fde047" strokeWidth="4.5" strokeLinecap="round" />
              {/* Cán đao vàng quấn vải đỏ */}
              <line x1="72" y1="62" x2="78" y2="68" stroke="#ca8a04" strokeWidth="3.5" strokeLinecap="round" />
              
              {/* LƯỠI ĐẠI ĐAO KHẮC HOA VĂN LỬA VÀNG (NHƯ ẢNH 2) */}
              <path
                d="M78 68 Q 95 62 108 50 Q 116 42 122 30 Q 112 40 98 48 Q 85 54 78 68 Z"
                fill="url(#flameBlade)"
                stroke="#facc15"
                strokeWidth="1.5"
                className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              />
              {/* Họa tiết rãnh lửa vàng trên lưỡi đao */}
              <path d="M85 62 Q 98 52 112 40" fill="none" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="95" cy="56" r="1.5" fill="#ffffff" />
              <circle cx="104" cy="48" r="1.5" fill="#ffffff" />
            </g>
          </g>
        </svg>
      </div>

      {/* TIA LỬA CHÉM KHI LAO ĐÒN */}
      {isAttacking && (
        <div className="absolute top-2 right-0 pointer-events-none z-20">
          <svg viewBox="0 0 60 60" className="w-16 h-16 animate-ping">
            <path
              d="M10 50 Q 30 10 50 10"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="6"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_#ea580c]"
            />
          </svg>
        </div>
      )}

      {/* BÓNG ĐỔ DƯỚI ĐẤT */}
      <div className="w-24 h-4 bg-black/60 rounded-full blur-[2px] mt-0.5" />
    </div>
  );
};
