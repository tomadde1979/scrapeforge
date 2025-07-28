import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { projectsApi } from '@/lib/api';
import { Search, FileDown, Copy, ExternalLink, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ResultsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const { toast } = useToast();

  // Get first project for demo
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: projectsApi.getAll,
  });

  const firstProject = projects?.[0];

  const { data: results, isLoading } = useQuery({
    queryKey: ['/api/projects', firstProject?.id, 'results', platformFilter, searchQuery],
    queryFn: () => 
      firstProject 
        ? projectsApi.getResults(firstProject.id, platformFilter || undefined, searchQuery || undefined)
        : [],
    enabled: !!firstProject,
  });

  const handleCopyHandle = (profileName: string) => {
    navigator.clipboard.writeText(profileName);
    toast({
      title: 'Copied!',
      description: 'Profile handle copied to clipboard',
    });
  };

  const handleVisitProfile = (url: string) => {
    window.open(url, '_blank');
  };

  const handleExport = () => {
    if (firstProject) {
      // Would trigger download
      toast({
        title: 'Export Started',
        description: 'Your results are being exported...',
      });
    }
  };

  const platformIcons: Record<string, string> = {
    instagram: '📷',
    linkedin: '💼',
    reddit: '🔴',
    twitter: '🐦',
  };

  const sourceConfig = {
    bio: { label: 'Bio', variant: 'default' as const },
    bio_link: { label: 'Bio Link', variant: 'secondary' as const },
    ai_parsed: { label: 'AI Parsed', variant: 'outline' as const },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Results</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} className="bg-green-500 hover:bg-green-600">
              <FileDown className="mr-2 h-4 w-4" />
              Export XLS
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Profile</TableHead>
                <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Platform</TableHead>
                <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Email Found</TableHead>
                <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Source</TableHead>
                <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Found</TableHead>
                <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!results || results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {firstProject ? 'Start scraping to see results here.' : 'Create a project to get started.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                results.slice(0, 10).map((result) => (
                  <TableRow key={result.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{result.profileName}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{result.profileUrl}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{platformIcons[result.platform] || '🌐'}</span>
                        <span className="text-sm text-gray-900 capitalize">{result.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {result.email || '-'}
                    </TableCell>
                    <TableCell>
                      {result.emailSource && (
                        <Badge variant={sourceConfig[result.emailSource as keyof typeof sourceConfig]?.variant || 'outline'}>
                          {sourceConfig[result.emailSource as keyof typeof sourceConfig]?.label || result.emailSource}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(result.foundAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyHandle(result.profileName)}
                          title="Copy handle"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVisitProfile(result.profileUrl)}
                          title="Visit profile"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {results && results.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{Math.min(10, results.length)}</span> of{' '}
                <span className="font-medium">{results.length}</span> results
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
