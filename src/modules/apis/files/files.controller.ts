import path from 'path';
import appRootPath from 'app-root-path';
import { Request, Response } from 'express';
import FilesService from './files.service';
import { IMAGE_DIRECTORY_PREFIX } from '@/core/constants/images';
import ApiResponse from '@/core/utils/apiResponse.util';
import { log } from 'console';
import { Service } from 'typedi';
@Service()
export default class FilesController {
  constructor(private filesService: FilesService) {}

  async getFile(req: Request, res: Response) {
    try {
      log('Files Get Request Received');
      const directoryPath = appRootPath.resolve(
        `${IMAGE_DIRECTORY_PREFIX}${req.params.directory}`
      );

      const filePath = path.join(directoryPath, req.params.fileRef as string);

      // Envoie le fichier et gère l'erreur directement via le callback
      res.sendFile(filePath, (error) => {
        if (error) {
          log('Unexpected error', error);
          const response = ApiResponse.http404({
            message: (error as Error).message || 'Image not found.',
          });
          res.status(response.httpStatusCode).json(response.data);
        }
      });
    } catch (error) {
      log('Unexpected error', error);
      const response = ApiResponse.http404({
        message: (error as Error).message || 'Image not found.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
