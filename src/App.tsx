const statusCards = [
  { label: 'Current Era', value: 'Age of Strife' },
  { label: 'Turn', value: 'Spring • 1203' },
  { label: 'Faction', value: 'Cymmeria (Human)' },
];

const quickActions = [
  { title: 'Start Scenario', detail: 'Load a quick-start skirmish.' },
  { title: 'Resume Campaign', detail: 'Continue your last save.' },
  { title: 'Learn the Rules', detail: 'Browse core actions and phases.' },
];

const activityFeed = [
  'The Free Cities brokered a fragile truce.',
  'Tarsis fleets reinforce the Inner Sea.',
  'Rumors of a relic beneath the Red Marches.',
];

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <div className="brand__icon" aria-hidden="true">
            DR3
          </div>
          <div>
            <p className="brand__title">Divine Right III</p>
            <p className="brand__subtitle">Mobile-first tactical campaign</p>
          </div>
        </div>
        <button className="button button--ghost" type="button">
          View Conformance
        </button>
      </header>

      <main className="app__main">
        <section className="map-card" aria-label="Strategic map preview">
          <div className="map-card__header">
            <div>
              <p className="eyebrow">Strategic Overview</p>
              <h1>World of Divine Right</h1>
            </div>
            <span className="pill">SVG Hex Grid • Prototype</span>
          </div>
          <div className="map-card__map" role="img" aria-label="Placeholder hex map">
            <div className="hex-grid">
              {Array.from({ length: 18 }).map((_, index) => (
                <span key={`hex-${index}`} className="hex" />
              ))}
            </div>
          </div>
          <div className="map-card__footer">
            <p>
              This preview validates the mobile layout, info density, and touch-first navigation
              before connecting the rules engine.
            </p>
            <button className="button" type="button">
              Enter Sandbox
            </button>
          </div>
        </section>

        <section className="status-grid" aria-label="Scenario status">
          {statusCards.map((card) => (
            <div key={card.label} className="status-card">
              <p className="status-card__label">{card.label}</p>
              <p className="status-card__value">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="panel" aria-label="Quick actions">
          <div className="panel__header">
            <h2>Next Steps</h2>
            <span className="pill pill--soft">Phase 0</span>
          </div>
          <div className="panel__content">
            {quickActions.map((action) => (
              <button key={action.title} className="action" type="button">
                <div>
                  <p className="action__title">{action.title}</p>
                  <p className="action__detail">{action.detail}</p>
                </div>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel" aria-label="Campaign log">
          <div className="panel__header">
            <h2>Campaign Log</h2>
            <span className="pill pill--soft">Latest Updates</span>
          </div>
          <ul className="panel__list">
            {activityFeed.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>

      <nav className="app__nav" aria-label="Primary">
        <button className="nav-item nav-item--active" type="button">
          <span className="nav-item__icon">⌂</span>
          Home
        </button>
        <button className="nav-item" type="button">
          <span className="nav-item__icon">🗺️</span>
          Map
        </button>
        <button className="nav-item" type="button">
          <span className="nav-item__icon">⚔️</span>
          Orders
        </button>
        <button className="nav-item" type="button">
          <span className="nav-item__icon">🧾</span>
          Log
        </button>
      </nav>
    </div>
  );
}
