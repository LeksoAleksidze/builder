import styles from './Authorization.module.scss';

interface AuthTexts {
  mainText: Record<string, string>;
  registerButton: Record<string, string>;
  loginButton: Record<string, string>;
}

interface AuthProps {
  stylesProp: {
    marginTop: string;
    backgroundColor: string;
    textColor: string;
    textBgColor: string;
    textBgBorderRadius: number;
    fontSize: number;
    lineHeight?: number;
    fontFamily?: string;
    height: number;
    padding: number;
    borderRadius: number;
  };
  texts?: AuthTexts;
  lang?: string;
}

const defaultTexts: AuthTexts = {
  mainText: {
    GE: 'აქციაში მონაწილეობის მისაღებად, გთხოვთ, გაიაროთ რეგისტრაცია ან ავტორიზაცია',
    EN: 'To participate in the promotion, please register or log in',
    RU: 'Для участия в акции, пожалуйста, зарегистрируйтесь или авторизуйтесь',
    TR: 'Promosyona katılmak için lütfen kayıt olun veya giriş yapın',
  },
  registerButton: { GE: 'რეგისტრაცია', EN: 'Register', RU: 'Регистрация', TR: 'Kayıt Ol' },
  loginButton: { GE: 'ავტორიზაცია', EN: 'Log In', RU: 'Авторизация', TR: 'Giriş Yap' },
};

export default function Authorization({ stylesProp, texts, lang = 'GE' }: AuthProps) {
  const fontFamily = stylesProp.fontFamily || 'CrocoSansCAPSRegular';
  const t = texts || defaultTexts;

  return (
    <div
      className={styles.authorization}
      style={{
        backgroundColor: stylesProp.backgroundColor,
        minHeight: `${stylesProp.height}px`,
        padding: `${stylesProp.padding}px`,
        borderRadius: `${stylesProp.borderRadius}px`,
        fontFamily,
      }}
    >
      <div
        className={styles.authorization__text}
        style={{
          color: stylesProp.textColor,
          backgroundColor: stylesProp.textBgColor,
          fontSize: `${stylesProp.fontSize}px`,
          lineHeight: stylesProp.lineHeight || 1.4,
          borderRadius: `${stylesProp.textBgBorderRadius}px`,
        }}
      >
        {t.mainText[lang] || t.mainText.GE}
      </div>
      <div className={styles.authorization__actions} style={{ fontFamily }}>
        <button style={{ fontFamily }}>{t.registerButton[lang] || t.registerButton.GE}</button>
        <button style={{ fontFamily }}>{t.loginButton[lang] || t.loginButton.GE}</button>
      </div>
    </div>
  );
}
