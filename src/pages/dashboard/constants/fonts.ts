export const FONTS = [
  'Arial',
  'Helvetica',
  'Inter',
  'BPG Nino Mtavruli',
  'Times New Roman',
  'Courier New',
] as const;

export type FontFamily = (typeof FONTS)[number];
