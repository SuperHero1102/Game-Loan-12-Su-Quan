/**
 * Loạn 12 Sứ Quân — Type Definitions
 */

export type GameScreen =
  | 'TITLE'
  | 'WORLD_MAP'
  | 'STAGE_SELECT'
  | 'ROADMAP'
  | 'BATTLE'
  | 'PVE_SELECT'
  | 'PVP_LOBBY';

export type GameMode =
  | 'CAMPAIGN'
  | 'PVE'
  | 'PVE_CUSTOM'
  | 'PVP_LOCAL'
  | 'PVP_HOTSEAT'
  | 'PVP_P2P';

export type PveDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'HELL';

export type TileType =
  | 'SWORD'
  | 'HEART'
  | 'GOLD'
  | 'CHUNG_CAKE'
  | 'YIN_YANG'
  | 'ELIXIR';

export type SpecialTileType = 'NORMAL' | 'BOMB_4' | 'LIGHTNING_5';

export interface Tile {
  id: string;
  type: TileType;
  special: SpecialTileType;
  row: number;
  col: number;
  isBloodSword?: boolean;
  isNew?: boolean;
}

export type WeaponVisualType =
  | 'imperial_sword'
  | 'bronze_spear'
  | 'command_sword'
  | 'great_saber'
  | 'twin_halberds'
  | 'iron_mace'
  | 'lance_shield'
  | 'battle_axe'
  | 'dragon_sword'
  | 'twin_blades'
  | 'zhanmadao'
  | 'steel_pike'
  | 'divine_bow';

export interface Warlord {
  id: string;
  name: string;
  title: string;
  territory: string;
  shortTerritory: string;
  stageNumber: number;
  baseHp: number;
  baseArmor: number;
  baseAtk: number;
  baseDef: number;
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
  portrait3D: string;
  sceneBackdrop: string;
  crestType: string;
  avatarColor: string;
  avatarEmoji: string;
  characterVisual: string;
  quote: string;
  skillName: string;
  skillDescription: string;
  skillCost: number;
  aiAggressiveness?: number;
}

export interface FighterState {
  id: string;
  name: string;
  title: string;
  avatarEmoji: string;
  avatarColor: string;
  characterVisual: string;
  hp: number;
  maxHp: number;
  armor: number;
  maxArmor: number;
  mana: number;
  maxMana: number;
  atk: number;
  def: number;
  spd: number;
  role: string;
  mountName: string;
  weaponName: string;
  weaponVisual: WeaponVisualType;
  passiveName: string;
  passiveDescription: string;
  portrait3D: string;
  skillName: string;
  skillDescription: string;
  skillCost: number;
  isPlayer: boolean;
  status:
    | 'idle'
    | 'attacking'
    | 'hit'
    | 'hurt'
    | 'heal'
    | 'shield'
    | 'mana'
    | 'skill'
    | 'victory'
    | 'defeat';
  goldEarnedThisMatch: number;
}

export interface FloatingText {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'armor' | 'skill' | 'extra_turn' | 'crit' | 'gold';
  target: 'p1' | 'p2';
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

export interface InventoryItem {
  itemId: string;
  count: number;
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
  inventory: InventoryItem[];
  currentNodeId: string;
  currentStageNumber: number;
  defeatedWarlords: string[];
  lives: number;
  hasCompletedCampaign: boolean;
  coronationViewed: boolean;
  prestigeLevel: number;
  unlockedEmperorSkin: boolean;
}

export interface MapNode {
  id: string;
  name: string;
  shortName: string;
  stageNumber: number;
  warlordId: string;
  x: number;
  y: number;
  neighbors: string[];
  isCapital?: boolean;
  description: string;
  goldReward: number;
}

export interface WorldVillageEvent {
  id: string;
  name: string;
  type:
    | 'VILLAGE'
    | 'BLACKSMITH'
    | 'TEMPLE'
    | 'MARKET'
    | 'WATCHTOWER'
    | 'BANDIT_CAMP'
    | 'SUPPLY_CAMP';
  x: number;
  y: number;
  description: string;
  rewardGold: number;
  rewardHpBonus: number;
  rewardAtkBonus: number;
  visited: boolean;
}
