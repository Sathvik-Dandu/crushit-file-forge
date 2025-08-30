import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MobileOptimizedCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  value,
  description,
  icon,
  className = ""
}) => {
  return (
    <Card className={`touch-manipulation ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium leading-none">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-lg sm:text-2xl font-bold leading-none mb-1">{value}</div>
        <p className="text-xs text-muted-foreground leading-tight">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;