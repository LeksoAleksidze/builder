import type {
  GlobalBackground,
  ViewportBGColor,
  BackgroundSettings,
  ViewportAuthStyles,
  SectionStyle,
  TextElementStyle,
  ImageElementStyle,
  BoxElementStyle,
  ButtonElementStyle,
  PopupStyle,
  CloseButtonStyle,
  LocalizedContent,
  ViewportHeaderTextStyles,
  HeaderText,
  AuthTexts,
  EndpointsConfig,
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
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
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
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
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
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
    color: '#fff',
  },
  MOB: {
    x: 20,
    y: 20,
    width: 150,
    height: 40,
    fontSize: 18,
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
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

export const DEFAULT_BOX_ELEMENT_STYLES: { WEB: BoxElementStyle; MOB: BoxElementStyle } = {
  WEB: {
    x: 50,
    y: 50,
    width: 300,
    height: 200,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  MOB: {
    x: 20,
    y: 20,
    width: 200,
    height: 150,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(255,255,255,0.2)',
  },
};

export const DEFAULT_LOCALIZED_CONTENT: LocalizedContent = {
  GE: '',
  EN: '',
  RU: '',
  TR: '',
};

export const DEFAULT_BUTTON_ELEMENT_STYLES: { WEB: ButtonElementStyle; MOB: ButtonElementStyle } = {
  WEB: {
    x: 50,
    y: 50,
    width: 150,
    height: 50,
    fontSize: 16,
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
    color: '#ffffff',
    backgroundColor: '#667eea',
    borderWidth: 0,
    borderRadius: 8,
    borderColor: '#5a67d8',
  },
  MOB: {
    x: 20,
    y: 20,
    width: 120,
    height: 44,
    fontSize: 14,
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
    color: '#ffffff',
    backgroundColor: '#667eea',
    borderWidth: 0,
    borderRadius: 8,
    borderColor: '#5a67d8',
  },
};

export const DEFAULT_POPUP_STYLES: { WEB: PopupStyle; MOB: PopupStyle } = {
  WEB: {
    width: 500,
    height: 400,
    fontSize: 16,
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
    color: '#ffffff',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#333',
  },
  MOB: {
    width: 320,
    height: 300,
    fontSize: 14,
    lineHeight: 1.4,
    fontFamily: 'CrocoSansCAPSRegular',
    color: '#ffffff',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#333',
  },
};

export const DEFAULT_CLOSE_BUTTON_STYLES: { WEB: CloseButtonStyle; MOB: CloseButtonStyle } = {
  WEB: {
    x: -1, // -1 means auto position (top-right)
    y: -1,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    borderRadius: 16,
    fontSize: 18,
  },
  MOB: {
    x: -1,
    y: -1,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    borderRadius: 14,
    fontSize: 16,
  },
};

export const DEFAULT_HEADER_TEXT_STYLES: ViewportHeaderTextStyles = {
  WEB: {
    x: 0,
    y: 0,
    width: 600,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 32,
    lineHeight: 1.2,
    fontFamily: 'BebasNeueRegular',
    color: '#ffffff',
    maxWidth: 800,
  },
  MOB: {
    x: 0,
    y: 0,
    width: 340,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 24,
    lineHeight: 1.2,
    fontFamily: 'BebasNeueRegular',
    color: '#ffffff',
    maxWidth: 350,
  },
};

export const DEFAULT_ENDPOINTS_CONFIG: EndpointsConfig = {
  rulesKey: '',
  rulesBackground: '#37445ee6',
  rulesPaddingTop: 20,
  rulesPaddingBottom: 20,
};

export const DEFAULT_AUTH_TEXTS: AuthTexts = {
  mainText: {
    GE: 'აქციაში მონაწილეობის მისაღებად, გთხოვთ, გაიაროთ რეგისტრაცია ან ავტორიზაცია',
    EN: 'To participate in the promotion, please register or log in',
    RU: 'Для участия в акции, пожалуйста, зарегистрируйтесь или авторизуйтесь',
    TR: 'Promosyona katılmak için lütfen kayıt olun veya giriş yapın',
  },
  registerButton: {
    GE: 'რეგისტრაცია',
    EN: 'Register',
    RU: 'Регистрация',
    TR: 'Kayıt Ol',
  },
  loginButton: {
    GE: 'ავტორიზაცია',
    EN: 'Log In',
    RU: 'Авторизация',
    TR: 'Giriş Yap',
  },
};

export const DEFAULT_HEADER_TEXT: HeaderText = {
  content: { GE: '', EN: '', RU: '', TR: '' },
  styles: {
    WEB: { ...DEFAULT_HEADER_TEXT_STYLES.WEB },
    MOB: { ...DEFAULT_HEADER_TEXT_STYLES.MOB },
  },
  sameForAllLangs: true,
};
