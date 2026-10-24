/**
 * Loạn 12 Sứ Quân — Title Screen (Màn hình mở đầu hào hùng)
 * Nổi bật với Biểu Tượng Logo 3D "12 SỨ QUÂN" (Khiên Trống Đồng, Rồng Vàng Uốn Lượn & Song Kiếm)
 * Đầy đủ các chế độ: Bản Đồ 3D Chiến Dịch, Danh Sách 12 Ải, Bộ Sưu Tập 13 Thẻ Tướng 3D, Đấu Với Máy, Đối Kháng 2 Người
 */

import React, { useState } from 'react';
import { AppLogo3D } from '../common/AppLogo3D';
import { TurnTimerModal } from '../common/TurnTimerModal';
import { GameGuideModal } from '../guide/GameGuideModal';
import { Smartphone, BookOpen, Volume2, VolumeX, Download, Trophy, Bot, Map, Clock, Shield, Copy, Check } from 'lucide-react';

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
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
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
  canInstallPwa,
  onInstallPwa,
  conqueredCount,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [installTab, setInstallTab] = useState<'ios' | 'android'>('ios');
  const [copiedLink, setCopiedLink] = useState(false);

  const activeAppUrl = 'https://ais-dev-s44nqpuehsdi6vvl5dctbh-830645281651.asia-east1.run.app';

  const handleCopyLink = () => {
    try {
      const urlToCopy = (typeof window !== 'undefined' && window.location.href.startsWith('http'))
        ? window.location.href
        : activeAppUrl;
      navigator.clipboard.writeText(urlToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      navigator.clipboard.writeText(activeAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-between bg-bronze-pattern text-stone-100 select-none overflow-hidden">
      {/* Background Hoa Văn Trống Đồng & Ánh Lửa */}
      <div className="absolute inset-0 bg-bronze-pattern opacity-95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_75%)] pointer-events-none" />

      {/* Top Header Utilities — Thanh Đỉnh Hoàng Kim Tràn Viền */}
      <div className="royal-header-bar flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/90 border border-amber-400/80 rounded-lg text-xs font-bold text-amber-200 whitespace-nowrap shadow-md">
          <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>Đã dẹp: {conqueredCount}/12</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Nút Thêm Vào MH Chính (PWA) luôn hiện diện */}
          <button
            type="button"
            onClick={() => {
              if (canInstallPwa && onInstallPwa) {
                onInstallPwa();
              }
              setShowInstallGuide(true);
            }}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-md border border-yellow-200 active:scale-95 transition whitespace-nowrap cursor-pointer"
            title="Đưa game ra màn hình chính điện thoại"
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Đưa ra MH chính</span>
          </button>

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
              <Clock className={`w-3.5 h-3.5 shrink-0 ${turnTimerEnabled ? 'text-yellow-400' : 'text-amber-400'}`} />
              <span className="font-mono">{turnTimerEnabled ? `${turnTimeLimit}s` : '∞'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-amber-950/90 border border-amber-500/80 text-amber-200 hover:bg-amber-900 cursor-pointer shadow"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Vùng Nội Dung Trung Tâm Co Giãn Cân Đối */}
      <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-evenly px-3.5 sm:px-5 py-1.5 z-10 overflow-y-auto">
        {/* Main Brand & 3D App Icon Logo */}
        <div className="flex flex-col items-center text-center py-0.5 max-w-sm">
          <AppLogo3D size="lg" className="mb-1 hover:scale-105 transition-transform duration-300" />

          <h1 className="text-2xl sm:text-3xl font-black font-display dong-son-gold-text tracking-wider uppercase drop-shadow-lg leading-tight whitespace-nowrap">
            LOẠN 12 SỨ QUÂN
          </h1>
          <div className="h-0.5 w-40 bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-1" />
          <p className="text-xs font-bold text-amber-200 tracking-wide uppercase whitespace-nowrap">
            HUYỀN THOẠI SỬ VIỆT · CHIẾN THUẬT ĐỐI KHÁNG
          </p>
          <p className="text-[11px] text-amber-100/80 mt-0.5 max-w-xs leading-snug">
            Theo chân Vạn Thắng Vương Đinh Bộ Lĩnh cưỡi Kim Ngưu thu phục 12 Sứ Quân — thống nhất giang sơn!
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

      {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
      <div className="royal-bottom-dock flex items-center justify-between text-[10px] text-amber-200 font-bold tracking-wide whitespace-nowrap">
        <span className="text-yellow-400">⚜️ ĐẠI CỒ VIỆT · 968</span>
        <span className="text-amber-200/95 truncate px-2">Phát triển bởi Gem Pro · Hải An Group</span>
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

      {/* MODAL HƯỚNG DẪN CÀI ĐẶT RA MÀN HÌNH ĐIỆN THOẠI — TRÀN VIỀN HOÀNG KIM */}
      {showInstallGuide && (
        <div className="modal-commercial-overlay">
          <div className="modal-commercial-shell sm:border-x-2 sm:border-amber-500 shadow-2xl">
            {/* Header Hoàng Kim */}
            <div className="royal-header-bar flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-yellow-300" />
                <h3 className="font-black text-xs sm:text-sm text-yellow-200 uppercase tracking-wide">
                  ĐƯA GAME RA MÀN HÌNH CHÍNH
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-950/90 border border-amber-400/70 text-amber-200 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-2.5 flex flex-col">
              {/* Quick URL Copy Box */}
              <div className="p-2.5 bg-amber-950/80 rounded-xl border border-amber-500/80 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-300">🔗 Link Web Đang Chạy Trực Tiếp:</span>
                <span className="text-[10px] text-emerald-400 font-medium">● Máy chủ Online</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-stone-900 rounded-lg border border-stone-800 text-[10px] font-mono text-stone-300 overflow-hidden">
                <span className="truncate select-all">{activeAppUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow ${
                  copiedLink
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ĐÃ SAO CHÉP LINK THÀNH CÔNG!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>SAO CHÉP LINK WEB ĐỂ DÁN VÀO SAFARI</span>
                  </>
                )}
              </button>
            </div>

            {/* Icon Preview */}
            <div className="flex items-center gap-2.5 p-2 bg-stone-950/90 rounded-xl border border-amber-900/60 mt-2">
              <img
                src="/apple-touch-icon.png"
                alt="Logo 3D 12 Sứ Quân"
                className="w-10 h-10 rounded-xl shadow-md border border-amber-500 object-cover shrink-0"
              />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-amber-300 block">Biểu Tượng Màn Hình Chính:</span>
                <span className="text-stone-300">Logo 3D Trống Đồng &amp; Rồng Vàng Đại Việt (đã thay thế ảnh tướng).</span>
              </div>
            </div>

            {/* Platform Tabs */}
            <div className="grid grid-cols-2 gap-2 mt-2 p-1 bg-stone-950 rounded-xl border border-stone-800 shrink-0">
              <button
                type="button"
                onClick={() => setInstallTab('ios')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  installTab === 'ios'
                    ? 'bg-amber-600 text-stone-950 shadow font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🍎</span>
                <span>iPhone / Safari</span>
              </button>
              <button
                type="button"
                onClick={() => setInstallTab('android')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  installTab === 'android'
                    ? 'bg-amber-600 text-stone-950 shadow font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🤖</span>
                <span>Android (Chrome)</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 text-xs text-stone-300 pr-1">
              {installTab === 'ios' ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-800/60 text-[11px] text-amber-200 space-y-1">
                    <p className="font-bold">⚠️ Lưu ý quan trọng khi mở trên iPhone Safari:</p>
                    <p className="text-stone-300">
                      Khi mở link Dev lần đầu trên Safari, hệ thống Google AI Studio sẽ yêu cầu đăng nhập tài khoản Google của bạn (<strong>tranngocsds@gmail.com</strong>) để xác thực bảo mật trước khi vào game.
                    </p>
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-stone-200">Mở link bằng Safari và bấm Chia sẻ (Share)</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Dán link đã sao chép ở trên vào Safari. Ở thanh công cụ dưới đáy Safari, nhấn biểu tượng <strong>ô vuông mũi tên lên (⬆️)</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-stone-200">Chọn &quot;Thêm vào MH chính&quot; (Add to Home Screen)</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Cuộn danh sách menu chia sẻ xuống và nhấn vào dòng <strong>&quot;Thêm vào MH chính&quot;</strong> (biểu tượng hình dấu cộng <strong>➕</strong>).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-stone-200">Nhấn &quot;Thêm&quot; (Add) góc trên phải</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Biểu tượng game <strong>12 Sứ Quân</strong> sẽ xuất hiện ngoài màn hình chính của iPhone, bấm mở sẽ tự động vào game <strong>Full 100% màn hình</strong> không có thanh URL!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-800/60 text-[11px] text-amber-200">
                    💡 <em>Khuyên dùng trình duyệt <strong>Google Chrome</strong> hoặc <strong>Cốc Cốc</strong>.</em>
                  </div>

                  {canInstallPwa && onInstallPwa && (
                    <button
                      type="button"
                      onClick={() => {
                        onInstallPwa();
                        setShowInstallGuide(false);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-stone-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <Download className="w-4 h-4" />
                      <span>Bấm vào đây để cài đặt ngay</span>
                    </button>
                  )}

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-stone-200">Bấm nút Menu 3 chấm (⋮)</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Ở góc trên bên phải trình duyệt Chrome / Cốc Cốc, nhấn vào <strong>biểu tượng 3 chấm dọc (⋮)</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-stone-200">Chọn &quot;Cài đặt ứng dụng&quot; hoặc &quot;Thêm vào MH chính&quot;</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Tìm và nhấn vào dòng <strong>&quot;Cài đặt ứng dụng&quot;</strong> (Install app) hoặc <strong>&quot;Thêm vào màn hình chính&quot;</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-stone-200">Xác nhận &quot;Cài đặt&quot; / &quot;Thêm&quot;</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Biểu tượng game sẽ được đưa ra màn hình điện thoại như ứng dụng tải từ Google Play Store.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lợi ích */}
              <div className="p-2.5 bg-amber-950/75 rounded-xl border border-amber-700/60 space-y-1">
                <p className="font-bold text-[11px] text-amber-300">✨ Ưu điểm khi đưa ra ngoài màn hình:</p>
                <ul className="text-[10px] text-amber-100/80 space-y-0.5 list-disc list-inside">
                  <li>Tự động mở Full màn hình (không có thanh địa chỉ web chiếm diện tích).</li>
                  <li>Mở game 1 chạm nhanh chóng từ icon màn hình chính.</li>
                  <li>Tự động lưu tiến trình chơi game mượt mà.</li>
                </ul>
              </div>
              </div>
            </div>

            <div className="royal-bottom-dock">
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl border-2 border-yellow-200 uppercase tracking-wider cursor-pointer shadow-lg"
              >
                ĐÃ HIỂU &amp; ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
