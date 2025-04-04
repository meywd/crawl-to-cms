import { Button } from "@/components/ui/button";
import { HelpCircle, Settings, Globe } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Globe className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">WebCrawler</h1>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
