export type Viewport = 'WEB' | 'MOB';
export type Language = 'GE' | 'EN' | 'RU' | 'TR';
export type LocalizedContent = Record<Language, string>;
export type ViewportBackground = { web: string; mob: string };
export type GlobalBackground = Record<Language, ViewportBackground>;
