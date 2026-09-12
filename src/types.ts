// Shared types used across the app. Extracted during the JSX -> TSX
// conversion so components don't each redeclare the same shapes.

export type Screen =
  | 'dashboard'
  | 'investigate'
  | 'image'
  | 'monitoring'
  | 'cases'
  | 'reports'
  | 'settings';

export type RiskLevel = 'high' | 'medium' | 'resolved';

export interface TimelineEvent {
  title: string;
  detail: string;
}

export interface CaseItem {
  id: string;
  title: string;
  url: string;
  risk: RiskLevel;
  riskLabel: string;
  created: string;
  status: string;
  timeline: TimelineEvent[];
}
