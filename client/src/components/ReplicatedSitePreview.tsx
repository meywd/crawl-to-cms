import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonitorSmartphone, Tablet, Smartphone, ExternalLink, Loader2 } from "lucide-react";

interface ReplicatedSitePreviewProps {
  siteUrl: string;
}

export default function ReplicatedSitePreview({ siteUrl }: ReplicatedSitePreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle iframe loading state
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <div className="w-full h-full">
      {/* Preview Controls */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center">
        <div className="flex space-x-2 text-gray-600 text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode("desktop")}
            className={`px-2 py-1 h-8 ${viewMode === "desktop" ? "bg-gray-200" : ""}`}
            title="Preview on Desktop"
          >
            <MonitorSmartphone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode("tablet")}
            className={`px-2 py-1 h-8 ${viewMode === "tablet" ? "bg-gray-200" : ""}`}
            title="Preview on Tablet"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode("mobile")}
            className={`px-2 py-1 h-8 ${viewMode === "mobile" ? "bg-gray-200" : ""}`}
            title="Preview on Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <div className="border-r border-gray-300 mx-2"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 py-1 h-8" 
            title="Open in New Window"
            onClick={() => window.open(siteUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Preview Frame */}
      <div className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        <div 
          className={`w-full h-full overflow-hidden ${
            viewMode === "desktop" ? "w-full" : 
            viewMode === "tablet" ? "max-w-xl mx-auto" : 
            "max-w-xs mx-auto"
          }`}
        >
          <iframe 
            src={siteUrl} 
            className="w-full h-full border-0"
            title="Website Preview"
            onLoad={handleIframeLoad}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
