import Phaser from "phaser";
import { SceneKey } from "../constants/SceneKey";
import { gameClient } from "../game/GameClient";
import type { Unsubscribe } from "../game/GameClient";

const LEVEL_STATUS_PLAYING = "playing";

export class GameOverScene extends Phaser.Scene {
  private unsubscribeStateChange: Unsubscribe | null = null;

  constructor() {
    super({ key: SceneKey.GameOver });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x220000, 0.65);

    this.add
      .text(width / 2, height / 2 - 20, "Game Over", {
        fontSize: "64px",
        fontStyle: "bold",
        color: "#ff6b6b",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 42, "Resetting to level 1…", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

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
