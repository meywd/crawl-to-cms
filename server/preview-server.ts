import express from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { IStorage } from './storage';
import { ReactConverter } from './react-converter';
import JSZip from 'jszip';
import os from 'os';

const execAsync = promisify(exec);

// Directory to store extracted sites for preview
// Use a directory in the project root for better persistence and debugging
const PREVIEW_DIR = path.join(process.cwd(), 'preview-sites');

// Ensure preview directory exists
if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  console.log(`Created preview directory at ${PREVIEW_DIR}`);
}

/**
 * PreviewServer class handles live previewing of converted React sites
 * It extracts the ZIP file, installs dependencies, and serves the built files
 */
export class PreviewServer {
  private storage: IStorage;
  private converter: ReactConverter;
  private app: express.Express;
  private activeBuilds: Map<string, { 
    process: any, 
    status: string, 
    port?: number,
    error?: string
  }>;
  
  constructor(storage: IStorage) {
    this.storage = storage;
    this.converter = new ReactConverter(storage);
    this.app = express();
    this.activeBuilds = new Map();
    
    // Initialize the app
    this.setupRoutes();
  }
  
  /**
   * Setup Express routes for the preview server
   */
  private setupRoutes() {
    // Debug middleware to log all preview requests
    this.app.use('/preview', (req, res, next) => {
      console.log(`Preview request: ${req.method} ${req.url}`);
      next();
    });
    
    // Improved static file middleware for previews
    this.app.use('/preview/:id', (req, res, next) => {
      const siteId = req.params.id;
      const siteDir = path.join(PREVIEW_DIR, siteId);
      const distDir = path.join(siteDir, 'dist');
      
      // Check if the dist directory exists
      if (!fs.existsSync(distDir)) {
        console.log(`Dist directory not found for site ${siteId}`);
        return res.status(404).send('Site preview not available yet. Please build the site first.');
      }
      
      // Custom static file server
      const serveStaticFile = (filePath: string) => {
        console.log(`Serving static file: ${filePath}`);
        
        // Check if the file exists
        if (fs.existsSync(filePath)) {
          // Determine MIME type based on extension
          let contentType = 'text/plain';
          const ext = path.extname(filePath).toLowerCase();
          
          switch (ext) {
            case '.html': contentType = 'text/html'; break;
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
            case '.gif': contentType = 'image/gif'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
            case '.woff': contentType = 'font/woff'; break;
            case '.woff2': contentType = 'font/woff2'; break;
            case '.ttf': contentType = 'font/ttf'; break;
            case '.eot': contentType = 'application/vnd.ms-fontobject'; break;
            case '.otf': contentType = 'font/otf'; break;
            case '.ico': contentType = 'image/x-icon'; break;
          }
          
          // Set the content type and cache headers
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
          
          // Send the file
          return fs.createReadStream(filePath).pipe(res);
        }
        
        return false;
      };
      
      // Root path handling (/preview/:id)
      if (req.path === `/preview/${siteId}` || req.path === `/preview/${siteId}/`) {
        const indexPath = path.join(distDir, 'index.html');
        console.log(`Root preview request for site ${siteId}, checking index at ${indexPath}`);
        
        if (serveStaticFile(indexPath)) {
          return;
        }
        
        console.log(`Index file not found for site ${siteId}`);
        return res.status(404).send('Site preview index file not found.');
      }
      
      // Subpath handling (/preview/:id/*)
      const urlPath = req.path.substring(`/preview/${siteId}`.length) || '/';
      const normalizedPath = urlPath === '/' ? '/index.html' : urlPath;
      const filePath = path.join(distDir, normalizedPath);
      
      console.log(`Subpath preview request for site ${siteId}, path: ${normalizedPath}`);
      
      // Try to serve the exact file
      if (serveStaticFile(filePath)) {
        return;
      }
      
      // If it's likely a route path (no file extension), try serving index.html
      if (!path.extname(filePath)) {
        const indexPath = path.join(distDir, 'index.html');
        console.log(`File not found, trying SPA fallback to index.html: ${indexPath}`);
        
        if (serveStaticFile(indexPath)) {
          return;
        }
      }
      
      // File not found
      console.log(`File not found: ${filePath}`);
      return res.status(404).send('File not found');
    });
    
    // Assets route for direct access to static files
    this.app.use('/preview-assets/:id', (req, res, next) => {
      const siteId = req.params.id;
      const siteDir = path.join(PREVIEW_DIR, siteId);
      const distDir = path.join(siteDir, 'dist');
      
      console.log(`Preview assets request for site ${siteId}, path: ${req.path}`);
      
      // Use express.static middleware for the dist directory
      express.static(distDir, {
        maxAge: '1h', // Cache for an hour
        index: false, // Don't automatically serve index.html
        etag: true,
        lastModified: true
      })(req, res, next);
    });
  }
  
