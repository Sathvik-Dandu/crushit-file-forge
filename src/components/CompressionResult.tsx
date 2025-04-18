
import React from "react";
import { Download, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

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
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
  const fileReduction = originalSize - compressedSize;
  const fileExtension = fileName.split('.').pop() || '';
  
  const downloadFile = () => {
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement('a');
    
    // Create the file name with "compressed" prefix
    const nameParts = fileName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    const newFileName = `${baseName}_compressed.${extension}`;
    
    link.href = url;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 w-full border rounded-lg p-6">
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold">Compression Complete!</h3>
        <p className="text-muted-foreground">Your file has been compressed successfully</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Original size: {formatBytes(originalSize)}</span>
          <span>Compressed size: {formatBytes(compressedSize)}</span>
        </div>
        
        <Progress value={compressionRatio} className="h-2" />
        
        <div className="flex justify-between text-sm">
          <span>Compression ratio: {compressionRatio}%</span>
          <span className="text-green-600">Saved {formatBytes(fileReduction)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <Button 
          onClick={downloadFile}
          className="gap-2"
        >
          <Download size={18} />
          Download
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onReset}
          className="gap-2"
        >
          <Redo size={18} />
          Compress Another
        </Button>
      </div>
    </div>
  );
};

export default CompressionResult;
