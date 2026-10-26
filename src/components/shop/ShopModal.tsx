/**
 * Loạn 12 Sứ Quân — Cửa Hàng Binh Khí & Giáp Trụ Hoa Lư
 * Giao diện thương mại hóa tràn viền 100% khung hình với Thanh Đỉnh & Đế Đáy mạ đồng Đông Sơn hoàng kim.
 */

import React from 'react';
import { PlayerProfile, Item } from '../../types/game';
import { SHOP_ITEMS } from '../../data/items';
import { soundEngine } from '../../services/audio';
import { Coins, Swords, Shield, Heart, X, ArrowLeft } from 'lucide-react';

interface ShopModalProps {
  profile: PlayerProfile;
  onBuyItem: (item: Item) => void;
  onEquipItem: (item: Item) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  profile,
  onBuyItem,
  onEquipItem,
  onClose,
}) => {
  const isEquipped = (itemId: string) =>
    profile.equippedWeaponId === itemId || profile.equippedArmorId === itemId;

  const isOwned = (itemId: string) =>
    profile.inventory.some((i) => i.itemId === itemId) || isEquipped(itemId);

  const handlePurchase = (item: Item) => {
    if (profile.gold >= item.cost) {
      soundEngine.playGold();
      onBuyItem(item);
    }
  };

  return (
    <div className="modal-commercial-overlay select-none">
      <div className="modal-commercial-shell sm:border-x-2 sm:border-amber-500 shadow-2xl">
        {/* Thanh Đỉnh Hoàng Kim Đông Sơn */}
        <div className="royal-header-bar flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/90 hover:bg-amber-900 active:scale-95 rounded-lg text-xs font-bold text-yellow-300 border border-amber-400/80 whitespace-nowrap shrink-0 cursor-pointer shadow"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Quay lại</span>
            </button>
            <h3 className="font-black text-xs sm:text-sm text-yellow-200 uppercase tracking-wider font-display truncate drop-shadow">
              🏪 CỬA HÀNG HOA LƯ
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/95 rounded-lg border border-yellow-400 text-yellow-300 font-bold text-xs shadow-inner">
              <Coins className="w-3.5 h-3.5 fill-yellow-400" />
              <span className="font-mono tabular-nums">{profile.gold.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/95 hover:bg-rose-900 text-rose-200 border border-rose-400/80 cursor-pointer transition shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Danh sách vật phẩm — Nền Đồng Ấm Áp */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
          {SHOP_ITEMS.map((item) => {
            const owned = isOwned(item.id);
            const equipped = isEquipped(item.id);
            const canAfford = profile.gold >= item.cost;

            return (
              <div
                key={item.id}
                className="p-2.5 bg-amber-950/85 border border-amber-600/75 hover:border-yellow-400 rounded-xl flex items-center justify-between gap-3 shadow-lg transition"
              >
                {/* Icon Loại Vật Phẩm */}
                <div className="w-11 h-11 rounded-lg bg-amber-900/80 border border-amber-400/70 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {item.type === 'WEAPON' ? '🗡️' : item.type === 'ARMOR' ? '🛡️' : '🧪'}
                </div>

                {/* Tên & Thuộc Tính */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-yellow-200 truncate">{item.name}</h4>
                    {equipped && (
                      <span className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black px-1.5 py-0.2 rounded">
                        ĐANG DÙNG
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-amber-100/85 truncate mt-0.5">{item.description}</p>

                  <div className="flex items-center gap-3 text-[10px] font-semibold mt-1">
                    {item.bonusAtk > 0 && (
                      <span className="text-rose-300 flex items-center gap-0.5">
                        <Swords className="w-3 h-3" /> +{item.bonusAtk} Công
                      </span>
                    )}
                    {item.bonusDef > 0 && (
                      <span className="text-sky-300 flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> +{item.bonusDef} Thủ
                      </span>
                    )}
                    {item.bonusHp > 0 && (
                      <span className="text-emerald-300 flex items-center gap-0.5">
                        <Heart className="w-3 h-3" /> +{item.bonusHp} Máu
                      </span>
                    )}
                  </div>
                </div>

                {/* Nút Mua Hoặc Trang Bị */}
                <div className="shrink-0">
                  {item.type === 'ELIXIR' ? (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handlePurchase(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 border border-yellow-200 active:scale-95 shadow'
                          : 'bg-amber-950/60 text-amber-400/50 border border-amber-800/50 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3 h-3" />
                      <span>{item.cost}</span>
                    </button>
                  ) : owned ? (
                    <button
                      type="button"
                      disabled={equipped}
                      onClick={() => onEquipItem(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        equipped
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/70 cursor-default'
                          : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95 cursor-pointer shadow'
                      }`}
                    >
                      {equipped ? 'ĐÃ TRANG BỊ' : 'TRANG BỊ'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handlePurchase(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 border border-yellow-200 active:scale-95 shadow cursor-pointer'
                          : 'bg-amber-950/60 text-amber-400/50 border border-amber-800/50 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3 h-3" />
                      <span>{item.cost}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
        <div className="royal-bottom-dock">
          <div className="w-full max-w-md mx-auto flex items-center justify-between gap-3">
            <span className="text-[10px] sm:text-xs font-bold text-amber-200 truncate flex-1 text-center sm:text-left">
              ⚜️ Thu thập vàng trong trận để sắm thần binh!
            </span>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl border-2 border-yellow-200 active:scale-95 transition cursor-pointer shrink-0 uppercase tracking-wider shadow-lg"
            >
              HOÀN TẤT &amp; ĐÓNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
