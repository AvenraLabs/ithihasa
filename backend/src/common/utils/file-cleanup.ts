import fs from 'fs';
import path from 'path';

/**
 * Safely removes an uploaded file from the server's uploads folder
 * @param fileUrl Relative or absolute URL of the image (e.g. '/uploads/products/ithihasa-123.png')
 */
export function cleanupUploadedFile(fileUrl?: string | null): boolean {
  if (!fileUrl || typeof fileUrl !== 'string') return false;

  try {
    // Only delete files inside the /uploads/ directory
    if (!fileUrl.includes('/uploads/')) return false;

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
      console.log(`[File Cleanup] Successfully deleted old upload: ${normalizedTarget}`);
      return true;
    }
  } catch (error) {
    console.warn(`[File Cleanup] Error deleting file (${fileUrl}):`, error);
  }

  return false;
}

/**
 * Cleans up multiple uploaded files from a list of URLs
 */
export function cleanupMultipleUploadedFiles(fileUrls: (string | null | undefined)[]): void {
  if (!Array.isArray(fileUrls)) return;
  fileUrls.forEach((url) => cleanupUploadedFile(url));
}
