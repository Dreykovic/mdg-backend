/**
 * Utility file for file and directory management.
 *
 * This file contains functions to check the existence of a directory and create it if necessary,
 * as well as to delete a file at a specific path.
 *
 * The provided functions are:
 * - `ensureDirectoryExists`: Checks if a directory exists, otherwise creates it.
 * - `deleteFile`: Deletes a file at a specified path if it exists.
 *
 * Asynchronous functions are used to handle file and directory operations.
 *
 * Dependencies:
 * - `fs`: For file and directory operations in the file system.
 * - `util`: For using `promisify` to convert callback-based functions into promise-returning functions.
 *
 * Usage examples:
 * - `await ensureDirectoryExists('/path/to/directory')` : Creates the directory if necessary.
 * - `deleteFile('/path/to/file.txt')`: Deletes the file at that location if it exists.
 */

import { log } from 'console';
import fs from 'fs';
import { promisify } from 'util';

// Uses promisify to convert fs.mkdir into an asynchronous function returning a promise
const mkdir = promisify(fs.mkdir);

/**
 * Utility function to check if a directory exists, otherwise create it.
 *
 * @param dir - The path of the directory to check and create.
 * @returns Promise<void> - Returns a resolved promise once the directory has been checked or created.
 * @throws Error if creating the directory fails.
 */
export async function ensureDirectoryExists(dir: string): Promise<void> {
  try {
    // Creates the directory recursively if it does not already exist.
    await mkdir(dir, { recursive: true });
  } catch (error) {
    throw new Error(
      `Unable to create the directory: ${dir}. Error: ${(error as Error).message}`
    );
  }
}

/**
 * Function to delete a file at the specified path.
 *
 * @param filePath - The path of the file to delete.
 * @returns void - No value returned.
 * @throws Error if deletion fails.
 */
export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    // Checks if the file exists
    fs.unlink(filePath, (err) => {
      // Deletes the file
      if (err) {
        log('Error while deleting the file');
        throw Error(err.message);
      }
      log(`${filePath} has been deleted`);
    });
  } else {
    log('The file does not exist, deletion skipped');
  }
}
