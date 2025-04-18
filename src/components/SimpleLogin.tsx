
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SimpleLoginProps {
  onLogin: (user: { email: string; name: string }) => void;
}

const SimpleLogin: React.FC<SimpleLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      onLogin({ email, name });
    }
  };

  // For real implementation, this would connect to authentication provider
  // For now, we're just simulating login with a simple form

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs 
        defaultValue="login" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Welcome back</h3>
            <p className="text-sm text-muted-foreground">Login to access your compression history</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">Login</Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => onLogin({ email: "user@example.com", name: "Demo User" })}>
            Continue as Guest
          </Button>
        </TabsContent>
        
        <TabsContent value="signup" className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Create an account</h3>
            <p className="text-sm text-muted-foreground">Sign up to track your compression history</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
              <Input
                id="signup-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="signup-name" className="text-sm font-medium">Name</label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleLogin;
