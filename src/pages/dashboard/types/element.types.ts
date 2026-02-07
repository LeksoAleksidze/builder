import type { AuthVisibility, LocalizedContent } from './common.types';
import type {
  ViewportTextElementStyles,
  ViewportImageElementStyles,
  ViewportBoxElementStyles,
  ViewportButtonElementStyles,
} from './style.types';

export interface TextElement {
  id: number;
  type: 'text';
  content: LocalizedContent;
  styles: ViewportTextElementStyles;
  isEditing?: boolean;
  sameForAllLangs?: boolean;
  visibility?: AuthVisibility;
}

export interface ImageElement {
  id: number;
  type: 'image';
  content: LocalizedContent;
  styles: ViewportImageElementStyles;
  isEditing?: boolean;
  sameForAllLangs?: boolean;
  visibility?: AuthVisibility;
}

export type ButtonActionType = 'link' | 'popup';

export interface ButtonAction {
  type: ButtonActionType;
  value: string; // URL for link, popup ID for popup
}

export interface ButtonElement {
  id: number;
  type: 'button';
  content: LocalizedContent; // text content
  image: LocalizedContent; // optional image (if using image button)
  useImage: boolean; // whether to use image instead of text
  action: ButtonAction;
  styles: ViewportButtonElementStyles;
  isEditing?: boolean;
  sameForAllLangs?: boolean;
  visibility?: AuthVisibility;
}

// Child elements inside a box (text, image, or button)
export type BoxChildElement = TextElement | ImageElement | ButtonElement;

export interface BoxElement {
  id: number;
  type: 'box';
  title: string;
  styles: ViewportBoxElementStyles;
  children: BoxChildElement[];
  isEditing?: boolean;
  visibility?: AuthVisibility;
}

export type Element = TextElement | ImageElement | BoxElement | ButtonElement;
