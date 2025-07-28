import { create } from 'zustand';
import { Project, ScrapingResult, DashboardStats } from '../lib/api';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  createProjectModalOpen: boolean;
  
  // Data State
  projects: Project[];
  currentProject: Project | null;
  dashboardStats: DashboardStats | null;
  scrapingResults: ScrapingResult[];
  
  // Loading States
  loading: {
    projects: boolean;
    dashboard: boolean;
    scraping: boolean;
  };
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCreateProjectModalOpen: (open: boolean) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setDashboardStats: (stats: DashboardStats | null) => void;
  setScrapingResults: (results: ScrapingResult[]) => void;
  setLoading: (key: keyof AppState['loading'], loading: boolean) => void;
  
  // Computed
  getProjectById: (id: string) => Project | undefined;
  getActiveProjects: () => Project[];
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  sidebarOpen: true,
  createProjectModalOpen: false,
  projects: [],
  currentProject: null,
  dashboardStats: null,
  scrapingResults: [],
  loading: {
    projects: false,
    dashboard: false,
    scraping: false,
  },
  
  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCreateProjectModalOpen: (open) => set({ createProjectModalOpen: open }),
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  setScrapingResults: (results) => set({ scrapingResults: results }),
  setLoading: (key, loading) => 
    set((state) => ({
      loading: { ...state.loading, [key]: loading }
    })),
  
  // Computed
  getProjectById: (id) => get().projects.find(p => p.id === id),
  getActiveProjects: () => get().projects.filter(p => p.status === 'active'),
}));
