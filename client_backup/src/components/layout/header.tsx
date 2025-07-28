import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";
import LogoutButton from "@/components/layout/logout-button";

export default function Header() {
  const setCreateProjectModalOpen = useAppStore(state => state.setCreateProjectModalOpen);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor your scraping projects and results</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          <Button 
            onClick={() => setCreateProjectModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
