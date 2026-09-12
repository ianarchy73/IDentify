import {
  IconLogo,
  IconDashboard,
  IconInvestigate,
  IconImageCheck,
  IconMonitoring,
  IconCases,
  IconReports,
  IconSettings,
} from './icons';

const NAV_GROUPS = [
  {
    section: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
      { id: 'investigate', label: 'Investigate', Icon: IconInvestigate },
      { id: 'image', label: 'Image Check', Icon: IconImageCheck },
    ],
  },
  {
    section: 'Protection',
    items: [
      { id: 'monitoring', label: 'Monitoring', Icon: IconMonitoring },
      { id: 'cases', label: 'Cases', Icon: IconCases },
      { id: 'reports', label: 'Reports', Icon: IconReports },
    ],
  },
  {
    section: 'Account',
    items: [{ id: 'settings', label: 'Settings', Icon: IconSettings }],
  },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <IconLogo size={26} className="brand-logo" />
        <span><b>ID</b>entify</span>
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.section}>
          <div className="section">{group.section}</div>
          {group.items.map(({ id, label, Icon }) => (
            <div
              key={id}
              className={`nav ${active === id ? 'active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <span className="icon">
                <Icon size={18} />
              </span>
              {label}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}
