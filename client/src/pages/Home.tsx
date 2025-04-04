import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, History, Database } from "lucide-react";
import CrawlerForm from "@/components/CrawlerForm";
import CrawlProgress from "@/components/CrawlProgress";
import ReplicatedSitePreview from "@/components/ReplicatedSitePreview";
import { useLocation } from "wouter";
import { type CrawlLog, type CrawlStatus } from "@/types";

export default function Home() {
  const [, setLocation] = useLocation();
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
      // Call the API to start the crawl
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, depth, options }),
      });

      if (!response.ok) {
        throw new Error("Failed to start crawl");
      }

      // In a real app, we would then poll for status updates
      // For demo purposes, we'll simulate progress
      simulateCrawlProgress();
    } catch (error) {
      console.error("Error starting crawl:", error);
      setCrawlState({
        ...crawlState,
        isProcessing: false,
        crawlStatus: "error",
      });
    }
  };

  // This function simulates crawl progress for demo purposes
  const simulateCrawlProgress = () => {
    // This would be replaced with actual polling in production
    const mockLogs: CrawlLog[] = [
      { id: 1, status: "success", message: "Crawled: homepage" },
      { id: 2, status: "success", message: "Crawled: about page" },
      { id: 3, status: "success", message: "Crawled: services page" }
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 100) {
        const crawledPages = Math.floor((progress / 100) * 20);
        setCrawlState({
          ...crawlState,
          crawlProgress: progress,
          crawledPages,
          totalPages: 20,
          crawlLogs: mockLogs.slice(0, Math.min(crawledPages, mockLogs.length)),
        });
      } else {
        clearInterval(interval);
        setCrawlState(prev => ({
          ...prev,
          isProcessing: false,
          crawlStatus: "completed",
          crawlProgress: 100,
          crawledPages: 20,
          totalPages: 20,
          previewReady: true,
        }));
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
      <Tabs defaultValue="crawler">
        <div className="border-b border-gray-200">
          <TabsList className="flex">
            <TabsTrigger 
              value="crawler"
              className="text-sm flex items-center py-4 px-6 focus:outline-none"
            >
              <Globe className="h-4 w-4 mr-2" />
              Crawler
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="text-sm flex items-center py-4 px-6 focus:outline-none"
              onClick={() => setLocation("/history")}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="text-sm flex items-center py-4 px-6 focus:outline-none"
              onClick={() => setLocation("/saved-sites")}
            >
              <Database className="h-4 w-4 mr-2" />
              Saved Sites
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="crawler" className="p-6">
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
            <ReplicatedSitePreview 
              siteUrl={crawlState.siteUrl}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
