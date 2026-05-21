import Phaser from "phaser";
import { SceneKey } from "../constants/SceneKey";

/**
 * Loads all game assets.
 * Uses procedurally generated graphics so the game works without external art files.
 * Replace with actual sprite sheets when art assets are available.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Preload });
  }

  preload(): void {
    this.drawLoadingBar();
    this.generateCandyTextures();
    this.generateUITextures();
  }

  create(): void {
    this.scene.start(SceneKey.MainMenu);
  }

  private drawLoadingBar(): void {
    const { width, height } = this.scale;
    const barW = 320;
    const barH = 20;
    const x = (width - barW) / 2;
    const y = height / 2;

    const bg = this.add.rectangle(width / 2, y, barW + 4, barH + 4, 0x444444);
    const fill = this.add.rectangle(x, y, 0, barH, 0xf9c74f).setOrigin(0, 0.5);

    this.load.on("progress", (value: number) => {
      fill.width = barW * value;
    });

    const label = this.add
      .text(width / 2, y - 30, "Loading…", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("complete", () => {
      bg.destroy();
      fill.destroy();
      label.destroy();
    });
  }

  private generateCandyTextures(): void {
    const candies: Array<{ key: string; color: number }> = [
      { key: "candy_red", color: 0xe63946 },
      { key: "candy_orange", color: 0xf4a261 },
      { key: "candy_yellow", color: 0xf9c74f },
      { key: "candy_green", color: 0x52b788 },
      { key: "candy_blue", color: 0x4361ee },
      { key: "candy_purple", color: 0x9b5de5 },
    ];

    const size = 56;
    const radius = size / 2 - 4;

    for (const { key, color } of candies) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      // Shadow
      gfx.fillStyle(0x000000, 0.25);
      gfx.fillCircle(size / 2 + 2, size / 2 + 3, radius);
      // Body
      gfx.fillStyle(color, 1);
      gfx.fillCircle(size / 2, size / 2, radius);
      // Shine
      gfx.fillStyle(0xffffff, 0.35);
      gfx.fillCircle(size / 2 - 6, size / 2 - 6, radius * 0.35);
      gfx.generateTexture(key, size, size);
      gfx.destroy();
    }
  }

  private generateUITextures(): void {
    const size = 64;

    // Cell background
    const cellBg = this.make.graphics({ x: 0, y: 0 });
    cellBg.fillStyle(0x2d1b69, 1);
    cellBg.fillRoundedRect(2, 2, size - 4, size - 4, 8);
    cellBg.generateTexture("cell_bg", size, size);
    cellBg.destroy();

    // Selected cell
    const cellSel = this.make.graphics({ x: 0, y: 0 });
    cellSel.lineStyle(3, 0xffd700, 1);
    cellSel.strokeRoundedRect(2, 2, size - 4, size - 4, 8);
    cellSel.generateTexture("cell_selected", size, size);
    cellSel.destroy();
  }
}
