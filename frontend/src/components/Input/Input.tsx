import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx(styles.container, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && <span className={clsx(styles.icon, styles.leftIcon)}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(
              styles.input,
              {
                [styles.hasError]: !!error,
                [styles.hasLeftIcon]: !!leftIcon,
                [styles.hasRightIcon]: !!rightIcon,
                [styles.disabled]: disabled,
              }
            )}
            {...props}
          />
          {rightIcon && <span className={clsx(styles.icon, styles.rightIcon)}>{rightIcon}</span>}
        </div>
        {(error || helperText) && (
          <p className={clsx(styles.helperText, { [styles.errorText]: !!error })}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
