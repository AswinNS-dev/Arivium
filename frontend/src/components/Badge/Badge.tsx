import type { ReactNode, FC } from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
}

export const Badge: FC<BadgeProps> = ({ children, variant = 'primary', className }) => {
  return (
    <span className={clsx(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
};
