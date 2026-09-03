import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from '../components/common/Icons';
import './Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type} animate-slide-up`}>
            <div className="toast-icon">
              {toast.type === 'success' && <Icon name="circle-check-big" size={18} color="var(--green-deep)" />}
              {toast.type === 'error' && <Icon name="circle-alert" size={18} color="var(--color-error-foreground)" />}
              {toast.type === 'info' && <Icon name="info" size={18} color="var(--green-deep)" />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback silencioso seguro se usado fora do provider
    return {
      showToast: (msg) => console.log('[Toast]', msg)
    };
  }
  return context;
};
