import Phaser from "phaser";
import { SceneKey } from "../constants/SceneKey";
import { gameClient } from "../game/GameClient";
import type { Unsubscribe } from "../game/GameClient";

const LEVEL_STATUS_PLAYING = "playing";

export class LevelCompleteScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private unsubscribeStateChange: Unsubscribe | null = null;

  constructor() {
    super({ key: SceneKey.LevelComplete });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);

    this.levelText = this.add
      .text(width / 2, height / 2 - 20, "Level Complete!", {
        fontSize: "56px",
        fontStyle: "bold",
        color: "#f9c74f",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 46, "Preparing next level…", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.levelText,
      scale: { from: 0.95, to: 1.05 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.unsubscribeStateChange = gameClient.onStateChange((state) => {
      if (state.levelStatus === LEVEL_STATUS_PLAYING) {
        this.scene.start(SceneKey.Game);
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeStateChange?.();
      this.unsubscribeStateChange = null;
    });
  }
}
