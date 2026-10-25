/**
 * Loạn 12 Sứ Quân — Mobile Game Remaster
 * Main Application Orchestrator
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameScreen, GameMode, Warlord, PlayerProfile, Item, PveDifficulty } from './types/game';
import { DINH_BO_LINH, WARLORDS, ALL_CHARACTERS } from './data/warlords';
import { CAMPAIGN_NODES } from './data/campaignMap';
import { SHOP_ITEMS } from './data/items';
import { loadProfile, saveProfile, loadSettings, saveSettings, resetGameProgress } from './services/storage';
import { soundEngine } from './services/audio';
import { useOnlineSync } from './hooks/useOnlineSync';

import { TitleScreen } from './components/title/TitleScreen';
import { WorldMap } from './components/worldmap/WorldMap';
import { StageSelectModal } from './components/campaign/StageSelectModal';
import { MarchingRoadmap2D } from './components/campaign/MarchingRoadmap2D';
import { PvEModeSelect } from './components/pve/PvEModeSelect';
import { BattleScreen } from './components/battle/BattleScreen';
import { PvPLobby } from './components/pvp/PvPLobby';
import { ShopModal } from './components/shop/ShopModal';
import { HeroInfoModal } from './components/character/HeroInfoModal';
import { UpdateNotificationToast } from './components/common/UpdateNotificationToast';

class GameErrorBoundary extends React.Component<
  { children: React.ReactNode; onRecover: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onRecover: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[GameErrorBoundary] Auto-recovering from render issue:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#291507',
            color: '#fef08a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            LOẠN 12 SỨ QUÂN
          </h2>
          <p style={{ fontSize: '13px', color: '#e7e5e4', marginBottom: '16px' }}>
            Hệ thống đã tự động tối ưu bộ nhớ cho thiết bị của bạn.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onRecover();
            }}
            style={{
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: '2px solid #fde047',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            TIẾP TỤC VÀO GAME
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');

  // Player Profile & Progression State (100% Guest Local Storage — Không cần đăng nhập Google)
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [settings, setSettings] = useState(() => loadSettings());

  // Trạng thái mạng, bộ nhớ đệm Offline & tự động cập nhật gói tin mới
  const syncState = useOnlineSync();

  // Active Battle Setup State
  const [p1Warlord, setP1Warlord] = useState<Warlord>(DINH_BO_LINH);
  const [p2Warlord, setP2Warlord] = useState<Warlord>(WARLORDS[0]);
  const [activeStageNumber, setActiveStageNumber] = useState<number>(1);
  const [pveDifficulty, setPveDifficulty] = useState<PveDifficulty>('MEDIUM');
  const [p2pBoardSeed, setP2pBoardSeed] = useState<number>(123456);
  const [p2pIsHost, setP2pIsHost] = useState<boolean>(true);
  const [battleInstanceKey, setBattleInstanceKey] = useState<number>(1);

  // Modals
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isHeroInfoOpen, setIsHeroInfoOpen] = useState(false);

  const screenRef = useRef<GameScreen>(screen);
  const gameModeRef = useRef<GameMode>(gameMode);
  useEffect(() => {
    screenRef.current = screen;
    gameModeRef.current = gameMode;
  }, [screen, gameMode]);

  // Chặn thao tác vuốt nhầm nút Back cạnh màn hình trên điện thoại Android làm văng khỏi game
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.history.pushState({ loan12sqGuard: true }, '');
    } catch {}

    const handlePopState = () => {
      try {
        window.history.pushState({ loan12sqGuard: true }, '');
      } catch {}

      // Nếu đang đánh trận: giữ nguyên trong trận để không bị thoát nhầm khi vuốt ngọc sát mép màn hình
      if (screenRef.current === 'BATTLE') {
        return;
      }
      if (screenRef.current === 'ROADMAP') {
        setScreen('WORLD_MAP');
        return;
      }
      if (screenRef.current !== 'TITLE') {
        setScreen('TITLE');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // 1. Campaign Battle from 3D World Map
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

  // 3. Battle from PvE Mode (Custom Difficulty — truyền chuẩn xác cấp độ khó)
  const handleStartPvEBattle = (warlord: Warlord, difficulty: PveDifficulty) => {
    setP1Warlord(DINH_BO_LINH);
    setP2Warlord(warlord);
    setPveDifficulty(difficulty);
    setGameMode('PVE_CUSTOM');
    setBattleInstanceKey((k) => k + 1);
    setScreen('BATTLE');
  };

  // 4. PvP Hotseat Battle Trigger
  const handleStartHotseat = (p1: Warlord, p2: Warlord) => {
    setP1Warlord(p1);
    setP2Warlord(p2);
    setGameMode('PVP_HOTSEAT');
    setBattleInstanceKey((k) => k + 1);
    setScreen('BATTLE');
  };

  // 5. PvP 2-Device P2P Battle Trigger (Đồng bộ chính xác tướng Máy 1, Máy 2 và Hạt giống bàn cờ)
  const handleStartP2P = (
    myWarlord: Warlord,
    _roomId: string,
    isHost: boolean,
    opponentWarlord?: Warlord,
    initialBoardSeed?: number
  ) => {
    const fallbackOpponent =
      ALL_CHARACTERS.find((c) => c.id !== myWarlord.id) || WARLORDS[1];
    const resolvedOpponent = opponentWarlord || fallbackOpponent;

    if (isHost) {
      setP1Warlord(myWarlord);
      setP2Warlord(resolvedOpponent);
    } else {
      setP1Warlord(resolvedOpponent);
      setP2Warlord(myWarlord);
    }

    setP2pIsHost(isHost);
    setP2pBoardSeed(initialBoardSeed || 123456);
    setGameMode('PVP_P2P');
    setBattleInstanceKey((k) => k + 1);
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
      {/* Thông báo nhẹ khi hệ thống tải xong bản cập nhật mới lúc có mạng */}
      <UpdateNotificationToast
        visible={syncState.updateAvailable}
        onApply={syncState.applyUpdate}
        onDismiss={syncState.dismissUpdate}
      />

      {/* Container chuẩn full màn hình theo từng thiết bị */}
      <div className="w-full max-w-lg h-full bg-bronze-pattern sm:border-x-2 sm:border-amber-700/80 shadow-2xl flex flex-col overflow-hidden relative">
        <GameErrorBoundary onRecover={() => setScreen('TITLE')}>
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
              syncState={syncState}
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
              onStartBattle={() => {
                setBattleInstanceKey((k) => k + 1);
                setScreen('BATTLE');
              }}
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
              key={battleInstanceKey}
              gameMode={gameMode}
              p1Warlord={p1Warlord}
              p2Warlord={p2Warlord}
              stageNumber={activeStageNumber}
              pveDifficulty={pveDifficulty}
              p2pBoardSeed={p2pBoardSeed}
              p2pIsHost={p2pIsHost}
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
        </GameErrorBoundary>
      </div>
    </main>
  );
}
