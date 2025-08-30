
import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileSelect, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  }, [onFileSelect]);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  }, [onFileSelect]);

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center w-full p-4 sm:p-6 lg:p-8 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer touch-manipulation min-h-[200px] sm:min-h-[240px]",
        isDragging ? "border-primary bg-primary/5 scale-[0.98]" : "border-muted-foreground/20 hover:border-primary/50 active:scale-[0.98]",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        multiple
        accept="*/*"
      />
      
      <div className="flex flex-col items-center gap-2 sm:gap-3 text-center px-2">
        <div className="p-3 sm:p-4 rounded-full bg-primary/10">
          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        <h3 className="text-base sm:text-lg font-medium mt-1 sm:mt-2">
          <span className="hidden sm:inline">Drag & drop your files here</span>
          <span className="sm:hidden">Tap to select files</span>
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
          <span className="hidden sm:inline">or click to browse files</span>
          <span className="sm:hidden">Upload multiple files at once</span>
        </p>
        <Button 
          variant="outline" 
          type="button" 
          className="relative z-10 touch-manipulation px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium"
          size="lg"
        >
          <span className="sm:hidden">Select Files</span>
          <span className="hidden sm:inline">Choose Files</span>
        </Button>
      </div>
    </div>
  );
};

export default FileUploadZone;
