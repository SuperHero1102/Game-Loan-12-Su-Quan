/**
 * Loạn 12 Sứ Quân — Khung Cảnh 3D Tướng Lĩnh & Linh Thú (Warlord3DScene)
 * Hiển thị tạo hình 3D sống động chuẩn xác theo miêu tả lịch sử và mỹ thuật điện ảnh:
 * - 5 vị tướng còn lại: Ngô Nhật Khánh (Hắc mã cẩm bào tím Đường Lâm), Phạm Bạch Hổ (Bạch Hổ xích sắt Đằng Châu),
 *   Trần Lãm (Tuấn mã bờm bạc & Soái kỳ Bố Hải Khẩu), Lữ Đường (Chiến mã da gai & Khiên mặt quỷ Tế Giang),
 *   Nguyễn Thủ Tiệp (Thiết mã giáp then & Đại đao trảm mã Tiên Du)
 * - Đầy đủ 8 vị tướng ban đầu (Đinh Bộ Lĩnh, Ngô Xương Xí, Đỗ Cảnh Thạc, Nguyễn Siêu, Lý Khuê, Kiều Thuận, Nguyễn Khoan, Kiều Công Hãn)
 * - Chuyển động nhân vật chân thực khi ra chiêu (xung kích, vung vũ khí, vồ mồi, phóng kiếm khí, trúng đòn rung lắc, nộ khí ngập trời)
 */

import React from 'react';
import { Warlord, WeaponVisualType } from '../../types/game';

interface Warlord3DSceneProps {
  warlord?: Warlord;
  warlordId?: string;
  name?: string;
  portrait3D?: string;
  mountName?: string;
  weaponName?: string;
  weaponVisual?: WeaponVisualType;
  status?: 'idle' | 'attacking' | 'hurt' | 'heal' | 'shield' | 'skill';
  isFacingRight?: boolean;
  compact?: boolean;
  showMountLabel?: boolean;
  className?: string;
  cropToRider?: boolean;
}

