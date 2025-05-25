/**
 * This file contains middleware functions for handling file uploads using the 'multer' library.
 * It defines multiple middleware functions to handle the upload of different types of files such as images, videos, audio, and mixed files.
 *
 * Key functionalities:
 * - `uploadImageFile`: Middleware for uploading a single image file.
 * - `uploadImageFiles`: Middleware for uploading multiple image files (up to 5 images).
 * - `uploadVideoFiles`: Middleware for uploading a single video file.
 * - `uploadAudioFiles`: Middleware for uploading a single audio file.
 * - `uploadMixedFiles`: Middleware for uploading a mix of image, video, and PDF files with set limits for each type.
 */

import { uploadFiles } from './multer'; // Importing the file upload configuration

// Middleware to upload a single image file
export const uploadImageFile = uploadFiles.single('image');

// Middleware to upload multiple image files (up to 5 images)
export const uploadImageFiles = uploadFiles.fields([
  { name: 'images', maxCount: 5 },
]);

// Middleware to upload a single video file
export const uploadVideoFiles = uploadFiles.single('video');

// Middleware to upload a single audio file
export const uploadAudioFiles = uploadFiles.single('audio');

// Middleware to upload multiple files (images, videos, and PDFs) with set limits
export const uploadMixedFiles = uploadFiles.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 },
  { name: 'pdf', maxCount: 1 },
]);
