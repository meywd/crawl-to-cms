import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { previewConvertedSite, getConvertedSiteFileContent, downloadConvertedSite } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Home,
  Download,
  Folder,
  File,
  FileJson,
  FileCode,
  FileText,
  FileImage,
  FileType,
  RefreshCw,
  Search,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// File type icon mapping
const FileIcon = ({ type, extension }: { type: string, extension?: string }) => {
  switch (type) {
    case 'script':
      return <FileCode className="w-4 h-4 text-amber-500" />;
    case 'style':
      return <FileCode className="w-4 h-4 text-blue-500" />;
    case 'html':
      return <FileText className="w-4 h-4 text-purple-500" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-green-500" />;
    case 'image':
      return <FileImage className="w-4 h-4 text-rose-500" />;
    default:
      if (extension === 'md') {
        return <FileText className="w-4 h-4 text-gray-500" />;
      }
      return <FileType className="w-4 h-4 text-gray-500" />;
  }
};

// Generate syntax highlighting class based on file extension
const getLanguageClass = (path: string) => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  if (!extension) return '';
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'language-javascript';
    case 'css':
      return 'language-css';
    case 'html':
      return 'language-html';
    case 'json':
      return 'language-json';
    case 'md':
      return 'language-markdown';
    default:
      return `language-${extension}`;
  }
};

