
import React, { useState } from "react";
import { Download, Redo, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { uploadCompressedFile, setupFileExpiration } from "@/services/supabaseStorage";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
  
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
  const fileReduction = originalSize - compressedSize;
  
  const getCompressedFileName = () => {
    const nameParts = fileName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    return `${baseName}_compressed.${extension}`;
  };
  
  const generateDownloadUrl = async () => {
    if (!user || !user.id) {
      toast.error("Please log in to upload files");
      return;
    }
    
    setIsGeneratingQr(true);
    
    try {
      console.log("Starting file upload process");
      const compressedFileAsFile = new File([compressedFile], getCompressedFileName(), {
        type: compressedFile.type
      });
      
      // Check if Supabase is properly initialized
      if (!supabase) {
        console.error("Supabase client is not initialized");
        toast.error("Storage service is not available");
        return;
      }
      
      // Upload the file to Supabase
      console.log("Uploading file to Supabase");
      const { path, publicUrl } = await uploadCompressedFile(compressedFileAsFile, user.id);
      console.log("File uploaded successfully, path:", path);
      console.log("Public URL:", publicUrl);
      
      // Set up automatic file expiration (5 minutes)
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 5);
      await setupFileExpiration(path, 5);
      console.log("File expiration set to:", expirationTime);
      
      // Create the download URL with the file URL, filename, and expiration time
      const downloadUrl = new URL(window.location.origin);
      downloadUrl.pathname = '/download-helper.html';
      downloadUrl.hash = `${encodeURIComponent(publicUrl)},${encodeURIComponent(getCompressedFileName())},${encodeURIComponent(expirationTime.getTime().toString())}`;
      
      console.log("Generated download URL:", downloadUrl.toString());
      setQrUrl(downloadUrl.toString());
      setIsQrDialogOpen(true);
      return publicUrl;
    } catch (error) {
      console.error("Failed to generate download URL:", error);
      toast.error("Failed to upload file. Please try again.");
      return null;
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const downloadFile = () => {
    try {
      const url = URL.createObjectURL(compressedFile);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = getCompressedFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Download started successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full border rounded-lg p-6 bg-white">
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-[#00ABE4]">Compression Complete!</h3>
        <p className="text-muted-foreground">Your file has been compressed successfully</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Original size: {formatBytes(originalSize)}</span>
          <span>Compressed size: {formatBytes(compressedSize)}</span>
        </div>
        
        <Progress value={compressionRatio} className="h-2 bg-[#E9F1FA]" />
        
        <div className="flex justify-between text-sm">
          <span>Compression ratio: {compressionRatio}%</span>
          <span className="text-[#00ABE4]">Saved {formatBytes(fileReduction)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <Button 
          onClick={downloadFile}
          className="gap-2 bg-[#00ABE4] hover:bg-[#00ABE4]/90"
        >
          <Download size={18} />
          Download
        </Button>

        <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              onClick={generateDownloadUrl}
              disabled={isGeneratingQr}
              className="gap-2 border-[#00ABE4] text-[#00ABE4] hover:bg-[#E9F1FA]"
            >
              <QrCode size={18} />
              {isGeneratingQr ? 'Generating...' : 'QR Code'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#00ABE4]">Scan to Download</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6">
              {qrUrl ? (
                <>
                  <QRCodeSVG
                    value={qrUrl}
                    size={256}
                    level="H"
                    fgColor="#00ABE4"
                    includeMargin
                    className="max-w-full h-auto"
                  />
                  <p className="text-sm text-muted-foreground mt-4">
                    Scan this QR code with your phone to download the file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Link expires in 5 minutes
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">QR code could not be generated.</p>
                  <p className="text-sm mt-2">Please try again.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
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
