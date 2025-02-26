// Import the router from the 'catalog.routes' file
import router from './catalog.routes';

// Define the 'catalogModule' object which contains the router under the 'controller' key
const catalogModule = {
  controller: router,
};

// Export the 'catalogModule' so it can be used in other parts of the application
export default catalogModule;
