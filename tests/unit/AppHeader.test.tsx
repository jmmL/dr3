import { render, screen } from '@testing-library/react';
import AppHeader from '../../src/components/AppHeader';
import { describe, expect, it } from 'vitest';

describe('AppHeader', () => {
  it('renders the title, subtitle, and badge', () => {
    render(
      <AppHeader
        title="Divine Right III"
        subtitle="Mobile-first tactical campaign"
        badge="Client-only Alpha"
      />
    );

    expect(screen.getByText('Divine Right III')).toBeInTheDocument();
    expect(screen.getByText('Mobile-first tactical campaign')).toBeInTheDocument();
    expect(screen.getByText('Client-only Alpha')).toBeInTheDocument();
  });
});
