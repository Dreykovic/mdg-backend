import { UserLogin } from '@/core/types';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Request, Response } from 'express';
import { Service } from 'typedi';
import AdminAuthService from '@/services/auth/auth_service';
import {
  Controller,
  Delete,
  Get,
  Post,
  UseMiddlewares,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import { ValidateRequest } from '@/core/decorators/validation.dacorator';
import { AdminAuthSchemas } from '@/api/validators/auth/admin.validator';
@Service()
@Controller('/admin') // Niveau controller
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  /**
   * Handles the admin sign-in process.
   *
   * @param {Request} req - The HTTP request object containing the login data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with a token payload if authentication is successful.
   */
  @Post('/sign-in')
  @ValidateRequest({
    body: AdminAuthSchemas.signIn,
  })
  @ControllerErrorHandler('Sign In failed.')
  async signIn(req: Request, res: Response): Promise<void> {
    logger.debug('Sign In Request Received');

    const data: UserLogin = req.body;

    const payload = await this.adminAuthService.signIn(
      data,
      (req as any).clientInfo
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Refreshes the admin authentication token.
   *
   * @param {Request} req - The HTTP request object containing the current token in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with a new token payload if successful.
   */
  @Post('/refresh')
  @ValidateRequest({
    body: AdminAuthSchemas.refreshToken,
  })
  @ControllerErrorHandler('Token refresh failed.')
  async refresh(req: Request, res: Response): Promise<void> {
    logger.debug('Refresh Token Request Received');

    const data: { token: string } = req.body;

    const payload = await this.adminAuthService.refreshToken(data.token);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Logs the admin out by invalidating the provided token.
   *
   * @param {Request} req - The HTTP request object containing the token in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the token is successfully invalidated.
   */
  @Delete('/sign-out')
  @UseMiddlewares('auth', 'rbac:ADMIN')
  @ControllerErrorHandler('Logout failed.')
  @ValidateRequest({
    body: AdminAuthSchemas.logout,
  })
  async logout(req: Request, res: Response): Promise<void> {
    logger.debug('Logout Request Received');

    const data: { token: string } = req.body;

    const payload = await this.adminAuthService.logout(data.token);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Logs the admin out from all devices by invalidating all tokens for the user.
   *
   * @param {Request} req - The HTTP request object containing the user ID in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when all tokens are successfully invalidated.
   */
  @Delete('/close-all-sessions')
  @UseMiddlewares('auth', 'rbac:ADMIN')
  @ControllerErrorHandler('Logout from all devices failed.')
  @ValidateRequest({
    body: AdminAuthSchemas.logoutAll,
  })
  async logoutAll(req: Request, res: Response): Promise<void> {
    logger.debug('Logout All Request Received');

    const data: { userId: string } = req.body;

    const payload = await this.adminAuthService.logoutAll(data.userId);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
  @Get('/all-active-sessions')
  @UseMiddlewares('auth', 'rbac:ADMIN')
  @ControllerErrorHandler('Get All active Sessions failed.')
  async getActiveSessions(req: Request, res: Response): Promise<void> {
    logger.debug('Gat All Active Sessions Request Received');

    const userId = (req as any).user.id;

    const payload = await this.adminAuthService.getActiveSessions(userId);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
