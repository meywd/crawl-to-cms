import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import History from "@/pages/History";
import SavedSites from "@/pages/SavedSites";
import Preview from "@/pages/Preview";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/history">
        <PrivateRoute>
          <History />
        </PrivateRoute>
      </Route>
      <Route path="/saved-sites">
        <PrivateRoute>
          <SavedSites />
        </PrivateRoute>
      </Route>
      <Route path="/preview/:id" component={Preview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Show navigation tabs only on main pages, not on login, register, preview or 404
  const showNavigation = location === '/' || location === '/history' || location === '/saved-sites';
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {showNavigation && <Navigation />}
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
