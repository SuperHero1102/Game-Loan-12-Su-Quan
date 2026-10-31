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
          <div ref={rulesSectionRef} className="space-y-3.5 pt-3 border-t border-amber-900/60">
            <div className="flex items-center justify-between border-b border-amber-800/60 pb-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wide">
                <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                <span>MỤC 2: QUY TẮC BÀN CỜ MATCH-3 &amp; HỆ THỐNG TƯỚNG 3D</span>
              </div>
              <span className="text-[10px] text-yellow-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
                Chuẩn Game 8x8
              </span>
            </div>

            {/* 1. ĐIỀU KHIỂN & CƠ CHẾ ĂN DÃY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-gradient-to-br from-amber-950/75 via-stone-900 to-stone-950 rounded-xl border border-amber-600/70 shadow space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👆</span>
                  <strong className="text-amber-300 text-xs">
                    Thao Tác Vuốt &amp; Chạm Hoán Đổi:
                  </strong>
                </div>
                <p className="text-[11px] text-stone-200 leading-relaxed">
                  • <strong>Vuốt ngón tay (Swipe)</strong> hoặc <strong>chạm lần lượt 2 ô kề nhau</strong> (ngang/dọc) để đổi chỗ tạo thành hàng hoặc cột từ <strong>3 ô cùng loại trở lên</strong>.
                  <br />
                  • <strong>Kích nổ trực tiếp:</strong> Ô có chứa <strong>Bom 💣</strong> hoặc <strong>Sét ⚡</strong> có thể chạm hoặc hoán đổi với bất kỳ ô lân cận nào để <em>phát nổ ngay lập tức</em> mà không cần tạo dãy 3.
                </p>
              </div>

              <div className="p-3 bg-gradient-to-br from-yellow-950/75 via-stone-900 to-stone-950 rounded-xl border border-yellow-500/70 shadow space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <strong className="text-yellow-300 text-xs">
                    Cơ Chế Ăn Dãy 4 - 5 &amp; Thêm Lượt:
                  </strong>
                </div>
                <p className="text-[11px] text-stone-200 leading-relaxed">
                  • <strong>Ăn 3 viên:</strong> Thu hoạch điểm tài nguyên cơ bản.
                  <br />
                  • <strong>Ăn 4 viên:</strong> Nhận ngay <strong>⚡ THÊM LƯỢT ĐÁNH</strong> + Tạo ra <strong>💣 Ngọc Bom Nổ 4 Ô (BOMB_4)</strong>.
                  <br />
                  • <strong>Ăn 5 đến 6 viên trở lên:</strong> Nhận <strong>⚡ THÊM LƯỢT ĐÁNH</strong> + Tạo ra <strong>⚡ Ngọc Sấm Sét 5 Ô (LIGHTNING_5)</strong> quét diện rộng!
                </p>
              </div>
            </div>

            {/* 2. HIỆU ỨNG ĐỒ HỌA SỐNG ĐỘNG TRÊN BÀN CỜ */}
            <div className="p-3 bg-stone-950/90 rounded-xl border border-amber-800/80 shadow space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
                <span className="text-base">✨</span>
                <span>Hệ Thống Hiệu Ứng Bàn Cờ Sống Động (VFX):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-stone-900/90 border border-orange-500/50 flex flex-col items-center text-center">
                  <span className="text-xl mb-0.5 animate-bounce">💥</span>
                  <strong className="text-orange-300">Nổ Hỏa Diệm</strong>
                  <span className="text-stone-400 text-[9px] mt-0.5">Sóng xung kích lửa nổ 3x3 khi kích Bom 4</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-900/90 border border-cyan-500/50 flex flex-col items-center text-center">
                  <span className="text-xl mb-0.5 animate-pulse">⚡</span>
                  <strong className="text-cyan-300">Sét Điện Quang</strong>
                  <span className="text-stone-400 text-[9px] mt-0.5">Tia chớp vàng thiên thanh quét chữ thập khi ăn 5+</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-900/90 border border-red-500/50 flex flex-col items-center text-center">
                  <span className="text-xl mb-0.5">⚔️</span>
                  <strong className="text-red-300">Vệt Kiếm Chém</strong>
                  <span className="text-stone-400 text-[9px] mt-0.5">Vết chém đỏ thẫm sắc lẹm khi ghép Đoản Kiếm</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-900/90 border border-yellow-500/50 flex flex-col items-center text-center">
                  <span className="text-xl mb-0.5">✨</span>
                  <strong className="text-yellow-300">Tinh Thể Tỏa Sáng</strong>
                  <span className="text-stone-400 text-[9px] mt-0.5">Hào quang ngũ hành khi thu hoạch tài nguyên</span>
                </div>
              </div>
            </div>

            {/* 3. BẢNG CHÚ GIẢI CHI TIẾT 9 LOẠI NGỌC & VẬT PHẨM THỰC TẾ (KÈM ICON SVG CHUẨN XÁC) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span>BẢNG CHÚ GIẢI HÌNH ẢNH 9 LOẠI NGỌC &amp; VẬT PHẨM THỰC TẾ:</span>
                </div>
                <span className="text-[9px] text-stone-400 italic">Mô phỏng 100% hình ảnh trong trận</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {/* 1. ĐOẢN KIẾM THÉP */}
                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 flex gap-2.5 items-start hover:border-amber-700/60 transition">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center shadow shrink-0">
                    <svg viewBox="0 0 48 48" className="w-7 h-7 -rotate-45 drop-shadow">
                      <path d="M24 4 L28 10 L27 34 L24 38 L21 34 L20 10 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                      <line x1="24" y1="8" x2="24" y2="34" stroke="#94a3b8" strokeWidth="1" />
                      <rect x="15" y="34" width="18" height="4" rx="1.5" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
                      <rect x="22" y="38" width="4" height="8" rx="1" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                      <circle cx="24" cy="46" r="2.5" fill="#ca8a04" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-stone-100 flex items-center gap-1">
                      <span>1. Đoản Kiếm Thép</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">Công Kích</span>
                    </strong>
                    <p className="text-stone-400 mt-0.5 leading-snug text-[10.5px]">
                      Gây <strong>sát thương vật lý trực tiếp</strong> lên đối thủ dựa theo chỉ số ATK của tướng. Kèm âm thanh va đập vũ khí và tiếng ngựa hý dồn dập.
                    </p>
                  </div>
                </div>

                {/* 2. HUYẾT KIẾM (KIẾM ĐỎ THẪM) */}
                <div className="p-2.5 bg-red-950/50 rounded-xl border border-red-600/80 flex gap-2.5 items-start shadow hover:border-red-500 transition">
                  <div className="relative w-10 h-10 rounded-lg bg-red-950/80 border border-red-500 flex items-center justify-center shadow shadow-red-500/30 shrink-0">
                    <div className="absolute inset-1 rounded-full bg-red-600/30 blur-[2px] animate-pulse" />
                    <svg viewBox="0 0 48 48" className="w-7 h-7 -rotate-45 drop-shadow-[0_0_4px_#ef4444]">
                      <defs>
                        <linearGradient id="bloodGuide" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fca5a5" />
                          <stop offset="30%" stopColor="#dc2626" />
                          <stop offset="100%" stopColor="#7f1d1d" />
                        </linearGradient>
                      </defs>
                      <path d="M24 3 L29 10 L28 34 L24 39 L20 34 L19 10 Z" fill="url(#bloodGuide)" stroke="#f87171" strokeWidth="1.5" />
                      <line x1="24" y1="6" x2="24" y2="34" stroke="#fef08a" strokeWidth="1.2" />
                      <rect x="14" y="34" width="20" height="4.5" rx="1.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                      <rect x="22" y="38.5" width="4" height="8" rx="1" fill="#18181b" stroke="#71717a" strokeWidth="1" />
                      <circle cx="24" cy="47" r="2.5" fill="#facc15" />
                    </svg>
                    <span className="absolute bottom-0 right-0.5 text-[8px] font-black text-yellow-300">x2</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-red-300 flex items-center gap-1">
                      <span>2. Huyết Kiếm Đỏ Thẫm</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-900 text-yellow-300">Bạo Kích x2</span>
                    </strong>
                    <p className="text-stone-300 mt-0.5 leading-snug text-[10.5px]">
                      Sinh ra khi ghép 4+ ô Kiếm hoặc ngẫu nhiên (8%). Gây <strong>Sát thương Bạo Kích x2</strong> và <strong>xuyên thủng 50% Giáp</strong> đối phương!
                    </p>
                  </div>
                </div>

                {/* 3. TRÁI TIM ĐỎ */}
                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 flex gap-2.5 items-start hover:border-rose-700/60 transition">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-rose-900/60 flex items-center justify-center shadow shrink-0">
                    <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
                      <defs>
                        <radialGradient id="heartGuideGrad" cx="35%" cy="35%" r="70%">
                          <stop offset="0%" stopColor="#fda4af" />
                          <stop offset="40%" stopColor="#f43f5e" />
                          <stop offset="100%" stopColor="#9f1239" />
                        </radialGradient>
                      </defs>
                      <path
                        d="M24 40 C14 30 6 22 6 15 C6 9 10 5 16 5 C20 5 23 8 24 10 C25 8 28 5 32 5 C38 5 42 9 42 15 C42 22 34 30 24 40 Z"
                        fill="url(#heartGuideGrad)"
                        stroke="#ffe4e6"
                        strokeWidth="1.2"
                      />
                      <ellipse cx="16" cy="12" rx="4" ry="2.5" fill="#ffffff" opacity="0.6" transform="rotate(-30 16 12)" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-rose-400 flex items-center gap-1">
                      <span>3. Trái Tim Hồng Ngọc</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300">+30 HP/viên</span>
                    </strong>
                    <p className="text-stone-400 mt-0.5 leading-snug text-[10.5px]">
                      Hồi phục trực tiếp thanh <strong>Máu (HP - thanh màu đỏ)</strong> trên đỉnh giao diện chiến đấu. Trần Lãm hồi thêm +30% máu.
                    </p>
                  </div>
                </div>

                {/* 4. BÁNH CHƯNG XANH */}
                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 flex gap-2.5 items-start hover:border-emerald-700/60 transition">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-emerald-900/60 flex items-center justify-center shadow shrink-0">
                    <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
                      <rect x="8" y="8" width="32" height="32" rx="4" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
                      <rect x="11" y="11" width="26" height="26" rx="2" fill="#22c55e" opacity="0.8" />
                      <line x1="8" y1="24" x2="40" y2="24" stroke="#fef08a" strokeWidth="2.5" />
                      <line x1="24" y1="8" x2="24" y2="40" stroke="#fef08a" strokeWidth="2.5" />
                      <line x1="12" y1="12" x2="36" y2="36" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3,2" />
                      <line x1="36" y1="12" x2="12" y2="36" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3,2" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-emerald-400 flex items-center gap-1">
                      <span>4. Bánh Chưng Xanh</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">+16 Giáp/viên</span>
                    </strong>
                    <p className="text-stone-400 mt-0.5 leading-snug text-[10.5px]">
                      Gia tăng thanh <strong>Hộ Giáp (DEF - thanh màu xanh lá)</strong>, tối đa 160 Giáp. Giáp nhận đòn đỡ sát thương trước khi trừ vào Máu.
                    </p>
                  </div>
                </div>

                {/* 5. NGỌC ÂM DƯƠNG */}
                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 flex gap-2.5 items-start hover:border-sky-700/60 transition">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-sky-900/60 flex items-center justify-center shadow shrink-0">
                    <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
                      <circle cx="24" cy="24" r="18" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.2" />
                      <path d="M24 6 A18 18 0 0 0 24 42 A9 9 0 0 1 24 24 A9 9 0 0 0 24 6 Z" fill="#ef4444" />
                      <circle cx="24" cy="15" r="3.5" fill="#3b82f6" />
                      <circle cx="24" cy="33" r="3.5" fill="#ef4444" />
                      <circle cx="24" cy="24" r="18" fill="none" stroke="#dbeafe" strokeWidth="1.2" opacity="0.6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-sky-400 flex items-center gap-1">
                      <span>5. Ngọc Âm Dương Thái Cực</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-950 text-sky-300">+15 Mana/viên</span>
                    </strong>
                    <p className="text-stone-400 mt-0.5 leading-snug text-[10.5px]">
                      Tích lũy Nộ Khí làm đầy thanh <strong>Mana (thanh màu xanh lam)</strong>. Khi đạt 100% nộ, nút <strong>TUYỆT KỸ NỘ 3D</strong> sáng rực để thi triển!
                    </p>
                  </div>
                </div>

                {/* 6. THỎI VÀNG HOÀNG KIM */}
                <div className="p-2.5 bg-stone-950 rounded-xl border border-yellow-800/60 flex gap-2.5 items-start hover:border-yellow-600 transition">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-yellow-700/60 flex items-center justify-center shadow shrink-0">
                    <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
                      <defs>
                        <linearGradient id="goldGuideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="#a16207" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="24" cy="20" rx="14" ry="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                      <path
                        d="M10 20 C10 32 16 38 24 38 C32 38 38 32 38 20 C36 28 30 32 24 32 C18 32 12 28 10 20 Z"
                        fill="url(#goldGuideGrad)"
                        stroke="#ca8a04"
                        strokeWidth="1.2"
                      />
                      <circle cx="24" cy="20" r="5" fill="#fef08a" opacity="0.9" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-yellow-400 flex items-center gap-1">
                      <span>6. Thỏi Vàng Hoàng Kim</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-yellow-950 text-yellow-300">+10 Vàng/viên</span>
                    </strong>
                    <p className="text-stone-300 mt-0.5 leading-snug text-[10.5px]">
                      Thu thập ngân lượng cộng thẳng vào ngân khố sau trận đấu. Dùng để rèn thần binh, đúc khiên giáp trong <strong>Quân Nhu</strong>.
                    </p>
                  </div>
                </div>

                {/* 7. TÚI GẤM LINH ĐAN TÍM */}
                <div className="p-2.5 bg-purple-950/40 rounded-xl border border-purple-600/70 flex gap-2.5 items-start shadow hover:border-purple-400 transition">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-purple-700/60 flex items-center justify-center shadow shrink-0">
                    <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
                      <path
                        d="M24 14 C16 14 12 22 12 30 C12 36 17 40 24 40 C31 40 36 36 36 30 C36 22 32 14 24 14 Z"
                        fill="#8b5cf6"
                        stroke="#a78bfa"
                        strokeWidth="1.2"
                      />
                      <path d="M19 12 L29 12 L31 8 L17 8 Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
                      <ellipse cx="24" cy="14" rx="7" ry="2.5" fill="#facc15" />
                      <circle cx="24" cy="14" r="2.5" fill="#dc2626" />
                      <circle cx="24" cy="27" r="4" fill="#c084fc" opacity="0.6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-purple-300 flex items-center gap-1">
                      <span>7. Túi Gấm Linh Đan Tím</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-900 text-purple-200">Thần Dược Tam Hiệu</span>
                    </strong>
                    <p className="text-stone-200 mt-0.5 leading-snug text-[10.5px]">
                      Cực phẩm hồi phục toàn diện: <strong>+18 HP (Máu)</strong>, <strong>+8 Mana (Nộ)</strong> và <strong>+2 ATK Công lực</strong> cộng dồn vĩnh viễn suốt trận!
                    </p>
                  </div>
                </div>

                {/* 8. NGỌC BOM NỔ 4 Ô */}
                <div className="p-2.5 bg-amber-950/40 rounded-xl border border-orange-500/80 flex gap-2.5 items-start shadow hover:border-orange-400 transition">
                  <div className="relative w-10 h-10 rounded-lg bg-stone-900 border border-orange-500 flex items-center justify-center shadow shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-pulse flex items-center justify-center text-xs shadow">
                      💣
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow ring-1 ring-white">
                      4
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-orange-300 flex items-center gap-1">
                      <span>8. Ngọc Bom Nổ (BOMB_4)</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-950 text-orange-200">Nổ Lan 3x3</span>
                    </strong>
                    <p className="text-stone-300 mt-0.5 leading-snug text-[10.5px]">
                      Tạo ra khi ăn 4 ô cùng loại. Khi kích nổ sẽ <strong>phá hủy vùng 3x3 (9 ô xung quanh)</strong>, thu hoạch toàn bộ tài nguyên và kích hoạt nổ dây chuyền!
                    </p>
                  </div>
                </div>

                {/* 9. NGỌC SẤM SÉT 5 Ô */}
                <div className="p-2.5 bg-cyan-950/40 rounded-xl border border-cyan-400/80 flex gap-2.5 items-start shadow hover:border-cyan-300 transition sm:col-span-2">
                  <div className="relative w-10 h-10 rounded-lg bg-stone-900 border border-cyan-400 flex items-center justify-center shadow shadow-cyan-500/40 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-yellow-300 animate-pulse flex items-center justify-center text-xs shadow">
                      ⚡
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[9px] font-bold text-stone-950 shadow ring-1 ring-white">
                      5+
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-cyan-300 flex items-center gap-1">
                      <span>9. Ngọc Sấm Sét Tối Thượng (LIGHTNING_5)</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-900 text-yellow-300">Quét Chữ Thập &amp; Toàn Bàn</span>
                    </strong>
                    <p className="text-stone-200 mt-0.5 leading-snug text-[10.5px]">
                      Tạo ra khi ăn từ 5 đến 6 ô trở lên. Khi kích hoạt sẽ <strong>phóng tia điện quang quét sạch toàn bộ hàng ngang + hàng dọc</strong> hoặc <strong>quét sạch toàn bộ một loại ngọc trên cả bàn cờ</strong>, mang lại sức mạnh hủy diệt cực lớn!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. HỆ THỐNG 3 THANH CHỈ SỐ, TỐC ĐỘ SPD & QUY ĐỊNH THI ĐẤU */}
            <div className="p-3 bg-stone-950 rounded-xl border border-amber-900/70 space-y-2 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>HỆ THỐNG 3 THANH CHỈ SỐ &amp; LUẬT THI ĐẤU ĐỐI KHÁNG:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px] pt-1">
                <div className="p-2 bg-stone-900/90 rounded-lg border border-red-900/60">
                  <span className="font-bold text-red-400 block mb-0.5">❤️ Thanh Máu (HP)</span>
                  <span className="text-stone-300 leading-snug block">
                    Sinh mệnh của danh tướng. Khi máu về 0 trận đấu kết thúc ngay lập tức. Hồi phục qua Trái Tim và Linh Đan.
                  </span>
                </div>

                <div className="p-2 bg-stone-900/90 rounded-lg border border-emerald-900/60">
                  <span className="font-bold text-emerald-400 block mb-0.5">🛡️ Thanh Giáp (DEF)</span>
                  <span className="text-stone-300 leading-snug block">
                    Giáp trụ phòng thủ (tối đa 160). Hấp thụ sát thương kiếm trước khi chạm vào máu. Hồi phục qua Bánh Chưng Xanh.
                  </span>
                </div>

                <div className="p-2 bg-stone-900/90 rounded-lg border border-sky-900/60">
                  <span className="font-bold text-sky-400 block mb-0.5">⚡ Thanh Nộ (Mana)</span>
                  <span className="text-stone-300 leading-snug block">
                    Năng lượng thần công. Tích lũy qua Ngọc Âm Dương &amp; Linh Đan. Khi đầy 100% sẽ mở khóa nút Tuyệt Kỹ Nộ 3D.
                  </span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-stone-800 space-y-1 text-stone-300 text-[10.5px] leading-relaxed">
                <p>
                  • <strong>Tốc Độ (SPD) Ra Tay Trước:</strong> Tướng nào có chỉ số <strong>SPD cao hơn sẽ được đi trước ở Lượt 1</strong>. Chênh lệch SPD càng lớn thì tỷ lệ ra đòn Bạo Kích (Chí Mạng) càng cao.
                </p>
                <p>
                  • <strong>Đồng Hồ Đếm Giờ Lượt Đánh:</strong> Mỗi lượt đi có đồng hồ giới hạn (10s, 15s, 20s, 30s hoặc Vô hạn). Trong chế độ Đấu Mạng / Bluetooth (P2P), <strong>duy nhất Chủ Phòng (Host)</strong> có quyền cài đặt thời gian thi đấu để đảm bảo tính công bằng.
                </p>
                <p>
                  • <strong>Rút Lui / Xin Hàng (🏳️):</strong> Bạn có thể nhấn nút <strong>🏳️ Hàng</strong> trên thanh tiêu đề góc trên để rút lui chiến thuật nhanh về bản đồ nâng cấp mà không bị treo trận.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Đế Đáy Hoàng Kim Đông Sơn Tràn Viền (Xóa 100% dải đen đáy) */}
        <div className="royal-bottom-dock">
          <div className="w-full max-w-md mx-auto flex items-center justify-between gap-3">
            <span className="text-[10px] sm:text-xs font-bold text-yellow-300 truncate flex-1 text-center sm:text-left">
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
    </div>
  );
};
