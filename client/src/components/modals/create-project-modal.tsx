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
import { useAppStore } from '@/store/use-app-store';
import { projectsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  keywords: z.string().min(1, 'Keywords are required'),
  domains: z.string().optional(),
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
