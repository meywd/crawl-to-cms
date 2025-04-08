import { IStorage } from './storage_new';
import { Asset, Crawl, Page } from '@shared/schema';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';

/**
 * Utility class to convert crawled HTML/CSS/JS into a functioning React application
 */
export class ReactConverter {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Converts a crawled site into a React application
   * @param crawlId The ID of the crawl to convert
   */
  async convertToReact(crawlId: number): Promise<JSZip> {
    console.log(`Converting crawl ID ${crawlId} to React application`);
    
    // Get crawl data
    const crawl = await this.storage.getCrawl(crawlId);
    if (!crawl) {
      throw new Error(`Crawl with ID ${crawlId} not found`);
    }
    
    // Get pages
    const pages = await this.storage.getPagesByCrawlId(crawlId);
    if (pages.length === 0) {
      throw new Error(`No pages found for crawl ID ${crawlId}`);
    }
    
    // Get assets
    const assets = await this.storage.getAssetsByCrawlId(crawlId);
    
    // Create a new ZIP file for the React project - JSZip() is a factory function, not a constructor
    const zip = JSZip();
    
    // Add project structure files
    await this.addReactProjectFiles(zip, crawl, pages, assets);
    
    return zip;
  }
  
  /**
   * Creates the basic React project structure including package.json, etc.
   */
  private async addReactProjectFiles(
    zip: JSZip, 
    crawl: Crawl, 
    pages: Page[],
    assets: Asset[]
  ): Promise<void> {
    // Get a normalized site name from the URL
    const siteName = this.getSiteNameFromUrl(crawl.url);
    
    // Main project files
    zip.file("package.json", this.generatePackageJson(siteName));
    zip.file("tsconfig.json", this.generateTsConfig());
    zip.file("vite.config.ts", this.generateViteConfig());
    zip.file("index.html", this.generateIndexHtml(siteName));
    zip.file("README.md", this.generateReadme(siteName, crawl.url));
    
    // Create source structure
    const srcFolder = zip.folder("src")!;
    srcFolder.file("main.tsx", this.generateMainTsx());
    srcFolder.file("App.tsx", this.generateAppTsx(pages));
    srcFolder.file("index.css", this.generateIndexCss());
    
    // Create components folder
    const componentsFolder = srcFolder.folder("components")!;
    
    // Create pages folder
    const pagesFolder = srcFolder.folder("pages")!;
    
    // Create routes file
    srcFolder.file("routes.tsx", this.generateRoutes(pages));
    
    // Convert HTML pages to React components
    const processedPageNames = await this.convertPagesToComponents(pages, pagesFolder, assets, crawl.id);
    
    // Add common components
    await this.generateCommonComponents(componentsFolder, processedPageNames);
    
    // Create assets folder and add assets
    const assetsFolder = srcFolder.folder("assets")!;
    
    // Filter and process assets
    await this.processAssets(assets, assetsFolder);
  }
  
  /**
   * Converts HTML pages to React components
   */
  private async convertPagesToComponents(
    pages: Page[], 
    pagesFolder: JSZip, 
    assets: Asset[],
    crawlId: number
  ): Promise<Set<string>> {
    const processedPageNames = new Set<string>();
    
    for (const page of pages) {
      try {
        const pageName = this.getPageComponentName(page.path);
        processedPageNames.add(pageName);
        
        const $ = cheerio.load(page.content);
        
        // Extract the content from body
        const bodyContent = $('body').html() || '';
        
        // Extract title
        const title = $('title').text() || pageName;
        
        // Extract styles
        const styles: string[] = [];
        $('style').each((i, el) => {
          styles.push($(el).html() || '');
        });
        
        // Rewrite image srcs to use local assets
        $('img').each((i, el) => {
          const src = $(el).attr('src');
          if (src && src.startsWith(`/api/assets/${crawlId}/`)) {
            const newSrc = src.replace(`/api/assets/${crawlId}/assets/`, './assets/');
            $(el).attr('src', `{require("${newSrc}")}`);
          }
        });
        
        // Generate the component
        const componentContent = this.generateReactComponent(pageName, title, bodyContent, styles);
        
        // Add the component to the zip
        pagesFolder.file(`${pageName}.tsx`, componentContent);
      } catch (error) {
        console.error(`Error converting page ${page.path} to React component:`, error);
        // Continue with other pages
      }
    }
    
    return processedPageNames;
  }
  
