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
    // Serve static files for each preview site
    this.app.use('/preview/:id', (req, res, next) => {
      const siteId = req.params.id;
      const siteDir = path.join(PREVIEW_DIR, siteId);
      
      // Check if site build is available
      if (fs.existsSync(path.join(siteDir, 'dist'))) {
        return express.static(path.join(siteDir, 'dist'))(req, res, next);
      } else {
        return res.status(404).send('Site preview not available yet. Please build the site first.');
      }
    });
    
    // Serve static files for each preview site - build files
    this.app.use('/preview-build/:id', (req, res, next) => {
      const siteId = req.params.id;
      const siteDir = path.join(PREVIEW_DIR, siteId);
      
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
      return `http://${host}/preview/${siteId}/index.html`;
    }
    
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
        await execAsync('npm run build', { cwd: siteDir, timeout: 300000 }); // 5 minute timeout
      } catch (error: any) {
        console.error(`Error building site ${siteId}:`, error);
        this.activeBuilds.set(siteId, { process: null, status: 'failed', port: undefined });
        throw new Error(`Failed to build site: ${error.message}`);
      }
      
      // Check if the build was successful
      if (!fs.existsSync(path.join(siteDir, 'dist'))) {
        this.activeBuilds.set(siteId, { process: null, status: 'failed', port: undefined });
        throw new Error('Build completed but no dist directory was created');
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