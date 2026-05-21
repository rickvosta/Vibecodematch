import { CandyType } from "@vibecode/shared";
import { LevelConfig } from "../types";

const { Red, Orange, Yellow, Green, Blue, Purple } = CandyType;

/**
 * Generates a plus/cross shape mask for a grid.
 * The center third of each axis is considered active;
 * corner regions are inactive.
 */
function plusShape(w: number, h: number): boolean[] {
  const colMin = Math.floor(w / 3);
  const colMax = Math.ceil((2 * w) / 3);
  const rowMin = Math.floor(h / 3);
  const rowMax = Math.ceil((2 * h) / 3);

  return Array.from({ length: w * h }, (_, i) => {
    const row = Math.floor(i / w);
    const col = i % w;
    return (row >= rowMin && row < rowMax) || (col >= colMin && col < colMax);
  });
}

/**
 * Generates a diamond shape mask for a grid.
 */
function diamondShape(w: number, h: number): boolean[] {
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const radius = Math.min(cx, cy);

  return Array.from({ length: w * h }, (_, i) => {
    const row = Math.floor(i / w);
    const col = i % w;
    return Math.abs(col - cx) + Math.abs(row - cy) <= radius;
  });
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  // Level 1 — Very easy: small grid, 3 types
  {
    levelNumber: 1,
    gridWidth: 6,
    gridHeight: 6,
    scoreThreshold: 500,
    moveLimit: 20,
    candyTypes: [Red, Orange, Yellow],
    pointsPerCandy: 30,
    cascadeMultiplier: 1.5,
  },
  // Level 2 — Easy: slightly wider
  {
    levelNumber: 2,
    gridWidth: 7,
    gridHeight: 6,
    scoreThreshold: 900,
    moveLimit: 22,
    candyTypes: [Red, Orange, Yellow, Green],
    pointsPerCandy: 30,
    cascadeMultiplier: 1.5,
  },
  // Level 3 — Easy+
  {
    levelNumber: 3,
    gridWidth: 7,
    gridHeight: 7,
    scoreThreshold: 1400,
    moveLimit: 25,
    candyTypes: [Red, Orange, Yellow, Green],
    pointsPerCandy: 35,
    cascadeMultiplier: 1.5,
  },
  // Level 4
  {
    levelNumber: 4,
    gridWidth: 8,
    gridHeight: 7,
    scoreThreshold: 2000,
    moveLimit: 25,
    candyTypes: [Red, Orange, Yellow, Green, Blue],
    pointsPerCandy: 35,
    cascadeMultiplier: 1.5,
  },
  // Level 5 — First square with 5 types
  {
    levelNumber: 5,
    gridWidth: 8,
    gridHeight: 8,
    scoreThreshold: 2800,
    moveLimit: 28,
    candyTypes: [Red, Orange, Yellow, Green, Blue],
    pointsPerCandy: 40,
    cascadeMultiplier: 1.6,
  },
  // Level 6 — All 6 types introduced
  {
    levelNumber: 6,
    gridWidth: 8,
    gridHeight: 8,
    scoreThreshold: 3500,
    moveLimit: 28,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 40,
    cascadeMultiplier: 1.6,
  },
  // Level 7 — Bigger grid
  {
    levelNumber: 7,
    gridWidth: 9,
    gridHeight: 8,
    scoreThreshold: 4500,
    moveLimit: 30,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 45,
    cascadeMultiplier: 1.6,
  },
  // Level 8 — 9x9
  {
    levelNumber: 8,
    gridWidth: 9,
    gridHeight: 9,
    scoreThreshold: 5500,
    moveLimit: 30,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 45,
    cascadeMultiplier: 1.7,
  },
  // Level 9 — 10x9
  {
    levelNumber: 9,
    gridWidth: 10,
    gridHeight: 9,
    scoreThreshold: 6500,
    moveLimit: 32,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 50,
    cascadeMultiplier: 1.7,
  },
  // Level 10 — First 10x10 milestone
  {
    levelNumber: 10,
    gridWidth: 10,
    gridHeight: 10,
    scoreThreshold: 8000,
    moveLimit: 32,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 50,
    cascadeMultiplier: 1.7,
  },
  // Level 11 — Plus shaped 11x11
  {
    levelNumber: 11,
    gridWidth: 11,
    gridHeight: 11,
    gridShape: plusShape(11, 11),
    scoreThreshold: 7000,
    moveLimit: 35,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 55,
    cascadeMultiplier: 1.8,
  },
  // Level 12 — 12x11
  {
    levelNumber: 12,
    gridWidth: 12,
    gridHeight: 11,
    scoreThreshold: 10000,
    moveLimit: 35,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 55,
    cascadeMultiplier: 1.8,
  },
  // Level 13 — 12x12
  {
    levelNumber: 13,
    gridWidth: 12,
    gridHeight: 12,
    scoreThreshold: 12000,
    moveLimit: 36,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 60,
    cascadeMultiplier: 1.8,
  },
  // Level 14 — Plus shaped 13x13
  {
    levelNumber: 14,
    gridWidth: 13,
    gridHeight: 13,
    gridShape: plusShape(13, 13),
    scoreThreshold: 11000,
    moveLimit: 38,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 60,
    cascadeMultiplier: 1.9,
  },
  // Level 15 — 14x13
  {
    levelNumber: 15,
    gridWidth: 14,
    gridHeight: 13,
    scoreThreshold: 15000,
    moveLimit: 38,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 65,
    cascadeMultiplier: 1.9,
  },
  // Level 16 — Diamond shaped 15x15
  {
    levelNumber: 16,
    gridWidth: 15,
    gridHeight: 15,
    gridShape: diamondShape(15, 15),
    scoreThreshold: 14000,
    moveLimit: 40,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 65,
    cascadeMultiplier: 2.0,
  },
  // Level 17 — 16x15
  {
    levelNumber: 17,
    gridWidth: 16,
    gridHeight: 15,
    scoreThreshold: 20000,
    moveLimit: 40,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 70,
    cascadeMultiplier: 2.0,
  },
  // Level 18 — Diamond 17x17
  {
    levelNumber: 18,
    gridWidth: 17,
    gridHeight: 17,
    gridShape: diamondShape(17, 17),
    scoreThreshold: 18000,
    moveLimit: 42,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 70,
    cascadeMultiplier: 2.0,
  },
  // Level 19 — 18x18
  {
    levelNumber: 19,
    gridWidth: 18,
    gridHeight: 18,
    scoreThreshold: 25000,
    moveLimit: 45,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 75,
    cascadeMultiplier: 2.0,
  },
  // Level 20 — The final boss: 20x20
  {
    levelNumber: 20,
    gridWidth: 20,
    gridHeight: 20,
    scoreThreshold: 35000,
    moveLimit: 50,
    candyTypes: [Red, Orange, Yellow, Green, Blue, Purple],
    pointsPerCandy: 80,
    cascadeMultiplier: 2.0,
  },
];

export function getLevelConfig(levelNumber: number): LevelConfig {
  if (levelNumber < 1 || levelNumber > 20) {
    throw new RangeError(
      `Level number must be between 1 and 20, got ${levelNumber}`,
    );
  }
  return LEVEL_CONFIGS[levelNumber - 1];
}
