export type StatusCard = {
  label: string;
  value: string;
  detail?: string;
};

export type ActionItem = {
  title: string;
  detail: string;
  tag?: string;
};

export const statusCards: StatusCard[] = [
  { label: 'Current Era', value: 'Age of Strife', detail: 'Mid-campaign balance' },
  { label: 'Turn', value: 'Spring · 1203', detail: 'Planning phase' },
  { label: 'Faction', value: 'Cymmeria', detail: 'Human kingdom' },
  { label: 'Conformance', value: '0 / 7 Chunks', detail: 'Harness pending' },
];

export const quickActions: ActionItem[] = [
  {
    title: 'Start Scenario',
    detail: 'Launch the intro scenario with guided tips.',
    tag: 'Solo',
  },
  {
    title: 'Resume Campaign',
    detail: 'Continue your last saved campaign state.',
    tag: 'Save',
  },
  {
    title: 'Review Phases',
    detail: 'Understand the turn flow and phase order.',
    tag: 'Rules',
  },
];

export const activityFeed: string[] = [
  'Free Cities emissaries propose a supply pact.',
  'Tarsis fleets reposition toward the Inner Sea.',
  'Rumors swirl about a relic under the Red Marches.',
  'Northern marches report unrest along the border.',
];

export const navItems = [
  { label: 'Home', icon: '⌂', active: true },
  { label: 'Map', icon: '🗺️' },
  { label: 'Orders', icon: '⚔️' },
  { label: 'Log', icon: '🧾' },
];
