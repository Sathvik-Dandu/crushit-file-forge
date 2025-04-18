
import React from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { getFileDownloadUrl } from "@/services/supabaseStorage";
import { toast } from "@/components/ui/sonner";

export interface CompressionHistoryItem {
  id: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  date: string;
  fileType: string;
  cloudFilePath?: string;
}

interface UserHistoryProps {
  history: CompressionHistoryItem[];
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

const UserHistory: React.FC<UserHistoryProps> = ({ 
  history, 
  onDownload, 
  onDelete 
}) => {
  const handleCloudDownload = async (item: CompressionHistoryItem) => {
    if (!item.cloudFilePath) {
      toast.error("No cloud file available");
      return;
    }

    try {
      const downloadUrl = await getFileDownloadUrl(item.cloudFilePath);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${item.fileName}`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file. Please check your Supabase configuration.");
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">No compression history yet</h3>
        <p className="text-muted-foreground">
          Your compressed files will appear here once you start using CrushIt
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Your Compression History</h2>
        <p className="text-sm text-muted-foreground">
          {history.length} file{history.length !== 1 ? 's' : ''} compressed
        </p>
      </div>
      
      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="min-w-0 flex-grow">
              <h4 className="font-medium truncate" title={item.fileName}>
                {item.fileName}
              </h4>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{item.fileType}</span>
                <span>•</span>
                <span>
                  {formatBytes(item.originalSize)} → {formatBytes(item.compressedSize)}
                </span>
                <span className="text-green-600">
                  ({Math.round((1 - item.compressedSize / item.originalSize) * 100)}% reduction)
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleCloudDownload(item)}
                title="Download"
              >
                <Download size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(item.id)}
                title="Delete"
              >
                <Trash2 size={18} className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHistory;
