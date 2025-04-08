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
      <div className="flex justify-between items-center">
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

        <div className="mr-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  <span>{user?.username}</span>
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
            <Button variant="ghost" onClick={() => setLocation('/login')} className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}