  /**
   * Get the Express app instance
   */
  getApp(): express.Express {
    return this.app;
  }
  
  /**
   * Extract a converted site to the preview directory
   */
  async extractSite(convertedSiteId: number): Promise<string> {
    const convertedSite = await this.storage.getConvertedSite(convertedSiteId);
    
    if (!convertedSite) {
      throw new Error(`Converted site with ID ${convertedSiteId} not found`);
    }
    
    // Generate a unique directory name for this site
    const siteDir = path.join(PREVIEW_DIR, convertedSiteId.toString());
    
    // Clean up any existing directory
    if (fs.existsSync(siteDir)) {
      await this.cleanupDirectory(siteDir);
    }
    
    // Create the directory
    fs.mkdirSync(siteDir, { recursive: true });
    
    // Get the ZIP file from the converter
    const zip = await this.converter.convertToReact(convertedSite.crawlId);
    
    // Extract the ZIP to the directory
    console.log(`Extracting site ${convertedSiteId} to ${siteDir}`);
    await this.extractZip(zip, siteDir);
    
    return siteDir;
  }
  
  /**
   * Extract a ZIP file to a directory
   */
  private async extractZip(zip: JSZip, destDir: string): Promise<void> {
    const promises: Promise<void>[] = [];
    
    // Extract each file
    zip.forEach((relativePath, file) => {
      if (file.dir) {
        // Create directory
        const dirPath = path.join(destDir, relativePath);
        fs.mkdirSync(dirPath, { recursive: true });
      } else {
        // Extract file
        promises.push(
          file.async('nodebuffer').then(content => {
            const filePath = path.join(destDir, relativePath);
            const fileDir = path.dirname(filePath);
            
            // Ensure the directory exists
            fs.mkdirSync(fileDir, { recursive: true });
            
            // Write the file
            fs.writeFileSync(filePath, content);
          })
        );
      }
    });
    
    // Wait for all files to be written
    await Promise.all(promises);
  }
  
  /**
   * Recursively clean up a directory
   */
  private async cleanupDirectory(dir: string): Promise<void> {
    if (fs.existsSync(dir)) {
      for (const file of fs.readdirSync(dir)) {
        const curPath = path.join(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // Recurse
          await this.cleanupDirectory(curPath);
        } else {
          // Delete file
          fs.unlinkSync(curPath);
        }
      }
      fs.rmdirSync(dir);
    }
  }
  
  /**
   * Get the build status and error for a site
   */
  getBuildStatus(siteId: string): { status: string, error?: string } {
    const build = this.activeBuilds.get(siteId);
    if (!build) {
      return { status: 'not_started' };
    }
    return { 
      status: build.status,
      error: build.error
    };
  }
  
