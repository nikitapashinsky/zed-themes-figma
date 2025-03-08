export interface ThemeData {
  $schema: string;
  name: string;
  author: string;
  themes: Theme[];
}

export interface Theme {
  name: string;
  appearance: "dark" | "light";
  style: ThemeStyle;
}

export interface ThemeStyle {
  [key: string]: string | null | Player[] | SyntaxStyles;
  players: Player[];
  syntax: SyntaxStyles;
}

export interface Player {
  cursor: string;
  background: string;
  selection: string;
}

export interface SyntaxStyles {
  [key: string]: {
    color: string;
    font_style: string | null;
    font_weight: string | null;
  };
}
