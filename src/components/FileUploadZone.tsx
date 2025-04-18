
import React, { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
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
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50",
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
      />
      
      <div className="flex flex-col items-center gap-2">
        <div className="p-4 rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mt-2">Drag & drop your file here</h3>
        <p className="text-sm text-muted-foreground mb-3">or click to browse files</p>
        <Button variant="outline" type="button" className="relative z-10">
          Select File
        </Button>
      </div>
    </div>
  );
};

export default FileUploadZone;
