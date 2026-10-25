/**
 * Loạn 12 Sứ Quân — Title Screen (Màn hình mở đầu hào hùng)
 * Nổi bật với Biểu Tượng Logo 3D "12 SỨ QUÂN" (Khiên Trống Đồng, Rồng Vàng Uốn Lượn & Song Kiếm)
 * Đầy đủ các chế độ: Bản Đồ 3D Chiến Dịch, Danh Sách 12 Ải, Bộ Sưu Tập 13 Thẻ Tướng 3D, Đấu Với Máy, Đối Kháng 2 Người
 */

import React, { useState } from 'react';
import { AppLogo3D } from '../common/AppLogo3D';
import { TurnTimerModal } from '../common/TurnTimerModal';
import { GameGuideModal } from '../guide/GameGuideModal';
import { NetworkBadge } from '../common/NetworkBadge';
import { OnlineSyncState } from '../../hooks/useOnlineSync';
import {
  Smartphone,
  BookOpen,
  Volume2,
  VolumeX,
  Trophy,
  Bot,
  Map,
  Clock,
  Shield,
} from 'lucide-react';

interface TitleScreenProps {
  onStartCampaign: () => void;
  onOpenStageSelect: () => void;
  onOpenHeroCards?: () => void;
  onOpenPvE: () => void;
  onOpenPvP: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  turnTimerEnabled?: boolean;
  turnTimeLimit?: number;
  onToggleTurnTimer?: () => void;
  onUpdateTurnTimer?: (enabled: boolean, timeLimit: number) => void;
  syncState?: OnlineSyncState;
  conqueredCount: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartCampaign,
  onOpenStageSelect,
  onOpenHeroCards,
  onOpenPvE,
  onOpenPvP,
  isMuted,
  onToggleMute,
  turnTimerEnabled = true,
  turnTimeLimit = 20,
  onToggleTurnTimer,
  onUpdateTurnTimer,
  syncState,
  conqueredCount,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);

  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-between bg-bronze-pattern text-stone-100 select-none overflow-hidden">
      {/* Background Hoa Văn Trống Đồng & Ánh Lửa */}
      <div className="absolute inset-0 bg-bronze-pattern opacity-95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_75%)] pointer-events-none" />

      {/* Top Header Utilities — Thanh Đỉnh Hoàng Kim Tràn Viền */}
      <div className="royal-header-bar flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/90 border border-amber-400/80 rounded-lg text-xs font-bold text-amber-200 whitespace-nowrap shadow-md">
          <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="tabular-nums">Đã dẹp: {conqueredCount}/12</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Huy hiệu trạng thái Mạng & Offline / Cập nhật tự động */}
          {syncState && <NetworkBadge syncState={syncState} />}

          {/* Nút biểu tượng đồng hồ: Mở bảng cài đặt thời gian chờ (15s, 20s, 30s... hoặc Vô hạn) */}
          {(onUpdateTurnTimer || onToggleTurnTimer) && (
            <button
              type="button"
              onClick={() => {
                if (onUpdateTurnTimer) {
                  setShowTimerModal(true);
                } else if (onToggleTurnTimer) {
                  onToggleTurnTimer();
                }
              }}
              className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 text-[11px] font-bold cursor-pointer shadow ${
                turnTimerEnabled
                  ? 'bg-amber-950/90 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                  : 'bg-amber-950/60 border-amber-700/70 text-amber-300/80 hover:bg-amber-900/70'
              }`}
              title="Nhấn để cài đặt thời gian đếm ngược mỗi lượt (15s, 20s, 30s hoặc Không tính thời gian)"
            >
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${
                  turnTimerEnabled ? 'text-yellow-400' : 'text-amber-400'
                }`}
              />
              <span className="font-mono tabular-nums">
                {turnTimerEnabled ? `${turnTimeLimit}s` : '∞'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-amber-950/90 border border-amber-500/80 text-amber-200 hover:bg-amber-900 cursor-pointer shadow"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Vùng Nội Dung Trung Tâm Co Giãn Cân Đối */}
      <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-evenly px-3.5 sm:px-5 py-1.5 z-10 overflow-y-auto">
        {/* Main Brand & 3D App Icon Logo */}
        <div className="flex flex-col items-center text-center py-0.5 max-w-sm">
          <AppLogo3D
            size="lg"
            className="mb-1 hover:scale-105 transition-transform duration-300"
          />

          <h1 className="text-2xl sm:text-3xl font-black font-display dong-son-gold-text tracking-wider uppercase drop-shadow-lg leading-tight whitespace-nowrap">
            LOẠN 12 SỨ QUÂN
          </h1>
          <div className="h-0.5 w-40 bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-1" />
          <p className="text-xs font-bold text-amber-200 tracking-wide uppercase whitespace-nowrap">
            HUYỀN THOẠI SỬ VIỆT · CHIẾN THUẬT ĐỐI KHÁNG
          </p>
          <p className="text-[11px] text-amber-100/80 mt-0.5 max-w-xs leading-snug">
            Theo chân Vạn Thắng Vương Đinh Bộ Lĩnh cưỡi Kim Ngưu thu phục 12 Sứ
            Quân — thống nhất giang sơn!
          </p>
        </div>

        {/* Action Buttons Menu: Đầy đủ các chế độ chơi mạ đồng hoàng kim */}
        <div className="w-full max-w-xs flex flex-col gap-1.5 sm:gap-2">
          {/* 1. Bắt Đầu Chiến Dịch Bản Đồ Hành Quân */}
          <button
            type="button"
            onClick={onStartCampaign}
            className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.45)] border-2 border-yellow-200 flex items-center justify-center gap-2 uppercase tracking-wider transition cursor-pointer whitespace-nowrap"
          >
            <Map className="w-4 h-4 text-stone-950 shrink-0" />
            <span className="truncate">BẢN ĐỒ HÀNH QUÂN</span>
          </button>

          {/* 2. Bộ Sưu Tập Thẻ Tướng & Thuộc Tính */}
          {onOpenHeroCards && (
            <button
              type="button"
              onClick={onOpenHeroCards}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-900/95 via-amber-800/95 to-amber-900/95 hover:border-yellow-300 active:scale-95 text-yellow-200 font-black text-xs rounded-xl border-2 border-amber-400/90 shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide transition cursor-pointer whitespace-nowrap"
            >
              <Shield className="w-4 h-4 text-yellow-400 shrink-0" />
              <span className="truncate">THẺ TƯỚNG &amp; THUỘC TÍNH</span>
            </button>
          )}

          {/* 3. Danh Sách 12 Ải Chiến Dịch */}
          <button
            type="button"
            onClick={onOpenStageSelect}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-950/95 via-amber-900/90 to-amber-950/95 hover:border-amber-400 active:scale-95 text-amber-200 font-bold text-xs rounded-xl border border-amber-500/80 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide transition cursor-pointer whitespace-nowrap"
          >
            <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="truncate">TIẾN TRÌNH 12 ẢI SỨ QUÂN</span>
          </button>

          {/* 4. Đấu Với Máy */}
          <button
            type="button"
            onClick={onOpenPvE}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-950/95 via-teal-950/90 to-sky-950/95 hover:border-sky-400 active:scale-95 text-sky-200 font-bold text-xs rounded-xl border border-sky-500/80 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide transition cursor-pointer whitespace-nowrap"
          >
            <Bot className="w-4 h-4 text-sky-300 shrink-0" />
            <span className="truncate">KHIÊU CHIẾN VỚI MÁY</span>
          </button>

          {/* 5. Võ Đài Đối Kháng */}
          <button
            type="button"
            onClick={onOpenPvP}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-950/95 via-red-950/90 to-rose-950/95 hover:border-rose-400 active:scale-95 text-rose-200 font-bold text-xs rounded-xl border border-rose-500/80 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide transition cursor-pointer whitespace-nowrap"
          >
            <Smartphone className="w-4 h-4 text-rose-300 shrink-0" />
            <span className="truncate">VÕ ĐÀI ĐỐI KHÁNG</span>
          </button>

          {/* 6. Hướng Dẫn Tân Thủ & Thông Tin */}
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="w-full py-2 px-4 bg-amber-950/80 hover:bg-amber-900/80 active:scale-95 text-amber-300 hover:text-yellow-200 font-bold text-xs rounded-xl border border-amber-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shadow"
          >
            <BookOpen className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="truncate">Hướng dẫn tân thủ &amp; Cốt truyện</span>
          </button>
        </div>
      </div>

      {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền */}
      <div className="royal-bottom-dock flex items-center justify-between text-[10px] text-amber-200 font-bold tracking-wide whitespace-nowrap">
        <span className="text-yellow-400">⚜️ ĐẠI CỒ VIỆT · 968</span>
        <span className="text-amber-200/95 truncate px-2">
          Phát triển bởi Gem Pro · Hải An Group
        </span>
        <span className="text-yellow-400">13 THẺ 3D ⚜️</span>
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

      {/* MODAL HƯỚNG DẪN CHI TIẾT & CỐT TRUYỆN SA BÀN 12 SỨ QUÂN */}
      {showGuide && <GameGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};
