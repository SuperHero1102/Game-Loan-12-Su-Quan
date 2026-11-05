/**
 * Loạn 12 Sứ Quân — Hộp thoại Cài Đặt Đếm Ngược Lượt Chơi (TurnTimerModal)
 */

import React, { useState } from 'react';
import { Timer, X, Check, Clock } from 'lucide-react';

interface TurnTimerModalProps {
  enabled: boolean;
  timeLimit: number;
  onSave: (enabled: boolean, newLimit: number) => void;
  onClose: () => void;
}

const PRESET_TIMES = [10, 15, 20, 30, 45, 60];

export const TurnTimerModal: React.FC<TurnTimerModalProps> = ({
  enabled: initialEnabled,
  timeLimit: initialLimit,
  onSave,
  onClose,
}) => {
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [timeLimit, setTimeLimit] = useState<number>(initialLimit);

  const handleSave = () => {
    onSave(enabled, timeLimit);
  };

  return (
    <div className="modal-backdrop-safe">
      <div className="w-full max-w-sm bg-stone-900 border-2 border-amber-600 rounded-2xl p-4 sm:p-5 text-center shadow-2xl animate-in fade-in zoom-in-95 max-h-full overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/60 mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-amber-300 uppercase tracking-wide">
              Cài Đặt Thời Gian Lượt
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-left">
          {/* Bật / Tắt đếm ngược */}
          <div className="flex items-center justify-between p-3 bg-stone-950/80 rounded-xl border border-amber-900/60">
            <div>
              <div className="text-sm font-bold text-stone-200">Đếm ngược mỗi lượt</div>
              <div className="text-xs text-stone-400">Tự động kết thúc lượt khi hết giờ</div>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                enabled ? 'bg-amber-500' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Chọn giới hạn thời gian */}
          {enabled && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Thời gian mỗi lượt (giây):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TIMES.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setTimeLimit(sec)}
                    className={`py-2 px-3 rounded-lg text-xs font-black transition cursor-pointer border ${
                      timeLimit === sec
                        ? 'bg-amber-500 text-stone-950 border-yellow-300 shadow-md scale-102'
                        : 'bg-stone-950/70 text-stone-300 border-amber-900/40 hover:border-amber-600'
                    }`}
                  >
                    {sec} giây
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nút lưu */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-xs font-black rounded-xl shadow-lg hover:from-amber-400 hover:to-yellow-300 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Lưu Thiết Lập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
