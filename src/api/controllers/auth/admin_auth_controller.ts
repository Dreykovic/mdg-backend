import { UserLogin } from '@/core/types';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Request, Response } from 'express';
import { Service } from 'typedi';
import { log } from 'console';
import AdminAuthService from '@/services/auth/auth_service';

@Service()
export default class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  /**
   * Handles the admin sign-in process.
   *
   * @param {Request} req - The HTTP request object containing the login data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with a token payload if authentication is successful.
   */
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      log('Sign In Request Received');

      const data: UserLogin = req.body;

      const payload = await this.adminAuthService.signIn(
        data,
        (req as any).clientInfo
      );

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http401({
        message: (error as Error).message || 'Invalid credentials provided.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  /**
   * Refreshes the admin authentication token.
   *
   * @param {Request} req - The HTTP request object containing the current token in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with a new token payload if successful.
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      log('Refresh Token Request Received');

      const data: { token: string } = req.body;

      const payload = await this.adminAuthService.refreshToken(data.token);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http401({
        message: (error as Error).message || 'Token refresh failed.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  /**
   * Logs the admin out by invalidating the provided token.
   *
   * @param {Request} req - The HTTP request object containing the token in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the token is successfully invalidated.
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      log('Logout Request Received');

      const data: { token: string } = req.body;

      const payload = await this.adminAuthService.logout(data.token);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http401({
        message: (error as Error).message || 'Logout failed.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  /**
   * Logs the admin out from all devices by invalidating all tokens for the user.
   *
   * @param {Request} req - The HTTP request object containing the user ID in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when all tokens are successfully invalidated.
   */
  async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      log('Logout All Request Received');

      const data: { userId: string } = req.body;

      const payload = await this.adminAuthService.logoutAll(data.userId);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http401({
        message: (error as Error).message || 'Logout from all devices failed.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      log('Gat All Active Sessions Request Received');

      const userId = (req as any).user.id;

      const payload = await this.adminAuthService.getActiveSessions(userId);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http401({
        message: (error as Error).message || 'Get All active Sessions failed.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
