import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse as JSON first
    let errorMessage = res.statusText;
    let errorDetails = {};
    
    try {
      // Clone the response to read it twice
      const clonedRes = res.clone();
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Parse as JSON if content type is JSON
        const errorJson = await clonedRes.json();
        errorMessage = errorJson.message || errorJson.error || errorJson.toString();
        errorDetails = errorJson;
      } else {
        // Fallback to text if not JSON
        const text = await clonedRes.text();
        errorMessage = text || res.statusText;
      }
    } catch (e) {
      console.error("Error parsing error response:", e);
      // If JSON parsing fails, fallback to plain text
      try {
        errorMessage = await res.text() || res.statusText;
      } catch (textError) {
        console.error("Error reading text from response:", textError);
        // Keep default errorMessage
      }
    }
    
    // Create a more informative error
    const error = new Error(`${res.status}: ${errorMessage}`);
    (error as any).status = res.status;
    (error as any).statusText = res.statusText;
    (error as any).details = errorDetails;
    
    console.error(`API Error [${res.status}]:`, { 
      url: res.url,
      message: errorMessage,
      details: errorDetails
    });
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
