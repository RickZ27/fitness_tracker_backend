# Backend Express Sprint Example

A TypeScript-based Express.js backend API with MongoDB, featuring authentication, user management, file uploads, and comprehensive testing.

## Features

- 🔐 **Authentication** - JWT-based auth with register/login
- 👥 **User Management** - Admin user CRUD operations
- 📁 **File Upload** - Image upload with Multer
- 📧 **Email Service** - Nodemailer integration
- ✅ **Testing** - Jest with unit and integration tests
- 🛡️ **Type Safety** - TypeScript with Zod validation
- 🗄️ **Database** - MongoDB with Mongoose ODM
- 🔒 **Security** - bcrypt password hashing, CORS enabled

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: Nodemailer
- **Testing**: Jest, Supertest
- **Dev Tools**: Nodemon, ts-node

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (running locally or connection URI)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 35-backend-express-sprint-example
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your_jwt_secret_key
   MONGODB_URI=mongodb://127.0.0.1:27017/my_db
   PORT=5050
   EMAIL_USER="meroemail@gmail.com"
   EMAIL_PASS="app password here"
   CLIENT_URL="http://localhost:3000"
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system.

### Running the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Run tests**:
```bash
npm test
```

The server will start on `http://localhost:5050` (or the port specified in `.env`).

## Project Structure

```
src/
├── __tests__/          # Test files
│   ├── integration/    # Integration tests
│   ├── unit/          # Unit tests
│   └── __mocks__/     # Mock files
├── config/            # Configuration files
├── controllers/       # Route controllers
│   └── admin/        # Admin-specific controllers
├── database/         # Database connection
├── dtos/             # Data Transfer Objects
├── errors/           # Custom error classes
├── middlewares/      # Express middlewares
├── models/           # Mongoose models
├── repositories/     # Data access layer
├── routes/           # API routes
│   └── admin/       # Admin routes
├── services/         # Business logic
│   └── admin/       # Admin services
├── types/            # TypeScript type definitions
├── app.ts            # Express app configuration
└── index.ts          # Application entry point
```

## API Endpoints

### Authentication

#### Register User
**POST** `/api/auth/register`

Request body:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Admin - User Management

All admin routes require authentication with JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### Get All Users
**GET** `/api/admin/users`

Query parameters:
- `page` (optional): Page number
- `size` (optional): Items per page
- `search` (optional): Search term

#### Get User by ID
**GET** `/api/admin/users/:id`

#### Create User
**POST** `/api/admin/users`

#### Update User
**PUT** `/api/admin/users/:id`

#### Delete User
**DELETE** `/api/admin/users/:id`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_here` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/my_db` |
| `PORT` | Server port | `5050` |

## Testing

The project includes comprehensive tests using Jest and Supertest.

**Run all tests**:
```bash
npm test
```

Test structure:
- **Unit tests**: Test individual functions and services
- **Integration tests**: Test API endpoints end-to-end

## TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps for debugging

## Development Notes

### CORS Configuration
The API allows requests from:
- `http://localhost:3000`
- `http://localhost:3003`
- `http://localhost:3005`

Update CORS settings in [src/app.ts](src/app.ts) as needed.

### File Uploads
Uploaded files are stored in the `uploads/` directory and served statically at `/uploads`.

## License

ISC

