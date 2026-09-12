import { useEffect, useState } from 'react';
import { useToast } from '../components/toast/ToastContext';
import CustomSelect from '../components/modals/Dropdown';
import ConfirmModal from '../components/modals/Confirm';
import type { FlaggedImage, InvestigationRecord } from '../types';

const REPORT_OPTIONS = [
  'CASE-001 · Possible impersonation',
  'CASE-002 · Profile image reuse',
];

interface ReportsProps {
  investigations: InvestigationRecord[];
  imageAnalyses: FlaggedImage[];
}

export default function Reports({ investigations, imageAnalyses }: ReportsProps) {
  const showToast = useToast();
  const reportOptions = [
    ...REPORT_OPTIONS,
    ...investigations.map((record) => `${record.id} · ${record.caseLabel}`),
    ...imageAnalyses.map((image) => `${image.id} · Image analysis: ${image.fileName}`),
  ];
  const [selected, setSelected] = useState(reportOptions[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const selectedInvestigation = investigations.find((record) => selected.startsWith(record.id));
  const selectedImage = imageAnalyses.find((image) => selected.startsWith(image.id));

  useEffect(() => {
    if (!reportOptions.includes(selected)) {
      setSelected(reportOptions[0]);
    }
  }, [reportOptions, selected]);

  return (
    <section id="reports" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Report assistant</h1>
          <div className="sub">
            Turn an evidence case into a structured draft for Meta's reporting process.
          </div>
        </div>
      </div>

      <div className="card formcard">
        <label className="label">Evidence case</label>
        <div className="sub">Choose which case this report should be built from.</div>
        <CustomSelect value={selected} onChange={setSelected} options={reportOptions} />

        <label className="label" style={{ marginTop: 16 }}>
          Generated report draft
        </label>
        <div className="sub" style={{ marginTop: -6, marginBottom: 8 }}>
          Review this before submitting — it's assembled from the case's evidence and
          hasn't been sent anywhere yet.
        </div>
        <div className="report">
          <b>
            Subject: {selectedInvestigation
              ? selectedInvestigation.caseLabel
              : selectedImage
                ? 'Identity analysis evidence'
                : 'Possible Facebook Impersonation'}
          </b>
          <br />
          <br />
          {selectedImage
            ? 'This evidence record contains an image analysis for review alongside the established identity baseline.'
            : 'This report concerns a Facebook profile suspected of impersonating the established identity of the reporting user.'}
          <br />
          <br />
          <b>{selectedImage ? 'Image record:' : 'Suspected profile:'}</b>{' '}
          {selectedImage?.fileName ?? selectedInvestigation?.profileUrl ?? 'facebook.com/example.profile'}
          <br />
          <b>Observed indicators:</b>{' '}
          {selectedInvestigation
            ? `${selectedInvestigation.profileImageFinding}; ${selectedInvestigation.nameFinding}; ${selectedInvestigation.publicInfoFinding}. ${selectedInvestigation.behaviorFinding}.`
            : selectedImage?.manipulationNotes ?? 'high profile-image similarity, name similarity, and matching publicly visible information.'}
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