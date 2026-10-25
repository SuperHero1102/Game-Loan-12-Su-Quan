/**
 * Loạn 12 Sứ Quân — Mobile Game Remaster
 * Thông báo nhẹ khi hệ thống tải xong gói cập nhật mới lúc có mạng
 */

import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

interface UpdateNotificationToastProps {
  visible: boolean;
  onApply: () => void;
  onDismiss: () => void;
}

export const UpdateNotificationToast: React.FC<UpdateNotificationToastProps> = ({
  visible,
  onApply,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#2c180c]/95 via-[#3b2010]/95 to-[#2c180c]/95 border-2 border-amber-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.75)] backdrop-blur-md text-stone-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/70 flex items-center justify-center shrink-0 text-yellow-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-yellow-300 truncate">
              Đã tải xong bản cập nhật mới!
            </p>
            <p className="text-[10px] text-amber-100/85 truncate">
              Bấm cập nhật để áp dụng gói dữ liệu mới nhất
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onApply}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-[11px] flex items-center gap-1 shadow active:scale-95 transition cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Cập nhật</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/70 text-amber-300 hover:text-white transition cursor-pointer"
            title="Để sau"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
