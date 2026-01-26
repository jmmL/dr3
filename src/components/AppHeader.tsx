type AppHeaderProps = {
  title: string;
  subtitle: string;
  badge: string;
};

export default function AppHeader({ title, subtitle, badge }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand__icon" aria-hidden="true">
          DR3
        </div>
        <div>
          <p className="brand__title">{title}</p>
          <p className="brand__subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="header-actions">
        <span className="pill pill--soft">{badge}</span>
        <button className="button button--ghost" type="button">
          View Conformance
        </button>
      </div>
    </header>
  );
}
