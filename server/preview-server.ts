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
const PREVIEW_DIR = path.join(os.tmpdir(), 'web-crawler-previews');

// Ensure preview directory exists
if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
}

/**
 * PreviewServer class handles live previewing of converted React sites
 * It extracts the ZIP file, installs dependencies, and serves the built files
 */
export class PreviewServer {
  private storage: IStorage;
  private converter: ReactConverter;
  private app: express.Express;
  private activeBuilds: Map<string, { process: any, status: string, port?: number }>;
  
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
      console.log(`Preview request: ${req.url}`);
      next();
    });
    
    // Route to manually serve files from the dist directory
    this.app.get('/preview/:id/*', (req, res) => {
      const siteId = req.params.id;
      const siteDir = path.join(PREVIEW_DIR, siteId);
      const distDir = path.join(siteDir, 'dist');
      
      // The part of the URL after /preview/:id/
      // Handle wildcard route param - using req.path instead to avoid TypeScript errors
      const pathAfterIdMatch = req.path.match(/^\/preview\/\d+\/(.*)$/);
      const filePath = pathAfterIdMatch ? pathAfterIdMatch[1] : 'index.html';
      const fullPath = path.join(distDir, filePath);
      
      console.log(`Manual preview request for site ${siteId}, file: ${filePath}`);
      console.log(`Full path: ${fullPath}, exists: ${fs.existsSync(fullPath)}`);
      
      // Check if the file exists
      if (fs.existsSync(fullPath)) {
        // Determine MIME type based on extension
        let contentType = 'text/plain';
        const ext = path.extname(fullPath).toLowerCase();
        
        switch (ext) {
          case '.html': contentType = 'text/html'; break;
          case '.js': contentType = 'text/javascript'; break;
          case '.css': contentType = 'text/css'; break;
          case '.json': contentType = 'application/json'; break;
          case '.png': contentType = 'image/png'; break;
          case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
          case '.gif': contentType = 'image/gif'; break;
          case '.svg': contentType = 'image/svg+xml'; break;
        }
        
        // Set the content type
        res.setHeader('Content-Type', contentType);
        
        // Send the file
        console.log(`Serving file: ${fullPath} with content type: ${contentType}`);
        return fs.createReadStream(fullPath).pipe(res);
      } else {
        // If the file doesn't exist but the dist directory does, try serving index.html
        if (fs.existsSync(distDir) && !filePath.includes('.')) {
          const indexPath = path.join(distDir, 'index.html');
          if (fs.existsSync(indexPath)) {
            console.log(`File not found, serving index.html instead: ${indexPath}`);
            res.setHeader('Content-Type', 'text/html');
            return fs.createReadStream(indexPath).pipe(res);
          }
        }
        
        // File not found
        console.log(`File not found: ${fullPath}`);
        return res.status(404).send('File not found');
      }
    });
    
    // Fallback route for the root of a preview site
    this.app.get('/preview/:id', (req, res) => {
      const siteId = req.params.id;
      const siteDir = path.join(PREVIEW_DIR, siteId);
      const distDir = path.join(siteDir, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      
      console.log(`Preview request for site ${siteId} root`);
      console.log(`Checking index file: ${indexPath}, exists: ${fs.existsSync(indexPath)}`);
      
      // Check if the index file exists
      if (fs.existsSync(indexPath)) {
        console.log(`Serving index file: ${indexPath}`);
        res.setHeader('Content-Type', 'text/html');
        return fs.createReadStream(indexPath).pipe(res);
      } else {
        console.log(`Index file not found for site ${siteId}`);
        return res.status(404).send('Site preview not available yet. Please build the site first.');
      }
    });
    
    // Serve static files for each preview site - build files
    this.app.use('/preview-build/:id', (req, res, next) => {
      const siteId = req.params.id;
      const siteDir = path.join(PREVIEW_DIR, siteId);
      
      console.log(`Preview build files request for site ${siteId}, path: ${req.path}`);
      console.log(`Serving static files from ${siteDir}`);
      
      express.static(siteDir)(req, res, next);
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
   * Get the build status for a site
   */
  getBuildStatus(siteId: string): string {
    const build = this.activeBuilds.get(siteId);
    return build ? build.status : 'not_started';
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
        throw new Error(`Site directory ${siteDir} not found. Please extract the site first.`);
      }
      
      // Install dependencies
      console.log(`Installing dependencies for site ${siteId}...`);
      
      try {
        await execAsync('npm install', { cwd: siteDir, timeout: 300000 }); // 5 minute timeout
      } catch (error: any) {
        console.error(`Error installing dependencies for site ${siteId}:`, error);
        this.activeBuilds.set(siteId, { process: null, status: 'failed', port: undefined });
        throw new Error(`Failed to install dependencies: ${error.message}`);
      }
      
      // Build the site
      console.log(`Building site ${siteId}...`);
      
      try {
        // Check if package.json has a build script
        const packageJsonPath = path.join(siteDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          console.log(`Package.json scripts:`, packageJson.scripts);
          
          if (!packageJson.scripts || !packageJson.scripts.build) {
            console.log(`Adding build script to package.json`);
            if (!packageJson.scripts) {
              packageJson.scripts = {};
            }
            packageJson.scripts.build = 'vite build';
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          }
        } else {
          console.error(`Package.json not found at ${packageJsonPath}`);
        }
        
        // Run build
        const { stdout, stderr } = await execAsync('npm run build', { cwd: siteDir, timeout: 300000 }); // 5 minute timeout
        console.log(`Build output for site ${siteId}:`);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      } catch (error: any) {
        console.error(`Error building site ${siteId}:`, error);
        console.log(`Build command stderr: ${error.stderr}`);
        console.log(`Build command stdout: ${error.stdout}`);
        this.activeBuilds.set(siteId, { process: null, status: 'failed', port: undefined });
        throw new Error(`Failed to build site: ${error.message}`);
      }
      
      // Check if the build was successful
      const distDir = path.join(siteDir, 'dist');
      if (!fs.existsSync(distDir)) {
        console.error(`Dist directory not found at ${distDir} after build`);
        // List files in the site directory
        console.log(`Files in site directory for ${siteId}:`);
        fs.readdirSync(siteDir).forEach(file => {
          console.log(`- ${file}`);
        });
        
        this.activeBuilds.set(siteId, { process: null, status: 'failed', port: undefined });
        throw new Error('Build completed but no dist directory was created');
      } else {
        console.log(`Dist directory created for site ${siteId}`);
        // List files in the dist directory
        console.log(`Files in dist directory for ${siteId}:`);
        fs.readdirSync(distDir).forEach(file => {
          console.log(`- ${file}`);
        });
      }
      
      // Mark as complete
      this.activeBuilds.set(siteId, { process: null, status: 'complete', port: undefined });
      
      console.log(`Site ${siteId} built successfully`);
    } catch (error) {
      console.error(`Error building site ${siteId}:`, error);
      this.activeBuilds.set(siteId, { process: null, status: 'failed', port: undefined });
      throw error;
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