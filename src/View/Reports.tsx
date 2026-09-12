import { useState } from 'react';
import { useToast } from '../components/toast/ToastContext';
import CustomSelect from '../components/modals/Dropdown';
import ConfirmModal from '../components/modals/Confirm';

const REPORT_OPTIONS = [
  'CASE-001 · Possible impersonation',
  'CASE-002 · Profile image reuse',
];

export default function Reports() {
  const showToast = useToast();
  const [selected, setSelected] = useState(REPORT_OPTIONS[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section id="reports" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Report assistant</h1>
          <div className="sub">
            Prepare an evidence-backed report for review and submission.
          </div>
        </div>
      </div>

      <div className="card formcard">
        <label className="label">Selected case</label>
        <CustomSelect value={selected} onChange={setSelected} options={REPORT_OPTIONS} />

        <label className="label" style={{ marginTop: 16 }}>
          Generated report draft
        </label>
        <div className="report">
          <b>Subject: Possible Facebook Impersonation</b>
          <br />
          <br />
          This report concerns a Facebook account suspected of impersonating
          the established identity of the reporting user.
          <br />
          <br />
          <b>Suspected account:</b> facebook.com/example.profile
          <br />
          <b>Observed indicators:</b> high profile-image similarity, name
          similarity, and matching publicly visible information.
          <br />
          <br />
          <b>Evidence:</b> profile URL, captured screenshots, timestamped
          investigation record, and analysis summary.
          <br />
          <br />
          Please review the information and supporting evidence before
          submitting through the appropriate Meta reporting process.
        </div>

        <button
          className="btn primary"
          style={{ marginTop: 16 }}
          onClick={() => showToast('Report draft saved')}
        >
          Save report draft
        </button>{' '}
        <button
          className="btn"
          style={{ marginTop: 16 }}
          onClick={() => setConfirmOpen(true)}
        >
          Open reporting workflow
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        type="default"
        title="Submit report to Meta?"
        message="This sends your evidence-backed report through Meta's reporting workflow. Double-check the evidence before continuing."
        confirmText="Submit report"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => showToast('Demo only: opening reporting workflow')}
      />
    </section>
  );
}
