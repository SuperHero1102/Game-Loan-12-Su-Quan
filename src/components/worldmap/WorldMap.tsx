/**
 * Loạn 12 Sứ Quân — Bản Đồ Chiến Dịch Sơn Đảo 3D (Campaign Mountain Island Map)
 * - Tích hợp toàn diện hình ảnh bản đồ sơn đảo uốn lượn IMG_2706 (/campaign_map.png)
 * - Lộ trình hành quân cuộn dọc từ Đại Bản Doanh Hoa Lư dưới chân núi lên Đỉnh Phong Châu
 * - Mỗi ải hiển thị rõ ràng "Tên Ải" (Ải 1: Bình Kiều, Ải 2: Bố Hải Khẩu, ...)
 * - Nhấp vào ải mở Bảng Thông Tin 3D Tướng chiếm giữ, thuộc tính và nút "Tiến Đánh"
 * - Hiệu ứng mây trôi bồng bềnh sống động, cờ lệnh tung bay và điểm trạm nghỉ ngẫu nhiên
 */

import React, { useState, useRef, useEffect } from 'react';
import { PlayerProfile, MapNode, WorldVillageEvent } from '../../types/game';
import { CAMPAIGN_NODES, generateRandomVillages } from '../../data/campaignMap';
import { WARLORDS, DINH_BO_LINH } from '../../data/warlords';
import { Warlord3DScene } from '../character/Warlord3DScene';
import { WarlordCard3D } from '../character/WarlordCard3D';
import { soundEngine } from '../../services/audio';
import {
  Heart,
  Coins,
  Swords,
  ShoppingBag,
  User,
  ArrowLeft,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  Eye,
  X,
  CheckCircle2,
  Lock,
  Flame,
  Shield,
  Zap,
  Crown,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface WorldMapProps {
  profile: PlayerProfile;
  onEnterBattle: (warlordId: string, nodeName: string) => void;
  onClaimVillageReward?: (gold: number, hpBonus: number, atkBonus: number) => void;
  onOpenShop: () => void;
  onOpenHeroInfo: () => void;
  onOpenPvP: () => void;
  onReturnTitle: () => void;
  onOpenCoronation?: () => void;
  onOpenChronicle?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  profile,
  onEnterBattle,
  onClaimVillageReward,
  onOpenShop,
  onOpenHeroInfo,
  onOpenPvP,
  onReturnTitle,
  onOpenCoronation,
  onOpenChronicle,
  isMuted,
  onToggleMute,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStageNodeId =
    CAMPAIGN_NODES.find((n) => n.stageNumber === (profile.currentStageNumber || 1))?.id ||
    profile.currentNodeId ||
    'binh_kieu';

  const [selectedNodeId, setSelectedNodeId] = useState<string>(activeStageNodeId);
  const [nodeDetailModal, setNodeDetailModal] = useState<MapNode | null>(null);
  const [inspectCard3D, setInspectCard3D] = useState<boolean>(false);

  // Hệ thống Làng Mạc & Trạm Tiếp Tế ngẫu nhiên trên sườn núi
  const [villages, setVillages] = useState<WorldVillageEvent[]>(() => generateRandomVillages(108));
  const [activeVillageToast, setActiveVillageToast] = useState<string | null>(null);

  useEffect(() => {
    setSelectedNodeId(activeStageNodeId);
  }, [activeStageNodeId]);

  const currentNode =
    CAMPAIGN_NODES.find((n) => n.id === activeStageNodeId) || CAMPAIGN_NODES[0];
  const targetNode =
    CAMPAIGN_NODES.find((n) => n.id === selectedNodeId) || CAMPAIGN_NODES[1];

  const targetWarlord =
    WARLORDS.find((w) => w.id === targetNode.warlordId) ||
    (targetNode.id === 'hoa_lu' ? DINH_BO_LINH : WARLORDS[0]);

  const isConquered = profile.defeatedWarlords.includes(targetWarlord.id);

  // Tự động cuộn tới vị trí Ải hiện tại khi mở bản đồ hoặc khi mở khóa ải mới
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetPercent = targetNode ? targetNode.y / 100 : 0.85;
      const scrollTarget = container.scrollHeight * targetPercent - container.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth',
      });
    }
  }, [activeStageNodeId]);

  const handleNodeClick = (node: MapNode) => {
    soundEngine.playShield();
    setSelectedNodeId(node.id);
    setNodeDetailModal(node);
    setInspectCard3D(false);
  };

  const handleVisitVillage = (village: WorldVillageEvent) => {
    if (village.visited) return;
    soundEngine.playGold();

    setVillages((prev) =>
      prev.map((v) => (v.id === village.id ? { ...v, visited: true } : v))
    );

    if (onClaimVillageReward) {
      onClaimVillageReward(village.rewardGold, village.rewardHpBonus, village.rewardAtkBonus);
    }

    const rewardParts = [`+${village.rewardGold} Vàng`];
    if (village.rewardHpBonus > 0) rewardParts.push(`+${village.rewardHpBonus} Máu tối đa`);
    if (village.rewardAtkBonus > 0) rewardParts.push(`+${village.rewardAtkBonus} Công lực`);

    setActiveVillageToast(`${village.name}: ${rewardParts.join(' · ')}`);
    setTimeout(() => setActiveVillageToast(null), 3200);
  };

  const handleReseedVillages = () => {
    soundEngine.playBronzeGong();
    setVillages(generateRandomVillages(Date.now()));
    setActiveVillageToast('Đã phát hiện các Điểm Tiếp Tế & Làng Mạc mới trên sườn núi!');
    setTimeout(() => setActiveVillageToast(null), 2500);
  };

  // Xác định trạng thái mở khóa của ải (đồng bộ cả currentStageNumber và defeatedWarlords)
  const isNodeUnlocked = (node: MapNode) => {
    const stageNum = node.stageNumber ?? 0;
    if (stageNum <= 1) return true;
    if (stageNum <= (profile.currentStageNumber || 1)) return true;
    const prevNode = CAMPAIGN_NODES.find((n) => n.stageNumber === stageNum - 1);
    if (!prevNode) return true;
    const prevWarlord = WARLORDS.find((w) => w.id === prevNode.warlordId);
    return prevWarlord ? profile.defeatedWarlords.includes(prevWarlord.id) : true;
  };

  return (
    <div className="relative w-full flex-1 h-full flex flex-col bg-bronze-pattern select-none overflow-hidden font-body">
      {/* THANH ĐỈNH HOÀNG KIM ĐÔNG SƠN: Nút Quay Lại Trang Chủ, Sinh Lực, Vàng, Do Thám & Âm Thanh */}
      <div className="royal-header-bar flex items-center justify-between text-xs font-bold text-amber-200 gap-1.5 flex-wrap py-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onReturnTitle}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-400/80 text-yellow-300 text-[11px] font-bold active:scale-95 transition cursor-pointer shadow"
            title="Quay về Màn Hình Chính"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Trang chủ</span>
          </button>

          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/85 border border-rose-400/60 text-rose-300 font-black text-[11px]">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            <span>x{profile.lives}</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/85 border border-yellow-400/70 text-yellow-300 font-mono text-[11px] tabular-nums">
            <Coins className="w-3 h-3 fill-yellow-400" />
            <span>{profile.gold.toLocaleString()}</span>
          </div>

          {profile.prestigeLevel && profile.prestigeLevel > 0 ? (
            <div className="px-1.5 py-0.5 rounded bg-gradient-to-r from-red-950 to-amber-950 border border-yellow-400 text-yellow-300 text-[9px] font-black tracking-wide flex items-center gap-0.5 shadow">
              <Crown className="w-3 h-3 text-yellow-300" />
              <span>VT {profile.prestigeLevel + 1}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          {/* NÚT ĐẠI LỄ ĐĂNG QUANG NẾU ĐÃ DẸP XONG 12 ẢI HOẶC ĐÃ PHÁ ĐẢO */}
          {((profile.defeatedWarlords?.length ?? 0) >= 12 || profile.hasCompletedCampaign) && onOpenCoronation && (
            <button
              type="button"
              onClick={onOpenCoronation}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 border border-yellow-300 text-[10px] font-black text-stone-950 flex items-center gap-1 active:scale-95 transition cursor-pointer shadow-lg animate-pulse"
              title="Đại Lễ Đăng Quang Hoàng Đế & Chế độ Tái Lập Giang Sơn"
            >
              <Crown className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
              <span>ĐĂNG QUANG</span>
            </button>
          )}

          {/* NÚT HỒI KÝ 12 SỨ QUÂN */}
          {onOpenChronicle && (
            <button
              type="button"
              onClick={onOpenChronicle}
              className="px-2 py-1 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-400/80 text-[10px] font-bold text-amber-200 flex items-center gap-1 active:scale-95 transition cursor-pointer shadow"
              title="Xem Sử Thi 13 Hồi Ký Chiến Dịch"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Hồi Ký</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReseedVillages}
            className="px-2 py-1 rounded-lg bg-emerald-950/95 hover:bg-emerald-900 border border-emerald-400/80 text-[10px] font-bold text-emerald-200 flex items-center gap-1 active:scale-95 transition cursor-pointer shadow"
            title="Khám phá trạm tiếp tế ngẫu nhiên mới"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-300" />
            <span>Do Thám</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-400/70 text-yellow-300 cursor-pointer shadow"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Thông báo thu hoạch Làng Mạc / Doanh Trại */}
      {activeVillageToast && (
        <div className="absolute top-14 inset-x-4 z-40 flex justify-center pointer-events-none">
          <div className="px-3.5 py-2 rounded-xl bg-amber-950/95 border-2 border-yellow-400 text-yellow-200 text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{activeVillageToast}</span>
          </div>
        </div>
      )}

      {/* BẢN ĐỒ CHIẾN DỊCH SƠN ĐẢO 3D CUỘN DỌC TỪ DƯỚI LÊN ĐỈNH NÚI */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden bg-bronze-pattern scroll-smooth flex justify-center"
      >
        {/* CONTAINER BẢN ĐỒ DỌC PHỦ KÍN 100% KHUNG NHÌN */}
        <div
          className="relative w-full max-w-[560px] min-h-full shadow-2xl overflow-hidden"
          style={{ aspectRatio: '460 / 960' }}
        >
          {/* LỚP ẢNH BẢN ĐỒ SƠN ĐẢO THẦN TIÊN IMG_2706 */}
          <img
            src="/assets/aistudio/IMG_2706_d13bfa83.jpeg"
            onError={(e) => {
              // Fallback nếu cần
              (e.currentTarget as HTMLImageElement).src = '/campaign_map.png';
            }}
            alt="Bản đồ Sơn Đảo Chiến Dịch 12 Sứ Quân"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          />

          {/* HIỆU ỨNG KHÍ QUYỂN & MÂY TRÔI SỐNG ĐỘNG (LIVING ATMOSPHERE) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
            {/* Lớp mây trôi tầng cao (Phong Châu) */}
            <div className="absolute top-[8%] left-[-20%] w-[140%] h-24 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-xl animate-cloud-drift-1 pointer-events-none" />

            {/* Lớp mây trôi tầng trung (Rừng Mơ / Tiên Du) */}
            <div className="absolute top-[44%] left-[-10%] w-[130%] h-28 bg-gradient-to-r from-transparent via-white/12 to-transparent blur-2xl animate-cloud-drift-2 pointer-events-none" />

            {/* Lớp sương mù thung lũng chân núi (Hoa Lư) */}
            <div className="absolute top-[75%] left-[-25%] w-[150%] h-32 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl animate-cloud-drift-1 pointer-events-none" />

            {/* Khói lam chiều bốc lên từ Doanh Trại Hoa Lư */}
            <div className="absolute left-[29%] top-[78%] pointer-events-none flex flex-col items-center">
              <span className="text-[10px] animate-smoke opacity-70">💨</span>
            </div>

            {/* Khói bốc lên từ Lò Rèn Cổ Loa */}
            <div className="absolute left-[56%] top-[59%] pointer-events-none flex flex-col items-center">
              <span className="text-[9px] animate-smoke opacity-60">💨</span>
            </div>
          </div>

          {/* ĐƯỜNG KẾT NỐI ÁNH VÀNG NỐI CÁC ẢI THEO LỘ TRÌNH CHIẾN DỊCH */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathGold" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#facc15" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Nối các ải lần lượt từ chân núi lên đỉnh */}
            {CAMPAIGN_NODES.map((node, idx) => {
              if (idx === 0) return null;
              const prev = CAMPAIGN_NODES[idx - 1];
              return (
                <line
                  key={`trail-${prev.id}-${node.id}`}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="url(#pathGold)"
                  strokeWidth="1.2"
                  strokeDasharray="2,1.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_4px_rgba(250,204,21,0.9)]"
                />
              );
            })}
          </svg>

          {/* ĐIỂM TRẠM TIẾP TẾ & LÀNG MẠC VEN ĐƯỜNG */}
          {villages.map((v) => {
            const icon =
              v.type === 'VILLAGE'
                ? '🏘️'
                : v.type === 'SUPPLY_CAMP'
                ? '🌾'
                : v.type === 'WATCHTOWER'
                ? '⚒️'
                : '⛺';

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleVisitVillage(v)}
                disabled={v.visited}
                style={{ left: `${v.x}%`, top: `${v.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group transition-transform ${
                  v.visited
                    ? 'opacity-40 cursor-default scale-85'
                    : 'hover:scale-110 active:scale-95 cursor-pointer animate-pulse'
                }`}
                title={`${v.name}: ${v.description}`}
              >
                <div
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xl border ${
                    v.visited
                      ? 'bg-stone-800 border-stone-600'
                      : 'bg-gradient-to-b from-amber-600 to-stone-900 border-yellow-300 ring-2 ring-amber-400/50'
                  }`}
                >
                  {icon}
                  {/* Chấm than mời gọi thu hoạch */}
                  {!v.visited && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-yellow-400 border border-yellow-200 text-stone-950 font-black text-[9px] flex items-center justify-center animate-bounce shadow">
                      !
                    </div>
                  )}
                </div>
                <span className="mt-0.5 px-1.5 py-0.5 bg-black/85 text-[8px] font-bold text-emerald-300 rounded border border-emerald-700/60 whitespace-nowrap shadow">
                  {v.visited ? 'Đã thu hoạch' : v.name}
                </span>
              </button>
            );
          })}

          {/* CÁC ẢI CHIẾN DỊCH VÀ ĐẠI BẢN DOANH DỌC THEO CON ĐƯỜNG NÚI */}
          {CAMPAIGN_NODES.map((node) => {
            const isCurrent = node.id === profile.currentNodeId;
            const isSelected = node.id === selectedNodeId;
            const warlord =
              WARLORDS.find((w) => w.id === node.warlordId) || DINH_BO_LINH;
            const conquered = profile.defeatedWarlords.includes(warlord.id);
            const unlocked = isNodeUnlocked(node);
            const isAllConquered = (profile.defeatedWarlords?.length ?? 0) >= 12;

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform duration-200 z-20 ${
                  isSelected
                    ? 'scale-115 z-30'
                    : isCurrent
                    ? 'scale-110 z-25'
                    : 'hover:scale-105'
                }`}
              >
                {/* BIỂU TƯỢNG VỊ TRÍ 3D (CỜ CHIẾN LỆNH HOẶC HUY HIỆU ẢI) */}
                <div className="relative flex flex-col items-center">
                  {/* Vòng hào quang sáng nếu là ải hiện tại */}
                  {isCurrent && (
                    <div className="absolute -inset-2 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
                  )}

                  {/* CỜ ĐẠI KỲ ĐINH VƯƠNG TUNG BAY TRÊN CÁC ẢI ĐÃ DẸP YÊN */}
                  {conquered && node.id !== 'hoa_lu' && (
                    <div className="absolute -top-4 -right-3 z-30 pointer-events-none animate-flag-wave flex items-center">
                      <span className="text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" title="Đại Kỳ Đinh Vương phất cao">
                        🚩
                      </span>
                    </div>
                  )}

                  {/* ĐỈNH HOA LƯ: VƯƠNG MIỆN KHI ĐÃ THỐNG NHẤT 12 CÕI */}
                  {node.id === 'hoa_lu' && isAllConquered && (
                    <div className="absolute -top-4 inset-x-0 flex justify-center pointer-events-none animate-bounce z-30">
                      <Crown className="w-5 h-5 text-yellow-300 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]" />
                    </div>
                  )}

                  {/* Nút Ải tròn 3D có Avatar Warlord */}
                  <div
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 shadow-2xl flex items-center justify-center transition-all ${
                      conquered
                        ? 'border-yellow-400 ring-2 ring-amber-500/70 bg-gradient-to-b from-amber-950 to-stone-900'
                        : isCurrent
                        ? 'border-yellow-300 ring-4 ring-amber-400/80 bg-amber-950'
                        : unlocked
                        ? 'border-amber-400 ring-2 ring-amber-500/40 bg-stone-900'
                        : 'border-stone-600 opacity-75 bg-stone-950'
                    }`}
                  >
                    {/* Ảnh đại diện 3D Tướng */}
                    <div className="w-full h-full relative overflow-hidden">
                      <Warlord3DScene
                        warlordId={warlord.id}
                        name={warlord.name}
                        portrait3D={warlord.portrait3D}
                        compact={true}
                      />
                    </div>

                    {/* Huy hiệu đã thu phục hoặc Khóa */}
                    {conquered ? (
                      <div className="absolute inset-0 bg-amber-950/30 flex items-center justify-center pointer-events-none">
                        <CheckCircle2 className="w-5 h-5 text-yellow-300 drop-shadow" />
                      </div>
                    ) : !unlocked ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                    ) : null}
                  </div>

                  {/* BANNER TÊN ẢI THEO YÊU CẦU: "Ải 1: Bình Kiều", "Ải 2: Bố Hải Khẩu", ... */}
                  <div
                    className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide border shadow-xl whitespace-nowrap flex items-center gap-1 ${
                      conquered
                        ? 'bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-yellow-400/90 text-yellow-200'
                        : isCurrent
                        ? 'bg-red-950/95 border-yellow-400 text-yellow-300 animate-pulse'
                        : unlocked
                        ? 'bg-stone-900/95 border-amber-500/80 text-amber-200'
                        : 'bg-stone-950/90 border-stone-700 text-stone-400'
                    }`}
                  >
                    <span>{node.name}</span>
                    {conquered && <span className="text-yellow-300 font-bold">✓</span>}
                  </div>

                  {/* Tên tướng chiếm giữ dưới tên ải */}
                  <div className="px-1.5 py-0.2 rounded bg-black/75 text-[8px] font-bold text-stone-300 border border-stone-800 mt-0.5 truncate max-w-[100px] text-center">
                    {warlord.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHUNG THÔNG TIN 3D ẢI & NÚT "TIẾN ĐÁNH" KHI ẤN VÀO ẢI */}
      {nodeDetailModal && (
        <div className="absolute inset-x-3 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] bg-stone-900/95 border-2 border-amber-500 rounded-2xl p-3.5 sm:p-4 shadow-2xl z-40 backdrop-blur-md text-stone-100 max-h-[50vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            {/* Ảnh đại diện 3D thu nhỏ */}
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-stone-950 shadow-lg">
              <Warlord3DScene
                warlordId={targetWarlord.id}
                name={targetWarlord.name}
                portrait3D={targetWarlord.portrait3D}
                compact={true}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/80 text-[10px] font-bold text-amber-300">
                  {nodeDetailModal.name}
                </span>
                {isConquered && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Đã Thu Phục
                  </span>
                )}
              </div>

              <h3 className="font-black text-sm text-amber-300 font-display mt-0.5 truncate">
                {targetWarlord.name} ({targetWarlord.title})
              </h3>
              <p className="text-[11px] text-stone-300 line-clamp-2 mt-0.5">
                {nodeDetailModal.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNodeDetailModal(null)}
              className="text-stone-400 hover:text-white p-1 cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Thuộc tính ải & Thông số Tướng: HP, ATK, DEF, SPD */}
          <div className="mt-3 pt-2.5 border-t border-amber-900/60 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 text-[11px] font-mono tabular-nums">
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <Heart className="w-3 h-3 fill-rose-500" /> {targetWarlord.hpRating}
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Swords className="w-3 h-3 text-amber-400" /> {targetWarlord.atkRating}
              </span>
              <span className="flex items-center gap-1 text-sky-400 font-bold">
                <Shield className="w-3 h-3 fill-sky-400" /> {targetWarlord.defRating}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Zap className="w-3 h-3 fill-emerald-400" /> {targetWarlord.spd}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInspectCard3D(true)}
                className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-amber-500/70 text-amber-200 font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 cursor-pointer shadow"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Thẻ 3D</span>
              </button>

              {nodeDetailModal.id === 'hoa_lu' && (
                <div className="flex items-center gap-1.5">
                  {onOpenChronicle && (
                    <button
                      type="button"
                      onClick={() => {
                        setNodeDetailModal(null);
                        onOpenChronicle();
                      }}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-amber-500/70 text-amber-200 font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 cursor-pointer shadow"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Hồi Ký</span>
                    </button>
                  )}
                  {((profile.defeatedWarlords?.length ?? 0) >= 12 || profile.hasCompletedCampaign) && onOpenCoronation && (
                    <button
                      type="button"
                      onClick={() => {
                        setNodeDetailModal(null);
                        onOpenCoronation();
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1 active:scale-95 cursor-pointer shadow-lg animate-pulse"
                    >
                      <Crown className="w-3.5 h-3.5 text-stone-950" />
                      <span>ĐĂNG QUANG</span>
                    </button>
                  )}
                </div>
              )}

              {nodeDetailModal.id !== 'hoa_lu' && (
                <button
                  type="button"
                  onClick={() => {
                    setNodeDetailModal(null);
                    onEnterBattle(targetWarlord.id, nodeDetailModal.name);
                  }}
                  className="px-4 py-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Swords className="w-4 h-4 fill-stone-950" />
                  <span>TIẾN ĐÁNH</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM THẺ NHÂN VẬT 3D TRỰC TIẾP TRÊN BẢN ĐỒ */}
      {inspectCard3D && (
        <div className="modal-backdrop-safe">
          <div className="relative w-full max-w-sm max-h-full overflow-y-auto pr-1">
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={() => setInspectCard3D(false)}
                className="w-8 h-8 rounded-full bg-stone-800 border-2 border-amber-400 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <WarlordCard3D
              warlord={targetWarlord}
              size="sm"
              level={90}
              showDetails={false}
              onSelect={
                targetWarlord.id !== 'dinh_bo_linh'
                  ? () => {
                      setInspectCard3D(false);
                      setNodeDetailModal(null);
                      onEnterBattle(targetWarlord.id, targetNode.name);
                    }
                  : undefined
              }
              actionLabel={
                targetWarlord.id !== 'dinh_bo_linh'
                  ? `⚔️ TIẾN ĐÁNH ${targetWarlord.name.toUpperCase()}`
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {/* ĐẾ ĐÁY HOÀNG KIM ĐÔNG SƠN TRÀN VIỀN (C.HÀNG - 13 THẺ 3D - ĐỐI KHÁNG - THOÁT) */}
      <div className="royal-bottom-dock">
        <div className="w-full max-w-md mx-auto grid grid-cols-4 items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenShop}
            className="w-full py-1.5 flex flex-col items-center justify-center bg-gradient-to-b from-amber-800/95 to-amber-950 hover:from-amber-700 hover:to-amber-900 border border-yellow-400/80 rounded-xl text-yellow-200 active:scale-95 transition cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-yellow-300" />
            <span className="text-[10px] font-black mt-0.5 tracking-wide">C.HÀNG</span>
          </button>

          <button
            type="button"
            onClick={onOpenHeroInfo}
            className="w-full py-1.5 flex flex-col items-center justify-center bg-gradient-to-b from-amber-800/95 to-amber-950 hover:from-amber-700 hover:to-amber-900 border border-yellow-400/80 rounded-xl text-yellow-200 active:scale-95 transition cursor-pointer shadow-md"
          >
            <User className="w-4 h-4 text-sky-300" />
            <span className="text-[10px] font-black mt-0.5 tracking-wide">13 THẺ 3D</span>
          </button>

          <button
            type="button"
            onClick={onOpenPvP}
            className="w-full py-1.5 flex flex-col items-center justify-center bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 border-2 border-yellow-200 rounded-xl text-stone-950 font-black active:scale-95 transition shadow-lg cursor-pointer"
          >
            <Swords className="w-4 h-4 text-stone-950" />
            <span className="text-[10px] font-black mt-0.5 tracking-wide">ĐỐI KHÁNG</span>
          </button>

          <button
            type="button"
            onClick={onReturnTitle}
            className="w-full py-1.5 flex flex-col items-center justify-center bg-gradient-to-b from-rose-900/95 to-rose-950 hover:from-rose-800 hover:to-rose-900 border border-rose-400/80 rounded-xl text-rose-100 active:scale-95 transition cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-rose-300" />
            <span className="text-[10px] font-black mt-0.5 tracking-wide">THOÁT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
