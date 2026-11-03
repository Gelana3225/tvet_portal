# Hawagalan TVET College Student Registration System

A modern, secure, and scalable Student Registration and Admission Management System for Hawagalan TVET College in Ethiopia.

## 📋 Project Overview

This system enables prospective students to apply for admission online, submit required documents, and track their application status. College administrators and registrar staff can manage admission periods, review applications, request corrections, and approve or reject applications.

**Current Release**: Phase 0 - Project Foundation
**Focus**: New applicant registration and admission management

## 🏗️ Architecture

### Technology Stack

**Backend:**
- PHP 8.5.1
- Laravel 11.57.1
- MySQL (SQLite for development)
- Laravel Sanctum (SPA authentication)
- RESTful API architecture

**Frontend:**
- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.1
- React Router 6.26.2
- Tailwind CSS (to be configured)
- shadcn/ui (to be configured)

**Development:**
- Modular Monolith architecture
- Separate backend and frontend applications
- Git version control

### Project Structure

```
hawagalan-college/
├── backend/                 # Laravel API backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   ├── Resources/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Policies/
│   │   ├── Services/
│   │   ├── Traits/
│   │   └── Providers/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/
│   └── tests/
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── applicant/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── contexts/
│   │   └── lib/
│   └── public/
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- PHP 8.2 or higher
- Composer 2.9+
- Node.js 24.x (LTS)
- npm 11.x
- MySQL 8.0+ or SQLite 3
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Install dependencies:**
   ```powershell
   composer install
   ```

3. **Configure environment:**
   ```powershell
   # Copy the environment file
   Copy-Item .env.example .env
   
   # Generate application key
   php artisan key:generate
   ```

4. **Configure database:**
   
   For SQLite (Development):
   ```
   DB_CONNECTION=sqlite
   # SQLite file is already created at database/database.sqlite
   ```
   
   For MySQL (Production):
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=hawagalan_tvet_college
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

5. **Run migrations:**
   ```powershell
   php artisan migrate
   ```

6. **Start the development server:**
   ```powershell
   php artisan serve
   ```
   
   Backend will be available at: http://127.0.0.1:8000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```
   
   Frontend will be available at: http://localhost:5173

## 🔐 Authentication

The system uses **Laravel Sanctum** for SPA (Single Page Application) authentication with cookie-based sessions.

### Authentication Flow:
1. Frontend requests CSRF cookie from `/sanctum/csrf-cookie`
2. Frontend sends credentials to login endpoint
3. Backend validates and creates authenticated session
4. Subsequent requests include session cookie
5. Backend validates session on protected routes

### CORS Configuration:
- Configured in `backend/config/cors.php`
- Allows frontend origin (localhost:5173)
- Supports credentials (cookies)

## 📡 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |
| GET | `/api/csrf-cookie` | Get CSRF cookie for Sanctum |

### Protected Routes (require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get authenticated user |

## 🏛️ Database Schema

### Current Tables:

1. **users** - User accounts (applicants, admin, registrar)
2. **personal_access_tokens** - Sanctum API tokens
3. **sessions** - User session data

### Planned Tables (Next Phases):

- applicant_profiles
- admission_periods
- departments
- occupations
- qualification_levels
- applications
- application_documents
- application_status_histories
- students
- audit_logs

## 🎯 Development Roadmap

### ✅ Phase 0: Project Foundation (Current)
- [x] Create Laravel backend
- [x] Configure Sanctum authentication
- [x] Set up CORS and sessions
- [x] Create React + TypeScript + Vite frontend
- [ ] Install Tailwind CSS and shadcn/ui (requires npm install)
- [x] Initialize Git repository
- [x] Create documentation

### 📋 Phase 1: Database Architecture Design
- Design complete entity-relationship diagram
- Create all database migrations
- Set up model relationships
- Create seeders for initial data

### 📋 Phase 2: Authentication System
- Implement registration endpoint
- Implement login/logout endpoints
- Implement password reset
- Set up role-based access control
- Build authentication UI components
- Implement protected routes

