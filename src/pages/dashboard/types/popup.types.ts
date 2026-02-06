import type { LocalizedContent } from './common.types';
import type { ViewportPopupStyles } from './style.types';

export interface Popup {
  id: number;
  title: string;
  content: LocalizedContent; // text content
  image: LocalizedContent; // optional image
  useImage: boolean; // whether to show image
  styles: ViewportPopupStyles;
  sameForAllLangs?: boolean;
}
