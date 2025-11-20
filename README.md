# Restaurant App

A full-stack restaurant review application built with React, Node.js, Express, and MongoDB. Users can browse restaurants, create reviews, manage favorites, and administrators can add new restaurants.

## 🚀 Features

### User Features

- **Authentication**: User registration and login with JWT tokens
- **Restaurant Browsing**: View all restaurants with ratings and review counts
- **Restaurant Search & Filter**: Real-time search by name, neighborhood, address, or cuisine type
- **Restaurant Sorting**: Sort restaurants by name (A-Z, Z-A), average rating (highest/lowest), or review count (highest/lowest)
- **Restaurant Details**: See detailed information including operating hours, cuisine type, and location
- **Reviews**: Create, edit, and delete reviews with star ratings
- **Favorites**: Add and remove restaurants from favorites list
- **User Profile**: View and edit personal information, manage reviews and favorites
- **Error Handling**: Global error handling with toast notifications
- **Loading States**: Skeleton loading components for better UX

### Admin Features

- **Create Restaurants**: Add new restaurants with full details including geocoded addresses
- **Update Restaurants**: Edit existing restaurant information (admin only)
- **Delete Restaurants**: Remove restaurants from the system (admin only)
- **User Management**: View all users and their information
- **Delete Users**: Remove users from the system (admin only)

### Technical Features

- **Protected Routes**: Authentication-based route protection
- **Form Validation**: Client-side validation with Zod and server-side validation with express-validator
- **Real-time Updates**: React Query for efficient data fetching and caching
- **State Management**: Zustand for global authentication and error state
- **Responsive Design**: Modern UI with Tailwind CSS, fully responsive on mobile/tablet/desktop
- **Security**: Helmet for HTTP headers, rate limiting, CORS configuration
- **Error Boundaries**: Error page for non-existent routes (404)
- **Geocoding**: Automatic address to coordinates conversion using Nominatim API

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/alejandroFMA/restaurant-app.git
cd restaurant-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
MONGO_DB_NAME=restaurant_app
JWT_SECRET=your_jwt_secret_key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Running the Application

### Development Mode

#### Backend

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3000`

#### Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Mode

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## 🧪 Running Tests

### Backend Tests

The backend uses Jest for testing. To run tests:

```bash
cd backend
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

### Frontend Tests

The frontend uses Cypress for E2E testing. To run tests:

```bash
cd frontend
npm test
```

To open Cypress in interactive mode:

```bash
npm run test:open
```

### Test Structure

- **Backend Unit Tests**: Located in `backend/tests/unit/`
  - Authentication tests
  - Controller tests (auth, restaurants, reviews, users)
  - Helper tests (encryption, validation, geocoding)
- **Backend Integration Tests**: Located in `backend/tests/integration/`
  - Full route testing with real database (MongoDB Memory Server)
  - Tests for restaurants, reviews, and users routes
- **Frontend E2E Tests**: Located in `frontend/src/cypress/e2e/`
  - Authentication tests (login, register)
  - Dashboard tests (filtering, sorting)

## 📁 Project Structure

```
restaurant-app/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication, validation, error handling
│   ├── repository/       # Data access layer
│   ├── routes/           # API routes
│   ├── schema/           # Mongoose schemas
│   ├── service/          # Business logic
│   ├── tests/            # Test files
│   ├── utils/            # Utility functions
│   └── index.js          # Entry point
│
└── frontend/
    ├── src/
    │   ├── api/          # API client functions
    │   ├── components/  # React components
    │   ├── cypress/      # Cypress E2E tests
    │   │   ├── e2e/     # Test files
    │   │   ├── fixtures/ # Mock data
    │   │   └── support/  # Custom commands and setup
    │   ├── pages/        # Page components
    │   ├── routes/       # React Router configuration
    │   ├── stores/       # Zustand stores
    │   └── utils/        # Utility functions and validators
    ├── cypress.config.js # Cypress configuration
    └── vite.config.js    # Vite configuration
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Restaurants

- `GET /api/restaurants` - Get all restaurants (supports `?sortby` query parameter)
- `GET /api/restaurants/top` - Get top restaurants
- `GET /api/restaurants/name/:name` - Get restaurants by name
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create restaurant (admin only)
- `PUT /api/restaurants/:id` - Update restaurant (admin only)
- `DELETE /api/restaurants/:id` - Delete restaurant (admin only)

### Reviews

- `GET /api/reviews/restaurant/:restaurantId` - Get all reviews for a restaurant
- `GET /api/reviews/user/:userId` - Get all reviews by a user
- `GET /api/reviews/:reviewId` - Get review by ID
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:reviewId` - Update a review (owner or admin only)
- `DELETE /api/reviews/:reviewId` - Delete a review (owner or admin only)

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email (admin only)
- `GET /api/users/username/:username` - Get user by username
- `GET /api/users/:id/favourites` - Get user's favorite restaurants
- `PUT /api/users/:id` - Update user (owner or admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/favourites` - Add restaurant to favorites
- `DELETE /api/users/favourites` - Remove restaurant from favorites

## 🎨 Technologies Used

### Backend

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **Helmet** - Security headers
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for integration tests
- **MongoDB Memory Server** - In-memory MongoDB for testing
- **dotenv** - Environment variable management

### Frontend

- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Zod** - Schema validation
- **Headless UI** - UI components
- **Cypress** - E2E testing framework

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet for HTTP security headers
- Input validation on both client and server
- Protected routes and authorization middleware

## 🚀 CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/test.yml`) that automatically runs:

- **Backend tests** on every push/PR to `main`, `master`, or `develop` branches
- **Frontend E2E tests** with Cypress (headless mode)

The workflow uses Node.js 20 and runs both test suites in parallel.

## 📝 Pending Improvements

### High Priority

- Image Upload functionality for restaurants and user avatars
- Deployment scripts for both frontend and backend

### Medium Priority

- Email verification on registration
- Password reset functionality
- Pagination for restaurants and reviews lists
- Restaurant images gallery
- User avatars
- Restaurant recommendations based on user preferences
- Complete E2E test coverage (currently covers auth and dashboard)

### Low Priority

- Dark mode toggle
- Accessibility improvements (ARIA labels, keyboard navigation)
- Unit tests for frontend components
- API documentation with Swagger/OpenAPI
- Docker containerization

## 🤝 Contributing

Please feel free to submit a Pull Request and help to keep building this app!

## 📄 License

ISC

## 👤 Author

Alex Marquez

## 🔗 Links

- [GitHub Repository](https://github.com/alejandroFMA/restaurant-app)
- [Issue Tracker](https://github.com/alejandroFMA/restaurant-app/issues)
