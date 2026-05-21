import Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { GameScene } from "./scenes/GameScene";
import { LevelCompleteScene } from "./scenes/LevelCompleteScene";
import { GameOverScene } from "./scenes/GameOverScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  backgroundColor: "#1a0a2e",
  scene: [
    PreloadScene,
    MainMenuScene,
    GameScene,
    LevelCompleteScene,
    GameOverScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
