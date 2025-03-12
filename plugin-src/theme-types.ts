export interface ThemeData {
  $schema: string;
  name: string;
  author: string;
  themes: Theme[];
}

export interface Theme {
  name: string;
  appearance: "dark" | "light";
  accents?: string[];
  style: ThemeStyle;
}

export type ThemeMetadata = Omit<Theme, "style">;

export interface ThemeStyle {
  accents?: string[];
  [key: string]: string | string[] | null | undefined | Player[] | SyntaxStyles;
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
