/**
 * Loạn 12 Sứ Quân — Bản Đồ Chiến Dịch Địa Hình 3D & Hệ Thống Làng Mạc Doanh Trại Ngẫu Nhiên
 * Sắp xếp hợp lý, thoáng đãng cho 13 thành lũy (Hoa Lư + 12 Sứ Quân) cùng làng mạc ngẫu nhiên.
 */

import { MapNode, WorldVillageEvent } from '../types/game';

export const CAMPAIGN_NODES: MapNode[] = [
  {
    id: 'hoa_lu',
    name: 'Đại Bản Doanh Hoa Lư',
    shortName: 'Hoa Lư',
    stageNumber: 0,
    warlordId: 'dinh_bo_linh',
    x: 28.5,
    y: 84.5,
    neighbors: ['binh_kieu'],
    isCapital: true,
    description: 'Kinh đô khởi nghĩa Hoa Lư (Ninh Bình) của Vạn Thắng Vương Đinh Bộ Lĩnh. Điểm xuất phát của đội quân Cờ Lau dẹp loạn mười hai sứ quân.',
    goldReward: 0,
  },
  {
    id: 'binh_kieu',
    name: 'Ải 1: Bình Kiều',
    shortName: 'Ải 1: Bình Kiều',
    stageNumber: 1,
    warlordId: 'ngo_xuong_xi',
    x: 50.5,
    y: 79.5,
    neighbors: ['hoa_lu', 'bo_hai_khau'],
    description: 'Thành lũy Bình Kiều (Triệu Sơn, Thanh Hóa) án ngữ chân núi, do Sứ quân Ngô Xương Xí tôn thất nhà Ngô trấn thủ.',
    goldReward: 200,
  },
  {
    id: 'bo_hai_khau',
    name: 'Ải 2: Bố Hải Khẩu',
    shortName: 'Ải 2: Bố Hải Khẩu',
    stageNumber: 2,
    warlordId: 'tran_lam',
    x: 77.5,
    y: 81.8,
    neighbors: ['binh_kieu', 'do_dong'],
    description: 'Sơn đảo ven thủy Bố Hải Khẩu (Kỳ Bố, Thái Bình) do Trần Lãm (Trần Minh Công) hùng cứ với chiến thuyền và thủy binh tinh nhuệ.',
    goldReward: 220,
  },
  {
    id: 'do_dong',
    name: 'Ải 3: Đỗ Động Giang',
    shortName: 'Ải 3: Đỗ Động',
    stageNumber: 3,
    warlordId: 'do_canh_thac',
    x: 20.5,
    y: 73.8,
    neighbors: ['bo_hai_khau', 'dang_chau'],
    description: 'Pháo đài kiên cố bên sông Đỗ Động (Thanh Oai, Hà Nội) do Đỗ Cảnh Thạc cưỡi hắc mã vung đại đao trấn giữ.',
    goldReward: 240,
  },
  {
    id: 'dang_chau',
    name: 'Ải 4: Đằng Châu',
    shortName: 'Ải 4: Đằng Châu',
    stageNumber: 4,
    warlordId: 'pham_bach_ho',
    x: 42.5,
    y: 67.2,
    neighbors: ['do_dong', 'tay_phu_liet'],
    description: 'Đại thành Đằng Châu (Kim Động, Hưng Yên) của Phạm Bạch Hổ - hổ tướng cưỡi Bạch Hổ khổng lồ xông pha trận mạc.',
    goldReward: 260,
  },
  {
    id: 'tay_phu_liet',
    name: 'Ải 5: Tây Phù Liệt',
    shortName: 'Ải 5: Phù Liệt',
    stageNumber: 5,
    warlordId: 'nguyen_sieu',
    x: 72.0,
    y: 62.8,
    neighbors: ['dang_chau', 'te_giang'],
    description: 'Hẻm núi hiểm trở Tây Phù Liệt (Thanh Trì, Hà Nội) của Nguyễn Siêu cùng thiết tượng xa và chiến chùy dũng mãnh.',
    goldReward: 280,
  },
  {
    id: 'te_giang',
    name: 'Ải 6: Tế Giang',
    shortName: 'Ải 6: Tế Giang',
    stageNumber: 6,
    warlordId: 'lu_duong',
    x: 66.0,
    y: 52.0,
    neighbors: ['tay_phu_liet', 'sieu_loai'],
    description: 'Đèo dốc quanh co Tế Giang (Văn Giang, Hưng Yên) của Lữ Đường (Lữ Tá Công) với khiên gai đồng và chiến mã thiết giáp.',
    goldReward: 300,
  },
  {
    id: 'sieu_loai',
    name: 'Ải 7: Siêu Loại',
    shortName: 'Ải 7: Siêu Loại',
    stageNumber: 7,
    warlordId: 'ly_khue',
    x: 29.5,
    y: 50.0,
    neighbors: ['te_giang', 'duong_lam'],
    description: 'Đại doanh trên sơn đảo tách biệt Siêu Loại (Thuận Thành, Bắc Ninh) do Lý Khuê hùng cứ giữa ngút ngàn rừng núi.',
    goldReward: 320,
  },
  {
    id: 'duong_lam',
    name: 'Ải 8: Đường Lâm',
    shortName: 'Ải 8: Đường Lâm',
    stageNumber: 8,
    warlordId: 'ngo_nhat_khanh',
    x: 32.5,
    y: 33.2,
    neighbors: ['sieu_loai', 'hoi_ho'],
    description: 'Thành cổ đá ong Đường Lâm (Sơn Tây, Hà Nội) của Ngô Nhật Khánh - tôn thất vương giả trấn giữ cầu đá vượt ải.',
    goldReward: 340,
  },
  {
    id: 'hoi_ho',
    name: 'Ải 9: Hồi Hồ',
    shortName: 'Ải 9: Hồi Hồ',
    stageNumber: 9,
    warlordId: 'kieu_thuan',
    x: 88.5,
    y: 29.8,
    neighbors: ['duong_lam', 'tien_du'],
    description: 'Sơn trại mây mù Hồi Hồ (Cẩm Khê, Phú Thọ) của Kiều Thuận (Kiều Lệnh Công) cưỡi tuấn mã thi triển song kích tuyệt luân.',
    goldReward: 360,
  },
  {
    id: 'tien_du',
    name: 'Ải 10: Tiên Du',
    shortName: 'Ải 10: Tiên Du',
    stageNumber: 10,
    warlordId: 'nguyen_thu_tiep',
    x: 37.0,
    y: 20.3,
    neighbors: ['hoi_ho', 'tam_dai'],
    description: 'Đài lũy Tiên Du (Bắc Ninh) trên lưng chừng trời của Nguyễn Thủ Tiệp (Vũ Ninh Vương) chém sắt như chém chuối.',
    goldReward: 380,
  },
  {
    id: 'tam_dai',
    name: 'Ải 11: Tam Đái',
    shortName: 'Ải 11: Tam Đái',
    stageNumber: 11,
    warlordId: 'nguyen_khoan',
    x: 55.0,
    y: 13.5,
    neighbors: ['tien_du', 'phong_chau'],
    description: 'Thành lũy tầng mây Tam Đái (Yên Lạc, Vĩnh Phúc) của Nguyễn Khoan (Nguyễn Thái Bình) với đại trận kỳ binh dũng mãnh.',
    goldReward: 400,
  },
  {
    id: 'phong_chau',
    name: 'Ải 12: Phong Châu',
    shortName: 'Ải 12: Phong Châu',
    stageNumber: 12,
    warlordId: 'kieu_cong_han',
    x: 43.0,
    y: 6.8,
    neighbors: ['tam_dai'],
    description: 'Cửa ải tối cao Phong Châu (Bạch Hạc, Phú Thọ) ngự trên đỉnh sơn đảo của Kiều Công Hãn với thần tiễn bách phát bách trúng.',
    goldReward: 500,
  },
];

