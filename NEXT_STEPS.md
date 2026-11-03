# Next Development Steps

## Immediate Actions Required

### 1. Complete Network-Dependent Installations

Due to network connectivity issues during initial setup, you need to manually complete:

```powershell
# In the frontend directory
cd frontend
npm install
```

This will install all React, TypeScript, Vite, and related dependencies.

### 2. Install and Configure Tailwind CSS

```powershell
cd frontend

# Install Tailwind and its dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind configuration
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Install Additional Frontend Dependencies

```powershell
# API data fetching and state management
npm install @tanstack/react-query

# HTTP client
npm install axios

# Form management
npm install react-hook-form

# Schema validation
npm install zod @hookform/resolvers

# Icons (optional but recommended)
npm install lucide-react
```

### 4. Set up shadcn/ui

```powershell
# Initialize shadcn/ui
npx shadcn@latest init

# Install commonly needed components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
```

### 5. Create Frontend Environment File

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Hawagalan TVET College
```

### 6. Test Both Applications

```powershell
# Terminal 1 - Start backend
cd backend
php artisan serve

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

Visit:
- Backend: http://127.0.0.1:8000/api/health
- Frontend: http://localhost:5173

## Phase 1: Database Architecture Design

Once the foundation is complete, proceed with Phase 1.

### Database Design Tasks

1. **Review and Finalize Entity Requirements**
   - Users and roles
   - Applicant profiles
   - Admission periods
   - Academic structure (departments, occupations, levels)
   - Applications
   - Documents
   - Status history
   - Students (created on approval)
   - Audit logs

2. **Create Entity-Relationship Diagram**
   - Define all relationships
   - Identify foreign keys
   - Plan indexes
   - Consider soft deletes where appropriate

3. **Create Migrations**
   
   Order of creation (respecting dependencies):
   
   ```powershell
   # 1. Core reference tables
   php artisan make:migration create_roles_table
   php artisan make:migration create_departments_table
   php artisan make:migration create_occupations_table
   php artisan make:migration create_qualification_levels_table
   
   # 2. Admission management
   php artisan make:migration create_admission_periods_table
   
   # 3. User-related tables
   php artisan make:migration add_role_to_users_table
   php artisan make:migration create_applicant_profiles_table
   
   # 4. Application tables
   php artisan make:migration create_applications_table
   php artisan make:migration create_application_documents_table
   php artisan make:migration create_application_status_histories_table
   
   # 5. Student records
   php artisan make:migration create_students_table
   
   # 6. Audit logging
   php artisan make:migration create_audit_logs_table
   ```

4. **Create Model Classes with Relationships**

   ```powershell
   php artisan make:model Role
   php artisan make:model Department
   php artisan make:model Occupation
   php artisan make:model QualificationLevel
   php artisan make:model AdmissionPeriod
   php artisan make:model ApplicantProfile
   php artisan make:model Application
   php artisan make:model ApplicationDocument
   php artisan make:model ApplicationStatusHistory
   php artisan make:model Student
   php artisan make:model AuditLog
   ```

5. **Create Seeders for Initial Data**

   ```powershell
   php artisan make:seeder RoleSeeder
   php artisan make:seeder DepartmentSeeder
   php artisan make:seeder QualificationLevelSeeder
   ```

## Phase 2: Authentication System

After database design is complete:

1. **Backend Authentication Endpoints**
   - POST `/api/register` - User registration
   - POST `/api/login` - User login
   - POST `/api/logout` - User logout
   - POST `/api/password/email` - Request password reset
   - POST `/api/password/reset` - Reset password
   - GET `/api/user` - Get authenticated user

2. **Frontend Authentication Context**
   - Create `AuthContext` for global auth state
   - Create `AuthProvider` component
   - Create `useAuth` hook

3. **Authentication UI Components**
   - Login page
   - Registration page
   - Password reset request page
   - Password reset page
   - Protected route wrapper

4. **Role-Based Access Control**
   - Define permissions
   - Create authorization policies
   - Implement middleware
   - Create UI route guards

## Key Design Decisions Needed

Before proceeding with Phase 1, confirm these with the college:

### 1. User Roles and Permissions
- What specific permissions does each role have?
- Can there be custom roles beyond Applicant/Admin/Registrar?
- Should role assignment be done through the system or manually?

### 2. Application Form Fields
- Confirm the exact fields needed in the application
- Which fields are mandatory vs optional?
- Any specific validation rules (e.g., phone number format)?
- Document types required?

### 3. Student ID Format
- What format should the student ID follow?
- Examples: `HTC-2026-0001`, `2026/0001`, etc.
- Should it include department or program code?
- How is uniqueness ensured?

### 4. Admission Period Rules
- Can multiple admission periods overlap?
- Can an applicant apply to multiple periods?
- Can an applicant apply to multiple programs?
- What happens to draft applications when a period closes?

### 5. Application Status Workflow
- Confirm all possible status transitions
- Can an application be edited after submission?
- Can a rejected application be resubmitted?
- What triggers automatic status changes?

### 6. Document Requirements
- List of required documents
- Optional documents
- File size limits
- Accepted file formats
- Document naming conventions

## Development Best Practices

As you proceed:

1. **Test Everything**
   - Write tests as you build features
   - Test authentication flows thoroughly
   - Test authorization on all routes
   - Test validation on all inputs

2. **Commit Regularly**
   ```powershell
   git add .
   git commit -m "Descriptive commit message"
   ```

3. **Keep Documentation Updated**
   - Update README when adding features
   - Document API endpoints as you create them
   - Keep SETUP.md current

4. **Security First**
   - Never commit `.env` files
   - Validate all inputs on backend
   - Enforce authorization on all endpoints
   - Use HTTPS in production
   - Implement rate limiting

5. **Code Quality**
   - Follow Laravel and React best practices
   - Keep controllers thin, use services
   - Keep components small and reusable
   - Use TypeScript types properly
   - Comment complex logic

## Resources

- **Laravel**: https://laravel.com/docs/11.x
- **React**: https://react.dev
- **Sanctum**: https://laravel.com/docs/11.x/sanctum
- **TanStack Query**: https://tanstack.com/query/latest
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com

## Questions or Issues?

Document any issues, questions, or decisions needed in a QUESTIONS.md file for discussion with the college stakeholders.

---

**Ready to proceed**: Once npm packages are installed and tested
**Next milestone**: Complete Phase 1 database design
**Timeline**: Phase 1 should take 2-3 days with proper planning
