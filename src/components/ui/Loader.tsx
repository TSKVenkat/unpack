import React from 'react';

export const Loader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin ${className}`}></div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-playfulGray rounded-xl animate-pulse ${className}`}></div>
);

export default Loader; 