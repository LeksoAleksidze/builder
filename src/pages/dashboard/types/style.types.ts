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
  lineHeight?: number;
  fontFamily: string;
  color: string;
  textShadow?: string;
  textAlign?: 'left' | 'center' | 'right';
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

export interface BoxElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  borderWidth: number;
  borderRadius: number;
  borderColor: string;
  zIndex?: number;
}

export type ViewportBoxElementStyles = {
  WEB: BoxElementStyle;
  MOB: BoxElementStyle;
};

export interface AuthStyle {
  marginTop: string;
  backgroundColor: string;
  textColor: string;
  textBgColor: string;
  textBgBorderRadius: number;
  fontSize: number;
  lineHeight?: number;
  fontFamily: string;
  height: number;
  padding: number;
  borderRadius: number;
}

export type ViewportAuthStyles = {
  WEB: AuthStyle;
  MOB: AuthStyle;
};

export interface ButtonElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  lineHeight?: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderRadius: number;
  borderColor: string;
  zIndex?: number;
}

export type ViewportButtonElementStyles = {
  WEB: ButtonElementStyle;
  MOB: ButtonElementStyle;
};

export interface HeaderTextStyle {
  x: number;
  y: number;
  width: number;
  paddingTop: number;
  paddingBottom: number;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  color: string;
  maxWidth: number;
}

export type ViewportHeaderTextStyles = {
  WEB: HeaderTextStyle;
  MOB: HeaderTextStyle;
};

export interface PopupStyle {
  width: number;
  height: number;
  fontSize: number;
  lineHeight?: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  backgroundImage?: string;
  borderWidth: number;
  borderRadius: number;
  borderColor: string;
}

export type ViewportPopupStyles = {
  WEB: PopupStyle;
  MOB: PopupStyle;
};
