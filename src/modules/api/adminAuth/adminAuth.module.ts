import router from './adminAuth.routes';

// Define an adminAuthModule object to structure the module
const adminAuthModule = {
  // The controller property holds the router with the defined routes from 'adminAuth.routes.ts'
  controller: router,
};

// Export the module to be used elsewhere in the application
export default adminAuthModule;
