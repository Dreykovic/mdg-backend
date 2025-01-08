/**
 * This file handles the file upload configuration using the 'multer' library in the application.
 * It defines the storage options, file filtering logic, and shared upload configuration.
 *
 * Key functionalities:
 * - Configures disk storage for file uploads, ensuring files are saved in the correct directory
 *   with a unique name to avoid conflicts.
 * - Ensures that the target directory exists or creates it if necessary.
 * - Filters files based on their MIME type to only allow specific file types (images, PDFs, videos, and audio).
 * - Sets the file size limit to prevent excessively large files from being uploaded.
 *
 * This setup ensures secure and organized file uploads, allowing only allowed file types and sizes.
 */

import multer from 'multer'; // Importing the 'multer' library for handling file uploads
import path from 'path'; // Importing the 'path' module for handling file paths
import appRootPath from 'app-root-path'; // Importing the root path of the application
import { Request } from 'express'; // Importing the 'Request' type from Express
import { ensureDirectoryExists } from '@/core/utils/fileSystem.util'; // Importing a utility function to ensure the directory exists
import { LIMIT_FILE_SIZE, MIME_TYPES } from '@/config/multer.config'; // Importing the file size limit and allowed MIME types
import { IMAGE_DIRECTORY_PREFIX } from '@/core/constants/images'; // Importing the image directory prefix

// Configuring the file storage options for Multer
export const storage = multer.diskStorage({
  // Setting the destination for the uploaded files
  destination: async (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    try {
      const folderName = req.params.folderName;
      if (!folderName) {
        return cb(new Error('Folder name is missing in the request'), '');
      }

      const filesDirPath = appRootPath.resolve(
        `${IMAGE_DIRECTORY_PREFIX}${folderName}`
      );

      // Ensuring the directory exists before saving files
      await ensureDirectoryExists(filesDirPath);
      cb(null, filesDirPath);
    } catch (error) {
      cb(
        new Error(`Error setting storage path: ${(error as Error).message}`),
        ''
      );
    }
  },
  // Setting the filename for the uploaded files
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      if (!fileExtension) {
        return cb(new Error('Unable to determine file extension'), '');
      }
      cb(null, uniqueSuffix + fileExtension);
    } catch (error) {
      cb(new Error(`Error setting file name: ${(error as Error).message}`), '');
    }
  },
});

// File filtering function to check allowed file types (used in all upload middlewares)
export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    // Allow files with MIME types that match the allowed types
    if (MIME_TYPES.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true); // Accept the file
    } else {
      cb(
        new Error(
          `Unsupported file type. Only image, PDF, video, and audio files are allowed.`
        )
      );
    }
  } catch (error) {
    cb(new Error(`Error checking file type: ${(error as Error).message}`));
  }
};

// Shared Multer configuration for file uploads
export const uploadFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: LIMIT_FILE_SIZE, // Setting the file size limit
  },
});
