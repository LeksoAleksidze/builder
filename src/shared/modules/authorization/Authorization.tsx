import styles from './Authorization.module.scss';

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
}

export default function Authorization({ stylesProp }: AuthProps) {
  const fontFamily = stylesProp.fontFamily || 'CrocoSansCAPSRegular';

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
        აქციაში მონაწილეობის მისაღებად, გთხოვთ, გაიაროთ რეგისტრაცია ან
        ავტორიზაცია
      </div>
      <div className={styles.authorization__actions} style={{ fontFamily }}>
        <button style={{ fontFamily }}>რეგისტრაცია</button>
        <button style={{ fontFamily }}>ავტორიზაცია</button>
      </div>
    </div>
  );
}
