import { IStorage } from './storage';
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
  
  // Helper methods for CMS integration
  
  /**
   * Generate the tailwind config file
   */
  private generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
`;
  }

  /**
   * Generate the PostCSS config file
   */
  private generatePostCssConfig(): string {
    return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
  }

  /**
   * Generate .env file
   */
  private generateEnvFile(): string {
    return `# Environment variables
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cms?schema=public"

# JWT
JWT_SECRET=your-secret-key-change-in-production

# TinyMCE Editor (get a free API key from https://www.tiny.cloud/)
VITE_TINYMCE_API_KEY=your-tinymce-api-key
`;
  }

  /**
   * Generate the Prisma schema for the database
   */
  private generatePrismaSchema(siteName: string): string {
    return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  role      String   @default("user") // "admin" or "user"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Language {
  id      Int     @id @default(autoincrement())
  code    String  @unique
  name    String
  isActive Boolean @default(true)
  menuItems MenuItem[]
  pageContents PageContent[]
  sections Section[]
}

model MenuItem {
  id        Int      @id @default(autoincrement())
  languageId Int
  language  Language @relation(fields: [languageId], references: [id])
  title     String
  slug      String
  order     Int
  parentId  Int?
  parent    MenuItem? @relation("MenuItemToMenuItem", fields: [parentId], references: [id])
  children  MenuItem[] @relation("MenuItemToMenuItem")
  isActive  Boolean @default(true)
  page      Page?    @relation(fields: [pageId], references: [id])
  pageId    Int?
  externalUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Page {
  id        Int      @id @default(autoincrement())
  slug      String   @unique
  menuItems MenuItem[]
  contents  PageContent[]
  sections  Section[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PageContent {
  id          Int      @id @default(autoincrement())
  pageId      Int
  page        Page     @relation(fields: [pageId], references: [id])
  languageId  Int
  language    Language @relation(fields: [languageId], references: [id])
  title       String
  description String?
  metaTitle   String?
  metaDescription String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Section {
  id          Int      @id @default(autoincrement())
  pageId      Int
  page        Page     @relation(fields: [pageId], references: [id])
  languageId  Int
  language    Language @relation(fields: [languageId], references: [id])
  type        String   // "hero", "content", "gallery", etc.
  order       Int
  title       String?
  content     String?
  imageUrl    String?
  settings    Json?    // Additional settings as JSON
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Setting {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
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
    zip.file("tailwind.config.js", this.generateTailwindConfig());
    zip.file("postcss.config.js", this.generatePostCssConfig());
    zip.file(".env", this.generateEnvFile());
    
    // Create prisma folder and database schema
    const prismaFolder = zip.folder("prisma")!;
    prismaFolder.file("schema.prisma", this.generatePrismaSchema(siteName));
    prismaFolder.file("seed.ts", this.generatePrismaSeed(pages));
    
    // Create server folder for backend code
    const serverFolder = zip.folder("server")!;
    serverFolder.file("index.ts", this.generateServerIndex());
    serverFolder.file("auth.ts", this.generateServerAuth());
    serverFolder.file("api.ts", this.generateServerApi());
    
    // Create source structure
    const srcFolder = zip.folder("src")!;
    srcFolder.file("main.tsx", this.generateMainTsx());
    srcFolder.file("App.tsx", this.generateAppTsx(pages));
    srcFolder.file("index.css", this.generateIndexCss());
    
    // Create components folder and subfolders
    const componentsFolder = srcFolder.folder("components")!;
    componentsFolder.folder("ui"); // For UI components
    componentsFolder.folder("layout"); // For layout components
    componentsFolder.folder("admin"); // For admin components
    
    // Create pages folder and subfolders
    const pagesFolder = srcFolder.folder("pages")!;
    pagesFolder.folder("admin"); // For admin pages
    
    // Create content pages 
    const publicPagesFolder = pagesFolder.folder("public")!;
    
    // Create context/hooks/utils folders
    srcFolder.folder("context");
    srcFolder.folder("hooks");
    srcFolder.folder("utils");
    
    // Create locales folder for translations
    const localesFolder = srcFolder.folder("locales")!;
    localesFolder.file("en.json", this.generateEnglishTranslations(pages));
    localesFolder.file("es.json", this.generateSpanishTranslations(pages));
    
    // Create TypeScript types folder
    const typesFolder = srcFolder.folder("types")!;
    typesFolder.file("index.ts", this.generateTypeDefinitions());
    
    // Create API helpers
    srcFolder.file("api.ts", this.generateClientApi());
    
    // Create i18n configuration
    srcFolder.file("i18n.ts", this.generateI18nConfig());
    
    // Create routes file
    srcFolder.file("routes.tsx", this.generateRoutes(pages));
    
    // Create admin configuration
    srcFolder.file("admin.tsx", this.generateAdminRoutes(pages));
    
    // Convert HTML pages to React components
    const processedPageNames = await this.convertPagesToComponents(pages, publicPagesFolder, assets, crawl.id);
    
    // Add common components
    await this.generateCommonComponents(componentsFolder.folder("layout")!, processedPageNames);
    
    // Add CMS admin components
    await this.generateAdminComponents(componentsFolder.folder("admin")!, pagesFolder.folder("admin")!);
    
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
  "name": "${siteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cms",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "server": "nodemon --watch 'server/**/*.ts' --exec 'ts-node' server/index.ts",
    "start": "concurrently \\"npm run server\\" \\"npm run dev\\"",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "react-helmet-async": "^1.3.0",
    "@prisma/client": "^5.2.0",
    "i18next": "^23.4.6",
    "react-i18next": "^13.2.0",
    "i18next-browser-languagedetector": "^7.1.0",
    "i18next-http-backend": "^2.2.1",
    "react-hook-form": "^7.45.4",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.2",
    "zustand": "^4.4.1",
    "axios": "^1.5.0",
    "@tanstack/react-query": "^4.33.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.1",
    "@tinymce/tinymce-react": "^4.3.0",
    "tailwindcss": "^3.3.3",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.17.5",
    "@types/react": "^18.2.20",
    "@types/react-dom": "^18.2.7",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/cookie-parser": "^1.4.3",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@vitejs/plugin-react": "^4.0.4",
    "typescript": "^5.1.6",
    "vite": "^4.4.9",
    "prisma": "^5.2.0",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.28",
    "concurrently": "^8.2.1"
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
  
  /**
   * Generate the Prisma seed file to populate initial data
   */
  private generatePrismaSeed(pages: Page[]): string {
    // Extract page titles for initial data
    const pageEntries = pages.map((page, index) => {
      const title = this.extractTitle(page.content) || `Page ${index + 1}`;
      const slug = page.path.replace('.html', '').replace(/^\//, '');
      return { title, slug: slug || 'home' };
    });
    
    // Create JSON with page entries
    const pagesJson = JSON.stringify(pageEntries, null, 2).replace(/^/gm, '  ');
    
    return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default languages
  const english = await prisma.language.create({
    data: {
      code: 'en',
      name: 'English',
      isActive: true,
    },
  });

  const spanish = await prisma.language.create({
    data: {
      code: 'es',
      name: 'Spanish',
      isActive: true,
    },
  });

  // Create Admin user
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // Password is 'password'
      role: 'admin',
    },
  });

  // Create pages from crawled content
  const pages = ${pagesJson};

  for (const page of pages) {
    const newPage = await prisma.page.create({
      data: {
        slug: page.slug,
      },
    });

    // Create English content
    await prisma.pageContent.create({
      data: {
        pageId: newPage.id,
        languageId: english.id,
        title: page.title,
        description: 'Default page description',
        metaTitle: page.title,
        metaDescription: 'Default meta description',
      },
    });

    // Create Spanish content (placeholder)
    await prisma.pageContent.create({
      data: {
        pageId: newPage.id,
        languageId: spanish.id,
        title: \`\${page.title} (ES)\`,
        description: 'Descripción predeterminada de la página',
        metaTitle: \`\${page.title} (ES)\`,
        metaDescription: 'Descripción meta predeterminada',
      },
    });

    // Create default section
    await prisma.section.create({
      data: {
        pageId: newPage.id,
        languageId: english.id,
        type: 'content',
        order: 1,
        title: 'Main Content',
        content: '<p>This is the default content for this page.</p>',
      },
    });

    // Create Spanish section
    await prisma.section.create({
      data: {
        pageId: newPage.id,
        languageId: spanish.id,
        type: 'content',
        order: 1,
        title: 'Contenido Principal',
        content: '<p>Este es el contenido predeterminado para esta página.</p>',
      },
    });

    // Create menu item
    await prisma.menuItem.create({
      data: {
        languageId: english.id,
        title: page.title,
        slug: page.slug,
        order: newPage.id,
        pageId: newPage.id,
        isActive: true,
      },
    });

    // Create Spanish menu item
    await prisma.menuItem.create({
      data: {
        languageId: spanish.id,
        title: \`\${page.title} (ES)\`,
        slug: page.slug,
        order: newPage.id,
        pageId: newPage.id,
        isActive: true,
      },
    });
  }

  // Create site settings
  await prisma.setting.create({
    data: {
      key: 'site_name',
      value: 'CMS Website',
    },
  });

  await prisma.setting.create({
    data: {
      key: 'site_description',
      value: 'A multilingual CMS website created from crawled content',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
  }
  
  /**
   * Generate the server index file
   */
  private generateServerIndex(): string {
    return `import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './auth';
