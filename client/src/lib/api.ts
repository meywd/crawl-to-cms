import { apiRequest } from "./queryClient";
import { 
  type Crawl, 
  type CrawlOptions, 
  type Page, 
  type SavedSite,
  type ConvertedSite,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type User
} from "@/types";

// Authentication API functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return response.json();
}

export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout", undefined);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest("GET", "/api/auth/me", undefined);
    if (!response) return null;
    return response.json();
  } catch (error) {
    return null;
  }
}

// Crawl API functions
export async function startCrawl(url: string, depth: number, options: CrawlOptions): Promise<Crawl> {
  const response = await apiRequest("POST", "/api/crawl", { url, depth, options });
  return response.json();
}

export async function getCrawlStatus(id: string): Promise<Crawl> {
  const response = await apiRequest("GET", `/api/crawl/${id}`, undefined);
  return response.json();
}

export async function pauseCrawl(id: string): Promise<Crawl> {
  const response = await apiRequest("POST", `/api/crawl/${id}/pause`, undefined);
  return response.json();
}

export async function resumeCrawl(id: string): Promise<Crawl> {
  const response = await apiRequest("POST", `/api/crawl/${id}/resume`, undefined);
  return response.json();
}

export async function cancelCrawl(id: string): Promise<Crawl> {
  const response = await apiRequest("POST", `/api/crawl/${id}/cancel`, undefined);
  return response.json();
}

export async function getCrawlHistory(): Promise<Crawl[]> {
  const response = await apiRequest("GET", "/api/crawl/history", undefined);
  return response.json();
}

export async function deleteCrawlHistory(id: string): Promise<void> {
  try {
    console.log(`[API] Deleting crawl history with ID: ${id}`);
    
    // Check authentication before making request
    const currentUser = await getCurrentUser();
    console.log(`[API] Current authenticated user:`, currentUser);
    
    if (!currentUser) {
      console.error(`[API] User is not authenticated for delete operation`);
      throw new Error("You must be logged in to delete a crawl");
    }
    
    const response = await apiRequest("DELETE", `/api/crawl/history/${id}`, undefined);
    console.log(`[API] Delete crawl response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      console.log(`[API] Successfully deleted crawl with ID: ${id}`);
      return;
    } else {
      // Try to get the error details
      let errorDetails = "Unknown error";
      try {
        const errorJson = await response.json();
        errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } catch (parseError) {
        errorDetails = response.statusText;
      }
      
      console.error(`[API] Server returned error status ${response.status}: ${errorDetails}`);
      throw new Error(`Failed to delete crawl: ${errorDetails}`);
    }
  } catch (error) {
    console.error(`[API] Error deleting crawl with ID ${id}:`, error);
    throw error;
  }
}

// Pages API functions
export async function getPageContent(crawlId: string, path: string): Promise<Page> {
  const response = await apiRequest("GET", `/api/pages/${crawlId}/${path}`, undefined);
  return response.json();
}

export async function getPagesByUrl(url: string): Promise<Page[]> {
  const response = await apiRequest("GET", `/api/pages?url=${encodeURIComponent(url)}`, undefined);
  return response.json();
}

// Saved sites API functions
export async function saveSite(crawlId: string, name?: string): Promise<SavedSite> {
  // Convert crawlId to a number for the server
  const numericCrawlId = parseInt(crawlId, 10);
  if (isNaN(numericCrawlId)) {
    throw new Error("Invalid crawl ID");
  }
  
  const response = await apiRequest("POST", "/api/sites/save", { crawlId: numericCrawlId, name });
  return response.json();
}

export async function getSavedSites(): Promise<SavedSite[]> {
  const response = await apiRequest("GET", "/api/sites/saved", undefined);
  return response.json();
}

export async function deleteSavedSite(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/sites/saved/${id}`, undefined);
}

// File structure API functions
export async function getSiteStructure(crawlId: string): Promise<any> {
  const response = await apiRequest("GET", `/api/structure/${crawlId}`, undefined);
  return response.json();
}

// React conversion API function
export async function convertToReact(id: string): Promise<any> {
  const response = await apiRequest("GET", `/api/sites/convert/${id}?background=true`, undefined);
  return response.json();
}

// Converted sites API functions
export async function getConvertedSites(): Promise<ConvertedSite[]> {
  const response = await apiRequest("GET", "/api/sites/converted", undefined);
  return response.json();
}

export async function deleteConvertedSite(id: string): Promise<void> {
  try {
    console.log(`[API] Deleting converted site with ID: ${id}`);
    
    // Log the request details for debugging
    console.log(`[API] Making DELETE request to: /api/sites/converted/${id}`);
    
    // Check authentication before making request
    const currentUser = await getCurrentUser();
    console.log(`[API] Current authenticated user:`, currentUser);
    
    if (!currentUser) {
      console.error(`[API] User is not authenticated for delete operation`);
      throw new Error("You must be logged in to delete a site");
    }
    
    const response = await apiRequest("DELETE", `/api/sites/converted/${id}`, undefined);
    // Log the response details without attempting to iterate headers
    console.log(`[API] Delete response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      console.log(`[API] Successfully deleted site with ID: ${id}`);
      return;
    } else {
      // Try to get the error details
      let errorDetails = "Unknown error";
      try {
        const errorJson = await response.json();
        errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } catch (parseError) {
        errorDetails = response.statusText;
      }
      
      console.error(`[API] Server returned error status ${response.status}: ${errorDetails}`);
      throw new Error(`Failed to delete site: ${errorDetails}`);
    }
  } catch (error) {
    console.error(`[API] Error deleting converted site with ID ${id}:`, error);
    throw error;
  }
}

export async function downloadConvertedSite(id: string): Promise<void> {
  // Open the download URL in a new tab
  window.open(`/api/sites/download/${id}`, '_blank');
}

export async function previewConvertedSite(id: string): Promise<any> {
  const response = await apiRequest("GET", `/api/sites/preview/${id}`, undefined);
  return response.json();
}

export async function getConvertedSiteFileContent(id: string, path: string): Promise<any> {
  const response = await apiRequest("GET", `/api/sites/preview/${id}/file?path=${encodeURIComponent(path)}`, undefined);
  return response.json();
}

// Live Preview API functions
export async function extractSiteForPreview(id: string): Promise<any> {
  const response = await apiRequest("POST", `/api/sites/live-preview/${id}/extract`, undefined);
  return response.json();
}

export async function buildSiteForPreview(id: string): Promise<any> {
  const response = await apiRequest("POST", `/api/sites/live-preview/${id}/build`, undefined);
  return response.json();
}

export async function getPreviewStatus(id: string): Promise<any> {
  const response = await apiRequest("GET", `/api/sites/live-preview/${id}/status`, undefined);
  return response.json();
}
