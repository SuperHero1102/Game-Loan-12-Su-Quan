/**
 * Loạn 12 Sứ Quân — Phân Đoạn Hành Quân Trước Trận Đấu (Marching Roadmap)
 * Hiển thị tạo hình 3D Đinh Bộ Lĩnh cưỡi Trâu Chiến Hoàng Gia đối đầu Tạo Hình 3D Sứ Quân
 * cùng bảng đối chiếu 4 chỉ số (HP, ATK, DEF, SPD) và Kỹ Năng Nội Tại trước khi KHAI CHIẾN.
 */

import React, { useState, useEffect } from 'react';
import { Warlord, PlayerProfile } from '../../types/game';
import { DINH_BO_LINH } from '../../data/warlords';
import { CombatGeneralRig } from '../battle/CombatGeneralRig';
import { TurnTimerModal } from '../common/TurnTimerModal';
import { soundEngine } from '../../services/audio';
import { ArrowLeft, Swords, Shield, Heart, Award, Volume2, VolumeX, Clock, Sparkles, X } from 'lucide-react';

interface MarchingRoadmap2DProps {
  warlord: Warlord;
  stageNumber: number;
  profile: PlayerProfile;
  bonusAtk: number;
  bonusDef: number;
  bonusHp: number;
  isMuted: boolean;
  onToggleMute: () => void;
  turnTimerEnabled: boolean;
  turnTimeLimit?: number;
  onToggleTurnTimer: () => void;
  onUpdateTurnTimer?: (enabled: boolean, timeLimit: number) => void;
  onStartBattle: () => void;
  onBack: () => void;
}