// Component to render a directory tree
const DirectoryTree = ({ 
  files,
  onSelectFile,
  selectedPath,
  searchQuery
}: { 
  files: any[],
  onSelectFile: (path: string) => void,
  selectedPath: string,
  searchQuery: string
}) => {
  // Filter files based on search query
  const filterFiles = (files: any[], query: string) => {
    if (!query) return files;
    
    return files.filter(file => {
      // Check if current file/folder matches
      const currentMatches = file.name.toLowerCase().includes(query.toLowerCase());
      
      // If it's a directory, check children recursively
      if (file.type === 'directory' && file.children) {
        const filteredChildren = filterFiles(file.children, query);
        return currentMatches || filteredChildren.length > 0;
      }
      
      return currentMatches;
    }).map(file => {
      if (file.type === 'directory' && file.children) {
        return {
          ...file,
          children: filterFiles(file.children, query)
        };
      }
      return file;
    });
  };
  
  const filteredFiles = filterFiles(files, searchQuery);
  
  return (
    <ul className="space-y-1 text-sm">
      {filteredFiles.map((file) => (
        <li key={file.path || file.name}>
          {file.type === 'directory' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1 p-1 rounded hover:bg-slate-100">
                <Folder className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              {file.children && file.children.length > 0 && (
                <ul className="pl-4 space-y-1 border-l border-slate-200">
                  <DirectoryTree 
                    files={file.children} 
                    onSelectFile={onSelectFile} 
                    selectedPath={selectedPath}
                    searchQuery={searchQuery}
                  />
                </ul>
              )}
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 p-1 rounded cursor-pointer ${
                file.path === selectedPath ? 'bg-slate-200' : 'hover:bg-slate-100'
              }`}
              onClick={() => onSelectFile(file.path)}
            >
              <FileIcon type={file.fileType} extension={file.name.split('.').pop()} />
              <span className="text-sm">{file.name}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

const ConvertedSitePreview = () => {
  const [match, params] = useRoute('/preview-converted/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const convertedSiteId = params?.id;
  
  // Query to fetch the file structure of the converted site
  const { 
    data: siteStructure, 
    isLoading: isLoadingStructure,
    refetch: refetchStructure,
    error: structureError
  } = useQuery({
    queryKey: ['/api/sites/preview', convertedSiteId],
    queryFn: () => previewConvertedSite(convertedSiteId || ''),
    enabled: !!convertedSiteId,
  });
  
  // Query to fetch the content of the selected file
  const { 
    data: fileContent, 
    isLoading: isLoadingFileContent,
    refetch: refetchFileContent
  } = useQuery({
    queryKey: ['/api/sites/preview/file', convertedSiteId, selectedFilePath],
    queryFn: () => {
      if (!selectedFilePath) throw new Error('No file selected');
      return getConvertedSiteFileContent(convertedSiteId || '', selectedFilePath);
    },
    enabled: !!convertedSiteId && !!selectedFilePath,
  });
  
  // If there are files, select the first file by default
  useEffect(() => {
    if (siteStructure?.files && siteStructure.files.length > 0) {
      // Try to find package.json or src/App.tsx first
      const findFile = (files: any[], targetName: string): string | null => {
        for (const file of files) {
          if (file.type === 'file' && file.name === targetName) {
            return file.path;
          } else if (file.type === 'directory' && file.children) {
            const found = findFile(file.children, targetName);
            if (found) return found;
          }
        }
        return null;
      };
      
      const findFileInDir = (files: any[], dirName: string, targetName: string): string | null => {
        for (const file of files) {
          if (file.type === 'directory' && file.name === dirName && file.children) {
            const found = findFile(file.children, targetName);
            if (found) return found;
          } else if (file.type === 'directory' && file.children) {
            const found = findFileInDir(file.children, dirName, targetName);
            if (found) return found;
          }
        }
        return null;
      };
      
      // Try to find some important files in order of preference
      const packageJsonPath = findFile(siteStructure.files, 'package.json');
      const appTsxPath = findFileInDir(siteStructure.files, 'src', 'App.tsx');
      const appJsxPath = findFileInDir(siteStructure.files, 'src', 'App.jsx');
      const indexTsxPath = findFileInDir(siteStructure.files, 'src', 'index.tsx');
      const indexJsxPath = findFileInDir(siteStructure.files, 'src', 'index.jsx');
      const readmePath = findFile(siteStructure.files, 'README.md');
      
      // Select the first file found in order of preference
      setSelectedFilePath(packageJsonPath || appTsxPath || appJsxPath || indexTsxPath || indexJsxPath || readmePath || findFirstFile(siteStructure.files));
    }
  }, [siteStructure]);
  
  // Helper to find the first file in the directory structure
  const findFirstFile = (files: any[]): string | null => {
    for (const file of files) {
      if (file.type === 'file') {
        return file.path;
      } else if (file.type === 'directory' && file.children) {
        const firstFile = findFirstFile(file.children);
        if (firstFile) return firstFile;
      }
    }
    return null;
  };
  
  // Handle file selection
  const handleSelectFile = (path: string) => {
    setSelectedFilePath(path);
  };
  
  // Handle download
  const handleDownload = () => {
    if (!convertedSiteId) return;
    
    downloadConvertedSite(convertedSiteId);
    toast({
      title: 'Download started',
      description: 'Your converted React app is being downloaded.',
    });
  };
  
  // If no converted site ID is provided
  if (!convertedSiteId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No converted site ID provided. Please select a converted site to preview.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation('/converted-sites')}>Go to Converted Sites</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // If there's an error loading the structure
  if (structureError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" />
              Error Loading Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              {(structureError as Error).message || 'Failed to load converted site preview'}
            </p>
            <p className="mt-4">
              The conversion might still be in progress or there was an error during conversion.
            </p>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button onClick={() => refetchStructure()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => setLocation('/converted-sites')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Converted Sites
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation('/')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/converted-sites')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Converted Sites
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{siteStructure?.name || 'React App Preview'}</h1>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="w-4 h-4 text-slate-500" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">About this preview</h4>
                <p className="text-sm">
                  This preview shows the contents of your converted React application. 
                  You can browse the file structure and view file contents before downloading.
                </p>
                {siteStructure && (
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Total Files:</span>
                      <span className="text-xs font-medium">{siteStructure.totalFiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Total Size:</span>
                      <span className="text-xs font-medium">
                        {(siteStructure.totalSize / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <Button onClick={handleDownload} className="ml-auto">
          <Download className="w-4 h-4 mr-2" />
          Download App
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* File Structure */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Files</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => refetchStructure()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm"
                  prefix={<Search className="h-3.5 w-3.5 text-slate-500" />}
                />
              </div>
            </CardHeader>
            <CardContent className="py-0">
              <ScrollArea className="h-[60vh]">
                {isLoadingStructure ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                    ))}
                  </div>
                ) : siteStructure?.files ? (
                  <DirectoryTree 
                    files={siteStructure.files} 
                    onSelectFile={handleSelectFile} 
                    selectedPath={selectedFilePath || ''}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <p>No files found</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* File Viewer */}
        <div className="md:col-span-9">
          <Card>
            <CardHeader className="py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  {selectedFilePath && (
                    <>
                      <FileIcon 
                        type={selectedFilePath.endsWith('.json') ? 'json' : 
                              selectedFilePath.endsWith('.css') ? 'style' :
                              selectedFilePath.endsWith('.html') ? 'html' :
                              selectedFilePath.match(/\.(jsx?|tsx?)$/) ? 'script' :
                              selectedFilePath.match(/\.(jpe?g|png|gif|svg|webp)$/) ? 'image' : 'other'}
                        extension={selectedFilePath.split('.').pop()}
                      />
                      <CardTitle className="text-lg truncate">
                        {selectedFilePath.split('/').pop()}
                      </CardTitle>
                      <Badge variant="outline" className="h-5 text-xs">
                        {selectedFilePath.split('.').pop()?.toUpperCase()}
                      </Badge>
                    </>
                  )}
                </div>
                {selectedFilePath && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => refetchFileContent()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                {isLoadingFileContent ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Skeleton key={i} className={`h-4 w-${Math.floor(Math.random() * 5) + 7}/12`} />
                    ))}
                  </div>
                ) : fileContent ? (
                  <ScrollArea className="h-[65vh] w-full">
                    {fileContent.contentType.startsWith('image/') ? (
                      <div className="flex items-center justify-center p-4">
                        <img 
                          src={`data:${fileContent.contentType};base64,${fileContent.content}`} 
                          alt={fileContent.path} 
                          className="max-w-full max-h-[60vh] object-contain"
                        />
                      </div>
                    ) : (
                      <Tabs defaultValue="preview">
                        <div className="px-4 pt-2">
                          <TabsList className="w-full justify-start">
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="raw">Raw</TabsTrigger>
                          </TabsList>
                        </div>
                        
                        <TabsContent value="preview" className="m-0">
                          <pre className={`p-4 text-sm overflow-auto ${getLanguageClass(fileContent.path)}`}>
                            <code>{fileContent.content}</code>
                          </pre>
                        </TabsContent>
                        
                        <TabsContent value="raw" className="m-0">
                          <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                            {fileContent.content}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </ScrollArea>
                ) : selectedFilePath ? (
                  <div className="p-4 text-center">
                    <p>Failed to load file content</p>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p>Select a file to view its contents</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConvertedSitePreview;