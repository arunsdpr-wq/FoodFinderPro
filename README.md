# FoodFinderPro

A modern full-stack food delivery application built with React, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Restaurant Discovery**: Browse restaurants by city and location
- **Menu Management**: View detailed menu items with categories and pricing
- **User Authentication**: Secure login with Passport.js and session management
- **Order System**: Complete ordering flow with delivery tracking
- **Payment Integration**: Stripe payment processing
- **Reviews & Ratings**: Customer reviews with star ratings
- **OTP Verification**: Email and phone number verification
- **Responsive Design**: Mobile-friendly UI with TailwindCSS and Radix UI
- **Real-time Updates**: WebSocket support for live updates

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Wouter** - Lightweight routing
- **React Query** - Data fetching and state management
- **Framer Motion** - Animation library

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Drizzle ORM** - Database ORM
- **Passport.js** - Authentication middleware
- **Express Session** - Session management

### Database
- **PostgreSQL** - Relational database
- **Neon Serverless** - Cloud PostgreSQL hosting
- **Drizzle Kit** - Database migration tool

### Other
- **Stripe** - Payment processing
- **WebSocket** - Real-time communication
- **Zod** - Schema validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (or Neon Serverless account)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FoodFinderPro.git
cd FoodFinderPro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Database Setup

#### Option A: Using SQL Scripts (Recommended for Development)

1. Create a PostgreSQL database:
```bash
createdb foodfinderpro
```

2. Run the setup script:
```bash
psql -U your_username -d foodfinderpro -f scripts/setup-database.sql
```

3. (Optional) Run the seed script for sample data:
```bash
psql -U your_username -d foodfinderpro -f scripts/seed-data.sql
```

#### Option B: Using Drizzle Migrations

1. Generate migrations:
```bash
npm run db:push
```

This will automatically create tables based on your schema.

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
FoodFinderPro/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD workflows
├── client/                 # React frontend application
│   ├── index.html
│   └── src/               # Source files
├── server/                # Express backend application
│   ├── auth.ts           # Authentication logic
│   ├── database-storage.ts # Database operations
│   ├── db.ts             # Database connection
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── storage.ts        # In-memory storage
│   └── vite.ts           # Vite configuration
├── shared/               # Shared TypeScript definitions
│   └── schema.ts         # Database schema
├── scripts/              # Database scripts
│   ├── setup-database.sql
│   └── seed-data.sql
├── migrations/           # Drizzle migrations (auto-generated)
├── .env.example          # Environment variables template
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # TailwindCSS configuration
```

## 🎯 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🗄️ Database Schema

The application uses the following tables:

- **cities** - City information
- **locations** - Location/area information within cities
- **restaurants** - Restaurant details and information
- **menu_items** - Menu items for each restaurant
- **users** - User account information
- **otp_verifications** - OTP codes for email/phone verification
- **orders** - Customer orders and delivery information
- **reviews** - Customer reviews for restaurants

See `shared/schema.ts` for detailed schema definitions.

## 🔐 Authentication

The application uses Passport.js with local strategy for authentication:

- User registration with username and password
- Session-based authentication
- Password hashing with bcrypt
- OTP verification for email and phone numbers

## 💳 Payment Integration

Stripe integration for payment processing:

- Credit card payments
- Secure payment flow
- Order confirmation with payment status

## 🧪 Testing

Run tests with:

```bash
npm test
```

## 🚢 Deployment

### GitHub Actions

The project includes GitHub Actions workflows for CI/CD:

- **CI Pipeline** - Runs on push/PR to main/develop branches
  - Type checking
  - Linting
  - Building
  - Testing

- **Deploy Pipeline** - Runs on push to main branch
  - Build application
  - Deploy to production

- **Database Migration** - Runs on schema changes
  - Generate migrations
  - Push to database

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables on your hosting platform

3. Start the production server:
```bash
npm start
```

### Environment Variables for Production

Ensure the following are set in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure random string for sessions
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NODE_ENV=production`

## 🐳 Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t foodfinderpro .
docker run -p 5000:5000 --env-file .env foodfinderpro
```

## 🔧 Configuration

### Database Connection

Configure your database in `server/db.ts`:

```typescript
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### Drizzle Configuration

Configure migrations in `drizzle.config.ts`:

```typescript
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify your `DATABASE_URL` is correct
2. Ensure your PostgreSQL server is running
3. Check firewall settings
4. Verify database user permissions

### Build Errors

If you encounter build errors:

1. Clear node_modules: `rm -rf node_modules package-lock.json`
2. Reinstall dependencies: `npm install`
3. Check Node.js version: `node --version` (should be v20+)

### Port Already in Use

If port 5000 is already in use:

1. Change the `PORT` in your `.env` file
2. Or kill the process using port 5000:
   ```bash
   # On Linux/Mac
   lsof -ti:5000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

## 📞 Support

For support and questions:

- Open an issue on GitHub
- Contact: support@foodfinderpro.com

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)
