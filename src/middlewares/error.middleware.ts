/**
 * Error handling middleware to catch and respond to different types of errors.
 * It logs the error details for debugging purposes and sends appropriate HTTP responses
 * based on the error type.
 */

import { NextFunction, Request, Response } from 'express';
import logger from '@/core/utils/logger.util';
import ApiResponse from '@/core/utils/apiResponse.util';

/**
 *  Error handling middleware to catch and respond to different types of errors
 *
 * @param {*} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log the error details for debugging, including the stack trace and request info
  logger.error(`Error occurred: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  // Handle specific error types and send the corresponding HTTP response

  // Validation errors (e.g., invalid input data)
  if (err.name === 'ValidationError') {
    res.status(400).json(
      ApiResponse.http400({
        code: 400,
        error: 'VALIDATION_ERROR',
        message: err.message,
      }).data
    );
  }

  // Unauthorized errors (e.g., invalid JWT or missing authorization)
  if (err.name === 'UnauthorizedError') {
    res.status(401).json(
      ApiResponse.http401({
        code: 401,
        error: 'JWT_AUTHENTICATION_ERROR',
        message: 'Unauthorized. Access denied!',
      }).data
    );
  }

  // JWT token errors (e.g., malformed or expired token)
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(
      ApiResponse.http401({
        code: 401,
        error: 'JWT_AUTHENTICATION_ERROR',
        message: 'JWT token error. Access denied!',
      }).data
    );
  }

  // Token expiration errors (e.g., expired JWT token)
  if (err.name === 'TokenExpiredError') {
    res.status(401).json(
      ApiResponse.http401({
        code: 401,
        error: 'JWT_AUTHENTICATION_ERROR',
        message: 'JWT token expired. Access denied!',
      }).data
    );
  }

  // Not found errors (e.g., resource not found)
  if (err.name === 'NotFound') {
    res.status(404).json(
      ApiResponse.http400({
        code: 404,
        error: 'NOT_FOUND',
        message: 'The requested resource could not be found.',
      }).data
    );
  }

  // Unprocessable entity errors (e.g., request could not be processed)
  if (err.name === 'Unprocessable') {
    res
      .status(422)
      .json(
        ApiResponse.http422(
          null,
          'Unprocessable Entity error. The request could not be processed.'
        ).data
      );
  }

  // Default handler for unclassified errors - server error
  res.status(500).json(
    ApiResponse.http500('Internal Server Error', {
      code: 500,
      error: 'SERVER_ERROR',
      message: err.message,
    }).data
  );
};

export default errorHandler;
