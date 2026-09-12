import Modal from './Modal';
import type { FlaggedImage } from '../../types';

interface ImageDetailModalProps {
  image: FlaggedImage;
  onClose: () => void;
  onDelete: () => void;
  onToggleTraining: () => void;
}

export default function ImageDetailModal({
  image,
  onClose,
  onDelete,
  onToggleTraining,
}: ImageDetailModalProps) {
  return (
    <Modal title={image.fileName} onClose={onClose} width={480}>
      <img
        src={image.previewUrl}
        alt={image.fileName}
        style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--line)', background: '#fafafa' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <span className={`badge ${image.risk}`}>{image.riskLabel}</span>
        <span className="sub">{image.faceMatchScore}% facial similarity</span>
      </div>

      <p className="small" style={{ marginTop: 10 }}>
        {image.manipulationNotes}
      </p>

      <div className="sub" style={{ marginTop: 6 }}>
        Uploaded {new Date(image.uploadedAt).toLocaleString()}
      </div>

      <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
        <input
          type="checkbox"
          checked={image.usableForTraining}
          onChange={onToggleTraining}
        />
        Available as reference material for future AI analysis
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="button" className="btn danger" onClick={onDelete}>
          Remove from gallery
        </button>
      </div>
    </Modal>
  );
}