/**
 * Loạn 12 Sứ Quân — PvP Multiplayer Lobby
 * Giao diện đối kháng hoàng kim Đông Sơn tràn viền 100% khung hình.
 * Tích hợp:
 * 1. Chế độ 1 Thiết Bị (Hotseat)
 * 2. Tự Động Dò Tìm Thiết Bị (iOS AirDrop/Bluetooth & Android Radar)
 * 3. Gửi Chiến Thư Thách Đấu & Tiếp Nhận Qua Popup Chấp Nhận Tự Động Vào Trận
 * 4. Dự phòng kết nối qua Mã Phòng & Kênh Bluetooth
 */

import React, { useState, useEffect, useRef } from 'react';
import { Warlord } from '../../types/game';
import { ALL_CHARACTERS } from '../../data/warlords';
import { WarlordCard3D } from '../character/WarlordCard3D';
import { p2pService, NearbyDevice } from '../../services/p2p';
import {
  deviceDiscovery,
  DiscoveredPeer,
  ActiveInvite,
} from '../../services/deviceDiscovery';
import { getDeviceInfo, setCustomDeviceNickname } from '../../services/deviceDetection';
import { ChallengeInviteModal } from './ChallengeInviteModal';
import { BluetoothAirDropGuideModal } from './BluetoothAirDropGuideModal';
import { QRCodeDisplayModal } from './QRCodeDisplayModal';
import { QRCodeScannerModal } from './QRCodeScannerModal';
import { soundEngine } from '../../services/audio';
import {
  Swords,
  Smartphone,
  Wifi,
  ArrowLeft,
  X,
  Bluetooth,
  Radio,
  RefreshCw,
  Signal,
  Copy,
  Check,
  Radar,
  Edit2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  Loader2,
  Info,
  QrCode,
  Camera,
  Scan,
} from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

interface PvPLobbyProps {
  onStartHotseat: (p1Warlord: Warlord, p2Warlord: Warlord) => void;
  onStartP2P: (
    myWarlord: Warlord,
    roomId: string,
    isHost: boolean,
    opponentWarlord?: Warlord,
    initialBoardSeed?: number
  ) => void;
  onBack: () => void;
  initialRoomCode?: string;
  turnTimerEnabled?: boolean;
  turnTimeLimit?: number;
  onUpdateTurnTimer?: (enabled: boolean, newLimit: number) => void;
}

