
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

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
                </>
              ) : isGeneratingQr ? (
                <>
                  <div className="spinner h-12 w-12 mx-auto mb-4 border-t-2 border-[#00ABE4] rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Generating QR code...</p>
                </>
              ) : (
                <p className="text-muted-foreground">Please try again.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
