
import React from "react";
import UserHistory, { CompressionHistoryItem } from "@/components/UserHistory";

interface HistorySectionProps {
  history: CompressionHistoryItem[];
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({ 
  history,
  onDownload,
  onDelete
}) => {
  return (
    <div className="space-y-8">
      <UserHistory 
        history={history}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </div>
  );
};

export default HistorySection;
