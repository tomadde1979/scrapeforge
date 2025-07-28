import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { 
  BarChart3, 
  FolderOpen, 
  Bot, 
  Database, 
  Settings, 
  User, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Scrapers', href: '/scrapers', icon: Bot },
  { name: 'Results', href: '/results', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  if (!sidebarOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ScrapeForge</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg group transition-colors text-left",
                  isActive 
                    ? "text-white bg-primary" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
                {item.name === 'Projects' && (
                  <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">John Developer</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
