export const FONTS = [
  'CrocoSansBlackCAPS',
  'CrocoSansCAPSRegular',
  'ProximaNova',
  'TTSupermolotNeue',
  'BebasNeueRegular',
] as const;

export type FontFamily = (typeof FONTS)[number];
