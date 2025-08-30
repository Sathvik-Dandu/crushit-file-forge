
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SimpleLogin from "@/components/SimpleLogin";
import { CompressionHistoryItem } from "@/components/UserHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CompressSection from "@/components/CompressSection";
import HistorySection from "@/components/HistorySection";
import LoginSection from "@/components/LoginSection";
import { getCompressionHistory, deleteCompressionHistoryItem, getFileDownloadUrl } from "@/services/supabase/fileOperations";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [history, setHistory] = useState<CompressionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch history when user is logged in or tab is changed
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const historyData = await getCompressionHistory(user.id);
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Failed to load compression history");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);
  
  const handleDownloadHistory = async (id: string) => {
    const item = history.find(item => item.id === id);
    if (!item || !item.cloudFilePath) {
      toast.error("File not found");
      return;
    }
    
    try {
      const downloadUrl = await getFileDownloadUrl(item.cloudFilePath);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded ${item.fileName}`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };
  
  const handleDeleteHistory = async (id: string) => {
    try {
      const success = await deleteCompressionHistoryItem(id);
      if (success) {
        setHistory(history.filter(item => item.id !== id));
        toast.success("Deleted from history");
      } else {
        toast.error("Failed to delete from history");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete from history");
    }
  };
  
  if (showLoginModal) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-8">
          <SimpleLogin onLogin={() => {
            setShowLoginModal(false);
            navigate('/');
          }} />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {user ? (
        <Tabs defaultValue="compress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-12 touch-manipulation">
            <TabsTrigger value="compress" className="text-sm sm:text-base">Compress Files</TabsTrigger>
            <TabsTrigger value="history" className="text-sm sm:text-base">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compress" className="space-y-8">
            <CompressSection user={user} />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-8">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <HistorySection
                history={history}
                onDownload={handleDownloadHistory}
                onDelete={handleDeleteHistory}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:gap-12 xl:grid-cols-2">
          <CompressSection user={user} />
          <LoginSection />
        </div>
      )}
    </Layout>
  );
};

export default Index;