  /**
   * Get the preview URL for a site
   */
  getPreviewUrl(siteId: string, req: express.Request): string | null {
    const build = this.activeBuilds.get(siteId);
    
    if (build && build.status === 'complete') {
      // Use the host from the original request
      const host = req.headers.host || 'localhost:3000';
      const previewUrl = `http://${host}/preview/${siteId}`;
      console.log(`Preview URL for site ${siteId}: ${previewUrl}`);
      
      // Check if the directory exists
      const siteDir = path.join(PREVIEW_DIR, siteId);
      const distDir = path.join(siteDir, 'dist');
      console.log(`Checking if dist directory exists: ${distDir}, exists: ${fs.existsSync(distDir)}`);
      
      if (fs.existsSync(distDir)) {
        const indexFile = path.join(distDir, 'index.html');
        console.log(`Checking if index.html exists: ${indexFile}, exists: ${fs.existsSync(indexFile)}`);
        
        if (fs.existsSync(indexFile)) {
          return previewUrl;
        }
      }
      
      console.log(`Dist directory or index.html not found for site ${siteId}`);
      return null;
    }
    
    console.log(`No preview URL available for site ${siteId}, build status: ${build?.status || 'no build'}`);
    return null;
  }
  
  /**
   * Build a site and prepare it for preview
   */
  async buildSite(siteId: string): Promise<void> {
    console.log(`Building site ${siteId}...`);
    
    // Check if there's already a build in progress
    if (this.activeBuilds.has(siteId) && 
        this.activeBuilds.get(siteId)?.status === 'building') {
      return;
    }
    
    // Mark as building
    this.activeBuilds.set(siteId, { process: null, status: 'building' });
    
    try {
      const siteDir = path.join(PREVIEW_DIR, siteId);
      
      // Ensure the site directory exists
      if (!fs.existsSync(siteDir)) {
        console.error(`Site directory ${siteDir} not found. Please extract the site first.`);
        this.activeBuilds.set(siteId, { 
          process: null, 
          status: 'failed', 
          port: undefined,
          error: `Site directory not found. Please extract the site first.`
        });
        return; // Return instead of throwing to prevent catching in the parent try-catch
      }
      
      // List files in the site directory
      console.log(`Files in site directory for ${siteId} before build process:`);
      try {
        fs.readdirSync(siteDir).forEach(file => {
          console.log(`- ${file}`);
          // Check if the file is a directory
          const filePath = path.join(siteDir, file);
          if (fs.statSync(filePath).isDirectory()) {
            // List files in directory (for better debugging)
            console.log(`  Files in ${file}:`);
            try {
              fs.readdirSync(filePath).forEach(subFile => {
                console.log(`  - ${subFile}`);
              });
            } catch (err) {
              console.error(`  Error reading directory ${file}:`, err);
            }
          }
        });
      } catch (err) {
        console.error(`Error listing files in site directory:`, err);
      }
      
      // Install dependencies
      console.log(`Installing dependencies for site ${siteId}...`);
      
      try {
        const { stdout: npmInstallStdout, stderr: npmInstallStderr } = 
          await execAsync('npm install', { cwd: siteDir, timeout: 300000 }); // 5 minute timeout
        console.log(`npm install stdout: ${npmInstallStdout}`);
        console.log(`npm install stderr: ${npmInstallStderr}`);
      } catch (error: any) {
        console.error(`Error installing dependencies for site ${siteId}:`, error);
        console.log(`npm install stderr: ${error.stderr || "No stderr"}`);
        console.log(`npm install stdout: ${error.stdout || "No stdout"}`);
        this.activeBuilds.set(siteId, { 
          process: null, 
          status: 'failed', 
          port: undefined,
          error: `Failed to install dependencies: ${error.message}` 
        });
        return; // Return instead of throwing to prevent catching in the parent try-catch
      }
      
      // Build the site
      console.log(`Building site ${siteId}...`);
      
      // Check if package.json has a build script
      const packageJsonPath = path.join(siteDir, 'package.json');
      let packageJson: any = null;
      
      if (fs.existsSync(packageJsonPath)) {
        try {
          packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          console.log(`Package.json content:`, JSON.stringify(packageJson, null, 2));
          
          if (!packageJson.scripts || !packageJson.scripts.build) {
            console.log(`Adding build script to package.json`);
            if (!packageJson.scripts) {
              packageJson.scripts = {};
            }
            packageJson.scripts.build = 'vite build';
            // Also add a dev script in case build refers to it
            if (!packageJson.scripts.dev) {
              packageJson.scripts.dev = 'vite';
            }
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log(`Updated package.json:`, JSON.stringify(packageJson, null, 2));
          }
        } catch (error) {
          console.error(`Error parsing or updating package.json:`, error);
          this.activeBuilds.set(siteId, { 
            process: null, 
            status: 'failed', 
            port: undefined,
            error: `Error parsing package.json: ${error.message}` 
          });
          return;
        }
      } else {
        console.error(`Package.json not found at ${packageJsonPath}`);
        this.activeBuilds.set(siteId, { 
          process: null, 
          status: 'failed', 
          port: undefined,
          error: `Package.json not found. Unable to build the site.` 
        });
        return;
      }
      
      // Run build
      try {
        const { stdout, stderr } = await execAsync('npm run build', { cwd: siteDir, timeout: 300000 }); // 5 minute timeout
        console.log(`Build output for site ${siteId}:`);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      } catch (error: any) {
        console.error(`Error building site ${siteId}:`, error);
        console.log(`Build command stderr: ${error.stderr || 'No stderr'}`);
        console.log(`Build command stdout: ${error.stdout || 'No stdout'}`);
        
        // Try to provide more detailed error information
        let errorMessage = `Failed to build site: ${error.message}`;
        if (error.stderr && error.stderr.includes('command not found')) {
          errorMessage = `Build failed: The required build tools were not found. Please check package.json configuration.`;
        } else if (error.stderr && error.stderr.includes('ERR_MODULE_NOT_FOUND')) {
          errorMessage = `Build failed: A required module was not found. Please check project dependencies.`;
        }
        
        this.activeBuilds.set(siteId, { 
          process: null, 
          status: 'failed', 
          port: undefined,
          error: errorMessage
        });
        return;
      }
      
      // Check if the build was successful
      const distDir = path.join(siteDir, 'dist');
      if (!fs.existsSync(distDir)) {
        console.error(`Dist directory not found at ${distDir} after build`);
        // List files in the site directory
        console.log(`Files in site directory for ${siteId} after build attempt:`);
        try {
          fs.readdirSync(siteDir).forEach(file => {
            console.log(`- ${file}`);
          });
        } catch (err) {
          console.error(`Error listing files after build:`, err);
        }
        
        this.activeBuilds.set(siteId, { 
          process: null, 
          status: 'failed', 
          port: undefined,
          error: 'Build completed but no dist directory was created. Check package.json configuration.'
        });
        return;
      } else {
        console.log(`Dist directory created for site ${siteId}`);
        // List files in the dist directory
        console.log(`Files in dist directory for ${siteId}:`);
        try {
          fs.readdirSync(distDir).forEach(file => {
            console.log(`- ${file}`);
          });
        } catch (err) {
          console.error(`Error listing files in dist directory:`, err);
        }
      }
      
      // Mark as complete
      this.activeBuilds.set(siteId, { process: null, status: 'complete', port: undefined });
      
      console.log(`Site ${siteId} built successfully`);
    } catch (error) {
      console.error(`Error building site ${siteId}:`, error);
      this.activeBuilds.set(siteId, { 
        process: null, 
        status: 'failed', 
        port: undefined,
        error: `Unexpected error: ${error.message || 'Unknown error'}`
      });
    }
  }
}

// Create a singleton instance
let previewServerInstance: PreviewServer | null = null;

export function getPreviewServer(storage: IStorage): PreviewServer {
  if (!previewServerInstance) {
    previewServerInstance = new PreviewServer(storage);
  }
  return previewServerInstance;
}