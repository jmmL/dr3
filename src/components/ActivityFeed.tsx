type ActivityFeedProps = {
  items: string[];
};

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="panel" aria-label="Campaign log">
      <div className="panel__header">
        <h2>Campaign Log</h2>
        <span className="pill pill--soft">Latest Updates</span>
      </div>
      <ul className="panel__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
