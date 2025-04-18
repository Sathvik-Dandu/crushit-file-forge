
import React, { useState } from "react";
import { Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { uploadCompressedFile, setupFileExpiration, ensureCompressedFilesBucketExists } from "@/services/supabaseStorage";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DownloadButton from "./compression/DownloadButton";
import QRCodeDialog from "./compression/QRCodeDialog";
import CompressionStats from "./compression/CompressionStats";

interface CompressionResultProps {
  originalSize: number;
  compressedSize: number;
  fileName: string;
  compressedFile: Blob;
  onReset: () => void;
  user: User | null;
}

const CompressionResult: React.FC<CompressionResultProps> = ({
  originalSize,
  compressedSize,
  fileName,
  compressedFile,
  onReset,
  user
}) => {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  
  const getCompressedFileName = () => {
    const nameParts = fileName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    return `${baseName}_compressed.${extension}`;
  };
  
  const generateDownloadUrl = async () => {
    if (!user || !user.id) {
      toast.error("Please log in to upload files");
      setQrError("You need to be logged in to generate a QR code.");
      return;
    }
    
    setIsGeneratingQr(true);
    setQrError(null);
    
    try {
      console.log("Starting file upload process");
      
      const bucketCreated = await ensureCompressedFilesBucketExists();
      if (!bucketCreated) {
        throw new Error("Could not create or access storage bucket");
      }
      
      const compressedFileAsFile = new File([compressedFile], getCompressedFileName(), {
        type: compressedFile.type || 'application/octet-stream'
      });
      
      if (!supabase) {
        console.error("Supabase client is not initialized");
        throw new Error("Storage service is not available");
      }
      
      console.log("Uploading file to Supabase");
      const { path, publicUrl } = await uploadCompressedFile(compressedFileAsFile, user.id);
      console.log("File uploaded successfully, path:", path);
      console.log("Public URL:", publicUrl);
      
      if (!publicUrl) {
        throw new Error("Failed to get public URL for the file");
      }
      
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 5);
      await setupFileExpiration(path, 5);
      console.log("File expiration set to:", expirationTime.toISOString());
      
      const downloadUrl = new URL(window.location.origin);
      downloadUrl.pathname = '/download-helper.html';
      downloadUrl.hash = `${encodeURIComponent(publicUrl)},${encodeURIComponent(getCompressedFileName())},${encodeURIComponent(expirationTime.getTime().toString())}`;
      
      console.log("Generated download URL:", downloadUrl.toString());
      setQrUrl(downloadUrl.toString());
      setIsQrDialogOpen(true);
      return publicUrl;
    } catch (error) {
      console.error("Failed to generate download URL:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setQrError(errorMessage);
      toast.error("Failed to upload file. Please try again.");
      return null;
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleQrButtonClick = () => {
    // Only regenerate if not already generating or if previous attempt had an error
    if (!isGeneratingQr) {
      if (qrError) {
        // Reset error state and try again
        setQrError(null);
      }
      generateDownloadUrl();
    }
    // Always open the dialog, even if we're still generating
    setIsQrDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 w-full border rounded-lg p-6 bg-white">
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-[#00ABE4]">Compression Complete!</h3>
        <p className="text-muted-foreground">Your file has been compressed successfully</p>
      </div>
      
      <CompressionStats originalSize={originalSize} compressedSize={compressedSize} />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <DownloadButton compressedFile={compressedFile} fileName={fileName} />

        <QRCodeDialog
          qrUrl={qrUrl}
          fileName={getCompressedFileName()}
          isGeneratingQr={isGeneratingQr}
          qrError={qrError}
          onGenerate={handleQrButtonClick}
          isOpen={isQrDialogOpen}
          onOpenChange={setIsQrDialogOpen}
        />
        
        <Button 
          variant="outline" 
          onClick={onReset}
          className="gap-2 border-[#00ABE4] text-[#00ABE4] hover:bg-[#E9F1FA]"
        >
          <Redo size={18} />
          Compress Another
        </Button>
      </div>
    </div>
  );
};

export default CompressionResult;