// Danh sách mẫu Làng Mạc, Trạm Lương Thảo & Trại Sơn Tặc sinh ngẫu nhiên trên bản đồ 3D
const VILLAGE_TEMPLATES = [
  {
    name: 'Làng Cổ Hoa Lư',
    type: 'VILLAGE' as const,
    description: 'Bà con dân làng dâng bánh chưng xanh và lương thảo tiếp tế nghĩa quân Cờ Lau.',
    rewardGold: 95,
    rewardHpBonus: 30,
    rewardAtkBonus: 0,
  },
  {
    name: 'Trạm Lương Thảo Sông Đáy',
    type: 'SUPPLY_CAMP' as const,
    description: 'Thu giữ kho lương thảo và ngựa chiến bên bến đò cổ, gia tăng sức mạnh toàn quân.',
    rewardGold: 130,
    rewardHpBonus: 20,
    rewardAtkBonus: 2,
  },
  {
    name: 'Lò Rèn Binh Khí Cổ Loa',
    type: 'WATCHTOWER' as const,
    description: 'Các nghệ nhân đúc đồng rèn thêm mũi tên đồng và mài sắc đại đao cho đại quân.',
    rewardGold: 80,
    rewardHpBonus: 0,
    rewardAtkBonus: 4,
  },
  {
    name: 'Trại Sơn Tặc Rừng Mơ',
    type: 'BANDIT_CAMP' as const,
    description: 'Tiêu diệt toán thảo khấu quấy nhiễu dân lành, thu hồi chiến lợi phẩm vàng bạc.',
    rewardGold: 165,
    rewardHpBonus: 15,
    rewardAtkBonus: 3,
  },
  {
    name: 'Bến Thuyền Dân Chài Hải Khẩu',
    type: 'VILLAGE' as const,
    description: 'Ngư dân vùng biển chỉ dẫn đường thủy hiểm yếu và tặng thảo dược quý.',
    rewardGold: 110,
    rewardHpBonus: 45,
    rewardAtkBonus: 1,
  },
  {
    name: 'Đồn Tiền Tiêu Tam Đảo',
    type: 'WATCHTOWER' as const,
    description: 'Chiếm lĩnh vọng gác trên sườn núi, thu thập giáp đồng và cung nỏ.',
    rewardGold: 120,
    rewardHpBonus: 25,
    rewardAtkBonus: 3,
  },
];

