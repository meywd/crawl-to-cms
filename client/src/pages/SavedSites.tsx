import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Database, Globe, ExternalLink, Trash2, Download, FileCode } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { deleteSavedSite, getSavedSites, convertToReact } from "@/lib/api";
import { type SavedSite } from "@/types";

export default function SavedSitesPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Query to fetch saved sites
  const { 
    data: savedSites = [], 
    isLoading, 
    error,
    isError 
  } = useQuery<SavedSite[]>({
    queryKey: ['/api/sites/saved'],
    queryFn: getSavedSites,
  });

  // Mutation for deleting a site
  const deleteMutation = useMutation({
    mutationFn: deleteSavedSite,
    onSuccess: () => {
      toast({
        title: "Site deleted",
        description: "The saved site has been deleted",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/sites/saved'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete saved site",
        variant: "destructive",
      });
    }
  });

  const handleDeleteSite = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleViewSite = (site: SavedSite) => {
    // Navigate to preview with crawlId
    setLocation(`/preview/${site.crawlId}`);
  };

  const handleDownloadSite = async (id: string) => {
    try {
      // In a real implementation, this would trigger a download
      window.open(`/api/sites/download/${id}`, '_blank');
      
      toast({
        title: "Download started",
        description: "Your download will begin shortly",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download site",
        variant: "destructive",
      });
    }
  };
  
  const handleConvertToReact = async (site: SavedSite) => {
    try {
      convertToReact(site.id.toString());
      
      toast({
        title: "React conversion started",
        description: "Converting site to a React application. Download will begin shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert site to React",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex py-3 sm:py-4 px-4 sm:px-6">
          <Database className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
          <h1 className="text-base sm:text-lg font-medium">Saved Sites</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Your Saved Replicas</h2>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8">
              <h3 className="text-base sm:text-lg font-medium text-red-600">Error loading saved sites</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">There was a problem loading your saved sites</p>
              <Button 
                onClick={() => setLocation("/")}
                className="bg-primary hover:bg-blue-700 text-xs sm:text-sm"
              >
                Return home
              </Button>
            </CardContent>
          </Card>
        ) : savedSites && savedSites.length > 0 ? (
          <div className="grid gap-3 sm:gap-4">
            {savedSites.map((site: SavedSite) => (
              <Card key={site.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-2 sm:py-3 px-3 sm:px-4">
                  <CardTitle className="text-sm sm:text-base font-medium flex items-center truncate">
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0 text-primary" />
                    <span className="truncate">{site.name || site.url}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm text-gray-500">
                      <p>Saved on {new Date(site.savedAt).toLocaleString()}</p>
                      <p>{site.pageCount} pages | {site.size} MB</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-end gap-1 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 sm:h-8 px-2 text-xs sm:text-sm"
                        onClick={() => handleViewSite(site)}
                      >
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">View</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 sm:h-8 px-2 text-xs sm:text-sm text-primary hover:text-blue-700"
                        onClick={() => handleDownloadSite(site.id.toString())}
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">Download</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 sm:h-8 px-2 text-xs sm:text-sm text-purple-500 hover:text-purple-700"
                        onClick={() => handleConvertToReact(site)}
                      >
                        <FileCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">To React</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 sm:h-8 px-2 text-xs sm:text-sm text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteSite(site.id.toString())}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <div className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        )}
                        <span className="hidden xs:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8">
              <Database className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600">No saved sites</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">Your saved replicated sites will appear here</p>
              <Button 
                onClick={() => setLocation("/")}
                className="bg-primary hover:bg-blue-700 text-xs sm:text-sm"
              >
                Start a new crawl
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