export const Warlord3DScene: React.FC<Warlord3DSceneProps> = ({
  warlord,
  warlordId: propWarlordId,
  name: propName,
  portrait3D: propPortrait3D,
  mountName: propMountName,
  weaponName: propWeaponName,
  weaponVisual: propWeaponVisual,
  status = 'idle',
  isFacingRight = true,
  compact = false,
  showMountLabel = true,
  className = '',
  cropToRider = true,
}) => {
  const warlordId = warlord?.id || propWarlordId || 'dinh_bo_linh';
  const name = warlord?.name || propName || 'Đinh Bộ Lĩnh';
  const portrait3D = warlord?.portrait3D ?? propPortrait3D;
  const mountName = warlord?.mountName || propMountName || 'Chiến Thú';
  const weaponName = warlord?.weaponName || propWeaponName || 'Thần Binh';
  const weaponVisual = warlord?.weaponVisual || propWeaponVisual || 'fire_blade';

  const isAttacking = status === 'attacking';
  const isSkill = status === 'skill';
  const isHurt = status === 'hurt';
  const isHealing = status === 'heal';
  const isShielding = status === 'shield';

  // Chuyển động động học 3D chân thực khi di chuyển và xuất chiêu
  const getMotionStyle = () => {
    if (isSkill) {
      return {
        transform: `${isFacingRight ? 'translateX(24px)' : 'translateX(-24px)'} scale(1.15) translateY(-8px)`,
        filter: 'brightness(1.25) contrast(1.15) drop-shadow(0 0 20px rgba(234, 179, 8, 0.8))',
      };
    }
    if (isAttacking) {
      return {
        transform: `${isFacingRight ? 'translateX(18px) rotate(-3deg)' : 'translateX(-18px) rotate(3deg)'} scale(1.08)`,
        filter: 'brightness(1.15) contrast(1.1) drop-shadow(0 0 14px rgba(239, 68, 68, 0.7))',
      };
    }
    if (isHurt) {
      return {
        transform: `${isFacingRight ? 'translateX(-16px) rotate(4deg)' : 'translateX(16px) rotate(-4deg)'} scale(0.96)`,
        filter: 'brightness(1.4) saturate(1.8) hue-rotate(-20deg)',
      };
    }
    return {
      transform: 'translateX(0) translateY(0) scale(1)',
      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.85))',
    };
  };

  // Render tạo hình 3D nguyên bản cho 5 vị tướng còn lại
  const renderBespoke3DGeneral = () => {
    switch (warlordId) {
      case 'ngo_nhat_khanh':
        // 9. Ngô Nhật Khánh — Thành đá ong Đường Lâm hoàng hôn đỏ lửa, Cẩm bào tím giáp vàng, Hắc mã bọc đồng, Kim kiếm chạm rồng
        return (
          <div className="relative w-full h-full">
            <svg viewBox="0 0 320 220" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="nnkSunset" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#450a0a" />
                  <stop offset="45%" stopColor="#b45309" />
                  <stop offset="75%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#1c1917" />
                </linearGradient>
                <linearGradient id="nnkGoldArmor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#713f12" />
                </linearGradient>
                <linearGradient id="nnkBlackSteed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3f3f46" />
                  <stop offset="50%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
                <filter id="glowGold">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Bối cảnh: Thành cổ đá ong Đường Lâm rực lửa hoàng hôn */}
              <rect width="320" height="220" fill="url(#nnkSunset)" />
              {/* Tường thành lũy đá ong gồ ghề */}
              <polygon points="0,120 70,115 130,135 180,125 320,135 320,220 0,220" fill="#451a03" />
              <polygon points="10,130 50,130 45,155 15,155" fill="#78350f" stroke="#291003" strokeWidth="1" />
              <polygon points="65,135 110,135 105,160 70,160" fill="#78350f" stroke="#291003" strokeWidth="1" />
              {/* Mặt trời lặn đỏ rực */}
              <circle cx="160" cy="95" r="38" fill="#ef4444" opacity="0.6" />

              {/* Đại kỳ thêu chữ NGÔ tung bay phần phật trong gió */}
              <g className="animate-[pulse_3s_ease-in-out_infinite]">
                <line x1="270" y1="35" x2="270" y2="160" stroke="#713f12" strokeWidth="4" />
                <path d="M 270 38 Q 230 48 200 42 L 205 85 Q 240 75 270 82 Z" fill="#6b21a8" stroke="#facc15" strokeWidth="2" />
                <text x="235" y="66" fill="#fef08a" fontSize="16" fontWeight="bold" fontFamily="serif">吳</text>
              </g>

              {/* HẮC MÃ CHIẾN TRẬN ĐƯỜNG LÂM BỌC GIÁP ỨC ĐỒNG */}
              <g transform="translate(45, 65)">
                {/* Đuôi hắc mã bay */}
                <path d="M 30 70 Q 5 95 10 120" stroke="#18181b" strokeWidth="7" fill="none" strokeLinecap="round" />
                {/* Thân hắc mã */}
                <ellipse cx="98" cy="72" rx="66" ry="36" fill="url(#nnkBlackSteed)" stroke="#09090b" strokeWidth="2" />
                {/* Giáp ức đồng thau chạm rồng */}
                <path d="M 125 45 Q 165 60 152 95 L 120 90 Z" fill="url(#nnkGoldArmor)" stroke="#451a03" strokeWidth="1.5" />
                {/* Cổ & Đầu Hắc Mã tung bờm đen */}
                <path d="M 125 60 L 158 15 L 188 28 L 152 78 Z" fill="url(#nnkBlackSteed)" />
                {/* Giáp đầu ngựa bằng đồng */}
                <polygon points="158,14 188,26 182,42 152,28" fill="url(#nnkGoldArmor)" stroke="#451a03" strokeWidth="1.2" />
                {/* Mắt ngựa đỏ rực chiến ý */}
                <circle cx="172" cy="26" r="3" fill="#ef4444" />
                {/* Chân trước phi nước đại */}
                <line x1="140" y1="95" x2="175" y2="135" stroke="#18181b" strokeWidth="10" strokeLinecap="round" />
                <line x1="80" y1="95" x2="65" y2="140" stroke="#18181b" strokeWidth="10" strokeLinecap="round" />
              </g>

              {/* TƯỚNG NGÔ NHẬT KHÁNH: Cẩm bào tím, giáp vàng hoàng tộc, Kim khôi lông đỏ, Kim kiếm rồng */}
              <g transform="translate(105, 12)">
                {/* Cẩm bào tím tung bay cuồn cuộn */}
                <path d="M 40 45 Q -10 65 -5 125 L 85 110 Z" fill="#581c87" stroke="#eab308" strokeWidth="1.5" opacity="0.95" />
                {/* Chiến giáp hoàng gia mạ vàng rực rỡ */}
                <rect x="36" y="44" width="44" height="52" rx="8" fill="url(#nnkGoldArmor)" stroke="#713f12" strokeWidth="2" />
                {/* Thắt lưng ngọc hoàng tộc */}
                <rect x="36" y="78" width="44" height="8" fill="#1e1b4b" stroke="#facc15" strokeWidth="1" />
                {/* Mặt tướng uy nghiêm tuấn tú */}
                <circle cx="58" cy="28" r="14" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
                {/* Kim Khôi Hoàng Gia đính lông vũ đỏ phất phới */}
                <polygon points="44,22 58,4 72,22" fill="url(#nnkGoldArmor)" stroke="#713f12" strokeWidth="1.5" />
                <path d="M 58 4 Q 86 -12 96 16" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                
                {/* KIM KIẾM CHẠM VÂN RỒNG TỎA KIM QUANG */}
                <g transform="rotate(-32 25 35)" filter="url(#glowGold)">
                  <line x1="20" y1="35" x2="20" y2="-45" stroke="#fef08a" strokeWidth="4.5" strokeLinecap="round" />
                  <polygon points="20,-48 15,-38 25,-38" fill="#ffffff" />
                  <circle cx="20" cy="38" r="4" fill="#ef4444" />
                  {/* Luồng kiếm khí rồng vàng uốn lượn */}
                  <path d="M 10 15 Q 35 -10 12 -35" fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.8" />
                </g>
              </g>
            </svg>
          </div>
        );

      case 'pham_bach_ho':
        // 10. Phạm Bạch Hổ — Sông nước Đằng Châu mù sương, Bạch Hổ khổng lồ xích sắt giáp đinh, Song kích đồng đen
        return (
          <div className="relative w-full h-full">
            <svg viewBox="0 0 320 220" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="pbhWater" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="45%" stopColor="#1e293b" />
                  <stop offset="80%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="pbhWhiteFur" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="65%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="pbhBronze" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="45%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
              </defs>

              {/* Sông nước Đằng Châu mù sương lau sậy */}
              <rect width="320" height="220" fill="url(#pbhWater)" />
              {/* Rặng lau sậy bên bờ sông */}
              <path d="M 0 160 L 15 110 L 25 165 L 45 115 L 60 170" stroke="#64748b" strokeWidth="2" fill="none" />
              <path d="M 270 160 L 285 105 L 298 165 L 315 115" stroke="#64748b" strokeWidth="2" fill="none" />
              {/* Chiến thuyền và ánh đuốc bập bùng trong sương */}
              <polygon points="30,135 75,135 68,148 40,148" fill="#1c1917" />
              <circle cx="70" cy="132" r="3.5" fill="#f97316" className="animate-ping" style={{ animationDuration: '1.5s' }} />
              <polygon points="230,130 280,130 272,144 242,144" fill="#1c1917" />
              <circle cx="275" cy="127" r="3.5" fill="#f97316" className="animate-ping" style={{ animationDuration: '1.2s' }} />

              {/* BẠCH HỔ KHỔNG LỒ LÔNG TUYẾT TRẮNG VỚI GIÁP ĐINH TÁN VÀ XÍCH SẮT */}
              <g transform="translate(55, 75)">
                {/* Đuôi bạch hổ quất mạnh */}
                <path d="M 25 55 Q -10 35 -5 10" stroke="#f8fafc" strokeWidth="7" fill="none" strokeLinecap="round" />
                {/* Thân mãnh thú cuồn cuộn */}
                <ellipse cx="105" cy="62" rx="72" ry="38" fill="url(#pbhWhiteFur)" stroke="#475569" strokeWidth="2" />
                {/* Vằn đen đặc trưng của Chúa Sơn Lâm */}
                <path d="M 60 38 L 52 64 M 82 34 L 76 66 M 105 32 L 102 62 M 128 36 L 122 66" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                {/* Giáp lưng bọc đinh tán sắc nhọn */}
                <path d="M 75 25 Q 125 22 145 52 L 118 72 Z" fill="url(#pbhBronze)" stroke="#fef08a" strokeWidth="1.5" />
                <polygon points="90,16 95,6 100,18" fill="#fef08a" />
                <polygon points="110,18 116,8 122,20" fill="#fef08a" />
                {/* Xích sắt kìm cương dũng mãnh */}
                <path d="M 125 55 Q 155 65 175 48" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,3" />

                {/* Đầu Bạch Hổ gầm vang nhe nanh */}
                <circle cx="168" cy="52" r="30" fill="url(#pbhWhiteFur)" stroke="#334155" strokeWidth="2" />
                <polygon points="152,24 186,24 180,45 158,45" fill="url(#pbhBronze)" stroke="#fef08a" strokeWidth="1.5" />
                {/* Mắt vàng rực lửa */}
                <circle cx="162" cy="46" r="3.5" fill="#facc15" />
                <circle cx="180" cy="46" r="3.5" fill="#facc15" />
                {/* Hàm răng nanh trắng muốt */}
                <path d="M 158 60 L 182 60 L 178 74 L 162 74 Z" fill="#991b1b" />
                <polygon points="160,60 163,68 166,60" fill="#ffffff" />
                <polygon points="174,60 177,68 180,60" fill="#ffffff" />
                {/* Bốn chân bắp thịt săn chắc */}
                <rect x="52" y="82" width="22" height="38" rx="8" fill="url(#pbhWhiteFur)" stroke="#334155" strokeWidth="2" />
                <rect x="135" y="80" width="24" height="40" rx="8" fill="url(#pbhWhiteFur)" stroke="#334155" strokeWidth="2" />
              </g>

              {/* TƯỚNG PHẠM BẠCH HỔ: Giáp da thú, Hộ tâm hình mặt hổ, Phương Thiên Song Kích đồng đen */}
              <g transform="translate(112, 14)">
                {/* Áo choàng da hổ viền lông */}
                <path d="M 38 45 Q 8 72 15 115 L 88 115 Z" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
                {/* Giáp vảy đồng kiên cố */}
                <rect x="36" y="42" width="44" height="52" rx="8" fill="url(#pbhBronze)" stroke="#451a03" strokeWidth="2" />
                {/* Hộ tâm phiến đúc mặt hổ uy nghiêm */}
                <circle cx="58" cy="66" r="12" fill="#f59e0b" stroke="#451a03" strokeWidth="2" />
                <polygon points="54,64 58,58 62,64" fill="#451a03" />
                {/* Mặt tướng dữ tợn, râu quai nón */}
                <circle cx="58" cy="26" r="14" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
                <path d="M 48 32 Q 58 44 68 32" stroke="#1c1917" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Khôi tướng đầu hổ */}
                <polygon points="44,20 58,4 72,20" fill="url(#pbhBronze)" stroke="#451a03" strokeWidth="1.5" />
                <circle cx="58" cy="10" r="3" fill="#dc2626" />

                {/* PHƯƠNG THIÊN SONG KÍCH ĐỒNG ĐEN BẢN RỘNG */}
                {/* Kích trái */}
                <line x1="-15" y1="85" x2="52" y2="35" stroke="#292524" strokeWidth="5" />
                <path d="M -15 85 L -35 76 L -25 98 L -5 90 Z" fill="#44403c" stroke="#facc15" strokeWidth="2" />
                {/* Kích phải giương cao */}
                <line x1="65" y1="35" x2="135" y2="80" stroke="#292524" strokeWidth="5" />
                <path d="M 135 80 L 155 72 L 145 94 L 125 86 Z" fill="#44403c" stroke="#facc15" strokeWidth="2" />
              </g>
            </svg>
          </div>
        );

      case 'tran_lam':
        // 11. Trần Lãm — Cửa biển Bố Hải Khẩu, Thủy quân vạn thuyền, Tuấn mã bờm bạc rẽ sóng, Bảo kiếm khảm ngọc & Soái kỳ
        return (
          <div className="relative w-full h-full">
            <svg viewBox="0 0 320 220" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="tlSea" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#082f49" />
                  <stop offset="45%" stopColor="#0284c7" />
                  <stop offset="85%" stopColor="#0369a1" />
                  <stop offset="100%" stopColor="#0c4a6e" />
                </linearGradient>
                <linearGradient id="tlSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
                <linearGradient id="tlSilkWave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
              </defs>

              {/* Cửa biển Bố Hải Khẩu sóng cuộn trào */}
              <rect width="320" height="220" fill="url(#tlSea)" />
              {/* Đội chiến thuyền buồm nâu rẽ sóng ra khơi xa */}
              <g opacity="0.85">
                <polygon points="15,120 65,120 58,135 25,135" fill="#451a03" />
                <polygon points="32,80 60,105 32,118" fill="#92400e" stroke="#fde68a" strokeWidth="1" />
                <polygon points="235,115 295,115 285,132 245,132" fill="#451a03" />
                <polygon points="255,75 290,100 255,112" fill="#92400e" stroke="#fde68a" strokeWidth="1" />
              </g>

              {/* Sóng bạc cuộn dâng */}
              <path d="M 0 175 Q 40 160 80 175 T 160 175 T 240 175 T 320 175" fill="none" stroke="#e0f2fe" strokeWidth="4" />
              <path d="M 20 190 Q 60 175 100 190 T 180 190 T 260 190" fill="none" stroke="#bae6fd" strokeWidth="3" />

              {/* TUẤN MÃ THỦY CHIẾN BỜM BẠC RẼ SÓNG BIỂN */}
              <g transform="translate(55, 70)">
                <ellipse cx="95" cy="62" rx="64" ry="32" fill="url(#tlSilver)" stroke="#475569" strokeWidth="2" />
                {/* Yên cương lụa thêu hải ba sóng nước */}
                <path d="M 72 45 Q 115 42 128 68 L 102 78 Z" fill="url(#tlSilkWave)" stroke="#facc15" strokeWidth="1.5" />
                {/* Cổ & Đầu bờm bạc dũng mãnh */}
                <path d="M 125 50 L 155 12 L 182 25 L 148 70 Z" fill="url(#tlSilver)" />
                {/* Bờm ngựa bạc bay trong gió bão */}
                <path d="M 130 35 Q 110 25 120 10 M 140 25 Q 125 15 132 2" stroke="#f8fafc" strokeWidth="4" fill="none" />
                {/* Vó ngựa đạp sóng */}
                <line x1="68" y1="88" x2="52" y2="135" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
                <line x1="135" y1="84" x2="162" y2="128" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
              </g>

              {/* TƯỚNG TRẦN LÃM: Râu bạc uy nghiêm, Áo tướng thêu sóng nước, Soái kỳ & Bảo kiếm khảm ngọc */}
              <g transform="translate(110, 10)">
                {/* SOÁI KỲ ĐIỀU BINH DỰNG THẲNG */}
                <line x1="85" y1="-8" x2="85" y2="115" stroke="#eab308" strokeWidth="4" />
                <polygon points="85,-5 145,12 132,48 85,38" fill="url(#tlSilkWave)" stroke="#fde047" strokeWidth="2.5" />
                <text x="96" y="26" fill="#fef08a" fontSize="14" fontWeight="bold">陳</text>

                {/* Trường bào tướng soái phủ ngoài giáp đồng */}
                <path d="M 38 45 Q 8 68 15 115 L 85 115 Z" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5" />
                <rect x="36" y="42" width="44" height="52" rx="8" fill="#ca8a04" stroke="#713f12" strokeWidth="2" />
                {/* Đầu tướng & râu bạc đức cao vọng trọng */}
                <circle cx="58" cy="26" r="14" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
                <path d="M 48 33 Q 58 56 68 33" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                {/* Mũ tướng thắt đai vàng ngọc */}
                <polygon points="44,18 58,2 72,18" fill="#ca8a04" stroke="#facc15" strokeWidth="1.5" />
                
                {/* BẢO KIẾM CHỈ HUY KHẢM NGỌC XANH */}
                <line x1="36" y1="62" x2="-18" y2="28" stroke="#fef08a" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="32" cy="58" r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
              </g>
            </svg>
          </div>
        );

      case 'lu_duong':
        // 12. Lữ Đường — Đầm lầy và hào tre gai Tế Giang mưa phùn, Chiến mã nâu da gai, Trường mâu & Khiên mặt quỷ
        return (
          <div className="relative w-full h-full">
            <svg viewBox="0 0 320 220" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="ldSwamp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#14532d" />
                  <stop offset="45%" stopColor="#1e293b" />
                  <stop offset="85%" stopColor="#1c1917" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="ldBrownHorse" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="50%" stopColor="#451a03" />
                  <stop offset="100%" stopColor="#291003" />
                </linearGradient>
                <linearGradient id="ldDemonShield" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="60%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
              </defs>

              {/* Vùng đầm lầy và hào lũy tre gai Tế Giang */}
              <rect width="320" height="220" fill="url(#ldSwamp)" />
              {/* Màn mưa phùn chiến trận rơi xiên */}
              <g stroke="#94a3b8" strokeWidth="1" opacity="0.6">
                <line x1="30" y1="10" x2="15" y2="60" />
                <line x1="120" y1="20" x2="105" y2="70" />
                <line x1="220" y1="10" x2="205" y2="60" />
                <line x1="280" y1="30" x2="265" y2="80" />
              </g>

              {/* Hào chông tre gai sắc nhọn tứ phía */}
              <polygon points="10,180 25,130 40,180" fill="#4d7c0f" stroke="#1a2e05" strokeWidth="1.5" />
              <polygon points="35,180 50,122 65,180" fill="#4d7c0f" stroke="#1a2e05" strokeWidth="1.5" />
              <polygon points="260,180 275,128 290,180" fill="#4d7c0f" stroke="#1a2e05" strokeWidth="1.5" />
              <polygon points="280,180 295,120 310,180" fill="#4d7c0f" stroke="#1a2e05" strokeWidth="1.5" />

              {/* CHIẾN MÃ NÂU BỌC GIÁP DA GAI ĐỘT KÍCH NHANH */}
              <g transform="translate(55, 72)">
                <ellipse cx="95" cy="60" rx="62" ry="32" fill="url(#ldBrownHorse)" stroke="#291003" strokeWidth="2" />
                {/* Giáp da bọc gai nhọn */}
                <path d="M 80 38 Q 120 34 135 62 L 105 74 Z" fill="#92400e" stroke="#facc15" strokeWidth="1.5" />
                <polygon points="95,30 99,20 103,32" fill="#fde047" />
                <polygon points="112,32 117,22 121,34" fill="#fde047" />
                {/* Đầu chiến mã bờm cắt gọn cơ động */}
                <path d="M 125 50 L 155 12 L 180 24 L 148 68 Z" fill="url(#ldBrownHorse)" />
                {/* Chân phi nước đại qua đầm lầy */}
                <line x1="68" y1="85" x2="48" y2="135" stroke="#451a03" strokeWidth="10" strokeLinecap="round" />
                <line x1="135" y1="80" x2="165" y2="125" stroke="#451a03" strokeWidth="10" strokeLinecap="round" />
              </g>

              {/* TƯỚNG LỮ ĐƯỜNG: Thiết giáp gọn gàng, Trường mâu & Khiên quỷ */}
              <g transform="translate(112, 14)">
                {/* Thiết giáp đột kích */}
                <rect x="36" y="44" width="42" height="50" rx="6" fill="#3f3f46" stroke="#ca8a04" strokeWidth="2" />
                {/* Đầu tướng & khôi giáp da */}
                <circle cx="57" cy="26" r="13" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
                <polygon points="44,20 57,6 70,20" fill="#713f12" stroke="#facc15" strokeWidth="1.5" />

                {/* KHIÊN MÂY BỌC ĐỒNG CHẠM MẶT QUỶ */}
                <ellipse cx="28" cy="68" rx="20" ry="26" fill="url(#ldDemonShield)" stroke="#facc15" strokeWidth="2.5" />
                {/* Mặt quỷ đỏ mắt rực lửa */}
                <circle cx="22" cy="62" r="3" fill="#ef4444" />
                <circle cx="34" cy="62" r="3" fill="#ef4444" />
                <path d="M 18 76 Q 28 86 38 76" fill="none" stroke="#fde047" strokeWidth="2.5" />
                <polygon points="28,45 32,54 24,54" fill="#facc15" />

                {/* TRƯỜNG MÂU MŨI THÉP NHỌN HOẮT */}
                <line x1="-35" y1="75" x2="145" y2="18" stroke="#78350f" strokeWidth="4.5" />
                <polygon points="145,18 172,8 155,28" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
        );

      case 'nguyen_thu_tiep':
      default:
        // 13. Nguyễn Thủ Tiệp — Núi rừng Tiên Du đồn lũy gỗ, Thiết mã bọc xích sắt, Giáp sắt 2 tầng, Đại đao trảm mã rực lửa
        return (
          <div className="relative w-full h-full">
            <svg viewBox="0 0 320 220" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="nttForest" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b0764" />
                  <stop offset="45%" stopColor="#7f1d1d" />
                  <stop offset="85%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
                <linearGradient id="nttIronBlade" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              {/* Núi rừng hiểm trở & đồn lũy Tiên Du */}
              <rect width="320" height="220" fill="url(#nttForest)" />
              {/* Dãy núi Tiên Du chập chùng bóng tối */}
              <polygon points="0,150 70,80 140,150" fill="#18181b" opacity="0.8" />
              <polygon points="180,150 250,70 320,150" fill="#18181b" opacity="0.8" />
              {/* Cọc chông gỗ phòng thủ */}
              <line x1="20" y1="160" x2="20" y2="190" stroke="#78350f" strokeWidth="4" />
              <line x1="35" y1="155" x2="35" y2="190" stroke="#78350f" strokeWidth="4" />
              <line x1="285" y1="155" x2="285" y2="190" stroke="#78350f" strokeWidth="4" />
              <line x1="300" y1="160" x2="300" y2="190" stroke="#78350f" strokeWidth="4" />

              {/* THIẾT MÃ BỌC GIÁP SẮT SƠN THEN CHÂN QUẤN XÍCH */}
              <g transform="translate(55, 70)">
                <ellipse cx="95" cy="60" rx="64" ry="34" fill="#09090b" stroke="#52525b" strokeWidth="2.5" />
                {/* Giáp phiến sắt sơn then viền chỉ đỏ */}
                <rect x="52" y="38" width="82" height="38" rx="6" fill="#18181b" stroke="#dc2626" strokeWidth="2" />
                {/* Cổ & Đầu thiết mã */}
                <path d="M 125 50 L 155 12 L 182 24 L 148 68 Z" fill="#18181b" stroke="#52525b" strokeWidth="2" />
                {/* Mắt ngựa đỏ lửa */}
                <circle cx="166" cy="24" r="3" fill="#ef4444" />
                {/* Chân bọc xích sắt bảo vệ */}
                <line x1="68" y1="85" x2="48" y2="135" stroke="#18181b" strokeWidth="10" strokeLinecap="round" />
                <path d="M 45 105 L 58 115 M 48 115 L 61 125" stroke="#e2e8f0" strokeWidth="2.5" />
                <line x1="135" y1="80" x2="165" y2="128" stroke="#18181b" strokeWidth="10" strokeLinecap="round" />
                <path d="M 145 98 L 158 108 M 150 110 L 163 120" stroke="#e2e8f0" strokeWidth="2.5" />
              </g>

              {/* TƯỚNG NGUYỄN THỦ TIỆP: Giáp sắt 2 tầng viền đỏ, Hộ phù dũng tướng, Đại đao trảm mã */}
              <g transform="translate(112, 12)">
                {/* Giáp sắt kiên cố 2 tầng */}
                <rect x="34" y="44" width="46" height="52" rx="8" fill="#18181b" stroke="#dc2626" strokeWidth="2.5" />
                {/* Hộ phù dũng tướng trước ngực */}
                <circle cx="57" cy="62" r="8" fill="#b91c1c" stroke="#facc15" strokeWidth="1.5" />
                {/* Mặt dũng tướng & khôi sắt */}
                <circle cx="57" cy="26" r="14" fill="#fed7aa" stroke="#18181b" strokeWidth="1.5" />
                <polygon points="42,20 57,4 72,20" fill="#27272a" stroke="#dc2626" strokeWidth="2" />

                {/* ĐẠI ĐAO TRẢM MÃ THÂN DÀI RỬA LỬA KHỦNG KHIẾP */}
                <line x1="-30" y1="85" x2="125" y2="8" stroke="#7f1d1d" strokeWidth="5" />
                <path d="M 112 15 L 175 -15 L 160 22 L 120 28 Z" fill="url(#nttIronBlade)" stroke="#fbbf24" strokeWidth="2" />
                {/* Tàn lửa bay từ lưỡi đao */}
                <circle cx="150" cy="5" r="2.5" fill="#fde047" className="animate-ping" />
              </g>
            </svg>
          </div>
        );
    }
  };

  // Hiệu ứng Binh khí 3D tung chiêu đặc trưng theo từng loại vũ khí
  const render3DWeaponAttackOverlay = () => {
    if (!isAttacking && !isSkill) return null;

    return (
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Vệt chém / Sấm chớp / Chấn động 3D */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full animate-[ping_0.4s_ease-out_infinite]"
        >
          {weaponVisual === 'divine_bow' ? (
            // Mưa tên đồng Phong Châu
            <g stroke="#facc15" strokeWidth="4" strokeLinecap="round">
              <line x1="20" y1="160" x2="180" y2="40" />
              <line x1="35" y1="175" x2="190" y2="60" />
              <line x1="10" y1="140" x2="165" y2="25" />
            </g>
          ) : weaponVisual === 'iron_mace' || weaponVisual === 'battle_axe' ? (
            // Chùy sắt / Rìu chiến đập nứt mặt đất
            <g>
              <circle
                cx="100"
                cy="100"
                r="65"
                fill="none"
                stroke="#f97316"
                strokeWidth="8"
                strokeDasharray="12,8"
              />
              <path
                d="M 30 100 L 170 100 M 100 30 L 100 170"
                stroke="#fef08a"
                strokeWidth="6"
              />
            </g>
          ) : (
            // Vệt chém Kiếm Lệnh / Đại Đao / Trường Thương / Song Kích 3D
            <g>
              <path
                d="M 15 165 Q 100 85 185 20"
                fill="none"
                stroke="#fde047"
                strokeWidth="14"
                strokeLinecap="round"
                filter="drop-shadow(0 0 8px #f59e0b)"
              />
              <path
                d="M 25 175 Q 110 95 195 30"
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
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
      className={`relative w-full h-full overflow-hidden select-none transition-all duration-300 ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        ...getMotionStyle(),
      }}
    >
      {/* Hào quang trạng thái chiến đấu */}
      {isHealing && (
        <div className="absolute inset-0 bg-emerald-500/30 animate-pulse z-20 pointer-events-none" />
      )}
      {isShielding && (
        <div className="absolute inset-0 border-4 border-emerald-400 bg-emerald-400/20 z-20 pointer-events-none" />
      )}
      {isSkill && (
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/40 via-amber-500/30 to-yellow-300/40 animate-pulse z-20 pointer-events-none" />
      )}

      {/* HIỂN THỊ HÌNH ẢNH 3D NGUYÊN BẢN: TRỌN VẸN NHÂN VẬT, VŨ KHÍ & LINH THÚ TRONG KHUNG */}
      {portrait3D ? (
        <div className="relative w-full h-full overflow-hidden bg-stone-950 flex items-center justify-center">
          {(() => {
            const isFullCardAsset = portrait3D.includes('IMG_271');
            const shouldFlip = !isFacingRight;

            // Tách chuẩn vùng khung tranh nhân vật + vũ khí + linh thú nằm trọn 100% trong khung hình
            if (cropToRider) {
              if (isFullCardAsset) {
                // Đối với 6 ảnh thẻ dọc (IMG_2711..2716): vùng tranh nhân vật nằm từ [6%..94%] ngang và [16.5%..77.5%] dọc
                return (
                  <div
                    className={`relative w-full h-full overflow-hidden ${
                      shouldFlip ? '-scale-x-100' : ''
                    }`}
                  >
                    <img
                      src={portrait3D}
                      alt={`${name} - ${mountName}`}
                      referrerPolicy="no-referrer"
                      className="absolute max-w-none transition-transform duration-500"
                      style={{
                        top: '-27%',
                        left: '-7%',
                        width: '114%',
                        height: '164%',
                        objectFit: 'fill',
                        filter: 'contrast(1.06) saturate(1.1) brightness(1.02)',
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />
                  </div>
                );
              }

              // Đối với 7 ảnh đã cắt sạch phần chữ mô tả phía trên: hiển thị trọn vẹn 100% nhân vật, vũ khí và linh thú
              return (
                <div
                  className={`relative w-full h-full overflow-hidden ${
                    shouldFlip ? '-scale-x-100' : ''
                  }`}
                >
                  <img
                    src={portrait3D}
                    alt={`${name} - ${mountName}`}
                    referrerPolicy="no-referrer"
                    className="absolute max-w-none transition-transform duration-500"
                    style={{
                      top: '-1.5%',
                      left: '-1.5%',
                      width: '103%',
                      height: '103%',
                      objectFit: 'fill',
                      filter: 'contrast(1.06) saturate(1.1)',
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />
                </div>
              );
            }

            // Chế độ xem toàn ảnh nguyên bản
            return (
              <img
                src={portrait3D}
                alt={`${name} - ${mountName}`}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-contain ${shouldFlip ? '-scale-x-100' : ''}`}
                style={{ filter: 'contrast(1.06) saturate(1.08)' }}
              />
            );
          })()}
        </div>
      ) : (
        <div className="relative w-full h-full overflow-hidden bg-stone-950">
          {renderBespoke3DGeneral()}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-stone-950/20 pointer-events-none" />
        </div>
      )}

      {/* Hiệu ứng vệt chém / binh khí 3D khi xuất chiêu */}
      {render3DWeaponAttackOverlay()}

      {/* Nhãn Thú Cưỡi & Binh Khí ở góc dưới */}
      {!compact && showMountLabel && (
        <div className="absolute bottom-1 inset-x-1.5 flex items-center justify-between text-[9px] font-bold text-amber-200/95 z-20 pointer-events-none drop-shadow">
          <span className="truncate bg-black/75 px-1.5 py-0.5 rounded border border-amber-500/50">
            {mountName}
          </span>
          <span className="truncate bg-black/75 px-1.5 py-0.5 rounded border border-amber-500/50 text-yellow-300">
            {weaponName}
          </span>
        </div>
      )}
    </div>
  );
};
