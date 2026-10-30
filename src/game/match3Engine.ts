/**
 * Loạn 12 Sứ Quân — Match-3 Battle Engine Core
 * Handles 8x8 grid generation, deterministic seeded P2P boards, swaps, matches, cascades, gravity, combos,
 * and multi-tier AI intelligence calibrated accurately for EASY / MEDIUM / HARD / HELL & Campaign Stages 1-12.
 */

import { Tile, TileType, SpecialTileType } from '../types/game';

export const GRID_ROWS = 8;
export const GRID_COLS = 8;

export const TILE_TYPES: TileType[] = [
  'SWORD',
  'HEART',
  'GOLD',
  'CHUNG_CAKE',
  'YIN_YANG',
  'ELIXIR',
];

export interface MatchGroup {
  type: TileType;
  tiles: { row: number; col: number; isBloodSword?: boolean }[];
  isSpecialCreation: SpecialTileType;
  createsBloodSword?: boolean;
}

export interface BoardVfx {
  id: string;
  r: number;
  c: number;
  type: 'explosion' | 'lightning' | 'slash' | 'burst';
  tileType: TileType;
  isSpecial?: boolean;
}

export interface MatchTurnResult {
  newBoard: Tile[][];
  totalSwords: number;
  bloodSwordsMatched: number;
  hasBloodSwordCrit: boolean;
  totalHearts: number;
  totalGold: number;
  totalChungCakes: number;
  totalYinYang: number;
  totalElixirs: number;
  comboCount: number;
  extraTurn: boolean;
  clearedTileCount: number;
  specialExplosions: number;
  vfxEvents: BoardVfx[];
}

let nextTileId = 1;

/**
 * Deterministic PRNG (Mulberry32) so 2-Device P2P boards and cascades stay 100% identical
 */
export function createSeededRng(seed?: number): () => number {
  if (typeof seed !== 'number' || Number.isNaN(seed)) {
    return () => Math.random();
  }
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const generateTileId = (rng: () => number = Math.random) =>
  `tile_${nextTileId++}_${Math.floor(rng() * 100000).toString(36)}`;

export const getRandomTileType = (rng: () => number = Math.random): TileType => {
  const idx = Math.floor(rng() * TILE_TYPES.length);
  return TILE_TYPES[idx];
};

// Create a pristine 8x8 board with NO starting matches, random Blood Swords, and guaranteed valid moves
export const createInitialBoard = (seed?: number): Tile[][] => {
  const rng = createSeededRng(seed);
  let board: Tile[][] = [];
  let attempts = 0;

  do {
    board = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        // Exclude types that would form match of 3 right away
        const forbidden: TileType[] = [];
        if (c >= 2 && row[c - 1].type === row[c - 2].type) {
          forbidden.push(row[c - 1].type);
        }
        if (r >= 2 && board[r - 1][c].type === board[r - 2][c].type) {
          forbidden.push(board[r - 1][c].type);
        }

        const validTypes = TILE_TYPES.filter((t) => !forbidden.includes(t));
        const chosenType =
          validTypes[Math.floor(rng() * validTypes.length)] || getRandomTileType(rng);

        // 8% chance for sword to be Huyết Kiếm (Kiếm Đỏ Thẫm)
        const isBlood = chosenType === 'SWORD' && rng() < 0.08;

        row.push({
          id: generateTileId(rng),
          type: chosenType,
          special: 'NORMAL',
          row: r,
          col: c,
          isBloodSword: isBlood,
        });
      }
      board.push(row);
    }
    attempts++;
  } while (!hasAnyValidMoves(board) && attempts < 20);

  return board;
};

