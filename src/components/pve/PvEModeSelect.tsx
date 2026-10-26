/**
 * Loạn 12 Sứ Quân — PvE Custom Battle Selection
 * Giao diện thương mại hóa tràn viền 100% khung hình với Thanh Đỉnh & Đế Đáy mạ đồng Đông Sơn hoàng kim.
 */

import React, { useState } from 'react';
import { Warlord, PveDifficulty } from '../../types/game';
import { WARLORDS } from '../../data/warlords';
import { WarlordCard3D } from '../character/WarlordCard3D';
import { Swords, Bot, ArrowLeft, X } from 'lucide-react';

interface PvEModeSelectProps {
  onStartBattle: (warlord: Warlord, difficulty: PveDifficulty) => void;
  onBack: () => void;
}

export const PvEModeSelect: React.FC<PvEModeSelectProps> = ({
  onStartBattle,
  onBack,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<PveDifficulty>('MEDIUM');
  const [selectedWarlordId, setSelectedWarlordId] = useState<string>(WARLORDS[0].id);

  const selectedWarlord = WARLORDS.find((w) => w.id === selectedWarlordId) || WARLORDS[0];

  const getAdjustedWarlord = (base: Warlord, diff: PveDifficulty): Warlord => {
    switch (diff) {
      case 'EASY':
        return {
          ...base,
          baseHp: Math.round(base.baseHp * 0.85),
          baseAtk: Math.round(base.baseAtk * 0.85),
          aiAggressiveness: 0.35,
        };
      case 'MEDIUM':
        return {
          ...base,
          aiAggressiveness: 0.65,
        };
      case 'HARD':
        return {
          ...base,
          baseHp: Math.round(base.baseHp * 1.25),
          baseAtk: Math.round(base.baseAtk * 1.2),
          baseArmor: Math.round(base.baseArmor * 1.3),
          aiAggressiveness: 0.85,
        };
      case 'HELL':
        return {
          ...base,
          baseHp: Math.round(base.baseHp * 1.55),
          baseAtk: Math.round(base.baseAtk * 1.45),
          baseArmor: Math.round(base.baseArmor * 1.6),
          aiAggressiveness: 0.98,
        };
    }
  };

  const handleStart = () => {
    const adjusted = getAdjustedWarlord(selectedWarlord, selectedDifficulty);
    onStartBattle(adjusted, selectedDifficulty);
  };

  return (
    <div className="relative w-full max-w-full flex-1 h-full flex flex-col justify-between bg-bronze-pattern text-stone-100 select-none overflow-hidden">
      {/* Thanh Đỉnh Hoàng Kim Đông Sơn */}
      <div className="royal-header-bar flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/90 hover:bg-amber-900 active:scale-95 rounded-lg text-xs font-bold text-yellow-300 border border-amber-400/80 whitespace-nowrap shrink-0 cursor-pointer shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Trang chủ</span>
        </button>

        <h2 className="text-xs sm:text-sm font-black text-yellow-200 font-display uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap truncate min-w-0 drop-shadow">
          <Bot className="w-4 h-4 text-sky-300 shrink-0" />
          <span className="truncate">KHIÊU CHIẾN VỚI MÁY</span>
        </h2>

        <button
          type="button"
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/95 hover:bg-rose-900 text-rose-200 border border-rose-400/80 active:scale-95 transition cursor-pointer shrink-0 shadow"
          title="Đóng và quay về Trang Chủ"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Vùng Nội Dung Trung Tâm — Nền Hoa Văn Trống Đồng */}
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-2.5 px-3 py-2 flex flex-col justify-between">
        {/* CHỌN CẤP ĐỘ ĐỘ KHÓ */}
        <div className="p-2.5 bg-amber-950/85 border border-amber-500/80 rounded-xl shadow-lg shrink-0">
          <label className="text-[11px] font-black text-yellow-300 uppercase tracking-wider block mb-1.5">
            1. CHỌN CẤP ĐỘ THỬ THÁCH AI:
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDifficulty('EASY')}
              className={`p-2 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                selectedDifficulty === 'EASY'
                  ? 'bg-gradient-to-br from-emerald-600/50 via-emerald-950 to-amber-950 border-emerald-300 ring-2 ring-emerald-400 text-white shadow'
                  : 'bg-amber-950/70 border-amber-800/70 text-amber-200/75 hover:border-amber-500'
              }`}
            >
              <span className="font-black text-xs text-emerald-300">🟢 TẬP SỰ (DỄ)</span>
              <span className="text-[10px] text-amber-100/85">AI đánh nhẹ, ngẫu nhiên</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('MEDIUM')}
              className={`p-2 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                selectedDifficulty === 'MEDIUM'
                  ? 'bg-gradient-to-br from-amber-500/50 via-amber-900 to-amber-950 border-yellow-300 ring-2 ring-yellow-400 text-white shadow'
                  : 'bg-amber-950/70 border-amber-800/70 text-amber-200/75 hover:border-amber-500'
              }`}
            >
              <span className="font-black text-xs text-yellow-300">🟡 HẢO THỦ (VỪA)</span>
              <span className="text-[10px] text-amber-100/85">AI biết nhắm Kiếm &amp; Tim</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('HARD')}
              className={`p-2 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                selectedDifficulty === 'HARD'
                  ? 'bg-gradient-to-br from-rose-600/50 via-rose-950 to-amber-950 border-rose-300 ring-2 ring-rose-400 text-white shadow'
                  : 'bg-amber-950/70 border-amber-800/70 text-amber-200/75 hover:border-amber-500'
              }`}
            >
              <span className="font-black text-xs text-rose-300">🔴 ĐẠI TƯỚNG (KHÓ)</span>
              <span className="text-[10px] text-amber-100/85">Săn 4 viên để Thêm Lượt</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('HELL')}
              className={`p-2 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                selectedDifficulty === 'HELL'
                  ? 'bg-gradient-to-br from-purple-600/50 via-purple-950 to-amber-950 border-purple-300 ring-2 ring-purple-400 text-white shadow'
                  : 'bg-amber-950/70 border-amber-800/70 text-amber-200/75 hover:border-amber-500'
              }`}
            >
              <span className="font-black text-xs text-purple-300">💀 ĐỊA NGỤC</span>
              <span className="text-[10px] text-amber-100/85">Cướp Huyết Kiếm hủy diệt</span>
            </button>
          </div>
        </div>

        {/* CHỌN SỨ QUÂN ĐỐI ĐẦU KÈM THẺ TƯỚNG 3D */}
        <div className="w-full max-w-full overflow-hidden p-2.5 bg-amber-950/85 border border-amber-500/80 rounded-xl shadow-lg my-auto">
          <label className="text-[11px] font-black text-yellow-300 uppercase tracking-wider block mb-1.5">
            2. CHỌN SỨ QUÂN MUỐN THỬ SỨC:
          </label>

          <select
            value={selectedWarlordId}
            onChange={(e) => setSelectedWarlordId(e.target.value)}
            className="w-full max-w-full min-w-0 truncate bg-amber-900/90 border border-yellow-400/80 rounded-lg p-2 text-xs font-bold text-yellow-200 mb-2 shadow-inner"
          >
            {WARLORDS.map((w) => (
              <option key={w.id} value={w.id} className="bg-stone-900 text-amber-200">
                Ải {w.stageNumber}: {w.name} ({w.title} - {w.territory}) · SPD {w.spd}
              </option>
            ))}
          </select>

          {/* Hiển Thị Thẻ Tướng 3D Của Sứ Quân Đang Chọn */}
          <div className="w-full max-w-full overflow-hidden px-1 py-0.5 flex justify-center">
            <WarlordCard3D warlord={selectedWarlord} size="sm" />
          </div>
        </div>
      </div>

      {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
      <div className="royal-bottom-dock">
        <div className="w-full max-w-md mx-auto flex items-center justify-center">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-sm rounded-xl uppercase tracking-wider shadow-xl border-2 border-yellow-200 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Swords className="w-5 h-5 text-stone-950 shrink-0" />
            <span>VÀO TRẬN KHIÊU CHIẾN NGAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
