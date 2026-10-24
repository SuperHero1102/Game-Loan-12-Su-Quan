/**
 * Loạn 12 Sứ Quân — Battle Screen Orchestrator
 * Điều phối trận đấu Match-3, hoạt cảnh 3D Tướng & Thú Cưỡi, 3 thanh chỉ số,
 * cơ chế Tốc Độ (SPD) quyết định lượt 1, Nội Tại Vai Trò (Role Passives),
 * và đồng hồ đếm ngược thời gian mỗi lượt.
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Tile, FighterState, FloatingText, GameMode, Warlord } from '../../types/game';
import {
  createInitialBoard,
  testSwapCreatesMatch,
  resolveCascade,
  findBestAIMove,
  areAdjacent,
  GRID_ROWS,
  GRID_COLS,
} from '../../game/match3Engine';
import { BattleStage2D } from './BattleStage2D';
import { Match3Board } from './Match3Board';
import { SkillButtons } from './SkillButtons';
import { VirtualDpad } from './VirtualDpad';
import { TurnTimerModal } from '../common/TurnTimerModal';
import { soundEngine } from '../../services/audio';
import { p2pService } from '../../services/p2p';
import { ArrowLeft, Volume2, VolumeX, FastForward, Clock } from 'lucide-react';

interface BattleScreenProps {
  gameMode: GameMode;
  p1Warlord: Warlord;
  p2Warlord: Warlord;
  stageNumber?: number;
  playerLevel: number;
  bonusAtk: number;
  bonusDef: number;
  bonusHp: number;
  bonusArmor?: number;
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
  bonusAtk,
  bonusDef,
  bonusHp,
  bonusArmor = 0,
  onVictory,
  onDefeat,
  onBackToMap,
  isMuted,
  onToggleMute,
  turnTimerEnabled = true,
  turnTimeLimit = 20,
  onUpdateTurnTimer,
}) => {
  // Initialize Fighters with 3 Authentic Bars + 3D Mount/Weapon/Role/SPD attributes
  const [player1, setPlayer1] = useState<FighterState>(() => ({
    id: p1Warlord.id,
    name: p1Warlord.name,
    title: p1Warlord.title,
    avatarEmoji: p1Warlord.avatarEmoji,
    avatarColor: p1Warlord.avatarColor,
    characterVisual: p1Warlord.characterVisual,
    hp: p1Warlord.baseHp + bonusHp,
    maxHp: p1Warlord.baseHp + bonusHp,
    armor: p1Warlord.baseArmor + bonusArmor, // Giáp Xanh Lá
    maxArmor: 160,
    mana: p1Warlord.id === 'ngo_nhat_khanh' ? 35 : 20, // Ngô Nhật Khánh nội tại khởi đầu +Mana
    maxMana: p1Warlord.skillCost,
    atk: p1Warlord.baseAtk + bonusAtk,
    def: p1Warlord.baseDef + bonusDef,
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
  }));

  const [player2, setPlayer2] = useState<FighterState>(() => ({
    id: p2Warlord.id,
    name: p2Warlord.name,
    title: p2Warlord.title,
    avatarEmoji: p2Warlord.avatarEmoji,
    avatarColor: p2Warlord.avatarColor,
    characterVisual: p2Warlord.characterVisual,
    hp: p2Warlord.baseHp,
    maxHp: p2Warlord.baseHp,
    armor: p2Warlord.baseArmor, // Giáp Xanh Lá
    maxArmor: 160,
    mana: p2Warlord.id === 'ngo_nhat_khanh' ? 35 : 15,
    maxMana: p2Warlord.skillCost,
    atk: p2Warlord.baseAtk,
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
  }));

  const [board, setBoard] = useState<Tile[][]>(() => createInitialBoard());
  const [selectedCoord, setSelectedCoord] = useState<{ r: number; c: number } | null>(null);
  // TỐC ĐỘ (SPD) QUYẾT ĐỊNH AI ĐÁNH TRƯỚC Ở LƯỢT 1!
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>(() =>
    p1Warlord.spd >= p2Warlord.spd ? 'p1' : 'p2'
  );
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Visual Effects State
  const [slashActive, setSlashActive] = useState(false);
  const [slashTarget, setSlashTarget] = useState<'p1' | 'p2' | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [extraTurnAlert, setExtraTurnAlert] = useState(false);
  const [comboAlert] = useState(0);

  // Keypad & D-Pad State
  const [showDpad, setShowDpad] = useState(false);
  const [dpadCursor, setDpadCursor] = useState<{ r: number; c: number }>({ r: 3, c: 3 });

  // Match Outcome
  const [winner, setWinner] = useState<'p1' | 'p2' | null>(null);

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
    if (onUpdateTurnTimer) {
      onUpdateTurnTimer(enabled, newLimit);
    }
  };

  const addFloatingText = useCallback((text: string, type: FloatingText['type'], target: 'p1' | 'p2') => {
    const id = `float_${Date.now()}_${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, type, target }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 950);
  }, []);

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
    if (currentTurn === 'p1' && player1.id === 'nguyen_khoan') {
      setPlayer1((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 15) }));
      addFloatingText('+15 HP (Nội Tại)', 'heal', 'p1');
    } else if (currentTurn === 'p2' && player2.id === 'nguyen_khoan') {
      setPlayer2((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 15) }));
      addFloatingText('+15 HP (Nội Tại)', 'heal', 'p2');
    }
  }, [currentTurn, winner, player1.id, player2.id, addFloatingText]);

  // Turn Countdown Timer Effect: Khi hết giờ không ra chiêu thì chuyển lượt sang bên khác
  useEffect(() => {
    if (!localTurnTimerEnabled || winner || isResolving) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          soundEngine.playBronzeGong();
          addFloatingText('⏳ HẾT GIỜ!', 'damage', currentTurn);
          setCurrentTurn((t) => (t === 'p1' ? 'p2' : 'p1'));
          return localTimeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [localTurnTimerEnabled, localTimeLimit, winner, isResolving, currentTurn, addFloatingText]);

  // Reset timer on turn switch
  useEffect(() => {
    setTimeLeft(localTimeLimit);
  }, [currentTurn, localTimeLimit]);

  // Subscribe to P2P network moves if in P2P mode
  useEffect(() => {
    if (gameMode !== 'PVP_P2P') return;

    const unsubscribe = p2pService.subscribe((msg) => {
      if (msg.type === 'SWAP_MOVE') {
        executeSwap(msg.r1, msg.c1, msg.r2, msg.c2, true);
      } else if (msg.type === 'CAST_SKILL') {
        executeSkillCast('p2');
      } else if (msg.type === 'SURRENDER') {
        setWinner('p1');
      }
    });

    return () => unsubscribe();
  });

  // Execute Swap & Dynamic Feedback Loop with Role Passives
  const executeSwap = useCallback(
    (r1: number, c1: number, r2: number, c2: number, isRemoteP2P = false) => {
      if (isResolving) return;

      const isValid = testSwapCreatesMatch(board, r1, c1, r2, c2);
      if (!isValid) {
        soundEngine.playSwordHit();
        setSelectedCoord(null);
        return;
      }

      setIsResolving(true);
      setSelectedCoord(null);

      // Send to P2P peer if we made this move
      if (gameMode === 'PVP_P2P' && !isRemoteP2P) {
        p2pService.send({ type: 'SWAP_MOVE', r1, c1, r2, c2 });
      }

      // Clone and swap
      const tempBoard = board.map((row) => row.map((t) => ({ ...t })));
      const t1 = tempBoard[r1][c1];
      const t2 = tempBoard[r2][c2];
      tempBoard[r1][c1] = { ...t2, row: r1, col: c1 };
      tempBoard[r2][c2] = { ...t1, row: r2, col: c2 };

      // Resolve matches and gravity cascade
      const result = resolveCascade(tempBoard);
      setBoard(result.newBoard);

      // Determine attacker and defender
      const activeFighter = currentTurn === 'p1' ? player1 : player2;
      const defenderFighter = currentTurn === 'p1' ? player2 : player1;
      const targetSide = currentTurn === 'p1' ? 'p2' : 'p1';

      // Hệ số Nội Tại Đinh Bộ Lĩnh (Chân Mệnh Thiên Tử: +15% hiệu quả mọi loại ngọc)
      const isDinhBoLinh = activeFighter.id === 'dinh_bo_linh';
      const emperorMultiplier = isDinhBoLinh ? 1.15 : 1.0;

      // 1. SÁT THƯƠNG ĐOẢN KIẾM HOẶC HUYẾT KIẾM + NỘI TẠI TƯỚNG
      if (result.totalSwords > 0) {
        // Nội tại Phạm Bạch Hổ / Tốc Độ cao: tăng tỷ lệ bạo kích
        const speedCritChance = Math.max(0.05, (activeFighter.spd - 45) * 0.005);
        const isSpeedCrit = Math.random() < speedCritChance;
        const isBloodCrit = result.hasBloodSwordCrit || isSpeedCrit;

        if (isBloodCrit) {
          soundEngine.playBloodSwordSlash();
        } else {
          soundEngine.playSwordHit(result.totalSwords >= 4);
        }

        setSlashActive(true);
        setSlashTarget(targetSide);
        setTimeout(() => setSlashActive(false), 450);

        // Attacker strikes with 3D animation!
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({ ...prev, status: 'attacking' }));
        } else {
          setPlayer2((prev) => ({ ...prev, status: 'attacking' }));
        }

        // Tính sát thương cơ bản + Nội tại Kiều Công Hãn (Xạ Kỵ Thần Tốc +25%) / Nguyễn Thủ Tiệp (+25% sát thương lên Giáp)
        let roleBonusMultiplier = emperorMultiplier;
        if (activeFighter.id === 'kieu_cong_han') roleBonusMultiplier *= 1.25;
        if (activeFighter.id === 'pham_bach_ho' && activeFighter.hp < activeFighter.maxHp * 0.5) {
          roleBonusMultiplier *= 1.3;
        }
        // Nội tại Kiều Thuận (Hồi Long Liên Kích: 25% đánh đúp)
        const isDoubleStrike = activeFighter.id === 'kieu_thuan' && Math.random() < 0.25;
        if (isDoubleStrike) roleBonusMultiplier *= 1.5;

        const baseDmg = result.totalSwords * (activeFighter.atk * 0.9) * roleBonusMultiplier;
        const rawDamage = Math.round(isBloodCrit ? baseDmg * 1.85 : baseDmg);

        // Nội tại Lý Khuê (Cuồng Sư Phá Giáp: xuyên 40% Giáp)
        const armorPierceRatio =
          activeFighter.id === 'ly_khue' ? 0.45 : isBloodCrit ? 0.5 : 0.85;

        if (targetSide === 'p2') {
          setPlayer2((prev) => {
            soundEngine.playHurt();
            let remainDmg = rawDamage;
            let newArmor = prev.armor;

            // Nội tại Đỗ Cảnh Thạc / Phạm Phòng Át giảm sát thương nhận vào
            if (prev.id === 'do_canh_thac' || prev.id === 'pham_phong_at') {
              remainDmg = Math.round(remainDmg * 0.82);
            }

            if (newArmor > 0) {
              const absorbCap = Math.round(newArmor * armorPierceRatio);
              const absorbed = Math.min(absorbCap, remainDmg);
              newArmor -= absorbed;
              remainDmg -= absorbed;
            }

            const newHp = Math.max(0, prev.hp - remainDmg);
            return {
              ...prev,
              armor: newArmor,
              hp: newHp,
              status: 'hurt',
            };
          });

          if (isBloodCrit) {
            addFloatingText(`💥 BẠO KÍCH -${rawDamage}!`, 'crit', 'p2');
          } else {
            addFloatingText(`-${rawDamage}`, 'damage', 'p2');
          }
        } else {
          setPlayer1((prev) => {
            soundEngine.playHurt();
            let remainDmg = rawDamage;
            let newArmor = prev.armor;

            if (prev.id === 'do_canh_thac' || prev.id === 'pham_phong_at') {
              remainDmg = Math.round(remainDmg * 0.82);
            }

            if (newArmor > 0) {
              const absorbCap = Math.round(newArmor * armorPierceRatio);
              const absorbed = Math.min(absorbCap, remainDmg);
              newArmor -= absorbed;
              remainDmg -= absorbed;
            }

            const newHp = Math.max(0, prev.hp - remainDmg);
            return {
              ...prev,
              armor: newArmor,
              hp: newHp,
              status: 'hurt',
            };
          });

          if (isBloodCrit) {
            addFloatingText(`💥 BẠO KÍCH -${rawDamage}!`, 'crit', 'p1');
          } else {
            addFloatingText(`-${rawDamage}`, 'damage', 'p1');
          }
        }

        // Nội tại Lữ Đường (Khiên Quỷ Phản Đòn: phản 20% sát thương)
        if (defenderFighter.id === 'lu_duong') {
          const reflectDmg = Math.max(8, Math.round(rawDamage * 0.2));
          if (currentTurn === 'p1') {
            setPlayer1((prev) => ({ ...prev, hp: Math.max(1, prev.hp - reflectDmg) }));
            addFloatingText(`🛡️ Phản Đòn -${reflectDmg}`, 'damage', 'p1');
          } else {
            setPlayer2((prev) => ({ ...prev, hp: Math.max(1, prev.hp - reflectDmg) }));
            addFloatingText(`🛡️ Phản Đòn -${reflectDmg}`, 'damage', 'p2');
          }
        }
      }

      // 2. HỒI PHỤC TRÁI TIM (ĂN TIM) + Nội tại Trần Lãm (+30% hồi máu)
      if (result.totalHearts > 0) {
        soundEngine.playHeal();
        const tranLamBonus = activeFighter.id === 'tran_lam' ? 1.3 : emperorMultiplier;
        const healAmt = Math.round(result.totalHearts * 30 * tranLamBonus);
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + healAmt),
            status: 'heal',
          }));
          addFloatingText(`+${healAmt} HP`, 'heal', 'p1');
        } else {
          setPlayer2((prev) => ({
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + healAmt),
            status: 'heal',
          }));
          addFloatingText(`+${healAmt} HP`, 'heal', 'p2');
        }
      }

      // 3. BÁNH CHƯNG XANH TĂNG GIÁP + Nội tại Nguyễn Siêu (+35% Giáp)
      if (result.totalChungCakes > 0) {
        soundEngine.playShield();
        const nguyenSieuBonus = activeFighter.id === 'nguyen_sieu' ? 1.35 : emperorMultiplier;
        const armorAmt = Math.round(result.totalChungCakes * 16 * nguyenSieuBonus);
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({
            ...prev,
            armor: Math.min(prev.maxArmor, prev.armor + armorAmt),
            status: 'shield',
          }));
          addFloatingText(`+${armorAmt} Giáp`, 'armor', 'p1');
        } else {
          setPlayer2((prev) => ({
            ...prev,
            armor: Math.min(prev.maxArmor, prev.armor + armorAmt),
            status: 'shield',
          }));
          addFloatingText(`+${armorAmt} Giáp`, 'armor', 'p2');
        }
      }

      // 4. NGỌC THÁI CỰC TÍCH NỘ (ĂN ÂM DƯƠNG) + Nội tại Ngô Xương Xí / Ngô Nhật Khánh
      if (result.totalYinYang > 0) {
        soundEngine.playChiGathering();
        const manaBonus =
          activeFighter.id === 'ngo_xuong_xi' || activeFighter.id === 'ngo_nhat_khanh'
            ? Math.ceil(result.totalYinYang * 1.25)
            : Math.ceil(result.totalYinYang * emperorMultiplier);
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({
            ...prev,
            mana: Math.min(prev.maxMana, prev.mana + manaBonus),
            status: prev.status === 'idle' ? 'mana' : prev.status,
          }));
          addFloatingText(`+${manaBonus} Mana`, 'skill', 'p1');
        } else {
          setPlayer2((prev) => ({
            ...prev,
            mana: Math.min(prev.maxMana, prev.mana + manaBonus),
            status: prev.status === 'idle' ? 'mana' : prev.status,
          }));
          addFloatingText(`+${manaBonus} Mana`, 'skill', 'p2');
        }
      }

      // 5. THỎI VÀNG (ĂN VÀNG)
      if (result.totalGold > 0) {
        soundEngine.playGold();
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({
            ...prev,
            goldEarnedThisMatch: prev.goldEarnedThisMatch + result.totalGold,
          }));
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

        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + elixirHeal),
            mana: Math.min(prev.maxMana, prev.mana + elixirMana),
            atk: prev.atk + elixirAtkBonus,
            status: prev.status === 'idle' ? 'heal' : prev.status,
          }));
          addFloatingText(
            `🍇 Linh Đan +${elixirHeal}HP +${elixirMana}MP +${elixirAtkBonus}ATK`,
            'heal',
            'p1'
          );
        } else {
          setPlayer2((prev) => ({
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + elixirHeal),
            mana: Math.min(prev.maxMana, prev.mana + elixirMana),
            atk: prev.atk + elixirAtkBonus,
            status: prev.status === 'idle' ? 'heal' : prev.status,
          }));
          addFloatingText(
            `🍇 Linh Đan +${elixirHeal}HP +${elixirMana}MP +${elixirAtkBonus}ATK`,
            'heal',
            'p2'
          );
        }
      }

      // Reset animation statuses after complete strike and return to defensive stance (nếu chưa kết thúc trận)
      setTimeout(() => {
        setPlayer1((prev) =>
          prev.status === 'victory' || prev.status === 'defeat' ? prev : { ...prev, status: 'idle' }
        );
        setPlayer2((prev) =>
          prev.status === 'victory' || prev.status === 'defeat' ? prev : { ...prev, status: 'idle' }
        );
      }, 620);

      // Check Turn Transition, Victory/Defeat ("Ta xin hàng!"), or Extra Turn (Ăn 4-5 viên)
      setTimeout(() => {
        setIsResolving(false);

        setPlayer2((p2) => {
          if (p2.hp <= 0) {
            soundEngine.playVictory();
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            setPlayer1((p1Prev) => ({ ...p1Prev, status: 'victory' }));
            setTimeout(() => setWinner('p1'), 1350);
            return { ...p2, status: 'defeat' };
          }
          return p2;
        });

        setPlayer1((p1) => {
          if (p1.hp <= 0) {
            setPlayer2((p2Prev) => ({ ...p2Prev, status: 'victory' }));
            setTimeout(() => setWinner('p2'), 1350);
            return { ...p1, status: 'defeat' };
          }
          return p1;
        });

        if (result.extraTurn) {
          soundEngine.playThunderExtraTurn();
          setExtraTurnAlert(true);
          setTimeout(() => setExtraTurnAlert(false), 1400);
          addFloatingText('⚡ THÊM LƯỢT ĐÁNH!', 'extra_turn', currentTurn);
        } else {
          setCurrentTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'));
        }
      }, 660);
    },
    [board, currentTurn, isResolving, player1, player2, gameMode, addFloatingText]
  );

  // Execute Ultimate Martial Art Skill Cast (3D Cutscene + Heavy Strike)
  const executeSkillCast = useCallback(
    (caster: 'p1' | 'p2') => {
      soundEngine.playSkillCast();
      setSlashActive(true);
      setSlashTarget(caster === 'p1' ? 'p2' : 'p1');
      setTimeout(() => setSlashActive(false), 620);

      if (caster === 'p1') {
        const skillMultiplier = player1.id === 'ngo_xuong_xi' ? 5.2 : 4.6;
        const skillDmg = Math.round(player1.atk * skillMultiplier);
        setPlayer1((prev) => ({ ...prev, mana: 0, status: 'skill' }));
        setPlayer2((prev) => {
          soundEngine.playHurt();
          let remain = skillDmg;
          let newArmor = prev.armor;
          if (newArmor > 0) {
            const absorbed = Math.min(newArmor, remain);
            newArmor -= absorbed;
            remain -= absorbed;
          }
          const nextHp = Math.max(0, prev.hp - remain);
          if (nextHp <= 0) {
            soundEngine.playVictory();
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            setTimeout(() => {
              setPlayer1((p1Prev) => ({ ...p1Prev, status: 'victory' }));
              setPlayer2((p2Prev) => ({ ...p2Prev, status: 'defeat' }));
            }, 450);
            setTimeout(() => setWinner('p1'), 1650);
          }
          return {
            ...prev,
            armor: newArmor,
            hp: nextHp,
            status: 'hurt',
          };
        });
        addFloatingText(`${player1.skillName}!`, 'skill', 'p1');
        addFloatingText(`💥 -${skillDmg} TUYỆT KỸ!`, 'crit', 'p2');
      } else {
        const skillMultiplier = player2.id === 'ngo_xuong_xi' ? 4.9 : 4.3;
        const skillDmg = Math.round(player2.atk * skillMultiplier);
        setPlayer2((prev) => ({ ...prev, mana: 0, status: 'skill' }));
        setPlayer1((prev) => {
          soundEngine.playHurt();
          let remain = skillDmg;
          let newArmor = prev.armor;
          if (newArmor > 0) {
            const absorbed = Math.min(newArmor, remain);
            newArmor -= absorbed;
            remain -= absorbed;
          }
          const nextHp = Math.max(0, prev.hp - remain);
          if (nextHp <= 0) {
            setTimeout(() => {
              setPlayer2((p2Prev) => ({ ...p2Prev, status: 'victory' }));
              setPlayer1((p1Prev) => ({ ...p1Prev, status: 'defeat' }));
            }, 450);
            setTimeout(() => setWinner('p2'), 1650);
          }
          return {
            ...prev,
            armor: newArmor,
            hp: nextHp,
            status: 'hurt',
          };
        });
        addFloatingText(`${player2.skillName}!`, 'skill', 'p2');
        addFloatingText(`💥 -${skillDmg} TUYỆT KỸ!`, 'crit', 'p1');
      }

      setTimeout(() => {
        setPlayer1((prev) =>
          prev.status === 'victory' || prev.status === 'defeat' ? prev : { ...prev, status: 'idle' }
        );
        setPlayer2((prev) =>
          prev.status === 'victory' || prev.status === 'defeat' ? prev : { ...prev, status: 'idle' }
        );
      }, 680);
    },
    [player1.atk, player1.id, player1.skillName, player2.atk, player2.id, player2.skillName, addFloatingText]
  );

  // AI Turn Handling for Campaign Mode & PvE Custom Mode
  useEffect(() => {
    if (winner || player1.hp <= 0 || player2.hp <= 0) return;

    const isAiTurn =
      currentTurn === 'p2' && (gameMode === 'CAMPAIGN' || gameMode === 'PVE_CUSTOM') && !isResolving;

    if (isAiTurn) {
      setIsAiThinking(true);

      const delay = gameMode === 'PVE_CUSTOM' ? 700 : 850;
      const timer = setTimeout(() => {
        if (player2.mana >= player2.skillCost) {
          executeSkillCast('p2');
          setIsAiThinking(false);
          setCurrentTurn('p1');
          return;
        }

        const bestMove = findBestAIMove(board, p2Warlord.aiAggressiveness);
        setIsAiThinking(false);

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
    isResolving,
    board,
    p2Warlord.aiAggressiveness,
    winner,
    player1.hp,
    player2.hp,
    player2.mana,
    player2.skillCost,
    executeSwap,
    executeSkillCast,
  ]);

  // Virtual D-pad Movement handlers
  const handleDpadMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    setDpadCursor((prev) => {
      let r = prev.r;
      let c = prev.c;
      if (direction === 'up' && r > 0) r--;
      if (direction === 'down' && r < GRID_ROWS - 1) r++;
      if (direction === 'left' && c > 0) c--;
      if (direction === 'right' && c < GRID_COLS - 1) c++;
      return { r, c };
    });
  };

  const handleDpadSelect = () => {
    if (!selectedCoord) {
      setSelectedCoord(dpadCursor);
    } else if (selectedCoord.r === dpadCursor.r && selectedCoord.c === dpadCursor.c) {
      setSelectedCoord(null);
    } else if (areAdjacent(selectedCoord.r, selectedCoord.c, dpadCursor.r, dpadCursor.c)) {
      executeSwap(selectedCoord.r, selectedCoord.c, dpadCursor.r, dpadCursor.c);
    } else {
      setSelectedCoord(dpadCursor);
    }
  };

  const isMyTurn = gameMode === 'CAMPAIGN' || gameMode === 'PVE_CUSTOM' ? currentTurn === 'p1' : true;
  const isInteractable = isMyTurn && !isResolving && !isAiThinking && !winner && player1.hp > 0 && player2.hp > 0;

  const handleSurrender = () => {
    if (winner) return;
    soundEngine.playHurt();
    if (gameMode === 'PVP_P2P') {
      p2pService.send({ type: 'SURRENDER' });
    }
    const surrenderingSide = gameMode === 'PVP_HOTSEAT' ? currentTurn : 'p1';
    if (surrenderingSide === 'p1') {
      setPlayer1((prev) => ({ ...prev, status: 'defeat' }));
      setPlayer2((prev) => ({ ...prev, status: 'victory' }));
      setTimeout(() => setWinner('p2'), 900);
    } else {
      setPlayer2((prev) => ({ ...prev, status: 'defeat' }));
      setPlayer1((prev) => ({ ...prev, status: 'victory' }));
      setTimeout(() => setWinner('p1'), 900);
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

          {/* NÚT BIỂU TƯỢNG ĐỒNG HỒ: MỞ FORM CÀI ĐẶT THỜI GIAN ĐẾM NGƯỢC */}
          <button
            type="button"
            onClick={() => setShowTimerModal(true)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow ${
              localTurnTimerEnabled
                ? 'bg-amber-950/95 text-yellow-300 border-yellow-400/90 ring-1 ring-yellow-400/50'
                : 'bg-amber-950/70 text-amber-200 border-amber-600/70'
            }`}
            title="Nhấn để cài đặt thời gian đếm ngược mỗi lượt"
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
          onOpenTimerModal={() => setShowTimerModal(true)}
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
          extraTurnAlert={extraTurnAlert}
          comboAlert={comboAlert}
        />
      </div>

      {/* ĐẾ ĐÁY HOÀNG KIM ĐÔNG SƠN TRÀN VIỀN: TUYỆT KỸ NỘ */}
      <SkillButtons
        fighter={currentTurn === 'p1' ? player1 : player2}
        isTurn={isInteractable}
        onCastSkill={() => executeSkillCast(currentTurn)}
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
            {winner === 'p1' ? (
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
                    : `Chúc mừng ${player1.name} đã đánh bại ${player2.name} và giành vương miện bá chủ!`}
                </p>

                <div className="mt-4 p-3 bg-stone-950 rounded-xl border border-amber-900/60 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Tiền Vàng</span>
                    <strong className="text-yellow-400 font-bold">+{player1.goldEarnedThisMatch + 180} 🪙</strong>
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
                      onClick={() => onVictory(player1.goldEarnedThisMatch + 180, p2Warlord.id, stageNumber + 1)}
                      className="w-full py-3 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5"
                    >
                      <FastForward className="w-4 h-4 fill-stone-950" />
                      <span>QUA ẢI TIẾP THEO (ẢI {stageNumber + 1})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onVictory(player1.goldEarnedThisMatch + 180, p2Warlord.id)}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition"
                    >
                      TIẾP TỤC HÀNH QUÂN
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onVictory(player1.goldEarnedThisMatch + 180, p2Warlord.id)}
                    className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 text-amber-200 border border-amber-800/60 text-xs rounded-xl font-bold cursor-pointer active:scale-95 transition"
                  >
                    {gameMode === 'CAMPAIGN' && stageNumber && stageNumber < 12
                      ? `VỀ BẢN ĐỒ HÀNH QUÂN (ĐÃ MỞ KHÓA ẢI ${stageNumber + 1})`
                      : 'VỀ BẢN ĐỒ HÀNH QUÂN'}
                  </button>
                </div>
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
                    : `Chúc mừng ${player2.name} đã xuất sắc chiến thắng ván đấu đối kháng!`}
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
