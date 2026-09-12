import Modal from './Modal';
import type { CaseItem } from '../../types';

interface CaseDetailModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
  onPrepareReport: (caseItem: CaseItem) => void;
}

export default function CaseDetailModal({ caseItem, onClose, onPrepareReport }: CaseDetailModalProps) {
  if (!caseItem) return null;

  return (
    <Modal title={`${caseItem.id} · Evidence timeline`} onClose={onClose} width={560}>
      <p className="small" style={{ margin: '0 0 4px' }}>{caseItem.title}</p>
      <p className="url" style={{ marginBottom: 16 }}>{caseItem.url}</p>

      <div className="timeline">
        {caseItem.timeline.map((event, i) => (
          <div className="event" key={i}>
            <span className="event-dot" />
            <div className="event-content">
              <b>{event.title}</b>
              <p>{event.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn primary"
        style={{ marginTop: 8 }}
        onClick={() => {
          onPrepareReport(caseItem);
          onClose();
        }}
      >
        Prepare report
      </button>
    </Modal>
  );
}
