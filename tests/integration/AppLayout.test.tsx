import { render, screen } from '@testing-library/react';
import App from '../../src/App';
import { describe, expect, it } from 'vitest';

describe('App layout', () => {
  it('renders the main dashboard sections', () => {
    render(<App />);

    expect(screen.getByText('World of Divine Right')).toBeInTheDocument();
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('Campaign Log')).toBeInTheDocument();
  });
});
