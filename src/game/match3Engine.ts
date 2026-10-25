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

// Helper: simulate swap and check for matches
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
  const temp = board.map((row) => [...row]);
  const t1 = temp[r1][c1];
  const t2 = temp[r2][c2];
  if (!t1 || !t2) return false;

  temp[r1][c1] = { ...t2, row: r1, col: c1 };
  temp[r2][c2] = { ...t1, row: r2, col: c2 };

  return findMatches(temp).length > 0;
};

// Execute full match, Blood Sword check, and cascade resolution
export const resolveCascade = (
  initialBoard: Tile[][],
  seed?: number
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

  while (true) {
    const matches = findMatches(currentBoard);
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
      // 4+ in a row triggers Extra Turn!
      if (group.tiles.length >= 4) {
        extraTurn = true;
      }

      const midIdx = Math.floor(group.tiles.length / 2);

      group.tiles.forEach((coord, idx) => {
        tilesToRemove.add(`${coord.row},${coord.col}`);

        if (group.type === 'SWORD') {
          totalSwords++;
          if (coord.isBloodSword) {
            bloodSwordsMatched++;
          }
        } else if (group.type === 'HEART') {
          totalHearts++;
        } else if (group.type === 'GOLD') {
          totalGold += 10;
        } else if (group.type === 'CHUNG_CAKE') {
          totalChungCakes++;
        } else if (group.type === 'YIN_YANG') {
          totalYinYang += 15;
        } else if (group.type === 'ELIXIR') {
          totalElixirs++;
        }

        if (idx === midIdx) {
          if (group.createsBloodSword) {
            specialToSpawn.push({
              r: coord.row,
              c: coord.col,
              type: 'SWORD',
              special: 'NORMAL',
              isBloodSword: true,
            });
          } else if (group.isSpecialCreation !== 'NORMAL') {
            specialToSpawn.push({
              r: coord.row,
              c: coord.col,
              type: group.type,
              special: group.isSpecialCreation,
              isBloodSword: coord.isBloodSword,
            });
          }
        }
      });
    });

    clearedTileCount += tilesToRemove.size;

    // Trigger existing special tiles if detonated
    tilesToRemove.forEach((coordStr) => {
      const [r, c] = coordStr.split(',').map(Number);
      const target = currentBoard[r]?.[c];
      if (!target) return;
      if (target.special === 'BOMB_4') {
        specialExplosions++;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
              tilesToRemove.add(`${nr},${nc}`);
            }
          }
        }
      } else if (target.special === 'LIGHTNING_5') {
        specialExplosions++;
        for (let nc = 0; nc < GRID_COLS; nc++) tilesToRemove.add(`${r},${nc}`);
        for (let nr = 0; nr < GRID_ROWS; nr++) tilesToRemove.add(`${nr},${c}`);
      }
    });

    // Apply gravity
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

    specialToSpawn.forEach((spec) => {
      if (nextBoard[spec.r]?.[spec.c]) {
        nextBoard[spec.r][spec.c]!.type = spec.type;
        nextBoard[spec.r][spec.c]!.special = spec.special;
        if (spec.isBloodSword) {
          nextBoard[spec.r][spec.c]!.isBloodSword = true;
        }
      }
    });

    currentBoard = nextBoard as Tile[][];
    if (comboCount > 12) break;
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
