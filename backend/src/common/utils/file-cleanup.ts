import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { OrderItem, ProductImage, Review } from '../../database/index.js';

/**
 * Checks whether an uploaded file is referenced by historical order records,
 * customer reviews, or active catalog items.
 *
 * CRITICAL ECOMMERCE RULE:
 * If an image was ever purchased as part of an order, its snapshot is a legal &
 * historical transaction record. It must NEVER be deleted from disk.
 */
export async function isImageProtected(fileUrl?: string | null): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== 'string') return false;

  const basename = path.basename(fileUrl);
  if (!basename) return false;

  try {
    // 1. Order Item Check (Past customer transactions)
    const orderRefCount = await OrderItem.count({
      where: {
        [Op.or]: [
          { image_url: fileUrl },
          { image_url: { [Op.iLike]: `%${basename}%` } },
        ],
      },
    });

    if (orderRefCount > 0) {
      console.log(
        `[Asset Protection] Image ${basename} is PROTECTED. Referenced in ${orderRefCount} order item(s).`
      );
      return true;
    }

    // 2. Verified Review Check
    try {
      const reviewRefCount = await Review.count({
        where: {
          images: { [Op.contains]: [fileUrl] } as any,
        },
      }).catch(() => 0);

      if (reviewRefCount > 0) {
        console.log(
          `[Asset Protection] Image ${basename} is PROTECTED. Referenced in customer review(s).`
        );
        return true;
      }
    } catch {
      // JSON array query fallback
    }

    // 3. Active Product Catalog Check
    const catalogRefCount = await ProductImage.count({
      where: {
        [Op.or]: [
          { url: fileUrl },
          { url: { [Op.iLike]: `%${basename}%` } },
        ],
      },
    });

    if (catalogRefCount > 0) {
      console.log(
        `[Asset Protection] Image ${basename} is in active catalog use across ${catalogRefCount} product(s).`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.warn('[Asset Protection] Error during reference check, defaulting to safe retention:', error);
    // On error, default to safe retention to prevent accidental loss of order images
    return true;
  }
}

/**
 * Safely removes an uploaded file from disk ONLY if it is not referenced
 * in any past customer orders, customer reviews, or catalog products.
 *
 * @param fileUrl Relative or absolute URL of the image (e.g. '/uploads/products/ithihasa-123.webp')
 */
export async function cleanupUploadedFile(fileUrl?: string | null): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== 'string') return false;

  try {
    // Only manage files inside the /uploads/ directory
    if (!fileUrl.includes('/uploads/')) return false;

    // Check if image is protected by past orders or reviews
    const isProtected = await isImageProtected(fileUrl);
    if (isProtected) {
      console.log(`[File Cleanup] Preserved file on disk for order history fidelity: ${fileUrl}`);
      return false;
    }

    // Extract path after /uploads/
    const relativeUploadPath = fileUrl.split('/uploads/')[1];
    if (!relativeUploadPath) return false;

    // Build absolute file system path
    const absolutePath = path.join(process.cwd(), 'uploads', relativeUploadPath);

    // Prevent directory traversal attacks
    const normalizedTarget = path.normalize(absolutePath);
    const normalizedUploadDir = path.normalize(path.join(process.cwd(), 'uploads'));

    if (!normalizedTarget.startsWith(normalizedUploadDir)) {
      console.warn(`[File Cleanup] Security check failed for path: ${absolutePath}`);
      return false;
    }

    if (fs.existsSync(normalizedTarget)) {
      fs.unlinkSync(normalizedTarget);
      console.log(`[File Cleanup] Successfully deleted unreferenced file: ${normalizedTarget}`);
      return true;
    }
  } catch (error) {
    console.warn(`[File Cleanup] Error deleting file (${fileUrl}):`, error);
  }

  return false;
}

/**
 * Cleans up multiple uploaded files, strictly preserving any that are referenced.
 */
export async function cleanupMultipleUploadedFiles(
  fileUrls: (string | null | undefined)[]
): Promise<void> {
  if (!Array.isArray(fileUrls)) return;
  for (const url of fileUrls) {
    await cleanupUploadedFile(url);
  }
}
