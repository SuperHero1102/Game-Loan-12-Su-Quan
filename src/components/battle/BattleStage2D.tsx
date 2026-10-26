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
  localRole?: 'p1' | 'p2';
}

export const BattleStage2D: React.FC<BattleStage2DProps> = ({
  player1,
  player2,
  currentTurn,
  floatingTexts,
  slashActive,
  slashTarget,
  gameMode,
  turnTimerEnabled = true,
  timeLeft = 20,
  onOpenTimerModal,
  localRole = 'p1',
}) => {
  // Xác định vị trí hiển thị: Bên trái luôn là Quân Ta, Bên phải luôn là Quân Địch theo góc nhìn thiết bị cục bộ
  const isLocalP2 = localRole === 'p2';
  const leftFighter = isLocalP2 ? player2 : player1;
  const rightFighter = isLocalP2 ? player1 : player2;

  const leftHpPercent = Math.max(0, Math.min(100, (leftFighter.hp / leftFighter.maxHp) * 100));
  const rightHpPercent = Math.max(0, Math.min(100, (rightFighter.hp / rightFighter.maxHp) * 100));

  const leftArmorPercent = Math.max(0, Math.min(100, (leftFighter.armor / leftFighter.maxArmor) * 100));
  const rightArmorPercent = Math.max(0, Math.min(100, (rightFighter.armor / rightFighter.maxArmor) * 100));

  const leftManaPercent = Math.max(0, Math.min(100, (leftFighter.mana / leftFighter.maxMana) * 100));
  const rightManaPercent = Math.max(0, Math.min(100, (rightFighter.mana / rightFighter.maxMana) * 100));

  // Kiểm tra lượt theo từng góc nhìn: nếu đến lượt của nhân vật cục bộ thì hiển thị LƯỢT TA
  const isLeftTurn = isLocalP2 ? currentTurn === 'p2' : currentTurn === 'p1';
  const isRightTurn = isLocalP2 ? currentTurn === 'p1' : currentTurn === 'p2';

  const leftWarlordData = ALL_CHARACTERS.find((w) => w.id === leftFighter.id) || ALL_CHARACTERS[0];
  const rightWarlordData = ALL_CHARACTERS.find((w) => w.id === rightFighter.id) || ALL_CHARACTERS[1];

  const activeSkillCaster =
    leftFighter.status === 'skill'
      ? leftFighter
      : rightFighter.status === 'skill'
      ? rightFighter
      : null;

  // Xác định mục tiêu kiếm khí chém trúng: bên trái (Ta) hay bên phải (Địch)
  const isLeftHit = slashActive && (isLocalP2 ? slashTarget === 'p2' : slashTarget === 'p1');
  const isRightHit = slashActive && (isLocalP2 ? slashTarget === 'p1' : slashTarget === 'p2');

  // Chuyển động cân đối 2 bên
  const getLeftCombatTransform = () => {
    if (leftFighter.status === 'skill') {
      return 'translateX(min(52vw, 210px)) translateY(-6px) scale(1.14)';
    }
    if (leftFighter.status === 'attacking') {
      return 'translateX(min(48vw, 190px)) translateY(-4px) scale(1.1)';
    }
    if (leftFighter.status === 'hurt' || isLeftHit) {
      return 'translateX(-22px) rotate(-6deg) scale(0.93)';
    }
    if (leftFighter.status === 'victory') {
      return 'translateY(-4px) scale(1.06)';
    }
    return 'translateX(0) translateY(0) scale(1)';
  };

  const getRightCombatTransform = () => {
    if (rightFighter.status === 'skill') {
      return 'translateX(max(-52vw, -210px)) translateY(-6px) scale(1.14)';
    }
    if (rightFighter.status === 'attacking') {
      return 'translateX(max(-48vw, -190px)) translateY(-4px) scale(1.1)';
    }
    if (rightFighter.status === 'hurt' || isRightHit) {
      return 'translateX(22px) rotate(6deg) scale(0.93)';
    }
    if (rightFighter.status === 'victory') {
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
          {/* BÊN TRÁI: QUÂN TA (LUÔN LÀ VAI TA THEO GÓC NHÌN MÁY HIỆN TẠI) */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            {/* Avatar Tướng Ta */}
            <div className={`relative w-9 h-11 rounded-lg border-2 overflow-hidden shrink-0 shadow-md transition-all ${
              isLeftTurn
                ? 'border-amber-400 bg-amber-950 ring-2 ring-yellow-400/80 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : 'border-amber-600/70 bg-amber-950/80 opacity-90'
            }`}>
              <img
                src={leftWarlordData.portrait3D || '/assets/aistudio/IMG_2711_a7aea1e8.png'}
                alt={leftFighter.name}
                className="w-full h-full object-cover object-top scale-110"
              />
              {isLeftTurn && (
                <span className="absolute bottom-0 inset-x-0 bg-amber-400 text-[6px] text-stone-950 font-black text-center uppercase leading-tight animate-pulse">
                  LƯỢT TA
                </span>
              )}
            </div>

            {/* Cột Tên & 3 Thanh Riêng Biệt: Máu (Đỏ) - Giáp (Xanh lá) - Mana (Xanh lam) */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Tên & Tốc Độ */}
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-[10px] sm:text-[11px] font-black font-display text-amber-300 truncate">
                  {leftFighter.name} {isLocalP2 ? '(Ta)' : ''}
                </span>
                <span className="text-[8px] font-mono font-bold text-amber-400 shrink-0">
                  ⚡SPD {leftFighter.spd}
                </span>
              </div>

              {/* THANH 1: MÁU (HP - ĐỎ) */}
              <div className="relative w-full h-3.5 bg-stone-900 rounded overflow-hidden border border-rose-500/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-700 via-rose-500 to-red-500 transition-all duration-300"
                  style={{ width: `${leftHpPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>❤️ MÁU</span>
                  <span className="tabular-nums">{leftFighter.hp}/{leftFighter.maxHp}</span>
                </div>
              </div>

              {/* THANH 2: HỘ GIÁP (DEF - XANH LÁ) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-emerald-500/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-700 via-green-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${leftArmorPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>🛡️ GIÁP</span>
                  <span className="tabular-nums">{leftFighter.armor}/{leftFighter.maxArmor}</span>
                </div>
              </div>

              {/* THANH 3: NỘ KHÍ (MANA - XANH LAM) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-sky-500/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${leftManaPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>☯️ MANA</span>
                  <span className="tabular-nums">{leftFighter.mana}/{leftFighter.maxMana}</span>
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
                isLeftTurn ? 'text-amber-400 animate-pulse' : 'text-rose-400 animate-pulse'
              }`}
            >
              {isLeftTurn ? '◀ TA' : 'ĐỊCH ▶'}
            </span>
          </div>

          {/* BÊN PHẢI: QUÂN ĐỊCH (LUÔN LÀ VAI ĐỊCH THEO GÓC NHÌN MÁY HIỆN TẠI) */}
          <div className="flex-1 min-w-0 flex items-center flex-row-reverse gap-1.5">
            {/* Avatar Tướng Địch */}
            <div className={`relative w-9 h-11 rounded-lg border-2 overflow-hidden shrink-0 shadow-md transition-all ${
              isRightTurn
                ? 'border-rose-500 bg-red-950 ring-2 ring-rose-400/80 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : 'border-rose-800/70 bg-red-950/80 opacity-90'
            }`}>
              <img
                src={rightWarlordData.portrait3D || '/assets/aistudio/IMG_2712_82d6b35e.png'}
                alt={rightFighter.name}
                className="w-full h-full object-cover object-top scale-110 -scale-x-100"
              />
              {isRightTurn && (
                <span className="absolute bottom-0 inset-x-0 bg-rose-500 text-[6px] text-white font-black text-center uppercase leading-tight animate-pulse">
                  LƯỢT ĐỊCH
                </span>
              )}
            </div>

            {/* Cột Tên & 3 Thanh Riêng Biệt Địch (Đối xứng) */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Tên & Tốc Độ */}
              <div className="flex items-center justify-between flex-row-reverse gap-1 leading-none">
                <span className="text-[10px] sm:text-[11px] font-black font-display text-rose-300 truncate text-right">
                  {rightFighter.name} {!isLocalP2 && gameMode === 'PVP_P2P' ? '(Địch)' : ''}
                </span>
                <span className="text-[8px] font-mono font-bold text-rose-400 shrink-0">
                  ⚡SPD {rightFighter.spd}
                </span>
              </div>

              {/* THANH 1: MÁU ĐỊCH (HP - ĐỎ) */}
              <div className="relative w-full h-3.5 bg-stone-900 rounded overflow-hidden border border-rose-500/80 shadow-inner flex justify-end">
                <div
                  className="h-full bg-gradient-to-l from-red-700 via-rose-500 to-red-500 transition-all duration-300"
                  style={{ width: `${rightHpPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between flex-row-reverse text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>MÁU ❤️</span>
                  <span className="tabular-nums">{rightFighter.hp}/{rightFighter.maxHp}</span>
                </div>
              </div>

              {/* THANH 2: HỘ GIÁP ĐỊCH (DEF - XANH LÁ) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-emerald-500/80 shadow-inner flex justify-end">
                <div
                  className="h-full bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${rightArmorPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between flex-row-reverse text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>GIÁP 🛡️</span>
                  <span className="tabular-nums">{rightFighter.armor}/{rightFighter.maxArmor}</span>
                </div>
              </div>

              {/* THANH 3: NỘ KHÍ ĐỊCH (MANA - XANH LAM) */}
              <div className="relative w-full h-3 bg-stone-900 rounded overflow-hidden border border-sky-500/80 shadow-inner flex justify-end">
                <div
                  className="h-full bg-gradient-to-l from-blue-700 via-sky-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${rightManaPercent}%` }}
                />
                <div className="absolute inset-0 px-1.5 flex items-center justify-between flex-row-reverse text-[8px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <span>MANA ☯️</span>
                  <span className="tabular-nums">{rightFighter.mana}/{rightFighter.maxMana}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SÀN ĐẤU 3D TÁCH BIỆT PHÍA DƯỚI KHUNG HUD */}
      <div className="relative flex-1 min-h-[125px] w-full overflow-hidden flex items-end justify-between px-3 sm:px-6 pb-1.5 z-10 pointer-events-none">
        {/* NỀN CHIẾN TRƯỜNG CỔ ĐẠI HOA LƯ */}
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

        {/* TƯỚNG BÊN TRÁI (QUÂN TA) */}
        <div
          className="relative flex flex-col items-center transition-all duration-300 ease-out z-20"
          style={{
            transform: getLeftCombatTransform(),
            transformOrigin: 'bottom center',
          }}
        >
          {/* Vệt bụi khói dưới vó linh thú khi xung phong */}
          {(leftFighter.status === 'attacking' || leftFighter.status === 'skill') && (
            <div className="absolute bottom-2 -left-6 w-24 h-6 rounded-full bg-gradient-to-r from-amber-500/60 to-transparent blur-sm pointer-events-none animate-pulse" />
          )}

          {/* Vòng hào quang chân đế dưới vó thú */}
          <div className="absolute bottom-1 w-28 sm:w-36 h-5 rounded-[100%] bg-black/75 blur-[2px] pointer-events-none" />
          <div
            className={`absolute bottom-1 w-24 sm:w-32 h-4 rounded-[100%] border transition-all pointer-events-none ${
              isLeftTurn
                ? 'border-amber-400/90 shadow-[0_0_14px_rgba(251,191,36,0.8)]'
                : 'border-amber-700/35'
            }`}
          />

          {/* Tạo Hình Tướng & Linh Thú 3D Gốc Sống Động */}
          <div className="relative w-36 sm:w-44 h-36 sm:h-44 flex items-end justify-center">
            <CombatGeneralRig
              fighter={leftFighter}
              warlord={leftWarlordData}
              status={leftFighter.status}
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
                isRightHit ? 'right-2 sm:right-6' : 'left-2 sm:left-6'
              }`}
            >
              <svg viewBox="0 0 160 140" className="w-44 h-40 slash-effect overflow-visible">
                <defs>
                  <linearGradient id="slashFire3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor={isRightHit ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>
                </defs>
                <path
                  d={isRightHit ? 'M 10 120 Q 90 20 155 15' : 'M 150 120 Q 70 20 5 15'}
                  fill="none"
                  stroke="url(#slashFire3D)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d={isRightHit ? 'M 20 125 Q 95 35 155 30' : 'M 140 125 Q 65 35 5 30'}
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
          {floatingTexts.map((item) => {
            const isLeftTarget = isLocalP2 ? item.target === 'p2' : item.target === 'p1';
            return (
              <div
                key={item.id}
                className={`absolute font-black text-xs sm:text-sm floating-damage z-40 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] whitespace-nowrap ${
                  isLeftTarget ? '-left-8 sm:-left-14' : '-right-8 sm:-right-14'
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
            );
          })}
        </div>

        {/* TƯỚNG BÊN PHẢI (QUÂN ĐỊCH) */}
        <div
          className="relative flex flex-col items-center transition-all duration-300 ease-out z-20"
          style={{
            transform: getRightCombatTransform(),
            transformOrigin: 'bottom center',
          }}
        >
          {(rightFighter.status === 'attacking' || rightFighter.status === 'skill') && (
            <div className="absolute bottom-2 -right-6 w-24 h-6 rounded-full bg-gradient-to-l from-red-500/60 to-transparent blur-sm pointer-events-none animate-pulse" />
          )}

          <div className="absolute bottom-1 w-28 sm:w-36 h-5 rounded-[100%] bg-black/75 blur-[2px] pointer-events-none" />
          <div
            className={`absolute bottom-1 w-24 sm:w-32 h-4 rounded-[100%] border transition-all pointer-events-none ${
              isRightTurn
                ? 'border-rose-400/90 shadow-[0_0_14px_rgba(244,63,94,0.8)]'
                : 'border-rose-900/35'
            }`}
          />

          {/* Tạo Hình Tướng & Linh Thú 3D Gốc Sống Động */}
          <div className="relative w-36 sm:w-44 h-36 sm:h-44 flex items-end justify-center">
            <CombatGeneralRig
              fighter={rightFighter}
              warlord={rightWarlordData}
              status={rightFighter.status}
              isFacingRight={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


