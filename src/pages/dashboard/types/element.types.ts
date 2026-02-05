import type { LocalizedContent } from './common.types';
import type {
  ViewportTextElementStyles,
  ViewportImageElementStyles,
  ViewportBoxElementStyles,
} from './style.types';

export interface TextElement {
  id: number;
  type: 'text';
  content: LocalizedContent;
  styles: ViewportTextElementStyles;
  isEditing?: boolean;
  sameForAllLangs?: boolean;
}

export interface ImageElement {
  id: number;
  type: 'image';
  content: LocalizedContent;
  styles: ViewportImageElementStyles;
  isEditing?: boolean;
  sameForAllLangs?: boolean;
}

// Child elements inside a box (text or image only)
export type BoxChildElement = TextElement | ImageElement;

export interface BoxElement {
  id: number;
  type: 'box';
  title: string;
  styles: ViewportBoxElementStyles;
  children: BoxChildElement[];
  isEditing?: boolean;
}

export type Element = TextElement | ImageElement | BoxElement;
