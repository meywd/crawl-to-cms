import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History, Globe, ExternalLink, Trash2, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { getCrawlHistory, deleteCrawlHistory } from "@/lib/api";

export default function HistoryPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  // Query to fetch crawl history
  const { data: history = [], isLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ['/api/crawl/history'],
    queryFn: getCrawlHistory,
    staleTime: 10000, // 10 seconds
  });

  const handleDeleteCrawl = async (id: number) => {
    if (isDeleting) return; // Prevent multiple deletes
    
    try {
      setIsDeleting(id);
      console.log(`Deleting crawl with ID: ${id}`);
      
      await deleteCrawlHistory(id.toString());
      
      toast({
        title: "Crawl deleted",
        description: "The crawl has been removed from history",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/crawl/history'] });
    } catch (error) {
      console.error('Error deleting crawl:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete crawl",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleViewSite = (id: string) => {
    setLocation(`/preview/${id}`);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/crawl/history'] });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center py-4 px-6">
          <div className="flex items-center">
            <History className="h-5 w-5 mr-2 text-primary" />
            <h1 className="text-lg font-medium">Crawl History</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="text-gray-500 hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Previous Crawls</h2>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : history && history.length > 0 ? (
          <div className="grid gap-4">
            {history.map((item: any) => (
              <Card 
                key={item.id} 
                className={`overflow-hidden ${isDeleting === item.id ? 'opacity-70' : ''}`}
              >
                <CardHeader className="bg-gray-50 py-3 px-4">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-primary" />
                    {item.url}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>Crawled {new Date(item.startedAt).toLocaleString()}</p>
                      <p>{item.pageCount || 0} pages | Depth: {item.depth}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSite(item.id)}
                        disabled={isDeleting === item.id}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCrawl(item.id)}
                        disabled={isDeleting !== null}
                      >
                        {isDeleting === item.id ? (
                          <>
                            <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <History className="h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-600">No crawls yet</h3>
              <p className="text-sm text-gray-500 mb-4">Your crawl history will appear here</p>
              <Button 
                onClick={() => setLocation("/")}
                className="bg-primary hover:bg-blue-700"
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
