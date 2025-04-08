import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Home, ArrowLeft, FileType, Image, FileCode, FileText, Download, Archive, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import ReplicatedSitePreview from "@/components/ReplicatedSitePreview";
import SiteStructure from "@/components/SiteStructure";
import { saveSite } from "@/lib/api";

// Asset types for display
type AssetRecord = {
  type: string;
  path: string;
  url?: string;
};

export default function Preview() {
  const [match, params] = useRoute("/preview/:id");
  const [, setLocation] = useLocation();
  const [selectedPage, setSelectedPage] = useState("index.html");
  const [activeTab, setActiveTab] = useState("preview");
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [cssAssets, setCssAssets] = useState<AssetRecord[]>([]);
  const [imageAssets, setImageAssets] = useState<AssetRecord[]>([]);
  const [jsAssets, setJsAssets] = useState<AssetRecord[]>([]);
  const [otherAssets, setOtherAssets] = useState<AssetRecord[]>([]);
  
  // Get crawl ID from URL parameters
  const crawlId = params?.id;
  
  // Get path from URL query parameter
  const queryParams = new URLSearchParams(window.location.search);
  const pathParam = queryParams.get('path');
  
  // State for saving site loading
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  // Fetch assets for this crawl
  const { data: assetPages, isLoading: isLoadingAssets } = useQuery({
    queryKey: ["/api/pages", crawlId],
    queryFn: async () => {
      const response = await fetch(`/api/pages?url=${crawlId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }
      return response.json();
    },
    enabled: !!crawlId,
  });
  
  // Process assets when data is loaded
  useEffect(() => {
    if (structure && !isLoadingStructure) {
      const extractAssetsFromStructure = (node: any, path = '') => {
        const assets: AssetRecord[] = [];
        
        if (typeof node !== 'object' || node === null) {
          return assets;
        }
        
        // Process current level
        Object.entries(node).forEach(([key, value]: [string, any]) => {
          const currentPath = path ? `${path}/${key}` : key;
          
          if (typeof value === 'object' && value !== null) {
            if (value.type === 'file' && value.path && value.assetType) {
              // This is an asset file
              assets.push({
                type: value.assetType || 'unknown',
                path: value.path,
                url: `/api/assets/${crawlId}/${value.path}`
              });
            } else if (value.type === 'file' && value.path) {
              // This is a page file, ignore
            } else {
              // This is a directory, recurse
              const nestedAssets = extractAssetsFromStructure(value, currentPath);
              assets.push(...nestedAssets);
            }
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // This is a directory, recurse
            const nestedAssets = extractAssetsFromStructure(value, currentPath);
            assets.push(...nestedAssets);
          }
        });
        
        return assets;
      };
      
      // Process the structure to get all assets
      const allAssets = extractAssetsFromStructure(structure);
      setAssets(allAssets);
      
      // Categorize assets by type
      setCssAssets(allAssets.filter(asset => asset.type === 'css'));
      setImageAssets(allAssets.filter(asset => asset.type === 'image'));
      setJsAssets(allAssets.filter(asset => asset.type === 'js'));
      setOtherAssets(allAssets.filter(asset => 
        asset.type !== 'css' && asset.type !== 'image' && asset.type !== 'js'
      ));
    }
  }, [structure, crawlId]);
  
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-4">
        <div className="flex flex-wrap gap-1 xs:gap-2 w-full md:w-auto justify-center md:justify-start">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3" onClick={() => setLocation("/")}>
            <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>Home</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3" onClick={() => setLocation("/history")}>
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline">Back to History</span>
            <span className="xs:hidden">History</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <Button 
            className="bg-primary hover:bg-blue-700 text-white text-xs sm:text-sm h-8 px-2 sm:px-3"
            size="sm"
            disabled={isSaving}
            onClick={async () => {
              try {
                setIsSaving(true);
                // Use the API saveSite function
                await saveSite(crawlId);
                
                toast({
                  title: "Site saved successfully",
                  description: "You can view it in the Saved Sites tab",
                });
                
                // Navigate to saved sites page
                setLocation("/saved-sites");
              } catch (error) {
                console.error("Error saving site:", error);
                toast({
                  title: "Error",
                  description: "Failed to save site",
                  variant: "destructive",
                });
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Save Site
              </>
            )}
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold">Site Preview</h1>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2 sm:mb-4 flex w-full">
          <TabsTrigger value="preview" className="flex-1 text-xs sm:text-sm py-1 sm:py-2">Preview Site</TabsTrigger>
          <TabsTrigger value="assets" className="flex-1 text-xs sm:text-sm py-1 sm:py-2">Assets ({assets.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            {/* Site structure sidebar */}
            <div className="md:col-span-3 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-3 sm:p-4 border-b">
                <h2 className="text-sm sm:text-base font-medium">Site Structure</h2>
              </div>
              <div className="p-3 sm:p-4 max-h-[200px] sm:max-h-[300px] md:max-h-none overflow-auto">
                {isLoadingStructure ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400" />
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
            <div className="md:col-span-9 bg-white rounded-lg shadow">
              <div className="p-3 sm:p-4 border-b">
                <h2 className="text-sm sm:text-base font-medium truncate">
                  <span className="hidden xs:inline">Page Preview: </span>
                  <span className="xs:hidden">Page: </span>
                  {selectedPage}
                </h2>
              </div>
              <div className="border rounded-b-lg h-[300px] sm:h-[400px] md:h-[600px] overflow-auto">
                <ReplicatedSitePreview siteUrl={`/api/preview/${crawlId}/${selectedPage}`} />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="assets">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-medium">Downloaded Assets</h2>
              
              {assets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Download Assets</span>
                      <span className="sm:hidden">Download</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs sm:text-sm">Download Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      window.open(`/api/sites/download/${crawlId}`, '_blank');
                      toast({
                        title: "Download started",
                        description: "Your assets are being prepared for download."
                      });
                    }} className="text-xs sm:text-sm">
                      <Archive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Download All as ZIP
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      window.open(`/api/sites/convert/${crawlId}`, '_blank');
                      toast({
                        title: "React conversion started",
                        description: "Converting site to a React application. Download will begin shortly."
                      });
                    }} className="text-xs sm:text-sm">
                      <FileCode className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-1 sm:mr-2" />
                      Convert to React App
                    </DropdownMenuItem>
                    {cssAssets.length > 0 && (
                      <DropdownMenuItem onClick={() => {
                        window.open(`/api/sites/download/${crawlId}?type=css`, '_blank');
                        toast({
                          title: "Download started",
                          description: "CSS files are being prepared for download."
                        });
                      }} className="text-xs sm:text-sm">
                        <FileCode className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1 sm:mr-2" />
                        Download CSS Files
                      </DropdownMenuItem>
                    )}
                    {jsAssets.length > 0 && (
                      <DropdownMenuItem onClick={() => {
                        window.open(`/api/sites/download/${crawlId}?type=js`, '_blank');
                        toast({
                          title: "Download started",
                          description: "JavaScript files are being prepared for download."
                        });
                      }} className="text-xs sm:text-sm">
                        <FileCode className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1 sm:mr-2" />
                        Download JavaScript Files
                      </DropdownMenuItem>
                    )}
                    {imageAssets.length > 0 && (
                      <DropdownMenuItem onClick={() => {
                        window.open(`/api/sites/download/${crawlId}?type=image`, '_blank');
                        toast({
                          title: "Download started",
                          description: "Image files are being prepared for download."
                        });
                      }} className="text-xs sm:text-sm">
                        <Image className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2" />
                        Download Image Files
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {assets.length === 0 && !isLoadingAssets ? (
              <Alert>
                <AlertTitle>No assets found</AlertTitle>
                <AlertDescription>
                  No assets were downloaded during the crawl. This might indicate that the crawler was unable to access 
                  CSS, JavaScript, or image files from the target website.
                </AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="flex w-full overflow-x-auto space-x-0 border rounded-md">
                  <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm py-1 px-2 sm:px-3">
                    All ({assets.length})
                  </TabsTrigger>
                  <TabsTrigger value="css" className="flex-1 text-xs sm:text-sm py-1 px-2 sm:px-3">
                    <span className="hidden xs:inline">CSS</span>
                    <span className="xs:hidden">CSS</span> ({cssAssets.length})
                  </TabsTrigger>
                  <TabsTrigger value="js" className="flex-1 text-xs sm:text-sm py-1 px-2 sm:px-3">
                    <span className="hidden xs:inline">JavaScript</span>
                    <span className="xs:hidden">JS</span> ({jsAssets.length})
                  </TabsTrigger>
                  <TabsTrigger value="images" className="flex-1 text-xs sm:text-sm py-1 px-2 sm:px-3">
                    <span className="hidden xs:inline">Images</span>
                    <span className="xs:hidden">Img</span> ({imageAssets.length})
                  </TabsTrigger>
                  <TabsTrigger value="other" className="flex-1 text-xs sm:text-sm py-1 px-2 sm:px-3">
                    Other ({otherAssets.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    {/* Header row - visible on larger screens */}
                    <div className="hidden sm:grid grid-cols-12 p-3 bg-gray-50 font-medium text-sm">
                      <div className="col-span-1">Type</div>
                      <div className="col-span-10">Path</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>
                    <div className="max-h-[400px] md:max-h-[500px] overflow-auto">
                      {assets.map((asset, index) => (
                        <div key={index} className="grid grid-cols-12 p-3 border-t text-sm hover:bg-gray-50">
                          <div className="col-span-2 sm:col-span-1 flex items-center">
                            {asset.type === 'css' ? (
                              <FileCode className="h-4 w-4 text-blue-500 mr-2" />
                            ) : asset.type === 'js' ? (
                              <FileCode className="h-4 w-4 text-yellow-500 mr-2" />
                            ) : asset.type === 'image' ? (
                              <Image className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <FileType className="h-4 w-4 text-gray-500 mr-2" />
                            )}
                            <span className="hidden sm:inline">{asset.type}</span>
                          </div>
                          <div className="col-span-8 sm:col-span-10 truncate text-blue-600">
                            {asset.url ? (
                              <a href={asset.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {/* Show truncated path on mobile */}
                                <span className="sm:hidden">
                                  {asset.path.length > 20 
                                    ? `...${asset.path.substring(asset.path.length - 20)}` 
                                    : asset.path}
                                </span>
                                <span className="hidden sm:inline">{asset.path}</span>
                              </a>
                            ) : (
                              <>
                                {/* Show truncated path on mobile */}
                                <span className="sm:hidden">
                                  {asset.path.length > 20 
                                    ? `...${asset.path.substring(asset.path.length - 20)}` 
                                    : asset.path}
                                </span>
                                <span className="hidden sm:inline">{asset.path}</span>
                              </>
                            )}
                          </div>
                          <div className="col-span-2 sm:col-span-1 flex justify-center">
                            {asset.url && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  // For images, download directly
                                  if (asset.type === 'image' && asset.url) {
                                    // Extract file name from path
                                    const fileName = asset.path.split('/').pop() || 'download.jpg';
                                    
                                    // Create download link
                                    const link = document.createElement('a');
                                    link.href = asset.url;
                                    link.download = fileName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    
                                    toast({
                                      title: "Downloading file",
                                      description: `Downloading ${fileName}`
                                    });
                                  } else if (asset.url) {
                                    // For other asset types, open in new tab
                                    window.open(asset.url, '_blank');
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="css" className="mt-4">
                  <AssetList assets={cssAssets} icon={<FileCode className="h-4 w-4 text-blue-500 mr-2" />} />
                </TabsContent>
                
                <TabsContent value="js" className="mt-4">
                  <AssetList assets={jsAssets} icon={<FileCode className="h-4 w-4 text-yellow-500 mr-2" />} />
                </TabsContent>
                
                <TabsContent value="images" className="mt-4">
                  <AssetList assets={imageAssets} icon={<Image className="h-4 w-4 text-green-500 mr-2" />} />
                </TabsContent>
                
                <TabsContent value="other" className="mt-4">
                  <AssetList assets={otherAssets} icon={<FileType className="h-4 w-4 text-gray-500 mr-2" />} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component to display a list of assets
function AssetList({ assets, icon }: { assets: AssetRecord[], icon: React.ReactNode }) {
  if (assets.length === 0) {
    return (
      <Alert>
        <AlertTitle>No assets found</AlertTitle>
        <AlertDescription>
          No assets of this type were downloaded during the crawl.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header row - visible on larger screens */}
      <div className="hidden sm:grid grid-cols-12 p-3 bg-gray-50 font-medium text-sm">
        <div className="col-span-1">Type</div>
        <div className="col-span-10">Path</div>
        <div className="col-span-1 text-center">Action</div>
      </div>
      <div className="max-h-[400px] md:max-h-[500px] overflow-auto">
        {assets.map((asset, index) => (
          <div key={index} className="grid grid-cols-12 p-3 border-t text-sm hover:bg-gray-50">
            <div className="col-span-2 sm:col-span-1 flex items-center">
              {icon}
              <span className="hidden sm:inline">{asset.type}</span>
            </div>
            <div className="col-span-8 sm:col-span-10 truncate text-blue-600">
              {asset.url ? (
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {/* Show truncated path on mobile */}
                  <span className="sm:hidden">
                    {asset.path.length > 20 
                      ? `...${asset.path.substring(asset.path.length - 20)}` 
                      : asset.path}
                  </span>
                  <span className="hidden sm:inline">{asset.path}</span>
                </a>
              ) : (
                <>
                  {/* Show truncated path on mobile */}
                  <span className="sm:hidden">
                    {asset.path.length > 20 
                      ? `...${asset.path.substring(asset.path.length - 20)}` 
                      : asset.path}
                  </span>
                  <span className="hidden sm:inline">{asset.path}</span>
                </>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1 flex justify-center">
              {asset.url && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    // For images, download directly
                    if (asset.type === 'image' && asset.url) {
                      // Extract file name from path
                      const fileName = asset.path.split('/').pop() || 'download.jpg';
                      
                      // Create download link
                      const link = document.createElement('a');
                      link.href = asset.url;
                      link.download = fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      toast({
                        title: "Downloading file",
                        description: `Downloading ${fileName}`
                      });
                    } else if (asset.url) {
                      // For other asset types, open in new tab
                      window.open(asset.url, '_blank');
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}