import Phaser from "phaser";
import { SceneKey } from "../constants/SceneKey";
import { gameClient } from "../game/GameClient";

export class MainMenuScene extends Phaser.Scene {
  private joinButton!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private connecting = false;

  constructor() {
    super({ key: SceneKey.MainMenu });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background gradient-ish overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a2e);

    // Decorative candy circles as background art
    this.addDecorativeBackground(width, height);

    // Title
    this.add
      .text(width / 2, height * 0.3, "Vibecode Match", {
        fontSize: "64px",
        fontStyle: "bold",
        color: "#f9c74f",
        stroke: "#9b5de5",
        strokeThickness: 6,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: "#000000",
          blur: 10,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height * 0.45, "Multiplayer Match-3", {
        fontSize: "22px",
        color: "#ccccff",
      })
      .setOrigin(0.5);

    // Join Game button
    this.joinButton = this.add
      .text(width / 2, height * 0.62, "Join Game", {
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#9b5de5",
        padding: { x: 32, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.joinButton.on("pointerover", () =>
      this.joinButton.setStyle({ backgroundColor: "#7b3db5" }),
    );
    this.joinButton.on("pointerout", () =>
      this.joinButton.setStyle({ backgroundColor: "#9b5de5" }),
    );
    this.joinButton.on("pointerdown", () => this.handleJoin());

    // Status text for connection feedback
    this.statusText = this.add
      .text(width / 2, height * 0.75, "", {
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);
  }

  private async handleJoin(): Promise<void> {
    if (this.connecting) return;
    this.connecting = true;

    this.joinButton.setAlpha(0.5);
    this.setStatus("Connecting…");

    try {
      await gameClient.joinGame();
      this.scene.start(SceneKey.Game);
    } catch (err) {
      console.error("Failed to join game:", err);
      this.setStatus("Could not connect. Retrying is possible.");
      this.joinButton.setAlpha(1);
      this.connecting = false;
    }
  }

  private setStatus(msg: string): void {
    this.statusText.setText(msg);
  }

  private addDecorativeBackground(width: number, height: number): void {
    const colors = [0xe63946, 0xf4a261, 0xf9c74f, 0x52b788, 0x4361ee, 0x9b5de5];
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const r = Phaser.Math.Between(20, 50);
      const color = Phaser.Utils.Array.GetRandom(colors) as number;
      this.add.circle(x, y, r, color, 0.12);
    }
  }
}
