import React from 'react';
import clsx from 'clsx';

type Tab = { label: string; value: string };

type TabsProps = {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const Tabs: React.FC<TabsProps> = ({ tabs, value, onChange, className = '' }) => (
  <div className={clsx('flex space-x-2', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.value}
        className={clsx(
          'px-5 py-2 rounded-full font-bold transition-all',
          value === tab.value
            ? 'bg-primary text-white shadow-playful'
            : 'bg-playfulGray text-playfulBlack hover:bg-primary hover:text-white'
        )}
        onClick={() => onChange(tab.value)}
        type="button"
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default Tabs; 