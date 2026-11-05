/**
 * Loạn 12 Sứ Quân — iOS Safari "Thêm vào Màn hình chính" Prompt
 * Chỉ hiển thị khi mở trên trình duyệt Safari của iPhone/iPad và chưa cài đặt ở chế độ Standalone.
 * Thiết kế gọn gàng, có nút đóng và lưu trạng thái đã đóng để không làm phiền người chơi.
 */

import React, { useState, useEffect } from 'react';
import { Share, X, PlusSquare } from 'lucide-react';

export const IOSInstallPrompt: React.FC = () => {
  const [shouldShow, setShouldShow] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Kiểm tra thiết bị có phải iOS không
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    // 2. Kiểm tra có đang chạy ở chế độ Standalone (Màn hình chính) không
    const isStandalone =
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    // 3. Kiểm tra người dùng đã tắt banner này trước đó chưa
    const isDismissed = localStorage.getItem('loan12sq_ios_prompt_dismissed') === 'true';

    if (isIOS && !isStandalone && !isDismissed) {
      // Hiện sau 2.5 giây khi vào game để không cản trở lúc tải ban đầu
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShouldShow(false);
    try {
      localStorage.setItem('loan12sq_ios_prompt_dismissed', 'true');
    } catch {}
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed top-2 left-2 right-2 z-50 max-w-md mx-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="bg-stone-900/95 backdrop-blur-md border border-amber-500/80 rounded-xl p-2.5 shadow-2xl text-stone-200 text-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500 flex items-center justify-center shrink-0">
            <Share className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-amber-300 text-[11px] uppercase tracking-wider truncate">
              Chơi Toàn Màn Hình &amp; Offline
            </div>
            <div className="text-[10px] text-stone-300 leading-tight">
              Bấm <Share className="inline w-3 h-3 text-sky-400 mx-0.5" /> Chia sẻ rồi chọn{' '}
              <span className="font-semibold text-yellow-300">"Thêm vào MH chính"</span>{' '}
              <PlusSquare className="inline w-3 h-3 text-amber-300" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 shrink-0 cursor-pointer"
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
