import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      return config;
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: false,
    specPattern: "src/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "src/cypress/support/e2e.js",
    fixturesFolder: "src/cypress/fixtures",
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
  },
  env: {
    apiUrl: "http://localhost:3000/api",
  },
});
