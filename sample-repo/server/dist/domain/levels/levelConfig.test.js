"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const levelConfig_1 = require("./levelConfig");
const shared_1 = require("@vibecode/shared");
describe("getLevelConfig", () => {
    it("returns the correct config for level 1", () => {
        const config = (0, levelConfig_1.getLevelConfig)(1);
        expect(config.levelNumber).toBe(1);
        expect(config.gridWidth).toBe(6);
        expect(config.gridHeight).toBe(6);
        expect(config.candyTypes.length).toBe(3);
    });
    it("returns the correct config for level 20", () => {
        const config = (0, levelConfig_1.getLevelConfig)(20);
        expect(config.levelNumber).toBe(20);
        expect(config.gridWidth).toBe(20);
        expect(config.gridHeight).toBe(20);
    });
    it("defines all 20 levels", () => {
        expect(levelConfig_1.LEVEL_CONFIGS).toHaveLength(20);
    });
    it("has level numbers matching array position", () => {
        levelConfig_1.LEVEL_CONFIGS.forEach((config, i) => {
            expect(config.levelNumber).toBe(i + 1);
        });
    });
    it("throws for level 0", () => {
        expect(() => (0, levelConfig_1.getLevelConfig)(0)).toThrow(RangeError);
    });
    it("throws for level 21", () => {
        expect(() => (0, levelConfig_1.getLevelConfig)(21)).toThrow(RangeError);
    });
    it("all levels have at least 3 candy types", () => {
        levelConfig_1.LEVEL_CONFIGS.forEach((config) => {
            expect(config.candyTypes.length).toBeGreaterThanOrEqual(3);
        });
    });
    it("all levels have at least 1 move", () => {
        levelConfig_1.LEVEL_CONFIGS.forEach((config) => {
            expect(config.moveLimit).toBeGreaterThan(0);
        });
    });
    it("shaped levels have a gridShape mask of correct length", () => {
        levelConfig_1.LEVEL_CONFIGS.forEach((config) => {
            if (config.gridShape) {
                expect(config.gridShape).toHaveLength(config.gridWidth * config.gridHeight);
                expect(config.gridShape.every((v) => typeof v === "boolean")).toBe(true);
            }
        });
    });
    it("candy types for level 1 are all valid CandyType values", () => {
        const config = (0, levelConfig_1.getLevelConfig)(1);
        const validValues = Object.values(shared_1.CandyType);
        config.candyTypes.forEach((t) => {
            expect(validValues).toContain(t);
        });
    });
});
