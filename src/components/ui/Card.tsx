import React from 'react';
import clsx from 'clsx';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ children, className = '', header, footer }) => (
  <div className={clsx('bg-white rounded-xl shadow-card p-6', className)}>
    {header && <div className="mb-4">{header}</div>}
    <div>{children}</div>
    {footer && <div className="mt-4">{footer}</div>}
  </div>
);

export default Card; 