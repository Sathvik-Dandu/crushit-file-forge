
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<{ file: Blob, size: number }[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileSelect = (files: FileList) => {
    setSelectedFiles(Array.from(files));
    setCompressedFiles([]);
  };

  const handleCompress = async (targetSize: number, compressionLevel: number) => {
    if (selectedFiles.length === 0) return;
    
    setIsCompressing(true);
    
    try {
      const compressedResults = await Promise.all(
        selectedFiles.map(async (file) => {
          const result = await mockCompressFile(file, targetSize, compressionLevel);
          return { file: result.blob, size: result.size };
        })
      );
      setCompressedFiles(compressedResults);
    } catch (error) {
      console.error('Compression failed:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setCompressedFiles([]);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-2">
      <div className="space-y-4 sm:space-y-6 order-1">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold">Upload Files</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Select any files to compress. We support PDFs, Office documents, images, and more.
          </p>
        </div>
        
        {selectedFiles.length === 0 || compressedFiles.length > 0 ? (
          <FileUploadZone onFileSelect={handleFileSelect} />
        ) : (
          <>
            <div className="space-y-4">
              {selectedFiles.map((file, index) => (
                <FileDetails
                  key={`${file.name}-${index}`}
                  file={file}
                  compressedSize={compressedFiles[index]?.size}
                />
              ))}
            </div>
            
        {isCompressing ? (
              <div className="text-center p-6 sm:p-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">Compressing your files...</p>
              </div>
            ) : (
              <CompressionControls
                originalSize={selectedFiles.reduce((acc, file) => acc + file.size, 0)}
                onCompress={handleCompress}
              />
            )}
          </>
        )}
      </div>
      
      <div className="space-y-4 sm:space-y-6 order-2 xl:order-2">
        {compressedFiles.length > 0 && selectedFiles.length > 0 && (
          <>
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Compression Results</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your files have been compressed and are ready for download.
              </p>
            </div>
            
            {selectedFiles.map((file, index) => (
              <CompressionResult
                key={`${file.name}-${index}`}
                originalSize={file.size}
                compressedSize={compressedFiles[index].size}
                fileName={file.name}
                compressedFile={compressedFiles[index].file}
                onReset={handleReset}
                user={user}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CompressSection;