// Find matches in the current board
export const findMatches = (board: Tile[][]): MatchGroup[] => {
  const groups: MatchGroup[] = [];

  // Check horizontal matches
  for (let r = 0; r < GRID_ROWS; r++) {
    let matchLen = 1;
    for (let c = 1; c <= GRID_COLS; c++) {
      if (c < GRID_COLS && board[r][c].type === board[r][c - 1].type) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const tiles: { row: number; col: number; isBloodSword?: boolean }[] = [];
          for (let k = c - matchLen; k < c; k++) {
            const t = board[r][k];
            tiles.push({ row: r, col: k, isBloodSword: t.isBloodSword });
          }
          let special: SpecialTileType = 'NORMAL';
          if (matchLen === 4) special = 'BOMB_4';
          else if (matchLen >= 5) special = 'LIGHTNING_5';

          const createsBlood = board[r][c - 1].type === 'SWORD' && matchLen >= 4;

          groups.push({
            type: board[r][c - 1].type,
            tiles,
            isSpecialCreation: special,
            createsBloodSword: createsBlood,
          });
        }
        matchLen = 1;
      }
    }
  }

  // Check vertical matches
  for (let c = 0; c < GRID_COLS; c++) {
    let matchLen = 1;
    for (let r = 1; r <= GRID_ROWS; r++) {
      if (r < GRID_ROWS && board[r][c].type === board[r - 1][c].type) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const tiles: { row: number; col: number; isBloodSword?: boolean }[] = [];
          for (let k = r - matchLen; k < r; k++) {
            const t = board[k][c];
            tiles.push({ row: k, col: c, isBloodSword: t.isBloodSword });
          }
          let special: SpecialTileType = 'NORMAL';
          if (matchLen === 4) special = 'BOMB_4';
          else if (matchLen >= 5) special = 'LIGHTNING_5';

          const createsBlood = board[r - 1][c].type === 'SWORD' && matchLen >= 4;

          groups.push({
            type: board[r - 1][c].type,
            tiles,
            isSpecialCreation: special,
            createsBloodSword: createsBlood,
          });
        }
        matchLen = 1;
      }
    }
  }

  return groups;
};

// Check if two coords are adjacent
export const areAdjacent = (r1: number, c1: number, r2: number, c2: number): boolean => {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
};

// Check if any valid moves exist on the board
export const hasAnyValidMoves = (board: Tile[][]): boolean => {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (c < GRID_COLS - 1 && testSwapCreatesMatch(board, r, c, r, c + 1)) return true;
      if (r < GRID_ROWS - 1 && testSwapCreatesMatch(board, r, c, r + 1, c)) return true;
    }
  }
  return false;
};

