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
import {
  getActiveGameUrl,
  copyToClipboard,
} from '../../utils/clipboard';

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
    forceCleanUpdate,
    cacheReady,
  } = syncState;

  // Lấy URL thực tế đang hoạt động của ứng dụng (tự động nhận diện domain hiện hành)
  const currentAppUrl = getActiveGameUrl();

  const handleCopyShareLink = async () => {
    const success = await copyToClipboard(currentAppUrl);
    if (success) {
      setCopiedPublicLink(true);
      setManualCheckMsg('Đã sao chép liên kết vào bộ nhớ tạm thành công!');
      setTimeout(() => {
        setCopiedPublicLink(false);
        setManualCheckMsg(null);
      }, 3500);
    } else {
      setManualCheckMsg('Nhấn giữ vào ô liên kết bên dưới để sao chép!');
      setTimeout(() => setManualCheckMsg(null), 4000);
    }
  };

  const handleAndroidApkDownload = async () => {
    setAndroidDownloadState('downloading');
    const result = await deviceOptimizer.downloadAndInstallAndroidApk();
    if (result === 'installed') {
      setAndroidDownloadState('installed');
      setManualCheckMsg('Đã cài đặt ứng dụng thành công lên điện thoại Android!');
    } else {
      setManualCheckMsg('Đang tải file Loan_12_Su_Quan.apk về thiết bị của bạn!');
    }
    setTimeout(() => {
      setAndroidDownloadState('idle');
      setManualCheckMsg(null);
    }, 4500);
  };

  const handleManualCheck = async () => {
    setManualCheckMsg('Đang nạp và áp dụng phiên bản mới nhất...');
    await checkForUpdate(true);
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
          {isCheckingUpdate ? 'Đồng bộ...' : isOnline ? 'Online' : 'Offline'}
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

                {/* Hiển thị công khai link chính thức của game kèm ô nhập chọn nhanh */}
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-stone-950/90 border border-amber-500/70 shadow-inner">
                  <input
                    type="text"
                    readOnly
                    value={currentAppUrl}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-transparent px-2 py-1 text-[11px] font-mono text-amber-200 outline-none select-all truncate"
                    title="Nhấp vào để chọn toàn bộ liên kết"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-yellow-400 active:scale-95 text-stone-950 font-black text-[11px] shrink-0 transition cursor-pointer flex items-center gap-1 shadow"
                    title="Sao chép link này"
                  >
                    {copiedPublicLink ? (
                      <Check className="w-3 h-3 text-stone-950" />
                    ) : (
                      <Copy className="w-3 h-3 text-stone-950" />
                    )}
                    <span>{copiedPublicLink ? 'Đã chép' : 'Chép'}</span>
                  </button>
                </div>

                {/* Nút 1: Sao chép Link trực tiếp (iPhone) */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                    copiedPublicLink
                      ? 'bg-emerald-600 text-white border border-emerald-400'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 border border-yellow-200'
                  }`}
                >
                  {copiedPublicLink ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Đã sao chép Link trực tiếp (iPhone)!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 shrink-0" />
                      <span>Sao chép Link trực tiếp (iPhone)</span>
                    </>
                  )}
                </button>

                {/* Nút 2: Tải gói cài đặt APK cho điện thoại Android */}
                <div className="space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={handleAndroidApkDownload}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-stone-950 active:scale-95 border border-emerald-300"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {androidDownloadState === 'downloading'
                        ? 'Đang tải Loan_12_Su_Quan.apk...'
                        : androidDownloadState === 'installed'
                        ? 'Đã cài đặt cho điện thoại Android!'
                        : 'Tải về APK cho điện thoại Android'}
                    </span>
                  </button>
                  <p className="text-[10px] text-stone-400 text-center leading-snug">
                    {androidDownloadState !== 'idle'
                      ? 'Đang gửi tệp cài đặt Loan_12_Su_Quan.apk về máy Android của bạn.'
                      : 'Hỗ trợ tất cả dòng máy Samsung, Xiaomi, OPPO, Pixel...'}
                  </p>
                </div>
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
                className={`w-full py-2.5 px-4 rounded-xl border font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOnline && !isCheckingUpdate
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 border-2 border-yellow-200 shadow-lg active:scale-95'
                    : 'bg-stone-900/60 border-stone-700 text-stone-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`}
                />
                <span>
                  {isCheckingUpdate
                    ? 'Đang cập nhật phiên bản mới...'
                    : isOnline
                    ? 'Kiểm tra & Cập nhật bản mới ngay'
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
