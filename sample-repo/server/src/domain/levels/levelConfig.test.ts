import { getLevelConfig, LEVEL_CONFIGS } from "./levelConfig";
import { CandyType } from "@vibecode/shared";

describe("getLevelConfig", () => {
  it("returns the correct config for level 1", () => {
    const config = getLevelConfig(1);
    expect(config.levelNumber).toBe(1);
    expect(config.gridWidth).toBe(6);
    expect(config.gridHeight).toBe(6);
    expect(config.candyTypes.length).toBe(3);
  });

  it("returns the correct config for level 20", () => {
    const config = getLevelConfig(20);
    expect(config.levelNumber).toBe(20);
    expect(config.gridWidth).toBe(20);
    expect(config.gridHeight).toBe(20);
  });

  it("defines all 20 levels", () => {
    expect(LEVEL_CONFIGS).toHaveLength(20);
  });

  it("has level numbers matching array position", () => {
    LEVEL_CONFIGS.forEach((config, i) => {
      expect(config.levelNumber).toBe(i + 1);
    });
  });

  it("throws for level 0", () => {
    expect(() => getLevelConfig(0)).toThrow(RangeError);
  });

  it("throws for level 21", () => {
    expect(() => getLevelConfig(21)).toThrow(RangeError);
  });

  it("all levels have at least 3 candy types", () => {
    LEVEL_CONFIGS.forEach((config) => {
      expect(config.candyTypes.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("all levels have at least 1 move", () => {
    LEVEL_CONFIGS.forEach((config) => {
      expect(config.moveLimit).toBeGreaterThan(0);
    });
  });

  it("shaped levels have a gridShape mask of correct length", () => {
    LEVEL_CONFIGS.forEach((config) => {
      if (config.gridShape) {
        expect(config.gridShape).toHaveLength(
          config.gridWidth * config.gridHeight,
        );
        expect(config.gridShape.every((v) => typeof v === "boolean")).toBe(
          true,
        );
      }
    });
  });

  it("candy types for level 1 are all valid CandyType values", () => {
    const config = getLevelConfig(1);
    const validValues = Object.values(CandyType) as string[];
    config.candyTypes.forEach((t) => {
      expect(validValues).toContain(t);
    });
  });
});
