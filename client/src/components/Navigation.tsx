import { useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, History, Database, LogIn, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Determine active tab based on current URL
  const getActiveTab = () => {
    if (location === "/") return "crawler";
    if (location === "/history") return "history";
    if (location === "/saved-sites") return "saved";
    return "crawler"; // Default to crawler
  };

  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <Tabs value={getActiveTab()} onValueChange={(value) => {
          // Map tab values to routes
          if (value === "crawler") setLocation("/");
          if (value === "history") setLocation("/history");
          if (value === "saved") setLocation("/saved-sites");
        }} className="w-full sm:w-auto">
          <div className="border-b border-gray-200 w-full">
            <TabsList className="flex w-full">
              <TabsTrigger 
                value="crawler"
                className="text-xs sm:text-sm flex items-center py-3 sm:py-4 px-3 sm:px-6 focus:outline-none flex-1 justify-center"
              >
                <Globe className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Crawler</span>
                <span className="xs:hidden">Crawl</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="text-xs sm:text-sm flex items-center py-3 sm:py-4 px-3 sm:px-6 focus:outline-none flex-1 justify-center"
              >
                <History className="h-4 w-4 mr-1 sm:mr-2" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger 
                value="saved"
                className="text-xs sm:text-sm flex items-center py-3 sm:py-4 px-3 sm:px-6 focus:outline-none flex-1 justify-center"
              >
                <Database className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Saved Sites</span>
                <span className="xs:hidden">Saved</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="py-2 sm:py-0 sm:mr-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 text-sm">
                  <UserCircle className="h-5 w-5" />
                  <span className="hidden xs:inline">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" onClick={() => setLocation('/login')} className="flex items-center gap-1 sm:gap-2 text-sm">
              <LogIn className="h-5 w-5" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}