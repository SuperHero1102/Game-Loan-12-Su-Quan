/**
 * Loạn 12 Sứ Quân — Đại Lễ Đăng Quang Hoàng Đế Đinh Tiên Hoàng (968)
 * - Nghi thức Đăng Quang Xưng Đế: Quốc hiệu Đại Cồ Việt, Niên hiệu Thái Bình
 * - Pháo hoa mừng thắng lợi hoàng kim (canvas-confetti)
 * - Mở khóa Tướng Thần Thoại 3D Đinh Tiên Hoàng (Long Bào Hoàng Kim)
 * - Lựa chọn: "Chiêm Ngưỡng Giang Sơn" hoặc "Tái Lập Giang Sơn (New Game+)"
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { PlayerProfile } from '../../types/game';
import { DINH_TIEN_HOANG } from '../../data/warlords';
import { Warlord3DScene } from '../character/Warlord3DScene';
import { soundEngine } from '../../services/audio';
import {
  Crown,
  Sparkles,
  Award,
  Swords,
  Shield,
  Heart,
  Zap,
  RotateCcw,
  Check,
  ChevronRight,
  BookOpen,
  Volume2,
} from 'lucide-react';

interface CoronationModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onStartNewGamePlus: () => void;
  onOpenChronicle?: () => void;
}

export const CoronationModal: React.FC<CoronationModalProps> = ({
  profile,
  onClose,
  onStartNewGamePlus,
  onOpenChronicle,
}) => {
  const [tab, setTab] = useState<'EDICT' | 'EMPEROR_CARD'>('EDICT');
  const [confirmNewGamePlus, setConfirmNewGamePlus] = useState(false);

  // Pháo hoa hoàng kim nổ rộn rã khi mở Đại Lễ
  useEffect(() => {
    soundEngine.playBronzeGong();

    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ['#f59e0b', '#ef4444', '#fde047', '#10b981', '#ffffff'];

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 9999,
      });
    }, 280);

    return () => clearInterval(interval);
  }, []);

  const nextPrestige = (profile.prestigeLevel || 0) + 1;

  return (
    <div className="modal-backdrop-safe">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#2a1306] via-[#1d0d04] to-[#100602] border-2 border-yellow-400 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.4)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-300">
        {/* BANNER ĐỈNH ĐẠI LỄ ĐĂNG QUANG */}
        <div className="relative p-4 text-center bg-gradient-to-r from-red-950 via-amber-900 to-red-950 border-b-2 border-yellow-400/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-xs font-black mb-1 animate-pulse">
            <Crown className="w-4 h-4 text-yellow-300" />
            <span>THỐNG NHẤT 12 SỨ QUÂN — ĐẠI VIỆT KHAI QUỐC</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-yellow-300 tracking-wider drop-shadow-[0_2px_10px_rgba(250,204,21,0.8)]">
            ĐẠI LỄ ĐĂNG QUANG
          </h1>
          <p className="text-xs text-amber-200 font-semibold mt-0.5">
            Hoàng Đế Đinh Tiên Hoàng — Quốc Hiệu Đại Cồ Việt (968)
          </p>

          {/* Tab chuyển đổi Chiếu Chỉ / Thẻ Hoàng Đế */}
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setTab('EDICT')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                tab === 'EDICT'
                  ? 'bg-yellow-400 text-stone-950 shadow-lg scale-105'
                  : 'bg-stone-900/80 text-amber-300 border border-amber-600/60 hover:bg-stone-800'
              }`}
            >
              📜 Chiếu Chỉ Khai Quốc
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playShield();
                setTab('EMPEROR_CARD');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                tab === 'EMPEROR_CARD'
                  ? 'bg-yellow-400 text-stone-950 shadow-lg scale-105'
                  : 'bg-stone-900/80 text-amber-300 border border-amber-600/60 hover:bg-stone-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span>Nhận Tướng Hoàng Đế 3D</span>
            </button>
          </div>
        </div>

        {/* NỘI DUNG CUỘN */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'EDICT' ? (
            <div className="space-y-4">
              {/* KHUNG CUỐN THƯ CUNG ĐÌNH */}
              <div className="p-4 rounded-2xl bg-amber-950/60 border-2 border-amber-500/60 shadow-inner text-amber-100 font-body relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                  <Crown className="w-32 h-32 text-yellow-400" />
                </div>

                <div className="text-center font-display text-sm font-black text-yellow-300 border-b border-amber-500/40 pb-2 mb-3 tracking-widest">
                  ★ HỊCH KHAI QUỐC THÁI BÌNH ★
                </div>

                <div className="text-xs sm:text-[13px] leading-relaxed space-y-2.5 text-justify text-stone-200">
                  <p>
                    <span className="font-bold text-yellow-300">Năm Mậu Thìn (968)</span>: Sau hai
                    mươi năm khói lửa phân tranh, Vạn Thắng Vương Đinh Bộ Lĩnh đã quét sạch cát cứ
                    12 sứ quân, cứu trăm họ khỏi cảnh lầm than, thu giang sơn vạn dặm về một mối!
                  </p>
                  <p>
                    Nay dựng điện Đăng Quang tại kinh đô Hoa Lư sơn thủy tú lệ, xưng tôn hiệu:{' '}
                    <span className="font-black text-amber-300 uppercase">
                      Đại Thắng Minh Hoàng Đế (Đinh Tiên Hoàng)
                    </span>
                    .
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-yellow-500/40 text-[11px] space-y-1">
                    <div className="text-yellow-300 font-bold">🏛️ Quốc Hiệu: ĐẠI CỒ VIỆT</div>
                    <div className="text-emerald-300 font-bold">☀️ Niên Hiệu: THÁI BÌNH</div>
                    <div className="text-sky-300 font-bold">
                      💰 Tiền Tệ: Thái Bình Hưng Bảo (Tiền đồng đầu tiên của dân tộc)
                    </div>
                  </div>
                  <p className="italic text-center text-yellow-200 font-semibold pt-1">
                    « Nền độc lập muôn đời đã định — Đại Việt hùng cường rực rỡ trời Nam! »
                  </p>
                </div>
              </div>

              {/* THÔNG BÁO MỞ KHÓA ĐẶC QUYỀN HOÀNG ĐẾ */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-900/70 via-yellow-900/50 to-amber-900/70 border border-yellow-400 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-300 flex items-center justify-center text-yellow-300 shrink-0 shadow-md">
                  <Award className="w-7 h-7 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-yellow-300 font-display">
                    ĐÃ MỞ KHÓA: LONG BÀO HOÀNG ĐẾ 3D
                  </h4>
                  <p className="text-[11px] text-stone-300">
                    Nhân vật Tối Cao Đinh Tiên Hoàng đã sẵn sàng trong kho tướng với chỉ số Hoàng Gia
                    vượt bậc!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* TAB THẺ 3D HOÀNG ĐẾ */
            <div className="space-y-4 flex flex-col items-center">
              {/* KHUNG THẺ 3D HOÀNG KIM */}
              <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 border-2 border-yellow-400 p-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400 text-[10px] font-black text-yellow-300 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> THẦN THOẠI BẬC NHẤT
                  </span>
                  <span className="text-[10px] text-amber-200 font-mono">Bậc 13 / 13</span>
                </div>

                {/* KHUNG SCENE 3D */}
                <div className="w-full h-52 rounded-xl overflow-hidden bg-gradient-to-b from-stone-950 to-amber-950/80 border border-yellow-500/50 relative shadow-inner">
                  <Warlord3DScene
                    warlordId={DINH_TIEN_HOANG.id}
                    name={DINH_TIEN_HOANG.name}
                    portrait3D={DINH_TIEN_HOANG.portrait3D}
                    compact={false}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-yellow-400/60 text-[9px] font-bold text-yellow-300">
                    Long Bào Hoàng Kim
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <h3 className="font-display font-black text-lg text-yellow-300">
                    {DINH_TIEN_HOANG.name}
                  </h3>
                  <p className="text-[11px] text-amber-200 font-semibold">
                    {DINH_TIEN_HOANG.title}
                  </p>
                  <p className="text-[10px] text-stone-300 mt-1 line-clamp-2 italic">
                    « {DINH_TIEN_HOANG.quote} »
                  </p>
                </div>

                {/* THUỘC TÍNH HOÀNG ĐẾ */}
                <div className="mt-3 grid grid-cols-4 gap-1.5 text-center bg-black/50 p-2 rounded-xl border border-amber-900/60 font-mono text-xs">
                  <div>
                    <div className="text-[9px] text-stone-400">SINH LỰC</div>
                    <div className="font-black text-rose-400 flex items-center justify-center gap-0.5">
                      <Heart className="w-3 h-3 fill-rose-500" /> {DINH_TIEN_HOANG.hpRating}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-stone-400">CÔNG LỰC</div>
                    <div className="font-black text-amber-400 flex items-center justify-center gap-0.5">
                      <Swords className="w-3 h-3" /> {DINH_TIEN_HOANG.atkRating}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-stone-400">PHÒNG NGỰ</div>
                    <div className="font-black text-sky-400 flex items-center justify-center gap-0.5">
                      <Shield className="w-3 h-3 fill-sky-400" /> {DINH_TIEN_HOANG.defRating}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-stone-400">TỐC ĐỘ</div>
                    <div className="font-black text-emerald-400 flex items-center justify-center gap-0.5">
                      <Zap className="w-3 h-3 fill-emerald-400" /> {DINH_TIEN_HOANG.spd}
                    </div>
                  </div>
                </div>

                {/* TUYỆT KỸ HOÀNG ĐẾ */}
                <div className="mt-2.5 p-2 rounded-lg bg-amber-950/80 border border-yellow-500/40 text-[10px]">
                  <span className="font-black text-yellow-300">Tuyệt Kỹ: </span>
                  <span className="text-stone-200">{DINH_TIEN_HOANG.skillDescription}</span>
                </div>
              </div>
            </div>
          )}

          {/* XÁC NHẬN CHẾ ĐỘ NEW GAME+ (TÁI LẬP GIANG SƠN) */}
          {confirmNewGamePlus && (
            <div className="p-3.5 rounded-2xl bg-red-950/90 border-2 border-red-500 text-stone-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-yellow-300 font-display font-black text-xs sm:text-sm">
                <RotateCcw className="w-4 h-4 text-red-400 animate-spin" />
                <span>XÁC NHẬN: TÁI LẬP GIANG SƠN (VƯƠNG TRIỀU {nextPrestige})</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Bạn sẽ khởi đầu lại từ Ải 1 với thử thách tăng cao{' '}
                <span className="text-red-400 font-bold">(Quân địch +35% Máu & Công)</span>, thưởng{' '}
                <span className="text-yellow-400 font-bold">x1.5 Vàng</span> mỗi trận.
              </p>
              <div className="text-[10px] text-emerald-300 font-semibold">
                ✓ Giữ nguyên toàn bộ Vàng, Cấp Độ, Trang Bị và Tướng Hoàng Đế đã mở!
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmNewGamePlus(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playBronzeGong();
                    onStartNewGamePlus();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black shadow-lg cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>XÁC NHẬN TÁI LẬP</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ĐẾ ĐÁY 2 LỰA CHỌN THƯƠNG MẠI CHUYÊN NGHIỆP */}
        <div className="p-3.5 bg-stone-950 border-t-2 border-amber-600/70 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {onOpenChronicle && (
            <button
              type="button"
              onClick={onOpenChronicle}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem Sử Ký Toàn Thư</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* LỰA CHỌN 1: CHIÊM NGƯỠNG BẢN ĐỒ TOÀN THẮNG */}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 border border-yellow-400/80 text-yellow-300 text-xs font-black shadow cursor-pointer active:scale-95"
            >
              Chiêm Ngưỡng Giang Sơn
            </button>

            {/* LỰA CHỌN 2: TÁI LẬP GIANG SƠN (NEW GAME+) */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playShield();
                setConfirmNewGamePlus(true);
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 text-xs font-black shadow-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-950" />
              <span>Tái Lập Giang Sơn (NG+)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
