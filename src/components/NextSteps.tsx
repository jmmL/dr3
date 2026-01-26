import type { ActionItem } from '../data/dashboard';

type NextStepsProps = {
  actions: ActionItem[];
};

export default function NextSteps({ actions }: NextStepsProps) {
  return (
    <section className="panel" aria-label="Quick actions">
      <div className="panel__header">
        <h2>Next Steps</h2>
        <span className="pill pill--soft">Phase 0</span>
      </div>
      <div className="panel__content">
        {actions.map((action) => (
          <button key={action.title} className="action" type="button">
            <div>
              <p className="action__title">{action.title}</p>
              <p className="action__detail">{action.detail}</p>
            </div>
            {action.tag ? <span className="tag">{action.tag}</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
