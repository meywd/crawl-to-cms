import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History, Globe, ExternalLink, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";

export default function HistoryPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Query to fetch crawl history
  const { data: history = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/crawl/history'],
  });

  const handleDeleteCrawl = async (id: string) => {
    try {
      await fetch(`/api/crawl/history/${id}`, {
        method: 'DELETE',
      });
      
      toast({
        title: "Crawl deleted",
        description: "The crawl has been removed from history",
      });
      
      // Refresh the history list
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete crawl",
        variant: "destructive",
      });
    }
  };

  const handleViewSite = (id: string) => {
    setLocation(`/preview/${id}`);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex py-4 px-6">
          <History className="h-5 w-5 mr-2 text-primary" />
          <h1 className="text-lg font-medium">Crawl History</h1>
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
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-primary" />
                    {item.url}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>Crawled {new Date(item.createdAt).toLocaleString()}</p>
                      <p>{item.pageCount} pages | Depth: {item.depth}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSite(item.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCrawl(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
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
