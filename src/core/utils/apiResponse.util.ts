/**
 * ApiResponse.util.ts
 *
 * This class provides a standardized structure for API responses in an application.
 * It defines utility methods for generating HTTP responses with common status codes
 * and includes success, error, and informational messages. The responses are designed
 * to be consistent and easily interpretable by clients.
 *
 * Key features:
 * - Simplifies API response generation with predefined methods for each HTTP status code.
 * - Includes optional `content` for success responses and `error` details for failure responses.
 *
 * Usage example:
 * ```typescript
 * import ApiResponse from './utils/apiResponse.util';
 *
 * // Example in a controller:
 * app.get('/example', (req, res) => {
 *   const data = { key: 'value' };
 *   const response = ApiResponse.http200(data);
 *   res.status(response.httpStatusCode).json(response.data);
 * });
 * ```
 */

// Define the structure of API response data
type ApiResponseData = {
  success: boolean; // Indicates if the request was successful or not
  message: string; // Describes the result of the operation
  content?: any; // Optional data for successful responses
  error?: any; // Optional error details for failed responses
};

export default class ApiResponse {
  // 200 OK: Request succeeded
  static http200(data: any): { httpStatusCode: number; data: ApiResponseData } {
    const params = {
      success: true,
      message: 'Success',
      content: data ?? null,
    };
    return { httpStatusCode: 200, data: params };
  }

  // 201 Created: Resource successfully created
  static http201(data: any): { httpStatusCode: number; data: ApiResponseData } {
    const params = {
      success: true,
      message: 'Successfully created',
      content: data ?? null,
    };
    return { httpStatusCode: 201, data: params };
  }

  // 204 No Content: Request succeeded, but no content to send in response
  static http204(): { httpStatusCode: number; data: ApiResponseData } {
    const params = {
      success: true,
      message: 'No content',
    };
    return { httpStatusCode: 204, data: params };
  }

  // 400 Bad Request: The server cannot process the request due to client error
  static http400(error: any): {
    httpStatusCode: number;
    data: ApiResponseData;
  } {
    const params = {
      success: false,
      message: 'Bad request',
      error: error ?? null,
    };
    return { httpStatusCode: 400, data: params };
  }

  // 401 Unauthorized: Authentication is required or failed
  static http401(error: any): {
    httpStatusCode: number;
    data: ApiResponseData;
  } {
    const params = {
      success: false,
      message: 'Unauthorized access',
      error: error ?? null,
    };
    return { httpStatusCode: 401, data: params };
  }

  // 403 Forbidden: The server understands the request but refuses to authorize it
  static http403(error: any): {
    httpStatusCode: number;
    data: ApiResponseData;
  } {
    const params = {
      success: false,
      message: 'Forbidden',
      error: error ?? null,
    };
    return { httpStatusCode: 403, data: params };
  }

  // 404 Not Found: Resource not found
  static http404(error: any): {
    httpStatusCode: number;
    data: ApiResponseData;
  } {
    const params = {
      success: false,
      message: 'Not found',
      error: error ?? null,
    };
    return { httpStatusCode: 404, data: params };
  }

  // 409 Conflict: Request conflict with current state of the resource
  static http409(error: any): {
    httpStatusCode: number;
    data: ApiResponseData;
  } {
    const params = {
      success: false,
      message: 'Conflict',
      error: error ?? null,
    };
    return { httpStatusCode: 409, data: params };
  }

  // 422 Unprocessable Entity: The server understands the content but cannot process it
  static http422(
    error: any,
    customMsg?: string
  ): { httpStatusCode: number; data: ApiResponseData } {
    const params = {
      success: false,
      message: customMsg ?? 'Unprocessable entity',
      error: error ?? null,
    };
    return { httpStatusCode: 422, data: params };
  }

  // 429 Too Many Requests: Rate limiting
  static http429(error: any): {
    httpStatusCode: number;
    data: ApiResponseData;
  } {
    const params = {
      success: false,
      message: 'Too many requests',
      error: error ?? null,
    };
    return { httpStatusCode: 429, data: params };
  }

  // 500 Internal Server Error: Generic server error
  static http500(
    customMsg: string,
    error: any
  ): { httpStatusCode: number; data: ApiResponseData } {
    const params = {
      success: false,
      message: customMsg || 'Internal server error',
      error: error ?? null,
    };
    return { httpStatusCode: 500, data: params };
  }

  // 503 Service Unavailable: The server is temporarily unable to handle the request
  static http503(error: any): {
    httpStatusCode: number;
    data: ApiResponseData;
  } {
    const params = {
      success: false,
      message: 'Service unavailable',
      error: error ?? null,
    };
    return { httpStatusCode: 503, data: params };
  }
}
