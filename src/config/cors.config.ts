/**
 * This file defines the configuration for Cross-Origin Resource Sharing (CORS) in the application.
 * CORS is a security feature that allows or restricts resources on a web server to be requested
 * from another domain outside the server's own domain.
 *
 * The settings include:
 * - Defining a list of allowed origins for incoming requests
 * - Configuring which headers and HTTP methods are permitted
 * - Enabling credentials for secure cookie and authentication data sharing
 * - Handling preflight requests with a success status code
 *
 * These configurations ensure secure and controlled access to the application's resources
 * from external domains.
 */
import cors from 'cors'; // Importing the 'cors' library for setting Cross-Origin Resource Sharing (CORS) options
import config from '.'; // Importing the configuration file

// Fetching the list of allowed origins from the configuration file
const allowOrigins = config.cors.allowOrigins;

// Defining the CORS options object
const corsOptions: cors.CorsOptions = {
  // Function to handle the 'origin' check for incoming requests
  origin: (origin, callback) => {
    // Allow requests if the origin is in the allowed list or if there is no origin (e.g., server-to-server calls)
    if (allowOrigins.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by Cors'), false); // Reject the request with an error
    }
  },
  credentials: true, // Allow credentials (e.g., cookies, authorization headers) to be included in requests
  optionsSuccessStatus: 200, // Use HTTP status 200 for successful preflight requests instead of the default 204
  allowedHeaders: ['Content-Type', 'Authorization'], // List of allowed headers in the requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // List of allowed HTTP methods
};

export default corsOptions; // Exporting the CORS options object for use in the application
