import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe, History, Database, CheckCircle, ExternalLink } from "lucide-react";
import CrawlerForm from "@/components/CrawlerForm";
import CrawlProgress from "@/components/CrawlProgress";
import { useLocation } from "wouter";
import { type CrawlLog, type CrawlStatus } from "@/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [crawlId, setCrawlId] = useState<number | null>(null);
  const [crawlState, setCrawlState] = useState<{
    isProcessing: boolean;
    crawlStatus: CrawlStatus;
    crawlProgress: number;
    crawledPages: number;
    totalPages: number;
    crawlLogs: CrawlLog[];
    siteUrl: string;
    previewReady: boolean;
  }>({
    isProcessing: false,
    crawlStatus: "idle",
    crawlProgress: 0,
    crawledPages: 0,
    totalPages: 0,
    crawlLogs: [],
    siteUrl: "",
    previewReady: false,
  });

  // This function would be called when starting a new crawl
  const handleStartCrawl = async (url: string, depth: number, options: Record<string, boolean>) => {
    // Add error log for debugging
    console.log(`Starting crawl for URL: ${url}, depth: ${depth}, options:`, options);
    
    // Reset the crawl state
    setCrawlState({
      ...crawlState,
      isProcessing: true,
      crawlStatus: "in_progress",
      crawlProgress: 0,
      crawledPages: 0,
      totalPages: 0,
      crawlLogs: [],
      siteUrl: url,
      previewReady: false,
    });

    try {
      // Log for debugging
      const logs: CrawlLog[] = [];
      logs.push({ 
        id: Date.now(), 
        status: "info", 
        message: `Starting crawl for ${url}...`,
        timestamp: new Date().toISOString()
      });
      
      setCrawlState(prev => ({
        ...prev,
        crawlLogs: logs
      }));
      
      // Call the API to start the crawl
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, depth, options }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        logs.push({ 
          id: Date.now(), 
          status: "error", 
          message: data.message || "Failed to start crawl",
          timestamp: new Date().toISOString()
        });
        
        setCrawlState(prev => ({
          ...prev,
          isProcessing: false,
          crawlStatus: "error",
          crawlLogs: logs
        }));
        
        return;
      }
      
      // Set the crawl ID from the API response
      if (data.id) {
        setCrawlId(data.id);
      } else {
        // For demo purposes, set a placeholder ID
        setCrawlId(123);
      }
      
      logs.push({ 
        id: Date.now(), 
        status: "success", 
        message: "Crawl started successfully",
        timestamp: new Date().toISOString()
      });
      
      setCrawlState(prev => ({
        ...prev,
        crawlLogs: logs
      }));
      
      // In a real app, we would then poll for status updates
      // For demo purposes, we'll simulate progress
      simulateCrawlProgress();
    } catch (error) {
      console.error("Error starting crawl:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const logs: CrawlLog[] = [{ 
        id: Date.now(), 
        status: "error" as "error" | "info" | "success" | "warning", 
        message: `Error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      }];
      
      setCrawlState(prev => ({
        ...prev,
        isProcessing: false,
        crawlStatus: "error",
        crawlLogs: logs
      }));
    }
  };

  // This function simulates crawl progress for demo purposes
  const simulateCrawlProgress = () => {
    // This would be replaced with actual polling in production
    const mockLogs: CrawlLog[] = [
      { 
        id: Date.now() + 1, 
        status: "success", 
        message: "Crawled: homepage",
        timestamp: new Date().toISOString()
      },
      { 
        id: Date.now() + 2, 
        status: "success", 
        message: "Crawled: about page",
        timestamp: new Date().toISOString()
      },
      { 
        id: Date.now() + 3, 
        status: "success", 
        message: "Crawled: services page",
        timestamp: new Date().toISOString()
      }
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 100) {
        const crawledPages = Math.floor((progress / 100) * 20);
        setCrawlState(prev => {
          // Get existing logs and append new ones
          const currentLogs = [...prev.crawlLogs];
          
          // Add mock logs based on progress
          const mockLogsToAdd = mockLogs.slice(0, Math.min(crawledPages, mockLogs.length))
            .filter(log => !currentLogs.some(existingLog => existingLog.id === log.id));
          
          return {
            ...prev,
            crawlProgress: progress,
            crawledPages,
            totalPages: 20,
            crawlLogs: [...currentLogs, ...mockLogsToAdd],
          };
        });
      } else {
        clearInterval(interval);
        setCrawlState(prev => {
          // Add completion log
          const completionLog = { 
            id: Date.now(), 
            status: "success" as const, 
            message: "Crawl completed successfully",
            timestamp: new Date().toISOString()
          };
          
          return {
            ...prev,
            isProcessing: false,
            crawlStatus: "completed",
            crawlProgress: 100,
            crawledPages: 20,
            totalPages: 20,
            previewReady: true,
            crawlLogs: [...prev.crawlLogs, completionLog],
          };
        });
      }
    }, 500);
  };

  const handlePauseCrawl = () => {
    // In a real implementation, this would call an API to pause the crawl
    setCrawlState({
      ...crawlState,
      crawlStatus: "paused",
    });
  };

  const handleCancelCrawl = () => {
    // In a real implementation, this would call an API to cancel the crawl
    setCrawlState({
      ...crawlState,
      isProcessing: false,
      crawlStatus: "cancelled",
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <CrawlerForm 
          onStartCrawl={handleStartCrawl} 
          isProcessing={crawlState.isProcessing}
        />
        
        {crawlState.isProcessing && (
          <CrawlProgress
            progress={crawlState.crawlProgress}
            status={crawlState.crawlStatus}
            crawledPages={crawlState.crawledPages}
            totalPages={crawlState.totalPages}
            logs={crawlState.crawlLogs}
            onPause={handlePauseCrawl}
            onCancel={handleCancelCrawl}
          />
        )}
        
        {crawlState.previewReady && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Crawl completed!</h3>
                <p className="text-sm text-green-700">Your site replica is ready to be viewed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setLocation(`/preview/${crawlId}`)} 
                variant="default"
                className="bg-green-500 hover:bg-green-600"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Replica
              </Button>
              <Button 
                onClick={() => setLocation("/history")} 
                variant="outline"
              >
                <History className="h-4 w-4 mr-2" />
                View in History
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
