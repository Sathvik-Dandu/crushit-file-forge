
import React, { useState } from "react";
import { Download, Redo, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";

interface CompressionResultProps {
  originalSize: number;
  compressedSize: number;
  fileName: string;
  compressedFile: Blob;
  onReset: () => void;
}

const CompressionResult: React.FC<CompressionResultProps> = ({
  originalSize,
  compressedSize,
  fileName,
  compressedFile,
  onReset
}) => {
  const [qrUrl, setQrUrl] = useState<string>("");
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
  const fileReduction = originalSize - compressedSize;
  
  // Create the file name with "compressed" prefix
  const getCompressedFileName = () => {
    const nameParts = fileName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    return `${baseName}_compressed.${extension}`;
  };
  
  const generateDownloadUrl = () => {
    try {
      const url = URL.createObjectURL(compressedFile);
      
      // Create a full download URL that will trigger download when accessed directly
      // This is what makes the QR code directly download the file when scanned
      const downloadUrl = `${window.location.origin}/download-helper.html#${encodeURIComponent(url)},${encodeURIComponent(getCompressedFileName())}`;
      
      setQrUrl(downloadUrl);
      return url;
    } catch (error) {
      console.error("Failed to generate download URL:", error);
      toast.error("Failed to generate download URL");
      return "";
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
            <div className="flex items-center justify-center p-6">
              <QRCodeSVG
                value={qrUrl}
                size={256}
                level="H"
                fgColor="#00ABE4"
                includeMargin
                className="max-w-full h-auto"
              />
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
