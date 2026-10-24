/**
 * Loạn 12 Sứ Quân — Match-3 Battle Engine Core
 * Handles 8x8 grid generation, swaps, matches, cascades, gravity, combos,
 * and the iconic Huyết Kiếm (Crimson Blood Sword - x2 Critical & 50% Armor Pierce).
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
export const generateTileId = () => `tile_${nextTileId++}_${Math.random().toString(36).substring(2, 6)}`;

export const getRandomTileType = (): TileType => {
  const idx = Math.floor(Math.random() * TILE_TYPES.length);
  return TILE_TYPES[idx];
};

// Create a pristine 8x8 board with NO starting matches, random Blood Swords, and guaranteed valid moves
export const createInitialBoard = (): Tile[][] => {
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
        const chosenType = validTypes[Math.floor(Math.random() * validTypes.length)] || getRandomTileType();

        // 8% chance for sword to be Huyết Kiếm (Kiếm Đỏ Thẫm)
        const isBlood = chosenType === 'SWORD' && Math.random() < 0.08;

        row.push({
          id: generateTileId(),
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
          let hasBlood = false;
          for (let k = c - matchLen; k < c; k++) {
            const t = board[r][k];
            if (t.isBloodSword) hasBlood = true;
            tiles.push({ row: r, col: k, isBloodSword: t.isBloodSword });
          }
          let special: SpecialTileType = 'NORMAL';
          if (matchLen === 4) special = 'BOMB_4';
          else if (matchLen >= 5) special = 'LIGHTNING_5';

          // If 4+ swords matched, generate a Blood Sword!
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
  const temp = board.map((row) => [...row]);
  const t1 = temp[r1][c1];
  const t2 = temp[r2][c2];

  temp[r1][c1] = { ...t2, row: r1, col: c1 };
  temp[r2][c2] = { ...t1, row: r2, col: c2 };

  return findMatches(temp).length > 0;
};

// Execute full match, Blood Sword check, and cascade resolution
export const resolveCascade = (
  initialBoard: Tile[][]
): MatchTurnResult => {
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
    const specialToSpawn: { r: number; c: number; type: TileType; special: SpecialTileType; isBloodSword?: boolean }[] = [];

    matches.forEach((group) => {
      // 4+ in a row triggers Extra Turn!
      if (group.tiles.length >= 4) {
        extraTurn = true;
      }

      const midIdx = Math.floor(group.tiles.length / 2);

      group.tiles.forEach((coord, idx) => {
        tilesToRemove.add(`${coord.row},${coord.col}`);

        // Tally resources
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

        // Spawn Blood Sword or Special tile at center of match
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
      const target = currentBoard[r][c];
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

      // Fill empty spaces from top with new random tiles (8% chance for blood sword)
      while (writeRow >= 0) {
        const chosenType = getRandomTileType();
        const isBlood = chosenType === 'SWORD' && Math.random() < 0.08;

        nextBoard[writeRow][c] = {
          id: generateTileId(),
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

    // Place any spawned special tiles back onto board
    specialToSpawn.forEach((spec) => {
      if (nextBoard[spec.r][spec.c]) {
        nextBoard[spec.r][spec.c]!.type = spec.type;
        nextBoard[spec.r][spec.c]!.special = spec.special;
        if (spec.isBloodSword) {
          nextBoard[spec.r][spec.c]!.isBloodSword = true;
        }
      }
    });

    currentBoard = nextBoard as Tile[][];
    if (comboCount > 15) break;
  }

  if (!hasAnyValidMoves(currentBoard)) {
    currentBoard = createInitialBoard();
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

// AI Warlord Decision Engine with Blood Sword awareness
export const findBestAIMove = (board: Tile[][], aiAggressiveness: number = 0.7): AIMove | null => {
  const possibleMoves: AIMove[] = [];

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
            let primaryType: TileType = matches[0].type;
            let maxLen = 3;

            matches.forEach((m) => {
              maxLen = Math.max(maxLen, m.tiles.length);
              if (m.tiles.length >= 4) moveScore += 110;
              if (m.tiles.length >= 5) moveScore += 190;

              // Blood sword in match gives high priority
              const hasBlood = m.tiles.some((coord) => temp[coord.row][coord.col].isBloodSword);
              if (hasBlood) moveScore += 65;

              if (m.type === 'SWORD') {
                moveScore += 35 * aiAggressiveness;
              } else if (m.type === 'CHUNG_CAKE') {
                moveScore += 25 * (1 - aiAggressiveness);
              } else if (m.type === 'HEART') {
                moveScore += 25 * (1 - aiAggressiveness);
              } else if (m.type === 'YIN_YANG') {
                moveScore += 20;
              } else if (m.type === 'ELIXIR') {
                moveScore += 26;
              } else if (m.type === 'GOLD') {
                moveScore += 10;
              }
            });

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
  possibleMoves.sort((a, b) => b.score - a.score);
  return possibleMoves[0];
};
