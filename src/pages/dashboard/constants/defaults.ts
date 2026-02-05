import type {
  GlobalBackground,
  ViewportBGColor,
  BackgroundSettings,
  ViewportAuthStyles,
  SectionStyle,
  TextElementStyle,
  ImageElementStyle,
  LocalizedContent,
} from '../types';

export const STORAGE_KEY = 'landing_data';

export const DEFAULT_GLOBAL_BG: GlobalBackground = {
  GE: { web: '', mob: '' },
  EN: { web: '', mob: '' },
  RU: { web: '', mob: '' },
  TR: { web: '', mob: '' },
};

export const DEFAULT_GLOBAL_BG_COLOR: ViewportBGColor = {
  WEB: '#1a1a2e',
  MOB: '#1a1a2e',
};

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  sameForAllLanguages: true,
  backgrounds: DEFAULT_GLOBAL_BG,
};

export const DEFAULT_AUTH_STYLES: ViewportAuthStyles = {
  WEB: {
    marginTop: '700px',
    backgroundColor: '#37445ee6',
    textColor: '#ffffff',
    textBgColor: 'transparent',
    textBgBorderRadius: 4,
    fontSize: 16,
    height: 80,
    padding: 20,
    borderRadius: 4,
  },
  MOB: {
    marginTop: '300px',
    backgroundColor: '#37445ee6',
    textColor: '#ffffff',
    textBgColor: 'transparent',
    textBgBorderRadius: 4,
    fontSize: 14,
    height: 100,
    padding: 16,
    borderRadius: 4,
  },
};

export const DEFAULT_SECTION_STYLES: { WEB: SectionStyle; MOB: SectionStyle } = {
  WEB: {
    width: '100%',
    height: 400,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: '#161925',
    borderWidth: 0,
    borderRadius: 0,
    borderColor: '#333',
  },
  MOB: {
    width: '100%',
    height: 300,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: '#161925',
    borderWidth: 0,
    borderRadius: 0,
    borderColor: '#333',
  },
};

export const DEFAULT_TEXT_ELEMENT_STYLES: { WEB: TextElementStyle; MOB: TextElementStyle } = {
  WEB: {
    x: 50,
    y: 50,
    width: 200,
    height: 50,
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#fff',
  },
  MOB: {
    x: 20,
    y: 20,
    width: 150,
    height: 40,
    fontSize: 18,
    fontFamily: 'Arial',
    color: '#fff',
  },
};

export const DEFAULT_IMAGE_ELEMENT_STYLES: { WEB: ImageElementStyle; MOB: ImageElementStyle } = {
  WEB: {
    x: 50,
    y: 150,
    width: 200,
    height: 200,
    borderRadius: 0,
  },
  MOB: {
    x: 20,
    y: 100,
    width: 150,
    height: 150,
    borderRadius: 0,
  },
};

export const DEFAULT_LOCALIZED_CONTENT: LocalizedContent = {
  GE: '',
  EN: '',
  RU: '',
  TR: '',
};
