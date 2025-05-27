import React, { createContext, useContext, useState, useCallback } from 'react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), message, type },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={clsx(
              'px-6 py-3 rounded-xl font-bold shadow-playful flex items-center gap-2',
              toast.type === 'success' && 'bg-green-500 text-white',
              toast.type === 'error' && 'bg-playfulRed text-white',
              toast.type === 'info' && 'bg-primary text-white'
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 