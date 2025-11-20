describe("Dashboard", () => {
  beforeEach(() => {
    cy.setAuthState();
  });

  it("should display dashboard for authenticated user", () => {
    cy.visit("/dashboard");
    cy.contains("Dashboard").should("be.visible");
  });

  it("should display restaurants list", () => {
    cy.visit("/dashboard");
    cy.wait("@getRestaurants");

    cy.contains("Another Restaurant").should("be.visible");
    cy.contains("Best Pizza Place").should("be.visible");
    cy.contains("Test Restaurant").should("be.visible");
  });

  it("should redirect to login when not authenticated", () => {
    cy.clearAuthState();
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("should filter restaurants by name", () => {
    cy.visit("/dashboard");
    cy.wait("@getRestaurants");

    cy.contains("Another Restaurant").should("be.visible");
    cy.contains("Best Pizza Place").should("be.visible");
    cy.contains("Test Restaurant").should("be.visible");

    cy.get('input[id="search"]').type("Test Restaurant");

    cy.contains("Test Restaurant").should("be.visible");
    cy.contains("Another Restaurant").should("not.exist");
    cy.contains("Best Pizza Place").should("not.exist");

    cy.get('input[id="search"]').clear();
    cy.contains("Another Restaurant").should("be.visible");
    cy.contains("Best Pizza Place").should("be.visible");
    cy.contains("Test Restaurant").should("be.visible");
  });

  it("should sort restaurants by name descending", () => {
    cy.visit("/dashboard");
    cy.wait("@getRestaurants");
    cy.get('select[id="sort-by"]').select("name_desc");
    cy.wait("@getRestaurantsNameDesc");

    cy.contains("Test Restaurant").should("be.visible");
    cy.contains("Best Pizza Place").should("be.visible");
    cy.contains("Another Restaurant").should("be.visible");
  });

  it("should sort restaurants by average rating descending", () => {
    cy.visit("/dashboard");
    cy.get('select[id="sort-by"]').select("average_rating_desc");
    cy.wait("@getRestaurantsAverageRatingDesc");

    cy.contains("Best Pizza Place").should("be.visible");
    cy.contains("Test Restaurant").should("be.visible");
    cy.contains("Another Restaurant").should("be.visible");
  });

  it("should sort restaurants by average rating ascending", () => {
    cy.visit("/dashboard");
    cy.get('select[id="sort-by"]').select("average_rating_asc");
    cy.wait("@getRestaurantsAverageRatingAsc");

    cy.contains("Another Restaurant").should("be.visible");
    cy.contains("Test Restaurant").should("be.visible");
    cy.contains("Best Pizza Place").should("be.visible");
  });
});
