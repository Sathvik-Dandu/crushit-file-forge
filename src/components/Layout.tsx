
import React from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  user?: { email: string; name: string } | null;
  onLogout?: () => void;
  onLogin?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout,
  onLogin
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary font-bold text-xl p-2 rounded">
              CrushIt
            </div>
            <h1 className="text-xl font-bold hidden sm:block">
              Universal File Compressor
            </h1>
          </div>
          
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                </div>
                
                <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={onLogin}>
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
