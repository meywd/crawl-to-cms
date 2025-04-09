import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, RefreshCw, ExternalLink, Download } from 'lucide-react';
import { extractSiteForPreview, buildSiteForPreview, getPreviewStatus } from '@/lib/api';

interface PreviewStatus {
  siteId: string;
  status: 'not_started' | 'building' | 'complete' | 'failed';
  previewUrl: string | null;
}

const ConvertedSiteLivePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [iframe, setIframe] = useState<string | null>(null);

  // Extract the site
  const extractMutation = useMutation({
    mutationFn: async () => {
      return extractSiteForPreview(id);
    },
    onSuccess: () => {
      toast({
        title: 'Site extracted',
        description: 'Ready to build the preview',
      });
      // Automatically start the build after extraction
      buildMutation.mutate();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error extracting site',
        description: error.message || 'An error occurred while extracting the site',
      });
    },
  });

  // Build the site
  const buildMutation = useMutation({
    mutationFn: async () => {
      return buildSiteForPreview(id);
    },
    onSuccess: () => {
      toast({
        title: 'Build started',
        description: 'The site is being built, please wait...',
      });
      // Start polling for status updates
      queryClient.invalidateQueries({ queryKey: ['preview-status', id] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error building site',
        description: error.message || 'An error occurred while building the site',
      });
    },
  });

  // Get site info
  const { data: site, isLoading: isSiteLoading } = useQuery({
    queryKey: ['converted-site', id],
    queryFn: async () => {
      const response = await fetch(`/api/sites/converted/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch site details');
      }
      return response.json();
    },
  });

  // Get build status
  const { 
    data: status, 
    isLoading: isStatusLoading,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['preview-status', id],
    queryFn: async () => {
      try {
        return await getPreviewStatus(id);
      } catch (error) {
        throw new Error('Failed to fetch build status');
      }
    },
    refetchInterval: (data) => {
      // Poll every second while building, stop polling when complete or failed
      if (data && 'status' in data) {
        return data.status === 'building' ? 1000 : false;
      }
      return 1000; // Default to poll every second until we get status
    },
  });

  // Update iframe when status is complete
  useEffect(() => {
    if (status?.status === 'complete' && status?.previewUrl) {
      setIframe(status.previewUrl);
    }
  }, [status]);

  // Start the process on first load if not already started
  useEffect(() => {
    if (status?.status === 'not_started') {
      extractMutation.mutate();
    }
  }, [status]);

  // Handle back button
  const handleBack = () => {
    setLocation('/converted-sites');
  };

  // Handle restart
  const handleRestart = () => {
    extractMutation.mutate();
  };

  // Loading states
  if (isSiteLoading) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Converted Sites
        </Button>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Converted Sites
        </Button>
        
        <div className="flex gap-2">
          {status?.status === 'complete' && status?.previewUrl && (
            <Button
              variant="outline"
              onClick={() => status.previewUrl && window.open(status.previewUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => handleRestart()}
            disabled={extractMutation.isPending || buildMutation.isPending || status?.status === 'building'}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Rebuild
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = `/api/sites/download/${id}`}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-2">{site?.name || site?.url}</h1>
          <p className="text-muted-foreground text-sm mb-4">{site?.url}</p>
          
          {/* Build Status */}
          {isStatusLoading ? (
            <div className="mb-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : status?.status === 'building' ? (
            <div className="mb-6">
              <p className="text-sm mb-2">Building preview... This may take a few minutes.</p>
              <Progress value={45} className="h-2" />
            </div>
          ) : status?.status === 'failed' ? (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <p className="font-medium">Build failed</p>
              <p className="text-sm mt-1">
                There was an error building the preview. Please try again or check the logs.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRestart} 
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Try again
              </Button>
            </div>
          ) : status?.status === 'complete' ? (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
              <p className="font-medium">Build successful</p>
              <p className="text-sm mt-1">
                Your site preview is ready. You can view it below or open it in a new tab.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-sm mb-2">Preparing to build preview...</p>
              <Progress value={15} className="h-2" />
            </div>
          )}
          
          {/* Preview iframe */}
          {iframe ? (
            <div className="w-full h-[600px] border border-border rounded-md overflow-hidden">
              <iframe 
                src={iframe}
                className="w-full h-full"
                title="Site Preview"
              />
            </div>
          ) : (
            <div className="w-full h-[600px] border border-border rounded-md flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Preview Loading</p>
                <p className="text-sm text-muted-foreground">
                  {status?.status === 'building' 
                    ? 'Building your site...' 
                    : status?.status === 'failed'
                    ? 'Build failed. Please try again.'
                    : 'Preparing your site preview...'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConvertedSiteLivePreview;