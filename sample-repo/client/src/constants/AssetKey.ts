/** Asset keys used with Phaser's loader and texture manager. */
export const AssetKey = {
  // Candy sprites
  CandyRed: "candy_red",
  CandyOrange: "candy_orange",
  CandyYellow: "candy_yellow",
  CandyGreen: "candy_green",
  CandyBlue: "candy_blue",
  CandyPurple: "candy_purple",

  // UI
  TitleLogo: "title_logo",
  ButtonJoin: "button_join",
  CellBackground: "cell_bg",
  CellSelected: "cell_selected",
} as const;

export type AssetKeyValue = (typeof AssetKey)[keyof typeof AssetKey];

/** Maps a CandyType string value to its AssetKey. */
export const CANDY_TYPE_TO_ASSET: Record<string, string> = {
  red: AssetKey.CandyRed,
  orange: AssetKey.CandyOrange,
  yellow: AssetKey.CandyYellow,
  green: AssetKey.CandyGreen,
  blue: AssetKey.CandyBlue,
  purple: AssetKey.CandyPurple,
};

/** Maps a CandyType string value to its display colour (fallback for procedural graphics). */
export const CANDY_TYPE_TO_COLOR: Record<string, number> = {
  red: 0xe63946,
  orange: 0xf4a261,
  yellow: 0xf9c74f,
  green: 0x52b788,
  blue: 0x4361ee,
  purple: 0x9b5de5,
};