// Helper: simulate swap and check for matches or special activations
export const testSwapCreatesMatch = (
  board: Tile[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean => {
  if (
    r1 < 0 ||
    r1 >= GRID_ROWS ||
    c1 < 0 ||
    c1 >= GRID_COLS ||
    r2 < 0 ||
    r2 >= GRID_ROWS ||
    c2 < 0 ||
    c2 >= GRID_COLS
  ) {
    return false;
  }
  const t1 = board[r1]?.[c1];
  const t2 = board[r2]?.[c2];
  if (!t1 || !t2) return false;

  // 1. Kích hoạt trực tiếp ngọc đặc biệt (BOMB_4 hoặc LIGHTNING_5)
  // Khi người chơi hoán đổi ngọc đặc biệt với bất kỳ ô lân cận nào
  // hoặc khi chạm/click trực tiếp vào ô đặc biệt (r1 === r2 && c1 === c2)
  if (t1.special !== 'NORMAL' || t2.special !== 'NORMAL') {
    return true;
  }

  // 2. Nếu người chơi ấn/gạt 2 ô cùng loại nằm trong dãy đã có sẵn từ 3 ô trở lên (ví dụ dãy 5-6 ô trên bàn cờ):
  if (t1.type === t2.type) {
    const existing = findMatches(board);
    const inMatch = existing.some((g) =>
      g.tiles.some(
        (tc) => (tc.row === r1 && tc.col === c1) || (tc.row === r2 && tc.col === c2)
      )
    );
    if (inMatch) return true;
  }

  // 3. Hoán đổi thông thường và kiểm tra tạo thành dãy ăn >= 3
  const temp = board.map((row) => [...row]);
  temp[r1][c1] = { ...t2, row: r1, col: c1 };
  temp[r2][c2] = { ...t1, row: r2, col: c2 };

  return findMatches(temp).length > 0;
};

export interface SwapContext {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

// Execute full match, Blood Sword check, and cascade resolution
export const resolveCascade = (
  initialBoard: Tile[][],
  seed?: number,
  swapCtx?: SwapContext
): MatchTurnResult => {
  const rng = createSeededRng(seed);
  let currentBoard = initialBoard.map((row) => row.map((t) => ({ ...t })));
  let comboCount = 0;
  let totalSwords = 0;
  let bloodSwordsMatched = 0;
  let totalHearts = 0;
  let totalGold = 0;
  let totalChungCakes = 0;
  let totalYinYang = 0;
  let totalElixirs = 0;
  let extraTurn = false;
  let clearedTileCount = 0;
  let specialExplosions = 0;
  const harvestedCoords = new Set<string>();
  const vfxEvents: BoardVfx[] = [];

  // Hàm cộng điểm/tài nguyên chuẩn xác cho từng ô bị tiêu diệt
  const harvestTile = (t: Tile) => {
    const key = `${t.row},${t.col}_${t.id}`;
    if (harvestedCoords.has(key)) return;
    harvestedCoords.add(key);

    if (t.type === 'SWORD') {
      totalSwords++;
      if (t.isBloodSword) {
        bloodSwordsMatched++;
      }
    } else if (t.type === 'HEART') {
      totalHearts++;
    } else if (t.type === 'GOLD') {
      totalGold += 10;
    } else if (t.type === 'CHUNG_CAKE') {
      totalChungCakes++;
    } else if (t.type === 'YIN_YANG') {
      totalYinYang += 15;
    } else if (t.type === 'ELIXIR') {
      totalElixirs++;
    }
  };

  // Kiểm tra kích hoạt đặc biệt ngay tại nước đi ban đầu (Swap Trigger)
  let initialSpecialTriggered = false;
  if (swapCtx) {
    const { r1, c1, r2, c2 } = swapCtx;
    const tileA = currentBoard[r1]?.[c1];
    const tileB = currentBoard[r2]?.[c2];

    if (tileA && tileB && (tileA.special !== 'NORMAL' || tileB.special !== 'NORMAL')) {
      initialSpecialTriggered = true;
      const initialRemoval = new Set<string>();

      // Sét 5 viên (LIGHTNING_5): Quét toàn bộ loại ngọc mục tiêu hoặc quét chữ thập hàng ngang + hàng dọc
      if (tileA.special === 'LIGHTNING_5' || tileB.special === 'LIGHTNING_5') {
        specialExplosions++;
        extraTurn = true;
        const targetType =
          tileA.special === 'LIGHTNING_5'
            ? tileB.special === 'LIGHTNING_5'
              ? null
              : tileB.type
            : tileA.type;

        const lRow = tileA.special === 'LIGHTNING_5' ? r1 : r2;
        const lCol = tileA.special === 'LIGHTNING_5' ? c1 : c2;

        vfxEvents.push({
          id: `vfx_init_lightning_${lRow}_${lCol}_${vfxEvents.length}`,
          r: lRow,
          c: lCol,
          type: 'lightning',
          tileType: targetType || 'YIN_YANG',
          isSpecial: true,
        });

        if (targetType) {
          // Quét toàn bộ các ô cùng loại trên bàn cờ
          for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
              if (currentBoard[r][c].type === targetType) {
                initialRemoval.add(`${r},${c}`);
                vfxEvents.push({
                  id: `vfx_target_lightning_${r}_${c}_${vfxEvents.length}`,
                  r,
                  c,
                  type: 'lightning',
                  tileType: targetType,
                  isSpecial: false,
                });
              }
            }
          }
        }
        // Kèm theo quét hàng và cột của vị trí sấm sét
        for (let nc = 0; nc < GRID_COLS; nc++) {
          initialRemoval.add(`${lRow},${nc}`);
          if (nc % 2 === 0) {
            vfxEvents.push({
              id: `vfx_row_lightning_${lRow}_${nc}_${vfxEvents.length}`,
              r: lRow,
              c: nc,
              type: 'lightning',
              tileType: 'YIN_YANG',
              isSpecial: true,
            });
          }
        }
        for (let nr = 0; nr < GRID_ROWS; nr++) {
          initialRemoval.add(`${nr},${lCol}`);
          if (nr % 2 === 0) {
            vfxEvents.push({
              id: `vfx_col_lightning_${nr}_${lCol}_${vfxEvents.length}`,
              r: nr,
              c: lCol,
              type: 'lightning',
              tileType: 'YIN_YANG',
              isSpecial: true,
            });
          }
        }
        initialRemoval.add(`${r1},${c1}`);
        initialRemoval.add(`${r2},${c2}`);
      } else if (tileA.special === 'BOMB_4' || tileB.special === 'BOMB_4') {
        // Bom 4 viên (BOMB_4): Nổ 3x3 xung quanh
        specialExplosions++;
        extraTurn = true;
        const bRow = tileA.special === 'BOMB_4' ? r1 : r2;
        const bCol = tileA.special === 'BOMB_4' ? c1 : c2;

        vfxEvents.push({
          id: `vfx_init_bomb_${bRow}_${bCol}_${vfxEvents.length}`,
          r: bRow,
          c: bCol,
          type: 'explosion',
          tileType: 'GOLD',
          isSpecial: true,
        });

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = bRow + dr;
            const nc = bCol + dc;
            if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
              initialRemoval.add(`${nr},${nc}`);
              vfxEvents.push({
                id: `vfx_bomb_area_${nr}_${nc}_${vfxEvents.length}`,
                r: nr,
                c: nc,
                type: 'explosion',
                tileType: currentBoard[nr][nc].type,
                isSpecial: false,
              });
            }
          }
        }
      }

      // Thu hoạch tài nguyên từ các ô nổ ban đầu
      initialRemoval.forEach((coordStr) => {
        const [r, c] = coordStr.split(',').map(Number);
        const t = currentBoard[r]?.[c];
        if (t) harvestTile(t);
      });

      clearedTileCount += initialRemoval.size;

      // Áp dụng trọng lực ngay cho đợt nổ ban đầu
      const nextBoard: (Tile | null)[][] = Array.from({ length: GRID_ROWS }, () =>
        Array(GRID_COLS).fill(null)
      );
      for (let c = 0; c < GRID_COLS; c++) {
        let writeRow = GRID_ROWS - 1;
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
          if (!initialRemoval.has(`${r},${c}`)) {
            nextBoard[writeRow][c] = {
              ...currentBoard[r][c],
              row: writeRow,
              col: c,
            };
            writeRow--;
          }
        }
        while (writeRow >= 0) {
          const chosenType = getRandomTileType(rng);
          const isBlood = chosenType === 'SWORD' && rng() < 0.08;
          nextBoard[writeRow][c] = {
            id: generateTileId(rng),
            type: chosenType,
            special: 'NORMAL',
            row: writeRow,
            col: c,
            isBloodSword: isBlood,
            isNew: true,
          };
          writeRow--;
        }
      }
      currentBoard = nextBoard as Tile[][];
    }
  }

  while (true) {
    const matches = findMatches(currentBoard);
    if (matches.length === 0 && (comboCount > 0 || initialSpecialTriggered)) break;
    if (matches.length === 0) break;

    comboCount++;

    const tilesToRemove = new Set<string>();
    const specialToSpawn: {
      r: number;
      c: number;
      type: TileType;
      special: SpecialTileType;
      isBloodSword?: boolean;
    }[] = [];

    matches.forEach((group) => {
      // Ăn từ 4 viên trở lên: Nhận Thêm Lượt!
      if (group.tiles.length >= 4) {
        extraTurn = true;
      }

      const midIdx = Math.floor(group.tiles.length / 2);

      group.tiles.forEach((coord, idx) => {
        tilesToRemove.add(`${coord.row},${coord.col}`);

        const t = currentBoard[coord.row]?.[coord.col];
        if (t) {
          harvestTile(t);
        }

        // Tạo sự kiện hiệu ứng đồ họa (VFX) trên bàn cờ
        const vfxType: 'lightning' | 'explosion' | 'slash' | 'burst' =
          group.tiles.length >= 5
            ? 'lightning'
            : group.tiles.length === 4
            ? 'explosion'
            : group.type === 'SWORD'
            ? 'slash'
            : 'burst';

        vfxEvents.push({
          id: `vfx_${comboCount}_${coord.row}_${coord.col}_${vfxEvents.length}`,
          r: coord.row,
          c: coord.col,
          type: vfxType,
          tileType: group.type,
          isSpecial: group.tiles.length >= 4,
        });

        // Tạo ngọc đặc biệt tại điểm giữa của dãy ăn
        if (idx === midIdx) {
          if (group.tiles.length >= 5) {
            // Ăn 5 đến 6 viên trở lên: Tạo SẤM SÉT (LIGHTNING_5)
            // Nếu là Kiếm: Tích hợp vừa Sấm Sét vừa Huyết Kiếm
            specialToSpawn.push({
              r: coord.row,
              c: coord.col,
              type: group.type,
              special: 'LIGHTNING_5',
              isBloodSword: group.type === 'SWORD' || coord.isBloodSword,
            });
          } else if (group.tiles.length === 4) {
            // Ăn 4 viên: Tạo BOM (BOMB_4) hoặc Huyết Kiếm
            specialToSpawn.push({
              r: coord.row,
              c: coord.col,
              type: group.type,
              special: group.type === 'SWORD' ? 'NORMAL' : 'BOMB_4',
              isBloodSword: group.type === 'SWORD',
            });
          }
        }
      });
    });

    // Kích hoạt nổ dây chuyền các ngọc đặc biệt nằm trong vùng tiêu diệt
    const newlyExploded = new Set<string>();
    tilesToRemove.forEach((coordStr) => {
      const [r, c] = coordStr.split(',').map(Number);
      const target = currentBoard[r]?.[c];
      if (!target) return;

      if (target.special === 'BOMB_4') {
        specialExplosions++;
        vfxEvents.push({
          id: `vfx_bomb_chain_${r}_${c}_${vfxEvents.length}`,
          r,
          c,
          type: 'explosion',
          tileType: target.type,
          isSpecial: true,
        });
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
              const k = `${nr},${nc}`;
              if (!tilesToRemove.has(k)) {
                tilesToRemove.add(k);
                newlyExploded.add(k);
                vfxEvents.push({
                  id: `vfx_bomb_wave_${nr}_${nc}_${vfxEvents.length}`,
                  r: nr,
                  c: nc,
                  type: 'explosion',
                  tileType: currentBoard[nr][nc]?.type || 'GOLD',
                  isSpecial: false,
                });
              }
            }
          }
        }
      } else if (target.special === 'LIGHTNING_5') {
        specialExplosions++;
        vfxEvents.push({
          id: `vfx_light_chain_${r}_${c}_${vfxEvents.length}`,
          r,
          c,
          type: 'lightning',
          tileType: target.type,
          isSpecial: true,
        });
        for (let nc = 0; nc < GRID_COLS; nc++) {
          const k = `${r},${nc}`;
          if (!tilesToRemove.has(k)) {
            tilesToRemove.add(k);
            newlyExploded.add(k);
            vfxEvents.push({
              id: `vfx_light_wave_${r}_${nc}_${vfxEvents.length}`,
              r,
              c: nc,
              type: 'lightning',
              tileType: 'YIN_YANG',
              isSpecial: false,
            });
          }
        }
        for (let nr = 0; nr < GRID_ROWS; nr++) {
          const k = `${nr},${c}`;
          if (!tilesToRemove.has(k)) {
            tilesToRemove.add(k);
            newlyExploded.add(k);
            vfxEvents.push({
              id: `vfx_light_wave_${nr}_${c}_${vfxEvents.length}`,
              r: nr,
              c,
              type: 'lightning',
              tileType: 'YIN_YANG',
              isSpecial: false,
            });
          }
        }
      }
    });

    // Thu hoạch tài nguyên cho toàn bộ các ô nổ dây chuyền
    newlyExploded.forEach((coordStr) => {
      const [r, c] = coordStr.split(',').map(Number);
      const t = currentBoard[r]?.[c];
      if (t) harvestTile(t);
    });

    clearedTileCount += tilesToRemove.size;

    // Áp dụng trọng lực (Gravity)
    const nextBoard: (Tile | null)[][] = Array.from({ length: GRID_ROWS }, () =>
      Array(GRID_COLS).fill(null)
    );

    for (let c = 0; c < GRID_COLS; c++) {
      let writeRow = GRID_ROWS - 1;
      for (let r = GRID_ROWS - 1; r >= 0; r--) {
        const coordKey = `${r},${c}`;
        if (!tilesToRemove.has(coordKey)) {
          nextBoard[writeRow][c] = {
            ...currentBoard[r][c],
            row: writeRow,
            col: c,
          };
          writeRow--;
        }
      }

      while (writeRow >= 0) {
        const chosenType = getRandomTileType(rng);
        const isBlood = chosenType === 'SWORD' && rng() < 0.08;

        nextBoard[writeRow][c] = {
          id: generateTileId(rng),
          type: chosenType,
          special: 'NORMAL',
          row: writeRow,
          col: c,
          isBloodSword: isBlood,
          isNew: true,
        };
        writeRow--;
      }
    }

    // Đặt ngọc đặc biệt mới vào vị trí bàn cờ sau trọng lực
    specialToSpawn.forEach((spec) => {
      // Ưu tiên đặt tại hàng của ô bị ăn hoặc hàng gần nhất trong cột
      const targetR = Math.min(GRID_ROWS - 1, Math.max(0, spec.r));
      if (nextBoard[targetR]?.[spec.c]) {
        nextBoard[targetR][spec.c]!.type = spec.type;
        nextBoard[targetR][spec.c]!.special = spec.special;
        if (spec.isBloodSword) {
          nextBoard[targetR][spec.c]!.isBloodSword = true;
        }
      }
    });

    currentBoard = nextBoard as Tile[][];
    if (comboCount > 15) break;
  }

  if (!hasAnyValidMoves(currentBoard)) {
    currentBoard = createInitialBoard(typeof seed === 'number' ? seed + 997 : undefined);
  }

  return {
    newBoard: currentBoard,
    totalSwords,
    bloodSwordsMatched,
    hasBloodSwordCrit: bloodSwordsMatched > 0,
    totalHearts,
    totalGold,
    totalChungCakes,
    totalYinYang,
    totalElixirs,
    comboCount,
    extraTurn,
    clearedTileCount,
    specialExplosions,
    vfxEvents: vfxEvents.slice(0, 48),
  };
};

