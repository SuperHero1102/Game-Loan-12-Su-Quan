/**
 * Loạn 12 Sứ Quân — Mobile Game Remaster
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { GameScreen, GameMode, Warlord, PlayerProfile, Item, PveDifficulty, WorldVillageEvent } from './types/game';
import { DINH_BO_LINH, WARLORDS, ALL_CHARACTERS } from './data/warlords';
import { CAMPAIGN_NODES } from './data/campaignMap';
import { SHOP_ITEMS } from './data/items';
import { loadProfile, saveProfile, loadSettings, saveSettings, resetGameProgress } from './services/storage';
import { soundEngine } from './services/audio';

import { TitleScreen } from './components/title/TitleScreen';
import { WorldMap } from './components/worldmap/WorldMap';
import { StageSelectModal } from './components/campaign/StageSelectModal';
import { MarchingRoadmap2D } from './components/campaign/MarchingRoadmap2D';
import { PvEModeSelect } from './components/pve/PvEModeSelect';
import { BattleScreen } from './components/battle/BattleScreen';
import { PvPLobby } from './components/pvp/PvPLobby';
import { ShopModal } from './components/shop/ShopModal';
import { HeroInfoModal } from './components/character/HeroInfoModal';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');

  // Player Profile & Progression State
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [settings, setSettings] = useState(() => loadSettings());

  // Active Battle Setup State
  const [p1Warlord, setP1Warlord] = useState<Warlord>(DINH_BO_LINH);
  const [p2Warlord, setP2Warlord] = useState<Warlord>(WARLORDS[0]);
  const [activeStageNumber, setActiveStageNumber] = useState<number>(1);

  // Modals
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isHeroInfoOpen, setIsHeroInfoOpen] = useState(false);

  // PWA Install Prompt Support & Offline State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
      setDeferredPrompt(null);
    }
  };

  // Sync profile to localStorage on change
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Sync settings to localStorage on change
  useEffect(() => {
    saveSettings(settings);
    soundEngine.isMuted = settings.isMuted;
  }, [settings]);

  const toggleMute = () => {
    const newMuted = soundEngine.toggleMute();
    setSettings((prev) => ({ ...prev, isMuted: newMuted }));
  };

  const toggleTurnTimer = () => {
    setSettings((prev) => {
      const nextTimer = !prev.turnTimerEnabled;
      return { ...prev, turnTimerEnabled: nextTimer };
    });
  };

  const handleUpdateTurnTimer = (enabled: boolean, timeLimit: number) => {
    setSettings((prev) => ({
      ...prev,
      turnTimerEnabled: enabled,
      turnTimeLimit: timeLimit > 0 ? timeLimit : prev.turnTimeLimit || 20,
    }));
  };

  // Calculate Bonus Stats from Equipment
  const equippedWeapon = SHOP_ITEMS.find((i) => i.id === profile.equippedWeaponId);
  const equippedArmor = SHOP_ITEMS.find((i) => i.id === profile.equippedArmorId);

  const bonusAtk = (equippedWeapon?.bonusAtk || 0) + (equippedArmor?.bonusAtk || 0);
  const bonusDef = (equippedWeapon?.bonusDef || 0) + (equippedArmor?.bonusDef || 0);
  const bonusHp = (equippedWeapon?.bonusHp || 0) + (equippedArmor?.bonusHp || 0);

  // 1. Campaign Battle from 3D World Map (Vào phân đoạn hành quân trước trận)
  const handleEnterCampaignBattle = (warlordId: string) => {
    const enemy = WARLORDS.find((w) => w.id === warlordId) || WARLORDS[0];
    setP1Warlord(DINH_BO_LINH);
    setP2Warlord(enemy);
    setActiveStageNumber(enemy.stageNumber || 1);
    setGameMode('CAMPAIGN');
    setScreen('ROADMAP');
  };

  // 1B. Claim Random Village / Outpost Event on 3D World Map
  const handleClaimVillageReward = (gold: number, hpBonus: number, atkBonus: number) => {
    soundEngine.playGold();
    setProfile((prev) => ({
      ...prev,
      gold: prev.gold + gold,
      baseHp: prev.baseHp + hpBonus,
      baseAtk: prev.baseAtk + atkBonus,
    }));
  };

  // 2. Battle from 12 Stages Modal
  const handleSelectStage = (warlord: Warlord, stageNumber: number) => {
    setP1Warlord(DINH_BO_LINH);
    setP2Warlord(warlord);
    setActiveStageNumber(stageNumber);
    setGameMode('CAMPAIGN');
    setScreen('ROADMAP');
  };

  // 3. Battle from PvE Mode (Custom Difficulty)
  const handleStartPvEBattle = (warlord: Warlord) => {
    setP1Warlord(DINH_BO_LINH);
    setP2Warlord(warlord);
    setGameMode('PVE_CUSTOM');
    setScreen('BATTLE');
  };

  // 4. PvP Hotseat Battle Trigger
  const handleStartHotseat = (p1: Warlord, p2: Warlord) => {
    setP1Warlord(p1);
    setP2Warlord(p2);
    setGameMode('PVP_HOTSEAT');
    setScreen('BATTLE');
  };

  // 5. PvP 2-Device P2P Battle Trigger
  const handleStartP2P = (myWarlord: Warlord) => {
    setP1Warlord(myWarlord);
    const opponent = ALL_CHARACTERS.find((c) => c.id !== myWarlord.id) || WARLORDS[1];
    setP2Warlord(opponent);
    setGameMode('PVP_P2P');
    setScreen('BATTLE');
  };

  // Victory Resolution & Seamless Next Stage Transition
  const handleBattleVictory = (goldEarned: number, defeatedWarlordId: string, nextStageNumber?: number) => {
    setProfile((prev) => {
      const newGold = prev.gold + goldEarned;
      const newExp = prev.exp + 100;
      let newLevel = prev.level;
      let newExpToNext = prev.expToNextLevel;
      let newBaseHp = prev.baseHp;
      let newBaseAtk = prev.baseAtk;
      let newBaseDef = prev.baseDef;

      if (newExp >= newExpToNext) {
        newLevel++;
        newExpToNext = Math.round(newExpToNext * 1.5);
        newBaseHp += 50;
        newBaseAtk += 4;
        newBaseDef += 2;
      }

      const defeatedSet = new Set([...prev.defeatedWarlords, defeatedWarlordId]);
      const conqueredStage =
        WARLORDS.find((w) => w.id === defeatedWarlordId)?.stageNumber || activeStageNumber;
      const nextUnlocked =
        gameMode === 'CAMPAIGN'
          ? Math.min(12, Math.max(prev.currentStageNumber || 1, conqueredStage + 1))
          : prev.currentStageNumber || 1;
      const nextMapNode = CAMPAIGN_NODES.find((n) => n.stageNumber === nextUnlocked);

      return {
        ...prev,
        gold: newGold,
        exp: newExp,
        level: newLevel,
        expToNextLevel: newExpToNext,
        baseHp: newBaseHp,
        baseAtk: newBaseAtk,
        baseDef: newBaseDef,
        defeatedWarlords: Array.from(defeatedSet),
        currentStageNumber: nextUnlocked,
        currentNodeId:
          gameMode === 'CAMPAIGN' && nextMapNode ? nextMapNode.id : prev.currentNodeId,
      };
    });

    if (nextStageNumber && nextStageNumber <= 12) {
      const nextWarlord = WARLORDS.find((w) => w.stageNumber === nextStageNumber);
      if (nextWarlord) {
        setP1Warlord(DINH_BO_LINH);
        setP2Warlord(nextWarlord);
        setActiveStageNumber(nextStageNumber);
        setGameMode('CAMPAIGN');
        setScreen('ROADMAP');
        return;
      }
    }

    if (gameMode === 'CAMPAIGN') {
      setScreen('WORLD_MAP');
    } else if (gameMode === 'PVE_CUSTOM') {
      setScreen('PVE_SELECT');
    } else {
      setScreen('PVP_LOBBY');
    }
  };

  // Defeat Resolution
  const handleBattleDefeat = () => {
    if (gameMode === 'CAMPAIGN') {
      setProfile((prev) => ({
        ...prev,
        lives: Math.max(1, prev.lives - 1),
      }));
      setScreen('WORLD_MAP');
    } else if (gameMode === 'PVE_CUSTOM') {
      setScreen('PVE_SELECT');
    } else {
      setScreen('PVP_LOBBY');
    }
  };

  // Shop Buy & Equip Handlers
  const handleBuyItem = (item: Item) => {
    if (profile.gold < item.cost) return;

    setProfile((prev) => {
      const newGold = prev.gold - item.cost;
      if (item.type === 'ELIXIR') {
        return {
          ...prev,
          gold: newGold,
          baseHp: prev.baseHp + item.bonusHp,
          baseAtk: prev.baseAtk + item.bonusAtk,
          baseDef: prev.baseDef + item.bonusDef,
        };
      }

      const existing = prev.inventory.find((i) => i.itemId === item.id);
      const newInv = existing
        ? prev.inventory.map((i) => (i.itemId === item.id ? { ...i, count: i.count + 1 } : i))
        : [...prev.inventory, { itemId: item.id, count: 1 }];

      let equippedWeapon = prev.equippedWeaponId;
      let equippedArmor = prev.equippedArmorId;

      if (item.type === 'WEAPON' && !equippedWeapon) equippedWeapon = item.id;
      if (item.type === 'ARMOR' && !equippedArmor) equippedArmor = item.id;

      return {
        ...prev,
        gold: newGold,
        inventory: newInv,
        equippedWeaponId: equippedWeapon,
        equippedArmorId: equippedArmor,
      };
    });
  };

  const handleEquipItem = (item: Item) => {
    setProfile((prev) => ({
      ...prev,
      equippedWeaponId: item.type === 'WEAPON' ? item.id : prev.equippedWeaponId,
      equippedArmorId: item.type === 'ARMOR' ? item.id : prev.equippedArmorId,
    }));
  };

  const handleResetProgress = () => {
    const pristine = resetGameProgress();
    setProfile(pristine);
    setIsHeroInfoOpen(false);
    setScreen('TITLE');
  };

  return (
    <main className="w-full h-full bg-bronze-pattern flex items-center justify-center p-0 text-stone-100 antialiased select-none overflow-hidden">
      {/* Container chuẩn full màn hình theo từng thiết bị (cảm nhận như app cài trên máy) */}
      <div className="w-full max-w-lg h-full bg-bronze-pattern sm:border-x-2 sm:border-amber-700/80 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Render Active Screen */}
        {screen === 'TITLE' && (
          <TitleScreen
            onStartCampaign={() => setScreen('WORLD_MAP')}
            onOpenStageSelect={() => setScreen('STAGE_SELECT')}
            onOpenHeroCards={() => setIsHeroInfoOpen(true)}
            onOpenPvE={() => setScreen('PVE_SELECT')}
            onOpenPvP={() => setScreen('PVP_LOBBY')}
            isMuted={settings.isMuted}
            onToggleMute={toggleMute}
            turnTimerEnabled={settings.turnTimerEnabled}
            turnTimeLimit={settings.turnTimeLimit || 20}
            onToggleTurnTimer={toggleTurnTimer}
            onUpdateTurnTimer={handleUpdateTurnTimer}
            canInstallPwa={canInstallPwa}
            onInstallPwa={handleInstallPwa}
            conqueredCount={profile.defeatedWarlords.length}
          />
        )}

        {screen === 'STAGE_SELECT' && (
          <StageSelectModal
            profile={profile}
            onSelectStage={handleSelectStage}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {screen === 'ROADMAP' && (
          <MarchingRoadmap2D
            warlord={p2Warlord}
            stageNumber={activeStageNumber}
            profile={profile}
            bonusAtk={bonusAtk}
            bonusDef={bonusDef}
            bonusHp={bonusHp}
            isMuted={settings.isMuted}
            onToggleMute={toggleMute}
            turnTimerEnabled={settings.turnTimerEnabled}
            turnTimeLimit={settings.turnTimeLimit || 20}
            onToggleTurnTimer={toggleTurnTimer}
            onUpdateTurnTimer={handleUpdateTurnTimer}
            onStartBattle={() => setScreen('BATTLE')}
            onBack={() => setScreen('WORLD_MAP')}
          />
        )}

        {screen === 'PVE_SELECT' && (
          <PvEModeSelect
            onStartBattle={handleStartPvEBattle}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {screen === 'WORLD_MAP' && (
          <WorldMap
            profile={profile}
            onEnterBattle={handleEnterCampaignBattle}
            onClaimVillageReward={handleClaimVillageReward}
            onOpenShop={() => setIsShopOpen(true)}
            onOpenHeroInfo={() => setIsHeroInfoOpen(true)}
            onOpenPvP={() => setScreen('PVP_LOBBY')}
            onReturnTitle={() => setScreen('TITLE')}
            isMuted={settings.isMuted}
            onToggleMute={toggleMute}
            canInstallPwa={canInstallPwa}
            onInstallPwa={handleInstallPwa}
          />
        )}

        {screen === 'PVP_LOBBY' && (
          <PvPLobby
            onStartHotseat={handleStartHotseat}
            onStartP2P={handleStartP2P}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {screen === 'BATTLE' && (
          <BattleScreen
            gameMode={gameMode}
            p1Warlord={p1Warlord}
            p2Warlord={p2Warlord}
            stageNumber={activeStageNumber}
            playerLevel={profile.level}
            bonusAtk={bonusAtk}
            bonusDef={bonusDef}
            bonusHp={bonusHp}
            bonusArmor={profile.baseArmor}
            onVictory={handleBattleVictory}
            onDefeat={handleBattleDefeat}
            onBackToMap={() =>
              setScreen(
                gameMode === 'CAMPAIGN' ? 'WORLD_MAP' : gameMode === 'PVE_CUSTOM' ? 'PVE_SELECT' : 'PVP_LOBBY'
              )
            }
            isMuted={settings.isMuted}
            onToggleMute={toggleMute}
            turnTimerEnabled={settings.turnTimerEnabled}
            turnTimeLimit={settings.turnTimeLimit || 20}
            onToggleTurnTimer={toggleTurnTimer}
            onUpdateTurnTimer={handleUpdateTurnTimer}
          />
        )}

        {/* Global Modals */}
        {isShopOpen && (
          <ShopModal
            profile={profile}
            onBuyItem={handleBuyItem}
            onEquipItem={handleEquipItem}
            onClose={() => setIsShopOpen(false)}
          />
        )}

        {isHeroInfoOpen && (
          <HeroInfoModal
            profile={profile}
            onResetProgress={handleResetProgress}
            onClose={() => setIsHeroInfoOpen(false)}
          />
        )}
      </div>
    </main>
  );
}
