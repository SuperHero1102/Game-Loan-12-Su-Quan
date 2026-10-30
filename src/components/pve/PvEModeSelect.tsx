/**
 * Loạn 12 Sứ Quân — PvE Custom Battle Selection
 * Khiêu chiến với máy:
 * 1. Chọn cấp độ thử thách với AI (Tập sự, Hảo thủ, Đại tướng, Địa ngục)
 * 2. Chọn tướng ta (Toàn bộ 14 Tướng Lĩnh bao gồm Đinh Bộ Lĩnh & Hoàng Đế Đinh Tiên Hoàng)
 * 3. Chọn sứ quân muốn thử sức
 * Giao diện mạ đồng Đông Sơn hoàng kim, thẻ 3D tương tác & so sánh chỉ số.
 */

import React, { useState } from 'react';
import { Warlord, PveDifficulty } from '../../types/game';
import { ALL_CHARACTERS, WARLORDS, DINH_BO_LINH, DINH_TIEN_HOANG } from '../../data/warlords';
import { WarlordCard3D } from '../character/WarlordCard3D';
import { Swords, Bot, ArrowLeft, X, Crown, Shield, Zap, Sparkles } from 'lucide-react';

interface PvEModeSelectProps {
  onStartBattle: (
    enemyWarlord: Warlord,
    difficulty: PveDifficulty,
    playerWarlord: Warlord
  ) => void;
  onBack: () => void;
}

