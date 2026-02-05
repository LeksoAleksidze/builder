import type { Element } from './element.types';
import type { ViewportSectionStyles } from './style.types';

export interface Section {
  id: number;
  title: string;
  styles: ViewportSectionStyles;
  elements: Element[];
}
