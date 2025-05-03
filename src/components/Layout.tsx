
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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              onClick={() => navigate("/")} 
              className="bg-primary/10 text-primary font-bold text-xl p-2 rounded cursor-pointer"
            >
              CrushIt
            </div>
            <h1 className="text-xl font-bold hidden sm:block">
              Universal File Compressor
            </h1>
          </div>
          
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/dashboard")} 
                  className="flex items-center gap-1"
                >
                  <BarChart2 size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user.email}</span>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Logout">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>
                Log In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CrushIt File Compressor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
