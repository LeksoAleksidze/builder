export const FONTS = [
  'Bebas Neue',
  'Croco Sans Black',
  'Croco Sans',
  'Proxima Nova',
  'TT Supermolot Neue',
  'Arial',
  'Helvetica',
  'Inter',
  'BPG Nino Mtavruli',
  'Times New Roman',
  'Courier New',
] as const;

export type FontFamily = (typeof FONTS)[number];
