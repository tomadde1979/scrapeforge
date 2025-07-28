import { apiRequest } from './queryClient';

export interface Project {
  id: string;
  name: string;
  description?: string;
  platforms: string[];
  keywords?: string;
  domains?: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapingResult {
  id: string;
  projectId: string;
  profileName: string;
  profileUrl: string;
  platform: string;
  email?: string;
  emailSource?: string;
  bioText?: string;
  linkInBio?: string;
  isAiParsed: boolean;
  foundAt: string;
}

export interface DashboardStats {
  activeProjects: number;
  emailsFound: number;
  profilesScanned: number;
  successRate: number;
}

export interface ProjectStats {
  profilesScanned: number;
  emailsFound: number;
  successRate: number;
  aiParsed: number;
}

export interface ScrapingJob {
  id: string;
  projectId: string;
  platform: string;
  status: string;
  progress: number;
  totalProfiles: number;
  scannedProfiles: number;
  foundEmails: number;
  currentProfile?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// Projects API
export const projectsApi = {
  getAll: () => fetch('/api/projects').then(res => res.json()) as Promise<Project[]>,
  
  getById: (id: string) => fetch(`/api/projects/${id}`).then(res => res.json()) as Promise<Project>,
  
  create: async (data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiRequest('POST', '/api/projects', data);
    return response.json() as Promise<Project>;
  },
  
  update: async (id: string, data: Partial<Project>) => {
    const response = await apiRequest('PUT', `/api/projects/${id}`, data);
    return response.json() as Promise<Project>;
  },
  
  delete: async (id: string) => {
    const response = await apiRequest('DELETE', `/api/projects/${id}`);
    return response.json();
  },
  
  startScraping: async (id: string) => {
    const response = await apiRequest('POST', `/api/projects/${id}/scrape`);
    return response.json();
  },
  
  stopScraping: async (id: string) => {
    const response = await apiRequest('POST', `/api/projects/${id}/scrape/stop`);
    return response.json();
  },
  
  getScrapingStatus: (id: string) => 
    fetch(`/api/projects/${id}/scrape/status`).then(res => res.json()) as Promise<{
      isActive: boolean;
      job?: ScrapingJob;
    }>,
  
  getResults: (id: string, platform?: string, search?: string) => {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (search) params.append('search', search);
    
    return fetch(`/api/projects/${id}/results?${params}`).then(res => res.json()) as Promise<ScrapingResult[]>;
  },
  
  getStats: (id: string) => 
    fetch(`/api/projects/${id}/stats`).then(res => res.json()) as Promise<ProjectStats>,
  
  export: (id: string) => 
    fetch(`/api/projects/${id}/export`).then(res => res.blob()),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => fetch('/api/dashboard/stats').then(res => res.json()) as Promise<DashboardStats>,
};
