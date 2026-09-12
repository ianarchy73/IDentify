import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const VALID_TYPES = ['success', 'error', 'warning', 'info'];

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    message: '',
    visible: false,
    type: 'success',
    key: 0,
  });
  const timerRef = useRef(null);
  const keyRef = useRef(0);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  // Flexible signature so existing calls keep working:
  //   showToast(message)
  //   showToast(message, duration)              <- legacy
  //   showToast(message, 'error')
  //   showToast(message, 'warning', duration)
  //   showToast(message, { type, duration })
  const showToast = useCallback((message, typeOrOptions = 'success', maybeDuration) => {
    let type = 'success';
    let duration = 2200;

    if (typeof typeOrOptions === 'number') {
      duration = typeOrOptions;
    } else if (typeof typeOrOptions === 'string') {
      type = VALID_TYPES.includes(typeOrOptions) ? typeOrOptions : 'success';
      if (typeof maybeDuration === 'number') duration = maybeDuration;
    } else if (typeOrOptions && typeof typeOrOptions === 'object') {
      type = VALID_TYPES.includes(typeOrOptions.type) ? typeOrOptions.type : 'success';
      if (typeof typeOrOptions.duration === 'number') duration = typeOrOptions.duration;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    keyRef.current += 1;
    setToast({ message, visible: true, type, key: keyRef.current });
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx.showToast;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastState() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastState must be used within a ToastProvider');
  }
  return { ...ctx.toast, hideToast: ctx.hideToast };
}