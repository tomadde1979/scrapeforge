import { useEffect } from 'react';
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

const editProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  keywords: z.string().min(1, 'Keywords are required'),
  domains: z.string().optional(),
});

type EditProjectForm = z.infer<typeof editProjectSchema>;

const platformOptions = [
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'reddit', label: 'Reddit', icon: '🔴' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
];

export default function EditProjectModal() {
  const { editProjectModalOpen, setEditProjectModalOpen, editingProject, setEditingProject } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditProjectForm>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      platforms: [],
      keywords: '',
      domains: '',
    },
  });

  // Update form values when editing project changes
  useEffect(() => {
    if (editingProject) {
      form.reset({
        name: editingProject.name,
        description: editingProject.description || '',
        platforms: editingProject.platforms || [],
        keywords: editingProject.keywords || '',
        domains: editingProject.domains || '',
      });
    }
  }, [editingProject, form]);

  const editProjectMutation = useMutation({
    mutationFn: (data: EditProjectForm) => projectsApi.update(editingProject!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setEditProjectModalOpen(false);
      setEditingProject(null);
      form.reset();
      toast({
        title: 'Project Updated',
        description: 'Your project has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EditProjectForm) => {
    editProjectMutation.mutate(data);
  };

  const handleClose = () => {
    setEditProjectModalOpen(false);
    setEditingProject(null);
    form.reset();
  };

  return (
    <Dialog open={editProjectModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
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
                    <Input
                      placeholder="Enter project name..."
                      {...field}
                    />
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
                      placeholder="Enter project description..."
                      className="resize-none"
                      rows={3}
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
                  <FormLabel>Platforms</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {platformOptions.map((platform) => (
                      <FormField
                        key={platform.id}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={platform.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
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
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  {platform.icon} {platform.label}
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
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
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., fitness, health, wellness (comma separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domains"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Domains (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., gmail.com, company.com (comma separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={editProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editProjectMutation.isPending}
              >
                {editProjectMutation.isPending ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}