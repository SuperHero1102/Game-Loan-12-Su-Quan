/**
 * Loạn 12 Sứ Quân — Storage & Offline Persistence
 */

import { PlayerProfile } from '../types/game';

const STORAGE_KEY = 'loan_12_su_quan_save_v1';
const SETTINGS_KEY = 'loan_12_su_quan_settings_v1';

export interface GameSettings {
  isMuted: boolean;
  enableVirtualDpad: boolean;
  showHints: boolean;
  turnTimerEnabled: boolean; // Bật/tắt đếm ngược thời gian mỗi lượt chơi
  turnTimeLimit: number;      // Thời gian cho mỗi lượt (mặc định 20 giây)
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Đinh Bộ Lĩnh',
  level: 1,
  exp: 0,
  expToNextLevel: 100,
  gold: 250,
  baseHp: 650,
  baseArmor: 20,
  baseAtk: 28,
  baseDef: 14,
  equippedWeaponId: null,
  equippedArmorId: null,
  inventory: [],
  currentNodeId: 'hoa_lu',
  currentStageNumber: 1,
  defeatedWarlords: [],
  lives: 3,
};

const DEFAULT_SETTINGS: GameSettings = {
  isMuted: false,
  enableVirtualDpad: false,
  showHints: true,
  turnTimerEnabled: true, // Mặc định bật đếm ngược để trận đấu kịch tính
  turnTimeLimit: 20,       // 20 giây mỗi lượt
};

export const loadProfile = (): PlayerProfile => {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: PlayerProfile) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save game state', e);
  }
};

export const loadSettings = (): GameSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: GameSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const resetGameProgress = (): PlayerProfile => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PROFILE;
};
