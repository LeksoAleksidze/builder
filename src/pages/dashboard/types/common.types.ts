export type Viewport = 'WEB' | 'MOB';
export type Language = 'GE' | 'EN' | 'RU' | 'TR';
export type LocalizedContent = Record<Language, string>;
export type ViewportBackground = { web: string; mob: string };
export type GlobalBackground = Record<Language, ViewportBackground>;
export type ViewportBGColor = { WEB: string; MOB: string };

export interface BackgroundSettings {
  sameForAllLanguages: boolean;
  backgrounds: GlobalBackground;
}

export interface HeaderText {
  content: LocalizedContent;
  styles: import('./style.types').ViewportHeaderTextStyles;
  sameForAllLangs: boolean;
}
