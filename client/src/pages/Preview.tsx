import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReplicatedSitePreview from "@/components/ReplicatedSitePreview";
import SiteStructure from "@/components/SiteStructure";

export default function Preview() {
  const [match, params] = useRoute("/preview/:id");
  const [, setLocation] = useLocation();
  const [selectedPage, setSelectedPage] = useState("index.html");
  
  // Get crawl ID from URL parameters
  const crawlId = params?.id;
  
  // Get path from URL query parameter
  const queryParams = new URLSearchParams(window.location.search);
  const pathParam = queryParams.get('path');
  
  // Set the selected page if path is provided in URL
  useEffect(() => {
    if (pathParam) {
      setSelectedPage(pathParam);
    }
  }, [pathParam]);
  
  // Handle site structure data
  const { data: structure, isLoading: isLoadingStructure } = useQuery({
    queryKey: ["/api/structure", crawlId],
    queryFn: async () => {
      const response = await fetch(`/api/structure/${crawlId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch site structure");
      }
      return response.json();
    },
    enabled: !!crawlId,
  });
  
  // Handle page selection
  const handleSelectPage = (page: string) => {
    setSelectedPage(page);
    // Update URL without navigating away
    const newUrl = `/preview/${crawlId}?path=${encodeURIComponent(page)}`;
    window.history.pushState({}, "", newUrl);
  };
  
  if (!crawlId) {
    return (
      <Card>
        <CardContent className="p-8">
          <h1 className="text-lg font-medium text-red-500">Invalid preview request</h1>
          <p className="mb-4">No crawler ID specified</p>
          <Button onClick={() => setLocation("/")}>Back to Home</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={() => setLocation("/history")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>
        <h1 className="text-xl font-semibold">Site Preview</h1>
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        {/* Site structure sidebar */}
        <div className="col-span-3 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-medium">Site Structure</h2>
          </div>
          <div className="p-4">
            {isLoadingStructure ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <SiteStructure 
                siteUrl={`/api/preview/${crawlId}`} 
                selectedPage={selectedPage}
                onSelectPage={handleSelectPage}
              />
            )}
          </div>
        </div>
        
        {/* Content preview */}
        <div className="col-span-9 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-medium">Page Preview: {selectedPage}</h2>
          </div>
          <div className="border rounded-b-lg h-[600px] overflow-auto">
            <ReplicatedSitePreview siteUrl={`/api/preview/${crawlId}/${selectedPage}`} />
          </div>
        </div>
      </div>
    </div>
  );
}