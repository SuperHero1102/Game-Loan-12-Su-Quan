/**
 * Loạn 12 Sứ Quân — Chiến Trường Đối Kháng 3D (Authentic Fighting Game Arena)
 * - Mở rộng không gian sàn đấu ~45% khung nhìn, nhân vật chiến tướng cưỡi thú to rõ, uy dũng
 * - Tối ưu thanh thông số Máu, Giáp, Mana nhỏ gọn tinh xảo chuẩn game đối kháng arcade
 * - Hoạt ảnh xuất chiêu chân thực: Tướng cưỡi linh thú phi nhanh sang áp sát chém trực diện đối phương,
 *   đối thủ giật lùi trúng đòn rung lắc, kèm vệt chém kiếm khí bùng nổ tia lửa và lùi về thế thủ
 */

import React from 'react';
import { FighterState, FloatingText } from '../../types/game';
import { CombatGeneralRig } from './CombatGeneralRig';
import { ALL_CHARACTERS } from '../../data/warlords';
import { Heart, Zap, Clock } from 'lucide-react';

interface BattleStage2DProps {
  player1: FighterState;
  player2: FighterState;
  currentTurn: 'p1' | 'p2';
  floatingTexts: FloatingText[];
  isAiThinking: boolean;
  slashActive: boolean;
  slashTarget: 'p1' | 'p2' | null;
  gameMode: string;
  turnTimerEnabled?: boolean;
  timeLeft?: number;
  onOpenTimerModal?: () => void;
}

