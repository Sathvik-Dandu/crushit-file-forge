
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatBytes } from "@/lib/utils";

interface CompressionControlsProps {
  originalSize: number;
  onCompress: (targetSize: number, compressionLevel: number) => void;
}

const CompressionControls: React.FC<CompressionControlsProps> = ({
  originalSize,
  onCompress,
}) => {
  const [targetSize, setTargetSize] = useState<number>(Math.floor(originalSize * 0.7));
  const [compressionLevel, setCompressionLevel] = useState<number>(50);
  const [compressionMode, setCompressionMode] = useState<"manual" | "preset">("preset");
  
  useEffect(() => {
    // When original size changes, reset target size to 70% of original
    setTargetSize(Math.floor(originalSize * 0.7));
  }, [originalSize]);

  const handleSliderChange = (value: number[]) => {
    setCompressionLevel(value[0]);
    // Adjust target size based on compression level
    const newTargetSize = Math.floor(originalSize * (1 - value[0] / 100));
    setTargetSize(newTargetSize);
  };

  const handleTargetSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setTargetSize(value);
      // Adjust compression level based on target size
      const newCompressionLevel = 100 - Math.floor((value / originalSize) * 100);
      setCompressionLevel(Math.min(Math.max(newCompressionLevel, 0), 100));
    }
  };

  const handlePresetSelect = (preset: string) => {
    let newTargetSize: number;
    
    switch (preset) {
      case "email":
        // Email-ready: ~5MB or 70% of original, whichever is smaller
        newTargetSize = Math.min(5 * 1024 * 1024, Math.floor(originalSize * 0.7));
        break;
      case "web":
        // Web upload: ~1MB or 50% of original, whichever is smaller
        newTargetSize = Math.min(1 * 1024 * 1024, Math.floor(originalSize * 0.5));
        break;
      case "max":
        // Maximum compression: 30% of original
        newTargetSize = Math.floor(originalSize * 0.3);
        break;
      default:
        newTargetSize = Math.floor(originalSize * 0.7);
    }
    
    setTargetSize(newTargetSize);
    const newCompressionLevel = 100 - Math.floor((newTargetSize / originalSize) * 100);
    setCompressionLevel(Math.min(Math.max(newCompressionLevel, 0), 100));
  };

  const compressionQuality = () => {
    if (compressionLevel < 30) return "High Quality";
    if (compressionLevel < 70) return "Medium Quality";
    return "Low Quality";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Compression Options</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to compress your file
        </p>
      </div>
      
      <Tabs
        defaultValue="preset"
        value={compressionMode}
        onValueChange={(value) => setCompressionMode(value as "manual" | "preset")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="preset">Presets</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preset" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center p-4 gap-1"
              onClick={() => handlePresetSelect("email")}
            >
              <span className="text-md font-medium">Email-Ready</span>
              <span className="text-xs text-muted-foreground">~5MB max</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center p-4 gap-1"
              onClick={() => handlePresetSelect("web")}
            >
              <span className="text-md font-medium">Web Upload</span>
              <span className="text-xs text-muted-foreground">~1MB max</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center p-4 gap-1"
              onClick={() => handlePresetSelect("max")}
            >
              <span className="text-md font-medium">Max Compression</span>
              <span className="text-xs text-muted-foreground">Smallest size</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="manual" className="mt-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Target Size</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(targetSize)} (from {formatBytes(originalSize)})
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={targetSize}
                onChange={handleTargetSizeChange}
                min={0}
                max={originalSize}
              />
              <div className="flex items-center gap-1 w-20">
                <select 
                  className="bg-background border rounded-md h-10 px-2 w-full text-sm"
                  onChange={(e) => {
                    const multiplier = parseInt(e.target.value);
                    const value = parseInt((document.querySelector('input[type="number"]') as HTMLInputElement).value);
                    if (!isNaN(value)) {
                      setTargetSize(value * multiplier);
                    }
                  }}
                >
                  <option value="1">B</option>
                  <option value="1024">KB</option>
                  <option value="1048576" selected>MB</option>
                </select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Compression Level: {compressionLevel}%</span>
          <span className="text-sm text-muted-foreground">{compressionQuality()}</span>
        </div>
        <Slider
          value={[compressionLevel]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleSliderChange}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low Compression</span>
          <span>High Compression</span>
        </div>
      </div>
      
      <Button 
        onClick={() => onCompress(targetSize, compressionLevel)}
        className="w-full mt-2"
      >
        Compress File
      </Button>
    </div>
  );
};

export default CompressionControls;
