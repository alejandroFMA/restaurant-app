describe("Login Page", () => {
  beforeEach(() => {
    cy.clearAuthState();
  });

  it("should login successfully with valid credentials", () => {
    cy.visit("/login");
    cy.contains("Sign in", { timeout: 10000 }).should("be.visible");

    cy.get('input[type="email"], input[placeholder*="Email" i]', {
      timeout: 10000,
    })
      .should("be.visible")
      .type("test@example.com");
    cy.get('input[type="password"], input[placeholder*="Password" i]', {
      timeout: 10000,
    })
      .should("be.visible")
      .type("password123!");
    cy.get('button[type="submit"]', { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.wait("@login", { timeout: 10000 });
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
  });

  it("should show error with invalid credentials", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 401,
      body: { message: "Invalid email or password" },
    }).as("loginError");

    cy.visit("/login");
    cy.contains("Sign in", { timeout: 10000 }).should("be.visible");

    cy.get('input[type="email"], input[placeholder*="Email" i]', {
      timeout: 10000,
    })
      .should("be.visible")
      .type("invalid@example.com");
    cy.get('input[type="password"], input[placeholder*="Password" i]', {
      timeout: 10000,
    })
      .should("be.visible")
      .type("wrongpassword");
    cy.get('button[type="submit"]', { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.get("[data-cy='error-message']", { timeout: 10000 }).should(
      "be.visible"
    );
  });
});
