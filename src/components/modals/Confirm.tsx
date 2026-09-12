import Modal from './Modal';

type ConfirmType = 'default' | 'danger' | 'success';

const ICON_GLYPH: Record<ConfirmType, string> = { default: 'i', danger: '!', success: '\u2713' };

interface ConfirmModalProps {
  open: boolean;
  type?: ConfirmType;
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  type = 'default',
  title,
  message,
  confirmText = 'Confirm',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <Modal type={type} onClose={onClose} width={480} hideHeader>
      <div className={`confirm-icon confirm-icon-${type}`}>{ICON_GLYPH[type] || ICON_GLYPH.default}</div>
      <h3 className="confirm-title">{title}</h3>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button
          className={`btn ${type === 'danger' ? 'danger-solid' : 'primary'}`}
          onClick={() => {
            onConfirm?.();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
