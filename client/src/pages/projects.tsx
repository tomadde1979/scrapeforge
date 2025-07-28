import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/use-app-store';
import { projectsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, FolderOpen, Play, Pause, Settings, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Projects() {
  const { setCreateProjectModalOpen } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: projectsApi.getAll,
  });

  const startScrapingMutation = useMutation({
    mutationFn: projectsApi.startScraping,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'scrape/status'] });
      toast({
        title: 'Scraping Started',
        description: 'Your scraping job has been started successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start scraping. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
    },
  });

  const handleStartScraping = (projectId: string) => {
    startScrapingMutation.mutate(projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <Button onClick={() => setCreateProjectModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your scraping projects and configurations</p>
        </div>
        <Button onClick={() => setCreateProjectModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first scraping project.
            </p>
            <Button
              className="mt-4"
              onClick={() => setCreateProjectModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Platforms:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.platforms?.map((platform) => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">None</span>}
                  </div>
                </div>
                
                {project.keywords && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Keywords:</p>
                    <p className="text-sm text-gray-600 truncate">{project.keywords}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <Button
                    size="sm"
                    onClick={() => handleStartScraping(project.id)}
                    disabled={startScrapingMutation.isPending}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    {startScrapingMutation.isPending ? 'Starting...' : 'Start'}
                  </Button>
                  
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deleteProjectMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
