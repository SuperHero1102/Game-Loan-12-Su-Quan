/**
 * Loạn 12 Sứ Quân — Type Definitions
 */

export type TileType = 
  | 'SWORD'      // Đoản kiếm (bạc hoặc Huyết Kiếm đỏ thẫm)
  | 'HEART'      // Trái tim - Hồi phục sinh lực (Máu Đỏ)
  | 'GOLD'       // Thỏi vàng - Tích lũy tiền vàng
  | 'CHUNG_CAKE' // Bánh chưng xanh - Tăng giáp phòng ngự (Giáp Xanh Lá)
  | 'YIN_YANG'   // Ngọc Thái Cực / Âm Dương - Tích nộ khí (Mana Xanh Lam)
  | 'ELIXIR';    // Tiên dược - Tăng năng lượng / dược liệu

export type SpecialTileType = 'NORMAL' | 'BOMB_4' | 'LIGHTNING_5' | 'CROSS_BURST';

export type WeaponVisualType =
  | 'imperial_sword'    // Kiếm lệnh Hoàng Đế (Đinh Bộ Lĩnh)
  | 'bronze_spear'      // Trường thương đồng thau (Ngô Xương Xí)
  | 'great_saber'       // Đại trảm đao (Đỗ Cảnh Thạc)
  | 'iron_mace'         // Thiết chùy phá thành (Nguyễn Siêu)
  | 'divine_bow'        // Thần cung tiễn đồng (Kiều Công Hãn)
  | 'steel_pike'        // Trường giáo đầu thép (Nguyễn Khoan)
  | 'twin_blades'       // Song đoản kiếm (Kiều Thuận)
  | 'battle_axe'        // Rìu chiến song diện (Lý Khuê)
  | 'dragon_sword'      // Kim kiếm khảm vân rồng (Ngô Nhật Khánh)
  | 'twin_halberds'     // Song kích song hành (Phạm Bạch Hổ)
  | 'command_sword'     // Bảo kiếm chỉ huy & Soái kỳ (Trần Lãm)
  | 'lance_shield'      // Thiết mâu & Khiên gai (Lữ Đường)
  | 'zhanmadao';        // Đại đao trảm mã (Nguyễn Thủ Tiệp)

export interface Tile {
  id: string;
  type: TileType;
  special: SpecialTileType;
  row: number;
  col: number;
  isBloodSword?: boolean; // Huyết Kiếm Đỏ Thẫm (Sát thương x2 & Xuyên 50% giáp)
  isMatched?: boolean;
  isNew?: boolean;
}

export interface Warlord {
  id: string;
  name: string;
  title: string;
  territory: string;
  shortTerritory?: string; // Tên ngắn trên cờ bản đồ 3D (VD: Tam Đái, Đường Lâm)
  stageNumber: number; // Thứ tự ải từ 1 đến 12
  baseHp: number;
  baseArmor: number;
  baseAtk: number;
  baseDef: number;
  // Bảng thuộc tính chuẩn 13 vị tướng (Thang điểm 100)
  role: string;
  hpRating: number;
  atkRating: number;
  defRating: number;
  spd: number;
  mountName: string;
  weaponName: string;
  weaponVisual: WeaponVisualType;
  passiveName: string;
  passiveDescription: string;
  portrait3D?: string; // Ảnh 3D chân thực từ /assets/aistudio/...
  sceneBackdrop: string;
  crestType?: 'imperial_crown' | 'general_helm' | 'royal_cap' | 'tiger_helm' | 'seal';
  avatarColor: string;
  avatarEmoji: string;
  characterVisual: 'hero' | 'warlord_bearded' | 'warlord_fierce' | 'warlord_masked' | 'warlord_elder';
  quote: string;
  skillName: string;
  skillDescription: string;
  skillCost: number; // Mana cost (100)
  aiAggressiveness: number; // 0 to 1
}

export interface FighterState {
  id: string;
  name: string;
  title: string;
  avatarEmoji: string;
  avatarColor: string;
  characterVisual: 'hero' | 'warlord_bearded' | 'warlord_fierce' | 'warlord_masked' | 'warlord_elder';
  hp: number;         // 1. MÁU ĐỎ
  maxHp: number;
  armor: number;      // 2. GIÁP XANH LÁ (BÁNH CHƯNG)
  maxArmor: number;
  mana: number;       // 3. KHÍ LỰC / MANA XANH LAM (ÂM DƯƠNG)
  maxMana: number;
  atk: number;
  def: number;
  spd: number;        // 4. TỐC ĐỘ (Quyết định lượt đầu & bạo kích)
  role: string;
  mountName: string;
  weaponName: string;
  weaponVisual: WeaponVisualType;
  passiveName: string;
  passiveDescription: string;
  portrait3D?: string;
  skillName: string;
  skillDescription: string;
  skillCost: number;
  isPlayer: boolean;
  status: 'idle' | 'attacking' | 'hurt' | 'heal' | 'shield' | 'mana' | 'skill' | 'victory' | 'defeat';
  goldEarnedThisMatch: number;
}

export interface FloatingText {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'armor' | 'gold' | 'crit' | 'extra_turn' | 'skill';
  target: 'p1' | 'p2';
}

export type GameScreen = 
  | 'TITLE'
  | 'WORLD_MAP'
  | 'STAGE_SELECT' // Danh sách 12 ải trực quan
  | 'ROADMAP'      // Phân đoạn hành quân 3D trước trận đấu
  | 'PVE_SELECT'   // Đấu với máy chọn 4 cấp độ
  | 'BATTLE'
  | 'PVP_LOBBY'
  | 'SHOP'
  | 'HERO_INFO';

export type GameMode = 
  | 'CAMPAIGN'
  | 'PVE_CUSTOM'
  | 'PVP_HOTSEAT'
  | 'PVP_P2P';

export type PveDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'HELL';

export interface MapNode {
  id: string;
  name: string;
  shortName?: string;
  stageNumber?: number;
  warlordId: string;
  x: number;
  y: number;
  neighbors: string[];
  isCapital?: boolean;
  description: string;
  goldReward?: number;
}

export interface WorldVillageEvent {
  id: string;
  name: string;
  type: 'VILLAGE' | 'SUPPLY_CAMP' | 'WATCHTOWER' | 'BANDIT_CAMP';
  x: number;
  y: number;
  description: string;
  rewardGold: number;
  rewardHpBonus: number;
  rewardAtkBonus: number;
  visited: boolean;
}

export interface Item {
  id: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'ELIXIR';
  cost: number;
  bonusAtk: number;
  bonusDef: number;
  bonusHp: number;
  description: string;
  iconName: string;
}

export interface PlayerProfile {
  name: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  gold: number;
  baseHp: number;
  baseArmor: number;
  baseAtk: number;
  baseDef: number;
  equippedWeaponId: string | null;
  equippedArmorId: string | null;
  inventory: { itemId: string; count: number }[];
  currentNodeId: string;
  currentStageNumber: number; // Ải cao nhất đã mở
  defeatedWarlords: string[];
  lives: number;
}
