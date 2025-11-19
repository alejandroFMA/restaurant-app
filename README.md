# Restaurant App

A full-stack restaurant review application built with React, Node.js, Express, and MongoDB. Users can browse restaurants, create reviews, manage favorites, and administrators can add new restaurants.

## 🚀 Features

### User Features

- **Authentication**: User registration and login with JWT tokens
- **Restaurant Browsing**: View all restaurants with ratings and review counts
- **Restaurant Details**: See detailed information including operating hours, cuisine type, and location
- **Reviews**: Create, edit, and delete reviews with star ratings
- **Favorites**: Add and remove restaurants from favorites list
- **User Profile**: View and edit personal information, manage reviews and favorites

### Admin Features

- **Create Restaurants**: Add new restaurants with full details including geocoded addresses
- **User Management**: View all users and their information

### Technical Features

- **Protected Routes**: Authentication-based route protection
- **Form Validation**: Client-side validation with Zod and server-side validation with express-validator
- **Real-time Updates**: React Query for efficient data fetching and caching
- **State Management**: Zustand for global authentication state
- **Responsive Design**: Modern UI with Tailwind CSS
- **Security**: Helmet for HTTP headers, rate limiting, CORS configuration

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

### Test Structure

- **Unit Tests**: Located in `backend/tests/unit/`
  - Authentication tests
  - Controller tests (auth, restaurants, reviews, users)
  - Helper tests (encryption, validation)
- **Integration Tests**: Located in `backend/tests/integration/`

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
    │   ├── pages/        # Page components
    │   ├── routes/       # React Router configuration
    │   ├── stores/       # Zustand stores
    │   └── utils/        # Utility functions and validators
    └── vite.config.js    # Vite configuration
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Restaurants

- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create restaurant (admin only)

### Reviews

- `GET /api/reviews/restaurant/:id` - Get all reviews for a restaurant
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

### Users

- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/favourites` - Get user's favorite restaurants
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

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet for HTTP security headers
- Input validation on both client and server
- Protected routes and authorization middleware

## 📝 Pending Improvements

### High Priority

- 404 Page for undefined routes
- Image Upload functionality for restaurants and user avatars
- Deployment scripts for both frontend and backend

### Medium Priority

- Email verification on registration
- Password reset functionality
- Pagination for restaurants and reviews lists
- Restaurant images gallery
- User avatars
- Restaurant recommendations based on user preferences

### Low Priority

- Dark mode toggle
- Accessibility improvements (ARIA labels, keyboard navigation)
- Unit tests for frontend components
- E2E tests with Cypress
- API documentation with Swagger/OpenAPI
- Docker containerization
- CI/CD pipeline setup

## 🤝 Contributing

Please feel free to submit a Pull Request and helpint to keep building this app!

## 📄 License

ISC

## 👤 Author

Alex Marquez

## 🔗 Links

- [GitHub Repository](https://github.com/alejandroFMA/restaurant-app)
- [Issue Tracker](https://github.com/alejandroFMA/restaurant-app/issues)
