/**
 * Loạn 12 Sứ Quân — Mobile Game Remaster
 * Component Huy Hiệu Trạng Thái Mạng & Bộ Nhớ Offline
 * Thiết kế phong cách ấn tín cổ trang Đại Cồ Việt, tối ưu trải nghiệm di động
 */

import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  DownloadCloud,
  X,
  Share2,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { OnlineSyncState } from '../../hooks/useOnlineSync';
import { deviceOptimizer } from '../../services/deviceOptimizer';

interface NetworkBadgeProps {
  syncState: OnlineSyncState;
}

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({ syncState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [manualCheckMsg, setManualCheckMsg] = useState<string | null>(null);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const [androidDownloadState, setAndroidDownloadState] = useState<
    'idle' | 'downloading' | 'installed'
  >('idle');

  const isAndroidDevice = deviceOptimizer.isAndroid();

  const {
    isOnline,
    updateAvailable,
    isCheckingUpdate,
    checkForUpdate,
    applyUpdate,
    cacheReady,
  } = syncState;

  // Luôn ưu tiên lấy link chia sẻ công khai (ais-pre) thay vì link dev cá nhân (ais-dev)
  const getPublicShareUrl = () => {
    const defaultPublicUrl =
      'https://ais-pre-s44nqpuehsdi6vvl5dctbh-830645281651.asia-east1.run.app';
    if (typeof window === 'undefined') return defaultPublicUrl;
    const current = window.location.origin + window.location.pathname;
    if (current.includes('ais-dev-')) {
      return current.replace('ais-dev-', 'ais-pre-');
    }
    if (current.startsWith('http')) {
      return current;
    }
    return defaultPublicUrl;
  };

  const handleCopyShareLink = () => {
    const shareUrl = getPublicShareUrl();
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopiedPublicLink(true);
    setTimeout(() => setCopiedPublicLink(false), 2500);
  };

  const handleAndroidApkDownload = async () => {
    setAndroidDownloadState('downloading');
    const result = await deviceOptimizer.downloadAndInstallAndroidApk();
    if (result === 'installed') {
      setAndroidDownloadState('installed');
    }
    setTimeout(() => {
      setAndroidDownloadState('idle');
    }, 4000);
  };

  const handleManualCheck = async () => {
    setManualCheckMsg(null);
    const hasUpdate = await checkForUpdate();
    if (hasUpdate) {
      setManualCheckMsg(
        'Đã phát hiện bản cập nhật mới! Bạn có thể cập nhật ngay bên dưới.'
      );
    } else {
      setManualCheckMsg(
        'Dữ liệu game hiện tại đã là phiên bản mới nhất, sẵn sàng chơi 100% offline.'
      );
    }
    setTimeout(() => {
      setManualCheckMsg(null);
    }, 4500);
  };

  return (
    <>
      {/* Huy hiệu nhỏ gọn trên thanh điều khiển */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all shadow cursor-pointer active:scale-95 whitespace-nowrap ${
          isOnline
            ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-200 hover:bg-emerald-900/90'
            : 'bg-amber-950/90 border-amber-400/80 text-amber-200 hover:bg-amber-900/90'
        }`}
        title="Trạng thái mạng, Offline & Cập nhật tự động"
      >
        {isCheckingUpdate ? (
          <RefreshCw className="w-3 h-3 animate-spin text-amber-300 shrink-0" />
        ) : isOnline ? (
          <Wifi className="w-3 h-3 text-emerald-400 shrink-0" />
        ) : (
          <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
        )}

        <span className="tracking-wide">
          {isCheckingUpdate
            ? 'Đồng bộ...'
            : isOnline
            ? cacheReady
              ? 'Online · Đã lưu Offline'
              : 'Trực tuyến'
            : 'Offline 100%'}
        </span>

        {updateAvailable && (
          <span className="px-1 py-0.2 rounded bg-rose-500 text-[9px] font-black text-white uppercase">
            Mới
          </span>
        )}
      </button>

      {/* Modal chi tiết kết nối & đồng bộ dữ liệu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#2a170c] to-[#160c06] border-2 border-amber-500/90 shadow-2xl p-5 text-stone-200 relative">
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-amber-950/70 border border-amber-700/50 text-amber-300 hover:bg-amber-900 active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Tiêu đề cổ trang */}
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`p-2 rounded-xl border ${
                  isOnline
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                    : 'bg-amber-950/80 border-amber-500 text-amber-400'
                }`}
              >
                {isOnline ? (
                  <Wifi className="w-5 h-5" />
                ) : (
                  <WifiOff className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-200 tracking-wide">
                  Trạng Thái Mạng &amp; Offline
                </h3>
                <p className="text-[11px] text-amber-400/90">
                  {isOnline
                    ? 'Đang kết nối mạng · Tự động đồng bộ ngầm'
                    : 'Đang chơi ngoại tuyến 100% không cần mạng'}
                </p>
              </div>
            </div>

            {/* Thẻ trạng thái dữ liệu game */}
            <div className="space-y-2.5 mb-4">
              <div className="p-3 rounded-xl bg-amber-950/45 border border-amber-800/50 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Bộ nhớ Offline:{' '}
                    {cacheReady ? 'Đã lưu 100% vào máy' : 'Đang lưu ngầm...'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Toàn bộ 13 Sứ Quân, sa bàn chiến dịch, bàn cờ Match-3 và âm
                  thanh đã được lưu sẵn. Khi thêm ra màn hình chính, bạn có thể
                  chơi mượt mà mọi lúc kể cả khi tắt WiFi/4G.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/45 border border-amber-800/50 text-xs space-y-2">
                <div className="flex items-center gap-2 text-yellow-300 font-bold">
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span>Link Chia Sẻ &amp; Cài Đặt Thiết Bị</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Sao chép link để mở trên iPhone (Safari) hoặc tải trực tiếp gói
                  cài đặt APK trên điện thoại Android:
                </p>

                {/* Nút 1: Sao chép Link trực tiếp (iPhone) */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow ${
                    copiedPublicLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950'
                  }`}
                >
                  {copiedPublicLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Đã sao chép Link trực tiếp (iPhone)!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Sao chép Link trực tiếp (iPhone)</span>
                    </>
                  )}
                </button>

                {/* Nút 2: Chỉ hiển thị trên điện thoại Android, đặt ngay dưới nút Sao chép Link trực tiếp (iPhone) */}
                {isAndroidDevice && (
                  <div className="space-y-1 pt-0.5">
                    <button
                      type="button"
                      onClick={handleAndroidApkDownload}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {androidDownloadState === 'downloading'
                          ? 'Đang tải Loan_12_Su_Quan.apk...'
                          : androidDownloadState === 'installed'
                          ? 'Đã cài đặt cho điện thoại Android!'
                          : 'Tải về cho điện thoại Android'}
                      </span>
                    </button>
                    {androidDownloadState !== 'idle' && (
                      <p className="text-[10px] text-emerald-300 text-center leading-snug">
                        Đã tải gói cài đặt Loan_12_Su_Quan.apk về máy Android của bạn.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Nếu có cập nhật đang chờ */}
            {updateAvailable && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-400 text-xs mb-4">
                <div className="flex items-center gap-2 font-bold text-amber-200 mb-1">
                  <DownloadCloud className="w-4 h-4" />
                  <span>Gói cập nhật mới đã sẵn sàng!</span>
                </div>
                <p className="text-[11px] text-stone-200 mb-2">
                  Hệ thống đã tải xong gói tài nguyên mới nhất. Bấm để áp dụng
                  phiên bản mới ngay.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    applyUpdate();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
                >
                  Cập nhật ngay
                </button>
              </div>
            )}

            {/* Thông báo phản hồi sau khi kiểm tra thủ công */}
            {manualCheckMsg && (
              <div className="p-2.5 rounded-lg bg-amber-900/60 border border-amber-600/50 text-[11px] text-amber-200 mb-3 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{manualCheckMsg}</span>
              </div>
            )}

            {/* Nút hành động */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={!isOnline || isCheckingUpdate}
                className={`w-full py-2.5 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOnline && !isCheckingUpdate
                    ? 'bg-amber-900/50 hover:bg-amber-800/60 border-amber-600 text-amber-200 active:scale-95'
                    : 'bg-stone-900/60 border-stone-700 text-stone-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`}
                />
                <span>
                  {isCheckingUpdate
                    ? 'Đang kiểm tra gói tin...'
                    : isOnline
                    ? 'Kiểm tra bản cập nhật mới'
                    : 'Đang Offline (Tự động cập nhật khi có mạng)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-stone-400 hover:text-stone-200 text-xs font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
