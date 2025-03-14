// Import the router from the 'Catalog.routes' file
import router from './stock.routes';

// Define the 'stockModule' object which contains the router under the 'controller' key
const stockModule = {
  controller: router,
};

// Export the 'stockModule' so it can be used in other parts of the application
export default stockModule;
