import router from './files.routes';

// Define an filesModule object to structure the module
const filesModule = {
  // The controller property holds the router with the defined routes from 'adminAuth.routes.ts'
  controller: router,
};

// Export the module to be used elsewhere in the application
export default filesModule;
