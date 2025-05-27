import React, { forwardRef } from 'react';
import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, fullWidth = false, className = '', ...props }, ref) => (
    <div className={clsx('relative', fullWidth && 'w-full')}> 
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      )}
      <input
        ref={ref}
        className={clsx(
          'rounded-full border border-playfulGray bg-playfulWhite px-4 py-2 text-playfulBlack font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all',
          icon && 'pl-10',
          error && 'border-playfulRed',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
      {error && <span className="text-playfulRed text-xs mt-1 block">{error}</span>}
    </div>
  )
);
Input.displayName = 'Input';

export default Input; 