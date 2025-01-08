// Import the router from the 'resources.routes' file
import router from './resources.routes';

// Define the 'resourcesModule' object which contains the router under the 'controller' key
const resourcesModule = {
  controller: router,
};

// Export the 'resourcesModule' so it can be used in other parts of the application
export default resourcesModule;
