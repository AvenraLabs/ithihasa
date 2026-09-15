import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { sendSuccess } from '../../common/utils/response.js';
import { BusinessRuleError } from '../../common/errors/index.js';
import { cleanupUploadedFile } from '../../common/utils/file-cleanup.js';
import { processAndSaveImage, ImageFolder } from '../../common/utils/image-processor.js';

// Use in-memory buffer storage so raw files are never written directly to disk uncompressed
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB max input
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
    ];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BusinessRuleError('Only image files (JPEG, PNG, WebP, AVIF, SVG) are supported.'));
    }
  },
});

export const uploadRouter = Router();

/**
 * Single Image Upload
 * Automatically compresses, strips EXIF, reorients, and converts to optimized WebP.
 */
uploadRouter.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BusinessRuleError('No file uploaded');
      }

      const folder = (req.query.folder as string) || (req.body.folder as string) || 'products';
      const result = await processAndSaveImage(req.file, folder);

      // If an old image is being replaced, clean it up only if not protected by past orders/reviews
      const previousUrl = (req.query.previousUrl as string) || (req.body.previousUrl as string);
      if (previousUrl) {
        await cleanupUploadedFile(previousUrl);
      }

      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Multiple Images Upload (up to 10 files)
 * Concurrently compresses and saves all files as optimized WebP.
 */
uploadRouter.post(
  '/multiple',
  upload.array('files', 10),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new BusinessRuleError('No files uploaded');
      }

      const folder = (req.query.folder as string) || (req.body.folder as string) || 'products';
      const results = await Promise.all(
        files.map((file) => processAndSaveImage(file, folder))
      );

      sendSuccess(res, results, 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete Image Endpoint (Reference-Safe)
 * Will NEVER delete images referenced in past order records or reviews.
 */
uploadRouter.delete(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const url = (req.query.url as string) || (req.body.url as string);
      if (url) {
        const deleted = await cleanupUploadedFile(url);
        if (!deleted) {
          sendSuccess(
            res,
            {
              success: true,
              preserved: true,
              message: 'Asset is referenced in historical customer transactions and safely retained on server.',
            },
            200
          );
          return;
        }
      }
      sendSuccess(res, { success: true, message: 'File cleaned from server storage' }, 200);
    } catch (error) {
      next(error);
    }
  }
);
