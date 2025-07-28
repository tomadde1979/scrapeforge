import StatsCards from '@/components/dashboard/stats-cards';
import RecentProjects from '@/components/dashboard/recent-projects';
import ActiveScraping from '@/components/dashboard/active-scraping';
import PlatformStatus from '@/components/dashboard/platform-status';
import ResultsTable from '@/components/dashboard/results-table';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <StatsCards />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <RecentProjects />
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="space-y-6">
          <ActiveScraping />
          <PlatformStatus />
        </div>
      </div>

      {/* Recent Results Table */}
      <ResultsTable />
    </div>
  );
}
