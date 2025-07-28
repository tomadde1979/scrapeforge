import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import CreateProjectModal from "@/components/modals/create-project-modal";
import { useAppStore } from "@/store/use-app-store";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarOpen = useAppStore(state => state.sidebarOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 font-sans">
          <Sidebar />
          
          <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <Header />
            <main className="p-6">
              <Router />
            </main>
          </div>
          
          <CreateProjectModal />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
