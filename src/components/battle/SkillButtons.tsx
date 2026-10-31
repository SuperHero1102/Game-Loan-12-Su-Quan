/**
 * Loạn 12 Sứ Quân — Skill Buttons & Bottom Đông Sơn Bronze Dock
 * Đế Đáy Hoàng Kim Đông Sơn Tràn Viền 100% (xóa bỏ hoàn toàn dải đen đáy màn hình)
 */

import React from 'react';
import { FighterState } from '../../types/game';
import { Flame, Sparkles } from 'lucide-react';

interface SkillButtonsProps {
  fighter: FighterState;
  isTurn: boolean;
  onCastSkill: () => void;
}

export const SkillButtons: React.FC<SkillButtonsProps> = ({
  fighter,
  isTurn,
  onCastSkill,
}) => {
  const canCast = isTurn && fighter.mana >= fighter.skillCost;
  const manaPercent = Math.max(0, Math.min(100, (fighter.mana / fighter.skillCost) * 100));

  return (
    <div className="royal-bottom-dock select-none">
      <div className="w-full max-w-md mx-auto px-2 sm:px-3 flex items-center justify-center">
        <button
          type="button"
          disabled={!canCast}
          onClick={onCastSkill}
          className={`w-full py-2.5 px-3 sm:px-4 rounded-xl relative overflow-hidden shadow-[0_4px_15px_rgba(245,158,11,0.3)] border-2 flex items-center justify-center transition-all duration-300 ${
            canCast
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 border-yellow-200 ring-2 ring-yellow-300 animate-pulse cursor-pointer active:scale-95'
              : 'bg-stone-950/95 border-amber-600/80 cursor-not-allowed shadow-inner'
          }`}
        >
          {/* Thanh lực màu hoàng kim Bản Đồ Hành Quân: nạp đầy theo tỷ lệ % nộ */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-300 pointer-events-none"
            style={{ width: `${manaPercent}%` }}
          />

          <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 w-full text-center">
            {canCast ? (
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950 fill-stone-950 shrink-0 animate-bounce" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
            )}
            <span
              className={`font-black tracking-tight whitespace-nowrap overflow-hidden text-ellipsis text-[11px] xs:text-xs sm:text-[13px] ${
                canCast
                  ? 'text-stone-950 uppercase'
                  : 'text-amber-100 [text-shadow:_0_1px_3px_rgba(0,0,0,0.95),_0_0_2px_rgba(0,0,0,0.9)]'
              }`}
            >
              {canCast ? (
                <>
                  <span className="font-black">TUYỆT KỸ:</span> {fighter.skillName} (XUẤT CHIÊU NGAY)
                </>
              ) : (
                <>
                  <span className="font-extrabold text-yellow-300">TUYỆT KỸ:</span> {fighter.skillName} ({fighter.mana}/{fighter.skillCost} MP)
                </>
              )}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
