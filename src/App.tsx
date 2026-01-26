import ActivityFeed from './components/ActivityFeed';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';
import MapPreview from './components/MapPreview';
import NextSteps from './components/NextSteps';
import StatusGrid from './components/StatusGrid';
import { activityFeed, quickActions, statusCards } from './data/dashboard';

export default function App() {
  return (
    <div className="app">
      <AppHeader
        title="Divine Right III"
        subtitle="Mobile-first tactical campaign"
        badge="Client-only Alpha"
      />

      <main className="app__main">
        <MapPreview
          title="World of Divine Right"
          subtitle="Single-player, GitHub Pages prototype"
          status="SVG Hex Grid · Prototype"
        />

        <StatusGrid cards={statusCards} />

        <div className="panel-grid">
          <NextSteps actions={quickActions} />
          <ActivityFeed items={activityFeed} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
