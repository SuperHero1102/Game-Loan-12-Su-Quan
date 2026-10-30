/**
 * Loạn 12 Sứ Quân — Bluetooth & AirDrop Readiness Assistant Modal
 * Hướng dẫn trực quan từng bước kích hoạt Bluetooth & AirDrop trên iPhone (iOS Safari)
 * và Android (Chrome), giải quyết triệt để rào cản Sandbox bảo mật của hệ điều hành di động.
 */

import React, { useState } from 'react';
import {
  Bluetooth,
  Radio,
  Wifi,
  Smartphone,
  CheckCircle2,
  X,
  Sparkles,
  Share2,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { soundEngine } from '../../services/audio';

interface BluetoothAirDropGuideModalProps {
  platform: 'ios' | 'android' | 'web';
  deviceName: string;
  onConfirmReady: () => void;
  onClose: () => void;
}

export const BluetoothAirDropGuideModal: React.FC<BluetoothAirDropGuideModalProps> = ({
  platform,
  deviceName,
  onConfirmReady,
  onClose,
}) => {
  const isApple = platform === 'ios';
  const [hasTurnedOn, setHasTurnedOn] = useState(false);

  const handleConfirm = () => {
    soundEngine.playRadarBeep();
    onConfirmReady();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm sm:max-w-md bg-stone-950 border-2 border-yellow-400 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.35)] overflow-hidden flex flex-col text-stone-100">
        {/* Header Hoàng Kim Đông Sơn */}
        <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 px-4 py-3 border-b border-yellow-500/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-yellow-400 flex items-center justify-center shrink-0">
              <Bluetooth className="w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wider font-display truncate">
                {isApple ? 'BẬT BLUETOOTH & AIRDROP' : 'BẬT BLUETOOTH Ở GẦN'}
              </h3>
              <p className="text-[10px] text-amber-200/90 truncate flex items-center gap-1">
                <span>Thiết bị:</span>
                <strong className="text-white font-bold">{deviceName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-400/80 active:scale-95 transition cursor-pointer shrink-0 shadow"
            title="Đóng hướng dẫn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung các bước thao tác */}
        <div className="p-3.5 sm:p-4 space-y-3 bg-bronze-pattern max-h-[75vh] overflow-y-auto">
          {/* Thông báo cơ chế bảo mật sandbox */}
          <div className="p-2.5 bg-amber-950/70 border border-amber-600/70 rounded-xl flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-200 leading-snug">
              {isApple ? (
                <span>
                  Trình duyệt <strong className="text-white">Safari trên iPhone</strong> có cơ chế bảo mật Sandbox, không cho phép web tự bật công tắc phần cứng máy. Vui lòng bật thủ công trong 5 giây theo hướng dẫn dưới đây:
                </span>
              ) : (
                <span>
                  Trình duyệt yêu cầu <strong className="text-white">Bluetooth</strong> được bật trên thiết bị Android của bạn để phát sóng và nhận tín hiệu đối thủ ở gần:
                </span>
              )}
            </div>
          </div>

          {/* Hướng dẫn từng bước trực quan */}
          <div className="space-y-2">
            {isApple ? (
              <>
                {/* Bước 1 iOS */}
                <div className="p-2.5 bg-stone-900/90 border border-yellow-500/40 rounded-xl flex items-start gap-2.5 shadow">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/80 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 text-xs text-amber-100 leading-relaxed">
                    <strong className="text-yellow-300 block mb-0.5">
                      Mở Trung tâm điều khiển (Control Center)
                    </strong>
                    Vuốt từ góc trên bên phải màn hình (hoặc vuốt từ dưới lên đối với iPhone có nút Home) xuống.
                  </div>
                </div>

                {/* Bước 2 iOS */}
                <div className="p-2.5 bg-stone-900/90 border border-yellow-500/40 rounded-xl flex items-start gap-2.5 shadow">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/80 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 text-xs text-amber-100 leading-relaxed">
                    <strong className="text-yellow-300 block mb-0.5">
                      Bật Biểu tượng Bluetooth
                    </strong>
                    Chạm vào biểu tượng <span className="text-sky-300 font-bold">Bluetooth</span> để chuyển sang màu xanh dương (Bật).
                  </div>
                </div>

                {/* Bước 3 iOS */}
                <div className="p-2.5 bg-stone-900/90 border border-yellow-500/40 rounded-xl flex items-start gap-2.5 shadow">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/80 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1 text-xs text-amber-100 leading-relaxed">
                    <strong className="text-yellow-300 block mb-0.5">
                      Bật AirDrop "Mọi người trong 10 phút"
                    </strong>
                    Nhấn giữ cụm 4 ô kết nối (Wifi/Sóng) ➔ Chạm vào <span className="text-sky-300 font-bold">AirDrop</span> ➔ Chọn <span className="text-emerald-300 font-bold">Mọi người trong 10 phút</span> (Everyone for 10 min).
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Bước 1 Android */}
                <div className="p-2.5 bg-stone-900/90 border border-yellow-500/40 rounded-xl flex items-start gap-2.5 shadow">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/80 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 text-xs text-amber-100 leading-relaxed">
                    <strong className="text-yellow-300 block mb-0.5">
                      Bật Bluetooth trên điện thoại
                    </strong>
                    Kéo thanh thông báo từ mép trên đỉnh màn hình xuống ➔ Chạm vào biểu tượng <span className="text-sky-300 font-bold">Bluetooth</span> để Bật.
                  </div>
                </div>

                {/* Bước 2 Android */}
                <div className="p-2.5 bg-stone-900/90 border border-yellow-500/40 rounded-xl flex items-start gap-2.5 shadow">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/80 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 text-xs text-amber-100 leading-relaxed">
                    <strong className="text-yellow-300 block mb-0.5">
                      Chấp nhận quyền khi hệ thống hỏi
                    </strong>
                    Nếu trình duyệt hiện popup hệ thống <span className="text-white italic">"Một ứng dụng muốn bật Bluetooth"</span> hoặc hỏi quyền Vị trí/Thiết bị xung quanh ➔ Nhấn <span className="text-emerald-300 font-bold">Cho phép (Allow)</span>.
                  </div>
                </div>
              </>
            )}

            {/* Mẹo chơi Offline hoàn toàn không cần Internet */}
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/60 rounded-xl flex items-start gap-2 shadow-inner">
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-100 leading-relaxed">
                <strong className="text-emerald-300 block font-bold mb-0.5">
                  💡 Mẹo chơi Offline không có Internet:
                </strong>
                Nếu ở nơi không có 4G/Wifi bên ngoài, 1 máy hãy bật <span className="text-yellow-300 font-bold">Điểm phát sóng cá nhân (Hotspot)</span> để máy kia kết nối vào. Hai máy sẽ tự tìm thấy nhau ngay lập tức!
              </div>
            </div>
          </div>
        </div>

        {/* Nút Hành Động Xác Nhận Đã Bật & Quét Ngay */}
        <div className="p-3 bg-stone-950 border-t border-amber-800/80 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-xl border-2 border-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.45)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition"
          >
            <CheckCircle2 className="w-4 h-4 text-stone-950 shrink-0" />
            <span className="truncate">
              {isApple
                ? 'ĐÃ BẬT BLUETOOTH & AIRDROP — QUÉT NGAY'
                : 'ĐÃ BẬT BLUETOOTH — BẮT ĐẦU QUÉT NGAY'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-center text-[11px] text-amber-300/80 hover:text-amber-100 cursor-pointer"
          >
            Đóng bảng hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
