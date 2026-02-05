import type { LocalizedContent } from './common.types';
import type {
  ViewportTextElementStyles,
  ViewportImageElementStyles,
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

export type Element = TextElement | ImageElement;
