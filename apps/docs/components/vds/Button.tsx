'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  type = 'button',
}: ButtonProps) {
  const inactive = isDisabled || isLoading;

  const handleClick = () => {
    if (inactive) return;
    onClick?.();
  };

  const classNames = [
    'vds-button',
    `vds-button--${variant}`,
    `vds-button--${size}`,
    fullWidth ? 'vds-button--full-width' : '',
    inactive ? 'vds-button--inactive' : '',
    isDisabled ? 'vds-button--disabled' : '',
    isLoading ? 'vds-button--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={handleClick}
      aria-busy={isLoading || undefined}
      aria-disabled={inactive || undefined}
      tabIndex={isDisabled ? -1 : undefined}
    >
      {isLoading ? (
        <>
          <span className="vds-button__spinner" aria-hidden />
          <span className="vds-button__label">{children}</span>
        </>
      ) : (
        <>
          {leftIcon ? <span className="vds-button__icon">{leftIcon}</span> : null}
          <span className="vds-button__label">{children}</span>
          {rightIcon ? <span className="vds-button__icon">{rightIcon}</span> : null}
        </>
      )}
    </button>
  );
}
