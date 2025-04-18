
import React, { useState } from "react";
import FileUploadZone from "@/components/FileUploadZone";
import FileDetails from "@/components/FileDetails";
import CompressionControls from "@/components/CompressionControls";
import CompressionResult from "@/components/CompressionResult";
import { User } from "@supabase/supabase-js";
import { mockCompressFile } from "@/lib/utils";

interface CompressSectionProps {
  user: User | null;
}

const CompressSection: React.FC<CompressSectionProps> = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

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
    } catch (error) {
      console.error('Compression failed:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCompressedFile(null);
    setCompressedSize(null);
  };

  return (
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
              user={user}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CompressSection;
