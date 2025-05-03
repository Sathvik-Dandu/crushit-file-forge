
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files Compressed</CardTitle>
                  <FileType2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground">
                    Files processed through CrushIt
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Saved</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatBytes(stats.totalSaved)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total disk space recovered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Reduction</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageReduction}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average compression rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Common Format</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {fileTypeData.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {fileTypeData.sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fileTypeData.sort((a, b) => b.value - a.value)[0]?.value || 0} files compressed
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">N/A</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="formats" className="w-full">
              <TabsList>
                <TabsTrigger value="formats">File Formats</TabsTrigger>
                <TabsTrigger value="trends">Compression Trends</TabsTrigger>
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
                <div className="overflow-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3 text-left font-medium">File Name</th>
                        <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Type</th>
                        <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Date</th>
                        <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Original Size</th>
                        <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Compressed Size</th>
                        <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Reduction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 5).map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-3 truncate max-w-[200px]">{item.fileName}</td>
                          <td className="px-4 py-3">{item.fileType}</td>
                          <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{formatBytes(item.originalSize)}</td>
                          <td className="px-4 py-3">{formatBytes(item.compressedSize)}</td>
                          <td className="px-4 py-3 text-green-600">
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
