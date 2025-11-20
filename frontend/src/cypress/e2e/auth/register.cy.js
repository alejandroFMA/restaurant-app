describe("Register Page", () => {
  beforeEach(() => {
    cy.clearAuthState();
  });

  it("should register successfully with valid credentials", () => {
    cy.visit("/register");
    cy.contains("Register", { timeout: 10000 }).should("be.visible");

    cy.get('input[type="username"], input[placeholder*="Username" i]', {
      timeout: 10000,
    })
      .should("be.visible")
      .type("testuser");
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
    cy.get('input[type="first_name"], input[placeholder*="First Name" i]', {
      timeout: 10000,
    })
      .should("be.visible")
      .type("Test");
    cy.get('input[type="last_name"], input[placeholder*="Last Name" i]', {
      timeout: 10000,
    })
      .should("be.visible")
      .type("User");
    cy.get('button[type="submit"]', { timeout: 10000 })
      .should("be.visible")
      .click();
    cy.wait("@register", { timeout: 10000 });
    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("should show email validation feedback", () => {
    cy.visit("/register");
    cy.contains("Register", { timeout: 10000 }).should("be.visible");

    cy.get('input[type="email"]', { timeout: 10000 })
      .should("be.visible")
      .type("invalid-email");

    cy.get('input[type="email"]').should("have.class", "border-red-500");
    cy.contains("Valid email format").should("be.visible");
    cy.contains("Valid email format").should("have.class", "text-gray-500");

    cy.get('input[type="email"]').clear().type("valid@example.com");
    cy.get('input[type="email"]').should("have.class", "border-green-500");
    cy.contains("Valid email format").should("have.class", "text-green-600");
  });

  it("should show password validation feedback", () => {
    cy.visit("/register");
    cy.contains("Register", { timeout: 10000 }).should("be.visible");

    cy.get('input[type="password"]', { timeout: 10000 })
      .should("be.visible")
      .type("short");

    cy.get('input[type="password"]').should("have.class", "border-red-500");
    cy.contains("At least 8 characters").should("have.class", "text-gray-500");
    cy.contains("Contains a number").should("have.class", "text-gray-500");
    cy.contains("Contains a special character").should(
      "have.class",
      "text-gray-500"
    );

    cy.get('input[type="password"]').clear().type("password!");
    cy.contains("At least 8 characters").should("have.class", "text-green-600");
    cy.contains("Contains a number").should("have.class", "text-gray-500");
    cy.contains("Contains a special character").should(
      "have.class",
      "text-green-600"
    );

    cy.get('input[type="password"]').clear().type("password1");
    cy.contains("At least 8 characters").should("have.class", "text-green-600");
    cy.contains("Contains a number").should("have.class", "text-green-600");
    cy.contains("Contains a special character").should(
      "have.class",
      "text-gray-500"
    );

    cy.get('input[type="password"]').clear().type("password123!");
    cy.get('input[type="password"]').should("have.class", "border-green-500");
    cy.contains("At least 8 characters").should("have.class", "text-green-600");
    cy.contains("Contains a number").should("have.class", "text-green-600");
    cy.contains("Contains a special character").should(
      "have.class",
      "text-green-600"
    );
  });
});
