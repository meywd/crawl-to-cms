import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Download, 
  MonitorSmartphone, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  FileText, 
  Folder 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SiteStructure from "./SiteStructure";

interface ReplicatedSitePreviewProps {
  siteUrl: string;
}

export default function ReplicatedSitePreview({ siteUrl }: ReplicatedSitePreviewProps) {
  const [selectedPage, setSelectedPage] = useState("index.html");
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // This would be fetched from the API in a real implementation
  const pages = [
    { value: "index.html", label: "Home (index.html)" },
    { value: "about.html", label: "About (about.html)" },
    { value: "services.html", label: "Services (services.html)" },
    { value: "contact.html", label: "Contact (contact.html)" },
    { value: "blog/index.html", label: "Blog (blog/index.html)" },
  ];

  const handlePageSelect = (value: string) => {
    setSelectedPage(value);
  };

  const handleDownloadReplica = () => {
    // In a real implementation, this would trigger a download
    window.open(`/api/sites/download?url=${encodeURIComponent(siteUrl)}`, '_blank');
  };

  return (
    <div className="mt-8 max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex-row items-center justify-between py-4">
          <CardTitle className="flex items-center text-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Replicated Website Preview
          </CardTitle>
          <div>
            <Button 
              variant="default"
              onClick={handleDownloadReplica}
              className="bg-green-500 hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </CardHeader>
        
        {/* Site Navigation */}
        <div className="border-t border-b border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap items-center">
          <div className="w-full sm:w-auto flex items-center mb-2 sm:mb-0">
            <Select value={selectedPage} onValueChange={handlePageSelect}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2 text-gray-600 text-sm ml-auto">
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
              onClick={() => window.open(`/api/preview/${siteUrl}/${selectedPage}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Preview Frame */}
        <div className="bg-gray-100 p-4">
          <div className="w-full bg-white border border-gray-200 shadow-sm rounded">
            <div className="border-b border-gray-200 px-4 py-2 flex items-center bg-gray-50 text-xs text-gray-500 rounded-t">
              <div className="flex space-x-1 mr-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <div className="flex-1 font-mono overflow-hidden">
                {siteUrl} - Replicated
              </div>
            </div>
            <div 
              className={`overflow-hidden relative ${
                viewMode === "desktop" ? "h-96" : 
                viewMode === "tablet" ? "h-96 max-w-xl mx-auto" : 
                "h-96 max-w-xs mx-auto"
              }`}
            >
              <iframe 
                src={`/api/preview/${siteUrl}/${selectedPage}`} 
                className="w-full h-full border-0"
                title="Website Preview"
              ></iframe>
            </div>
          </div>
        </div>
        
        {/* Site Structure */}
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Site Structure</h4>
          <SiteStructure siteUrl={siteUrl} selectedPage={selectedPage} onSelectPage={handlePageSelect} />
        </div>
      </Card>
    </div>
  );
}
