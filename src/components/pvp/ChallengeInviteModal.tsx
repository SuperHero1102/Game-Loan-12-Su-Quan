/**
 * Loạn 12 Sứ Quân — Royal Challenge Invite Modal
 * Hộp thoại Chiến Thư Hoàng Kim Đông Sơn khi có thiết bị đối phương thách đấu.
 * Thiết kế chuẩn touch trên iPhone & Android với đồng hồ đếm ngược 15s và hiệu ứng hào hùng.
 */

import React, { useEffect, useState } from 'react';
import { Swords, ShieldAlert, X, Check, Clock, Smartphone, Signal } from 'lucide-react';
import { ActiveInvite } from '../../services/deviceDiscovery';
import { ALL_CHARACTERS } from '../../data/warlords';

interface ChallengeInviteModalProps {
  invite: ActiveInvite;
  onAccept: (invite: ActiveInvite) => void;
  onReject: (invite: ActiveInvite) => void;
}

export const ChallengeInviteModal: React.FC<ChallengeInviteModalProps> = ({
  invite,
  onAccept,
  onReject,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject(invite);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [invite, onReject]);

  const senderWarlord =
    ALL_CHARACTERS.find((c) => c.id === invite.fromWarlordId) || ALL_CHARACTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-stone-950 border-2 border-yellow-400 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.35)] overflow-hidden flex flex-col text-stone-100">
        {/* Họa Tiết Đỉnh Đông Sơn Hoàng Kim */}
        <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 px-4 py-3 border-b border-yellow-500/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600/90 border border-yellow-300 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse">
              <Swords className="w-4 h-4 text-yellow-200" />
            </div>
            <div>
              <h3 className="text-sm font-black text-yellow-300 uppercase tracking-wider font-display">
                CHIẾN THƯ KHIÊU CHIẾN!
              </h3>
              <p className="text-[10px] text-amber-200/90 flex items-center gap-1">
                <span>Thiết bị ở gần vừa gửi lời mời</span>
                <span>·</span>
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <Signal className="w-2.5 h-2.5" /> Sóng mạnh
                </span>
              </p>
            </div>
          </div>

          {/* Đồng hồ đếm ngược 15s */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/90 border border-yellow-400/80 rounded-xl text-yellow-300 font-mono font-black text-xs shadow-inner">
            <Clock className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span>{secondsLeft}s</span>
          </div>
        </div>

        {/* Thân Hộp Thoại */}
        <div className="p-4 flex flex-col items-center text-center space-y-3.5 bg-bronze-pattern">
          {/* Thông tin Máy & Tướng Thách Đấu */}
          <div className="w-full bg-amber-950/85 border border-yellow-500/70 rounded-2xl p-3 shadow-lg flex items-center gap-3">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-yellow-400 shrink-0 bg-stone-900 shadow-md">
              <img
                src={senderWarlord.portrait3D || '/assets/aistudio/IMG_2711_a7aea1e8.png'}
                alt={senderWarlord.name}
                className="w-full h-full object-cover object-top scale-110"
              />
              <span className="absolute bottom-0 inset-x-0 bg-amber-950/90 text-yellow-300 text-[8px] font-black uppercase text-center py-0.5 border-t border-amber-600">
                {senderWarlord.avatarEmoji} {senderWarlord.shortTerritory || 'SỨ QUÂN'}
              </span>
            </div>

            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold truncate">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{invite.fromDeviceName}</span>
              </div>

              <div className="text-sm font-black text-white truncate mt-0.5">
                {senderWarlord.name}
              </div>

              <div className="text-[10px] text-amber-200/90 mt-1 line-clamp-2 leading-relaxed">
                Tướng quân muốn giao chiến trực tiếp với bạn ngay bây giờ!
              </div>
            </div>
          </div>

          <div className="text-xs text-amber-200 leading-relaxed px-1">
            Chấp nhận lời mời để <strong className="text-yellow-300">tự động vào trận</strong> mà không cần nhập bất kỳ mã số nào.
          </div>

          {/* Cặp Nút Hành Động To & Rõ Ràng Cho Điện Thoại */}
          <div className="w-full space-y-2 pt-1">
            <button
              type="button"
              onClick={() => onAccept(invite)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black text-sm rounded-2xl border-2 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center justify-center gap-2 cursor-pointer transition uppercase tracking-wider"
            >
              <Swords className="w-5 h-5 text-stone-950 shrink-0" />
              <span>CHẤP NHẬN GIAO CHIẾN ({secondsLeft}s)</span>
            </button>

            <button
              type="button"
              onClick={() => onReject(invite)}
              className="w-full py-2.5 px-4 bg-rose-950/90 hover:bg-rose-900 active:scale-95 text-rose-200 hover:text-white font-bold text-xs rounded-xl border border-rose-500/80 transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <X className="w-4 h-4 text-rose-300 shrink-0" />
              <span>TỪ CHỐI CHIẾN THƯ</span>
            </button>
          </div>
        </div>

        {/* Thanh chân trang hoàng kim */}
        <div className="bg-stone-950/95 px-4 py-2 border-t border-amber-900/60 text-center">
          <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest">
            ⚜️ ĐẠI CỒ VIỆT · CHIẾN TRƯỜNG ĐỐI KHÁNG 2 THIẾT BỊ ⚜️
          </span>
        </div>
      </div>
    </div>
  );
};
