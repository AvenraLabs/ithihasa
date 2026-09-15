import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { BusinessRuleError } from '../errors/index.js';

export type ImageFolder = 'products' | 'storefront' | 'banners' | 'reviews' | 'avatars' | 'general';

interface FolderPreset {
  maxWidth: number;
  maxHeight: number;
  fit: keyof sharp.FitEnum;
  quality: number;
  allowSvg: boolean;
}

const FOLDER_PRESETS: Record<ImageFolder, FolderPreset> = {
  products: {
    maxWidth: 1800,
    maxHeight: 2400,
    fit: 'inside',
    quality: 82,
    allowSvg: false,
  },
  storefront: {
    maxWidth: 2560,
    maxHeight: 1440,
    fit: 'inside',
    quality: 85,
    allowSvg: true,
  },
  banners: {
    maxWidth: 2560,
    maxHeight: 1440,
    fit: 'inside',
    quality: 85,
    allowSvg: true,
  },
  reviews: {
    maxWidth: 1200,
    maxHeight: 1200,
    fit: 'inside',
    quality: 80,
    allowSvg: false,
  },
  avatars: {
    maxWidth: 512,
    maxHeight: 512,
    fit: 'cover',
    quality: 85,
    allowSvg: false,
  },
  general: {
    maxWidth: 1600,
    maxHeight: 1600,
    fit: 'inside',
    quality: 82,
    allowSvg: false,
  },
};

export interface ProcessedImageResult {
  url: string;
  filename: string;
  originalName: string;
  format: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: string;
}

/**
 * Validates, compresses, strips EXIF, reorients, and saves uploaded images as optimized WebP.
 */
export async function processAndSaveImage(
  file: Express.Multer.File,
  targetFolder: string = 'products'
): Promise<ProcessedImageResult> {
  if (!file || !file.buffer) {
    throw new BusinessRuleError('No image buffer provided for processing.');
  }

  const folder: ImageFolder = (
    Object.keys(FOLDER_PRESETS).includes(targetFolder) ? targetFolder : 'products'
  ) as ImageFolder;

  const preset = FOLDER_PRESETS[folder];

  // Destination folder on disk
  const uploadDir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Handle SVG if permitted (e.g. vector logos/banners for storefront)
  if (file.mimetype === 'image/svg+xml') {
    if (!preset.allowSvg) {
      throw new BusinessRuleError(`SVG format is not allowed for ${folder} uploads.`);
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `ithihasa-${uniqueSuffix}.svg`;
    const destinationPath = path.join(uploadDir, filename);

    // Save SVG file directly after basic security check
    const svgContent = file.buffer.toString('utf8');
    if (svgContent.includes('<script') || svgContent.includes('javascript:')) {
      throw new BusinessRuleError('SVG file contains unsafe scripts.');
    }

    fs.writeFileSync(destinationPath, file.buffer);

    return {
      url: `/uploads/${folder}/${filename}`,
      filename,
      originalName: file.originalname,
      format: 'svg',
      width: 0,
      height: 0,
      size: file.buffer.length,
      originalSize: file.buffer.length,
      compressionRatio: '0%',
    };
  }

  try {
    // 1. Initialize sharp instance with raw buffer
    const sharpInstance = sharp(file.buffer);

    // 2. Validate image format and retrieve input metadata
    const metadata = await sharpInstance.metadata();
    if (!metadata.format) {
      throw new BusinessRuleError('Corrupted or unsupported image file.');
    }

    // 3. Reorient automatically based on EXIF before stripping metadata
    sharpInstance.rotate();

    // 4. Resize to max bounds while preserving aspect ratio
    sharpInstance.resize({
      width: preset.maxWidth,
      height: preset.maxHeight,
      fit: preset.fit,
      withoutEnlargement: true,
    });

    // 5. Convert to modern, high-efficiency WebP (stripping GPS/camera metadata)
    sharpInstance.webp({
      quality: preset.quality,
      effort: 4, // High compression efficiency without latency
      lossless: false,
    });

    // 6. Process output buffer
    const processedBuffer = await sharpInstance.toBuffer({ resolveWithObject: true });

    // 7. Write to disk
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `ithihasa-${uniqueSuffix}.webp`;
    const destinationPath = path.join(uploadDir, filename);

    fs.writeFileSync(destinationPath, processedBuffer.data);

    const originalSize = file.buffer.length;
    const finalSize = processedBuffer.data.length;
    const savings = Math.max(0, Math.round((1 - finalSize / originalSize) * 100));

    return {
      url: `/uploads/${folder}/${filename}`,
      filename,
      originalName: file.originalname,
      format: 'webp',
      width: processedBuffer.info.width,
      height: processedBuffer.info.height,
      size: finalSize,
      originalSize,
      compressionRatio: `${savings}% reduction`,
    };
  } catch (error: any) {
    if (error instanceof BusinessRuleError) throw error;
    console.error('[Image Processor] Failed to process image:', error);
    throw new BusinessRuleError('Failed to process and compress image. Please upload a valid JPEG, PNG, or WebP photo.');
  }
}
