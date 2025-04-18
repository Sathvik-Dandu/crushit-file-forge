
import React from "react";
import { useNavigate } from "react-router-dom";

const LoginSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Save Your Compression History</h2>
        <p className="text-muted-foreground">
          Log in to track your compression history and quickly access 
          your previously compressed files.
        </p>
      </div>
      
      <div className="bg-primary/5 border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium">Benefits of logging in:</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>Access your compression history from any device</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>Re-download any previously compressed file</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>Track compression statistics across all your files</span>
          </li>
        </ul>
        
        <button
          onClick={() => navigate('/auth')}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Login or Create Account
        </button>
      </div>
    </div>
  );
};

export default LoginSection;
