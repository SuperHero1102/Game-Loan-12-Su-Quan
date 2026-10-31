/**
 * Loạn 12 Sứ Quân — Battle Screen Orchestrator
 * Điều phối trận đấu Match-3, hoạt cảnh 3D Tướng & Thú Cưỡi, 3 thanh chỉ số,
 * cơ chế Tốc Độ (SPD) quyết định lượt 1, Nội Tại Vai Trò (Role Passives),
 * đồng bộ 2 máy thời gian thực (Seeded P2P), chống văng trận (Safe Timer Lifecycle),
 * và phân tầng độ khó AI chuẩn xác.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Tile, FighterState, FloatingText, GameMode, Warlord, PveDifficulty } from '../../types/game';
import {
  createInitialBoard,
  testSwapCreatesMatch,
  resolveCascade,
  findBestAIMove,
  areAdjacent,
  GRID_ROWS,
  GRID_COLS,
  BoardVfx,
} from '../../game/match3Engine';
import { BattleStage2D } from './BattleStage2D';
import { Match3Board } from './Match3Board';
import { SkillButtons } from './SkillButtons';
import { TurnTimerModal } from '../common/TurnTimerModal';
import { soundEngine } from '../../services/audio';
import { p2pService } from '../../services/p2p';
import { deviceOptimizer } from '../../services/deviceOptimizer';
import { ArrowLeft, Volume2, VolumeX, FastForward, Clock } from 'lucide-react';

interface BattleScreenProps {
  gameMode: GameMode;
  p1Warlord: Warlord;
  p2Warlord: Warlord;
  stageNumber?: number;
  pveDifficulty?: PveDifficulty;
  p2pBoardSeed?: number;
  p2pIsHost?: boolean;
  playerLevel: number;
  bonusAtk: number;
  bonusDef: number;
  bonusHp: number;
  bonusArmor?: number;
  prestigeLevel?: number;
  onVictory: (goldEarned: number, defeatedWarlordId: string, nextStageNumber?: number) => void;
  onDefeat: () => void;
  onBackToMap: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  turnTimerEnabled?: boolean;
  turnTimeLimit?: number;
  onToggleTurnTimer?: () => void;
  onUpdateTurnTimer?: (enabled: boolean, timeLimit: number) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  gameMode,
  p1Warlord,
  p2Warlord,
  stageNumber,
  pveDifficulty = 'MEDIUM',
  p2pBoardSeed,
  p2pIsHost = true,
  playerLevel,
  bonusAtk,
  bonusDef,
  bonusHp,
  bonusArmor = 0,
  prestigeLevel = 0,
  onVictory,
  onDefeat,
  onBackToMap,
  isMuted,
  onToggleMute,
  turnTimerEnabled = true,
  turnTimeLimit = 20,
  onUpdateTurnTimer,
}) => {
  // Quản lý vòng đời component & bộ đếm giờ an toàn để chống văng màn chơi
  const mountedRef = useRef<boolean>(true);
  const activeTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const safeTimeout = useCallback((fn: () => void, delayMs: number) => {
    const id = setTimeout(() => {
      activeTimersRef.current.delete(id);
      if (mountedRef.current) {
        fn();
      }
    }, delayMs);
    activeTimersRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeTimersRef.current.forEach((id) => clearTimeout(id));
      activeTimersRef.current.clear();
    };
  }, []);

  // Tính toán hệ số độ khó thực tế cho AI (Campaign Ải 1->12 hoặc PvE Custom)
  const getDifficultyTuning = useCallback(() => {
    if (gameMode === 'PVE_CUSTOM') {
      switch (pveDifficulty) {
        case 'EASY':
          return { aggressiveness: 0.32, skillChance: 0.38, dmgMultiplier: 0.82, statScale: 1.0 };
        case 'MEDIUM':
          return { aggressiveness: 0.60, skillChance: 0.75, dmgMultiplier: 1.0, statScale: 1.0 };
        case 'HARD':
          return { aggressiveness: 0.84, skillChance: 1.0, dmgMultiplier: 1.12, statScale: 1.0 };
        case 'HELL':
          return { aggressiveness: 0.98, skillChance: 1.0, dmgMultiplier: 1.25, statScale: 1.0 };
      }
    }
    if (gameMode === 'CAMPAIGN') {
      const stage = Math.max(1, Math.min(12, stageNumber || p2Warlord.stageNumber || 1));
      const progress = (stage - 1) / 11; // 0.0 ở Ải 1 -> 1.0 ở Ải 12
      const prestigeScale = 1 + (prestigeLevel || 0) * 0.35;
      return {
        aggressiveness: Number(Math.min(1.0, 0.35 + progress * 0.60 + (prestigeLevel || 0) * 0.08).toFixed(2)),
        skillChance: stage <= 2 && !prestigeLevel ? 0.45 : stage <= 5 ? 0.72 : 1.0,
        dmgMultiplier: Number(((0.85 + progress * 0.32) * (1 + (prestigeLevel || 0) * 0.25)).toFixed(2)),
        statScale: Number(((0.90 + progress * 0.25) * prestigeScale).toFixed(2)),
      };
    }
    return { aggressiveness: 0.7, skillChance: 1.0, dmgMultiplier: 1.0, statScale: 1.0 };
  }, [gameMode, pveDifficulty, stageNumber, p2Warlord.stageNumber, prestigeLevel]);

  const diffTuning = getDifficultyTuning();

  // Initialize Fighters with 3 Authentic Bars + 3D Mount/Weapon/Role/SPD attributes
  const [player1, setPlayer1] = useState<FighterState>(() => {
    const isP2P = gameMode === 'PVP_P2P';
    const effHp = p1Warlord.baseHp + (isP2P ? 0 : bonusHp);
    const effArmor = p1Warlord.baseArmor + (isP2P ? 0 : bonusArmor);
    const effAtk = p1Warlord.baseAtk + (isP2P ? 0 : bonusAtk);
    const effDef = p1Warlord.baseDef + (isP2P ? 0 : bonusDef);

    return {
      id: p1Warlord.id,
      name: p1Warlord.name,
      title: p1Warlord.title,
      avatarEmoji: p1Warlord.avatarEmoji,
      avatarColor: p1Warlord.avatarColor,
      characterVisual: p1Warlord.characterVisual,
      hp: effHp,
      maxHp: effHp,
      armor: effArmor,
      maxArmor: 160,
      mana: p1Warlord.id === 'ngo_nhat_khanh' ? 35 : 20,
      maxMana: p1Warlord.skillCost,
      atk: effAtk,
      def: effDef,
      spd: p1Warlord.spd,
      role: p1Warlord.role,
      mountName: p1Warlord.mountName,
      weaponName: p1Warlord.weaponName,
      weaponVisual: p1Warlord.weaponVisual,
      passiveName: p1Warlord.passiveName,
      passiveDescription: p1Warlord.passiveDescription,
      portrait3D: p1Warlord.portrait3D,
      skillName: p1Warlord.skillName,
      skillDescription: p1Warlord.skillDescription,
      skillCost: p1Warlord.skillCost,
      isPlayer: true,
      status: 'idle',
      goldEarnedThisMatch: 0,
    };
  });

  const [player2, setPlayer2] = useState<FighterState>(() => {
    const scaledHp =
      gameMode === 'CAMPAIGN'
        ? Math.round(p2Warlord.baseHp * diffTuning.statScale)
        : p2Warlord.baseHp;
    const scaledAtk =
      gameMode === 'CAMPAIGN'
        ? Math.round(p2Warlord.baseAtk * diffTuning.statScale)
        : p2Warlord.baseAtk;
    const scaledArmor =
      gameMode === 'CAMPAIGN'
        ? Math.round(p2Warlord.baseArmor * diffTuning.statScale)
        : p2Warlord.baseArmor;

    return {
      id: p2Warlord.id,
      name: p2Warlord.name,
      title: p2Warlord.title,
      avatarEmoji: p2Warlord.avatarEmoji,
      avatarColor: p2Warlord.avatarColor,
      characterVisual: p2Warlord.characterVisual,
      hp: scaledHp,
      maxHp: scaledHp,
      armor: scaledArmor,
      maxArmor: 160,
      mana: p2Warlord.id === 'ngo_nhat_khanh' ? 35 : 15,
      maxMana: p2Warlord.skillCost,
      atk: scaledAtk,
      def: p2Warlord.baseDef,
      spd: p2Warlord.spd,
      role: p2Warlord.role,
      mountName: p2Warlord.mountName,
      weaponName: p2Warlord.weaponName,
      weaponVisual: p2Warlord.weaponVisual,
      passiveName: p2Warlord.passiveName,
      passiveDescription: p2Warlord.passiveDescription,
      portrait3D: p2Warlord.portrait3D,
      skillName: p2Warlord.skillName,
      skillDescription: p2Warlord.skillDescription,
      skillCost: p2Warlord.skillCost,
      isPlayer: gameMode !== 'CAMPAIGN' && gameMode !== 'PVE_CUSTOM',
      status: 'idle',
      goldEarnedThisMatch: 0,
    };
  });

  const player1Ref = useRef<FighterState>(player1);
  const player2Ref = useRef<FighterState>(player2);
  useEffect(() => {
    player1Ref.current = player1;
  }, [player1]);
  useEffect(() => {
    player2Ref.current = player2;
  }, [player2]);

  const [board, setBoard] = useState<Tile[][]>(() =>
    createInitialBoard(
      gameMode === 'PVP_P2P' ? p2pBoardSeed || p2pService.initialBoardSeed : undefined
    )
  );
  const boardRef = useRef<Tile[][]>(board);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const [selectedCoord, setSelectedCoord] = useState<{ r: number; c: number } | null>(null);
  // TỐC ĐỘ (SPD) QUYẾT ĐỊNH AI ĐÁNH TRƯỚC Ở LƯỢT 1!
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>(() =>
    p1Warlord.spd >= p2Warlord.spd ? 'p1' : 'p2'
  );
  const currentTurnRef = useRef<'p1' | 'p2'>(currentTurn);
  useEffect(() => {
    currentTurnRef.current = currentTurn;
  }, [currentTurn]);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const isResolvingRef = useRef(false);
  useEffect(() => {
    isResolvingRef.current = isResolving;
  }, [isResolving]);

  // Visual Effects State
  const [slashActive, setSlashActive] = useState(false);
  const [slashTarget, setSlashTarget] = useState<'p1' | 'p2' | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [extraTurnAlert, setExtraTurnAlert] = useState(false);
  const [comboAlert, setComboAlert] = useState(0);
  const [boardVfx, setBoardVfx] = useState<BoardVfx[]>([]);
  const [clearingCoords, setClearingCoords] = useState<{ r: number; c: number }[]>([]);

  // Keypad & D-Pad State
  const [dpadCursor, setDpadCursor] = useState<{ r: number; c: number }>({ r: 3, c: 3 });

  // Match Outcome
  const [winner, setWinner] = useState<'p1' | 'p2' | null>(null);
  const winnerRef = useRef<'p1' | 'p2' | null>(null);
  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);

  // Turn Countdown Timer State & Hộp Thoại Cài Đặt Thời Gian
  const [localTurnTimerEnabled, setLocalTurnTimerEnabled] = useState(turnTimerEnabled);
  const [localTimeLimit, setLocalTimeLimit] = useState<number>(turnTimeLimit || 20);
  const [timeLeft, setTimeLeft] = useState<number>(turnTimeLimit || 20);
  const [showTimerModal, setShowTimerModal] = useState(false);

  useEffect(() => {
    setLocalTurnTimerEnabled(turnTimerEnabled);
  }, [turnTimerEnabled]);

  useEffect(() => {
    if (turnTimeLimit && turnTimeLimit > 0) {
      setLocalTimeLimit(turnTimeLimit);
      setTimeLeft(turnTimeLimit);
    }
  }, [turnTimeLimit]);

  const handleSaveTimerSettings = (enabled: boolean, newLimit: number) => {
    setLocalTurnTimerEnabled(enabled);
    setLocalTimeLimit(newLimit);
    setTimeLeft(newLimit);
    if (gameMode === 'PVP_P2P' && p2pIsHost) {
      p2pService.send({ type: 'TIMER_SYNC', enabled, timeLimit: newLimit });
    }
    if (onUpdateTurnTimer) {
      onUpdateTurnTimer(enabled, newLimit);
    }
  };

  const triggerVictoryConfetti = useCallback((baseParticles: number) => {
    try {
      const count = deviceOptimizer.getOptimalParticleCount(baseParticles);
      confetti({ particleCount: count, spread: 75, origin: { y: 0.6 } });
    } catch {
      // Bỏ qua nếu thiết bị tắt canvas
    }
  }, []);

  const addFloatingText = useCallback(
    (text: string, type: FloatingText['type'], target: 'p1' | 'p2') => {
      const id = `float_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setFloatingTexts((prev) => [...prev.slice(-8), { id, text, type, target }]);
      safeTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
      }, 950);
    },
    [safeTimeout]
  );

  // Play opening gong & show SPD Initiative floating indicator
  useEffect(() => {
    soundEngine.playBronzeGong();
    if (p1Warlord.spd >= p2Warlord.spd) {
      addFloatingText(`🏃 TỐC ĐỘ ${p1Warlord.spd}: TIÊN PHONG!`, 'extra_turn', 'p1');
    } else {
      addFloatingText(`🏃 TỐC ĐỘ ${p2Warlord.spd}: CƯỚP LƯỢT!`, 'extra_turn', 'p2');
    }
  }, [p1Warlord.spd, p2Warlord.spd, addFloatingText]);

  // Nội tại Nguyễn Khoan (Thái Bình Đạo): Hồi máu nhẹ đầu lượt
  useEffect(() => {
    if (winner) return;
    if (currentTurn === 'p1' && player1Ref.current.id === 'nguyen_khoan' && player1Ref.current.hp > 0) {
      setPlayer1((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 15) }));
      addFloatingText('+15 HP (Nội Tại)', 'heal', 'p1');
    } else if (
      currentTurn === 'p2' &&
      player2Ref.current.id === 'nguyen_khoan' &&
      player2Ref.current.hp > 0
    ) {
      setPlayer2((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 15) }));
      addFloatingText('+15 HP (Nội Tại)', 'heal', 'p2');
    }
  }, [currentTurn, winner, addFloatingText]);

  // Turn Countdown Timer Effect: Khi hết giờ không ra chiêu thì chuyển lượt sang bên khác
  useEffect(() => {
    if (!localTurnTimerEnabled || winner || isResolving) return;

    const timer = setInterval(() => {
      if (!mountedRef.current || winnerRef.current || isResolvingRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          soundEngine.playBronzeGong();
          addFloatingText('⏳ HẾT GIỜ!', 'damage', currentTurnRef.current);
          setCurrentTurn((t) => (t === 'p1' ? 'p2' : 'p1'));
          return localTimeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [localTurnTimerEnabled, localTimeLimit, winner, isResolving, addFloatingText]);

  // Reset timer on turn switch
  useEffect(() => {
    setTimeLeft(localTimeLimit);
  }, [currentTurn, localTimeLimit]);

  // Execute Swap & Dynamic Feedback Loop with Role Passives & Deterministic P2P Sync
  const executeSwap = useCallback(
    (
      r1: number,
      c1: number,
      r2: number,
      c2: number,
      isRemoteP2P = false,
      remoteMoveSeed?: number
    ) => {
      if (isResolvingRef.current || winnerRef.current) return;

      const currentBoard = boardRef.current;
      const isValid = testSwapCreatesMatch(currentBoard, r1, c1, r2, c2);
      if (!isValid) {
        soundEngine.playInvalidMove();
        setSelectedCoord(null);
        return;
      }

      isResolvingRef.current = true;
      setIsResolving(true);
      setSelectedCoord(null);

      const moveSeed =
        typeof remoteMoveSeed === 'number'
          ? remoteMoveSeed
          : Math.floor(100000 + Math.random() * 900000);

      // Send to P2P peer if we made this move
      if (gameMode === 'PVP_P2P' && !isRemoteP2P) {
        p2pService.send({ type: 'SWAP_MOVE', r1, c1, r2, c2, moveSeed });
      }

      // Clone and swap
      const tempBoard = currentBoard.map((row) => row.map((t) => ({ ...t })));
      const t1 = tempBoard[r1]?.[c1];
      const t2 = tempBoard[r2]?.[c2];
      if (t1 && t2 && (r1 !== r2 || c1 !== c2)) {
        tempBoard[r1][c1] = { ...t2, row: r1, col: c1 };
        tempBoard[r2][c2] = { ...t1, row: r2, col: c2 };
      }

      // 1. Phản hồi thị giác tức thì nước hoán đổi
      setBoard(tempBoard);
      soundEngine.playGemSlide();

      // 2. Giải mã tầng nổ và trọng lực rơi từng bước
      const result = resolveCascade(tempBoard, moveSeed, { r1, c1, r2, c2 });

      // 3. Hàm thực thi tính toán sát thương & hoạt cảnh tướng sau khi chuỗi ăn hoàn tất
      const finishCombatResolution = () => {
        setBoard(result.newBoard);
        setClearingCoords([]);
        setBoardVfx([]);

        const turnSide = currentTurnRef.current;
        const nextP1 = { ...player1Ref.current };
        const nextP2 = { ...player2Ref.current };

      const activeFighter = turnSide === 'p1' ? nextP1 : nextP2;
      const defenderFighter = turnSide === 'p1' ? nextP2 : nextP1;
      const targetSide: 'p1' | 'p2' = turnSide === 'p1' ? 'p2' : 'p1';

      // Hệ số Nội Tại Đinh Bộ Lĩnh (Chân Mệnh Thiên Tử: +15% hiệu quả mọi loại ngọc)
      const isDinhBoLinh = activeFighter.id === 'dinh_bo_linh';
      const emperorMultiplier = isDinhBoLinh ? 1.15 : 1.0;

      // Xác suất tất định từ moveSeed để 2 máy P2P tính sát thương bạo kích khớp nhau 100%
      const critRoll = ((moveSeed % 997) / 997);
      const doubleStrikeRoll = (((moveSeed * 31) % 991) / 991);

      // 1. SÁT THƯƠNG ĐOẢN KIẾM HOẶC HUYẾT KIẾM + NỘI TẠI TƯỚNG
      if (result.totalSwords > 0) {
        const speedCritChance = Math.max(0.05, (activeFighter.spd - 45) * 0.005);
        const isSpeedCrit = critRoll < speedCritChance;
        const isBloodCrit = result.hasBloodSwordCrit || isSpeedCrit;

        // Tiếng vó ngựa chiến dồn dập khi phi sang tấn công
        soundEngine.playHorseGallop();

        // Âm thanh xuất chiêu vũ khí theo chủng loại (Kiếm, Đao, Thương, Chùy, Cung)
        safeTimeout(() => {
          if (isBloodCrit) {
            soundEngine.playBloodSwordSlash();
            soundEngine.playWeaponClash();
          } else {
            soundEngine.playWeaponAttack(activeFighter.weaponVisual);
          }
        }, 55);

        setSlashActive(true);
        setSlashTarget(targetSide);
        safeTimeout(() => setSlashActive(false), 450);

        activeFighter.status = 'attacking';

        let roleBonusMultiplier = emperorMultiplier;
        if (activeFighter.id === 'kieu_cong_han') roleBonusMultiplier *= 1.25;
        if (activeFighter.id === 'pham_bach_ho' && activeFighter.hp < activeFighter.maxHp * 0.5) {
          roleBonusMultiplier *= 1.3;
        }
        const isDoubleStrike = activeFighter.id === 'kieu_thuan' && doubleStrikeRoll < 0.25;
        if (isDoubleStrike) roleBonusMultiplier *= 1.5;

        // Áp dụng hệ số độ khó nếu là lượt của AI
        const aiDmgFactor =
          turnSide === 'p2' && (gameMode === 'CAMPAIGN' || gameMode === 'PVE_CUSTOM')
            ? diffTuning.dmgMultiplier
            : 1.0;

        const baseDmg =
          result.totalSwords * (activeFighter.atk * 0.9) * roleBonusMultiplier * aiDmgFactor;
        const rawDamage = Math.round(isBloodCrit ? baseDmg * 1.85 : baseDmg);

        const armorPierceRatio =
          activeFighter.id === 'ly_khue' ? 0.45 : isBloodCrit ? 0.5 : 0.85;

        let remainDmg = rawDamage;
        let newArmor = defenderFighter.armor;

        if (defenderFighter.id === 'do_canh_thac' || defenderFighter.id === 'pham_phong_at') {
          remainDmg = Math.round(remainDmg * 0.82);
        }

        if (newArmor > 0) {
          // Va vào giáp sắt / khiên đồng: phát ra tiếng đinggg kim khí đanh thép
          soundEngine.playArmorDeflect();
          const absorbCap = Math.round(newArmor * armorPierceRatio);
          const absorbed = Math.min(absorbCap, remainDmg);
          newArmor -= absorbed;
          remainDmg -= absorbed;
          if (remainDmg > 0) {
            safeTimeout(() => soundEngine.playHurt(), 100);
          }
        } else {
          soundEngine.playHurt();
        }

        defenderFighter.armor = newArmor;
        defenderFighter.hp = Math.max(0, defenderFighter.hp - remainDmg);
        defenderFighter.status = 'hurt';

        if (isBloodCrit) {
          addFloatingText(`💥 BẠO KÍCH -${rawDamage}!`, 'crit', targetSide);
        } else {
          addFloatingText(`-${rawDamage}`, 'damage', targetSide);
        }

        // Nội tại Lữ Đường (Khiên Quỷ Phản Đòn: phản 20% sát thương)
        if (defenderFighter.id === 'lu_duong') {
          const reflectDmg = Math.max(8, Math.round(rawDamage * 0.2));
          activeFighter.hp = Math.max(1, activeFighter.hp - reflectDmg);
          addFloatingText(`🛡️ Phản Đòn -${reflectDmg}`, 'damage', turnSide);
        }
      }

      // 2. HỒI PHỤC TRÁI TIM (ĂN TIM) + Nội tại Trần Lãm (+30% hồi máu)
      if (result.totalHearts > 0) {
        soundEngine.playHeal();
        const tranLamBonus = activeFighter.id === 'tran_lam' ? 1.3 : emperorMultiplier;
        const healAmt = Math.round(result.totalHearts * 30 * tranLamBonus);
        activeFighter.hp = Math.min(activeFighter.maxHp, activeFighter.hp + healAmt);
        if (activeFighter.status === 'idle') activeFighter.status = 'heal';
        addFloatingText(`+${healAmt} HP`, 'heal', turnSide);
      }

      // 3. BÁNH CHƯNG XANH TĂNG GIÁP + Nội tại Nguyễn Siêu (+35% Giáp)
      if (result.totalChungCakes > 0) {
        soundEngine.playShield();
        const nguyenSieuBonus = activeFighter.id === 'nguyen_sieu' ? 1.35 : emperorMultiplier;
        const armorAmt = Math.round(result.totalChungCakes * 16 * nguyenSieuBonus);
        activeFighter.armor = Math.min(activeFighter.maxArmor, activeFighter.armor + armorAmt);
        if (activeFighter.status === 'idle') activeFighter.status = 'shield';
        addFloatingText(`+${armorAmt} Giáp`, 'armor', turnSide);
      }

      // 4. NGỌC THÁI CỰC TÍCH NỘ (ĂN ÂM DƯƠNG) + Nội tại Ngô Xương Xí / Ngô Nhật Khánh
      if (result.totalYinYang > 0) {
        soundEngine.playChiGathering();
        const manaBonus =
          activeFighter.id === 'ngo_xuong_xi' || activeFighter.id === 'ngo_nhat_khanh'
            ? Math.ceil(result.totalYinYang * 1.25)
            : Math.ceil(result.totalYinYang * emperorMultiplier);
        activeFighter.mana = Math.min(activeFighter.maxMana, activeFighter.mana + manaBonus);
        if (activeFighter.status === 'idle') activeFighter.status = 'mana';
        addFloatingText(`+${manaBonus} Mana`, 'skill', turnSide);
      }

      // 5. THỎI VÀNG (ĂN VÀNG)
      if (result.totalGold > 0) {
        soundEngine.playGold();
        if (turnSide === 'p1') {
          nextP1.goldEarnedThisMatch += result.totalGold;
          addFloatingText(`+${result.totalGold} Vàng`, 'gold', 'p1');
        }
      }

      // 6. TÚI GẤM LINH ĐAN TÍM (ELIXIR): HỒI KÉP MÁU + NỘ KHÍ VÀ TĂNG NHẸ CÔNG LỰC TRONG TRẬN
      if (result.totalElixirs > 0) {
        soundEngine.playHeal();
        soundEngine.playChiGathering();
        const elixirHeal = Math.round(result.totalElixirs * 18 * emperorMultiplier);
        const elixirMana = Math.ceil(result.totalElixirs * 8 * emperorMultiplier);
        const elixirAtkBonus = Math.max(2, Math.round(result.totalElixirs * 2 * emperorMultiplier));

        activeFighter.hp = Math.min(activeFighter.maxHp, activeFighter.hp + elixirHeal);
        activeFighter.mana = Math.min(activeFighter.maxMana, activeFighter.mana + elixirMana);
        activeFighter.atk += elixirAtkBonus;
        if (activeFighter.status === 'idle') activeFighter.status = 'heal';

        addFloatingText(
          `🍇 Linh Đan +${elixirHeal}HP +${elixirMana}MP +${elixirAtkBonus}ATK`,
          'heal',
          turnSide
        );
      }

      // Combo cascade audio & alert khi nổ chuỗi liên hoàn
      if (result.comboCount > 1) {
        soundEngine.playComboCascade(result.comboCount);
        setComboAlert(result.comboCount);
        safeTimeout(() => setComboAlert(0), 1200);
      }

      // Cập nhật state 1 lần duy nhất, tinh khiết (không lồng side-effect trong setState)
      player1Ref.current = nextP1;
      player2Ref.current = nextP2;
      setPlayer1(nextP1);
      setPlayer2(nextP2);

      // Reset animation statuses after complete strike
      safeTimeout(() => {
        setPlayer1((prev) =>
          prev.status === 'victory' || prev.status === 'defeat' ? prev : { ...prev, status: 'idle' }
        );
        setPlayer2((prev) =>
          prev.status === 'victory' || prev.status === 'defeat' ? prev : { ...prev, status: 'idle' }
        );
      }, 600);

      // Check Turn Transition, Victory/Defeat, or Extra Turn (Ăn 4-5 viên)
      safeTimeout(() => {
        if (nextP2.hp <= 0) {
          soundEngine.playVictory();
          triggerVictoryConfetti(100);
          setPlayer1((prev) => ({ ...prev, status: 'victory' }));
          setPlayer2((prev) => ({ ...prev, status: 'defeat' }));
          safeTimeout(() => {
            isResolvingRef.current = false;
            setIsResolving(false);
            setWinner('p1');
          }, 1250);
          return;
        }

        if (nextP1.hp <= 0) {
          setPlayer2((prev) => ({ ...prev, status: 'victory' }));
          setPlayer1((prev) => ({ ...prev, status: 'defeat' }));
          safeTimeout(() => {
            isResolvingRef.current = false;
            setIsResolving(false);
            setWinner('p2');
          }, 1250);
          return;
        }

        isResolvingRef.current = false;
        setIsResolving(false);

        if (result.extraTurn) {
          soundEngine.playThunderExtraTurn();
          setExtraTurnAlert(true);
          safeTimeout(() => setExtraTurnAlert(false), 1350);
          addFloatingText('⚡ THÊM LƯỢT ĐÁNH!', 'extra_turn', turnSide);
        } else {
          setCurrentTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'));
        }
      }, 660);
    };

    // 4. Kích hoạt chuỗi hoạt ảnh từng bước cascade:
    // Pha 1: Các quân cờ khớp ăn lóe sáng và bùng nổ hiệu ứng (nổ/sét/chém/tinh thể)
    // Pha 2: Các quân cờ trên cao rơi xuống lấp đầy ô trống theo trọng lực
    // Pha 3: Nếu tạo thành combo tầng tiếp theo, lặp lại hiệu ứng tầng mới trước khi tướng xuất chiêu
    const steps = result.steps && result.steps.length > 0 ? result.steps : [];
    if (steps.length === 0) {
      finishCombatResolution();
      return;
    }

    let stepIdx = 0;
    const runStep = () => {
      if (stepIdx >= steps.length) {
        finishCombatResolution();
        return;
      }

      const currentStep = steps[stepIdx];
      setBoard(currentStep.boardBeforeClear);
      setClearingCoords(currentStep.clearedCoords);
      setBoardVfx(currentStep.vfxEvents);

      const hasLightning = currentStep.vfxEvents.some((v) => v.type === 'lightning');
      const hasExplosion = currentStep.vfxEvents.some((v) => v.type === 'explosion');
      if (hasLightning) {
        soundEngine.playThunderExtraTurn();
      } else if (hasExplosion) {
        soundEngine.playWeaponClash();
      }

      if (currentStep.combo > 1) {
        setComboAlert(currentStep.combo);
        soundEngine.playChiGathering();
      }

      // Pha 2: Quân cờ rơi xuống theo trọng lực (240ms)
      safeTimeout(() => {
        setBoard(currentStep.boardAfterGravity);
        setClearingCoords([]);
        setBoardVfx([]);

        stepIdx++;
        // Pha 3: Ổn định trước đợt cascade tiếp theo hoặc xuất chiêu tướng (180ms)
        safeTimeout(runStep, 180);
      }, 240);
    };

    runStep();
  },
  [gameMode, diffTuning.dmgMultiplier, addFloatingText, safeTimeout, triggerVictoryConfetti]
  );

  // Execute Ultimate Martial Art Skill Cast (3D Cutscene + Heavy Strike + P2P Sync)
  const executeSkillCast = useCallback(
    (caster: 'p1' | 'p2', isRemoteP2P = false) => {
      if (isResolvingRef.current || winnerRef.current) return;

      const nextP1 = { ...player1Ref.current };
      const nextP2 = { ...player2Ref.current };
      const casterFighter = caster === 'p1' ? nextP1 : nextP2;

      if (!isRemoteP2P && casterFighter.mana < casterFighter.skillCost) return;

      isResolvingRef.current = true;
      setIsResolving(true);

      if (gameMode === 'PVP_P2P' && !isRemoteP2P) {
        p2pService.send({
          type: 'CAST_SKILL',
          caster,
          skillName: casterFighter.skillName,
        });
      }

      soundEngine.playSkillCast();
      safeTimeout(() => {
        soundEngine.playWeaponAttack(casterFighter.weaponVisual);
        soundEngine.playWeaponClash();
      }, 120);

      // Hiệu ứng bông tuyết vàng & bụi hoàng kim bay tóe tung khi Hoàng Đế Đinh Tiên Hoàng ra chiêu
      if (casterFighter.id === 'dinh_tien_hoang') {
        try {
          const count = deviceOptimizer.getOptimalParticleCount(90);
          confetti({
            particleCount: count,
            spread: 120,
            origin: { y: 0.45 },
            colors: ['#fbbf24', '#fef08a', '#ffd700', '#ffffff', '#f59e0b', '#d97706'],
          });
        } catch {
          // Bỏ qua nếu canvas bị chặn
        }
      }

      setSlashActive(true);
      setSlashTarget(caster === 'p1' ? 'p2' : 'p1');
      safeTimeout(() => setSlashActive(false), 620);

      if (caster === 'p1') {
        const skillMultiplier = nextP1.id === 'ngo_xuong_xi' ? 5.2 : 4.6;
        const skillDmg = Math.round(nextP1.atk * skillMultiplier);
        nextP1.mana = 0;
        nextP1.status = 'skill';

        soundEngine.playHurt();
        let remain = skillDmg;
        let newArmor = nextP2.armor;
        if (newArmor > 0) {
          const absorbed = Math.min(newArmor, remain);
          newArmor -= absorbed;
          remain -= absorbed;
        }
        nextP2.armor = newArmor;
        nextP2.hp = Math.max(0, nextP2.hp - remain);
        nextP2.status = 'hurt';

        addFloatingText(`${nextP1.skillName}!`, 'skill', 'p1');
        addFloatingText(`💥 -${skillDmg} TUYỆT KỸ!`, 'crit', 'p2');
      } else {
        const aiSkillScale =
          gameMode === 'CAMPAIGN' || gameMode === 'PVE_CUSTOM' ? diffTuning.dmgMultiplier : 1.0;
        const skillMultiplier = (nextP2.id === 'ngo_xuong_xi' ? 4.9 : 4.3) * aiSkillScale;
        const skillDmg = Math.round(nextP2.atk * skillMultiplier);
        nextP2.mana = 0;
        nextP2.status = 'skill';

        soundEngine.playHurt();
        let remain = skillDmg;
        let newArmor = nextP1.armor;
        if (newArmor > 0) {
          const absorbed = Math.min(newArmor, remain);
          newArmor -= absorbed;
          remain -= absorbed;
        }
        nextP1.armor = newArmor;
        nextP1.hp = Math.max(0, nextP1.hp - remain);
        nextP1.status = 'hurt';

        addFloatingText(`${nextP2.skillName}!`, 'skill', 'p2');
        addFloatingText(`💥 -${skillDmg} TUYỆT KỸ!`, 'crit', 'p1');
      }

      player1Ref.current = nextP1;
      player2Ref.current = nextP2;
      setPlayer1(nextP1);
      setPlayer2(nextP2);

      safeTimeout(() => {
        if (nextP2.hp <= 0) {
          soundEngine.playVictory();
          triggerVictoryConfetti(110);
          setPlayer1((prev) => ({ ...prev, status: 'victory' }));
          setPlayer2((prev) => ({ ...prev, status: 'defeat' }));
          safeTimeout(() => {
            isResolvingRef.current = false;
            setIsResolving(false);
            setWinner('p1');
          }, 1200);
          return;
        }

        if (nextP1.hp <= 0) {
          setPlayer2((prev) => ({ ...prev, status: 'victory' }));
          setPlayer1((prev) => ({ ...prev, status: 'defeat' }));
          safeTimeout(() => {
            isResolvingRef.current = false;
            setIsResolving(false);
            setWinner('p2');
          }, 1200);
          return;
        }

        setPlayer1((prev) => ({ ...prev, status: 'idle' }));
        setPlayer2((prev) => ({ ...prev, status: 'idle' }));
        isResolvingRef.current = false;
        setIsResolving(false);
        setCurrentTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'));
      }, 680);
    },
    [gameMode, diffTuning.dmgMultiplier, addFloatingText, safeTimeout, triggerVictoryConfetti]
  );

  // Subscribe to P2P network moves if in P2P mode (Fixed dependency array to prevent memory leak!)
  useEffect(() => {
    if (gameMode !== 'PVP_P2P') return;

    const unsubscribe = p2pService.subscribe((msg) => {
      if (msg.type === 'SWAP_MOVE') {
        executeSwap(msg.r1, msg.c1, msg.r2, msg.c2, true, msg.moveSeed);
      } else if (msg.type === 'CAST_SKILL') {
        executeSkillCast(msg.caster || (currentTurnRef.current === 'p1' ? 'p1' : 'p2'), true);
      } else if (msg.type === 'SURRENDER') {
        const loser = msg.side || (p2pIsHost ? 'p2' : 'p1');
        setWinner(loser === 'p1' ? 'p2' : 'p1');
      } else if (msg.type === 'TIMER_SYNC') {
        setLocalTurnTimerEnabled(msg.enabled);
        setLocalTimeLimit(msg.timeLimit);
        setTimeLeft(msg.timeLimit);
        soundEngine.playBronzeGong();
        addFloatingText(
          `⏱️ Chủ phòng chỉnh thời gian: ${msg.enabled ? msg.timeLimit + 's' : 'Vô hạn'}`,
          'skill',
          'p1'
        );
      }
    });

    return () => unsubscribe();
  }, [gameMode, p2pIsHost, executeSwap, executeSkillCast]);

  // AI Turn Handling for Campaign Mode & PvE Custom Mode
  useEffect(() => {
    if (winner || player1.hp <= 0 || player2.hp <= 0) return;

    const isAiTurn =
      currentTurn === 'p2' &&
      (gameMode === 'CAMPAIGN' || gameMode === 'PVE_CUSTOM') &&
      !isResolving;

    if (isAiTurn) {
      setIsAiThinking(true);

      const delay =
        gameMode === 'PVE_CUSTOM' && pveDifficulty === 'EASY'
          ? 900
          : gameMode === 'PVE_CUSTOM'
          ? 700
          : 820;

      const timer = safeTimeout(() => {
        setIsAiThinking(false);

        // Quyết định dùng Tuyệt Kỹ theo độ khó (Tập sự ít dùng nộ hơn, Đại tướng/Địa ngục dùng ngay)
        if (
          player2Ref.current.mana >= player2Ref.current.skillCost &&
          Math.random() <= diffTuning.skillChance
        ) {
          executeSkillCast('p2');
          return;
        }

        const bestMove = findBestAIMove(boardRef.current, diffTuning.aggressiveness, {
          aiHpRatio: player2Ref.current.hp / Math.max(1, player2Ref.current.maxHp),
          aiManaRatio: player2Ref.current.mana / Math.max(1, player2Ref.current.maxMana),
          playerHpRatio: player1Ref.current.hp / Math.max(1, player1Ref.current.maxHp),
        });

        if (bestMove) {
          executeSwap(bestMove.r1, bestMove.c1, bestMove.r2, bestMove.c2);
        } else {
          setBoard(createInitialBoard());
          setCurrentTurn('p1');
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [
    currentTurn,
    gameMode,
    pveDifficulty,
    isResolving,
    winner,
    player1.hp,
    player2.hp,
    diffTuning.aggressiveness,
    diffTuning.skillChance,
    executeSwap,
    executeSkillCast,
    safeTimeout,
  ]);

  // Xác định quyền điều khiển bàn cờ theo chế độ chơi (Single / Hotseat / 2-Device P2P)
  const myP2PSide: 'p1' | 'p2' = p2pIsHost ? 'p1' : 'p2';
  const isMyTurn =
    gameMode === 'CAMPAIGN' || gameMode === 'PVE_CUSTOM'
      ? currentTurn === 'p1'
      : gameMode === 'PVP_P2P'
      ? currentTurn === myP2PSide
      : currentTurn === 'p1';

  const isInteractable =
    (gameMode === 'PVP_HOTSEAT' || isMyTurn) &&
    !isResolving &&
    !isAiThinking &&
    !winner &&
    player1.hp > 0 &&
    player2.hp > 0;

  const activeSkillFighter =
    gameMode === 'PVP_P2P'
      ? myP2PSide === 'p1'
        ? player1
        : player2
      : currentTurn === 'p1'
      ? player1
      : player2;

  const handleSurrender = () => {
    if (winner) return;
    soundEngine.playHurt();
    const surrenderingSide: 'p1' | 'p2' =
      gameMode === 'PVP_P2P'
        ? myP2PSide
        : gameMode === 'PVP_HOTSEAT'
        ? currentTurn
        : 'p1';

    if (gameMode === 'PVP_P2P') {
      p2pService.send({ type: 'SURRENDER', side: surrenderingSide });
    }

    if (surrenderingSide === 'p1') {
      setPlayer1((prev) => ({ ...prev, status: 'defeat' }));
      setPlayer2((prev) => ({ ...prev, status: 'victory' }));
      safeTimeout(() => setWinner('p2'), 850);
    } else {
      setPlayer2((prev) => ({ ...prev, status: 'defeat' }));
      setPlayer1((prev) => ({ ...prev, status: 'victory' }));
      safeTimeout(() => setWinner('p1'), 850);
    }
  };

  return (
    <div className="relative w-full flex-1 h-full flex flex-col justify-between bg-bronze-pattern text-stone-100 select-none overflow-hidden">
      {/* THANH ĐỈNH HOÀNG KIM ĐÔNG SƠN TRÀN VIỀN */}
      <div className="royal-header-bar flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToMap}
          className="flex items-center gap-1 text-xs font-bold text-yellow-300 hover:text-white px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-400/80 whitespace-nowrap shrink-0 cursor-pointer active:scale-95 transition shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Thoát</span>
        </button>

        {/* Tiêu đề chính GIAO CHIẾN đặt độc lập ở trung tâm */}
        <span className="text-xs sm:text-sm font-black font-display tracking-wider text-yellow-200 uppercase whitespace-nowrap truncate drop-shadow">
          {gameMode === 'CAMPAIGN' && stageNumber ? `GIAO CHIẾN · ẢI ${stageNumber}` : 'GIAO CHIẾN'}
        </span>

        {/* Cụm điều khiển mép phải: Nút 🏳️ Hàng + Đồng hồ + Âm thanh */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSurrender}
            className="px-2 py-1 rounded-lg bg-rose-950/95 hover:bg-rose-900 active:scale-95 text-rose-200 border border-rose-400/80 text-[11px] font-bold transition whitespace-nowrap shrink-0 cursor-pointer shadow"
            title="Xin hàng trận này"
          >
            🏳️ Hàng
          </button>

          {/* NÚT BIỂU TƯỢNG ĐỒNG HỒ: CHỈ CHỦ PHÒNG MỚI ĐƯỢC CÀI ĐẶT THỜI GIAN TRONG PVP 2 MÁY */}
          <button
            type="button"
            onClick={() => {
              if (gameMode === 'PVP_P2P' && !p2pIsHost) {
                soundEngine.playInvalidMove();
                addFloatingText('🔒 Chỉ Chủ Phòng mới có quyền cài đặt thời gian!', 'damage', 'p2');
                return;
              }
              setShowTimerModal(true);
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow ${
              localTurnTimerEnabled
                ? 'bg-amber-950/95 text-yellow-300 border-yellow-400/90 ring-1 ring-yellow-400/50'
                : 'bg-amber-950/70 text-amber-200 border-amber-600/70'
            }`}
            title={
              gameMode === 'PVP_P2P' && !p2pIsHost
                ? 'Thời gian do Chủ Phòng thiết lập'
                : 'Nhấn để cài đặt thời gian đếm ngược mỗi lượt'
            }
          >
            <Clock className={`w-3.5 h-3.5 ${localTurnTimerEnabled ? 'text-yellow-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="font-mono">{localTurnTimerEnabled ? `${localTimeLimit}s` : '∞'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-amber-950/90 text-yellow-300 border border-amber-400/70 cursor-pointer shadow"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* PHẦN 1: CHIẾN TRƯỜNG 3D TƯỚNG & 3 THANH CHỈ SỐ */}
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 flex flex-col px-1 sm:px-2 pt-0.5">
        <BattleStage2D
          player1={player1}
          player2={player2}
          currentTurn={currentTurn}
          floatingTexts={floatingTexts}
          isAiThinking={isAiThinking}
          slashActive={slashActive}
          slashTarget={slashTarget}
          gameMode={gameMode}
          turnTimerEnabled={localTurnTimerEnabled}
          timeLeft={timeLeft}
          onOpenTimerModal={() => {
            if (gameMode === 'PVP_P2P' && !p2pIsHost) {
              soundEngine.playInvalidMove();
              addFloatingText('🔒 Chỉ Chủ Phòng mới có quyền cài đặt thời gian!', 'damage', 'p2');
              return;
            }
            setShowTimerModal(true);
          }}
          localRole={myP2PSide}
        />
      </div>

      {/* PHẦN 2: BÀN CỜ MATCH-3 8X8 */}
      <div className="w-full max-w-md mx-auto relative shrink-0 flex flex-col justify-end px-1 sm:px-2 pb-1">
        <Match3Board
          board={board}
          selectedCoord={selectedCoord}
          onSelectTile={(r, c) => {
            if (r === -1) setSelectedCoord(null);
            else setSelectedCoord({ r, c });
          }}
          onSwapTiles={(r1, c1, r2, c2) => executeSwap(r1, c1, r2, c2)}
          isInteractable={isInteractable}
          isMyTurn={isMyTurn}
          extraTurnAlert={extraTurnAlert}
          comboAlert={comboAlert}
          gameMode={gameMode}
          vfxEvents={boardVfx}
          clearingCoords={clearingCoords}
        />
      </div>

      {/* ĐẾ ĐÁY HOÀNG KIM ĐÔNG SƠN TRÀN VIỀN: TUYỆT KỸ NỘ */}
      <SkillButtons
        fighter={activeSkillFighter}
        isTurn={isInteractable}
        onCastSkill={() => executeSkillCast(gameMode === 'PVP_P2P' ? myP2PSide : currentTurn)}
      />

      {/* HỘP THOẠI CÀI ĐẶT THỜI GIAN ĐỒNG HỒ */}
      {showTimerModal && (
        <TurnTimerModal
          enabled={localTurnTimerEnabled}
          timeLimit={localTimeLimit}
          onSave={handleSaveTimerSettings}
          onClose={() => setShowTimerModal(false)}
        />
      )}

      {/* MODAL KẾT THÚC TRẬN ĐẤU (VICTORY / DEFEAT) */}
      {winner && (
        <div className="modal-backdrop-safe">
          <div className="w-full max-w-sm bg-stone-900 border-2 border-amber-600 rounded-2xl p-4 sm:p-5 text-center shadow-2xl animate-in fade-in zoom-in-95 max-h-full overflow-y-auto">
            {(gameMode === 'PVP_P2P' ? winner === myP2PSide : winner === 'p1') ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-3xl mb-3 animate-bounce">
                  🏆
                </div>
                <h3 className="text-xl font-black font-display text-amber-300 uppercase tracking-wider">
                  ĐẠI THẮNG QUÂN ĐỊCH!
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  {gameMode === 'CAMPAIGN'
                    ? `Bạn đã xuất sắc đánh bại ${p2Warlord.name}, thu phục thành trì ${p2Warlord.territory} và mở rộng bờ cõi!`
                    : `Chúc mừng ${winner === 'p1' ? player1.name : player2.name} đã giành chiến thắng thuyết phục!`}
                </p>

                {(() => {
                  const goldMult = 1 + (prestigeLevel || 0) * 0.5;
                  const totalVictoryGold = Math.round((player1.goldEarnedThisMatch + 180) * goldMult);

                  return (
                    <>
                      <div className="mt-4 p-3 bg-stone-950 rounded-xl border border-amber-900/60 flex items-center justify-around text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px]">Tiền Vàng</span>
                          <strong className="text-yellow-400 font-bold">
                            +{totalVictoryGold} 🪙 {prestigeLevel > 0 && <span className="text-[10px] text-amber-300">(x{goldMult} NG+)</span>}
                          </strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Kinh Nghiệm</span>
                          <strong className="text-emerald-400 font-bold">+100 EXP</strong>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {gameMode === 'CAMPAIGN' && stageNumber && stageNumber < 12 ? (
                          <button
                            type="button"
                            onClick={() => onVictory(totalVictoryGold, p2Warlord.id, stageNumber + 1)}
                            className="w-full py-3 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FastForward className="w-4 h-4 fill-stone-950" />
                            <span>QUA ẢI TIẾP THEO (ẢI {stageNumber + 1})</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onVictory(totalVictoryGold, p2Warlord.id)}
                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
                          >
                            TIẾP TỤC HÀNH QUÂN
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onVictory(totalVictoryGold, p2Warlord.id)}
                          className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 text-amber-200 border border-amber-800/60 text-xs rounded-xl font-bold cursor-pointer active:scale-95 transition"
                        >
                          {gameMode === 'CAMPAIGN' && stageNumber && stageNumber < 12
                            ? `VỀ BẢN ĐỒ HÀNH QUÂN (ĐÃ MỞ KHÓA ẢI ${stageNumber + 1})`
                            : 'VỀ BẢN ĐỒ HÀNH QUÂN'}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 mx-auto flex items-center justify-center text-3xl mb-3">
                  💀
                </div>
                <h3 className="text-xl font-black font-display text-rose-400 uppercase tracking-wider">
                  QUÂN MAI PHỤC THẤT BẠI!
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  {gameMode === 'CAMPAIGN'
                    ? `Sức mạnh của ${p2Warlord.name} quá thâm hậu. Hãy tích lũy vàng mua thêm vũ khí, giáp trụ và quay lại phục thù!`
                    : `Chúc mừng ${winner === 'p1' ? player1.name : player2.name} đã xuất sắc chiến thắng ván đấu đối kháng!`}
                </p>

                <button
                  type="button"
                  onClick={onDefeat}
                  className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow active:scale-95 transition mt-4"
                >
                  RÚT QUÂN VỀ CĂN CỨ
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
