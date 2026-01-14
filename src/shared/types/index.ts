export type Language = 'GE' | 'EN' | 'RU' | 'TR';
export type ViewMode = 'WEB' | 'MOB';
export type ElementType = 'text' | 'image';

export interface ElementStyles {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textShadow?: string;
  borderRadius?: number;
  zIndex?: number;
}

export interface SectionStyles {
  width: string;
  height: number;
  marginTop: number;
  marginBottom: number;
  backgroundColor: string;
  borderWidth: number;
  borderRadius: number;
  borderColor: string;
  backgroundImage?: string;
  zIndex?: number;
}

export interface ElementContent {
  GE: string;
  EN: string;
  RU: string;
  TR: string;
}

export interface Element {
  id: number;
  type: ElementType;
  content: ElementContent;
  styles: {
    WEB: ElementStyles;
    MOB: ElementStyles;
  };
  isEditing?: boolean;
}

export interface Section {
  id: number;
  title: string;
  styles: {
    WEB: SectionStyles;
    MOB: SectionStyles;
  };
  elements: Element[];
}

export interface GlobalBackground {
  GE: { web: string; mob: string };
  EN: { web: string; mob: string };
  RU: { web: string; mob: string };
  TR: { web: string; mob: string };
}

export interface AuthStyles {
  WEB: { marginTop: string; backgroundColor: string };
  MOB: { marginTop: string; backgroundColor: string };
}

export interface LandingData {
  sections: Section[];
  authStyles: AuthStyles;
  globalBG: GlobalBackground;
}
