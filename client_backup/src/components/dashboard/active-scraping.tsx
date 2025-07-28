import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { projectsApi } from '@/lib/api';
import { Activity, Pause } from 'lucide-react';

export default function ActiveScraping() {
  // Get first active project for demo
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: projectsApi.getAll,
  });

  const activeProject = projects?.find(p => p.status === 'active');

  const { data: scrapingStatus, isLoading } = useQuery({
    queryKey: ['/api/projects', activeProject?.id, 'scrape/status'],
    queryFn: () => activeProject ? projectsApi.getScrapingStatus(activeProject.id) : null,
    enabled: !!activeProject,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  if (isLoading && activeProject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Scraping</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isActive = scrapingStatus?.isActive && scrapingStatus?.job;
  const job = scrapingStatus?.job;

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Active Scraping</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!activeProject ? (
          <div className="text-center py-6">
            <Pause className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No active projects</p>
          </div>
        ) : !isActive ? (
          <div className="text-center py-6">
            <Pause className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No active scraping</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">{activeProject.name}</span>
              <Badge variant="outline" className="ml-auto">
                <Activity className="w-3 h-3 mr-1" />
                Running
              </Badge>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{job?.platform} scraping</span>
                <span>{job?.progress || 0}%</span>
              </div>
              <Progress value={job?.progress || 0} className="w-full" />
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              {job?.currentProfile && (
                <p>Processing {job.currentProfile}...</p>
              )}
              <p>
                {job?.scannedProfiles || 0}/{job?.totalProfiles || 0} profiles scanned
              </p>
              <p>{job?.foundEmails || 0} emails found</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
