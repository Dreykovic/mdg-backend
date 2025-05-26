/**
 * Middleware to detect and extract client information from the incoming request.
 * It gathers information such as IP address, user agent, language, and device details,
 * and attaches it to the request object for further use in the application.
 *
 * The middleware uses the 'node-device-detector' library to analyze the user-agent
 * and detect the device type, operating system, and client details.
 */

import { NextFunction, Request, Response } from 'express';
import DeviceDetector from 'node-device-detector';
import logger from '../core/utils/logger.util';
import { ClientInfo } from '../core/types';

export const clientInfoMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1️⃣ Extract client information from request headers
    const ipAddress =
      req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';
    const acceptLang = req.headers['accept-language'] ?? 'unknown';

    // 2️⃣ Detect device details using the 'node-device-detector' library
    const detector = new DeviceDetector();
    const detectionResult = detector.detect(userAgent);

    // 3️⃣ Create a 'data' object with the 'ClientInfo' type
    const data: ClientInfo = {
      ipAddress: Array.isArray(ipAddress)
        ? (ipAddress[0] as string)
        : ipAddress,
      userAgent,
      acceptLang,

      deviceType: detectionResult.device?.type || 'unknown',
      deviceBrand: detectionResult.device?.brand || 'unknown',
      deviceModel: detectionResult.device?.model || 'unknown',
      osName: detectionResult.os?.name || 'unknown',
      osVersion: detectionResult.os?.version || 'unknown',
      clientName: detectionResult.client?.name || 'unknown',
      clientType: detectionResult.client?.type || 'unknown',
      clientVersion: detectionResult.client?.version || 'unknown',
    };

    // Optionally log the detected client information (useful for debugging)
    // log('Client info detected:', data);

    // Attach the client information to the request object (be sure to type 'req' correctly)
    (req as any).clientInfo = data;

    // 4️⃣ Proceed to the next middleware
    next();
  } catch (error) {
    handleClientInfoError(req, next, error);
  }
};

function handleClientInfoError(
  req: Request,
  next: NextFunction,
  error: unknown
): void {
  logger.error('Error while detecting client information:', error);
  const data: ClientInfo = {
    ipAddress: 'unknown',
    userAgent: 'unknown',
    acceptLang: 'unknown',

    deviceType: 'unknown',
    deviceBrand: 'unknown',
    deviceModel: 'unknown',
    osName: 'unknown',
    osVersion: 'unknown',
    clientName: 'unknown',
    clientType: 'unknown',
    clientVersion: 'unknown',
  };
  (req as any).clientInfo = data;

  // Continue with the request even if there is an error
  next();
}
