import type { LocalizedContent } from './common.types';
import type {
  ViewportPopupStyles,
  ViewportTextElementStyles,
  ViewportImageElementStyles,
} from './style.types';

// Elements that can be placed inside a popup
export interface PopupTextElement {
  id: number;
  type: 'text';
  content: LocalizedContent;
  styles: ViewportTextElementStyles;
  sameForAllLangs?: boolean;
}

export interface PopupImageElement {
  id: number;
  type: 'image';
  content: LocalizedContent; // base64 image
  styles: ViewportImageElementStyles;
  sameForAllLangs?: boolean;
}

export type PopupChildElement = PopupTextElement | PopupImageElement;

// Close button configuration
export interface CloseButtonStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
  borderRadius: number;
  fontSize: number;
}

export interface ViewportCloseButtonStyles {
  WEB: CloseButtonStyle;
  MOB: CloseButtonStyle;
}

export interface PopupCloseButton {
  useImage: boolean;
  image: LocalizedContent; // custom close button image
  styles: ViewportCloseButtonStyles;
}

export interface Popup {
  id: number;
  title: string;
  children: PopupChildElement[]; // draggable elements
  closeButton: PopupCloseButton;
  styles: ViewportPopupStyles;
  sameForAllLangs?: boolean;
}
