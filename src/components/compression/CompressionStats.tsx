
import React from "react";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

interface CompressionStatsProps {
  originalSize: number;
  compressedSize: number;
}

const CompressionStats: React.FC<CompressionStatsProps> = ({
  originalSize,
  compressedSize,
}) => {
  // Prevent division by zero and ensure positive values
  const safeOriginalSize = Math.max(originalSize, 1);
  const safeCompressedSize = Math.max(compressedSize, 0);
  
  const compressionRatio = Math.round((1 - safeCompressedSize / safeOriginalSize) * 100);
  const fileReduction = safeOriginalSize - safeCompressedSize;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span>Original size: {formatBytes(originalSize)}</span>
        <span>Compressed size: {formatBytes(compressedSize)}</span>
      </div>
      
      <Progress value={compressionRatio} className="h-2 bg-[#E9F1FA]" />
      
      <div className="flex justify-between text-sm">
        <span>Compression ratio: {compressionRatio}%</span>
        <span className="text-[#00ABE4]">Saved {formatBytes(fileReduction)}</span>
      </div>
    </div>
  );
};

export default CompressionStats;
