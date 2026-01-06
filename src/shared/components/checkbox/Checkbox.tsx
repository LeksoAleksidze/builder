'use client';

import styles from './Checkbox.module.scss';
import clsx from 'clsx';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  id,
}: CheckboxProps) {
  return (
    <div className={styles.checkbox}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles['checkbox__input']}
      />
      <label htmlFor={id} className={styles['checkbox__label']}>
        <div
          className={clsx(
            styles['checkbox__box'],
            checked && styles['checkbox__box--checked']
          )}
        >
          {checked && (
            <svg viewBox="0 0 24 24" className={styles['checkbox__icon']}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        {label && <span className={styles['checkbox__text']}>{label}</span>}
      </label>
    </div>
  );
}
