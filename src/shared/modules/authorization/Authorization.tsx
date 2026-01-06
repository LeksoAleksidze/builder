import styles from './Authorization.module.scss';

interface AuthProps {
  stylesProp: { marginTop: string; backgroundColor: string };
}

export default function Authorization({ stylesProp }: AuthProps) {
  return (
    <div
      className={styles.authorization}
      style={{
        marginTop: stylesProp.marginTop,
        backgroundColor: stylesProp.backgroundColor,
      }}
    >
      <div className={styles.authorization__text}>
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
