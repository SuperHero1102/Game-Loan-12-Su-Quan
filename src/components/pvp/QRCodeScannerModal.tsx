/**
 * Loạn 12 Sứ Quân — QRCodeScannerModal
 * Mở Camera để quét Mã QR từ màn hình máy đối thủ.
 * Hỗ trợ cả Camera sau (Environment) và Camera trước.
 * Tự động trích xuất Mã phòng và kết nối vào trận ngay tức thì.
 * KHÔNG CẦN BLUETOOTH / AIRDROP.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  X,
  FlipHorizontal,
  Zap,
  ZapOff,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Scan,
} from 'lucide-react';
import { soundEngine } from '../../services/audio';

interface QRCodeScannerModalProps {
  onCodeScanned: (roomCode: string) => void;
  onClose: () => void;
}

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  onCodeScanned,
  onClose,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannedRef = useRef<boolean>(false);

  // Phân tích nội dung quét được để tìm mã phòng
  const extractRoomCode = (text: string): string | null => {
    const trimmed = text.trim();

    // 1. Nếu là URL đầy đủ có query ?room=XXXX hoặc ?join=XXXX
    try {
      const url = new URL(trimmed);
      const roomParam = url.searchParams.get('room') || url.searchParams.get('join');
      if (roomParam) {
        return roomParam.trim().toUpperCase();
      }
    } catch {
      // Không phải URL, tiếp tục kiểm tra regex
    }

    // 2. Tìm match query string trong chuỗi nếu URL tương đối: ?room=1234
    const matchParam = trimmed.match(/[?&](?:room|join)=([A-Za-z0-9]+)/i);
    if (matchParam && matchParam[1]) {
      return matchParam[1].toUpperCase();
    }

    // 3. Nếu chuỗi là mã 4-8 ký tự chữ và số (ví dụ: 8899, ABCD)
    const matchCode = trimmed.match(/^[A-Za-z0-9]{4,8}$/);
    if (matchCode) {
      return trimmed.toUpperCase();
    }

    return null;
  };

  const handleScanSuccess = (decodedText: string) => {
    if (isScannedRef.current) return;

    const extracted = extractRoomCode(decodedText);
    if (extracted) {
      isScannedRef.current = true;
      soundEngine.playVictory();
      setScanSuccess(extracted);

      // Dừng camera
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {}
      }

      setTimeout(() => {
        onCodeScanned(extracted);
      }, 400);
    }
  };

  // Khởi động Camera Scanner
  useEffect(() => {
    let isMounted = true;
    isScannedRef.current = false;

    const startScanner = async () => {
      try {
        setCameraError(null);
        setIsCameraActive(false);

        // Đảm bảo DOM reader đã sẵn sàng
        const element = document.getElementById('qr-camera-viewport');
        if (!element) return;

        // Dọn dẹp scanner cũ nếu có
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch {}
          scannerRef.current = null;
        }

        const html5QrCode = new Html5Qrcode('qr-camera-viewport');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              handleScanSuccess(decodedText);
            }
          },
          () => {
            // Frame không có QR (ignore)
          }
        );

        if (isMounted) {
          setIsCameraActive(true);
          // Kiểm tra hỗ trợ đèn pin
          try {
            const capabilities = html5QrCode.getRunningTrackCapabilities();
            if (capabilities && (capabilities as any).torch) {
              setHasTorch(true);
            }
          } catch {}
        }
      } catch (err: any) {
        console.warn('Lỗi khởi động Camera:', err);
        if (isMounted) {
          setCameraError(
            err?.message ||
              'Không thể mở Camera. Vui lòng cấp quyền Camera trong cài đặt trình duyệt hoặc nhập mã phòng bằng tay phía dưới.'
          );
          setIsCameraActive(false);
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current
            .stop()
            .then(() => scannerRef.current?.clear())
            .catch(() => {});
        } catch {}
      }
    };
  }, [facingMode]);

  // Đổi Camera Trước / Sau
  const handleToggleFacingMode = () => {
    soundEngine.playRadarBeep();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Bật / Tắt Đèn pin
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setIsTorchOn(nextTorch);
    } catch {}
  };

  // Xác nhận nhập mã bằng tay
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCodeInput.trim().toUpperCase();
    if (!clean) return;
    soundEngine.playVictory();
    onCodeScanned(clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-stone-950 border-2 border-yellow-400 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.4)] overflow-hidden flex flex-col text-stone-100 max-h-[92vh]">
        {/* Header Hoàng Kim */}
        <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 px-4 py-3 border-b border-yellow-500/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-yellow-400 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wider font-display truncate">
                QUÉT MÃ QR ĐỐI THỦ
              </h3>
              <p className="text-[10px] text-amber-200/90 truncate">
                Máy 2: Hướng camera vào màn hình Máy 1
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-400/80 active:scale-95 transition cursor-pointer shrink-0 shadow"
            title="Đóng camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung quét */}
        <div className="p-3.5 sm:p-4 space-y-3 bg-bronze-pattern overflow-y-auto flex flex-col items-center">
          {/* Thông báo quét quang học */}
          <div className="w-full p-2 bg-amber-950/70 border border-amber-600/70 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-amber-200 leading-snug">
              Rọi khung camera vào <strong className="text-yellow-300">Mã QR</strong> trên màn hình máy bạn bè để tự động ghép đôi!
            </div>
          </div>

          {/* Vùng Camera Viewfinder */}
          <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden border-2 border-yellow-400 bg-black flex items-center justify-center shadow-inner">
            {/* Element gắn camera html5-qrcode */}
            <div id="qr-camera-viewport" className="w-full h-full object-cover" />

            {/* Khung ngắm hoa văn hoàng kim & tia quét Laser */}
            {isCameraActive && !scanSuccess && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48 border-2 border-yellow-400/60 rounded-xl">
                  {/* 4 góc vàng nổi bật */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-yellow-300" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-yellow-300" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-yellow-300" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-yellow-300" />

                  {/* Tia quét laser chạy dọc */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-pulse top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Trạng thái thành công */}
            {scanSuccess && (
              <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-center p-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <div className="text-sm font-black text-emerald-200 uppercase">
                  ĐÃ QUÉT THÀNH CÔNG!
                </div>
                <div className="text-xs text-yellow-300 font-bold">
                  Phòng: {scanSuccess} ➔ Đang vào trận...
                </div>
              </div>
            )}

            {/* Trạng thái đang tải camera */}
            {!isCameraActive && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-900/90 text-amber-200">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                <span className="text-xs font-bold">Đang bật Camera...</span>
              </div>
            )}

            {/* Trạng thái lỗi cấp quyền */}
            {cameraError && (
              <div className="absolute inset-0 p-3 bg-stone-900 flex flex-col items-center justify-center gap-2 text-center">
                <AlertCircle className="w-8 h-8 text-rose-400" />
                <span className="text-xs font-bold text-rose-300">
                  {cameraError}
                </span>
                <span className="text-[10px] text-amber-200">
                  Bạn có thể nhập trực tiếp 4 số mã phòng ở bên dưới!
                </span>
              </div>
            )}
          </div>

          {/* Công cụ Camera (Đổi trước/sau, Đèn pin) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/80 rounded-xl text-yellow-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Đổi Camera ({facingMode === 'environment' ? 'Sau' : 'Trước'})</span>
            </button>

            {hasTorch && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer ${
                  isTorchOn
                    ? 'bg-yellow-400 text-stone-950 border-yellow-200 font-black'
                    : 'bg-amber-950/80 text-yellow-200 border-amber-600/80'
                }`}
              >
                {isTorchOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                <span>Đèn pin</span>
              </button>
            )}
          </div>

          {/* Nhập mã phòng bằng tay (Phương án dự phòng tức thì) */}
          <div className="w-full pt-2 border-t border-amber-800/60">
            <div className="text-[11px] font-bold text-yellow-300 mb-1.5 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
              <span>Hoặc nhập 4 số mã phòng nếu không tiện quét:</span>
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value.toUpperCase())}
                placeholder="VD: 8899"
                maxLength={6}
                className="flex-1 bg-stone-900 border border-yellow-400/80 rounded-xl px-3 py-2 text-center text-sm font-black text-yellow-200 uppercase tracking-widest placeholder:text-stone-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!manualCodeInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-stone-950 font-black text-xs rounded-xl border border-yellow-200 shadow active:scale-95 transition cursor-pointer uppercase tracking-wider"
              >
                VÀO PHÒNG
              </button>
            </form>
          </div>
        </div>

        {/* Nút Đáy */}
        <div className="p-3 bg-stone-950 border-t border-amber-800/80 flex items-center justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-700/80 font-bold text-xs rounded-xl active:scale-95 transition cursor-pointer uppercase"
          >
            ĐÓNG &amp; QUAY LẠI
          </button>
        </div>
      </div>
    </div>
  );
};
