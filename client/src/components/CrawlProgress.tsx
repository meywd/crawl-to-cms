import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle, Pause, X, RefreshCw } from "lucide-react";
import { type CrawlLog, type CrawlStatus } from "@/types";

interface CrawlProgressProps {
  progress: number;
  status: CrawlStatus;
  crawledPages: number;
  totalPages: number;
  logs: CrawlLog[];
  onPause: () => void;
  onCancel: () => void;
}

export default function CrawlProgress({
  progress,
  status,
  crawledPages,
  totalPages,
  logs,
  onPause,
  onCancel,
}: CrawlProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "in_progress":
        return <RefreshCw className="h-5 w-5 text-blue-500 mr-2 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500 mr-2" />;
      case "paused":
        return <Pause className="h-5 w-5 text-yellow-500 mr-2" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500 mr-2" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-500 mr-2 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "in_progress":
        return "Crawl in Progress";
      case "completed":
        return "Crawl Completed";
      case "paused":
        return "Crawl Paused";
      case "error":
        return "Crawl Error";
      default:
        return "Crawl in Progress";
    }
  };

  const getLogIcon = (logStatus: string) => {
    switch (logStatus) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500 mr-2 animate-spin flex-shrink-0" />;
    }
  };

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            {getStatusIcon()}
            {getStatusText()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-primary">
                  {progress}% Complete
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-gray-600">
                  {crawledPages}/{totalPages} pages crawled
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-2" />
          </div>
          
          {/* Crawl Status */}
          <div className="mt-5 border rounded-md border-gray-200">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Crawl Activity</h4>
            </div>
            <ScrollArea className="h-40">
              <div className="px-4 py-3">
                <ul className="space-y-2">
                  {logs.map((log) => (
                    <li key={log.id} className="text-sm text-gray-600 flex">
                      {getLogIcon(log.status)}
                      <span className="font-mono">{log.message}</span>
                    </li>
                  ))}
                  {status === "in_progress" && (
                    <li className="text-sm text-gray-600 flex">
                      <RefreshCw className="h-4 w-4 text-blue-500 mr-2 animate-spin flex-shrink-0" />
                      <span className="font-mono">Crawling in progress...</span>
                    </li>
                  )}
                </ul>
              </div>
            </ScrollArea>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-5 flex space-x-3">
            {status === "in_progress" ? (
              <Button
                variant="outline"
                onClick={onPause}
                className="flex items-center"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : status === "paused" ? (
              <Button
                variant="outline"
                onClick={onPause}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : null}
            
            {status !== "completed" && (
              <Button
                variant="destructive"
                onClick={onCancel}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
