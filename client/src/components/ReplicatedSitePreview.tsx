import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  MonitorSmartphone, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReplicatedSitePreviewProps {
  siteUrl: string;
}

export default function ReplicatedSitePreview({ siteUrl }: ReplicatedSitePreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  
  // Handle iframe loading state
  const handleIframeLoad = () => {
    try {
      setIsLoading(false);
      setHasError(false);
      
      // Access the iframe content to check if it loaded correctly
      const iframe = iframeRef.current;
      
      if (iframe) {
        console.log("Iframe loaded successfully");
        
        // Try to access the iframe content to verify it loaded correctly
        try {
          // This will throw an error if cross-origin policies prevent access
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDocument) {
            const bodyContent = iframeDocument.body?.innerHTML || '';
            // Check if the content contains any common error patterns
            if (
              bodyContent.includes('404 Not Found') || 
              bodyContent.includes('Page not found') ||
              bodyContent.includes('Error') && bodyContent.length < 1000
            ) {
              console.warn("Iframe loaded with error content");
              setHasError(true);
            } else {
              console.log("Iframe content verified");
            }
          }
        } catch (error) {
          // This is expected for cross-origin frames and not an actual error
          console.log("Cannot access iframe content due to cross-origin policy (this is normal)");
        }
      }
    } catch (error) {
      console.error("Error in iframe load handler:", error);
    }
  };
  
  // Handle iframe error
  const handleIframeError = () => {
    console.error("Iframe failed to load");
    setIsLoading(false);
    setHasError(true);
    
    toast({
      title: "Preview Error",
      description: "Failed to load the site preview. The content may not be available.",
      variant: "destructive"
    });
  };
  
  // Refresh the iframe
  const refreshPreview = () => {
    setIsLoading(true);
    setHasError(false);
    setLoadAttempts(prev => prev + 1);
    
    // Force reload by updating the key
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const currentSrc = iframe.src;
      iframe.src = "about:blank";
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  };
  
  // Set up a timeout to detect loading failures
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn("Iframe load timeout");
          setIsLoading(false);
          setHasError(true);
          
          toast({
            title: "Preview Timeout",
            description: "The site preview is taking too long to load. It may be unavailable.",
            variant: "destructive"
          });
        }
      }, 15000); // 15 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, toast]);
  
  // URL for the iframe with cache-busting
  const iframeUrl = `${siteUrl}${siteUrl.includes('?') ? '&' : '?'}cb=${loadAttempts}`;
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Preview Controls */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between">
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
        
        <div>
          <Button
            variant="outline"
            size="sm"
            className="px-2 py-1 h-8"
            title="Refresh Preview"
            onClick={refreshPreview}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Preview Frame */}
      <div className="w-full flex-grow relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Loading preview...</p>
          </div>
        )}
        
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-lg font-semibold text-gray-700">Preview Error</h3>
            <p className="text-sm text-gray-500 mb-4">The site preview couldn't be loaded correctly.</p>
            <Button onClick={refreshPreview} variant="secondary" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
        
        <div 
          className={`w-full h-full overflow-hidden transition-all duration-300 ${
            viewMode === "desktop" ? "w-full" : 
            viewMode === "tablet" ? "max-w-xl mx-auto border-x border-gray-200" : 
            "max-w-xs mx-auto border-x border-gray-200"
          }`}
        >
          <iframe 
            ref={iframeRef}
            src={iframeUrl} 
            className="w-full h-full border-0"
            title="Website Preview"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