### 📋 Phase 3: Academic Structure Management
- CRUD for departments
- CRUD for occupations/training programs
- CRUD for qualification levels
- Admin interface

### 📋 Phase 4: Admission Period Management
- Create/edit admission periods
- Date-based restrictions
- Activation/deactivation
- Admin interface

### 📋 Phase 5: Application Submission (Applicant)
- Multi-step application form
- Save as draft functionality
- Application submission
- Document uploads
- Application tracking

### 📋 Phase 6: Document Upload System
- Secure file storage
- File validation
- Authorization
- Document preview

### 📋 Phase 7: Application Status Management
- Status workflow
- Status transitions
- Status history tracking

### 📋 Phase 8: Registrar Dashboard & Review
- Dashboard with statistics
- Application filtering
- Application review
- Approve/reject applications
- Request corrections

### 📋 Phase 9: Student Record Creation
- Automatic student record creation on approval
- Student ID generation
- Link to original application
- Prevent duplicates

### 📋 Phase 10: Testing, Polish & Documentation
- Comprehensive testing
- Security audit
- Performance optimization
- User documentation
- Deployment guide

## 🔒 Security Considerations

1. **Authentication**: Cookie-based Sanctum authentication
2. **CSRF Protection**: Enabled for all state-changing operations
3. **Password Hashing**: Using bcrypt
4. **SQL Injection**: Protected via Laravel's query builder
5. **XSS Prevention**: React's built-in escaping
6. **Authorization**: Backend policy enforcement
7. **File Upload**: Server-side validation
8. **Rate Limiting**: To be implemented
9. **Audit Logging**: To be implemented

## 🧪 Testing

### Backend Tests (Pest)
```powershell
cd backend
php artisan test
```

### Frontend Tests (to be configured)
```powershell
cd frontend
npm run test
```

## 📝 Environment Variables

### Backend (.env)

```env
APP_NAME="Hawagalan TVET College"
APP_URL=http://localhost:8000
APP_TIMEZONE=Africa/Addis_Ababa

FRONTEND_URL=http://localhost:5173

DB_CONNECTION=sqlite
# For MySQL:
# DB_CONNECTION=mysql
# DB_DATABASE=hawagalan_tvet_college
# DB_USERNAME=root
# DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DRIVER=database
```

### Frontend (.env - to be created)

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Hawagalan TVET College
```

## 🤝 Development Workflow

1. **Never commit to main directly** - Create feature branches
2. **Write tests** for new features
3. **Run migrations** after pulling database changes
4. **Clear cache** when configuration changes:
   ```powershell
   php artisan config:clear
   php artisan route:clear
   php artisan cache:clear
   ```

## 📚 Documentation

- [Laravel Documentation](https://laravel.com/docs/11.x)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [Sanctum Documentation](https://laravel.com/docs/11.x/sanctum)

## ⚠️ Known Issues

1. **PHP 8.5 Deprecation Warnings**: PDO::MYSQL_ATTR_SSL_CA constant deprecation warnings appear but don't affect functionality
2. **Network Timeouts**: Initial setup experienced network connectivity issues with package managers
3. **Frontend Dependencies**: npm packages need to be installed manually due to timeout

## 🛠️ Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify .env file exists and has APP_KEY
- Run `php artisan config:clear`

### Database connection fails
- Verify database credentials in .env
- For SQLite, ensure database/database.sqlite exists
- Run migrations: `php artisan migrate`

### CORS errors
- Verify FRONTEND_URL in backend .env
- Check config/cors.php configuration
- Clear config cache: `php artisan config:clear`

### Authentication not working
- Ensure SANCTUM_STATEFUL_DOMAINS includes frontend domain
- Verify SESSION_DRIVER is set to 'database'
- Check that sessions table exists

## 📄 License

Proprietary - Hawagalan TVET College

## 👥 Project Team

- **Project Owner**: Hawagalan TVET College
- **Development**: In Progress
- **Phase**: 0 - Foundation

---

**Last Updated**: November 2, 2026
**Status**: Active Development - Phase 0 Complete (pending npm install)
