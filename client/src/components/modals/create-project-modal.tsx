import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/use-app-store';
import { projectsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  keywords: z.string().min(1, 'Keywords are required'),
  domains: z.string().optional(),
  includeFollowers: z.boolean().default(false),
  includeCommenters: z.boolean().default(false),
  maxFollowersPerProfile: z.number().min(10).max(500).default(100),
  maxCommentsPerProfile: z.number().min(10).max(200).default(50),
  maxPostsToScan: z.number().min(1).max(50).default(10),
  useRealScraping: z.boolean().default(true),
  useHeadlessMode: z.boolean().default(true),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

const platformOptions = [
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'reddit', label: 'Reddit', icon: '🔴' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
];

export default function CreateProjectModal() {
  const { createProjectModalOpen, setCreateProjectModalOpen } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      platforms: [],
      keywords: '',
      domains: '',
      includeFollowers: false,
      includeCommenters: false,
      maxFollowersPerProfile: 100,
      maxCommentsPerProfile: 50,
      maxPostsToScan: 10,
      useRealScraping: true,
      useHeadlessMode: true,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setCreateProjectModalOpen(false);
      form.reset();
      toast({
        title: 'Project Created',
        description: 'Your new scraping project has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateProjectForm) => {
    createProjectMutation.mutate({
      ...data,
      status: 'active',
    });
  };

  return (
    <Dialog open={createProjectModalOpen} onOpenChange={setCreateProjectModalOpen}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tech Startup Founders" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Brief description of your scraping goals..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <FormLabel>Select Platforms</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {platformOptions.map((platform) => (
                      <FormField
                        key={platform.id}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, platform.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== platform.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <span className="text-lg">{platform.icon}</span>
                              <span className="text-sm font-medium">{platform.label}</span>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords & Hashtags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="startup, founder, CEO, entrepreneur (comma separated)"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Enter keywords to search for in profiles and bios
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domains"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Domains (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="example.com, another-site.org (comma separated)"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Additional websites to scrape beyond major platforms
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Real Scraping Mode */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <FormField
                control={form.control}
                name="useRealScraping"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold text-green-800">🔥 Real Scraping Mode</FormLabel>
                      <p className="text-sm text-green-600">
                        Enable actual web scraping from Instagram and Reddit (instead of demo data)
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="useHeadlessMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold text-purple-800">🤖 Headless Browser Mode</FormLabel>
                      <p className="text-sm text-purple-600">
                        Use stealth browser automation for Instagram and LinkedIn. More authentic but slower than APIs.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Advanced Scraping Options */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">🚧 Advanced Scraping Options</h3>
              
              <FormField
                control={form.control}
                name="includeFollowers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Include Followers</FormLabel>
                      <p className="text-sm text-gray-500">
                        Scrape followers from target profiles to expand your reach
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeCommenters"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Include Commenters</FormLabel>
                      <p className="text-sm text-gray-500">
                        Scrape users who comment on target profiles' posts
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Advanced Settings - Show only if advanced options are enabled */}
              {(form.watch('includeFollowers') || form.watch('includeCommenters')) && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Limits & Settings</h4>
                  
                  {form.watch('includeFollowers') && (
                    <FormField
                      control={form.control}
                      name="maxFollowersPerProfile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Followers per Profile</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="10"
                              max="500"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">
                            Higher numbers provide more data but take longer (10-500)
                          </p>
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch('includeCommenters') && (
                    <>
                      <FormField
                        control={form.control}
                        name="maxPostsToScan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Posts to Scan</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">
                              Number of recent posts to scan for comments (1-50)
                            </p>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxCommentsPerProfile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Comments per Profile</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="10"
                                max="200"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">
                              Maximum comments to collect per target profile (10-200)
                            </p>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Advanced scraping can significantly increase processing time and may encounter rate limits. 
                      Start with smaller limits for testing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateProjectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
