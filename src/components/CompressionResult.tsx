import React, { useState } from "react";
import { Download, Redo, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { uploadCompressedFile } from "@/services/supabaseStorage";

interface CompressionResultProps {
  originalSize: number;
  compressedSize: number;
  fileName: string;
  compressedFile: Blob;
  onReset: () => void;
  user: { id: string; email: string } | null;
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
  const [cloudFilePath, setCloudFilePath] = useState<string>("");
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);
  
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
  const fileReduction = originalSize - compressedSize;
  
  const getCompressedFileName = () => {
    const nameParts = fileName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    return `${baseName}_compressed.${extension}`;
  };
  
  const generateDownloadUrl = async () => {
    if (!user) {
      toast.error("Please log in to upload files");
      return;
    }
    
    try {
      // Convert Blob to File
      const compressedFileAsFile = new File([compressedFile], getCompressedFileName(), {
        type: compressedFile.type
      });
      
      // Upload to Supabase
      const { path, publicUrl } = await uploadCompressedFile(compressedFileAsFile, user.id);
      
      // Set expiration time to 5 minutes from now
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 5);
      setExpirationTime(expiry);
      setCloudFilePath(path);
      
      // Create download URL
      const downloadUrl = `${window.location.origin}/download-helper.html#${encodeURIComponent(publicUrl)},${encodeURIComponent(getCompressedFileName())},${encodeURIComponent(expiry.getTime().toString())}`;
      
      setQrUrl(downloadUrl);
      return publicUrl;
    } catch (error) {
      console.error("Failed to generate download URL:", error);
      toast.error("Failed to upload file");
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

  const formatExpirationTime = () => {
    if (!expirationTime) return "";
    
    return expirationTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              onClick={generateDownloadUrl}
              className="gap-2 border-[#00ABE4] text-[#00ABE4] hover:bg-[#E9F1FA]"
            >
              <QrCode size={18} />
              QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#00ABE4]">Scan to Download</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6">
              <QRCodeSVG
                value={qrUrl}
                size={256}
                level="H"
                fgColor="#00ABE4"
                includeMargin
                className="max-w-full h-auto"
              />
              {expirationTime && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    This QR code will expire in 5 minutes (at {formatExpirationTime()})
                  </p>
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
