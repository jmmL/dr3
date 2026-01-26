import type { StatusCard } from '../data/dashboard';

type StatusGridProps = {
  cards: StatusCard[];
};

export default function StatusGrid({ cards }: StatusGridProps) {
  return (
    <section className="status-grid" aria-label="Scenario status">
      {cards.map((card) => (
        <div key={card.label} className="status-card">
          <p className="status-card__label">{card.label}</p>
          <p className="status-card__value">{card.value}</p>
          {card.detail ? <p className="status-card__detail">{card.detail}</p> : null}
        </div>
      ))}
    </section>
  );
}
