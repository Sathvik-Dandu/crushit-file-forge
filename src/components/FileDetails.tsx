
import React from "react";
import { File, FileType } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

interface FileDetailsProps {
  file: File;
  compressedSize?: number;
  className?: string;
}

const FileDetails: React.FC<FileDetailsProps> = ({ file, compressedSize, className }) => {
  const getFileIcon = () => {
    const fileType = file.type.split('/')[0];
    
    switch (fileType) {
      case 'image':
        return <FileType className="h-10 w-10 text-blue-500" />;
      case 'application':
        if (file.type.includes('pdf')) {
          return <File className="h-10 w-10 text-red-500" />;
        } else if (file.type.includes('word') || file.type.includes('document')) {
          return <File className="h-10 w-10 text-blue-700" />;
        } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
          return <File className="h-10 w-10 text-green-600" />;
        } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
          return <File className="h-10 w-10 text-orange-500" />;
        }
        return <File className="h-10 w-10 text-gray-500" />;
      case 'video':
        return <File className="h-10 w-10 text-purple-500" />;
      case 'audio':
        return <File className="h-10 w-10 text-pink-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const getCompressionRatio = () => {
    if (!compressedSize) return null;
    const ratio = ((file.size - compressedSize) / file.size * 100).toFixed(1);
    return ratio;
  };

  return (
    <div className={cn(
      "flex items-center p-4 border rounded-lg transition-colors hover:bg-muted/30",
      className
    )}>
      <div className="flex-shrink-0 mr-4">
        {getFileIcon()}
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold truncate" title={file.name}>
          {file.name}
        </h3>
        
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>{file.type || "Unknown type"}</span>
          <span>•</span>
          <span>Original: {formatBytes(file.size)}</span>
          
          {compressedSize && (
            <>
              <span>•</span>
              <span>Compressed: {formatBytes(compressedSize)}</span>
              <span>•</span>
              <span className="text-green-600 font-medium">
                {getCompressionRatio()}% reduction
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
