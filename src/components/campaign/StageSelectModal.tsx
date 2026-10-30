/**
 * Loạn 12 Sứ Quân — Stage Select Modal (Bản đồ 12 Ải Chiến Dịch Trực Quan)
 * Hiển thị tiến trình 12 ải dẹp loạn của Đinh Bộ Lĩnh kèm chân dung 3D, Thú Cưỡi, Vai Trò và chỉ số SPD.
 */

import React, { useState } from 'react';
import { Warlord, PlayerProfile } from '../../types/game';
import { WARLORDS } from '../../data/warlords';
import { Warlord3DScene } from '../character/Warlord3DScene';
import { WarlordCard3D } from '../character/WarlordCard3D';
import { Trophy, Swords, Lock, CheckCircle2, ArrowLeft, Shield, Heart, Eye, X } from 'lucide-react';

interface StageSelectModalProps {
  profile: PlayerProfile;
  onSelectStage: (warlord: Warlord, stageNumber: number) => void;
  onBack: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  profile,
  onSelectStage,
  onBack,
}) => {
  const [inspectWarlord, setInspectWarlord] = useState<Warlord | null>(null);

  return (
    <div className="relative w-full flex-1 h-full flex flex-col justify-between bg-bronze-pattern text-stone-100 select-none overflow-hidden font-body">
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
          <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="truncate">DẸP LOẠN 12 ẢI SỨ QUÂN</span>
        </h2>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-black text-yellow-300 bg-amber-950/90 px-2 py-1 rounded-lg border border-yellow-400/80 whitespace-nowrap shadow-inner">
            {profile.defeatedWarlords.length}/12
          </span>
          <button
            type="button"
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/95 hover:bg-rose-900 text-rose-200 border border-rose-400/80 active:scale-95 transition cursor-pointer shadow"
            title="Đóng và quay về Trang Chủ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DANH SÁCH 12 ẢI TUẦN TỰ VỚI CHÂN DUNG 3D */}
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 overflow-y-auto space-y-2.5 px-3 py-2.5">
        {WARLORDS.map((warlord) => {
          const stageNum = warlord.stageNumber;
          const isConquered = profile.defeatedWarlords.includes(warlord.id);
          const prevWarlord = WARLORDS.find((w) => w.stageNumber === stageNum - 1);
          const isPrevConquered = prevWarlord
            ? profile.defeatedWarlords.includes(prevWarlord.id)
            : true;
          const isUnlocked =
            stageNum <= 1 ||
            stageNum <= (profile.currentStageNumber || 1) ||
            isPrevConquered;
          const isNextStage = isUnlocked && !isConquered && (stageNum === 1 || isPrevConquered || stageNum === (profile.currentStageNumber || 1));

          return (
            <div
              key={warlord.id}
              className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2.5 shadow ${
                isConquered
                  ? 'bg-emerald-950/40 border-emerald-700/70 hover:border-emerald-500'
                  : isNextStage
                  ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-400/80 shadow-amber-500/20'
                  : isUnlocked
                  ? 'bg-stone-900/80 border-stone-800 hover:border-amber-700'
                  : 'bg-stone-950/80 border-stone-900 opacity-65'
              }`}
            >
              {/* Khung Chân Dung 3D Sứ Quân */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setInspectWarlord(warlord)}
                  className="w-14 h-16 rounded-xl overflow-hidden shrink-0 relative shadow-lg border-2 border-amber-500/80 group"
                  title="Nhấn để xem Thẻ Tướng 3D"
                >
                  <Warlord3DScene warlord={warlord} showMountLabel={false} className="w-full h-full" />
                  <span className="absolute top-0 left-0 text-[8px] font-black px-1 rounded-br bg-stone-950/90 text-amber-300 border-b border-r border-amber-700">
                    ẢI {stageNum}
                  </span>
                  <span className="absolute bottom-0 right-0 p-0.5 bg-black/70 text-amber-300 rounded-tl">
                    <Eye className="w-2.5 h-2.5" />
                  </span>
                </button>

                {/* Tên, Địa Bàn, Thú Cưỡi & Chỉ Số */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-xs sm:text-sm text-stone-100 truncate">
                      {warlord.name}
                    </h3>
                    {isConquered && (
                      <span className="text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> ĐÃ DẸP
                      </span>
                    )}
                    {isNextStage && (
                      <span className="text-[8px] font-black text-amber-300 bg-amber-900/80 px-1.5 py-0.2 rounded border border-amber-600 animate-pulse">
                        MỤC TIÊU
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-amber-200/80 truncate">
                    {warlord.territory} · {warlord.mountName}
                  </p>

                  <div className="flex items-center gap-2 text-[9px] font-mono text-stone-300 mt-1 flex-wrap">
                    <span className="flex items-center gap-0.5 text-rose-400">
                      <Heart className="w-2.5 h-2.5 fill-rose-500" /> {warlord.baseHp}
                    </span>
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      <Shield className="w-2.5 h-2.5 fill-emerald-500" /> {warlord.baseArmor}
                    </span>
                    <span className="text-sky-300">🏃SPD {warlord.spd}</span>
                    <span className="text-yellow-400 font-bold">{warlord.role}</span>
                  </div>
                </div>
              </div>

              {/* Nút Khiêu Chiến */}
              <div className="shrink-0 flex flex-col gap-1">
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => onSelectStage(warlord, stageNum)}
                    className={`px-2.5 py-2 rounded-lg text-[11px] font-black transition flex items-center gap-1 shadow active:scale-95 ${
                      isNextStage
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-stone-950 border border-amber-300 animate-pulse'
                        : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-900/60'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{isConquered ? 'ĐẤU LẠI' : 'ĐÁNH'}</span>
                  </button>
                ) : (
                  <div className="px-2.5 py-2 rounded-lg text-[10px] font-bold bg-stone-900 text-stone-600 border border-stone-800 flex items-center gap-1 cursor-not-allowed">
                    <Lock className="w-3 h-3" />
                    <span>KHÓA</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
      <div className="royal-bottom-dock">
        <div className="w-full max-w-md mx-auto flex items-center justify-between gap-3">
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 truncate flex-1 text-center sm:text-left">
            ⚜️ Nhấn vào ảnh tướng để xem Thẻ 3D ★★★★★
          </span>
          <button
            type="button"
            onClick={onBack}
            className="py-2 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black text-xs rounded-xl border-2 border-yellow-200 flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer uppercase tracking-wider shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-950 shrink-0" />
            <span>TRANG CHỦ</span>
          </button>
        </div>
      </div>

      {/* Modal Xem Thẻ Tướng 3D */}
      {inspectWarlord && (
        <div
          className="modal-backdrop-safe"
          onClick={() => setInspectWarlord(null)}
        >
          <div
            className="flex flex-col items-center gap-2 w-full max-w-sm max-h-full overflow-y-auto pr-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setInspectWarlord(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-800 text-stone-300 hover:text-white border border-amber-600/60 cursor-pointer shadow"
              >
                ✕
              </button>
            </div>
            <WarlordCard3D warlord={inspectWarlord} size="sm" />
            <button
              type="button"
              onClick={() => setInspectWarlord(null)}
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black text-xs rounded-xl border border-yellow-200 cursor-pointer shadow uppercase tracking-wider shrink-0"
            >
              ĐÓNG THẺ TƯỚNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
