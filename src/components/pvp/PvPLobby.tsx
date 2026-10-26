/**
 * Loạn 12 Sứ Quân — PvP Multiplayer Lobby
 * Giao diện thương mại hóa tràn viền 100% khung hình với Thanh Đỉnh & Đế Đáy mạ đồng Đông Sơn hoàng kim.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Warlord } from '../../types/game';
import { ALL_CHARACTERS } from '../../data/warlords';
import { WarlordCard3D } from '../character/WarlordCard3D';
import { p2pService, NearbyDevice } from '../../services/p2p';
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
}

export const PvPLobby: React.FC<PvPLobbyProps> = ({
  onStartHotseat,
  onStartP2P,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'HOTSEAT' | 'P2P_NETWORK'>('HOTSEAT');
  const [activePlayerSlot, setActivePlayerSlot] = useState<'P1' | 'P2'>('P1');
  const [p1WarlordId, setP1WarlordId] = useState<string>('dinh_bo_linh');
  const [p2WarlordId, setP2WarlordId] = useState<string>('pham_bach_ho');

  // Network & Offline detection
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // P2P Room Code states
  const [roomCode, setRoomCode] = useState<string>('');
  const [waitingForGuest, setWaitingForGuest] = useState<boolean>(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState<boolean>(false);
  const [p2pStatusText, setP2pStatusText] = useState<string | null>(null);
  const [copiedRoomCode, setCopiedRoomCode] = useState<boolean>(false);

  // Bluetooth scanning states
  const [showBtModal, setShowBtModal] = useState<boolean>(false);
  const [isScanningBt, setIsScanningBt] = useState<boolean>(false);
  const [btDevices, setBtDevices] = useState<NearbyDevice[]>([]);

  const handleCopyRoomCode = async () => {
    if (!roomCode) return;
    const ok = await copyToClipboard(roomCode);
    if (ok) {
      setCopiedRoomCode(true);
      setTimeout(() => setCopiedRoomCode(false), 2500);
    }
  };

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
  }, [p1WarlordId]);

  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      p2pService.stopJoinRetry();
    };
  }, []);

  const p1Character = ALL_CHARACTERS.find((c) => c.id === p1WarlordId) || ALL_CHARACTERS[0];
  const p2Character = ALL_CHARACTERS.find((c) => c.id === p2WarlordId) || ALL_CHARACTERS[1];
  const activeHotseatCharacter = activePlayerSlot === 'P1' ? p1Character : p2Character;

  const handleStartHotseat = () => {
    onStartHotseat(p1Character, p2Character);
  };

  const handleCreateRoomWithCode = (codeToUse?: string) => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    const code = (codeToUse || roomCode || Math.floor(1000 + Math.random() * 9000).toString()).trim().toUpperCase();
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
        };

        // Gửi liên tiếp 3 đợt để đảm bảo máy 2 nhận được 100%
        p2pService.send(readyPacket);
        setTimeout(() => p2pService.send(readyPacket), 180);
        setTimeout(() => p2pService.send(readyPacket), 450);
        setTimeout(() => p2pService.send(readyPacket), 800);

        unsubscribe();
        unsubRef.current = null;
        onStartP2P(hostChar, code, true, guestChar, seed);
      }
    });

    unsubRef.current = unsubscribe;
  };

  const handleCreateRoom = () => {
    handleCreateRoomWithCode();
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

        onStartP2P(myChar, cleanCode, false, hostChar, msg.initialBoardSeed);
      }
    });

    unsubRef.current = unsubscribe;

    p2pService.joinRoom(cleanCode, 'Khách', p1WarlordIdRef.current, (errMsg) => {
      if (!started) {
        setIsJoiningRoom(false);
        p2pService.stopJoinRetry();
        setP2pStatusText(errMsg);
      }
    });
  };

  const handleJoinRoom = () => {
    handleJoinRoomWithCode(roomCode);
  };

  // Quét thiết bị Bluetooth / lân cận
  const handleOpenBtModal = async () => {
    setShowBtModal(true);
    setIsScanningBt(true);
    try {
      const devices = await p2pService.scanNearbyDevices();
      setBtDevices(devices);
    } catch {
      // ignore
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleRefreshBtScan = async () => {
    setIsScanningBt(true);
    try {
      const devices = await p2pService.scanNearbyDevices();
      setBtDevices(devices);
    } catch {
      // ignore
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleScanHardwareBt = async () => {
    setIsScanningBt(true);
    try {
      const dev = await p2pService.requestHardwareBluetoothDevice();
      if (dev) {
        setBtDevices((prev) => [dev, ...prev.filter((d) => d.roomCode !== dev.roomCode)]);
      }
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleSelectBtDevice = (
    dev: NearbyDevice,
    action: 'join' | 'create' | 'pair'
  ) => {
    setRoomCode(dev.roomCode);
    setShowBtModal(false);

    if (action === 'join') {
      handleJoinRoomWithCode(dev.roomCode);
    } else if (action === 'create') {
      handleCreateRoomWithCode(dev.roomCode);
    } else {
      setP2pStatusText(
        `Đã ghép đôi kênh Bluetooth [${dev.roomCode}]. Bấm "Tạo phòng" (Máy 1) hoặc "Vào phòng" (Máy 2) để bắt đầu!`
      );
    }
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
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Bluetooth className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          )}
          <span className="truncate">
            {isOnline ? '2 MÁY (MÃ PHÒNG)' : 'BLUETOOTH (2 MÁY)'}
          </span>
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

                <select
                  value={activePlayerSlot === 'P1' ? p1WarlordId : p2WarlordId}
                  onChange={(e) =>
                    activePlayerSlot === 'P1'
                      ? setP1WarlordId(e.target.value)
                      : setP2WarlordId(e.target.value)
                  }
                  className={`w-full max-w-full min-w-0 truncate bg-amber-900/90 border rounded-xl px-2.5 py-2 text-xs font-bold shadow-inner ${
                    activePlayerSlot === 'P1'
                      ? 'border-yellow-400 text-yellow-200'
                      : 'border-rose-400 text-rose-200'
                  }`}
                >
                  {ALL_CHARACTERS.map((char) => (
                    <option key={char.id} value={char.id} className="bg-stone-900 text-amber-200">
                      {char.name} ({char.shortTerritory || char.territory}) · SPD {char.spd}
                    </option>
                  ))}
                </select>
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
          /* CHẾ ĐỘ 2: ĐẤU 2 MÁY QUA MẠNG CỤC BỘ / P2P */
          <div className="w-full max-w-full flex flex-col gap-2.5 my-auto">
            <div className="w-full max-w-full overflow-hidden p-2.5 bg-amber-950/85 border border-amber-500/80 rounded-xl flex flex-col items-center shadow-lg">
              <label className="text-[11px] font-bold text-yellow-300 block mb-1 w-full truncate">
                CHỌN TƯỚNG 3D CỦA BẠN:
              </label>
              <select
                value={p1WarlordId}
                onChange={(e) => setP1WarlordId(e.target.value)}
                className="w-full max-w-full min-w-0 truncate bg-amber-900/90 border border-yellow-400/80 rounded-lg p-2 text-xs font-bold text-yellow-200 mb-2 shadow-inner"
              >
                {ALL_CHARACTERS.map((char) => (
                  <option key={char.id} value={char.id} className="bg-stone-900 text-amber-200">
                    {char.name} ({char.title}) · SPD {char.spd}
                  </option>
                ))}
              </select>
              <div className="w-full max-w-full overflow-hidden px-1 py-0.5 flex justify-center">
                <WarlordCard3D warlord={p1Character} size="sm" />
              </div>
            </div>

            {/* Nút Quét Bluetooth & Kết Nối Thiết Bị Ở Gần (Đặt trên Máy 1: Tạo phòng) */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenBtModal}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-950 via-sky-950 to-cyan-950 hover:from-cyan-900 hover:to-sky-900 active:scale-95 text-cyan-200 font-bold text-xs rounded-xl border border-cyan-400/80 shadow flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Bluetooth className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                <span className="truncate">QUÉT BLUETOOTH &amp; THIẾT BỊ Ở GẦN</span>
              </button>
              <div className="text-[10px] text-amber-200/80 text-center flex items-center justify-center gap-1.5 flex-wrap">
                <Radio className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Hỗ trợ: WiFi LAN · Internet 4G/5G xuyên mạng · Bluetooth Lân Cận</span>
              </div>
            </div>

            {/* Khu Vực Tạo Hoặc Vào Phòng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-amber-950/85 border border-amber-500/80 rounded-xl flex flex-col justify-between shadow-lg">
                <div>
                  <span className="text-xs font-black text-yellow-300 block mb-0.5">
                    MÁY 1: TẠO PHÒNG
                  </span>
                  <p className="text-[10px] text-amber-100/85 mb-2">
                    Phát sinh mã phòng để gửi cho bạn bè cùng kết nối.
                  </p>
                </div>

                {waitingForGuest ? (
                  <div className="p-2 bg-amber-900/90 rounded-lg border border-yellow-400 text-center space-y-1">
                    <div className="text-[10px] text-yellow-200">MÃ PHÒNG CỦA BẠN:</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl font-black text-white tracking-widest">
                        {roomCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRoomCode}
                        className="px-2 py-0.5 rounded bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition cursor-pointer shadow"
                        title="Sao chép mã phòng"
                      >
                        {copiedRoomCode ? (
                          <>
                            <Check className="w-3 h-3 text-stone-950" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-stone-950" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-[10px] text-emerald-300 animate-pulse">
                      {p2pStatusText || 'Đang đợi đối thủ vào phòng...'}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-lg active:scale-95 transition cursor-pointer shadow"
                  >
                    TẠO PHÒNG MỚI
                  </button>
                )}
              </div>

              <div className="p-2.5 bg-amber-950/85 border border-sky-400/80 rounded-xl flex flex-col justify-between shadow-lg">
                <div>
                  <span className="text-xs font-black text-sky-300 block mb-0.5">
                    MÁY 2: THAM GIA PHÒNG
                  </span>
                  <p className="text-[10px] text-amber-100/85 mb-2">
                    Nhập mã phòng từ máy bạn bè để kết nối.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      if (waitingForGuest) setWaitingForGuest(false);
                    }}
                    placeholder="MÃ PHÒNG (VD: 8899)"
                    className="w-full bg-amber-900/90 border border-sky-400 rounded-lg p-1.5 text-center text-sm font-black text-white tracking-widest uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    disabled={isJoiningRoom}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-stone-950 font-black text-xs rounded-lg active:scale-95 transition cursor-pointer shadow"
                  >
                    {isJoiningRoom ? 'ĐANG KẾT NỐI...' : 'VÀO CHIẾN ĐẤU'}
                  </button>
                  {!waitingForGuest && p2pStatusText && (
                    <div className="text-[10px] text-amber-200 text-center leading-tight pt-0.5">
                      {p2pStatusText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
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

      {/* POPUP MODAL: DANH SÁCH THIẾT BỊ BLUETOOTH & LÂN CẬN */}
      {showBtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-sm sm:max-w-md bg-stone-950/95 border-2 border-amber-400/90 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-amber-950 via-yellow-950/90 to-amber-950 px-3.5 py-2.5 border-b border-amber-600/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Bluetooth className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wide truncate">
                  THIẾT BỊ BLUETOOTH &amp; Ở GẦN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBtModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-400/70 active:scale-95 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung danh sách thiết bị */}
            <div className="p-3 overflow-y-auto space-y-2.5 flex-1 min-h-0 text-left">
              <div className="flex items-center justify-between gap-2 text-[11px] text-amber-200/90 bg-amber-950/60 p-2 rounded-xl border border-amber-600/40">
                <span className="truncate">
                  {isScanningBt ? 'Đang dò sóng thiết bị ở gần...' : `Tìm thấy ${btDevices.length} thiết bị / kênh lân cận`}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleScanHardwareBt}
                    disabled={isScanningBt}
                    className="flex items-center gap-1 px-2 py-1 bg-cyan-900/90 hover:bg-cyan-800 disabled:opacity-50 text-cyan-200 text-[10px] font-bold rounded-lg border border-cyan-400/70 cursor-pointer shrink-0 active:scale-95 transition"
                    title="Dò tìm thiết bị Bluetooth phần cứng bên ngoài"
                  >
                    <Bluetooth className="w-3 h-3 text-cyan-300" />
                    <span>Dò phần cứng</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshBtScan}
                    disabled={isScanningBt}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-900/80 hover:bg-amber-800 disabled:opacity-50 text-amber-200 text-[10px] font-bold rounded-lg border border-amber-500/60 cursor-pointer shrink-0 active:scale-95 transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanningBt ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* Danh sách thiết bị / kênh */}
              {btDevices.length === 0 ? (
                <div className="p-6 text-center text-xs text-amber-200/70 bg-amber-950/40 rounded-xl border border-dashed border-amber-700/60 flex flex-col items-center gap-2">
                  <Bluetooth className="w-8 h-8 text-cyan-400/70 animate-bounce" />
                  <span>Đang dò tìm thiết bị xung quanh...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {btDevices.map((dev) => (
                    <div
                      key={dev.id}
                      onClick={() => handleSelectBtDevice(dev, 'pair')}
                      className="p-2.5 bg-gradient-to-r from-amber-950/80 to-stone-900 border border-amber-500/60 hover:border-yellow-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow transition cursor-pointer hover:bg-amber-900/40 active:scale-[0.99]"
                      title="Nhấn để ghép đôi kênh Bluetooth này"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/70 flex items-center justify-center shrink-0">
                          <Bluetooth className="w-4 h-4 text-cyan-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-white truncate">
                            {dev.name}
                          </div>
                          <div className="text-[10px] text-amber-300 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-amber-900/90 border border-amber-400/60 rounded text-[9px] font-bold">
                              MÃ: {dev.roomCode}
                            </span>
                            <span className="text-[9px] text-stone-300 flex items-center gap-0.5">
                              <Signal className="w-2.5 h-2.5 text-emerald-400" />
                              {dev.rssi ? `${dev.rssi} dBm` : 'Rất tốt'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBtDevice(dev, 'join');
                          }}
                          className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-stone-950 font-black text-[11px] rounded-lg transition cursor-pointer shadow"
                          title="Vào ngay phòng này"
                        >
                          VÀO PHÒNG
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBtDevice(dev, 'create');
                          }}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black text-[11px] rounded-lg transition cursor-pointer shadow"
                          title="Mở phòng với kênh này"
                        >
                          TẠO BẰNG KÊNH NÀY
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-amber-200/70 text-center leading-relaxed px-1">
                💡 Khi ở chế độ Offline (không có Internet), bạn và đối thủ chỉ cần ấn chọn cùng 1 kênh Bluetooth hoặc nhập cùng Mã Phòng để vào trận ngay lập tức.
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-2.5 bg-stone-900 border-t border-amber-800/60 flex justify-center">
              <button
                type="button"
                onClick={() => setShowBtModal(false)}
                className="w-full py-2 bg-amber-950 hover:bg-amber-900 border border-amber-500/80 text-yellow-300 text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer"
              >
                ĐÓNG LẠI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
