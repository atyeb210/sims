# Smart Inventory System

A comprehensive inventory management system built with Next.js, TypeScript, MongoDB, and TensorFlow.js for demand forecasting.

## Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Admin, Manager, Viewer)
- **Email verification** for new accounts
- **Password reset** functionality
- **Google OAuth** integration
- **Session management** with HTTP-only cookies

### 📦 Inventory Management
- Real-time inventory tracking
- Product catalog management
- Stock level monitoring
- Low stock alerts
- Bulk operations

### 📊 Analytics & Forecasting
- Demand forecasting using TensorFlow.js
- Sales analytics
- Seasonal trend analysis
- Interactive charts and reports

### 🚨 Alert System
- Configurable inventory alerts
- Email notifications
- Real-time dashboard updates

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-inventory-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the environment example file:
   ```bash
   cp env.example .env.local
   ```

   Update the `.env.local` file with your configuration:

   **Required Variables:**
   ```env
   DATABASE_URL="mongodb://localhost:27017/smart-inventory"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   JWT_SECRET="your-super-secret-jwt-key-make-it-long-and-random"
   REFRESH_TOKEN_SECRET="your-refresh-token-secret-different-from-jwt-secret"
   ```

   **Email Configuration (for password reset):**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-email-app-password"
   ```

   **Optional - Google OAuth:**
   ```env
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   ```

4. **Database Setup**
   
   Make sure MongoDB is running, then seed the database:
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Authentication Flow

### Registration Process
1. User signs up with email and password
2. Account is created with email verification token
3. Verification email is sent (if SMTP is configured)
4. User can login immediately or verify email later
5. JWT access and refresh tokens are set as HTTP-only cookies

### Login Process
1. User provides email and password
2. Credentials are verified against database
3. JWT tokens are generated and set as cookies
4. User is redirected to dashboard

### Password Reset
1. User requests password reset with email
2. Reset token is generated and emailed
3. User clicks reset link and sets new password
4. Reset token is invalidated

### Token Management
- **Access tokens**: Short-lived (7 days), used for API authentication
- **Refresh tokens**: Long-lived (30 days), used to generate new access tokens
- **Automatic refresh**: Middleware handles token refresh transparently

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/refresh` - Refresh access token

### Inventory Management
- `GET /api/products` - Get products list
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/inventory` - Get inventory data
- `GET /api/brands` - Get brands list
- `GET /api/categories` - Get categories list

### Analytics
- `GET /api/dashboard` - Dashboard analytics
- `GET /api/forecasts` - Demand forecasts

## User Roles & Permissions

### Admin
- Full access to all features
- User management
- System configuration
- All inventory operations

### Manager  
- Inventory read/write access
- Product management
- Reports and forecasts
- Alert management

### Viewer
- Read-only access to inventory
- View reports and forecasts
- No modification permissions

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   └── inventory/        # Inventory pages
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── inventory/       # Inventory components
│   └── ui/              # UI components
├── lib/                 # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── jwt.ts           # JWT utilities
│   ├── email.ts         # Email service
│   └── mongodb.ts       # Database connection
├── models/              # MongoDB models
└── types/               # TypeScript type definitions
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Code Quality
```bash
npm run lint
```

## Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT token security** with strong secrets
- **HTTP-only cookies** prevent XSS attacks
- **CSRF protection** with SameSite cookies
- **Email verification** prevents fake accounts
- **Rate limiting** on authentication endpoints
- **Secure password reset** with time-limited tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
