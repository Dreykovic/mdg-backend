// Import the router from the 'Catalog.routes' file
import router from './conversion.routes';

// Define the 'conversionModule' object which contains the router under the 'controller' key
const conversionModule = {
  controller: router,
};

// Export the 'conversionModule' so it can be used in other parts of the application
export default conversionModule;