import apiRoutes from './api';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
  }
  
  /**
   * Generate the server authentication file
   */
  private generateServerAuth(): string {
    return `import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check admin role
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user', // Default role
      },
    });
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
`;
  }
  
  /**
   * Generate the server API file
   */
  private generateServerApi(): string {
    return `import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
    });
    return res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/menu?languageCode=en
router.get('/menu', async (req, res) => {
  try {
    const languageCode = req.query.languageCode || 'en';
    
    const language = await prisma.language.findUnique({
      where: { code: languageCode as string },
    });
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    const menuItems = await prisma.menuItem.findMany({
      where: {
        languageId: language.id,
        isActive: true,
        parentId: null, // Only top level items
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        page: true,
      },
      orderBy: { order: 'asc' },
    });
    
    return res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/pages/:slug?languageCode=en
router.get('/pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const languageCode = req.query.languageCode || 'en';
    
    const language = await prisma.language.findUnique({
      where: { code: languageCode as string },
    });
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        contents: {
          where: { languageId: language.id },
        },
        sections: {
          where: { languageId: language.id },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    return res.json(page);
  } catch (error) {
    console.error(\`Error fetching page \${req.params.slug}:\`, error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    
    // Convert array to object with key-value pairs
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    return res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN ROUTES

// GET /api/admin/pages
router.get('/admin/pages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      include: {
        contents: {
          include: {
            language: true,
          },
        },
      },
    });
    return res.json(pages);
  } catch (error) {
    console.error('Error fetching admin pages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// More admin routes omitted for brevity...

export default router;
`;
  }
  
  /**
   * Generate TypeScript type definitions
   */
  private generateTypeDefinitions(): string {
    return `// User types
export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

// Language types
export interface Language {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

// Menu types
export interface MenuItem {
  id: number;
  languageId: number;
  language?: Language;
  title: string;
  slug: string;
  order: number;
  parentId: number | null;
  parent?: MenuItem | null;
  children?: MenuItem[];
  isActive: boolean;
  pageId: number | null;
  page?: Page | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Page types
export interface Page {
  id: number;
  slug: string;
  contents?: PageContent[];
  sections?: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface PageContent {
  id: number;
  pageId: number;
  languageId: number;
  language?: Language;
  title: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: number;
  pageId: number;
  languageId: number;
  language?: Language;
  type: string;
  order: number;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  settings: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

// Settings types
export interface Setting {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
`;
  }

  /**
   * Generate Client API helper
   */
  private generateClientApi(): string {
    return `import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, name: string, password: string) => {
  const response = await api.post('/auth/register', { email, name, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};

// Languages API

export const getLanguages = async () => {
  const response = await api.get('/languages');
  return response.data;
};

// Menu API

export const getMenu = async (languageCode = 'en') => {
  const response = await api.get(\`/menu?languageCode=\${languageCode}\`);
  return response.data;
};

// Pages API

export const getPage = async (slug: string, languageCode = 'en') => {
  const response = await api.get(\`/pages/\${slug}?languageCode=\${languageCode}\`);
  return response.data;
};

// Settings API

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

// Admin API

export const getAdminPages = async () => {
  const response = await api.get('/admin/pages');
  return response.data;
};

export const createPage = async (data: any) => {
  const response = await api.post('/admin/pages', data);
  return response.data;
};

export const updatePage = async (id: number, data: any) => {
  const response = await api.put(\`/admin/pages/\${id}\`, data);
  return response.data;
};

export const deletePage = async (id: number) => {
  const response = await api.delete(\`/admin/pages/\${id}\`);
  return response.data;
};

// More API methods omitted for brevity

export default api;
`;
  }
  
  /**
   * Generate i18n configuration
   */
  private generateI18nConfig(): string {
    return `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    // Static translations
    resources: {
      en: {
        translation: enTranslation
      },
      es: {
        translation: esTranslation
      }
    }
  });

export default i18n;
`;
  }
  
  /**
   * Generate Admin Routes
   */
  private generateAdminRoutes(pages: Page[]): string {
    return `import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import PagesManager from './pages/admin/PagesManager';
import PageEditor from './pages/admin/PageEditor';
import MenuManager from './pages/admin/MenuManager';
import SettingsManager from './pages/admin/SettingsManager';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import NotFound from './pages/admin/NotFound';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin/register',
    element: <Register />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <Dashboard />,
      },
      {
        path: 'pages',
        element: <PagesManager />,
      },
      {
        path: 'pages/create',
        element: <PageEditor />,
      },
      {
        path: 'pages/:id',
        element: <PageEditor />,
      },
      {
        path: 'menu',
        element: <MenuManager />,
      },
      {
        path: 'settings',
        element: <SettingsManager />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
`;
  }
  
  /**
   * Generate English translations
   */
  private generateEnglishTranslations(pages: Page[]): string {
    // Extract page titles for translations
    const pageTitles = pages.reduce((acc, page) => {
      const pageName = this.getPageComponentName(page.path);
      const title = this.extractTitle(page.content) || pageName;
      acc[`page_${pageName.toLowerCase()}`] = title;
      return acc;
    }, {});
    
    const translations = {
      "common": {
        "admin": "Admin",
        "login": "Login",
        "logout": "Logout",
        "register": "Register",
        "dashboard": "Dashboard",
        "settings": "Settings",
        "pages": "Pages",
        "menu": "Menu",
        "content": "Content",
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "create": "Create",
        "name": "Name",
        "email": "Email",
        "password": "Password",
        "title": "Title",
        "description": "Description"
      },
      "pages": {
        ...pageTitles
      }
    };
    
    return JSON.stringify(translations, null, 2);
  }
  
  /**
   * Generate Spanish translations
   */
  private generateSpanishTranslations(pages: Page[]): string {
    // Extract page titles for translations
    const pageTitles = pages.reduce((acc, page) => {
      const pageName = this.getPageComponentName(page.path);
      const title = this.extractTitle(page.content) || pageName;
      acc[`page_${pageName.toLowerCase()}`] = `${title} (ES)`;
      return acc;
    }, {});
    
    const translations = {
      "common": {
        "admin": "Administrador",
        "login": "Iniciar sesión",
        "logout": "Cerrar sesión",
        "register": "Registrarse",
        "dashboard": "Panel de control",
        "settings": "Configuración",
        "pages": "Páginas",
        "menu": "Menú",
        "content": "Contenido",
        "save": "Guardar",
        "cancel": "Cancelar",
        "delete": "Eliminar",
        "edit": "Editar",
        "create": "Crear",
        "name": "Nombre",
        "email": "Correo electrónico",
        "password": "Contraseña",
        "title": "Título",
        "description": "Descripción"
      },
      "pages": {
        ...pageTitles
      }
    };
    
    return JSON.stringify(translations, null, 2);
  }
  
  /**
   * Generate admin components
   */
  private async generateAdminComponents(adminComponentsFolder: JSZip, adminPagesFolder: JSZip): Promise<void> {
    // Admin Layout component
    adminComponentsFolder.file("AdminLayout.tsx", `import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`);

    // Admin Header component
    adminComponentsFolder.file("AdminHeader.tsx", `import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminHeader() {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow h-16 flex items-center px-6">
      <div className="flex flex-1 justify-between items-center">
        <h1 className="text-xl font-semibold">{t('common.admin')}</h1>
      </div>
    </header>
  );
}
`);

    // Admin Dashboard page
    adminPagesFolder.file("Dashboard.tsx", `import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.welcome')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t('common.pages')}</h2>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t('common.menu')}</h2>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t('common.languages')}</h2>
          <p className="text-3xl font-bold text-primary-600">2</p>
        </div>
      </div>
    </div>
  );
}
`);
  }
}