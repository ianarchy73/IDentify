import { useEffect, useMemo, useRef, useState } from 'react';
import { IconSearch, IconFilter } from '../components/icons';
import CaseDetailModal from '../components/modals/CaseDetailModal';
import EditCaseModal from '../components/modals/Edit';
import ConfirmModal from '../components/modals/Confirm';
import { useToast } from '../components/toast/ToastContext';

const INITIAL_CASES = [
  {
    id: 'CASE-001',
    title: 'Possible impersonation',
    url: 'facebook.com/example.profile',
    risk: 'high',
    riskLabel: 'HIGH',
    created: 'Sep 10, 2026',
    status: 'Investigating',
    timeline: [
      {
        title: 'Profile submitted',
        detail: 'facebook.com/example.profile · Sep 10, 2026 8:03 PM',
      },
      {
        title: 'Risk assessment completed',
        detail: 'High-risk signals identified.',
      },
      {
        title: 'Evidence package created',
        detail: 'Profile URL, screenshots and analysis summary attached.',
      },
    ],
  },
  {
    id: 'CASE-002',
    title: 'Profile image reuse',
    url: 'Profile image reuse',
    risk: 'medium',
    riskLabel: 'MEDIUM',
    created: 'Sep 8, 2026',
    status: 'Evidence collected',
    timeline: [
      {
        title: 'Image submitted for analysis',
        detail: 'facebook.com/sample.account · Sep 8, 2026 3:20 PM',
      },
      {
        title: 'Manipulation indicators flagged',
        detail: 'Medium-risk signals identified, manual review recommended.',
      },
    ],
  },
  {
    id: 'CASE-003',
    title: 'Previous impersonator',
    url: 'Previous impersonator',
    risk: 'resolved',
    riskLabel: 'RESOLVED',
    created: 'Aug 29, 2026',
    status: 'Closed',
    timeline: [
      {
        title: 'Case opened',
        detail: 'facebook.com/old.account · Aug 29, 2026',
      },
      { title: 'Reported to platform', detail: 'Report submitted for review.' },
      { title: 'Case closed', detail: 'Account was removed by the platform.' },
    ],
  },
];

const RISK_FILTERS = [
  { value: 'all', label: 'All risk levels' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'resolved', label: 'Resolved' },
];

export default function Cases({ onNavigate }) {
  const showToast = useToast();
  const [cases, setCases] = useState(INITIAL_CASES);
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [activeCase, setActiveCase] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRisk = RISK_FILTERS.find((f) => f.value === riskFilter) ?? RISK_FILTERS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      const matchesQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.url.toLowerCase().includes(q);
      const matchesRisk = riskFilter === 'all' || c.risk === riskFilter;
      return matchesQuery && matchesRisk;
    });
  }, [cases, query, riskFilter]);

  const handleDeleteConfirmed = () => {
    if (!pendingDelete) return;
    setCases((prev) => prev.filter((c) => c.id !== pendingDelete.id));
    showToast(`${pendingDelete.id} deleted`);
  };

  const handleSaveEdit = (updated) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCase(null);
    showToast(`${updated.id} updated`);
  };

  return (
    <section id="cases" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Cases</h1>
          <div className="sub">Evidence and investigation history.</div>
        </div>
        <button className="btn primary" onClick={() => onNavigate?.('investigate')}>
          New investigation
        </button>
      </div>

      <div className="card">
        <div className="cases-toolbar">
          <div className="search-field">
            <IconSearch size={15} className="search-icon" />
            <input
              className="input search-input"
              placeholder="Search cases by name or URL..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-field custom-select" ref={filterRef}>
            <IconFilter size={15} className="filter-icon" />
            <div
              className={`cs-trigger ${filterOpen ? 'open' : ''}`}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <span>{selectedRisk.label}</span>
              <svg className="cs-arrow" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={`cs-options ${filterOpen ? 'show' : ''}`}>
              {RISK_FILTERS.map((f) => (
                <div
                  key={f.value}
                  className={`cs-option ${riskFilter === f.value ? 'selected' : ''}`}
                  onClick={() => {
                    setRiskFilter(f.value);
                    setFilterOpen(false);
                  }}
                >
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <table className="table">
          <tr>
            <th>Case</th>
            <th>Risk</th>
            <th>Created</th>
            <th>Status</th>
            <th></th>
          </tr>
          {filtered.map((c) => (
            <tr key={c.id} className="clickable">
              <td onClick={() => setActiveCase(c)}>
                <b>{c.id}</b>
                <div className="url">{c.title}</div>
              </td>
              <td onClick={() => setActiveCase(c)}>
                <span className={`badge ${c.risk}`}>{c.riskLabel}</span>
              </td>
              <td onClick={() => setActiveCase(c)}>{c.created}</td>
              <td onClick={() => setActiveCase(c)}>{c.status}</td>
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn-primary"
                    aria-label={`Edit ${c.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCase(c);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M16.862 4.487 19.5 7.125M5 19l.938-3.938L15.75 5.25a1.5 1.5 0 0 1 2.121 0l1.879 1.879a1.5 1.5 0 0 1 0 2.121L9.938 19.062 5 19Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    aria-label={`Delete ${c.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(c);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-8 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">No cases match your search or filter.</div>
        )}
      </div>

      {activeCase && (
        <CaseDetailModal
          caseItem={activeCase}
          onClose={() => setActiveCase(null)}
          onPrepareReport={() => {
            showToast(`Preparing report for ${activeCase.id}`);
            onNavigate?.('reports');
          }}
        />
      )}

      {editingCase && (
        <EditCaseModal
          caseItem={editingCase}
          onClose={() => setEditingCase(null)}
          onSave={handleSaveEdit}
        />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        type="danger"
        title={pendingDelete ? `Delete ${pendingDelete.id}?` : ''}
        message="This permanently removes the case and its collected evidence from your account. This can't be undone."
        confirmText="Delete case"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </section>
  );
}