export interface AIMove {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  score: number;
  matchType: TileType;
  matchLength: number;
}

export interface AIDecisionContext {
  aiHpRatio?: number;
  aiManaRatio?: number;
  playerHpRatio?: number;
}

/**
 * Multi-tier AI Warlord Decision Engine
 * Phân tầng chuẩn xác theo cấp độ khó:
 * - Tập Sự (aiAggressiveness <= 0.42): Ưu tiên nước ăn 3 đơn giản, bỏ qua nước cướp lượt 4-5 viên phức tạp
 * - Hảo Thủ (0.43 - 0.70): Cân bằng Kiếm & Tim, chọn ngẫu nhiên trong nhóm 3 nước khá nhất
 * - Đại Tướng (0.71 - 0.89): Chủ động săn 4 viên Thêm Lượt, ưu tiên phá giáp và tích nộ
 * - Địa Ngục (> 0.89): Phân tích chuỗi nổ (Cascade Simulation) để tối đa hóa Huyết Kiếm, Thêm Lượt & Linh Đan
 */
export const findBestAIMove = (
  board: Tile[][],
  aiAggressiveness: number = 0.65,
  ctx?: AIDecisionContext
): AIMove | null => {
  const possibleMoves: AIMove[] = [];
  const aiHpRatio = ctx?.aiHpRatio ?? 1.0;
  const isHellMode = aiAggressiveness > 0.89;
  const isHardMode = aiAggressiveness > 0.70 && aiAggressiveness <= 0.89;
  const isEasyMode = aiAggressiveness <= 0.42;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const neighbors = [
        { r2: r, c2: c + 1 },
        { r2: r + 1, c2: c },
      ];

      for (const n of neighbors) {
        if (n.r2 < GRID_ROWS && n.c2 < GRID_COLS) {
          const temp = board.map((row) => row.map((t) => ({ ...t })));
          const t1 = temp[r][c];
          const t2 = temp[n.r2][n.c2];
          temp[r][c] = { ...t2, row: r, col: c };
          temp[n.r2][n.c2] = { ...t1, row: n.r2, col: n.c2 };

          const matches = findMatches(temp);
          if (matches.length > 0) {
            let moveScore = 0;
            const primaryType: TileType = matches[0].type;
            let maxLen = 3;

            matches.forEach((m) => {
              maxLen = Math.max(maxLen, m.tiles.length);
              if (m.tiles.length >= 4) moveScore += 115;
              if (m.tiles.length >= 5) moveScore += 200;

              const hasBlood = m.tiles.some((coord) => temp[coord.row][coord.col].isBloodSword);
              if (hasBlood) moveScore += 75;

              if (m.type === 'SWORD') {
                moveScore += 38 * aiAggressiveness;
              } else if (m.type === 'HEART') {
                const needHeal = aiHpRatio < 0.55 ? 2.1 : aiHpRatio < 0.8 ? 1.2 : 0.4;
                moveScore += 28 * needHeal;
              } else if (m.type === 'CHUNG_CAKE') {
                moveScore += 24 * (1.15 - aiAggressiveness * 0.5);
              } else if (m.type === 'YIN_YANG') {
                moveScore += 26 * aiAggressiveness;
              } else if (m.type === 'ELIXIR') {
                moveScore += 32;
              } else if (m.type === 'GOLD') {
                moveScore += isEasyMode ? 25 : 8;
              }
            });

            // Ở chế độ Địa Ngục: chạy giả lập chuỗi nổ thực tế để đánh giá combo dây chuyền
            if (isHellMode) {
              const sim = resolveCascade(temp, 1337 + r * 10 + c);
              if (sim.extraTurn) moveScore += 140;
              if (sim.hasBloodSwordCrit) moveScore += 95;
              moveScore += sim.totalSwords * 14 + sim.totalElixirs * 18 + sim.comboCount * 15;
              if (aiHpRatio < 0.5) {
                moveScore += sim.totalHearts * 20;
              }
            }

            possibleMoves.push({
              r1: r,
              c1: c,
              r2: n.r2,
              c2: n.c2,
              score: moveScore,
              matchType: primaryType,
              matchLength: maxLen,
            });
          }
        }
      }
    }
  }

  if (possibleMoves.length === 0) return null;

  // Sắp xếp từ điểm cao nhất xuống thấp nhất
  possibleMoves.sort((a, b) => b.score - a.score);

  // 1. CẤP TẬP SỰ (DỄ): Không cướp lượt 4-5 viên (nếu có nước ăn 3), chọn nước đi nhẹ nhàng
  if (isEasyMode) {
    const simpleMoves = possibleMoves.filter((m) => m.matchLength === 3);
    const pool = simpleMoves.length > 0 ? simpleMoves : possibleMoves;
    // Chọn ở nửa sau danh sách (các nước đi bình thường như Vàng, Bánh Chưng, hoặc Kiếm đơn)
    const startIdx = Math.floor(pool.length * 0.35);
    const slice = pool.slice(startIdx);
    const chosenPool = slice.length > 0 ? slice : pool;
    return chosenPool[Math.floor(Math.random() * chosenPool.length)];
  }

  // 2. CẤP HẢO THỦ (VỪA): Chọn ngẫu nhiên có trọng số trong top 3-4 nước đi tốt
  if (!isHardMode && !isHellMode) {
    const topCount = Math.min(possibleMoves.length, 4);
    const topPool = possibleMoves.slice(0, topCount);
    // Nếu nước đầu là ăn 4 viên, Hảo Thủ có 45% cơ hội nhìn thấy, 55% chọn nước thứ 2/3
    if (topPool[0].matchLength >= 4 && topPool.length > 1 && Math.random() < 0.55) {
      return topPool[1 + Math.floor(Math.random() * (topPool.length - 1))];
    }
    return topPool[Math.floor(Math.random() * topPool.length)];
  }

  // 3. CẤP ĐẠI TƯỚNG (KHÓ): 85% chọn nước tối ưu số 1, 15% chọn nước số 2
  if (isHardMode) {
    if (possibleMoves.length > 1 && Math.random() < 0.15) {
      return possibleMoves[1];
    }
    return possibleMoves[0];
  }

  // 4. CẤP ĐỊA NGỤC: 100% chọn nước tối ưu tuyệt đối (đã tính cả chuỗi nổ Cascade)
  return possibleMoves[0];
};
