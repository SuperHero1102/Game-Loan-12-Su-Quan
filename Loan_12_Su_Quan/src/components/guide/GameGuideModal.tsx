/**
 * Loạn 12 Sứ Quân — Modal Hướng Dẫn Tân Thủ, Cốt Truyện Lịch Sử & Sa Bàn Tương Tác 12 Sứ Quân
 * Hiển thị trực tiếp Mục 1 (Cốt truyện & Sa bàn tương tác 12 Sứ Quân) ở đầu trang,
 * nối tiếp liền mạch bên dưới là Mục 2 (Quy tắc Match-3 & Hệ thống Tướng 3D).
 */

import React, { useState, useRef } from 'react';
import { DINH_BO_LINH, WARLORDS } from '../../data/warlords';
import { Warlord } from '../../types/game';
import {
  MapPin,
  Swords,
  Shield,
  Scroll,
  Crown,
  Compass,
} from 'lucide-react';

interface GameGuideModalProps {
  onClose: () => void;
}

interface MapPinData {
  id: string;
  name: string;
  title: string;
  territory: string;
  modernProvince: string;
  x: number; // %
  y: number; // %
  type: 'capital' | 'ally' | 'rival';
  historicalOutcome: string;
  warlord: Warlord;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ onClose }) => {
  const [selectedPinId, setSelectedPinId] = useState<string>('dinh_bo_linh');
  const [activeSection, setActiveSection] = useState<'LORE' | 'RULES'>('LORE');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loreSectionRef = useRef<HTMLDivElement>(null);
  const rulesSectionRef = useRef<HTMLDivElement>(null);
  const isManualScrollingRef = useRef<boolean>(false);

  const scrollToSection = (
    section: 'LORE' | 'RULES',
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    setActiveSection(section);
    isManualScrollingRef.current = true;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 650);
  };

  const handleScroll = () => {
    if (isManualScrollingRef.current) return;
    const container = scrollContainerRef.current;
    const rulesEl = rulesSectionRef.current;
    if (!container || !rulesEl) return;
    const containerRect = container.getBoundingClientRect();
    const rulesRect = rulesEl.getBoundingClientRect();
    if (rulesRect.top - containerRect.top <= 120) {
      setActiveSection('RULES');
    } else {
      setActiveSection('LORE');
    }
  };

  // Dữ liệu 13 cứ điểm địa bàn 12 Sứ Quân & Đại Bản Doanh Hoa Lư
  const mapPins: MapPinData[] = [
    {
      id: 'dinh_bo_linh',
      name: DINH_BO_LINH.name,
      title: DINH_BO_LINH.title,
      territory: 'Động Hoa Lư',
      modernProvince: 'Hoa Lư, Ninh Bình',
      x: 36,
      y: 80,
      type: 'capital',
      historicalOutcome:
        'Khởi nghiệp từ cờ lau động Hoa Lư bên sông Hoàng Long, liên minh cùng Trần Lãm tại Bố Hải Khẩu, dùng mưu lược ân uy thu phục 12 sứ quân, lên ngôi Hoàng Đế lập nước Đại Cồ Việt (968).',
      warlord: DINH_BO_LINH,
    },
    {
      id: 'ngo_xuong_xi',
      name: 'Ngô Xương Xí',
      title: 'Ngô Sứ Quân',
      territory: 'Bình Kiều',
      modernProvince: 'Triệu Sơn, Thanh Hóa',
      x: 46,
      y: 89,
      type: 'rival',
      historicalOutcome:
        'Hậu duệ tôn thất nhà Ngô. Đinh Bộ Lĩnh dùng uy đức chiêu dụ tại Bình Kiều, Ngô Xương Xí cảm phục quy thuận trong hòa hiếu.',
      warlord: WARLORDS.find((w) => w.id === 'ngo_xuong_xi') || WARLORDS[0],
    },
    {
      id: 'tran_lam',
      name: 'Trần Lãm',
      title: 'Trần Minh Công',
      territory: 'Bố Hải Khẩu',
      modernProvince: 'Kỳ Bố, TP. Thái Bình',
      x: 75,
      y: 74,
      type: 'ally',
      historicalOutcome:
        'Sứ quân thủy binh giàu mạnh vùng cửa biển. Nhận Đinh Bộ Lĩnh làm con nuôi và trao lại toàn bộ binh quyền Bố Hải Khẩu để dẹp loạn.',
      warlord: WARLORDS.find((w) => w.id === 'tran_lam') || WARLORDS[1],
    },
    {
      id: 'do_canh_thac',
      name: 'Đỗ Cảnh Thạc',
      title: 'Đỗ Cảnh Công',
      territory: 'Đỗ Động Giang',
      modernProvince: 'Thanh Oai, Hà Nội',
      x: 34,
      y: 62,
      type: 'rival',
      historicalOutcome:
        'Sứ quân mưu lược chiếm giữ thành Trại Quyền và Bảo Đà kiên cố. Đinh Bộ Lĩnh chia quân vây hãm nhiều tháng và chia cánh tập kích ban đêm hạ thành.',
      warlord: WARLORDS.find((w) => w.id === 'do_canh_thac') || WARLORDS[2],
    },
    {
      id: 'pham_bach_ho',
      name: 'Phạm Bạch Hổ',
      title: 'Phạm Phòng Át',
      territory: 'Đằng Châu',
      modernProvince: 'Kim Động, Hưng Yên',
      x: 56,
      y: 68,
      type: 'ally',
      historicalOutcome:
        'Danh tướng cựu trào Ngô Quyền trấn giữ Đằng Châu. Được Đinh Bộ Lĩnh thuyết phục quy thuận, được phong làm Thân vệ Đại tướng quân nhà Đinh.',
      warlord: WARLORDS.find((w) => w.id === 'pham_bach_ho') || WARLORDS[3],
    },
    {
      id: 'nguyen_sieu',
      name: 'Nguyễn Siêu',
      title: 'Nguyễn Hữu Công',
      territory: 'Tây Phù Liệt',
      modernProvince: 'Thanh Trì, Hà Nội',
      x: 45,
      y: 55,
      type: 'rival',
      historicalOutcome:
        'Cầm đầu vạn quân tinh nhuệ tại Tây Phù Liệt. Sau trận tử chiến dữ dội trên sông Hồng, Đinh Bộ Lĩnh dùng kế hỏa công đánh tan đại bản doanh.',
      warlord: WARLORDS.find((w) => w.id === 'nguyen_sieu') || WARLORDS[4],
    },
    {
      id: 'lu_duong',
      name: 'Lữ Đường',
      title: 'Lữ Tá Công',
      territory: 'Tế Giang',
      modernProvince: 'Văn Giang, Hưng Yên',
      x: 63,
      y: 57,
      type: 'rival',
      historicalOutcome:
        'Chiếm cứ vùng đầm lầy lau sậy Tế Giang. Quân Hoa Lư phối hợp thủy bộ tiến công chớp nhoáng, thu phục hoàn toàn vùng Tế Giang.',
      warlord: WARLORDS.find((w) => w.id === 'lu_duong') || WARLORDS[5],
    },
    {
      id: 'ly_khue',
      name: 'Lý Khuê',
      title: 'Lý Lãng Công',
      territory: 'Siêu Loại',
      modernProvince: 'Thuận Thành, Bắc Ninh',
      x: 68,
      y: 46,
      type: 'rival',
      historicalOutcome:
        'Hào trưởng vùng dâu tằm bên bờ sông Đuống. Đinh Bộ Lĩnh cử đại tướng Lưu Cơ dẫn quân vượt sông đánh dẹp tại Lũng Khê.',
      warlord: WARLORDS.find((w) => w.id === 'ly_khue') || WARLORDS[6],
    },
    {
      id: 'ngo_nhat_khanh',
      name: 'Ngô Nhật Khánh',
      title: 'Ngô Lãm Công',
      territory: 'Đường Lâm',
      modernProvince: 'Sơn Tây, Hà Nội',
      x: 27,
      y: 50,
      type: 'rival',
      historicalOutcome:
        'Dòng dõi nhà Ngô cát cứ đất tổ Đường Lâm. Đinh Bộ Lĩnh dùng chính sách hòa thân (gả công chúa Phất Kim) để thu phục không tốn xương máu.',
      warlord: WARLORDS.find((w) => w.id === 'ngo_nhat_khanh') || WARLORDS[7],
    },
    {
      id: 'kieu_thuan',
      name: 'Kiều Thuận',
      title: 'Kiều Lệnh Công',
      territory: 'Hồi Hồ',
      modernProvince: 'Cẩm Khê, Phú Thọ',
      x: 19,
      y: 34,
      type: 'rival',
      historicalOutcome:
        'Xây thành Hoa Khê hiểm trở ở miền thượng du sông Thao. Đại quân Vạn Thắng Vương tiến vây công phá, thu phục vùng đất tổ.',
      warlord: WARLORDS.find((w) => w.id === 'kieu_thuan') || WARLORDS[8],
    },
    {
      id: 'nguyen_thu_tiep',
      name: 'Nguyễn Thủ Tiệp',
      title: 'Vũ Ninh Vương',
      territory: 'Tiên Du',
      modernProvince: 'Tiên Du, Bắc Ninh',
      x: 58,
      y: 39,
      type: 'rival',
      historicalOutcome:
        'Hùng cứ núi Tiên Du, uy thế lẫy lừng tự xưng Vũ Ninh Vương. Quân Hoa Lư tiến công thần tốc phá vỡ phòng tuyến Tiên Du.',
      warlord: WARLORDS.find((w) => w.id === 'nguyen_thu_tiep') || WARLORDS[9],
    },
    {
      id: 'nguyen_khoan',
      name: 'Nguyễn Khoan',
      title: 'Quảng Trí Quân',
      territory: 'Tam Đái',
      modernProvince: 'Yên Lạc, Vĩnh Phúc',
      x: 40,
      y: 36,
      type: 'rival',
      historicalOutcome:
        'Anh cả trong 3 anh em họ Nguyễn (Khoan - Tiệp - Siêu), quản lý vùng ngã ba sông trù phú Tam Đái trước khi bị quân Hoa Lư thu phục.',
      warlord: WARLORDS.find((w) => w.id === 'nguyen_khoan') || WARLORDS[10],
    },
    {
      id: 'kieu_cong_han',
      name: 'Kiều Công Hãn',
      title: 'Kiều Tam Chế',
      territory: 'Phong Châu',
      modernProvince: 'Bạch Hạc, Phú Thọ',
      x: 30,
      y: 23,
      type: 'rival',
      historicalOutcome:
        'Nắm giữ vùng kinh đô Phong Châu cổ bên ngã ba sông Bạch Hạc. Bị quân Đinh Bộ Lĩnh đánh bại khi rút chạy về phía Nam.',
      warlord: WARLORDS.find((w) => w.id === 'kieu_cong_han') || WARLORDS[11],
    },
  ];

  const capitalPin = mapPins[0];
  const selectedPin = mapPins.find((p) => p.id === selectedPinId) || mapPins[0];

  return (
    <div className="modal-commercial-overlay select-none">
      <div className="modal-commercial-shell max-w-2xl sm:border-x-2 sm:border-amber-500 shadow-2xl text-stone-100">
        {/* Thanh Đỉnh Hoàng Kim Đông Sơn */}
        <div className="royal-header-bar flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Scroll className="w-5 h-5 text-yellow-300 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-black text-xs sm:text-sm text-yellow-200 uppercase tracking-wide truncate drop-shadow">
                HƯỚNG DẪN TÂN THỦ &amp; CỐT TRUYỆN LỊCH SỬ
              </h2>
              <p className="text-[10px] text-amber-200/90 truncate">
                Mục 1: Cốt truyện Loạn 12 Sứ Quân &amp; Sa bàn · Mục 2: Quy tắc Match-3
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-950/95 hover:bg-rose-900 text-rose-200 border border-rose-400/80 text-sm cursor-pointer transition shrink-0 shadow"
          >
            ✕
          </button>
        </div>

        {/* Thanh chuyển nhanh tới 2 phần trên cùng 1 trang cuộn — Nền Đồng Hoàng Kim */}
        <div className="royal-subbar grid grid-cols-2 p-1.5 gap-2">
          <button
            type="button"
            onClick={() => scrollToSection('LORE', loreSectionRef)}
            className={`py-2 px-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap border ${
              activeSection === 'LORE'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 ring-1 ring-yellow-300 shadow font-black'
                : 'bg-amber-950/85 hover:bg-amber-900/85 text-amber-200 border-amber-700/70 font-bold'
            }`}
          >
            <Scroll
              className={`w-3.5 h-3.5 shrink-0 ${
                activeSection === 'LORE' ? 'text-stone-950' : 'text-yellow-400'
              }`}
            />
            <span className="truncate">1. Cốt Truyện &amp; Bản Đồ 12 Sứ Quân</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('RULES', rulesSectionRef)}
            className={`py-2 px-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap border ${
              activeSection === 'RULES'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 ring-1 ring-yellow-300 shadow font-black'
                : 'bg-amber-950/85 hover:bg-amber-900/85 text-amber-200 border-amber-700/70 font-bold'
            }`}
          >
            <Swords
              className={`w-3.5 h-3.5 shrink-0 ${
                activeSection === 'RULES' ? 'text-stone-950' : 'text-yellow-400'
              }`}
            />
            <span className="truncate">2. Quy Tắc Match-3 &amp; Tướng 3D</span>
          </button>
        </div>

        {/* Nội dung cuộn dọc liền mạch: Mục 1 ở đầu trang + Mục 2 ngay bên dưới */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-5 text-xs"
        >
          {/* ===================================================================
              MỤC 1 (ĐẦU TRANG): CỐT TRUYỆN LOẠN 12 SỨ QUÂN & SA BÀN TƯƠNG TÁC
             =================================================================== */}
          <div ref={loreSectionRef} className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-800/60 pb-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wide">
                <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>MỤC 1: CỐT TRUYỆN LỊCH SỬ LOẠN 12 SỨ QUÂN (944 — 968)</span>
              </div>
            </div>

            {/* Khung bối cảnh lịch sử */}
            <div className="p-3 bg-gradient-to-br from-amber-950/75 via-stone-900 to-stone-950 rounded-xl border border-amber-600/60 shadow-lg space-y-2.5">
              <p className="text-[11px] text-stone-200 leading-relaxed">
                Năm <strong>944</strong>, sau chiến thắng Bạch Đằng lừng lẫy, Tiền Ngô Vương <strong>Ngô Quyền</strong> băng hà. Triều đình Cổ Loa suy yếu vì Dương Tam Kha tiếm ngôi, dẫn đến việc các hào trưởng địa phương nổi dậy chiếm giữ các vùng đất hiểm yếu, hình thành <strong>12 Sứ Quân cát cứ</strong>. Đất nước đứng trước nguy cơ chia cắt và ngoại bang nhòm ngó.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="p-2.5 bg-stone-950/90 rounded-lg border border-amber-900/60">
                  <span className="font-bold text-amber-400 block mb-0.5">
                    01. Cờ Lau Tập Trận (Hoa Lư)
                  </span>
                  <span className="text-stone-300 leading-snug block">
                    Thuở nhỏ tại động Hoa Lư (Ninh Bình), <strong>Đinh Bộ Lĩnh</strong> chăn trâu bên sông Hoàng Long, lấy bông lau làm cờ tập trận, được dân binh và phụ lão suy tôn làm thủ lĩnh.
                  </span>
                </div>

                <div className="p-2.5 bg-stone-950/90 rounded-lg border border-amber-900/60">
                  <span className="font-bold text-teal-400 block mb-0.5">
                    02. Liên Minh Bố Hải Khẩu
                  </span>
                  <span className="text-stone-300 leading-snug block">
                    Đinh Bộ Lĩnh kết nghĩa cha con với sứ quân <strong>Trần Lãm (Trần Minh Công)</strong> tại Kỳ Bố (Thái Bình), tiếp nhận toàn bộ thủy-lục binh hùng mạnh sau khi Minh Công qua đời.
                  </span>
                </div>

                <div className="p-2.5 bg-stone-950/90 rounded-lg border border-amber-900/60">
                  <span className="font-bold text-red-400 block mb-0.5">
                    03. Thống Nhất Đại Cồ Việt (968)
                  </span>
                  <span className="text-stone-300 leading-snug block">
                    Đánh đâu thắng đó, xưng <strong>Vạn Thắng Vương</strong>. Dùng mưu lược <em>vừa đánh vừa chiêu dụ</em> thu phục 12 sứ quân, lên ngôi Hoàng Đế <strong>Đinh Tiên Hoàng</strong>, lập nước <strong>Đại Cồ Việt</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* SA BÀN BẢN ĐỒ TƯƠNG TÁC 12 SỨ QUÂN */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>SA BÀN ĐỊA ĐỒ CÁT CỨ 12 SỨ QUÂN (TƯƠNG TÁC)</span>
                </div>
                <span className="text-[10px] text-amber-200/80 italic">
                  👉 Chạm vào từng sứ quân trên bản đồ để xem lãnh thổ &amp; tiểu sử
                </span>
              </div>

              {/* Khung bản đồ phong cách Trống Đồng / Địa đồ Giao Châu */}
              <div className="relative w-full aspect-[16/10] bg-[#16110b] rounded-xl border-2 border-amber-700/80 overflow-hidden shadow-inner select-none">
                <div className="absolute inset-0 bg-bronze-pattern opacity-35 pointer-events-none" />

                {/* Hệ thống sông cổ & đường hành quân từ Hoa Lư tới cứ điểm đang chọn */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  {/* Vùng biển Đông Hải phía Đông Nam */}
                  <path
                    d="M 80 52 Q 83 72 86 100 L 100 100 L 100 45 Z"
                    fill="rgba(14, 116, 144, 0.25)"
                  />
                  {/* Sông Hồng (Nhị Hà) từ Phong Châu qua Thăng Long ra Bố Hải Khẩu */}
                  <path
                    d="M 12 18 Q 28 32 42 52 T 64 66 T 84 82"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.45)"
                    strokeWidth="1.6"
                    strokeDasharray="2 1"
                  />
                  {/* Sông Đáy & Sông Hoàng Long chảy về Hoa Lư - Bình Kiều */}
                  <path
                    d="M 34 52 Q 35 66 36 80 T 46 94"
                    fill="none"
                    stroke="rgba(14, 165, 233, 0.4)"
                    strokeWidth="1.2"
                  />
                  {/* Sông Đuống chảy sang Siêu Loại (Bắc Ninh) */}
                  <path
                    d="M 43 51 Q 56 48 72 45"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.38)"
                    strokeWidth="1.1"
                  />

                  {/* Đường mũi tên chiến dịch nối từ Hoa Lư đến cứ điểm đang chọn */}
                  {selectedPin.id !== capitalPin.id && (
                    <line
                      x1={capitalPin.x}
                      y1={capitalPin.y}
                      x2={selectedPin.x}
                      y2={selectedPin.y}
                      stroke="#fbbf24"
                      strokeWidth="0.9"
                      strokeDasharray="1.8 1.2"
                    />
                  )}
                </svg>

                {/* Chú thích góc bản đồ */}
                <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-2 text-[9px] text-stone-300 bg-stone-950/85 px-2 py-1 rounded-lg border border-amber-900/50">
                  <span>👑 Hoa Lư (Kinh đô)</span>
                  <span>·</span>
                  <span>🛡️ Đồng minh quy thuận</span>
                  <span>·</span>
                  <span>⚔️ Cứ điểm sứ quân</span>
                </div>

                {/* 13 Điểm chạm cứ điểm trên bản đồ */}
                {mapPins.map((pin) => {
                  const isSelected = pin.id === selectedPinId;
                  const isCapital = pin.type === 'capital';
                  const isAlly = pin.type === 'ally';

                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => setSelectedPinId(pin.id)}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-transform cursor-pointer ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                      }`}
                      title={`${pin.name} — ${pin.territory} (${pin.modernProvince})`}
                    >
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg border-2 transition ${
                          isCapital
                            ? 'bg-red-600 border-yellow-300 text-white'
                            : isAlly
                            ? 'bg-teal-700 border-teal-300 text-white'
                            : 'bg-stone-900 border-amber-500 text-amber-200'
                        } ${isSelected ? 'ring-2 ring-amber-300 scale-110' : ''}`}
                      >
                        {isCapital ? '👑' : pin.warlord.avatarEmoji || '⚔️'}
                      </div>
                      <span
                        className={`mt-0.5 whitespace-nowrap text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded shadow ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 font-black'
                            : 'bg-stone-950/90 text-stone-300 border border-stone-800'
                        }`}
                      >
                        {pin.territory}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Thanh chọn nhanh 13 Tướng / Cứ Điểm */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5">
                {mapPins.map((pin) => {
                  const active = pin.id === selectedPinId;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => setSelectedPinId(pin.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition cursor-pointer flex items-center gap-1 shrink-0 ${
                        active
                          ? 'bg-amber-500 text-stone-950 border-amber-300 shadow font-black'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-700'
                      }`}
                    >
                      <span>{pin.type === 'capital' ? '👑' : pin.warlord.avatarEmoji}</span>
                      <span>{pin.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Thẻ Hồ Sơ Lãnh Thổ & Tiểu Sử Sứ Quân Đang Chọn */}
              <div className="p-3 bg-stone-950 rounded-xl border border-amber-600/70 shadow-lg flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-amber-500 shrink-0 bg-stone-900">
                  <img
                    src={selectedPin.warlord.portrait3D}
                    alt={selectedPin.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <span className="font-black text-sm text-amber-300">
                      {selectedPin.name}
                    </span>
                    <span className="text-stone-500">·</span>
                    <span className="text-[11px] font-bold text-yellow-400">
                      {selectedPin.title}
                    </span>
                    <span className="text-stone-500">·</span>
                    <span className="text-[10px] text-stone-400">
                      {selectedPin.type === 'capital'
                        ? 'Đại Bản Doanh Khởi Nghĩa'
                        : selectedPin.type === 'ally'
                        ? 'Sứ Quân Liên Minh / Quy Thuận'
                        : `Sứ Quân Cát Cứ (Ải ${selectedPin.warlord.stageNumber})`}
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>
                      Lãnh thổ cổ: <strong>{selectedPin.territory}</strong> — Nay thuộc:{' '}
                      <strong className="text-stone-200">{selectedPin.modernProvince}</strong>
                    </span>
                  </p>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {selectedPin.historicalOutcome}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 pt-0.5 text-[10px] text-stone-400">
                    <span>
                      Thú cưỡi: <strong className="text-stone-200">{selectedPin.warlord.mountName}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Thần binh: <strong className="text-stone-200">{selectedPin.warlord.weaponName}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Tốc độ (SPD): <strong className="text-amber-300 tabular-nums">{selectedPin.warlord.spd}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              MỤC 2 (TIẾP NỐI BÊN DƯỚI): QUY TẮC MATCH-3 & HỆ THỐNG TƯỚNG 3D
             =================================================================== */}
          <div ref={rulesSectionRef} className="space-y-3 pt-2 border-t border-amber-900/60">
            <div className="flex items-center gap-2 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wide">
              <Swords className="w-4 h-4 text-amber-400 shrink-0" />
              <span>MỤC 2: QUY TẮC BÀN CỜ MATCH-3 &amp; HỆ THỐNG TƯỚNG 3D</span>
            </div>

            {/* Điều khiển bàn cờ 8x8 & Thêm Lượt */}
            <div className="flex items-start gap-2.5 p-2.5 bg-amber-950/70 rounded-xl border border-amber-600/70 shadow">
              <span className="text-xl shrink-0">👆</span>
              <div>
                <strong className="text-amber-300 text-xs block">
                  Điều Khiển Bàn Cờ 8x8 &amp; Thêm Lượt Đánh:
                </strong>
                <p className="text-[11px] text-stone-200 mt-0.5 leading-relaxed">
                  <strong>Vuốt ngón tay hoặc chạm 2 ô liền kề để hoán đổi</strong> tạo hàng hoặc cột từ 3 viên giống nhau trở lên. Đặc biệt: <strong>Ghép 4 hoặc 5 viên cùng lúc sẽ nhận ngay Thêm Lượt Đánh</strong> (giữ quyền đi tiếp)!
                </p>
              </div>
            </div>

            {/* Huyết Kiếm */}
            <div className="flex items-start gap-2.5 p-2.5 bg-red-950/70 rounded-xl border border-red-600/70 shadow">
              <span className="text-xl shrink-0">🗡️</span>
              <div>
                <strong className="text-red-400 text-xs block">
                  Huyết Kiếm (Kiếm Đỏ Thẫm) — Bạo Kích &amp; Xuyên Giáp:
                </strong>
                <p className="text-[11px] text-stone-200 mt-0.5 leading-relaxed">
                  Xuất hiện ngẫu nhiên hoặc tạo ra khi ghép từ 4 ô kiếm trở lên. Gây <strong>Sát thương Bạo Kích x2</strong> và <strong>xuyên thẳng 50% Giáp</strong> đối thủ!
                </p>
              </div>
            </div>

            {/* Đầy đủ 6 Loại Ngọc trên Ma Trận 8x8 */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-black text-amber-300 uppercase tracking-wide">
                Bảng Chú Giải Đầy Đủ 6 Loại Ngọc Trên Ma Trận 8x8:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                  <strong className="text-stone-100 block">1. ⚔️ Đoản Kiếm Thép (Công Kích):</strong>
                  <p className="text-stone-400 mt-0.5 leading-snug">
                    Gây sát thương vật lý trực tiếp kèm hoạt ảnh 3D thần binh đặc trưng của từng tướng. Ghép 4+ kiếm tạo ra <strong>Huyết Kiếm</strong> đỏ thẫm.
                  </p>
                </div>

                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                  <strong className="text-rose-400 block">2. ❤️ Trái Tim Đỏ (Sinh Lực HP):</strong>
                  <p className="text-stone-400 mt-0.5 leading-snug">
                    Hồi phục trực tiếp thanh Máu (HP - thanh đỏ) trên đỉnh màn hình đối kháng (+30 HP mỗi viên).
                  </p>
                </div>

                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                  <strong className="text-emerald-400 block">3. 🟩 Bánh Chưng Xanh (Hộ Giáp DEF):</strong>
                  <p className="text-stone-400 mt-0.5 leading-snug">
                    Tăng thanh Giáp xanh lá (+16 Giáp mỗi viên) giúp hấp thụ sát thương trước khi trừ vào Máu.
                  </p>
                </div>

                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                  <strong className="text-sky-400 block">4. ☯️ Ngọc Âm Dương (Nộ Khí Mana):</strong>
                  <p className="text-stone-400 mt-0.5 leading-snug">
                    Tích tụ Nộ khí (+15 Mana mỗi viên) làm đầy thanh xanh lam để khai triển <strong>Tuyệt Kỹ Nộ 3D</strong> hủy diệt.
                  </p>
                </div>

                <div className="p-2.5 bg-stone-950 rounded-xl border border-yellow-700/60">
                  <strong className="text-yellow-400 block">5. 🪙 Thỏi Vàng Hoàng Kim (Quân Lương):</strong>
                  <p className="text-stone-300 mt-0.5 leading-snug">
                    Thu thập tiền vàng (+10 Vàng mỗi viên) cộng dồn vào ngân khố sau trận để sắm thần binh, giáp trụ trong Quân Nhu.
                  </p>
                </div>

                <div className="p-2.5 bg-purple-950/50 rounded-xl border border-purple-500/80 shadow">
                  <strong className="text-purple-300 block">6. 🍇 Túi Gấm Linh Đan Tím (Cực Phẩm Đa Dụng):</strong>
                  <p className="text-stone-200 mt-0.5 leading-snug">
                    Vật phẩm màu tím viền vàng giúp <strong>Hồi kép cả Máu (+18 HP) + Nộ khí (+8 Mana)</strong> và <strong>tăng nhẹ Công lực (+2 ATK cộng dồn ngay trong trận)</strong>!
                  </p>
                </div>
              </div>
            </div>

            {/* Linh thú, Tốc độ SPD & Nút Xin Hàng */}
            <div className="p-2.5 bg-stone-950 rounded-xl border border-amber-900/60 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Tốc Độ (SPD), Linh Thú 3D &amp; Nút Hàng (🏳️):</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                • Tướng có chỉ số <strong>SPD cao hơn sẽ được quyền đánh trước ở Lượt 1</strong> và tăng tỷ lệ bạo kích.
                <br />
                • Khi đang giao chiến, nếu muốn rút lui nhanh về bản đồ để nâng cấp trang bị, bạn có thể nhấn nút <strong>🏳️ Hàng</strong> ngay trên thanh tiêu đề đỉnh màn hình.
              </p>
            </div>
          </div>
        </div>

        {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
        <div className="royal-bottom-dock flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-yellow-300 whitespace-nowrap">
            ⚜️ Loạn 12 Sứ Quân · Sử Việt
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 max-w-[220px] py-2 px-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl border-2 border-yellow-200 uppercase tracking-wider cursor-pointer shadow-lg transition text-center"
          >
            ĐÃ HIỂU &amp; ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