export const MarchingRoadmap2D: React.FC<MarchingRoadmap2DProps> = ({
  warlord,
  stageNumber,
  profile,
  bonusAtk,
  bonusDef,
  bonusHp,
  isMuted,
  onToggleMute,
  turnTimerEnabled,
  turnTimeLimit = 20,
  onToggleTurnTimer,
  onUpdateTurnTimer,
  onStartBattle,
  onBack,
}) => {
  const [marchProgress, setMarchProgress] = useState(12);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [showTimerModal, setShowTimerModal] = useState(false);

  useEffect(() => {
    soundEngine.playBronzeGong();
  }, []);

  const dialogues = [
    {
      speaker: 'Thám Mã Tiền Trạm',
      avatar: '🚩',
      text: `Bẩm Vạn Thắng Vương! Đại quân đã tiến sát thành lũy ${warlord.territory}. Sứ quân ${warlord.name} cưỡi ${warlord.mountName} đang dàn trận nghênh chiến!`,
    },
    {
      speaker: `${warlord.name} (${warlord.title})`,
      avatar: warlord.avatarEmoji,
      text: `"${warlord.quote}"`,
    },
    {
      speaker: 'Đinh Bộ Lĩnh (Vạn Thắng Vương)',
      avatar: '🐃',
      text: 'Toàn quân nghe lệnh! Giương cao Cờ Lau, vung Đại Đao Lửa, tiến lên thu phục giang sơn!',
    },
  ];

  const handleMarchForward = () => {
    setMarchProgress((prev) => Math.min(36, prev + 12));
    if (dialogueStep < dialogues.length - 1) {
      setDialogueStep((prev) => prev + 1);
    }
    soundEngine.playShield();
  };

  const handleLaunchCombat = () => {
    soundEngine.playBronzeGong();
    soundEngine.playBloodSwordSlash();
    onStartBattle();
  };

  return (
    <div className="relative w-full flex-1 h-full flex flex-col justify-between bg-bronze-pattern text-stone-100 select-none overflow-hidden safe-top">
      {/* TOP HEADER (An toàn dưới tai thỏ iOS) */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between gap-2 px-3 py-2 mb-1 border-b border-amber-800/80 z-20 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-stone-900 border border-amber-700/60 active:scale-95 transition whitespace-nowrap shrink-0 cursor-pointer shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Bản đồ</span>
        </button>

        <div className="text-center min-w-0">
          <span className="text-[10px] font-mono text-amber-400 block tracking-widest uppercase whitespace-nowrap truncate">
            TIỀN TUYẾN HÀNH QUÂN
          </span>
          <span className="text-xs font-black font-display text-yellow-300 uppercase whitespace-nowrap truncate block">
            ẢI {stageNumber}: {warlord.territory}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onUpdateTurnTimer) {
                setShowTimerModal(true);
              } else {
                onToggleTurnTimer();
              }
            }}
            className={`px-2 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
              turnTimerEnabled
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/80 ring-1 ring-amber-400/50'
                : 'bg-stone-900 text-stone-400 border-stone-800'
            }`}
            title="Nhấn để cài đặt thời gian đếm ngược mỗi lượt (15s, 20s, 30s hoặc Không tính thời gian)"
          >
            <Clock className={`w-3.5 h-3.5 shrink-0 ${turnTimerEnabled ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`} />
            <span className="font-mono">{turnTimerEnabled ? `${turnTimeLimit}s` : '∞'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-300 hover:bg-stone-800 cursor-pointer"
            title="Bật/Tắt âm"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-500/70 active:scale-95 transition cursor-pointer shadow"
            title="Đóng và quay về Bản Đồ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KHUNG CẢNH HÀNH QUÂN ĐỐI ĐẦU TRÊN THÀNH LŨY */}
      <div className="w-full max-w-md mx-auto flex-1 relative rounded-2xl overflow-hidden border-2 border-amber-700/80 shadow-2xl flex flex-col justify-between my-1 mx-2.5">
        {/* Lớp Bầu Trời & Thành Lũy */}
        <div
          className="absolute inset-0 bg-cover bg-bottom opacity-95"
          style={{
            background: 'linear-gradient(180deg, #17153b 0%, #134e4a 45%, #14532d 75%, #1c1917 100%)',
          }}
        >
          <div className="absolute top-3 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-rose-600 blur-sm opacity-65" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-stone-950 via-stone-800 to-stone-900 border-t-4 border-amber-800" />
        </div>

        {/* 2 TƯỚNG CƯỠI LINH THÚ ĐỐI ĐẦU TRỰC TIẾP TRÊN THÀNH LŨY (KHÔNG VIỀN KHUNG ẢNH CỨNG) */}
        <div className="relative w-full flex-1 flex items-center justify-between px-3 pt-3 pb-2 z-10 gap-2">
          {/* Đinh Bộ Lĩnh Cưỡi Kim Ngưu */}
          <div
            className="flex flex-col items-center w-[46%] transition-transform duration-500"
            style={{ transform: `translateX(${marchProgress}px)` }}
          >
            <div className="text-[10px] font-black font-display text-amber-300 bg-stone-950/90 px-2.5 py-0.5 rounded-full border border-amber-500 mb-1 shadow whitespace-nowrap">
              Đinh Bộ Lĩnh
            </div>
            <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-end justify-center">
              <CombatGeneralRig
                warlord={DINH_BO_LINH}
                status={dialogueStep === 2 ? 'attacking' : 'idle'}
                isFacingRight={true}
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="text-amber-400 font-black text-base sm:text-lg drop-shadow animate-pulse">VS</div>

          {/* Sứ Quân Trấn Thủ Cưỡi Linh Thú */}
          <div className="flex flex-col items-center w-[46%]">
            <div className="text-[10px] font-black font-display text-rose-300 bg-stone-950/90 px-2.5 py-0.5 rounded-full border border-rose-500 mb-1 shadow truncate max-w-full">
              {warlord.name}
            </div>
            <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-end justify-center">
              <CombatGeneralRig
                warlord={warlord}
                status={dialogueStep === 1 ? 'attacking' : 'idle'}
                isFacingRight={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* KHUNG THOẠI CỐT TRUYỆN LỊCH SỬ */}
        <div className="relative mx-3 mb-2.5 p-2.5 bg-stone-950/90 backdrop-blur-md rounded-xl border border-amber-700/80 shadow-2xl z-20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{dialogues[dialogueStep].avatar}</span>
            <span className="text-xs font-black text-amber-300 font-display">
              {dialogues[dialogueStep].speaker}
            </span>
          </div>
          <p className="text-xs text-stone-200 leading-relaxed italic min-h-[34px]">
            {dialogues[dialogueStep].text}
          </p>

          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-amber-950/80 text-[11px]">
            <span className="text-stone-400">
              Đoạn thoại: {dialogueStep + 1}/{dialogues.length}
            </span>
            {dialogueStep < dialogues.length - 1 ? (
              <button
                type="button"
                onClick={handleMarchForward}
                className="text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1"
              >
                Tiếp tục hành quân ❯
              </button>
            ) : (
              <span className="text-emerald-400 font-bold">✓ Đã dàn trận sẵn sàng!</span>
            )}
          </div>
        </div>
      </div>

      {/* BẢNG TÌNH BÁO CHIẾN TRƯỜNG & ĐỐI CHIẾU TỐC ĐỘ (SPD) + NỘI TẠI */}
      <div className="w-full max-w-md mx-auto bg-stone-900/95 rounded-xl p-2.5 border border-amber-900/60 shadow-lg z-20 mb-1.5 px-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Đinh Bộ Lĩnh */}
          <div className="p-2 bg-stone-950/80 rounded-lg border border-amber-900/40 space-y-0.5">
            <span className="font-bold text-amber-300 block text-[11px]">Đinh Bộ Lĩnh (Ta)</span>
            <div className="flex items-center justify-between text-[10px] text-rose-300">
              <span className="flex items-center gap-1">
                <Heart className="w-2.5 h-2.5 fill-rose-500" /> HP:
              </span>
              <strong>{profile.baseHp + bonusHp}</strong>
            </div>
            <div className="flex items-center justify-between text-[10px] text-amber-300">
              <span className="flex items-center gap-1">
                <Swords className="w-2.5 h-2.5 text-amber-400" /> ATK / DEF:
              </span>
              <strong>
                {profile.baseAtk + bonusAtk} / {profile.baseDef + bonusDef}
              </strong>
            </div>
            <div className="flex items-center justify-between text-[10px] text-sky-300">
              <span>🏃 Tốc độ (SPD):</span>
              <strong>{DINH_BO_LINH.spd}</strong>
            </div>
          </div>

          {/* Sứ Quân */}
          <div className="p-2 bg-stone-950/80 rounded-lg border border-rose-950 space-y-0.5">
            <span className="font-bold text-rose-300 block text-[11px] truncate">{warlord.name}</span>
            <div className="flex items-center justify-between text-[10px] text-rose-400">
              <span className="flex items-center gap-1">
                <Heart className="w-2.5 h-2.5 fill-rose-500" /> HP:
              </span>
              <strong>{warlord.baseHp}</strong>
            </div>
            <div className="flex items-center justify-between text-[10px] text-orange-300">
              <span className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 fill-emerald-500" /> ATK / Giáp:
              </span>
              <strong>
                {warlord.baseAtk} / {warlord.baseArmor}
              </strong>
            </div>
            <div className="flex items-center justify-between text-[10px] text-sky-300">
              <span>🏃 Tốc độ (SPD):</span>
              <strong>{warlord.spd}</strong>
            </div>
          </div>
        </div>

        {/* Nội tại & Quyền Tiên Phong */}
        <div className="mt-2 pt-1.5 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px]">
          <span className="text-amber-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            Nội tại địch: <strong className="text-yellow-300">{warlord.passiveName}</strong> ({warlord.role})
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
            <Award className="w-3 h-3" />
            {DINH_BO_LINH.spd >= warlord.spd ? 'Ta đánh trước Lượt 1!' : 'Địch đánh trước Lượt 1!'}
          </span>
        </div>
      </div>

      {/* NÚT KHAI CHIẾN & NÚT THOÁT Ở ĐÁY FULL-BLEED ĐỒNG ĐÔNG SƠN */}
      <div className="w-full bg-gradient-to-t from-[#1c1008] via-[#27170c] to-stone-900/95 border-t-2 border-amber-700/80 px-3 pt-2 pb-1.5 safe-bottom z-20 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.85)]">
        <div className="w-full max-w-md mx-auto space-y-1.5">
          <button
            type="button"
            onClick={handleLaunchCombat}
            className="w-full py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-stone-950 font-black text-sm sm:text-base rounded-xl uppercase tracking-wider shadow-2xl active:scale-95 transition flex items-center justify-center gap-2 border-2 border-yellow-300 cursor-pointer animate-pulse"
          >
            <Swords className="w-5 h-5 fill-stone-950" />
            <span>KHAI CHIẾN (VÀO TRẬN ĐẤU 3D)</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 bg-stone-900/95 hover:bg-stone-800 active:scale-95 text-amber-300 font-bold text-xs rounded-xl border border-amber-600/80 flex items-center justify-center gap-1.5 shadow transition cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>THOÁT VỀ BẢN ĐỒ HÀNH QUÂN</span>
          </button>
        </div>
      </div>

      {/* MODAL CÀI ĐẶT THỜI GIAN ĐẾM NGƯỢC KHI ẤN ĐỒNG HỒ */}
      {showTimerModal && onUpdateTurnTimer && (
        <TurnTimerModal
          enabled={turnTimerEnabled}
          timeLimit={turnTimeLimit}
          onSave={(enabled, newLimit) => {
            onUpdateTurnTimer(enabled, newLimit);
            setShowTimerModal(false);
          }}
          onClose={() => setShowTimerModal(false)}
        />
      )}
    </div>
  );
};
