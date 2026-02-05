import styles from './Authorization.module.scss';

interface AuthProps {
  stylesProp: {
    marginTop: string;
    backgroundColor: string;
    textColor: string;
    textBgColor: string;
    textBgBorderRadius: number;
    fontSize: number;
    height: number;
    padding: number;
    borderRadius: number;
  };
}

export default function Authorization({ stylesProp }: AuthProps) {
  return (
    <div
      className={styles.authorization}
      style={{
        backgroundColor: stylesProp.backgroundColor,
        minHeight: `${stylesProp.height}px`,
        padding: `${stylesProp.padding}px`,
        borderRadius: `${stylesProp.borderRadius}px`,
      }}
    >
      <div
        className={styles.authorization__text}
        style={{
          color: stylesProp.textColor,
          backgroundColor: stylesProp.textBgColor,
          fontSize: `${stylesProp.fontSize}px`,
          borderRadius: `${stylesProp.textBgBorderRadius}px`,
        }}
      >
        აქციაში მონაწილეობის მისაღებად, გთხოვთ, გაიაროთ რეგისტრაცია ან
        ავტორიზაცია
      </div>
      <div className={styles.authorization__actions}>
        <button>რეგისტრაცია</button>
        <button>ავტორიზაცია</button>
      </div>
    </div>
  );
}