  /**
   * Process assets for the React project
   */
  private async processAssets(assets: Asset[], assetsFolder: JSZip): Promise<void> {
    // Group assets by type
    const imageAssets = assets.filter(a => a.type === 'image');
    const cssAssets = assets.filter(a => a.type === 'css');
    const jsAssets = assets.filter(a => a.type === 'js');
    
    // Process images
    for (const asset of imageAssets) {
      try {
        if (!asset.content) continue;
        
        const fileName = asset.path.split('/').pop() || 'image';
        assetsFolder.file(`images/${fileName}`, asset.content, { base64: true });
      } catch (error) {
        console.error(`Error processing image asset ${asset.path}:`, error);
      }
    }
    
    // Process CSS
    const cssFolder = assetsFolder.folder("styles")!;
    for (const asset of cssAssets) {
      try {
        if (!asset.content) continue;
        
        const fileName = asset.path.split('/').pop() || 'style.css';
        cssFolder.file(fileName, asset.content);
      } catch (error) {
        console.error(`Error processing CSS asset ${asset.path}:`, error);
      }
    }
    
    // Process JS
    const jsFolder = assetsFolder.folder("scripts")!;
    for (const asset of jsAssets) {
      try {
        if (!asset.content) continue;
        
        const fileName = asset.path.split('/').pop() || 'script.js';
        jsFolder.file(fileName, asset.content);
      } catch (error) {
        console.error(`Error processing JS asset ${asset.path}:`, error);
      }
    }
  }
  
  /**
   * Generate common components like Header, Footer, etc.
   */
  private async generateCommonComponents(componentsFolder: JSZip, pageNames: Set<string>): Promise<void> {
    // Generate Layout component
    componentsFolder.file("Layout.tsx", `import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
`);
    
    // Generate Header component
    componentsFolder.file("Header.tsx", `import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <h1 className="site-title">Converted React Site</h1>
      </div>
    </header>
  );
}
`);
    
    // Generate Navigation component
    let navigationItems = '';
    // Convert Set to Array to avoid iteration issues
    Array.from(pageNames).forEach(pageName => {
      const linkText = pageName.replace(/([A-Z])/g, ' $1').trim();
      const linkPath = pageName === 'Home' ? '/' : `/${pageName.toLowerCase()}`;
      navigationItems += `        <li><Link to="${linkPath}">${linkText}</Link></li>\n`;
    });
    
    componentsFolder.file("Navigation.tsx", `import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="site-navigation">
      <div className="container">
        <ul className="nav-menu">
${navigationItems}
        </ul>
      </div>
    </nav>
  );
}
`);
    
    // Generate Footer component
    componentsFolder.file("Footer.tsx", `import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>© ${new Date().getFullYear()} React Converted Site. All rights reserved.</p>
        <p>Created with Website Crawler</p>
      </div>
    </footer>
  );
}
`);
  }
  
