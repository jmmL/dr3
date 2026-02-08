import { describe, expect, it } from 'vitest';
import { activityFeed, quickActions, statusCards } from '../../src/data/dashboard';

describe('dashboard data conformance', () => {
  it('defines a conformance status card entry', () => {
    const conformanceCard = statusCards.find((card) => card.label === 'Conformance');

    expect(conformanceCard).toBeDefined();
    expect(conformanceCard?.value).toMatch(/\d+ \/ \d+ Chunks/);
  });

  it('ensures quick actions have details', () => {
    quickActions.forEach((action) => {
      expect(action.detail.length).toBeGreaterThan(0);
    });
  });

  it('lists recent activity feed updates', () => {
    expect(activityFeed.length).toBeGreaterThanOrEqual(3);
  });
});
