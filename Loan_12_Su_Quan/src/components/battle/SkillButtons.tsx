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
      <div className="w-full max-w-md mx-auto">
        <button
          type="button"
          disabled={!canCast}
          onClick={onCastSkill}
          className={`relative w-full py-2 px-3 rounded-xl overflow-hidden flex items-center justify-center gap-1.5 font-black text-xs transition-all duration-200 border-2 whitespace-nowrap ${
            canCast
              ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-stone-950 border-yellow-200 ring-2 ring-yellow-300 animate-pulse shadow-xl cursor-pointer'
              : 'bg-amber-950/90 text-yellow-200 border-amber-400/80 cursor-not-allowed shadow-inner'
          }`}
        >
          {/* Thanh tiến độ tích Nộ chạy nền bên dưới khi chưa đủ 100% */}
          {!canCast && (
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600/65 via-amber-500/55 to-yellow-400/55 transition-all duration-300 pointer-events-none"
              style={{ width: `${manaPercent}%` }}
            />
          )}

          <div className="relative z-10 flex items-center justify-center gap-1.5 min-w-0">
            {canCast ? (
              <Flame className="w-4 h-4 shrink-0 text-red-900 fill-red-700 animate-bounce" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-yellow-300" />
            )}
            <span className="truncate">
              TUYỆT KỸ: {fighter.skillName} ({fighter.mana}/{fighter.skillCost} MP)
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
