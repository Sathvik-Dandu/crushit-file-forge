
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import MobileOptimizedCard from "@/components/MobileOptimizedCard";
import { useAuth } from "@/contexts/AuthContext";
import { getCompressionHistory } from "@/services/supabase/fileOperations";
import { CompressionHistoryItem } from "@/components/UserHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { 
  BarChart,
  LineChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Line
} from "recharts";
import { FileType2, Clock, HardDrive, TrendingDown } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<CompressionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSaved: 0,
    averageReduction: 0,
    fileTypes: {} as Record<string, number>,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    compressionOverTime: [] as {date: string, savingsPercent: number}[],
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const historyData = await getCompressionHistory(user.id);
        setHistory(historyData);
        
        // Calculate statistics
        if (historyData.length > 0) {
          const fileTypes: Record<string, number> = {};
          let totalOriginalSize = 0;
          let totalCompressedSize = 0;
          
          // Group by date for the chart data
          const dateGroups: Record<string, {original: number, compressed: number}> = {};
          
          historyData.forEach(item => {
            // Count file types
            fileTypes[item.fileType] = (fileTypes[item.fileType] || 0) + 1;
            
            // Sum sizes
            totalOriginalSize += item.originalSize;
            totalCompressedSize += item.compressedSize;
            
            // Group by date (just the date part)
            const dateKey = new Date(item.date).toISOString().split('T')[0];
            if (!dateGroups[dateKey]) {
              dateGroups[dateKey] = { original: 0, compressed: 0 };
            }
            dateGroups[dateKey].original += item.originalSize;
            dateGroups[dateKey].compressed += item.compressedSize;
          });
          
          // Convert date groups to chart data format
          const compressionOverTime = Object.keys(dateGroups).map(date => {
            const group = dateGroups[date];
            const savingsPercent = Math.round((1 - group.compressed / group.original) * 100);
            return { date, savingsPercent };
          }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setStats({
            totalFiles: historyData.length,
            totalSaved: totalOriginalSize - totalCompressedSize,
            averageReduction: Math.round((1 - totalCompressedSize / totalOriginalSize) * 100),
            fileTypes,
            totalOriginalSize,
            totalCompressedSize,
            compressionOverTime,
          });
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [user, navigate]);

  // Convert file types to chart data
  const fileTypeData = Object.keys(stats.fileTypes).map(type => ({
    name: type,
    value: stats.fileTypes[type]
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center p-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">
            View your compression statistics and history
          </p>
        </div>

        {history.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted/30">
            <h2 className="text-xl font-semibold mb-2">No compression history yet</h2>
            <p className="text-muted-foreground mb-4">
              Start compressing files to see your statistics here
            </p>
            <button 
              onClick={() => navigate("/")} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Compressor
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MobileOptimizedCard
                title="Total Files Compressed"
                value={stats.totalFiles}
                description="Files processed through CrushIt"
                icon={<FileType2 className="h-4 w-4" />}
              />

              <MobileOptimizedCard
                title="Storage Saved"
                value={formatBytes(stats.totalSaved)}
                description="Total disk space recovered"
                icon={<HardDrive className="h-4 w-4" />}
              />

              <MobileOptimizedCard
                title="Average Reduction"
                value={`${stats.averageReduction}%`}
                description="Average compression rate"
                icon={<TrendingDown className="h-4 w-4" />}
              />

              <MobileOptimizedCard
                title="Most Common Format"
                value={fileTypeData.length > 0 
                  ? fileTypeData.sort((a, b) => b.value - a.value)[0]?.name || "N/A"
                  : "N/A"
                }
                description={fileTypeData.length > 0 
                  ? `${fileTypeData.sort((a, b) => b.value - a.value)[0]?.value || 0} files compressed`
                  : "No files yet"
                }
                icon={<Clock className="h-4 w-4" />}
              />
            </div>

            {/* Charts */}
            <Tabs defaultValue="formats" className="w-full">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto touch-manipulation">
                <TabsTrigger value="formats" className="text-sm sm:text-base">File Formats</TabsTrigger>
                <TabsTrigger value="trends" className="text-sm sm:text-base">Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="formats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>File Format Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={fileTypeData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Number of Files" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Compression Efficiency Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={stats.compressionOverTime}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="savingsPercent"
                            name="Compression %"
                            stroke="#82ca9d"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent Files Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Compressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs sm:text-sm min-w-[600px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">File Name</th>
                        <th className="whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Type</th>
                        <th className="whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Date</th>
                        <th className="whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Original</th>
                        <th className="whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Compressed</th>
                        <th className="whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 5).map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 truncate max-w-[120px] sm:max-w-[200px]" title={item.fileName}>
                            {item.fileName}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">{item.fileType}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">{formatBytes(item.originalSize)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">{formatBytes(item.compressedSize)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-green-600 font-medium">
                            {Math.round((1 - item.compressedSize / item.originalSize) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {history.length > 5 && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => navigate("/")} 
                      className="text-sm text-primary hover:underline"
                    >
                      View all {history.length} files
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
