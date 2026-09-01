import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendSuccess } from '../../common/utils/response.js';
import { BusinessRuleError } from '../../common/errors/index.js';
import { cleanupUploadedFile, cleanupMultipleUploadedFiles } from '../../common/utils/file-cleanup.js';

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folder = (req.query.folder as string) || (req.body.folder as string) || 'products';
    const allowedFolders = ['products', 'storefront', 'banners', 'general'];
    const safeFolder = allowedFolders.includes(folder) ? folder : 'products';

    const targetDir = path.join(process.cwd(), 'uploads', safeFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.webp';
    cb(null, `ithihasa-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BusinessRuleError('Only image files (JPEG, PNG, WebP, AVIF, SVG) are allowed'));
    }
  },
});

export const uploadRouter = Router();

uploadRouter.post('/', upload.single('file'), (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.file) {
      throw new BusinessRuleError('No file uploaded');
    }
    const folder = (req.query.folder as string) || (req.body.folder as string) || 'products';
    const safeFolder = ['products', 'storefront', 'banners', 'general'].includes(folder) ? folder : 'products';
    const fileUrl = `/uploads/${safeFolder}/${req.file.filename}`;

    // If an old image is being replaced, clean it up from disk immediately
    const previousUrl = (req.query.previousUrl as string) || (req.body.previousUrl as string);
    if (previousUrl) {
      cleanupUploadedFile(previousUrl);
    }

    sendSuccess(
      res,
      {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      201
    );
  } catch (error) {
    next(error);
  }
});

uploadRouter.post('/multiple', upload.array('files', 10), (req: Request, res: Response, next: NextFunction): void => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new BusinessRuleError('No files uploaded');
    }
    const folder = (req.query.folder as string) || (req.body.folder as string) || 'products';
    const safeFolder = ['products', 'storefront', 'banners', 'general'].includes(folder) ? folder : 'products';

    const results = files.map((file) => ({
      url: `/uploads/${safeFolder}/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    sendSuccess(res, results, 201);
  } catch (error) {
    next(error);
  }
});

uploadRouter.delete('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const url = (req.query.url as string) || (req.body.url as string);
    if (url) {
      cleanupUploadedFile(url);
    }
    sendSuccess(res, { success: true, message: 'File cleaned from server storage' }, 200);
  } catch (error) {
    next(error);
  }
});
