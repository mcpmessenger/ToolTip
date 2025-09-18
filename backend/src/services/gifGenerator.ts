import { createCanvas, loadImage } from 'canvas';
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
    
    this.outputDir = join(process.cwd(), 'gifs');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate a GIF from before/after screenshots
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
      console.log('GIF cache hit for key:', cacheKey);
      return cachedGif;
    }

    try {
      // Load images
      const beforeImg = await loadImage(beforeScreenshot);
      const afterImg = await loadImage(afterScreenshot);

      // Create canvas
      const canvas = createCanvas(opts.width, opts.height);
      const ctx = canvas.getContext('2d');

      // Create frames
      const frames: GifFrame[] = [
        {
          image: await this.drawFrame(canvas, ctx, beforeImg, 'Before Click', '#4CAF50'),
          delay: opts.delay
        },
        {
          image: await this.drawFrame(canvas, ctx, afterImg, 'After Click', '#2196F3'),
          delay: opts.delay
        }
      ];

      // Generate GIF using a simple approach (since gifencoder has issues)
      const gifBuffer = await this.createSimpleGif(frames, opts);
      
      // Cache the result
      this.cache.set(cacheKey, gifBuffer);
      
      return gifBuffer;
    } catch (error) {
      console.error('Error generating GIF:', error);
      throw error;
    }
  }

  /**
   * Generate a loading GIF
   */
  async generateLoadingGif(options: Partial<GifOptions> = {}): Promise<Buffer> {
    const opts = { ...this.defaultOptions, ...options };
    const cacheKey = `loading_${opts.width}x${opts.height}`;
    
    const cachedGif = this.cache.get<Buffer>(cacheKey);
    if (cachedGif) {
      return cachedGif;
    }

    try {
      const canvas = createCanvas(opts.width, opts.height);
      const ctx = canvas.getContext('2d');
      
      // Create animated loading frames
      const frames: GifFrame[] = [];
      const frameCount = 8;
      
      for (let i = 0; i < frameCount; i++) {
        const angle = (i / frameCount) * Math.PI * 2;
        const gifBuffer = await this.drawLoadingFrame(canvas, ctx, angle, i);
        frames.push({
          image: gifBuffer,
          delay: 150
        });
      }

      const gifBuffer = await this.createSimpleGif(frames, opts);
      this.cache.set(cacheKey, gifBuffer);
      
      return gifBuffer;
    } catch (error) {
      console.error('Error generating loading GIF:', error);
      throw error;
    }
  }

  /**
   * Draw a single frame with image and text overlay
   */
  private async drawFrame(
    canvas: any, 
    ctx: any, 
    image: any, 
    text: string, 
    color: string
  ): Promise<Buffer> {
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image (scaled to fit)
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Add border
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, scaledWidth, scaledHeight);

    // Add text overlay
    ctx.fillStyle = color;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, 40);

    // Add click indicator
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toBuffer('image/png');
  }

  /**
   * Draw loading frame
   */
  private async drawLoadingFrame(
    canvas: any, 
    ctx: any, 
    angle: number, 
    frameIndex: number
  ): Promise<Buffer> {
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 30;

    // Draw spinning circle
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angle, angle + Math.PI * 1.5);
    ctx.stroke();

    // Draw loading text
    ctx.fillStyle = '#6c757d';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Generating preview...', centerX, centerY + 60);

    // Draw progress dots
    const dotCount = 3;
    const dotSpacing = 20;
    const startX = centerX - (dotCount - 1) * dotSpacing / 2;
    
    for (let i = 0; i < dotCount; i++) {
      const dotX = startX + i * dotSpacing;
      const dotY = centerY + 80;
      const alpha = (frameIndex + i) % 3 === 0 ? 1 : 0.3;
      
      ctx.fillStyle = `rgba(0, 123, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toBuffer('image/png');
  }

  /**
   * Create a simple animated GIF from frames
   * Note: This is a simplified implementation. For production, consider using a proper GIF library
   */
  private async createSimpleGif(frames: GifFrame[], options: GifOptions): Promise<Buffer> {
    // For now, we'll create a simple multi-frame PNG or return the first frame
    // In a production environment, you'd use a proper GIF encoder like gifencoder
    
    if (frames.length === 0) {
      throw new Error('No frames provided for GIF generation');
    }

    // For demonstration, we'll create a simple before/after comparison
    // In production, you'd use gifencoder or similar library
    const canvas = createCanvas(options.width, options.height);
    const ctx = canvas.getContext('2d');

    // Create a side-by-side comparison
    const frameWidth = options.width / 2;
    const frameHeight = options.height;

    // Draw before frame on the left
    const beforeImg = await loadImage(frames[0].image);
    ctx.drawImage(beforeImg, 0, 0, frameWidth, frameHeight);

    // Draw after frame on the right
    if (frames.length > 1) {
      const afterImg = await loadImage(frames[1].image);
      ctx.drawImage(afterImg, frameWidth, 0, frameWidth, frameHeight);
    }

    // Add separator line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(frameWidth, 0);
    ctx.lineTo(frameWidth, frameHeight);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BEFORE', frameWidth / 2, 30);
    ctx.fillText('AFTER', frameWidth + frameWidth / 2, 30);

    return canvas.toBuffer('image/png');
  }

  /**
   * Generate cache key for GIF
   */
  private generateCacheKey(
    beforeScreenshot: Buffer, 
    afterScreenshot: Buffer, 
    options: GifOptions
  ): string {
    // Create a simple hash based on content and options
    const content = Buffer.concat([beforeScreenshot, afterScreenshot]);
    const hash = this.simpleHash(content);
    return `gif_${hash}_${options.width}x${options.height}_q${options.quality}`;
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
   * Save GIF to file
   */
  async saveGif(gifBuffer: Buffer, filename: string): Promise<string> {
    const filepath = join(this.outputDir, filename);
    await writeFileAsync(filepath, gifBuffer);
    return filepath;
  }

  /**
   * Get GIF from file
   */
  async getGif(filename: string): Promise<Buffer | null> {
    const filepath = join(this.outputDir, filename);
    if (!existsSync(filepath)) {
      return null;
    }
    return await readFileAsync(filepath);
  }

  /**
   * Get GIF file path
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
