
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SimpleLogin from "@/components/SimpleLogin";
import { generateMockHistory } from "@/lib/utils";
import { CompressionHistoryItem } from "@/components/UserHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CompressSection from "@/components/CompressSection";
import HistorySection from "@/components/HistorySection";
import LoginSection from "@/components/LoginSection";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [history, setHistory] = useState<CompressionHistoryItem[]>([]);
  
  useEffect(() => {
    if (user) {
      setHistory(generateMockHistory(8));
    }
  }, [user]);
  
  const handleDownloadHistory = (id: string) => {
    console.log(`Downloading file with id ${id}`);
  };
  
  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="compress">Compress Files</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compress" className="space-y-8">
            <CompressSection user={user} />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-8">
            <HistorySection
              history={history}
              onDownload={handleDownloadHistory}
              onDelete={handleDeleteHistory}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <CompressSection user={user} />
          <LoginSection />
        </div>
      )}
    </Layout>
  );
};

export default Index;
