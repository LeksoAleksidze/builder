export interface SectionStyle {
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

export type ViewportSectionStyles = {
  WEB: SectionStyle;
  MOB: SectionStyle;
};

export interface TextElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  textShadow?: string;
  zIndex?: number;
}

export interface ImageElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  zIndex?: number;
}

export type ViewportTextElementStyles = {
  WEB: TextElementStyle;
  MOB: TextElementStyle;
};

export type ViewportImageElementStyles = {
  WEB: ImageElementStyle;
  MOB: ImageElementStyle;
};

export interface AuthStyle {
  marginTop: string;
  backgroundColor: string;
}

export type ViewportAuthStyles = {
  WEB: AuthStyle;
  MOB: AuthStyle;
};
