
import React from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import DownloadButton from "./compression/DownloadButton";
import QRCodeDialog from "./compression/QRCodeDialog";
import CompressionStats from "./compression/CompressionStats";
import { generateDownloadUrl } from "@/services/compressionService";
import { Button } from "@/components/ui/button";
import { Redo } from "lucide-react";

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
  const [qrUrl, setQrUrl] = React.useState<string>("");
  const [isGeneratingQr, setIsGeneratingQr] = React.useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = React.useState(false);
  const [qrError, setQrError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleQrGeneration = async () => {
    if (!user || !user.id) {
      const errorMessage = "Please log in to generate a QR code";
      toast.error(errorMessage, {
        action: {
          label: "Login",
          onClick: () => navigate("/auth")
        }
      });
      setQrError("You need to be logged in to your account to generate a QR code. Please use the login button above.");
      return;
    }
    
    setIsGeneratingQr(true);
    setQrError(null);
    
    try {
      const url = await generateDownloadUrl({
        compressedFile,
        fileName,
        originalSize,
        compressedSize,
        user
      });
      setQrUrl(url);
      setIsQrDialogOpen(true);
    } catch (error) {
      console.error("Failed to generate download URL:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setQrError(errorMessage);
      
      if (errorMessage.includes("log in") || errorMessage.includes("Permission denied")) {
        toast.error("Authentication required", {
          action: {
            label: "Login",
            onClick: () => navigate("/auth")
          }
        });
      } else {
        toast.error("Failed to upload file: " + errorMessage);
      }
    } finally {
      setIsGeneratingQr(false);
    }
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
          fileName={fileName}
          isGeneratingQr={isGeneratingQr}
          qrError={qrError}
          onGenerate={handleQrGeneration}
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

