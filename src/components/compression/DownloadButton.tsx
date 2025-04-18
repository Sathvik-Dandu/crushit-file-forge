
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface DownloadButtonProps {
  compressedFile: Blob;
  fileName: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ compressedFile, fileName }) => {
  const getCompressedFileName = () => {
    const nameParts = fileName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    return `${baseName}_compressed.${extension}`;
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
    <Button 
      onClick={downloadFile}
      className="gap-2 bg-[#00ABE4] hover:bg-[#00ABE4]/90"
    >
      <Download size={18} />
      Download
    </Button>
  );
};

export default DownloadButton;
