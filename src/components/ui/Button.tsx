import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-primary text-white hover:bg-blue-700 active:bg-blue-800 shadow-playful',
    secondary:
      'bg-playfulPink text-playfulBlack hover:bg-pink-200 active:bg-pink-300',
    outline:
      'border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white',
  };
  return (
    <button
      className={clsx(
        base,
        variants[variant],
        fullWidth && 'w-full',
        'px-6 py-2 text-base',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button; 