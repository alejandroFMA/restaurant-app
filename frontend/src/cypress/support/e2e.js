import "./commands";

before(() => {
  cy.request({
    url: "/",
    failOnStatusCode: false,
    timeout: 5000,
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(
        "Development server is not running. Please start it with 'npm run dev'"
      );
    }
  });
});

beforeEach(() => {
  cy.clearAuthState();
  cy.mockAllAPIs();
});
