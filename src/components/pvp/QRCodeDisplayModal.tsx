/**
 * Loạn 12 Sứ Quân — QRCodeDisplayModal
 * Máy Chủ (Host) tạo phòng và hiển thị Mã QR Hoàng Kim Đông Sơn.
 * Đối thủ chỉ cần giơ Camera (iPhone/Android) quét là tự động vào phòng ngay.
 * HOÀN TOÀN KHÔNG CẦN BLUETOOTH / AIRDROP.
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  X,
  Share2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Radio,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Warlord } from '../../types/game';
import { p2pService } from '../../services/p2p';
import { ALL_CHARACTERS } from '../../data/warlords';
import { soundEngine } from '../../services/audio';
import { copyToClipboard } from '../../utils/clipboard';

interface QRCodeDisplayModalProps {
  roomCode: string;
  hostWarlord: Warlord;
  onOpponentJoined: (
    hostWarlord: Warlord,
    roomCode: string,
    guestWarlord: Warlord,
    boardSeed: number
  ) => void;
  onClose: () => void;
  onRegenerateCode: () => void;
}

export const QRCodeDisplayModal: React.FC<QRCodeDisplayModalProps> = ({
  roomCode,
  hostWarlord,
  onOpponentJoined,
  onClose,
  onRegenerateCode,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Đang khởi tạo mã QR...');
  const [isReady, setIsReady] = useState(false);
  const isJoinedRef = useRef(false);

  // Xây dựng URL mời trực tiếp
  const getInviteUrl = () => {
    if (typeof window === 'undefined') return roomCode;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?room=${roomCode}`;
  };

  // Tạo ảnh QR Code chất lượng cao
  useEffect(() => {
    const inviteUrl = getInviteUrl();
    QRCode.toDataURL(inviteUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#1c1917', // Stone-900 sang trọng
        light: '#fef3c7', // Nền vàng hoàng gia Amber-100
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Lỗi tạo mã QR:', err);
      });
  }, [roomCode]);

  // Khởi tạo phòng P2P và lắng nghe đối thủ tham gia qua QR Code
  useEffect(() => {
    isJoinedRef.current = false;
    setStatusMessage(`Phòng [${roomCode}] đã sẵn sàng. Đang chờ đối thủ quét mã...`);
    setIsReady(true);

    p2pService.createRoom(roomCode, hostWarlord.id, (status) => {
      if (status === 'UNAVAILABLE_ID') {
        setStatusMessage(`Mã [${roomCode}] đang bận. Đang thử lại mã khác...`);
        onRegenerateCode();
      } else {
        setStatusMessage(`Phòng [${roomCode}] sẵn sàng. Hãy bảo đối thủ giơ camera quét!`);
      }
    });

    const unsubscribe = p2pService.subscribe((msg) => {
      if (isJoinedRef.current) return;

      if (msg.type === 'JOIN_ROOM' && msg.roomId.toUpperCase() === roomCode.toUpperCase()) {
        isJoinedRef.current = true;
        soundEngine.playVictory();
        setStatusMessage('Đối thủ ĐÃ KẾT NỐI qua mã QR! Đang vào trận...');

        const seed = Math.floor(100000 + Math.random() * 900000);
        const guestChar =
          ALL_CHARACTERS.find((c) => c.id === msg.warlordId) || ALL_CHARACTERS[1];

        p2pService.hostWarlordId = hostWarlord.id;
        p2pService.clientWarlordId = guestChar.id;
        p2pService.initialBoardSeed = seed;

        const readyPacket = {
          type: 'ROOM_READY' as const,
          roomId: roomCode,
          hostWarlordId: hostWarlord.id,
          clientWarlordId: guestChar.id,
          initialBoardSeed: seed,
          turnTimerEnabled: p2pService.hostTurnTimerEnabled,
          turnTimeLimit: p2pService.hostTurnTimeLimit,
        };

        p2pService.send(readyPacket);
        setTimeout(() => p2pService.send(readyPacket), 180);
        setTimeout(() => p2pService.send(readyPacket), 450);

        setTimeout(() => {
          onOpponentJoined(hostWarlord, roomCode, guestChar, seed);
        }, 500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, hostWarlord, onOpponentJoined, onRegenerateCode]);

  const handleCopyLink = async () => {
    const url = getInviteUrl();
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(roomCode);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-stone-950 border-2 border-yellow-400 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.4)] overflow-hidden flex flex-col text-stone-100 max-h-[92vh]">
        {/* Header Hoàng Kim Đông Sơn */}
        <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 px-4 py-3 border-b border-yellow-500/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-yellow-400 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wider font-display truncate">
                MÃ QR GHÉP ĐÔI GIAO CHIẾN
              </h3>
              <p className="text-[10px] text-amber-200/90 truncate">
                Máy 1: <strong className="text-white">{hostWarlord.name}</strong> ({hostWarlord.shortTerritory || 'Sứ Quân'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-400/80 active:scale-95 transition cursor-pointer shrink-0 shadow"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-3.5 sm:p-4 space-y-3 bg-bronze-pattern overflow-y-auto flex flex-col items-center">
          {/* Thông điệp rõ ràng về việc KHÔNG CẦN BLUETOOTH */}
          <div className="w-full p-2 bg-emerald-950/70 border border-emerald-400/80 rounded-xl flex items-center gap-2 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <div className="text-[11px] text-emerald-100 leading-snug">
              <span className="font-bold text-yellow-300">Không cần Bluetooth hay AirDrop!</span> Quét bằng Camera quang học 100% thành công trên iPhone & Android.
            </div>
          </div>

          {/* Khung Trưng Bày Mã QR Hoàng Kim */}
          <div className="relative p-3.5 bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-200 rounded-2xl border-4 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.5)] flex flex-col items-center">
            {/* 4 Góc Hoa Văn Đông Sơn cách điệu */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-900" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-900" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-900" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-900" />

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Mã QR phòng ${roomCode}`}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain shadow-md"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-amber-900 animate-spin" />
                <span className="text-xs font-bold text-amber-900">Đang tạo mã QR...</span>
              </div>
            )}

            {/* Mã phòng 4 chữ số to rõ rệt */}
            <div className="mt-2 text-center">
              <div className="text-[10px] uppercase font-black tracking-wider text-amber-950">
                MÃ PHÒNG GIAO ĐẤU
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 tracking-[0.25em] font-mono">
                {roomCode}
              </div>
            </div>
          </div>

          {/* Trạng thái chờ đối thủ */}
          <div className="w-full p-2 bg-stone-900/90 border border-yellow-500/60 rounded-xl flex items-center justify-center gap-2 text-center">
            <Radio className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-yellow-200 truncate">
              {statusMessage}
            </span>
          </div>

          {/* Hướng dẫn thao tác cho bạn bè */}
          <div className="w-full text-center text-[11px] text-amber-200/90 bg-amber-950/60 p-2 rounded-xl border border-amber-800/60 leading-relaxed">
            👉 <strong className="text-white">Máy đối thủ:</strong> Mở <span className="text-yellow-300 font-bold">Camera trên điện thoại</span> (hoặc nút <span className="text-cyan-300 font-bold">"Quét Mã QR"</span> ở màn hình game) rồi rọi vào mã QR trên. Trận đấu sẽ tự động bắt đầu!
          </div>

          {/* Các nút Sao Chép & Làm Mới */}
          <div className="w-full grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2 px-2.5 bg-amber-900/90 hover:bg-amber-800 active:scale-95 rounded-xl border border-yellow-400/80 text-yellow-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã chép mã</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chép mã: {roomCode}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2 px-2.5 bg-amber-900/90 hover:bg-amber-800 active:scale-95 rounded-xl border border-yellow-400/80 text-yellow-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã chép link</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Sao chép Link mời</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Nút Đáy */}
        <div className="p-3 bg-stone-950 border-t border-amber-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onRegenerateCode}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-600/70 text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đổi mã mới</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs rounded-xl border border-yellow-200 shadow active:scale-95 transition cursor-pointer uppercase tracking-wider text-center"
          >
            ĐÓNG &amp; QUAY LẠI
          </button>
        </div>
      </div>
    </div>
  );
};
