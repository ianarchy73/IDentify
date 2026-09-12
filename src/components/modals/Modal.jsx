import { useEffect } from 'react';
import { IconClose } from '../icons';

export default function Modal({
  title,
  onClose,
  children,
  footer,
  width = 520,
  type = 'default',
  hideHeader = false,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-panel${type !== 'default' ? ` type-${type}` : ''}`}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {hideHeader ? (
          <button className="modal-close modal-close-float" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        ) : (
          <div className="modal-head">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <IconClose size={16} />
            </button>
          </div>
        )}
        <div className={hideHeader ? 'modal-body confirm-body' : 'modal-body'}>{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
