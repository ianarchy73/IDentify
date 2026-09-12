import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string;
  visible: boolean;
  type: ToastType;
  key: number;
}

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

type ShowToast = (
  message: string,
  typeOrOptions?: ToastType | number | ToastOptions,
  maybeDuration?: number,
) => void;

interface ToastContextValue {
  toast: ToastState;
  showToast: ShowToast;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VALID_TYPES: ToastType[] = ['success', 'error', 'warning', 'info'];

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    visible: false,
    type: 'success',
    key: 0,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const showToast: ShowToast = useCallback((message, typeOrOptions = 'success', maybeDuration) => {
    let type: ToastType = 'success';
    let duration = 2200;

    if (typeof typeOrOptions === 'number') {
      duration = typeOrOptions;
    } else if (typeof typeOrOptions === 'string') {
      type = VALID_TYPES.includes(typeOrOptions) ? typeOrOptions : 'success';
      if (typeof maybeDuration === 'number') duration = maybeDuration;
    } else if (typeOrOptions && typeof typeOrOptions === 'object') {
      type = typeOrOptions.type && VALID_TYPES.includes(typeOrOptions.type) ? typeOrOptions.type : 'success';
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
