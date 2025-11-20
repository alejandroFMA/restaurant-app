Cypress.Commands.add(
  "setAuthState",
  (user = null, token = "mock-jwt-token-12345") => {
    const defaultUser = user || {
      id: "507f1f77bcf86cd799439011",
      username: "testuser",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      is_admin: false,
    };

    const authState = {
      state: {
        user: defaultUser,
        token: token,
        isAuthenticated: true,
      },
      version: 0,
    };

    cy.window().then((win) => {
      win.localStorage.setItem("auth-storage", JSON.stringify(authState));
    });
  }
);

Cypress.Commands.add(
  "setAdminAuthState",
  (token = "mock-admin-jwt-token-12345") => {
    cy.fixture("users").then((users) => {
      cy.setAuthState(users.adminUser, token);
    });
  }
);

Cypress.Commands.add("clearAuthState", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("auth-storage");
    win.localStorage.removeItem("token");
    win.localStorage.removeItem("user");
  });
});

Cypress.Commands.add("visitAsAuthenticated", (url, user = null) => {
  cy.setAuthState(user);
  cy.visit(url);
});

Cypress.Commands.add("visitAsAdmin", (url) => {
  cy.setAdminAuthState();
  cy.visit(url);
});

Cypress.Commands.add("mockAllAPIs", () => {
  cy.intercept("POST", "**/api/auth/login", (req) => {
    if (req.url.endsWith(".js") || req.url.includes("/src/")) {
      return;
    }
    req.reply({
      statusCode: 200,
      body: {
        message: "Login successful",
        user: {
          _id: "6918f2cbc6f7ceda2da7a47c",
          username: "tester",
          first_name: "Tester",
          last_name: "Tester",
          is_admin: true,
          created_at: "2025-11-15T21:38:19.634Z",
          __v: 0,
        },
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MThmMmNiYzZmN2NlZGEyZGE3YTQ3YyIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE3NjM2NzgwMTcsImV4cCI6MTc2MzY4MTYxN30.OLBtIThu7nwimjjkLSRSKRBCMsOzA6VBzvqFGs7KmIo",
      },
    });
  }).as("login");

  cy.intercept("POST", "**/api/auth/register", {
    statusCode: 201,
    body: {
      message: "User registered successfully",
      user: {
        id: "507f1f77bcf86cd799439011",
        username: "testuser",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        is_admin: false,
      },
    },
  }).as("register");

  cy.fixture("restaurants").then((data) => {
    // Default: name_asc (A-Z) - Already sorted in JSON
    cy.intercept("GET", "**/api/restaurants?sortby=name_asc", {
      statusCode: 200,
      body: [...data.restaurants],
    }).as("getRestaurants");

    // Also intercept default request (no sortby param) as name_asc
    cy.intercept("GET", "**/api/restaurants", (req) => {
      if (req.url.includes("sortby")) return;
      req.reply({
        statusCode: 200,
        body: [...data.restaurants],
      });
    }).as("getRestaurantsDefault");

    // name_desc (Z-A) - Reverse order
    cy.intercept("GET", "**/api/restaurants?sortby=name_desc", {
      statusCode: 200,
      body: [...data.restaurants].reverse(),
    }).as("getRestaurantsNameDesc");

    // average_rating_desc (Highest first)
    cy.intercept("GET", "**/api/restaurants?sortby=average_rating_desc", {
      statusCode: 200,
      body: [...data.restaurants].sort(
        (a, b) => b.average_rating - a.average_rating
      ),
    }).as("getRestaurantsAverageRatingDesc");

    // average_rating_asc (Lowest first)
    cy.intercept("GET", "**/api/restaurants?sortby=average_rating_asc", {
      statusCode: 200,
      body: [...data.restaurants].sort(
        (a, b) => a.average_rating - b.average_rating
      ),
    }).as("getRestaurantsAverageRatingAsc");

    // reviews_count_desc (Highest first)
    cy.intercept("GET", "**/api/restaurants?sortby=reviews_count_desc", {
      statusCode: 200,
      body: [...data.restaurants].sort(
        (a, b) => b.reviews_count - a.reviews_count
      ),
    }).as("getRestaurantsReviewsCountDesc");

    // reviews_count_asc (Lowest first)
    cy.intercept("GET", "**/api/restaurants?sortby=reviews_count_asc", {
      statusCode: 200,
      body: [...data.restaurants].sort(
        (a, b) => a.reviews_count - b.reviews_count
      ),
    }).as("getRestaurantsReviewsCountAsc");

    cy.intercept("GET", "**/api/restaurants/top", {
      statusCode: 200,
      body: [...data.restaurants].slice(0, 3),
    }).as("getTopRestaurants");

    cy.intercept("GET", /\/api\/restaurants\/[^/]+$/, {
      statusCode: 200,
      body: data.restaurantDetail,
    }).as("getRestaurant");
  });

  cy.intercept("POST", "**/api/restaurants", {
    statusCode: 201,
    body: {
      id: "507f1f77bcf86cd799439024",
      name: "New Restaurant",
      address: "New Address",
      cuisine_type: "Mexican",
      neighborhood: "Downtown",
      image: "https://example.com/new.jpg",
      average_rating: 0,
      reviews_count: 0,
    },
  }).as("createRestaurant");

  cy.intercept("PUT", /\/api\/restaurants\/[^/]+$/, {
    statusCode: 200,
    body: {
      id: "507f1f77bcf86cd799439021",
      name: "Updated Restaurant",
    },
  }).as("updateRestaurant");

  cy.intercept("DELETE", /\/api\/restaurants\/[^/]+$/, {
    statusCode: 200,
    body: { message: "Restaurant deleted successfully" },
  }).as("deleteRestaurant");

  cy.fixture("users").then((users) => {
    cy.intercept("GET", "**/api/users", {
      statusCode: 200,
      body: [users.testUser, users.adminUser],
    }).as("getUsers");

    cy.intercept("GET", /\/api\/users\/[^/]+$/, {
      statusCode: 200,
      body: users.testUser,
    }).as("getUser");

    cy.intercept("PUT", /\/api\/users\/[^/]+$/, {
      statusCode: 200,
      body: { ...users.testUser, first_name: "Updated" },
    }).as("updateUser");
  });

  cy.intercept("DELETE", /\/api\/users\/[^/]+$/, {
    statusCode: 200,
    body: { message: "User deleted successfully" },
  }).as("deleteUser");
});
