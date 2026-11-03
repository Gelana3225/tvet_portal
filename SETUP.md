# Quick Setup Guide

## First Time Setup

### 1. Backend Setup (5 minutes)

```powershell
# Navigate to backend
cd backend

# Install PHP dependencies (if not already done)
composer install

# Copy environment file (if not already done)
Copy-Item .env.example .env

# Generate application key (if not already done)
php artisan key:generate

# Run database migrations
php artisan migrate

# Start backend server
php artisan serve
```

**Backend URL**: http://127.0.0.1:8000

### 2. Frontend Setup (5 minutes)

```powershell
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional dependencies
npm install @tanstack/react-query axios react-hook-form zod @hookform/resolvers

# Start frontend server
npm run dev
```

**Frontend URL**: http://localhost:5173

## Daily Development

### Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

## Testing the Setup

### Test Backend API

1. Open browser to http://127.0.0.1:8000/api/health
2. Should see: `{"status":"ok","timestamp":"...","service":"Hawagalan TVET College API"}`

### Test Frontend

1. Open browser to http://localhost:5173
2. Should see the Hawagalan TVET College homepage

## Common Commands

### Backend

```powershell
# Create a new migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Create a model
php artisan make:model ModelName

# Create a controller
php artisan make:controller Api/ControllerName

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Run tests
php artisan test
```

### Frontend

```powershell
# Install a package
npm install package-name

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Configuration

### Backend .env Key Settings

```env
APP_NAME="Hawagalan TVET College"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# For SQLite (development)
DB_CONNECTION=sqlite

# For MySQL (production)
DB_CONNECTION=mysql
DB_DATABASE=hawagalan_tvet_college
DB_USERNAME=root
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DRIVER=database
```

### Frontend .env (create this file)

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Hawagalan TVET College
```

## Next Steps After Setup

1. ✅ Backend and frontend running
2. 🎨 Configure Tailwind CSS in frontend
3. 🧩 Install and configure shadcn/ui components
4. 📊 Design and implement database schema (Phase 1)
5. 🔐 Implement authentication endpoints (Phase 2)
6. 🎯 Start building features phase by phase

## Need Help?

- Check README.md for detailed documentation
- Review Laravel logs: `backend/storage/logs/laravel.log`
- Check browser console for frontend errors
- Verify both servers are running on correct ports