export const PvEModeSelect: React.FC<PvEModeSelectProps> = ({
  onStartBattle,
  onBack,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<PveDifficulty>('MEDIUM');
  const [selectedPlayerWarlordId, setSelectedPlayerWarlordId] = useState<string>(DINH_BO_LINH.id);
  const [selectedEnemyWarlordId, setSelectedEnemyWarlordId] = useState<string>(WARLORDS[0].id);
  const [previewTab, setPreviewTab] = useState<'PLAYER' | 'ENEMY'>('PLAYER');

  const playerWarlord =
    ALL_CHARACTERS.find((w) => w.id === selectedPlayerWarlordId) || DINH_BO_LINH;
  const enemyWarlord =
    ALL_CHARACTERS.find((w) => w.id === selectedEnemyWarlordId) || WARLORDS[0];

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

  const handlePlayerWarlordChange = (id: string) => {
    setSelectedPlayerWarlordId(id);
    if (id === selectedEnemyWarlordId) {
      const availableEnemy =
        ALL_CHARACTERS.find((w) => w.id !== id)?.id || WARLORDS[0].id;
      setSelectedEnemyWarlordId(availableEnemy);
    }
  };

  const handleEnemyWarlordChange = (id: string) => {
    setSelectedEnemyWarlordId(id);
    if (id === selectedPlayerWarlordId) {
      const availablePlayer =
        ALL_CHARACTERS.find((w) => w.id !== id)?.id || DINH_BO_LINH.id;
      setSelectedPlayerWarlordId(availablePlayer);
    }
  };

  const handleStart = () => {
    const adjusted = getAdjustedWarlord(enemyWarlord, selectedDifficulty);
    onStartBattle(adjusted, selectedDifficulty, playerWarlord);
  };

  const previewWarlord = previewTab === 'PLAYER' ? playerWarlord : enemyWarlord;

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

      {/* Vùng Nội Dung Trung Tâm — Cuộn dọc mượt mà */}
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-2.5 px-3 py-2 flex flex-col justify-between">
        {/* 1. CHỌN CẤP ĐỘ THỬ THÁCH VỚI AI */}
        <div className="p-2.5 bg-amber-950/85 border border-amber-500/80 rounded-xl shadow-lg shrink-0">
          <label className="text-[11px] font-black text-yellow-300 uppercase tracking-wider block mb-1.5">
            1. CHỌN CẤP ĐỘ THỬ THÁCH VỚI AI:
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

        {/* 2. CHỌN TƯỚNG TA (GỒM ĐẦY ĐỦ CẢ HOÀNG ĐẾ ĐINH TIÊN HOÀNG) */}
        <div className="p-2.5 bg-gradient-to-r from-amber-950 via-amber-900/80 to-amber-950 border border-yellow-400/90 rounded-xl shadow-lg shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span>2. CHỌN TƯỚNG CỦA TA (BẢN THÂN):</span>
            </label>
            <span className="text-[9px] font-bold text-amber-300 px-1.5 py-0.2 rounded bg-amber-900/80 border border-yellow-400/60">
              {playerWarlord.id === 'dinh_tien_hoang' ? '👑 HOÀNG ĐẾ' : '🐲 CHIẾN TƯỚNG'}
            </span>
          </div>

          <select
            value={selectedPlayerWarlordId}
            onChange={(e) => handlePlayerWarlordChange(e.target.value)}
            className="w-full max-w-full min-w-0 truncate bg-amber-900/95 border-2 border-yellow-400 rounded-lg p-2 text-xs font-bold text-yellow-200 shadow-inner"
          >
            {ALL_CHARACTERS.map((char) => (
              <option key={char.id} value={char.id} className="bg-stone-900 text-amber-200">
                {char.id === 'dinh_tien_hoang' ? '👑 [HOÀNG ĐẾ] ' : char.id === 'dinh_bo_linh' ? '🐲 [ĐẾ VƯƠNG] ' : ''}
                {char.name} ({char.shortTerritory || char.territory}) · SPD {char.spd} · HP {char.hpRating}
              </option>
            ))}
          </select>
        </div>

        {/* 3. CHỌN SỨ QUÂN MUỐN THỬ SỨC (ĐỐI THỦ AI) */}
        <div className="p-2.5 bg-gradient-to-r from-stone-950 via-rose-950/70 to-stone-950 border border-rose-500/80 rounded-xl shadow-lg shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-black text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>3. CHỌN SỨ QUÂN MUỐN THỬ SỨC (ĐỐI THỦ):</span>
            </label>
            <span className="text-[9px] font-bold text-rose-200 px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-400/60">
              Ải {enemyWarlord.stageNumber || '⚔️'}
            </span>
          </div>

          <select
            value={selectedEnemyWarlordId}
            onChange={(e) => handleEnemyWarlordChange(e.target.value)}
            className="w-full max-w-full min-w-0 truncate bg-stone-900 border-2 border-rose-500/80 rounded-lg p-2 text-xs font-bold text-rose-200 shadow-inner"
          >
            {ALL_CHARACTERS.filter((w) => w.id !== selectedPlayerWarlordId).map((w) => (
              <option key={w.id} value={w.id} className="bg-stone-900 text-amber-200">
                {w.id === 'dinh_tien_hoang' ? '👑 [HOÀNG ĐẾ] ' : ''}
                {w.name} ({w.shortTerritory || w.territory}) · SPD {w.spd} · HP {w.hpRating}
              </option>
            ))}
          </select>
        </div>

        {/* KHUNG XEM TRƯỚC THẺ TƯỚNG 3D & BẢNG SO SÁNH CHỈ SỐ */}
        <div className="p-2.5 bg-amber-950/85 border border-amber-500/80 rounded-xl shadow-lg flex flex-col items-center">
          {/* Nút chuyển đổi xem thẻ Tướng Ta / Sứ Quân Địch */}
          <div className="grid grid-cols-2 gap-2 w-full mb-2">
            <button
              type="button"
              onClick={() => setPreviewTab('PLAYER')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer truncate ${
                previewTab === 'PLAYER'
                  ? 'bg-amber-500 text-stone-950 border-yellow-200 ring-2 ring-yellow-300 shadow'
                  : 'bg-amber-950 text-amber-300 border-amber-700/70 hover:bg-amber-900'
              }`}
            >
              🛡️ Xem Tướng Ta: {playerWarlord.name}
            </button>

            <button
              type="button"
              onClick={() => setPreviewTab('ENEMY')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer truncate ${
                previewTab === 'ENEMY'
                  ? 'bg-rose-600 text-white border-rose-200 ring-2 ring-rose-400 shadow'
                  : 'bg-rose-950 text-rose-300 border-rose-800/70 hover:bg-rose-900'
              }`}
            >
              ⚔️ Xem Địch: {enemyWarlord.name}
            </button>
          </div>

          {/* Thẻ 3D sống động */}
          <div className="w-full max-w-full overflow-hidden px-1 py-0.5 flex justify-center">
            <WarlordCard3D warlord={previewWarlord} size="sm" />
          </div>

          {/* So sánh Tốc Độ Tiên Phong */}
          <div className="w-full mt-2 text-center text-[10px] text-amber-100 bg-stone-950/85 py-1 px-2 rounded-lg border border-amber-700/60 truncate shadow">
            🏃 Lượt 1 (SPD cao hơn):{' '}
            <strong className="text-yellow-300 font-bold">
              {playerWarlord.spd >= enemyWarlord.spd
                ? `Ta (${playerWarlord.name} - SPD ${playerWarlord.spd})`
                : `Địch (${enemyWarlord.name} - SPD ${enemyWarlord.spd})`}
            </strong>
          </div>
        </div>
      </div>

      {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền */}
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
