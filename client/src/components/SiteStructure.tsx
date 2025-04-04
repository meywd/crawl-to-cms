import { FileText, Folder } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
  // In a real implementation, this would be fetched from the API
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['blog', 'assets']));
  
  // Mock data for demonstration
  const fileStructure: FileNode[] = [
    { type: 'file', name: 'index.html', path: 'index.html' },
    { type: 'file', name: 'about.html', path: 'about.html' },
    { type: 'file', name: 'services.html', path: 'services.html' },
    { type: 'file', name: 'contact.html', path: 'contact.html' },
    { 
      type: 'folder', 
      name: 'blog', 
      path: 'blog',
      children: [
        { type: 'file', name: 'index.html', path: 'blog/index.html' },
        { type: 'file', name: 'post1.html', path: 'blog/post1.html' },
      ]
    },
    {
      type: 'folder',
      name: 'assets',
      path: 'assets',
      children: [
        { type: 'folder', name: 'css', path: 'assets/css' },
        { type: 'folder', name: 'js', path: 'assets/js' },
        { type: 'folder', name: 'images', path: 'assets/images' },
      ]
    }
  ];

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
