import { FileText, Folder, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface FileNode {
  type: 'file' | 'folder';
  name: string;
  path: string;
  children?: FileNode[];
}

interface SiteStructureProps {
  siteUrl: string;
  selectedPage: string;
  onSelectPage: (page: string) => void;
}

export default function SiteStructure({ siteUrl, selectedPage, onSelectPage }: SiteStructureProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  
  // Extract crawl ID from the siteUrl
  const crawlIdMatch = siteUrl.match(/\/api\/preview\/(\d+)/);
  const crawlId = crawlIdMatch ? crawlIdMatch[1] : null;
  
  // Fetch site structure from API
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/structure/${crawlId}`],
    queryFn: async () => {
      if (!crawlId) return null;
      const response = await fetch(`/api/structure/${crawlId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch site structure');
      }
      return response.json();
    },
    enabled: !!crawlId
  });
  
  // Update file structure when data is fetched
  useEffect(() => {
    if (data && data.structure) {
      setFileStructure(data.structure);
      
      // Auto-expand folders with the selected page
      if (selectedPage) {
        const parts = selectedPage.split('/');
        let currentPath = '';
        const newExpanded = new Set(expandedFolders);
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (i === 0) {
            currentPath = parts[i];
          } else {
            currentPath += '/' + parts[i];
          }
          newExpanded.add(currentPath);
        }
        
        setExpandedFolders(newExpanded);
      }
    }
  }, [data, selectedPage]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileNode = (node: FileNode, level = 0) => {
    const isSelected = node.path === selectedPage;
    const isExpanded = expandedFolders.has(node.path);
    
    if (node.type === 'file') {
      return (
        <li key={node.path} className="py-1">
          <button 
            className={`flex items-center py-1 w-full text-left ${
              isSelected ? 'text-blue-600' : ''
            }`}
            onClick={() => onSelectPage(node.path)}
          >
            <FileText className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
            <span className="truncate">{node.name}</span>
          </button>
        </li>
      );
    } else {
      return (
        <li key={node.path} className="py-1">
          <div className="flex items-center">
            <button 
              className="flex items-center py-1 w-full text-left"
              onClick={() => toggleFolder(node.path)}
            >
              <Folder className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
              <span>{node.name}/</span>
            </button>
          </div>
          {isExpanded && node.children && (
            <ul className="pl-6">
              {node.children.map(child => renderFileNode(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading site structure
      </div>
    );
  }
  
  if (!fileStructure || fileStructure.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No files found
      </div>
    );
  }
  
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-md">
      <ScrollArea className="h-60">
        <ul className="text-sm font-mono">
          {fileStructure.map(node => renderFileNode(node))}
        </ul>
      </ScrollArea>
    </div>
  );
}