  /**
   * Generates a React component from HTML content
   */
  private generateReactComponent(pageName: string, title: string, bodyContent: string, styles: string[]): string {
    // Transform attributes to React format
    const reactContent = bodyContent
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=');
    
    // Build the CSS from all styles
    const cssStyles = styles.join('\n\n');
    const hasStyles = cssStyles.trim().length > 0;
    
    return `import React from 'react';
import { Helmet } from 'react-helmet-async';
${hasStyles ? `
// Page-specific styles
const styles = \`
${cssStyles}
\`;
` : ''}

export default function ${pageName}() {
  return (
    <div className="page ${pageName.toLowerCase()}-page">
      <Helmet>
        <title>${title}</title>
        ${hasStyles ? '<style type="text/css">{styles}</style>' : ''}
      </Helmet>
      <div className="content-wrapper">
        <div dangerouslySetInnerHTML={{ __html: \`${reactContent.replace(/`/g, '\\`')}\` }} />
      </div>
    </div>
  );
}
`;
  }
  
  /**
   * Generates the main routes file
   */
  private generateRoutes(pages: Page[]): string {
    // Collect pages and create route entries
    const imports: string[] = [];
    const routes: string[] = [];
    
    for (const page of pages) {
      const pageName = this.getPageComponentName(page.path);
      
      // Add import
      imports.push(`import ${pageName} from './pages/${pageName}';`);
      
      // Generate route path
      let routePath = '';
      if (page.path.includes('index.html') || page.path === '/') {
        routePath = pageName === 'Home' ? '/' : `/${pageName.toLowerCase()}`;
      } else {
        // Create path from filename
        const pathParts = page.path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const baseName = fileName.replace('.html', '');
        routePath = `/${baseName.toLowerCase()}`;
      }
      
      // Add route
      routes.push(`    { path: '${routePath}', element: <${pageName} /> },`);
    }
    
    return `import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
${imports.join('\n')}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
${routes.join('\n')}
    ],
  },
];
`;
  }
  
  /**
   * Generate package.json for the React project
   */
  private generatePackageJson(siteName: string): string {
    return `{
  "name": "${siteName}-react",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-helmet-async": "^1.3.0",
    "react-router-dom": "^6.8.1"
  },
  "devDependencies": {
    "@types/node": "^18.13.0",
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    "typescript": "^4.9.3",
    "vite": "^4.1.0"
  }
}`;
  }
  
  /**
   * Generate tsconfig.json for the React project
   */
  private generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/assets/*": ["./src/assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
  }
  
  /**
   * Generate vite.config.ts for the React project
   */
  private generateViteConfig(): string {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});`;
  }
  
  /**
   * Generate index.html for the React project
   */
  private generateIndexHtml(siteName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${siteName} - React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }
  
  /**
   * Generate main.tsx for the React project
   */
  private generateMainTsx(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import './index.css';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
);`;
  }
  
  /**
   * Generate App.tsx for the React project
   */
  private generateAppTsx(pages: Page[]): string {
    // Find the homepage
    const homepage = pages.find(page => 
      page.path === 'index.html' || 
      page.path === '/' || 
      page.path.endsWith('/index.html')
    );
    
    const pageTitle = homepage ? 
      this.extractTitle(homepage.content) : 
      'Converted React Site';
    
    return `import React from 'react';
import { Helmet } from 'react-helmet-async';

function App() {
  return (
    <div className="app">
      <Helmet>
        <title>${pageTitle}</title>
        <meta name="description" content="Converted website using Web Crawler" />
      </Helmet>
      <div className="content">
        <h1>Welcome to the Converted React Site</h1>
        <p>This site was automatically generated from a crawled website.</p>
      </div>
    </div>
  );
}

export default App;`;
  }
  
  /**
   * Generate index.css for the React project
   */
  private generateIndexCss(): string {
    return `/* Global styles for the React app */
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

/* Layout styles */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Header styles */
.site-header {
  background-color: #1a1a1a;
  color: white;
  padding: 1rem;
}

.site-title {
  margin: 0;
  font-size: 1.5rem;
}

/* Navigation styles */
.site-navigation {
  background-color: #2a2a2a;
  padding: 0.5rem 1rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-menu a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Footer styles */
.site-footer {
  background-color: #1a1a1a;
  color: white;
  padding: 1rem;
  text-align: center;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Page styles */
.page {
  padding: 1rem 0;
}

.content-wrapper {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nav-menu {
    flex-direction: column;
  }
}`;
  }
  
  /**
   * Generate README.md for the project
   */
  private generateReadme(siteName: string, originalUrl: string): string {
    return `# ${siteName} React Application

This React application was automatically generated from the website at [${originalUrl}](${originalUrl}) using the Web Crawler tool.

## Getting Started

### Prerequisites

- Node.js v16 or later
- npm or yarn

### Installation

1. Install dependencies:
\`\`\`bash
npm install
# or
yarn
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Building for Production

To create a production build:

\`\`\`bash
npm run build
# or
yarn build
\`\`\`

The build artifacts will be stored in the \`dist/\` directory.

## Project Structure

- \`src/components/\`: Reusable UI components
- \`src/pages/\`: Page components based on original website pages
- \`src/assets/\`: Static assets from the original website
- \`src/routes.tsx\`: Routing configuration

## Technologies Used

- React
- TypeScript
- React Router
- React Helmet (for managing document head)
- Vite (for building and development)

## Notes

This is an automatically generated project and may require additional fine-tuning for optimal performance.

## License

This project is provided as-is, with no warranties or guarantees.
`;
  }
  
  /**
   * Extract the title from HTML content
   */
  private extractTitle(html: string): string {
    try {
      const $ = cheerio.load(html);
      return $('title').text() || 'Converted React Site';
    } catch (error) {
      return 'Converted React Site';
    }
  }
  
  /**
   * Convert a page path to a valid React component name
   */
  private getPageComponentName(pathStr: string): string {
    // Default for homepage
    if (pathStr === '/' || pathStr === 'index.html' || pathStr.endsWith('/index.html')) {
      return 'Home';
    }
    
    // Get the filename without extension
    const fileName = path.basename(pathStr, '.html');
    
    // Convert to PascalCase
    const componentName = fileName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    // Make sure the name is a valid component name
    return componentName || 'Page';
  }
  
  /**
   * Utility method to get a valid filename from a URL
   */
  private getSiteNameFromUrl(url: string): string {
    // Remove protocol and trailing slashes
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    
    // Replace invalid characters
    const safeName = cleanUrl.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Make sure it's not too long
    return safeName.substring(0, 50);
  }
}