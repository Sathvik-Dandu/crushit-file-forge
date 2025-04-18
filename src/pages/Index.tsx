
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import FileUploadZone from "@/components/FileUploadZone";
import CompressionControls from "@/components/CompressionControls";
import FileDetails from "@/components/FileDetails";
import CompressionResult from "@/components/CompressionResult";
import SimpleLogin from "@/components/SimpleLogin";
import UserHistory from "@/components/UserHistory";
import { mockCompressFile, generateMockHistory } from "@/lib/utils";
import { CompressionHistoryItem } from "@/components/UserHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Index = () => {
  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // User states
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [history, setHistory] = useState<CompressionHistoryItem[]>([]);
  
  // Generate mock history for demo purposes
  useEffect(() => {
    if (user) {
      setHistory(generateMockHistory(8));
    }
  }, [user]);
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCompressedFile(null);
    setCompressedSize(null);
  };
  
  const handleCompress = async (targetSize: number, compressionLevel: number) => {
    if (!selectedFile) return;
    
    setIsCompressing(true);
    
    try {
      const result = await mockCompressFile(selectedFile, targetSize, compressionLevel);
      setCompressedFile(result.blob);
      setCompressedSize(result.size);
      
      // Add to history if user is logged in
      if (user) {
        const newHistoryItem: CompressionHistoryItem = {
          id: `file-${Date.now()}`,
          fileName: selectedFile.name,
          originalSize: selectedFile.size,
          compressedSize: result.size,
          date: new Date().toISOString(),
          fileType: selectedFile.type || 'Unknown',
        };
        
        setHistory([newHistoryItem, ...history]);
      }
    } catch (error) {
      console.error('Compression failed:', error);
      // In a real app, we would show an error message to the user
    } finally {
      setIsCompressing(false);
    }
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setCompressedFile(null);
    setCompressedSize(null);
  };
  
  const handleLogin = (userData: { email: string; name: string }) => {
    setUser(userData);
    setShowLoginModal(false);
  };
  
  const handleLogout = () => {
    setUser(null);
    setHistory([]);
  };
  
  const handleDownloadHistory = (id: string) => {
    // In a real app, this would download the stored file
    // For now, we'll just log the action
    console.log(`Downloading file with id ${id}`);
  };
  
  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };
  
  // Render login modal
  if (showLoginModal) {
    return (
      <Layout 
        user={user} 
        onLogout={handleLogout}
      >
        <div className="max-w-md mx-auto mt-8">
          <SimpleLogin onLogin={handleLogin} />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout 
      user={user} 
      onLogout={handleLogout}
      onLogin={() => setShowLoginModal(true)}
    >
      {user ? (
        <Tabs defaultValue="compress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="compress">Compress Files</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compress" className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Upload File</h2>
                  <p className="text-muted-foreground">
                    Select any file to compress. We support PDFs, Office documents, images, and more.
                  </p>
                </div>
                
                {!selectedFile || compressedFile ? (
                  <FileUploadZone onFileSelect={handleFileSelect} />
                ) : (
                  <>
                    <FileDetails
                      file={selectedFile}
                      compressedSize={compressedSize || undefined}
                    />
                    {isCompressing ? (
                      <div className="text-center p-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-2 text-muted-foreground">Compressing your file...</p>
                      </div>
                    ) : (
                      <CompressionControls
                        originalSize={selectedFile.size}
                        onCompress={handleCompress}
                      />
                    )}
                  </>
                )}
              </div>
              
              <div className="space-y-6">
                {compressedFile && compressedSize !== null && selectedFile && (
                  <>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Compression Result</h2>
                      <p className="text-muted-foreground">
                        Your file has been compressed and is ready for download.
                      </p>
                    </div>
                    
                    <CompressionResult
                      originalSize={selectedFile.size}
                      compressedSize={compressedSize}
                      fileName={selectedFile.name}
                      compressedFile={compressedFile}
                      onReset={handleReset}
                    />
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-8">
            <UserHistory 
              history={history}
              onDownload={handleDownloadHistory}
              onDelete={handleDeleteHistory}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Upload File</h2>
              <p className="text-muted-foreground">
                Select any file to compress. We support PDFs, Office documents, images, and more.
              </p>
            </div>
            
            {!selectedFile || compressedFile ? (
              <FileUploadZone onFileSelect={handleFileSelect} />
            ) : (
              <>
                <FileDetails
                  file={selectedFile}
                  compressedSize={compressedSize || undefined}
                />
                {isCompressing ? (
                  <div className="text-center p-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">Compressing your file...</p>
                  </div>
                ) : (
                  <CompressionControls
                    originalSize={selectedFile.size}
                    onCompress={handleCompress}
                  />
                )}
              </>
            )}
          </div>
          
          <div className="space-y-6">
            {compressedFile && compressedSize !== null && selectedFile ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Compression Result</h2>
                  <p className="text-muted-foreground">
                    Your file has been compressed and is ready for download.
                  </p>
                </div>
                
                <CompressionResult
                  originalSize={selectedFile.size}
                  compressedSize={compressedSize}
                  fileName={selectedFile.name}
                  compressedFile={compressedFile}
                  onReset={handleReset}
                />
              </>
            ) : (
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
                    onClick={() => setShowLoginModal(true)}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Login or Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
