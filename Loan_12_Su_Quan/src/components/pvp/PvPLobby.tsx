/**
 * Loạn 12 Sứ Quân — PvP Multiplayer Lobby
 * Giao diện thương mại hóa tràn viền 100% khung hình với Thanh Đỉnh & Đế Đáy mạ đồng Đông Sơn hoàng kim.
 */

import React, { useState } from 'react';
import { Warlord } from '../../types/game';
import { ALL_CHARACTERS } from '../../data/warlords';
import { WarlordCard3D } from '../character/WarlordCard3D';
import { p2pService } from '../../services/p2p';
import { Swords, Smartphone, Wifi, ArrowLeft, X } from 'lucide-react';

interface PvPLobbyProps {
  onStartHotseat: (p1Warlord: Warlord, p2Warlord: Warlord) => void;
  onStartP2P: (myWarlord: Warlord, roomId: string, isHost: boolean) => void;
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

  // P2P Room Code states
  const [roomCode, setRoomCode] = useState<string>('12SQ');
  const [waitingForGuest, setWaitingForGuest] = useState<boolean>(false);

  const p1Character = ALL_CHARACTERS.find((c) => c.id === p1WarlordId) || ALL_CHARACTERS[0];
  const p2Character = ALL_CHARACTERS.find((c) => c.id === p2WarlordId) || ALL_CHARACTERS[1];
  const activeHotseatCharacter = activePlayerSlot === 'P1' ? p1Character : p2Character;

  const handleStartHotseat = () => {
    onStartHotseat(p1Character, p2Character);
  };

  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setWaitingForGuest(true);
    p2pService.createRoom(code, p1WarlordId);

    const unsubscribe = p2pService.subscribe((msg) => {
      if (msg.type === 'JOIN_ROOM' && msg.roomId === code) {
        unsubscribe();
        p2pService.send({
          type: 'ROOM_READY',
          hostWarlordId: p1WarlordId,
          clientWarlordId: msg.warlordId,
          initialBoardSeed: Date.now(),
        });
        onStartP2P(p1Character, code, true);
      }
    });
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return;
    p2pService.joinRoom(roomCode, 'Khách', p1WarlordId);

    const unsubscribe = p2pService.subscribe((msg) => {
      if (msg.type === 'ROOM_READY') {
        unsubscribe();
        onStartP2P(p1Character, roomCode, false);
      }
    });

    setTimeout(() => {
      onStartP2P(p1Character, roomCode, false);
    }, 800);
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
          <Wifi className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">2 MÁY (MÃ PHÒNG)</span>
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
                  <div className="p-2 bg-amber-900/90 rounded-lg border border-yellow-400 text-center">
                    <div className="text-[10px] text-yellow-200">MÃ PHÒNG CỦA BẠN:</div>
                    <div className="text-xl font-black text-white tracking-widest my-0.5">
                      {roomCode}
                    </div>
                    <div className="text-[10px] text-emerald-300 animate-pulse">
                      Đang đợi đối thủ vào phòng...
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
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="MÃ PHÒNG (VD: 8899)"
                    className="w-full bg-amber-900/90 border border-sky-400 rounded-lg p-1.5 text-center text-sm font-black text-white tracking-widest uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-stone-950 font-black text-xs rounded-lg active:scale-95 transition cursor-pointer shadow"
                  >
                    VÀO CHIẾN ĐẤU
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
      <div className="royal-bottom-dock">
        <div className="w-full max-w-md mx-auto">
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
    </div>
  );
};
