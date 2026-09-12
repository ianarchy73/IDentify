import { useToastState } from './ToastContext';

const ICON_PATHS = {
  success: 'M5 11.917 9.724 16.5 19 7.5',
  error: 'M6 18 17.94 6M18 18 6.06 6',
  warning: 'M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  info: 'M12 17v-6m0-2.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

const ICON_LABELS = {
  success: 'Check icon',
  error: 'Error icon',
  warning: 'Warning icon',
  info: 'Info icon',
};

export default function Toast() {
  const { message, visible, type = 'success', key, hideToast } = useToastState();

  if (!message) return null;

  return (
    <div
      key={key}
      className={`toast toast-${type} ${visible ? 'show' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d={ICON_PATHS[type]}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">{ICON_LABELS[type]}</span>
      </span>

      <span className="toast-message">{message}</span>

      <button type="button" className="toast-close" aria-label="Close" onClick={hideToast}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 18 17.94 6M18 18 6.06 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}