export const BattleStage2D: React.FC<BattleStage2DProps> = ({
  player1,
  player2,
  currentTurn,
  floatingTexts,
  slashActive,
  slashTarget,
  turnTimerEnabled = true,
  timeLeft = 20,
  onOpenTimerModal,
}) => {
  const p1HpPercent = Math.max(0, Math.min(100, (player1.hp / player1.maxHp) * 100));
  const p2HpPercent = Math.max(0, Math.min(100, (player2.hp / player2.maxHp) * 100));

  const p1ArmorPercent = Math.max(0, Math.min(100, (player1.armor / player1.maxArmor) * 100));
  const p2ArmorPercent = Math.max(0, Math.min(100, (player2.armor / player2.maxArmor) * 100));

  const p1ManaPercent = Math.max(0, Math.min(100, (player1.mana / player1.maxMana) * 100));
  const p2ManaPercent = Math.max(0, Math.min(100, (player2.mana / player2.maxMana) * 100));

  const isP1Turn = currentTurn === 'p1';
  const isP2Turn = currentTurn === 'p2';

  const p1WarlordData = ALL_CHARACTERS.find((w) => w.id === player1.id) || ALL_CHARACTERS[0];
  const p2WarlordData = ALL_CHARACTERS.find((w) => w.id === player2.id) || ALL_CHARACTERS[1];

  const activeSkillCaster =
    player1.status === 'skill' ? player1 : player2.status === 'skill' ? player2 : null;

  // Chuyển động cân đối 2 bên: bình thường đứng đối xứng 2 đầu, khi giao chiến phi linh thú áp sát đối phương chém trực diện
  const getP1CombatTransform = () => {
    if (player1.status === 'skill') {
      return 'translateX(min(52vw, 210px)) translateY(-6px) scale(1.14)';
    }
    if (player1.status === 'attacking') {
      return 'translateX(min(48vw, 190px)) translateY(-4px) scale(1.1)';
    }
    if (player1.status === 'hurt' || (slashActive && slashTarget === 'p1')) {
      return 'translateX(-22px) rotate(-6deg) scale(0.93)';
    }
    if (player1.status === 'victory') {
      return 'translateY(-4px) scale(1.06)';
    }
    return 'translateX(0) translateY(0) scale(1)';
  };

  const getP2CombatTransform = () => {
    if (player2.status === 'skill') {
      return 'translateX(max(-52vw, -210px)) translateY(-6px) scale(1.14)';
    }
    if (player2.status === 'attacking') {
      return 'translateX(max(-48vw, -190px)) translateY(-4px) scale(1.1)';
    }
    if (player2.status === 'hurt' || (slashActive && slashTarget === 'p2')) {
      return 'translateX(22px) rotate(6deg) scale(0.93)';
    }
    if (player2.status === 'victory') {
      return 'translateY(-4px) scale(1.06)';
    }
    return 'translateX(0) translateY(0) scale(1)';
  };

  return (
    <div
      className={`relative flex-1 w-full h-full min-h-[185px] flex flex-col rounded-t-xl overflow-hidden bg-stone-950 border-x-2 border-t-2 border-amber-700/85 shadow-2xl select-none font-body ${
        slashActive ? 'shake-effect' : ''
      }`}
    >
      {/* 1. KHUNG HUD 3 THANH CHỈ SỐ ĐỘC LẬP Ở ĐỈNH (TÁCH RIÊNG KHÔNG ĐÈ LÊN TƯỚNG 3D) */}
      <div className="relative z-30 shrink-0 w-full px-2 py-1.5 bg-gradient-to-b from-stone-950 via-stone-950 to-stone-900/95 border-b border-amber-800/80 shadow-md">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* BÊN TRÁI: QUÂN TA (P1 - ĐINH BỘ LĨNH) */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            {/* Avatar Tướng P1 */}
            <div className="relative w-9 h-11 rounded-lg border-2 border-amber-400 bg-amber-950 overflow-hidden shrink-0 shadow-md">
              <img
                src={p1WarlordData.portrait3D || '/assets/aistudio/IMG_2711_a7aea1e8.png'}
                alt={player1.name}
                className="w-full h-full object-cover object-top scale-110"
              />
              {isP1Turn && (
                <span className="absolute bottom-0 inset-x-0 bg-amber-400 text-[6px] text-stone-950 font-black text-center uppercase leading-tight">
                  LƯỢT TA
                </span>
              )}
            </div>

            {/* Cột Tên & 3 Thanh Riêng Biệt: Máu (Đỏ) - Giáp (Xanh lá) - Mana (Xanh lam) */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Tên & Tốc Độ */}
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-[10px] sm:text-[11px] font-black font-display text-amber-300 truncate">
                  {player1.name}
                </span>
                <span className="text-[8px] font-mono font-bold text-amber-400 shrink-0">
                  ⚡SPD {player1.spd}
                </span>
              </div>

              {/* THANH 1: MÁU (HP - ĐỎ) */}
              <div className="relative w-full h-3.5 bg-stone-900 rounded overflow-hidden border border-rose-500/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-700 via-rose-500 to-red-500 transition-all duration-300"
                  style={{ width: `${p1HpPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>❤️ MÁU</span>
                  <span className="tabular-nums">{player1.hp}/{player1.maxHp}</span>
                </div>
              </div>

              {/* THANH 2: HỘ GIÁP (DEF - XANH LÁ) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-emerald-500/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-700 via-green-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${p1ArmorPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>🛡️ GIÁP</span>
                  <span className="tabular-nums">{player1.armor}/{player1.maxArmor}</span>
                </div>
              </div>

              {/* THANH 3: NỘ KHÍ (MANA - XANH LAM) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-sky-500/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${p1ManaPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>☯️ MANA</span>
                  <span className="tabular-nums">{player1.mana}/{player1.maxMana}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CHÍNH GIỮA: ĐỒNG HỒ ĐẾM NGƯỢC (NHẤP ĐỂ CÀI ĐẶT GIỜ) & HUY HIỆU VS */}
          <div className="shrink-0 flex flex-col items-center justify-center px-0.5">
            <button
              type="button"
              onClick={onOpenTimerModal}
              title="Nhấn để cài đặt thời gian đếm ngược mỗi lượt"
              className={`px-1.5 py-0.5 rounded-lg border shadow-lg flex items-center gap-0.5 transition-all cursor-pointer active:scale-95 ${
                turnTimerEnabled
                  ? timeLeft <= 5
                    ? 'bg-red-950 border-red-400 text-red-200 animate-pulse scale-105'
                    : 'bg-amber-950/90 border-amber-400 text-yellow-300'
                  : 'bg-stone-900 border-amber-700/60 text-amber-300'
              }`}
            >
              <Clock className="w-2.5 h-2.5 text-amber-300 shrink-0" />
              <span className="font-mono tabular-nums text-[9px] font-black">
                {turnTimerEnabled ? `${timeLeft}s` : '∞'}
              </span>
            </button>

            <span className="font-display font-black text-[9px] text-amber-400 italic tracking-wider mt-0.5">
              VS
            </span>

            <span
              className={`text-[7px] font-black transition-all ${
                isP1Turn ? 'text-amber-400 animate-pulse' : 'text-rose-400 animate-pulse'
              }`}
            >
              {isP1Turn ? '◀ TA' : 'ĐỊCH ▶'}
            </span>
          </div>

          {/* BÊN PHẢI: QUÂN ĐỊCH (P2 - TƯỚNG SỨ QUÂN ĐỐI NGHỊCH) */}
          <div className="flex-1 min-w-0 flex items-center flex-row-reverse gap-1.5">
            {/* Avatar Tướng P2 */}
            <div className="relative w-9 h-11 rounded-lg border-2 border-rose-500 bg-red-950 overflow-hidden shrink-0 shadow-md">
              <img
                src={p2WarlordData.portrait3D || '/assets/aistudio/IMG_2712_82d6b35e.png'}
                alt={player2.name}
                className="w-full h-full object-cover object-top scale-110 -scale-x-100"
              />
              {isP2Turn && (
                <span className="absolute bottom-0 inset-x-0 bg-rose-500 text-[6px] text-white font-black text-center uppercase leading-tight">
                  LƯỢT ĐỊCH
                </span>
              )}
            </div>

            {/* Cột Tên & 3 Thanh Riêng Biệt P2 (Đối xứng) */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Tên & Tốc Độ */}
              <div className="flex items-center justify-between flex-row-reverse gap-1 leading-none">
                <span className="text-[10px] sm:text-[11px] font-black font-display text-rose-300 truncate text-right">
                  {player2.name}
                </span>
                <span className="text-[8px] font-mono font-bold text-rose-400 shrink-0">
                  ⚡SPD {player2.spd}
                </span>
              </div>

              {/* THANH 1: MÁU P2 (HP - ĐỎ) */}
              <div className="relative w-full h-3.5 bg-stone-900 rounded overflow-hidden border border-rose-500/80 shadow-inner flex justify-end">
                <div
                  className="h-full bg-gradient-to-l from-red-700 via-rose-500 to-red-500 transition-all duration-300"
                  style={{ width: `${p2HpPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between flex-row-reverse text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>MÁU ❤️</span>
                  <span className="tabular-nums">{player2.hp}/{player2.maxHp}</span>
                </div>
              </div>

              {/* THANH 2: HỘ GIÁP P2 (DEF - XANH LÁ) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-emerald-500/80 shadow-inner flex justify-end">
                <div
                  className="h-full bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${p2ArmorPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between flex-row-reverse text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>GIÁP 🛡️</span>
                  <span className="tabular-nums">{player2.armor}/{player2.maxArmor}</span>
                </div>
              </div>

              {/* THANH 3: NỘ KHÍ P2 (MANA - XANH LAM) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-sky-500/80 shadow-inner flex justify-end">
                <div
                  className="h-full bg-gradient-to-l from-blue-700 via-sky-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${p2ManaPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between flex-row-reverse text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>MANA ☯️</span>
                  <span className="tabular-nums">{player2.mana}/{player2.maxMana}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SÀN ĐẤU 3D TÁCH BIỆT PHÍA DƯỚI KHUNG HUD — KHÔNG BAO GIỜ BỊ THANH MÁU ĐÈ LÊN TƯỚNG */}
      <div className="relative flex-1 min-h-[125px] w-full overflow-hidden flex items-end justify-between px-3 sm:px-6 pb-1.5 z-10 pointer-events-none">
        {/* NỀN CHIẾN TRƯỜNG CỔ ĐẠI HOA LƯ — NÚI ĐÁ VÔI, TRĂNG MÁU, LỬA TRẠI & ĐÀI TRỐNG ĐỒNG */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, #120d1d 0%, #163329 44%, #23170d 78%, #120c07 100%)',
          }}
        >
          <div className="absolute inset-0 bg-bronze-pattern opacity-35" />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.22)_0%,transparent_70%)] pointer-events-none" />
          <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="absolute inset-x-0 bottom-8 w-full h-3/5 opacity-55">
            <polygon points="0,160 0,95 45,42 95,105 150,30 210,100 265,48 325,95 370,38 400,85 400,160" fill="#0f172a" />
            <polygon points="20,160 75,65 130,115 195,52 255,112 315,58 380,110 400,160" fill="#1c1917" />
          </svg>
          <div className="absolute inset-x-0 bottom-6 h-1/2 bg-[radial-gradient(ellipse_at_bottom,#f59e0b_0%,transparent_75%)] opacity-30" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-stone-950 via-stone-900/95 to-amber-950/40 border-t border-amber-700/60" />
        </div>

        {/* TƯỚNG P1 (BÊN TRÁI CÂN ĐỐI) */}
        <div
          className="relative flex flex-col items-center transition-all duration-300 ease-out z-20"
          style={{
            transform: getP1CombatTransform(),
            transformOrigin: 'bottom center',
          }}
        >
          {/* Vệt bụi khói dưới vó linh thú khi xung phong */}
          {(player1.status === 'attacking' || player1.status === 'skill') && (
            <div className="absolute bottom-2 -left-6 w-24 h-6 rounded-full bg-gradient-to-r from-amber-500/60 to-transparent blur-sm pointer-events-none animate-pulse" />
          )}

          {/* Vòng hào quang chân đế dưới vó thú */}
          <div className="absolute bottom-1 w-28 sm:w-36 h-5 rounded-[100%] bg-black/75 blur-[2px] pointer-events-none" />
          <div
            className={`absolute bottom-1 w-24 sm:w-32 h-4 rounded-[100%] border transition-all pointer-events-none ${
              isP1Turn
                ? 'border-amber-400/90 shadow-[0_0_14px_rgba(251,191,36,0.8)]'
                : 'border-amber-700/35'
            }`}
          />

          {/* Tạo Hình Tướng & Linh Thú 3D Gốc Sống Động */}
          <div className="relative w-36 sm:w-44 h-36 sm:h-44 flex items-end justify-center">
            <CombatGeneralRig
              fighter={player1}
              warlord={p1WarlordData}
              status={player1.status}
              isFacingRight={true}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* KHÔNG GIAN TRUNG TÂM: VỆT CHÉM KIẾM KHÍ & SỐ SÁT THƯƠNG BAY LÊN */}
        <div className="relative flex-1 h-full flex items-center justify-center pointer-events-none z-30">
          {slashActive && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 z-40 ${
                slashTarget === 'p2' ? 'right-2 sm:right-6' : 'left-2 sm:left-6'
              }`}
            >
              <svg viewBox="0 0 160 140" className="w-44 h-40 slash-effect overflow-visible">
                <defs>
                  <linearGradient id="slashFire3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor={slashTarget === 'p2' ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>
                </defs>
                <path
                  d={slashTarget === 'p2' ? 'M 10 120 Q 90 20 155 15' : 'M 150 120 Q 70 20 5 15'}
                  fill="none"
                  stroke="url(#slashFire3D)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d={slashTarget === 'p2' ? 'M 20 125 Q 95 35 155 30' : 'M 140 125 Q 65 35 5 30'}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* BANNER TUYỆT KỸ NỘ */}
          {activeSkillCaster && (
            <div className="absolute top-1 flex flex-col items-center justify-center z-40 animate-bounce">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 border-2 border-yellow-100 shadow-[0_0_25px_rgba(251,191,36,1)] text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                <Zap className="w-3.5 h-3.5 fill-stone-950" />
                <span>{activeSkillCaster.skillName}</span>
              </div>
            </div>
          )}

          {/* SỐ SÁT THƯƠNG & HIỆU ỨNG BAY LÊN */}
          {floatingTexts.map((item) => (
            <div
              key={item.id}
              className={`absolute font-black text-xs sm:text-sm floating-damage z-40 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] whitespace-nowrap ${
                item.target === 'p1' ? '-left-8 sm:-left-14' : '-right-8 sm:-right-14'
              } ${
                item.type === 'crit'
                  ? 'text-yellow-300 font-mono text-sm sm:text-lg scale-110'
                  : item.type === 'damage'
                  ? 'text-red-400 font-mono text-xs sm:text-sm'
                  : item.type === 'heal'
                  ? 'text-emerald-300 text-xs'
                  : item.type === 'armor'
                  ? 'text-green-300 text-xs'
                  : item.type === 'gold'
                  ? 'text-yellow-300 text-xs'
                  : item.type === 'extra_turn'
                  ? 'text-amber-300 text-xs uppercase animate-pulse'
                  : 'text-sky-300 text-xs'
              }`}
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* TƯỚNG P2 (BÊN PHẢI CÂN ĐỐI) */}
        <div
          className="relative flex flex-col items-center transition-all duration-300 ease-out z-20"
          style={{
            transform: getP2CombatTransform(),
            transformOrigin: 'bottom center',
          }}
        >
          {(player2.status === 'attacking' || player2.status === 'skill') && (
            <div className="absolute bottom-2 -right-6 w-24 h-6 rounded-full bg-gradient-to-l from-red-500/60 to-transparent blur-sm pointer-events-none animate-pulse" />
          )}

          <div className="absolute bottom-1 w-28 sm:w-36 h-5 rounded-[100%] bg-black/75 blur-[2px] pointer-events-none" />
          <div
            className={`absolute bottom-1 w-24 sm:w-32 h-4 rounded-[100%] border transition-all pointer-events-none ${
              isP2Turn
                ? 'border-rose-400/90 shadow-[0_0_14px_rgba(244,63,94,0.8)]'
                : 'border-rose-900/35'
            }`}
          />

          {/* Tạo Hình Tướng & Linh Thú 3D Gốc Sống Động */}
          <div className="relative w-36 sm:w-44 h-36 sm:h-44 flex items-end justify-center">
            <CombatGeneralRig
              fighter={player2}
              warlord={p2WarlordData}
              status={player2.status}
              isFacingRight={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


