
import React from "react";
import { LogOut, User, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              onClick={() => navigate("/")} 
              className="bg-primary/10 text-primary font-bold text-lg sm:text-xl p-2 rounded cursor-pointer touch-manipulation"
            >
              CrushIt
            </div>
            <h1 className="text-sm sm:text-xl font-bold hidden md:block truncate">
              Universal File Compressor
            </h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/dashboard")} 
                  className="flex items-center gap-1 px-2 sm:px-3 touch-manipulation"
                >
                  <BarChart2 size={16} />
                  <span className="hidden lg:inline">Dashboard</span>
                </Button>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium hidden lg:block max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut} 
                  title="Logout"
                  className="touch-manipulation h-8 w-8 sm:h-10 sm:w-10"
                >
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth")}
                size="sm"
                className="touch-manipulation"
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
      
      <footer className="border-t py-4 sm:py-6 mt-8">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CrushIt File Compressor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