export const PvPLobby: React.FC<PvPLobbyProps> = ({
  onStartHotseat,
  onStartP2P,
  onBack,
  initialRoomCode,
  turnTimerEnabled = true,
  turnTimeLimit = 20,
  onUpdateTurnTimer,
}) => {
  const [activeTab, setActiveTab] = useState<'HOTSEAT' | 'P2P_NETWORK'>('P2P_NETWORK');
  const [activePlayerSlot, setActivePlayerSlot] = useState<'P1' | 'P2'>('P1');
  const [p1WarlordId, setP1WarlordId] = useState<string>('dinh_bo_linh');
  const [p2WarlordId, setP2WarlordId] = useState<string>('pham_bach_ho');

  // Network status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Device Info & Nickname
  const [myDevice, setMyDevice] = useState(() => getDeviceInfo());
  const [isEditingNick, setIsEditingNick] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>(myDevice.deviceName);

  // Radar & Auto-Discovery States (chỉ quét khi người dùng ấn nút dò)
  const [isRadarScanning, setIsRadarScanning] = useState<boolean>(false);
  const [discoveredPeers, setDiscoveredPeers] = useState<DiscoveredPeer[]>([]);
  const [incomingInvite, setIncomingInvite] = useState<ActiveInvite | null>(null);
  const [outgoingInvite, setOutgoingInvite] = useState<ActiveInvite | null>(null);
  const [outgoingTimer, setOutgoingTimer] = useState<number>(15);
  const [inviteStatusNotice, setInviteStatusNotice] = useState<string | null>(null);

  // Manual Room Code fallback states (mặc định hiển thị để tăng không gian sử dụng)
  const [showManualCodeSection, setShowManualCodeSection] = useState<boolean>(true);
  const [roomCode, setRoomCode] = useState<string>('');
  const [waitingForGuest, setWaitingForGuest] = useState<boolean>(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState<boolean>(false);
  const [p2pStatusText, setP2pStatusText] = useState<string | null>(null);
  const [copiedRoomCode, setCopiedRoomCode] = useState<boolean>(false);

  // QR Code Proximity Pairing States (Camera Quang Học 100% Không Cần Bluetooth)
  const [showQrDisplayModal, setShowQrDisplayModal] = useState<boolean>(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState<boolean>(false);
  const [qrRoomCode, setQrRoomCode] = useState<string>(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );

  // Bluetooth & AirDrop Assistant modal states (Hỗ trợ iOS Safari & Android Chrome)
  const [showBtGuideModal, setShowBtGuideModal] = useState<boolean>(false);
  const [hasConfirmedBt, setHasConfirmedBt] = useState<boolean>(() => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('loan12sq_bt_confirmed') === 'true';
    }
    return false;
  });

  // Tự động vào phòng nếu người dùng mở link mời từ mã QR (?room=XXXX)
  useEffect(() => {
    if (initialRoomCode) {
      setActiveTab('P2P_NETWORK');
      setTimeout(() => {
        handleJoinRoomWithCode(initialRoomCode);
      }, 400);
    }
  }, [initialRoomCode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const p1WarlordIdRef = useRef(p1WarlordId);
  useEffect(() => {
    p1WarlordIdRef.current = p1WarlordId;
    p2pService.hostWarlordId = p1WarlordId;
    p2pService.hostTurnTimerEnabled = turnTimerEnabled;
    p2pService.hostTurnTimeLimit = turnTimeLimit;
    deviceDiscovery.setWarlord(p1WarlordId);
  }, [p1WarlordId, turnTimerEnabled, turnTimeLimit]);

  const unsubRef = useRef<(() => void) | null>(null);

  // Đồng hồ đếm ngược cho máy gửi chiến thư (15s)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (outgoingInvite) {
      setOutgoingTimer(15);
      timer = setInterval(() => {
        setOutgoingTimer((prev) => {
          if (prev <= 1) {
            handleCancelOutgoingInvite('Hết thời gian chờ đối phương phản hồi.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [outgoingInvite]);

  // Dọn dẹp discovery khi đổi tab hoặc thoát khỏi màn hình (chỉ quét khi người dùng ấn nút dò)
  useEffect(() => {
    if (activeTab !== 'P2P_NETWORK') {
      deviceDiscovery.stopDiscovery();
      setIsRadarScanning(false);
    }

    return () => {
      deviceDiscovery.stopDiscovery();
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      p2pService.stopJoinRetry();
    };
  }, [activeTab]);

  const p1Character = ALL_CHARACTERS.find((c) => c.id === p1WarlordId) || ALL_CHARACTERS[0];
  const p2Character = ALL_CHARACTERS.find((c) => c.id === p2WarlordId) || ALL_CHARACTERS[1];
  const activeHotseatCharacter = activePlayerSlot === 'P1' ? p1Character : p2Character;

  const handleStartHotseat = () => {
    onStartHotseat(p1Character, p2Character);
  };

  // Lưu tên thiết bị tùy chỉnh
  const handleSaveNickname = () => {
    if (nicknameInput.trim()) {
      setCustomDeviceNickname(nicknameInput.trim());
      setMyDevice(getDeviceInfo());
      setIsEditingNick(false);
      deviceDiscovery.setWarlord(p1WarlordIdRef.current);
    }
  };

  // Kích hoạt nút bấm QUÉT BLUETOOTH & AIRDROP Ở GẦN (kiểm tra trạng thái & hỗ trợ từng hệ điều hành)
  const handleScanButtonClick = async () => {
    // Với Android: Thử gọi Web Bluetooth API để hệ điều hành hiện prompt bật Bluetooth nếu hỗ trợ
    if (myDevice.platform === 'android' && typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
        });
      } catch {
        // Người dùng từ chối hoặc đóng popup
      }
    }

    // Nếu chưa từng xác nhận bật Bluetooth/AirDrop trên thiết bị trong phiên này: Mở hướng dẫn trực quan
    if (!hasConfirmedBt) {
      setShowBtGuideModal(true);
      return;
    }

    // Đã bật: Thực hiện quét radar ngay lập tức
    handleTriggerRadarScan();
  };

  // Xác nhận đã bật Bluetooth & AirDrop từ Modal Hướng Dẫn
  const handleConfirmBtReady = () => {
    setHasConfirmedBt(true);
    try {
      sessionStorage.setItem('loan12sq_bt_confirmed', 'true');
    } catch {}
    setShowBtGuideModal(false);
    handleTriggerRadarScan();
  };

  // Quét thiết bị đối thủ ở gần qua Radar đa kênh (Local P2P, Broadcast & Signaling)
  const handleTriggerRadarScan = () => {
    soundEngine.playRadarBeep();
    setIsRadarScanning(true);
    deviceDiscovery.startDiscovery(
      p1WarlordIdRef.current,
      (peers) => setDiscoveredPeers(peers),
      (invite) => {
        soundEngine.playChallengeAlarm();
        setIncomingInvite(invite);
      },
      (status, invite) => {
        if (status === 'ACCEPTED') {
          soundEngine.playVictory();
          setOutgoingInvite(null);
          setInviteStatusNotice('Đối phương đã CHẤP NHẬN! Đang tự động vào trận đấu...');
          const myChar =
            ALL_CHARACTERS.find((c) => c.id === p1WarlordIdRef.current) || ALL_CHARACTERS[0];
          const opponentChar =
            ALL_CHARACTERS.find((c) => c.id === invite.toDeviceId) || ALL_CHARACTERS[1];
          setTimeout(() => {
            onStartP2P(myChar, invite.roomId, true, opponentChar, invite.boardSeed);
          }, 200);
        } else if (status === 'REJECTED') {
          setOutgoingInvite(null);
          setInviteStatusNotice('Đối phương đã từ chối chiến thư.');
          setTimeout(() => setInviteStatusNotice(null), 4000);
        } else if (status === 'CANCELLED') {
          setOutgoingInvite(null);
          setIncomingInvite(null);
        }
      }
    );
  };

  // Máy A: Bấm nút THÁCH ĐẤU trên danh sách
  const handleSendChallengeToPeer = async (peer: DiscoveredPeer) => {
    soundEngine.playSwordHit();
    setInviteStatusNotice(null);
    const invite = await deviceDiscovery.sendChallenge(peer);
    setOutgoingInvite(invite);
  };

  // Hủy lời mời thách đấu
  const handleCancelOutgoingInvite = async (reason?: string) => {
    await deviceDiscovery.cancelChallenge();
    setOutgoingInvite(null);
    if (reason) {
      setInviteStatusNotice(reason);
      setTimeout(() => setInviteStatusNotice(null), 3500);
    }
  };

  // Máy B: Chấp nhận chiến thư
  const handleAcceptIncomingInvite = async (invite: ActiveInvite) => {
    soundEngine.playVictory();
    await deviceDiscovery.acceptChallenge(invite);
    setIncomingInvite(null);

    const myChar =
      ALL_CHARACTERS.find((c) => c.id === p1WarlordIdRef.current) || ALL_CHARACTERS[0];
    const hostChar =
      ALL_CHARACTERS.find((c) => c.id === invite.fromWarlordId) || ALL_CHARACTERS[1];

    // Máy B vào vai Khách (Guest)
    setTimeout(() => {
      onStartP2P(myChar, invite.roomId, false, hostChar, invite.boardSeed);
    }, 250);
  };

  // Máy B: Từ chối chiến thư
  const handleRejectIncomingInvite = async (invite: ActiveInvite) => {
    await deviceDiscovery.rejectChallenge(invite);
    setIncomingInvite(null);
  };

  // ================= GHÉP ĐÔI BẰNG QUÉT MÃ QR (CAMERA QUANG HỌC) =================
  const handleOpenQrHost = () => {
    soundEngine.playRadarBeep();
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setQrRoomCode(newCode);
    setRoomCode(newCode);
    setShowQrDisplayModal(true);
  };

  const handleRegenerateQrCode = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setQrRoomCode(newCode);
    setRoomCode(newCode);
  };

  const handleOpenQrScanner = () => {
    soundEngine.playRadarBeep();
    setShowQrScannerModal(true);
  };

  const handleQrScanned = (code: string) => {
    setShowQrScannerModal(false);
    handleJoinRoomWithCode(code);
  };

  const handleQrOpponentJoined = (
    hostChar: Warlord,
    code: string,
    guestChar: Warlord,
    seed: number
  ) => {
    setShowQrDisplayModal(false);
    onStartP2P(hostChar, code, true, guestChar, seed);
  };

  // ================= DỰ PHÒNG MÃ PHÒNG THỦ CÔNG =================
  const handleCopyRoomCode = async () => {
    if (!roomCode) return;
    const ok = await copyToClipboard(roomCode);
    if (ok) {
      setCopiedRoomCode(true);
      setTimeout(() => setCopiedRoomCode(false), 2500);
    }
  };

  const handleCreateRoomWithCode = (codeToUse?: string) => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    const code = (
      codeToUse ||
      roomCode ||
      Math.floor(1000 + Math.random() * 9000).toString()
    )
      .trim()
      .toUpperCase();
    setRoomCode(code);
    setWaitingForGuest(true);
    setIsJoiningRoom(false);
    setP2pStatusText(`Đang mở phòng [${code}] qua Bluetooth/Mạng...`);

    p2pService.createRoom(code, p1WarlordIdRef.current, (status) => {
      if (status === 'UNAVAILABLE_ID') {
        setP2pStatusText(`Mã phòng [${code}] vừa thoát. Đang tự động kết nối lại...`);
        setTimeout(() => handleCreateRoomWithCode(code), 2000);
      } else {
        setP2pStatusText(`Phòng [${code}] đã sẵn sàng. Đang đợi máy đối thủ...`);
      }
    });

    let started = false;
    const unsubscribe = p2pService.subscribe((msg) => {
      if (started) return;
      if (msg.type === 'JOIN_ROOM' && msg.roomId.toUpperCase() === code.toUpperCase()) {
        started = true;
        const seed = Math.floor(100000 + Math.random() * 900000);
        const hostChar =
          ALL_CHARACTERS.find((c) => c.id === p1WarlordIdRef.current) || ALL_CHARACTERS[0];
        const guestChar =
          ALL_CHARACTERS.find((c) => c.id === msg.warlordId) || ALL_CHARACTERS[1];

        p2pService.hostWarlordId = hostChar.id;
        p2pService.clientWarlordId = guestChar.id;
        p2pService.initialBoardSeed = seed;

        const readyPacket = {
          type: 'ROOM_READY' as const,
          roomId: code,
          hostWarlordId: hostChar.id,
          clientWarlordId: guestChar.id,
          initialBoardSeed: seed,
          turnTimerEnabled,
          turnTimeLimit,
        };

        p2pService.send(readyPacket);
        setTimeout(() => p2pService.send(readyPacket), 180);
        setTimeout(() => p2pService.send(readyPacket), 450);

        unsubscribe();
        unsubRef.current = null;
        onStartP2P(hostChar, code, true, guestChar, seed);
      }
    });

    unsubRef.current = unsubscribe;
  };

  const handleJoinRoomWithCode = (targetCode: string) => {
    const cleanCode = targetCode.trim().toUpperCase();
    if (!cleanCode) {
      setP2pStatusText('Vui lòng nhập Mã Phòng!');
      return;
    }

    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    setWaitingForGuest(false);
    setIsJoiningRoom(true);
    setP2pStatusText(`Đang kết nối vào phòng ${cleanCode}...`);

    let started = false;
    const unsubscribe = p2pService.subscribe((msg) => {
      if (started) return;
      if (
        msg.type === 'ROOM_READY' &&
        (!msg.roomId || msg.roomId.toUpperCase() === cleanCode)
      ) {
        started = true;
        p2pService.stopJoinRetry();
        unsubscribe();
        unsubRef.current = null;

        const myChar =
          ALL_CHARACTERS.find((c) => c.id === p1WarlordIdRef.current) || ALL_CHARACTERS[0];
        const hostChar =
          ALL_CHARACTERS.find((c) => c.id === msg.hostWarlordId) || ALL_CHARACTERS[1];

        p2pService.hostWarlordId = hostChar.id;
        p2pService.clientWarlordId = myChar.id;
        p2pService.initialBoardSeed = msg.initialBoardSeed;

        if (typeof msg.turnTimerEnabled === 'boolean' && typeof msg.turnTimeLimit === 'number') {
          onUpdateTurnTimer?.(msg.turnTimerEnabled, msg.turnTimeLimit);
        }

        onStartP2P(myChar, cleanCode, false, hostChar, msg.initialBoardSeed);
      }
    });

    unsubRef.current = unsubscribe;

    p2pService.joinRoom(cleanCode, myDevice.deviceName, p1WarlordIdRef.current, (errMsg) => {
      if (!started) {
        setIsJoiningRoom(false);
        p2pService.stopJoinRetry();
        setP2pStatusText(errMsg);
      }
    });
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
          <Swords className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
          <span className="truncate">VÕ ĐÀI ĐỐI KHÁNG</span>
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

      {/* Tabs Chế Độ Đấu — Nền Đồng Hoàng Kim */}
      <div className="royal-subbar grid grid-cols-2 gap-2 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('HOTSEAT')}
          className={`py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap truncate cursor-pointer border ${
            activeTab === 'HOTSEAT'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 ring-1 ring-yellow-300 shadow font-black'
              : 'bg-amber-950/80 text-amber-200 hover:bg-amber-900/80 border-amber-700/70 font-bold'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">CÙNG 1 THIẾT BỊ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('P2P_NETWORK')}
          className={`py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap truncate cursor-pointer border ${
            activeTab === 'P2P_NETWORK'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 ring-1 ring-yellow-300 shadow font-black'
              : 'bg-amber-950/80 text-amber-200 hover:bg-amber-900/80 border-amber-700/70 font-bold'
          }`}
        >
          <Radar className="w-3.5 h-3.5 text-cyan-300 animate-spin shrink-0" />
          <span className="truncate">2 THIẾT BỊ (DÒ TÌM &amp; GHÉP ĐÔI)</span>
        </button>
      </div>

      {/* Nội dung cuộn dọc gọn gàng trên nền Hoa Văn Trống Đồng */}
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2 flex flex-col justify-between">
        {activeTab === 'HOTSEAT' ? (
          <div className="w-full max-w-full flex flex-col gap-2 my-auto">
            {/* Thanh chuyển đổi Phe Người Chơi 1 & Người Chơi 2 */}
            <div className="grid grid-cols-2 gap-2 bg-amber-950/85 p-1.5 rounded-xl border border-amber-500/80 shadow">
              <button
                type="button"
                onClick={() => setActivePlayerSlot('P1')}
                className={`p-2 rounded-lg text-left transition-all cursor-pointer border min-w-0 ${
                  activePlayerSlot === 'P1'
                    ? 'bg-gradient-to-br from-amber-500/40 via-amber-900 to-amber-950 border-yellow-300 ring-2 ring-yellow-400 shadow'
                    : 'bg-amber-950/70 border-amber-800/70 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="text-[10px] font-black text-yellow-300 uppercase tracking-wider truncate">
                  ● NGƯỜI CHƠI 1 (TRÁI)
                </div>
                <div className="text-xs font-black text-white truncate mt-0.5">
                  {p1Character.avatarEmoji} {p1Character.name}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePlayerSlot('P2')}
                className={`p-2 rounded-lg text-left transition-all cursor-pointer border min-w-0 ${
                  activePlayerSlot === 'P2'
                    ? 'bg-gradient-to-br from-rose-600/40 via-rose-900 to-amber-950 border-rose-300 ring-2 ring-rose-400 shadow'
                    : 'bg-amber-950/70 border-amber-800/70 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="text-[10px] font-black text-rose-300 uppercase tracking-wider truncate">
                  ● NGƯỜI CHƠI 2 (PHẢI)
                </div>
                <div className="text-xs font-black text-white truncate mt-0.5">
                  {p2Character.avatarEmoji} {p2Character.name}
                </div>
              </button>
            </div>

            {/* Khung hiển thị duy nhất 1 Thẻ Tướng 3D của Người Chơi đang chọn */}
            <div
              className={`w-full max-w-full overflow-hidden p-2.5 bg-amber-950/85 rounded-2xl border shadow-xl flex flex-col items-center ${
                activePlayerSlot === 'P1' ? 'border-amber-400/90' : 'border-rose-400/90'
              }`}
            >
              <div className="w-full max-w-full flex flex-col gap-1 mb-2 min-w-0">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider truncate ${
                    activePlayerSlot === 'P1' ? 'text-yellow-300' : 'text-rose-300'
                  }`}
                >
                  {activePlayerSlot === 'P1'
                    ? '1. Chọn Tướng Người Chơi 1 (Bên Trái):'
                    : '2. Chọn Tướng Người Chơi 2 (Bên Phải):'}
                </span>

                {(() => {
                  const availableWarlords =
                    activePlayerSlot === 'P1'
                      ? ALL_CHARACTERS.filter((c) => c.id !== p2WarlordId)
                      : ALL_CHARACTERS.filter((c) => c.id !== p1WarlordId);

                  return (
                    <select
                      value={activePlayerSlot === 'P1' ? p1WarlordId : p2WarlordId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        if (activePlayerSlot === 'P1') {
                          setP1WarlordId(newId);
                          if (newId === p2WarlordId) {
                            const alt = ALL_CHARACTERS.find((c) => c.id !== newId)?.id || 'ngo_xuong_xi';
                            setP2WarlordId(alt);
                          }
                        } else {
                          setP2WarlordId(newId);
                          if (newId === p1WarlordId) {
                            const alt = ALL_CHARACTERS.find((c) => c.id !== newId)?.id || 'dinh_bo_linh';
                            setP1WarlordId(alt);
                          }
                        }
                      }}
                      className={`w-full max-w-full min-w-0 truncate bg-amber-900/90 border rounded-xl px-2.5 py-2 text-xs font-bold shadow-inner ${
                        activePlayerSlot === 'P1'
                          ? 'border-yellow-400 text-yellow-200'
                          : 'border-rose-400 text-rose-200'
                      }`}
                    >
                      {availableWarlords.map((char) => (
                        <option key={char.id} value={char.id} className="bg-stone-900 text-amber-200">
                          {char.name} ({char.shortTerritory || char.territory}) · SPD {char.spd}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              <div className="w-full max-w-full overflow-hidden px-1 py-0.5 flex justify-center">
                <WarlordCard3D warlord={activeHotseatCharacter} size="sm" />
              </div>
            </div>

            <div className="w-full text-center text-[11px] text-amber-100 bg-amber-950/85 py-1.5 px-2.5 rounded-lg border border-amber-500/80 truncate shadow">
              🏃 Tiên phong Lượt 1 (SPD cao hơn):{' '}
              <strong className="text-yellow-300">
                {p1Character.spd >= p2Character.spd ? p1Character.name : p2Character.name}
              </strong>
            </div>
          </div>
        ) : (
          /* ================= CHẾ ĐỘ 2: DÒ TÌM THIẾT BỊ & GHÉP ĐÔI GIAO CHIẾN ================= */
          <div className="w-full max-w-full flex flex-col gap-2 my-auto">
            {/* THẺ ĐỊNH DANH THIẾT BỊ HIỆN TẠI & TƯỚNG ĐANG CHỌN */}
            <div className="p-2.5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border border-yellow-500/80 rounded-2xl shadow-lg flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 border border-yellow-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-3.5 h-3.5 text-yellow-300" />
                  </div>
                  {isEditingNick ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={nicknameInput}
                        maxLength={24}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        className="bg-stone-900 border border-yellow-400 text-xs px-2 py-0.5 rounded text-white font-bold w-36"
                      />
                      <button
                        type="button"
                        onClick={handleSaveNickname}
                        className="px-2 py-0.5 bg-yellow-400 text-stone-950 font-bold text-[10px] rounded"
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">
                        THIẾT BỊ CỦA BẠN:
                      </div>
                      <div className="text-xs font-black text-white truncate flex items-center gap-1">
                        <span>{myDevice.deviceName}</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingNick(true)}
                          className="text-amber-400 hover:text-white p-0.5"
                          title="Sửa tên thiết bị"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Sẵn sàng</span>
                </span>
              </div>

              {/* Lựa chọn Tướng của bản thân */}
              <div className="flex items-center gap-2 pt-1 border-t border-amber-800/60">
                <label className="text-[10px] font-bold text-yellow-200 shrink-0">
                  Tướng của bạn:
                </label>
                <select
                  value={p1WarlordId}
                  onChange={(e) => setP1WarlordId(e.target.value)}
                  className="flex-1 min-w-0 bg-amber-900/90 border border-yellow-400/80 rounded-lg px-2 py-1 text-xs font-bold text-yellow-200 truncate shadow-inner"
                >
                  {ALL_CHARACTERS.map((char) => (
                    <option key={char.id} value={char.id} className="bg-stone-900 text-amber-200">
                      {char.avatarEmoji} {char.name} ({char.shortTerritory || 'Sứ Quân'}) · SPD {char.spd}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ================= GHÉP ĐÔI BẰNG MÃ QR (KHUYÊN DÙNG — 100% HOẠT ĐỘNG TRÊN IPHONE & ANDROID) ================= */}
            <div className="p-3 bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 border-2 border-yellow-400 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.35)] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-yellow-400/20 border border-yellow-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  </div>
                  <div className="text-xs font-black text-yellow-300 uppercase tracking-wide truncate">
                    GHÉP ĐÔI BẰNG QUÉT MÃ QR
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[9px] font-black uppercase tracking-wider shrink-0">
                  ★ KHUYÊN DÙNG
                </span>
              </div>

              {/* 2 Nút hành động chính: Máy 1 Tạo QR, Máy 2 Quét QR */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleOpenQrHost}
                  className="p-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black rounded-xl border border-yellow-200 shadow flex flex-col items-center justify-center gap-1 cursor-pointer transition"
                >
                  <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <QrCode className="w-4 h-4 text-stone-950 shrink-0" />
                    <span>MÁY 1: TẠO QR</span>
                  </div>
                  <span className="text-[9px] text-amber-950 font-bold opacity-90">
                    Hiện mã cho bạn quét
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenQrScanner}
                  className="p-2.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:from-cyan-400 hover:to-sky-300 active:scale-95 text-stone-950 font-black rounded-xl border border-cyan-200 shadow flex flex-col items-center justify-center gap-1 cursor-pointer transition"
                >
                  <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <Camera className="w-4 h-4 text-stone-950 shrink-0" />
                    <span>MÁY 2: QUÉT QR</span>
                  </div>
                  <span className="text-[9px] text-cyan-950 font-bold opacity-90">
                    Bật Camera quét mã
                  </span>
                </button>
              </div>

              <div className="text-[10px] text-amber-200/90 leading-snug flex items-center gap-1.5 bg-stone-950/60 p-2 rounded-xl border border-amber-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Không cần Bluetooth:</strong> Quét quang học bằng Camera, tương thích 100% mọi dòng iPhone, iPad, Android (yêu cầu cả 2 máy có mạng Internet)!
                </span>
              </div>
            </div>

            {/* DỰ PHÒNG THỦ CÔNG: MÃ PHÒNG (NẰM TRÊN ĐỂ TỐI ƯU KHÔNG GIAN) */}
            <div className="border border-amber-800/60 rounded-xl overflow-hidden bg-amber-950/60 shadow">
              <button
                type="button"
                onClick={() => setShowManualCodeSection(!showManualCodeSection)}
                className="w-full px-3 py-2 text-left text-[11px] font-bold text-amber-300 hover:text-yellow-200 flex items-center justify-between transition cursor-pointer bg-stone-950/40"
              >
                <span>Dự phòng: Ghép cặp qua Mã Phòng thủ công</span>
                {showManualCodeSection ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showManualCodeSection && (
                <div className="p-2.5 border-t border-amber-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-950/60">
                  {/* Máy 1 tạo phòng */}
                  <div className="p-2 bg-amber-950/80 rounded-lg border border-amber-600/70 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black text-yellow-300">MÁY 1: TẠO PHÒNG</div>
                      <p className="text-[9px] text-amber-200/80 mb-1.5">
                        Phát mã phòng 4 số cho máy bạn bè.
                      </p>
                    </div>

                    {waitingForGuest ? (
                      <div className="p-1.5 bg-amber-900/90 rounded border border-yellow-400 text-center">
                        <div className="text-[9px] text-yellow-200">MÃ: {roomCode}</div>
                        <button
                          type="button"
                          onClick={handleCopyRoomCode}
                          className="mt-1 px-2 py-0.5 bg-yellow-400 text-stone-950 text-[9px] font-bold rounded"
                        >
                          {copiedRoomCode ? 'Đã chép' : 'Sao chép mã'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCreateRoomWithCode()}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] rounded cursor-pointer"
                      >
                        TẠO MÃ PHÒNG
                      </button>
                    )}
                  </div>

                  {/* Máy 2 nhập phòng */}
                  <div className="p-2 bg-amber-950/80 rounded-lg border border-sky-600/70 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black text-sky-300">MÁY 2: NHẬP MÃ</div>
                      <p className="text-[9px] text-amber-200/80 mb-1.5">
                        Nhập 4 số từ máy bạn bè.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="VD: 8899"
                        className="w-full bg-stone-900 border border-sky-400 text-center text-xs font-bold text-white py-1 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleJoinRoomWithCode(roomCode)}
                        disabled={isJoiningRoom}
                        className="w-full py-1 bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-[11px] rounded cursor-pointer"
                      >
                        {isJoiningRoom ? 'Đang vào...' : 'VÀO PHÒNG'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CỤM DÒ THIẾT BỊ BLUETOOTH & AIRDROP Ở GẦN (CHUYỂN XUỐNG DƯỚI) */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Bluetooth className="w-3 h-3 text-sky-400" />
                <span>Hoặc dò tìm Bluetooth &amp; Radar lân cận:</span>
              </div>
              <button
                type="button"
                onClick={handleScanButtonClick}
                className="w-full py-2.5 px-3 bg-amber-950/90 hover:bg-amber-900 active:scale-95 text-yellow-300 font-bold text-xs rounded-xl border border-amber-600/80 shadow flex items-center justify-center gap-2 transition cursor-pointer uppercase tracking-wider"
              >
                <Bluetooth className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <Radar className={`w-3.5 h-3.5 text-yellow-400 shrink-0 ${isRadarScanning ? 'animate-spin' : ''}`} />
                <span className="truncate">
                  {isRadarScanning ? 'ĐANG DÒ TÌM THIẾT BỊ BLUETOOTH & AIRDROP...' : 'DÒ THIẾT BỊ BLUETOOTH & AIRDROP'}
                </span>
              </button>

              {isRadarScanning && discoveredPeers.length === 0 && (
                <div className="py-2 px-3 text-center flex items-center justify-center gap-2 text-[11px] font-bold text-amber-200 bg-amber-950/60 rounded-xl border border-amber-800/60 animate-pulse">
                  <Radar className="w-3.5 h-3.5 text-cyan-300 animate-spin shrink-0" />
                  <span>Đang quét thiết bị iPhone / Android ở gần...</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-amber-200/90 px-1 flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
                  <span>
                    Dò iPhone XS Max, 13 Pro Max, Android &amp; Lân cận
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBtGuideModal(true)}
                  className="text-yellow-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer underline underline-offset-2 ml-auto"
                >
                  <Info className="w-3 h-3 text-yellow-300" />
                  <span>Hướng dẫn bật {myDevice.platform === 'ios' ? 'iOS' : 'Android'}</span>
                </button>
              </div>
            </div>

            {/* THÔNG BÁO TRẠNG THÁI GỬI CHIẾN THƯ (NẾU ĐANG CHỜ PHẢN HỒI) */}
            {outgoingInvite && (
              <div className="p-3 bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-2 border-yellow-400 rounded-2xl shadow-xl flex flex-col items-center gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-yellow-300 text-xs font-black uppercase">
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                  <span>ĐANG GỬI CHIẾN THƯ ĐẾN ĐỐI PHƯƠNG...</span>
                </div>
                <p className="text-[11px] text-amber-100 text-center leading-tight">
                  Đang chờ đối phương xác nhận trên màn hình của họ ({outgoingTimer}s).
                </p>
                <button
                  type="button"
                  onClick={() => handleCancelOutgoingInvite('Bạn đã hủy chiến thư.')}
                  className="px-3 py-1 bg-rose-950/90 hover:bg-rose-900 border border-rose-400/80 rounded-lg text-rose-200 text-[10px] font-bold active:scale-95 transition cursor-pointer"
                >
                  HỦY CHIẾN THƯ
                </button>
              </div>
            )}

            {inviteStatusNotice && !outgoingInvite && (
              <div className="p-2 bg-stone-900/90 border border-amber-500 rounded-xl text-center text-xs text-yellow-200 font-bold">
                {inviteStatusNotice}
              </div>
            )}

            {/* DANH SÁCH THIẾT BỊ PHÁT HIỆN ĐƯỢC Ở GẦN (CHỈ HIỂN THỊ KHI QUÉT ĐƯỢC THIẾT BỊ ĐỐI THỦ) */}
            {discoveredPeers.length > 0 && (
              <div className="p-2.5 bg-amber-950/85 border border-amber-500/80 rounded-2xl shadow-lg flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-black text-yellow-300 border-b border-amber-800/70 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>THIẾT BỊ ĐỐI THỦ Ở GẦN ({discoveredPeers.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerRadarScan}
                    className="flex items-center gap-1 text-[10px] text-amber-200 hover:text-white px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-600/60 active:scale-95 transition"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Làm mới</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                  {discoveredPeers.map((peer) => {
                    const peerWarlord =
                      ALL_CHARACTERS.find((c) => c.id === peer.warlordId) || ALL_CHARACTERS[1];
                    const isApple = peer.platform === 'ios';

                    return (
                      <div
                        key={peer.deviceId}
                        className="p-2 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border border-amber-500/70 hover:border-yellow-300 rounded-xl flex items-center justify-between gap-2 shadow transition"
                      >
                        {/* Avatar Tướng & Tên Thiết Bị */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="relative w-9 h-11 rounded-lg overflow-hidden border border-yellow-400 shrink-0 bg-stone-900 shadow">
                            <img
                              src={peerWarlord.portrait3D || '/assets/aistudio/image_15aa223a.png'}
                              alt={peerWarlord.name}
                              className="w-full h-full object-cover object-top scale-110"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 text-[9px] text-amber-300 font-bold">
                              <span
                                className={`px-1 py-0.2 rounded font-black text-[8px] uppercase ${
                                  isApple
                                    ? 'bg-sky-950 text-sky-300 border border-sky-400/60'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-400/60'
                                }`}
                              >
                                {isApple ? 'APPLE iOS' : 'ANDROID'}
                              </span>
                              <span className="text-emerald-400 flex items-center gap-0.5">
                                <Signal className="w-2.5 h-2.5" /> Gần sát
                              </span>
                            </div>

                            <div className="text-xs font-black text-white truncate mt-0.5">
                              {peer.deviceName}
                            </div>

                            <div className="text-[10px] text-amber-200/90 truncate">
                              Tướng: <span className="text-yellow-300 font-bold">{peerWarlord.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Nút Gửi Lời Mời Thách Đấu hoặc Vào Phòng Ngay */}
                        {peer.activeRoomId ? (
                          <button
                            type="button"
                            onClick={() => handleJoinRoomWithCode(peer.activeRoomId!)}
                            className="px-3 py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-black text-xs rounded-xl border border-emerald-200 shadow active:scale-95 transition cursor-pointer shrink-0 uppercase tracking-wide flex items-center gap-1"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>VÀO PHÒNG [{peer.activeRoomId}]</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendChallengeToPeer(peer)}
                            disabled={!!outgoingInvite}
                            className="px-3 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-stone-950 font-black text-xs rounded-xl border border-yellow-200 shadow active:scale-95 transition cursor-pointer shrink-0 uppercase tracking-wide flex items-center gap-1"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>THÁCH ĐẤU</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ĐẾ ĐÁY HOÀNG KIM ĐÔNG SƠN TRÀN VIỀN (Căn chuẩn giữa, không dải đen) */}
      <div className="royal-bottom-dock">
        <div className="w-full max-w-md mx-auto flex items-center justify-center">
          {activeTab === 'HOTSEAT' ? (
            <button
              type="button"
              onClick={handleStartHotseat}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-sm rounded-xl shadow-xl border-2 border-yellow-200 flex items-center justify-center gap-2 active:scale-95 transition uppercase tracking-wider cursor-pointer"
            >
              <Swords className="w-5 h-5 text-stone-950 shrink-0" />
              <span className="truncate">BẮT ĐẦU VÁN ĐẤU ĐỐI KHÁNG</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black text-xs rounded-xl border-2 border-yellow-200 flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 text-stone-950 shrink-0" />
              <span>QUAY VỀ TRANG CHỦ</span>
            </button>
          )}
        </div>
      </div>

      {/* POPUP CHIẾN THƯ THÁCH ĐẤU HOÀNG KIM (TIẾP NHẬN LỜI MỜI TỪ MÁY ĐỐI THỦ) */}
      {incomingInvite && (
        <ChallengeInviteModal
          invite={incomingInvite}
          onAccept={handleAcceptIncomingInvite}
          onReject={handleRejectIncomingInvite}
        />
      )}

      {/* POPUP HƯỚNG DẪN BẬT BLUETOOTH & AIRDROP CHO IPHONE / ANDROID */}
      {showBtGuideModal && (
        <BluetoothAirDropGuideModal
          platform={myDevice.platform}
          deviceName={myDevice.deviceName}
          onConfirmReady={handleConfirmBtReady}
          onClose={() => setShowBtGuideModal(false)}
        />
      )}

      {/* POPUP TẠO PHÒNG & HIỂN THỊ MÃ QR HOÀNG KIM (MÁY 1) */}
      {showQrDisplayModal && (
        <QRCodeDisplayModal
          roomCode={qrRoomCode}
          hostWarlord={p1Character}
          onOpponentJoined={handleQrOpponentJoined}
          onClose={() => setShowQrDisplayModal(false)}
          onRegenerateCode={handleRegenerateQrCode}
        />
      )}

      {/* POPUP MỞ CAMERA QUÉT MÃ QR (MÁY 2) */}
      {showQrScannerModal && (
        <QRCodeScannerModal
          onCodeScanned={handleQrScanned}
          onClose={() => setShowQrScannerModal(false)}
        />
      )}
    </div>
  );
};
