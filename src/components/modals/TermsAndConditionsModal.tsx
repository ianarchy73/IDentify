import { useState } from 'react';
import Modal from './Modal';

interface TermsAndConditionsModalProps {
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsAndConditionsModal({
  onAccept,
  onClose,
}: TermsAndConditionsModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <Modal
      title="Terms and conditions"
      onClose={onClose}
      width={560}
      footer={(
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={onAccept}
            disabled={!accepted}
          >
            Accept and continue
          </button>
        </div>
      )}
    >
      <p className="sub" style={{ marginTop: 0 }}>
        Please review how IDentify handles information before identity verification begins.
      </p>

      <h4>Data privacy</h4>
      <p className="small">
        IDentify uses the information you provide, including identity details and
        verification images, to create your established identity baseline and demonstrate
        identity-protection workflows in this prototype.
      </p>

      <h4>How we handle information</h4>
      <p className="small">
        This hackathon prototype does not connect to Facebook or access private account data.
        Profile investigations are based on the public profile URL and simulated identity
        signals. Do not use real sensitive documents or images unless you understand the
        prototype's limitations and have permission to provide them.
      </p>
      <p className="small">
        Information shown here is for demonstration and investigation preparation only. It
        is not a legal finding that an account is fraudulent or impersonating someone.
      </p>

      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 18 }}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
        />
        <span className="small">
          I have read and agree to these terms for using this prototype.
        </span>
      </label>
    </Modal>
  );
}