// Vị trí trạm nghỉ / làng bản ven con đường mòn leo núi khớp với các lều trại vẽ sẵn trên bản đồ
const CANDIDATE_COORDS = [
  { x: 60.0, y: 90.8 }, // Đảo bay phía dưới cùng
  { x: 36.5, y: 73.8 }, // Trại chân núi
  { x: 63.5, y: 70.2 }, // Trại sườn đông
  { x: 56.0, y: 65.2 }, // Trại bên sườn đèo
  { x: 91.0, y: 61.8 }, // Đảo nhỏ phía đông
  { x: 73.5, y: 57.8 }, // Đồn tiền tiêu đèo mây
  { x: 11.0, y: 46.8 }, // Đảo bay phía tây
  { x: 28.0, y: 42.2 }, // Đảo bay phía tây bắc
  { x: 60.0, y: 39.0 }, // Cầu đá giữa núi
  { x: 50.5, y: 31.0 }, // Trại lưng chừng núi
  { x: 74.0, y: 30.8 }, // Trại đảo bay đông bắc
  { x: 27.5, y: 25.2 }, // Trại bên thác nước
  { x: 51.5, y: 19.0 }, // Đồn vọng gác tầng thượng
  { x: 18.5, y: 13.8 }, // Trạm lương thảo bắc sơn
  { x: 34.0, y: 11.8 }, // Đồn tiền tiêu đỉnh núi
  { x: 70.5, y: 13.2 }, // Trại cánh cung phía đông
];

export const generateRandomVillages = (seed = Date.now()): WorldVillageEvent[] => {
  const shuffledCoords = [...CANDIDATE_COORDS].sort(() => Math.sin(seed++) - 0.5);
  const shuffledTemplates = [...VILLAGE_TEMPLATES].sort(() => Math.cos(seed++) - 0.5);

  return shuffledTemplates.slice(0, 5).map((tpl, idx) => ({
    id: `village_${idx}_${seed}`,
    name: tpl.name,
    type: tpl.type,
    x: shuffledCoords[idx].x,
    y: shuffledCoords[idx].y,
    description: tpl.description,
    rewardGold: tpl.rewardGold,
    rewardHpBonus: tpl.rewardHpBonus,
    rewardAtkBonus: tpl.rewardAtkBonus,
    visited: false,
  }));
};
