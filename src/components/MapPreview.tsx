type MapPreviewProps = {
  title: string;
  subtitle: string;
  status: string;
};

export default function MapPreview({ title, subtitle, status }: MapPreviewProps) {
  return (
    <section className="map-card" aria-label="Strategic map preview">
      <div className="map-card__header">
        <div>
          <p className="eyebrow">Strategic Overview</p>
          <h1>{title}</h1>
          <p className="map-card__subtitle">{subtitle}</p>
        </div>
        <span className="pill">{status}</span>
      </div>
      <div className="map-card__map" role="img" aria-label="Placeholder hex map">
        <div className="hex-grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={`hex-${index}`} className="hex" />
          ))}
        </div>
        <div className="map-card__overlay">
          <div>
            <p className="map-card__label">Active front</p>
            <p className="map-card__value">Inner Sea corridor</p>
          </div>
          <button className="button" type="button">
            Enter Sandbox
          </button>
        </div>
      </div>
      <div className="map-card__footer">
        <p>
          Validate mobile navigation, density, and interaction zones before wiring the rules engine
          and conformance harness.
        </p>
        <div className="chip-row">
          <span className="chip">Rules Engine: Pending</span>
          <span className="chip">Bots: Disabled</span>
          <span className="chip">Saves: Local</span>
        </div>
      </div>
    </section>
  );
}
