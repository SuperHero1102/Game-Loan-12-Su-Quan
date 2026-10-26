/**
 * Loạn 12 Sứ Quân — Hộp Thoại Cài Đặt Thời Gian Đếm Ngược Mỗi Lượt (TurnTimerModal)
 * Cho phép chọn nhanh 15s, 20s, 30s, 45s, Vô hạn hoặc tự nhập số giây tùy ý (để trống = không tính thời gian).
 */

import React, { useState } from 'react';
import { Clock, Check, X, Infinity as InfinityIcon } from 'lucide-react';

interface TurnTimerModalProps {
  enabled: boolean;
  timeLimit: number;
  onSave: (enabled: boolean, timeLimit: number) => void;
  onClose: () => void;
}

const PRESET_SECONDS = [15, 20, 30, 45];

export const TurnTimerModal: React.FC<TurnTimerModalProps> = ({
  enabled,
  timeLimit,
  onSave,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    enabled && timeLimit > 0 ? String(timeLimit) : ''
  );

  const parsedSeconds = parseInt(inputValue.trim(), 10);
  const isUnlimited = inputValue.trim() === '' || isNaN(parsedSeconds) || parsedSeconds <= 0;

  const handleSelectPreset = (sec: number | null) => {
    if (sec === null) {
      setInputValue('');
    } else {
      setInputValue(String(sec));
    }
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnlimited) {
      onSave(false, timeLimit > 0 ? timeLimit : 20);
    } else {
      const clamped = Math.max(5, Math.min(300, parsedSeconds));
      onSave(true, clamped);
    }
    onClose();
  };

  return (
    <div
      className="modal-backdrop-safe select-none"
      onClick={onClose}
    >
      <form
        onSubmit={handleConfirmSave}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs bg-stone-900 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl text-stone-100 space-y-3.5 max-h-full overflow-y-auto animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black font-display text-amber-300 uppercase tracking-wide">
                CÀI ĐẶT THỜI GIAN LƯỢT
              </h3>
              <p className="text-[10px] text-stone-400">
                Chọn mốc giây hoặc để trống nếu không tính giờ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Các nút chọn nhanh (Sáng nổi bật mục đang chọn) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-amber-200 block">
            1. Chọn nhanh mốc thời gian:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESET_SECONDS.map((sec) => {
              const isSelected = !isUnlimited && parsedSeconds === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleSelectPreset(sec)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-yellow-200 ring-2 ring-amber-300 shadow-lg scale-105'
                      : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
                  }`}
                >
                  {sec}s
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleSelectPreset(null)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isUnlimited
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-yellow-200 ring-2 ring-amber-300 shadow-lg'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <InfinityIcon className="w-4 h-4 shrink-0" />
            <span>KHÔNG TÍNH THỜI GIAN (VÔ HẠN)</span>
          </button>
        </div>

        {/* Ô tự nhập số giây */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-amber-200 block">
            2. Hoặc tự nhập số giây chờ (5 — 300s):
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={1}
              max={300}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Để trống = Không tính thời gian"
              className="w-full bg-stone-950 border-2 border-amber-700/80 focus:border-amber-400 outline-none rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-amber-200 placeholder:text-stone-500 placeholder:font-normal"
            />
            {inputValue.trim() !== '' && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-2 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300 cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
          <p className="text-[10px] text-amber-300/90 italic">
            {isUnlimited
              ? '✨ Trạng thái: Không giới hạn thời gian mỗi lượt.'
              : `⏱️ Trạng thái: Đếm ngược ${parsedSeconds} giây mỗi lượt đi.`}
          </p>
        </div>

        {/* Nút OK xác nhận lưu */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer transition"
          >
            HỦY
          </button>
          <button
            type="submit"
            className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg border border-yellow-200 active:scale-95 transition cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>OK — XÁC NHẬN LƯU</span>
          </button>
        </div>
      </form>
    </div>
  );
};
