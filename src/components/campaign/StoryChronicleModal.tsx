/**
 * Loạn 12 Sứ Quân — Sử Thi Hào Hùng & Đại Việt Kỷ Yếu (Story Chronicle Modal)
 * Bảng Sử Thi Cung Đình: 13 Hồi Khởi Nghĩa, Dẹp Loạn 12 Sứ Quân & Đại Lễ Đăng Quang 968
 */

import React, { useState } from 'react';
import { PlayerProfile } from '../../types/game';
import { STORY_CHRONICLES, StoryChapter } from '../../data/storyChronicle';
import { soundEngine } from '../../services/audio';
import {
  BookOpen,
  X,
  Scroll,
  Shield,
  Swords,
  Crown,
  CheckCircle2,
  Lock,
  Sparkles,
  MapPin,
  Calendar,
  Flame,
} from 'lucide-react';

interface StoryChronicleModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onSelectStageToFight?: (stageNumber: number) => void;
}

export const StoryChronicleModal: React.FC<StoryChronicleModalProps> = ({
  profile,
  onClose,
  onSelectStageToFight,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    // Mặc định chọn hồi tương ứng với ải hiện tại hoặc hồi cao nhất đã mở
    const curStage = profile.currentStageNumber || 1;
    const found = STORY_CHRONICLES.find((c) => c.stageNumber === curStage);
    return found ? found.id : STORY_CHRONICLES[0].id;
  });

  const [filterMode, setFilterMode] = useState<'ALL' | 'UNLOCKED'>('ALL');

  const selectedChapter =
    STORY_CHRONICLES.find((c) => c.id === selectedChapterId) || STORY_CHRONICLES[0];

  const isChapterUnlocked = (ch: StoryChapter) => {
    if (ch.chapterNumber === 0) return true;
    if (ch.chapterNumber === 13) {
      return (profile.defeatedWarlords?.length ?? 0) >= 12;
    }
    const maxUnlockedStage = Math.max(
      profile.currentStageNumber || 1,
      (profile.defeatedWarlords?.length ?? 0) + 1
    );
    return ch.stageNumber <= maxUnlockedStage;
  };

  const isChapterConquered = (ch: StoryChapter) => {
    if (ch.chapterNumber === 0) return true;
    if (ch.chapterNumber === 13) return (profile.defeatedWarlords?.length ?? 0) >= 12;
    return ch.stageNumber < (profile.currentStageNumber || 1) || (profile.defeatedWarlords?.length ?? 0) >= ch.stageNumber;
  };

  const handleSelectChapter = (ch: StoryChapter) => {
    soundEngine.playShield();
    setSelectedChapterId(ch.id);
  };

  const displayList =
    filterMode === 'UNLOCKED'
      ? STORY_CHRONICLES.filter((ch) => isChapterUnlocked(ch))
      : STORY_CHRONICLES;

  const conqueredTotal = Math.min(12, profile.defeatedWarlords?.length ?? 0);

  return (
    <div className="modal-backdrop-safe">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#24130a] via-[#1d0e07] to-[#120703] border-2 border-amber-500/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* THANH ĐỈNH HOÀNG GIA ĐÔNG SƠN */}
        <div className="relative px-4 py-3 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-500/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-yellow-400 flex items-center justify-center text-yellow-300 shadow">
              <Scroll className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-sm sm:text-base text-yellow-300 tracking-wide drop-shadow">
                  HỒI KÝ 12 SỨ QUÂN
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-amber-950 border border-amber-500/60 text-[10px] font-bold text-amber-200">
                  Đã dẹp yên {conqueredTotal}/12 Cõi
                </span>
              </div>
              <p className="text-[10px] text-stone-300">
                Sử thi hào hùng thời lập quốc Đinh Tiên Hoàng (944 — 968)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900/90 border border-amber-500/60 text-stone-300 hover:text-white hover:bg-stone-800 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BỘ LỌC CHƯƠNG */}
        <div className="px-4 py-2 bg-stone-950/80 border-b border-amber-900/60 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-700'
              }`}
            >
              Toàn bộ 13 Hồi Ký
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('UNLOCKED')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterMode === 'UNLOCKED'
                  ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-700'
              }`}
            >
              Đã mở khóa ({conqueredTotal + 1})
            </button>
          </div>

          <div className="text-[10px] text-amber-400 font-mono">
            {profile.prestigeLevel && profile.prestigeLevel > 0
              ? `Vương Triều ${profile.prestigeLevel + 1}`
              : 'Niên hiệu Thái Bình'}
          </div>
        </div>

        {/* NỘI DUNG CHÍNH: CỘT TRÁI CHỌN CHƯƠNG + CỘT PHẢI CHI TIẾT SỬ THI */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* CỘT DANH SÁCH CHƯƠNG (SCROLL NGANG TRÊN MOBILE / DỌC TRÊN TABLET-DESKTOP) */}
          <div className="w-full md:w-56 bg-stone-950/70 border-b md:border-b-0 md:border-r border-amber-900/60 overflow-x-auto md:overflow-y-auto flex md:flex-col p-2 gap-1.5 shrink-0 scrollbar-thin">
            {displayList.map((ch) => {
              const unlocked = isChapterUnlocked(ch);
              const conquered = isChapterConquered(ch);
              const isSelected = ch.id === selectedChapter.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => unlocked && handleSelectChapter(ch)}
                  disabled={!unlocked}
                  className={`text-left p-2 rounded-xl transition flex items-center justify-between gap-2 shrink-0 md:w-full cursor-pointer min-w-[170px] md:min-w-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-900/90 to-amber-950 border-amber-400 shadow-md'
                      : unlocked
                      ? 'bg-stone-900/70 hover:bg-stone-800/90 border-stone-800 text-stone-300'
                      : 'bg-stone-950/60 border-stone-900 opacity-50 cursor-not-allowed text-stone-500'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{ch.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-black truncate text-yellow-200">
                        {ch.chapterNumber === 0
                          ? 'Mở đầu'
                          : ch.chapterNumber === 13
                          ? 'Đại Lễ'
                          : `Ải ${ch.stageNumber}`}
                      </div>
                      <div className="text-[9px] text-stone-400 truncate">
                        {ch.location.split('(')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {ch.chapterNumber === 13 ? (
                      <Crown
                        className={`w-3.5 h-3.5 ${
                          unlocked ? 'text-yellow-400 animate-bounce' : 'text-stone-600'
                        }`}
                      />
                    ) : conquered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : unlocked ? (
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-stone-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* CỘT PHẢI: CHI TIẾT SỬ THI CHIẾN DỊCH */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#1a0c05] to-[#120703]">
            {/* TIÊU ĐỀ HỒI */}
            <div className="border-b border-amber-500/40 pb-3">
              <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold mb-1">
                <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/60 font-mono">
                  {selectedChapter.chapterNumber === 0
                    ? 'KHỞI NGUYÊN'
                    : selectedChapter.chapterNumber === 13
                    ? 'ĐẠI LỄ ĐĂNG QUANG'
                    : `HỒI THỨ ${selectedChapter.chapterNumber}`}
                </span>
                <span className="flex items-center gap-1 text-stone-300">
                  <Calendar className="w-3 h-3 text-amber-300" /> {selectedChapter.year}
                </span>
                <span className="flex items-center gap-1 text-stone-300">
                  <MapPin className="w-3 h-3 text-red-400" /> {selectedChapter.location}
                </span>
              </div>

              <h3 className="font-display font-black text-lg sm:text-xl text-yellow-300 leading-snug drop-shadow">
                {selectedChapter.title}
              </h3>
              <p className="text-xs text-amber-200/90 font-medium italic mt-0.5">
                {selectedChapter.subtitle}
              </p>
            </div>

            {/* BỐI CẢNH LỊCH SỬ (HISTORICAL CONTEXT) */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Bối Cảnh Lịch Sử</span>
              </div>
              <p className="text-[12px] text-stone-200 leading-relaxed text-justify">
                {selectedChapter.historicalContext}
              </p>
            </div>

            {/* DIỄN BIẾN CHIẾN TRẬN HÀO HÙNG (BATTLE NARRATIVE) */}
            <div className="p-3 rounded-xl bg-stone-900/80 border border-amber-600/40">
              <div className="flex items-center gap-1.5 text-xs font-black text-yellow-300 mb-1.5">
                <Swords className="w-3.5 h-3.5 text-yellow-400" />
                <span>Diễn Biến Chiến Cuộc Hào Hùng</span>
              </div>
              <p className="text-[12px] text-stone-200 leading-relaxed text-justify">
                {selectedChapter.battleNarrative}
              </p>
            </div>

            {/* BINH PHÁP & MƯU LƯỢC QUÂN SỰ */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/50">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Binh Pháp & Mưu Lược Thống Nhất</span>
              </div>
              <p className="text-[12px] text-emerald-100 leading-relaxed text-justify">
                {selectedChapter.strategicInsight}
              </p>
            </div>

            {/* KHẨU QUYẾT & LỜI HỊCH HÀO KHÍ */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/60 to-amber-950/60 border border-red-500/50 text-center">
              <p className="text-[12px] font-bold text-amber-200 italic font-display">
                {selectedChapter.victoryQuote}
              </p>
            </div>

            {/* NÚT THAO TÁC TIẾN ĐÁNH ẢI TƯƠNG ỨNG */}
            {selectedChapter.stageNumber > 0 && selectedChapter.stageNumber <= 12 && onSelectStageToFight && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectStageToFight(selectedChapter.stageNumber);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer transition"
                >
                  <Swords className="w-4 h-4 text-stone-950" />
                  <span>TIẾN ĐÁNH ẢI {selectedChapter.stageNumber} NGAY</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ĐẾ ĐÁY */}
        <div className="px-4 py-2.5 bg-stone-950 border-t border-amber-900/60 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Nghiên cứu theo sử sách Đại Việt Sử Ký Toàn Thư</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold active:scale-95 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
