import { useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, History, Database } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  
  // Determine active tab based on current URL
  const getActiveTab = () => {
    if (location === "/") return "crawler";
    if (location === "/history") return "history";
    if (location === "/saved-sites") return "saved";
    return "crawler"; // Default to crawler
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <Tabs value={getActiveTab()} onValueChange={(value) => {
        // Map tab values to routes
        if (value === "crawler") setLocation("/");
        if (value === "history") setLocation("/history");
        if (value === "saved") setLocation("/saved-sites");
      }}>
        <div className="border-b border-gray-200">
          <TabsList className="flex">
            <TabsTrigger 
              value="crawler"
              className="text-sm flex items-center py-4 px-6 focus:outline-none"
            >
              <Globe className="h-4 w-4 mr-2" />
              Crawler
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="text-sm flex items-center py-4 px-6 focus:outline-none"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="text-sm flex items-center py-4 px-6 focus:outline-none"
            >
              <Database className="h-4 w-4 mr-2" />
              Saved Sites
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}