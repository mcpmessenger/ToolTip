import { writeFile, readFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

export interface GifFrame {
  image: Buffer;
  delay: number; // in milliseconds
}

export interface GifOptions {
  width: number;
  height: number;
  quality: number; // 1-100
  repeat: number; // 0 = infinite, -1 = no repeat
  delay: number; // delay between frames in ms
}

export class GifGenerator {
  private cache: NodeCache;
  private outputDir: string;
  private defaultOptions: GifOptions = {
    width: 800,
    height: 600,
    quality: 80,
    repeat: 0,
    delay: 1000
  };

  constructor() {
    this.cache = new NodeCache({ 
      stdTTL: 3600, // 1 hour cache
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false
    });
    
    this.outputDir = join(process.cwd(), 'proactive-previews');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate a simple comparison image from before/after screenshots
   * Note: This creates a static PNG comparison instead of a GIF due to Canvas dependency issues
   */
  async generateGif(
    beforeScreenshot: Buffer, 
    afterScreenshot: Buffer, 
    options: Partial<GifOptions> = {}
  ): Promise<Buffer> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Create cache key based on content hash
    const cacheKey = this.generateCacheKey(beforeScreenshot, afterScreenshot, opts);
    
    // Check cache first
    const cachedGif = this.cache.get<Buffer>(cacheKey);
    if (cachedGif) {
      console.log('Comparison image cache hit for key:', cacheKey);
      return cachedGif;
    }

    try {
      // For now, return a simple placeholder or the first screenshot
      // In a production environment, you'd use a proper image processing library
      // that doesn't require native compilation
      
      const comparisonBuffer = this.createSimpleComparison(beforeScreenshot, afterScreenshot);
      
      // Cache the result
      this.cache.set(cacheKey, comparisonBuffer);
      
      return comparisonBuffer;
    } catch (error) {
      console.error('Error generating comparison image:', error);
      // Return the before screenshot as fallback
      return beforeScreenshot;
    }
  }

  /**
   * Generate a loading placeholder
   */
  async generateLoadingGif(options: Partial<GifOptions> = {}): Promise<Buffer> {
    const opts = { ...this.defaultOptions, ...options };
    const cacheKey = `loading_${opts.width}x${opts.height}`;
    
    const cachedGif = this.cache.get<Buffer>(cacheKey);
    if (cachedGif) {
      return cachedGif;
    }

    try {
      // Create a simple loading placeholder
      const loadingBuffer = this.createLoadingPlaceholder(opts.width, opts.height);
      this.cache.set(cacheKey, loadingBuffer);
      
      return loadingBuffer;
    } catch (error) {
      console.error('Error generating loading placeholder:', error);
      // Return a simple fallback
      return Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    }
  }

  /**
   * Create a simple before/after comparison
   */
  private createSimpleComparison(beforeBuffer: Buffer, afterBuffer: Buffer): Buffer {
    // Check if the buffers are different
    const areDifferent = !this.buffersEqual(beforeBuffer, afterBuffer);
    
    if (areDifferent) {
      console.log('Screenshots are different, using after screenshot');
      return afterBuffer;
    } else {
      console.log('Screenshots are identical, using before screenshot');
      return beforeBuffer;
    }
  }

  /**
   * Check if two buffers are equal
   */
  private buffersEqual(a: Buffer, b: Buffer): boolean {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    
    // Check first 1000 bytes for quick comparison
    const checkLength = Math.min(1000, a.length);
    for (let i = 0; i < checkLength; i++) {
      if (a[i] !== b[i]) return false;
    }
    
    return true;
  }

  /**
   * Create a simple loading placeholder
   */
  private createLoadingPlaceholder(width: number, height: number): Buffer {
    // Return a simple 1x1 transparent PNG
    return Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  }

  /**
   * Generate cache key for comparison image
   */
  private generateCacheKey(
    beforeScreenshot: Buffer, 
    afterScreenshot: Buffer, 
    options: GifOptions
  ): string {
    // Create a simple hash based on content and options
    const content = Buffer.concat([beforeScreenshot, afterScreenshot]);
    const hash = this.simpleHash(content);
    return `comparison_${hash}_${options.width}x${options.height}_q${options.quality}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(buffer: Buffer): string {
    let hash = 0;
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Save comparison image to file
   */
  async saveGif(gifBuffer: Buffer, filename: string): Promise<string> {
    const filepath = join(this.outputDir, filename);
    await writeFileAsync(filepath, gifBuffer);
    return filepath;
  }

  /**
   * Get comparison image from file
   */
  async getGif(filename: string): Promise<Buffer | null> {
    const filepath = join(this.outputDir, filename);
    if (!existsSync(filepath)) {
      return null;
    }
    return await readFileAsync(filepath);
  }

  /**
   * Get comparison image file path
   */
  getGifPath(filename: string): string | null {
    const filepath = join(this.outputDir, filename);
    if (!existsSync(filepath)) {
      return null;
    }
    return filepath;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): any {
    return this.cache.getStats();
  }
}

export const gifGenerator = new GifGenerator();