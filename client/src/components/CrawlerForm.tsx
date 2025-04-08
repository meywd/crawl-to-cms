import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Globe, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CrawlerFormProps {
  onStartCrawl: (url: string, depth: number, options: Record<string, boolean>) => void;
  isProcessing: boolean;
}

export default function CrawlerForm({ onStartCrawl, isProcessing }: CrawlerFormProps) {
  const [urlInput, setUrlInput] = useState<string>("");
  const [crawlDepth, setCrawlDepth] = useState<number>(2);
  const [options, setOptions] = useState({
    downloadImages: true,
    preserveCss: true,
    preserveNav: true,
    respectRobots: true,
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleDepthChange = (value: number[]) => {
    setCrawlDepth(value[0]);
  };

  const handleOptionChange = (id: string, checked: boolean) => {
    setOptions({
      ...options,
      [id]: checked,
    });
  };

  const handleStartCrawl = () => {
    if (!urlInput.trim()) {
      return;
    }
    
    // Clean and normalize the URL
    let cleanUrl = urlInput.trim();
    
    // Ensure URL has protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Pass the cleaned URL to the parent component
    onStartCrawl(cleanUrl, crawlDepth, options);
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      <h2 className="text-lg xs:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Website Crawler & Replicator</h2>
      
      {/* URL Input Section */}
      <div className="mb-4 sm:mb-6">
        <Label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-1">
          Target Website URL
        </Label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-2 sm:px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs sm:text-sm">
            https://
          </span>
          <Input
            type="text"
            id="website-url"
            value={urlInput}
            onChange={handleUrlChange}
            className="flex-1 rounded-none rounded-r-md text-sm"
            placeholder="example.com"
            disabled={isProcessing}
          />
        </div>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">Enter the domain without 'https://' (it will be added automatically)</p>
      </div>
      
      {/* Crawl Settings Section */}
      <Card className="mb-4 sm:mb-6 bg-gray-50">
        <CardContent className="pt-4 px-3 sm:px-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-700">Crawl Settings</h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Crawl Depth Control */}
            <div>
              <Label htmlFor="crawl-depth" className="block text-sm font-medium text-gray-700 mb-1">
                Crawl Depth
              </Label>
              <div className="flex items-center">
                <div className="w-full mr-3">
                  <Slider
                    id="crawl-depth"
                    defaultValue={[crawlDepth]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={handleDepthChange}
                    disabled={isProcessing}
                  />
                </div>
                <span className="w-8 text-center text-sm font-medium text-gray-700">
                  {crawlDepth}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Set how deep the crawler should navigate (1-5). Higher values take longer.
              </p>
            </div>
            
            {/* Crawl Options */}
            <div className="grid grid-cols-1 gap-3 xs:gap-4 xs:grid-cols-2">
              <div className="flex items-start">
                <Checkbox
                  id="downloadImages"
                  checked={options.downloadImages}
                  onCheckedChange={(checked) => 
                    handleOptionChange("downloadImages", checked as boolean)
                  }
                  disabled={isProcessing}
                  className="mt-1"
                />
                <div className="ml-3 text-xs sm:text-sm">
                  <Label htmlFor="downloadImages" className="font-medium text-gray-700">
                    Download Images
                  </Label>
                  <p className="text-gray-500">Save all images locally</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Checkbox
                  id="preserveCss"
                  checked={options.preserveCss}
                  onCheckedChange={(checked) => 
                    handleOptionChange("preserveCss", checked as boolean)
                  }
                  disabled={isProcessing}
                  className="mt-1"
                />
                <div className="ml-3 text-xs sm:text-sm">
                  <Label htmlFor="preserveCss" className="font-medium text-gray-700">
                    Extract CSS Styling
                  </Label>
                  <p className="text-gray-500">Replicate original styling</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Checkbox
                  id="preserveNav"
                  checked={options.preserveNav}
                  onCheckedChange={(checked) => 
                    handleOptionChange("preserveNav", checked as boolean)
                  }
                  disabled={isProcessing}
                  className="mt-1"
                />
                <div className="ml-3 text-xs sm:text-sm">
                  <Label htmlFor="preserveNav" className="font-medium text-gray-700">
                    Preserve Navigation
                  </Label>
                  <p className="text-gray-500">Keep menu functionality</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Checkbox
                  id="respectRobots"
                  checked={options.respectRobots}
                  onCheckedChange={(checked) => 
                    handleOptionChange("respectRobots", checked as boolean)
                  }
                  disabled={isProcessing}
                  className="mt-1"
                />
                <div className="ml-3 text-xs sm:text-sm">
                  <Label htmlFor="respectRobots" className="font-medium text-gray-700">
                    Respect robots.txt
                  </Label>
                  <p className="text-gray-500">Follow crawling rules</p>
                </div>
              </div>
            </div>
            
            {/* Advanced Settings Button */}
            <div className="pt-1 sm:pt-2">
              <Button 
                variant="link" 
                className="text-xs sm:text-sm text-primary p-0 h-auto" 
                disabled={isProcessing}
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Advanced Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          size="lg"
          onClick={handleStartCrawl}
          disabled={isProcessing || !urlInput.trim()}
          className="bg-primary hover:bg-blue-700 w-full xs:w-auto text-sm sm:text-base"
        >
          <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Start Crawling
        </Button>
      </div>
    </div>
  );
}
