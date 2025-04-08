import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConvertedSites, deleteConvertedSite, downloadConvertedSite } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from 'date-fns';
import { Download, Trash2, Coffee, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type ConvertedSite, type ConversionStatus } from '@/types';

const ConvertedSites: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch converted sites
  const { data: convertedSites, isLoading, error } = useQuery({
    queryKey: ['/api/sites/converted'],
    queryFn: getConvertedSites,
    refetchInterval: 5000 // Refetch every 5 seconds to update conversion progress
  });

  // Delete site mutation
  const deleteMutation = useMutation({
    mutationFn: deleteConvertedSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sites/converted'] });
      toast({
        title: "Site deleted",
        description: "The converted site has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete the site.",
      });
    }
  });

  // Handle download site
  const handleDownload = (site: ConvertedSite) => {
    downloadConvertedSite(site.id);
    toast({
      title: "Downloading...",
      description: "Your React project is being downloaded.",
    });
  };

  // Handle delete site
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this converted site?")) {
      deleteMutation.mutate(id);
    }
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string): string => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Converted React Sites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Converted React Sites</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <p className="text-red-800 dark:text-red-200">Error loading converted sites: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Converted React Sites</h1>
      
      {convertedSites?.length === 0 ? (
        <div className="bg-muted p-6 rounded-md text-center">
          <Coffee className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No converted sites yet</h3>
          <p className="text-muted-foreground mb-4">
            Convert crawled sites to React applications to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {convertedSites?.map((site) => (
            <Card key={site.id} className="w-full">
              <CardHeader>
                <CardTitle className="line-clamp-1 text-lg">{site.name || site.url}</CardTitle>
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-muted-foreground truncate hover:text-primary transition-colors"
                >
                  {site.url}
                </a>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {site.status === 'in_progress' ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Converting
                    </Badge>
                  ) : site.status === 'failed' ? (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Completed
                    </Badge>
                  )}
                </div>
                
                {site.status === 'in_progress' && (
                  <div className="mt-2">
                    <Progress className="h-2 mb-1" value={45} />
                    <p className="text-xs text-center text-muted-foreground">Converting to React application...</p>
                  </div>
                )}
                
                {site.reactVersion && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">React:</span>
                    <Badge variant="outline">{site.reactVersion}</Badge>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pages:</span>
                  <span className="text-sm font-medium">{site.pageCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Size:</span>
                  <span className="text-sm font-medium">{formatBytes(site.size)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Converted:</span>
                  <span className="text-sm font-medium">{formatRelativeTime(site.convertedAt)}</span>
                </div>
                
                {site.error && (
                  <div className="mt-2 p-2 bg-red-50 text-red-800 text-xs rounded border border-red-200">
                    <p className="font-semibold">Error:</p>
                    <p className="line-clamp-3">{site.error}</p>
                  </div>
                )}
                
                <Separator className="my-2" />
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                {site.status === 'completed' ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownload(site)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(site.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : site.status === 'in_progress' ? (
                  <Button 
                    disabled
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      disabled
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Failed
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(site.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConvertedSites;