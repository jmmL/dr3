import { navItems } from '../data/dashboard';

export default function BottomNav() {
  return (
    <nav className="app-nav" aria-label="Primary">
      {navItems.map((item) => (
        <button
          key={item.label}
          className={`nav-item${item.active ? ' nav-item--active' : ''}`}
          type="button"
        >
          <span className="nav-item__icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
