
import React, { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

interface QRCodeDialogProps {
  qrUrl: string;
  fileName: string;
  isGeneratingQr: boolean;
  qrError: string | null;
  onGenerate: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  qrUrl,
  fileName,
  isGeneratingQr,
  qrError,
  onGenerate,
  isOpen,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleLoginClick = () => {
    onOpenChange(false); // Close the dialog
    navigate('/auth'); // Navigate to auth page
  };
  
  // Check if user is logged in before generating QR code
  useEffect(() => {
    if (isOpen && !user && !qrUrl && !qrError) {
      toast.error("Please log in to generate QR codes", {
        action: {
          label: "Login",
          onClick: handleLoginClick
        }
      });
    }
  }, [isOpen, user, qrUrl, qrError]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          onClick={onGenerate}
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
          <DialogDescription>
            {qrUrl ? 'Scan this QR code with your phone to download the file' : 'Generating QR code...'}
          </DialogDescription>
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
                File: {fileName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Link expires in 5 minutes
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              {qrError ? (
                <>
                  <p className="text-red-500">QR code could not be generated.</p>
                  <p className="text-sm mt-2 text-red-400">{qrError}</p>
                  {qrError.includes("log in") || qrError.includes("logged in") || qrError.includes("Permission denied") ? (
                    <Button 
                      variant="default"
                      onClick={handleLoginClick}
                      className="mt-4 gap-2 bg-[#00ABE4] hover:bg-[#0096c7]"
                    >
                      <LogIn size={16} />
                      Log In
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={onGenerate}
                      disabled={isGeneratingQr}
                      className="mt-4 gap-2"
                    >
                      <RefreshCw size={16} className={isGeneratingQr ? "animate-spin" : ""} />
                      Try Again
                    </Button>
                  )}
                </>
              ) : isGeneratingQr ? (
                <>
                  <div className="h-12 w-12 mx-auto mb-4 border-t-2 border-[#00ABE4] rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Generating QR code...</p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">Please try again.</p>
                  <Button 
                    variant="outline"
                    onClick={onGenerate}
                    className="mt-4 gap-2"
                  >
                    <RefreshCw size={16} />
                    Retry
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
