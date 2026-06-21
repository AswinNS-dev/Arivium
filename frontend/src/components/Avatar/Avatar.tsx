import { useState, type FC } from 'react';
import clsx from 'clsx';
import styles from './Avatar.module.css';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ src, alt, fallback, size = 'md', className }) => {
  const [error, setError] = useState(false);

  return (
    <div className={clsx(styles.avatar, styles[size], className)}>
      {src && !error ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className={styles.image}
          onError={() => setError(true)}
        />
      ) : (
        <span className={styles.fallback}>
          {fallback ? fallback.substring(0, 2).toUpperCase() : '?'}
        </span>
      )}
    </div>
  );
};
