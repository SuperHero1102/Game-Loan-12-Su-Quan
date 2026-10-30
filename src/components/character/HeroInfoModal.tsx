/**
 * Loạn 12 Sứ Quân — Bộ Sưu Tập 13 Thẻ Nhân Vật 3D & Thông Tin Dũng Tướng
 * Giao diện thương mại hóa tràn viền 100% khung hình với Thanh Đỉnh & Đế Đáy mạ đồng Đông Sơn hoàng kim.
 */

import React, { useState } from 'react';
import { PlayerProfile, Warlord } from '../../types/game';
import { SHOP_ITEMS } from '../../data/items';
import { ALL_CHARACTERS, WARLORDS, DINH_BO_LINH } from '../../data/warlords';
import { WarlordCard3D } from './WarlordCard3D';
import { Crown, X, RotateCcw, ChevronLeft, ChevronRight, Table, Sparkles, ArrowLeft } from 'lucide-react';

interface HeroInfoModalProps {
  profile: PlayerProfile;
  initialWarlordId?: string;
  onResetProgress: () => void;
  onClose: () => void;
}

export const HeroInfoModal: React.FC<HeroInfoModalProps> = ({
  profile,
  initialWarlordId,
  onResetProgress,
  onClose,
}) => {
  const initialIndex = initialWarlordId
    ? Math.max(0, ALL_CHARACTERS.findIndex((c) => c.id === initialWarlordId))
    : 0;

  const [selectedIdx, setSelectedIdx] = useState<number>(initialIndex);
  const [viewTab, setViewTab] = useState<'CARD_3D' | 'FULL_ART' | 'STAT_TABLE'>('CARD_3D');
  const [confirmReset, setConfirmReset] = useState(false);

  const activeWarlord: Warlord = ALL_CHARACTERS[selectedIdx] || DINH_BO_LINH;

  const equippedWeapon = SHOP_ITEMS.find((i) => i.id === profile.equippedWeaponId);
  const equippedArmor = SHOP_ITEMS.find((i) => i.id === profile.equippedArmorId);

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev - 1 + ALL_CHARACTERS.length) % ALL_CHARACTERS.length);
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev + 1) % ALL_CHARACTERS.length);
  };

  return (
    <div className="modal-commercial-overlay select-none">
      <div className="modal-commercial-shell sm:border-x-2 sm:border-amber-500 shadow-2xl">
        {/* Thanh Đỉnh Hoàng Kim Đông Sơn (Royal Bronze Header Bar) */}
        <div className="royal-header-bar flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/90 hover:bg-amber-900 active:scale-95 rounded-lg text-xs font-bold text-yellow-300 border border-amber-400/80 whitespace-nowrap shrink-0 cursor-pointer shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Trang chủ</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 min-w-0">
            <Crown className="w-4 h-4 text-yellow-300 shrink-0" />
            <h3 className="font-black text-xs sm:text-sm text-yellow-200 uppercase tracking-wider font-display whitespace-nowrap truncate drop-shadow">
              THẺ TƯỚNG &amp; THUỘC TÍNH
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/95 hover:bg-rose-900 text-rose-200 border border-rose-400/80 active:scale-95 transition cursor-pointer shrink-0 shadow"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Mục Chọn Chế Độ Xem — Nền Đồng Hoàng Kim */}
        <div className="royal-subbar grid grid-cols-3 gap-1.5 p-1.5">
          <button
            type="button"
            onClick={() => setViewTab('CARD_3D')}
            className={`py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer border whitespace-nowrap ${
              viewTab === 'CARD_3D'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 ring-1 ring-yellow-300 shadow font-black'
                : 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border-amber-700/70 font-bold'
            }`}
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">1. Thẻ Tướng 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('FULL_ART')}
            className={`py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer border whitespace-nowrap ${
              viewTab === 'FULL_ART'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 ring-1 ring-yellow-300 shadow font-black'
                : 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border-amber-700/70 font-bold'
            }`}
          >
            <Crown className="w-3 h-3 shrink-0" />
            <span className="truncate">2. Tranh Gốc Toàn Cảnh</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('STAT_TABLE')}
            className={`py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer border whitespace-nowrap ${
              viewTab === 'STAT_TABLE'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 ring-1 ring-yellow-300 shadow font-black'
                : 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border-amber-700/70 font-bold'
            }`}
          >
            <Table className="w-3 h-3 shrink-0" />
            <span className="truncate">3. Bảng Chỉ Số</span>
          </button>
        </div>

        {/* Thanh chọn nhanh 13 vị tướng — Nền Đồng Ấm Áp */}
        <div className="royal-subbar px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto">
          {ALL_CHARACTERS.map((char, idx) => {
            const isSelected = idx === selectedIdx;
            const isDefeated = profile.defeatedWarlords.includes(char.id);
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => {
                  setSelectedIdx(idx);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap shrink-0 border transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-yellow-200 ring-1 ring-amber-300 shadow font-black'
                    : 'bg-amber-950/85 text-amber-200 border-amber-700/70 hover:border-amber-400 font-bold'
                }`}
              >
                <span>{char.avatarEmoji}</span>
                <span>{char.name}</span>
                {isDefeated && <span className={isSelected ? 'text-emerald-900 font-black' : 'text-emerald-400'}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Nội dung chính — Tràn đầy trên nền Hoa Văn Trống Đồng */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 flex flex-col justify-between">
          {viewTab === 'CARD_3D' ? (
            <div className="space-y-2.5 my-auto">
              {/* Điều hướng Trái/Phải qua 13 Thẻ Nhân Vật 3D */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1 rounded-lg bg-amber-900/90 hover:bg-amber-800 border border-amber-400/80 text-xs font-bold text-yellow-200 flex items-center gap-1 active:scale-95 cursor-pointer shadow"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>

                <span className="text-xs font-black text-yellow-300 tracking-wide">
                  Tướng {selectedIdx + 1} / {ALL_CHARACTERS.length} ·{' '}
                  {activeWarlord.id === 'dinh_bo_linh'
                    ? `Cấp ${profile.level}`
                    : `Ải ${activeWarlord.stageNumber}`}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-2.5 py-1 rounded-lg bg-amber-900/90 hover:bg-amber-800 border border-amber-400/80 text-xs font-bold text-yellow-200 flex items-center gap-1 active:scale-95 cursor-pointer shadow"
                >
                  <span>Tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* THẺ NHÂN VẬT 3D */}
              <WarlordCard3D
                warlord={activeWarlord}
                level={activeWarlord.id === 'dinh_bo_linh' ? profile.level * 10 + 80 : 90}
                showDetails={true}
              />

              {/* Trang bị hiện tại của Đinh Bộ Lĩnh */}
              {activeWarlord.id === 'dinh_bo_linh' && (
                <div className="p-2.5 bg-amber-950/90 border border-amber-500/80 rounded-xl space-y-1.5 text-xs shadow-lg">
                  <div className="flex items-center justify-between font-bold text-yellow-300">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      Hành Trang Vạn Thắng Vương
                    </span>
                    <span className="text-emerald-300">
                      Đã thu phục: {profile.defeatedWarlords.length}/{WARLORDS.length} Sứ Quân
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-100">
                    <span>Binh khí đeo thêm:</span>
                    <strong className="text-yellow-300">
                      {equippedWeapon ? `${equippedWeapon.name} (+${equippedWeapon.bonusAtk} ATK)` : 'Kiếm lệnh Hoàng Đế (Mặc định)'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-100">
                    <span>Chiến giáp đeo thêm:</span>
                    <strong className="text-yellow-300">
                      {equippedArmor ? `${equippedArmor.name} (+${equippedArmor.bonusDef} DEF)` : 'Long bào giáp vàng (Mặc định)'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Thông tin Hoàng Đế Đinh Tiên Hoàng */}
              {activeWarlord.id === 'dinh_tien_hoang' && (
                <div className="p-2.5 bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border border-yellow-400 rounded-xl space-y-1 text-xs shadow-lg">
                  <div className="flex items-center justify-between font-bold text-yellow-300">
                    <span className="flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                      Đinh Tiên Hoàng Đế (Long Bào Hoàng Kim)
                    </span>
                    <span className={profile.unlockedEmperorSkin || profile.hasCompletedCampaign || (profile.defeatedWarlords.length >= 12) ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {profile.unlockedEmperorSkin || profile.hasCompletedCampaign || (profile.defeatedWarlords.length >= 12) ? '✓ ĐÃ MỞ KHÓA' : '🔒 ĐẠI LỄ 968'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200">
                    {profile.unlockedEmperorSkin || profile.hasCompletedCampaign || (profile.defeatedWarlords.length >= 12)
                      ? 'Dũng tướng Thần Thoại uy phong nhất với tuyệt kỹ Đại Cồ Việt Thần Uy và Long Bào Hoàng Kim!'
                      : 'Hãy dẹp tan toàn bộ 12 ải Sứ Quân và cử hành Đại Lễ Đăng Quang tại Hoa Lư để mở khóa!'}
                  </p>
                </div>
              )}
            </div>
          ) : viewTab === 'FULL_ART' ? (
            /* CHIÊM NGƯỠNG TOÀN CẢNH TRANH THẺ 3D NGUYÊN BẢN */
            <div className="space-y-2.5 my-auto">
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1 rounded-lg bg-amber-900/90 hover:bg-amber-800 border border-amber-400/80 text-xs font-bold text-yellow-200 flex items-center gap-1 active:scale-95 cursor-pointer shadow"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>

                <span className="text-xs font-black text-yellow-300">
                  {activeWarlord.name} ({activeWarlord.title})
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-2.5 py-1 rounded-lg bg-amber-900/90 hover:bg-amber-800 border border-amber-400/80 text-xs font-bold text-yellow-200 flex items-center gap-1 active:scale-95 cursor-pointer shadow"
                >
                  <span>Tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-2xl bg-amber-950">
                {activeWarlord.portrait3D ? (
                  <img
                    src={activeWarlord.portrait3D}
                    alt={activeWarlord.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain block drop-shadow-2xl"
                  />
                ) : (
                  <div className="p-8 text-center text-xs text-amber-200">
                    Chưa có file tranh gốc
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-950/90 rounded-xl border border-amber-500/80 text-xs text-center space-y-1 shadow-lg">
                <div className="text-yellow-300 font-black font-display uppercase tracking-wider">
                  {activeWarlord.name} — {activeWarlord.role}
                </div>
                <div className="text-amber-100 text-[11px]">
                  Thú cưỡi: <span className="text-yellow-300 font-bold">{activeWarlord.mountName}</span> · Binh khí: <span className="text-yellow-300 font-bold">{activeWarlord.weaponName}</span>
                </div>
                <div className="text-amber-200/80 text-[10px] italic">
                  "{activeWarlord.quote}"
                </div>
              </div>
            </div>
          ) : (
            /* BẢNG TỔNG HỢP THUỘC TÍNH 13 VỊ TƯỚNG */
            <div className="bg-amber-950/90 border-2 border-amber-500/80 rounded-xl overflow-hidden shadow-xl my-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-amber-900/95 text-yellow-200 border-b border-amber-500/80">
                      <th className="p-1.5 font-bold">Tướng lĩnh</th>
                      <th className="p-1.5 font-bold">Vai trò</th>
                      <th className="p-1.5 font-bold text-center text-rose-300">HP</th>
                      <th className="p-1.5 font-bold text-center text-amber-300">ATK</th>
                      <th className="p-1.5 font-bold text-center text-sky-300">DEF</th>
                      <th className="p-1.5 font-bold text-center text-emerald-300">SPD</th>
                      <th className="p-1.5 font-bold">Thú cưỡi &amp; Binh khí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_CHARACTERS.map((char, i) => (
                      <tr
                        key={char.id}
                        onClick={() => {
                          setSelectedIdx(i);
                          setViewTab('CARD_3D');
                        }}
                        className="border-b border-amber-800/60 hover:bg-amber-800/40 cursor-pointer transition"
                      >
                        <td className="p-1.5 font-bold text-yellow-200 whitespace-nowrap">
                          {char.name}
                          <span className="block text-[9px] text-amber-200/75 font-normal">
                            {char.shortTerritory || char.territory}
                          </span>
                        </td>
                        <td className="p-1.5 text-amber-100">{char.role}</td>
                        <td className="p-1.5 text-center font-mono tabular-nums font-bold text-rose-300">
                          {char.hpRating}
                        </td>
                        <td className="p-1.5 text-center font-mono tabular-nums font-bold text-amber-300">
                          {char.atkRating}
                        </td>
                        <td className="p-1.5 text-center font-mono tabular-nums font-bold text-sky-300">
                          {char.defRating}
                        </td>
                        <td className="p-1.5 text-center font-mono tabular-nums font-bold text-emerald-300">
                          {char.spd}
                        </td>
                        <td className="p-1.5 text-amber-100">
                          <span className="text-yellow-300 font-semibold block">{char.mountName}</span>
                          <span className="text-[9px] text-amber-200/80">{char.weaponName}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
        <div className="royal-bottom-dock">
          <div className="w-full max-w-md mx-auto flex items-center justify-between gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-400/70 text-[11px] font-bold text-rose-200 active:scale-95 transition cursor-pointer shadow whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Chơi lại từ đầu</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow"
                >
                  Xác nhận xóa
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 bg-amber-950 text-amber-200 border border-amber-500/70 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 max-w-[200px] py-2 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl border-2 border-yellow-200 active:scale-95 transition cursor-pointer shadow-lg uppercase tracking-wider text-center"
            >
              ĐÓNG MÀN HÌNH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
