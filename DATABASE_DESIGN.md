# Database Architecture Design
## Hawagalan TVET College Student Registration System

**Version**: 1.0  
**Date**: November 2, 2026  
**Status**: Phase 1 - Design Complete

---

## Database Design Principles

1. **Normalized Structure**: 3NF (Third Normal Form) to reduce redundancy
2. **Referential Integrity**: Foreign keys with proper constraints
3. **Audit Trail**: Track important state changes and administrative actions
4. **Soft Deletes**: Where data preservation is important
5. **Indexes**: On frequently queried and foreign key columns
6. **Timestamps**: Created_at and updated_at on all tables

---

## Entity-Relationship Diagram

### Core Entities and Relationships

```
┌─────────────┐
│    roles    │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐         ┌──────────────────┐
│    users    │◄────────│ applicant_profiles│
└──────┬──────┘ 1:1     └──────────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│ applications │
└──────┬───────┘
       │
       ├─────► admission_periods (N:1)
       ├─────► departments (N:1)
       ├─────► occupations (N:1)
       ├─────► qualification_levels (N:1)
       │
       │ 1:N
       ├─────► application_documents
       │
       │ 1:N
       ├─────► application_status_histories
       │
       │ 1:1 (on approval)
       └─────► students

┌─────────────┐
│ audit_logs  │ ◄──── Logs actions from various entities
└─────────────┘
```

---

## Table Definitions

### 1. **roles**
Defines user roles in the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Role name (applicant, admin, registrar) |
| display_name | VARCHAR(100) | NOT NULL | Human-readable name |
| description | TEXT | NULLABLE | Role description |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: name (UNIQUE)

**Initial Data**:
- applicant: "Applicant" - Prospective students applying for admission
- admin: "Administrator" - System administrators
- registrar: "Registrar" - College registrar staff

---

### 2. **users** (Enhanced)
User accounts for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| role_id | BIGINT UNSIGNED | FK(roles.id), NOT NULL | User role |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| email_verified_at | TIMESTAMP | NULLABLE | Email verification time |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| remember_token | VARCHAR(100) | NULLABLE | Remember me token |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| last_login_at | TIMESTAMP | NULLABLE | Last login timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: email (UNIQUE), role_id (FK)

**Relationships**:
- belongsTo: Role
- hasOne: ApplicantProfile (if role is applicant)
- hasMany: Applications (if role is applicant)
- hasMany: AuditLogs

---

### 3. **applicant_profiles**
Extended profile information for applicants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| user_id | BIGINT UNSIGNED | FK(users.id), UNIQUE, NOT NULL | Associated user |
| first_name | VARCHAR(100) | NOT NULL | First name |
| father_name | VARCHAR(100) | NOT NULL | Father's name |
| grandfather_name | VARCHAR(100) | NOT NULL | Grandfather's name |
| gender | ENUM('male', 'female') | NOT NULL | Gender |
| date_of_birth | DATE | NOT NULL | Date of birth |
| nationality | VARCHAR(100) | NOT NULL | Nationality |
| profile_photo_path | VARCHAR(255) | NULLABLE | Profile photo storage path |
| phone_number | VARCHAR(20) | NOT NULL | Phone number |
| region | VARCHAR(100) | NOT NULL | Region |
| zone | VARCHAR(100) | NOT NULL | Zone |
| woreda | VARCHAR(100) | NOT NULL | Woreda |
| kebele | VARCHAR(100) | NOT NULL | Kebele |
| emergency_contact_name | VARCHAR(255) | NOT NULL | Emergency contact name |
| emergency_contact_phone | VARCHAR(20) | NOT NULL | Emergency contact phone |
| emergency_contact_relationship | VARCHAR(50) | NOT NULL | Relationship to applicant |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: user_id (UNIQUE FK)

**Relationships**:
- belongsTo: User

---

### 4. **departments**
Academic departments in the college.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Department name |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Department code |
| description | TEXT | NULLABLE | Department description |
| is_active | BOOLEAN | DEFAULT TRUE | Department active status |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: code (UNIQUE), name (UNIQUE)

**Relationships**:
- hasMany: Occupations
- hasMany: Applications

---

### 5. **occupations**
Training programs/occupations offered by departments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| department_id | BIGINT UNSIGNED | FK(departments.id), NOT NULL | Parent department |
| name | VARCHAR(255) | NOT NULL | Occupation name |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Occupation code |
| description | TEXT | NULLABLE | Occupation description |
| is_active | BOOLEAN | DEFAULT TRUE | Occupation active status |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: code (UNIQUE), department_id (FK)

**Relationships**:
- belongsTo: Department
- hasMany: Applications

---

### 6. **qualification_levels**
TVET qualification levels (Level I, II, III, IV).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Level name (Level I, Level II, etc.) |
| code | VARCHAR(10) | UNIQUE, NOT NULL | Level code (L1, L2, etc.) |
| description | TEXT | NULLABLE | Level description |
| is_active | BOOLEAN | DEFAULT TRUE | Level active status |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: code (UNIQUE), name (UNIQUE)

**Initial Data**:
- Level I, Level II, Level III, Level IV

**Relationships**:
- hasMany: Applications

---

### 7. **admission_periods**
Admission period management with date-based restrictions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(255) | NOT NULL | Admission period name |
| academic_year | VARCHAR(20) | NOT NULL | Academic year (e.g., 2026/2027) |
| opening_date | DATE | NOT NULL | Application opening date |
| closing_date | DATE | NOT NULL | Application closing date |
| status | ENUM('draft', 'open', 'closed') | DEFAULT 'draft' | Period status |
| description | TEXT | NULLABLE | Additional information |
| created_by | BIGINT UNSIGNED | FK(users.id), NOT NULL | Admin who created |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: academic_year, status, opening_date, closing_date

**Business Rules**:
- closing_date must be after opening_date
- Only periods with status='open' and current_date between opening_date and closing_date accept applications
- Backend must enforce date restrictions

**Relationships**:
- belongsTo: User (created_by)
- hasMany: Applications

---

### 8. **applications**
Student applications for admission.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| application_number | VARCHAR(50) | UNIQUE, NOT NULL | Unique application identifier |
| user_id | BIGINT UNSIGNED | FK(users.id), NOT NULL | Applicant user |
| admission_period_id | BIGINT UNSIGNED | FK(admission_periods.id), NOT NULL | Admission period |
| department_id | BIGINT UNSIGNED | FK(departments.id), NOT NULL | Chosen department |
| occupation_id | BIGINT UNSIGNED | FK(occupations.id), NOT NULL | Chosen occupation |
| qualification_level_id | BIGINT UNSIGNED | FK(qualification_levels.id), NOT NULL | Chosen level |
| previous_school | VARCHAR(255) | NOT NULL | Previous school name |
| highest_education_level | VARCHAR(100) | NOT NULL | Highest education completed |
| completion_year | YEAR | NOT NULL | Year of completion |
| certificate_info | TEXT | NULLABLE | Certificate details |
| current_status | ENUM('draft', 'submitted', 'under_review', 'correction_required', 'approved', 'rejected') | DEFAULT 'draft' | Application status |
| declaration_accepted | BOOLEAN | DEFAULT FALSE | Applicant declaration |
| submitted_at | TIMESTAMP | NULLABLE | Submission timestamp |
| reviewed_by | BIGINT UNSIGNED | FK(users.id), NULLABLE | Registrar who reviewed |
| reviewed_at | TIMESTAMP | NULLABLE | Review timestamp |
| approval_notes | TEXT | NULLABLE | Notes from registrar |
| rejection_reason | TEXT | NULLABLE | Reason for rejection |
| correction_notes | TEXT | NULLABLE | Requested corrections |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: 
- application_number (UNIQUE)
- user_id (FK)
- admission_period_id (FK)
- current_status
- submitted_at

**Business Rules**:
- application_number generated: format like "HTC-2026-00001" (confirm with college)
- Draft applications can be updated by applicant
- Only submitted applications can be reviewed
- Status transitions are controlled and logged
- One application per user per admission period (enforced by unique constraint or validation)

**Relationships**:
- belongsTo: User (applicant)
- belongsTo: AdmissionPeriod
- belongsTo: Department
- belongsTo: Occupation
- belongsTo: QualificationLevel
- belongsTo: User (reviewed_by)
- hasMany: ApplicationDocuments
- hasMany: ApplicationStatusHistories
- hasOne: Student (created on approval)

---

### 9. **application_documents**
Documents uploaded by applicants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| application_id | BIGINT UNSIGNED | FK(applications.id), NOT NULL | Parent application |
| document_type | VARCHAR(100) | NOT NULL | Type of document |
| original_filename | VARCHAR(255) | NOT NULL | Original file name |
| stored_filename | VARCHAR(255) | NOT NULL | Storage file name |
| file_path | VARCHAR(500) | NOT NULL | Storage path |
| file_size | INTEGER UNSIGNED | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | File MIME type |
| uploaded_by | BIGINT UNSIGNED | FK(users.id), NOT NULL | User who uploaded |
| is_verified | BOOLEAN | DEFAULT FALSE | Verified by registrar |
| verified_by | BIGINT UNSIGNED | FK(users.id), NULLABLE | Registrar who verified |
| verified_at | TIMESTAMP | NULLABLE | Verification timestamp |
| notes | TEXT | NULLABLE | Registrar notes |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: application_id (FK), document_type

**Security**:
- Files stored in private storage (outside public directory)
- Access controlled by ownership and roles
- Download authorized through signed URLs or middleware

**Relationships**:
- belongsTo: Application
- belongsTo: User (uploaded_by)
- belongsTo: User (verified_by)

---

### 10. **application_status_histories**
Audit trail of application status changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| application_id | BIGINT UNSIGNED | FK(applications.id), NOT NULL | Parent application |
| previous_status | VARCHAR(50) | NULLABLE | Previous status |
| new_status | VARCHAR(50) | NOT NULL | New status |
| changed_by | BIGINT UNSIGNED | FK(users.id), NOT NULL | User who changed status |
| reason | TEXT | NULLABLE | Reason for change |
| notes | TEXT | NULLABLE | Additional notes |
| created_at | TIMESTAMP | NOT NULL | When change occurred |

**Indexes**: application_id (FK), created_at

**Business Rules**:
- Every status change is logged
- Cannot be updated or deleted (immutable audit trail)
- Automatically created on status transition

**Relationships**:
- belongsTo: Application
- belongsTo: User (changed_by)

---

### 11. **students**
Official student records (created only on application approval).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| student_id | VARCHAR(50) | UNIQUE, NOT NULL | Unique student identifier |
| application_id | BIGINT UNSIGNED | FK(applications.id), UNIQUE, NOT NULL | Original application |
| user_id | BIGINT UNSIGNED | FK(users.id), NOT NULL | User account |
| department_id | BIGINT UNSIGNED | FK(departments.id), NOT NULL | Enrolled department |
| occupation_id | BIGINT UNSIGNED | FK(occupations.id), NOT NULL | Enrolled occupation |
| qualification_level_id | BIGINT UNSIGNED | FK(qualification_levels.id), NOT NULL | Enrolled level |
| enrollment_date | DATE | NOT NULL | Date of enrollment |
| academic_year | VARCHAR(20) | NOT NULL | Academic year enrolled |
| status | ENUM('active', 'inactive', 'graduated', 'withdrawn') | DEFAULT 'active' | Student status |
| approved_by | BIGINT UNSIGNED | FK(users.id), NOT NULL | Registrar who approved |
| approved_at | TIMESTAMP | NOT NULL | Approval timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: 
- student_id (UNIQUE)
- application_id (UNIQUE FK)
- user_id (FK)

**Business Rules**:
- Created ONLY when application status changes to 'approved'
- student_id generated automatically (format needs college confirmation)
- Created within database transaction with application approval
- Prevent duplicate creation with unique constraint on application_id

**Student ID Format (needs confirmation)**:
- Example: HTC-2026-SE-0001 (College-Year-Dept-Sequential)
- Or: 2026/0001 (Year/Sequential)

**Relationships**:
- belongsTo: Application
- belongsTo: User
- belongsTo: Department
- belongsTo: Occupation
- belongsTo: QualificationLevel
- belongsTo: User (approved_by)

---

### 12. **audit_logs**
System-wide audit trail for critical actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key |
| user_id | BIGINT UNSIGNED | FK(users.id), NULLABLE | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action performed |
| auditable_type | VARCHAR(255) | NOT NULL | Entity type (polymorphic) |
| auditable_id | BIGINT UNSIGNED | NOT NULL | Entity ID (polymorphic) |
| old_values | JSON | NULLABLE | Previous values |
| new_values | JSON | NULLABLE | New values |
| ip_address | VARCHAR(45) | NULLABLE | User IP address |
| user_agent | TEXT | NULLABLE | User agent string |
| created_at | TIMESTAMP | NOT NULL | When action occurred |

**Indexes**: 
- auditable_type, auditable_id (Composite)
- user_id (FK)
- action
- created_at

**Logged Actions**:
- Application submission
- Application status changes
- Application approval/rejection
- Student record creation
- Document uploads
- User account changes
- Admission period changes

**Relationships**:
- belongsTo: User
- morphTo: Auditable (polymorphic)

---

## Data Flow: Application Approval to Student Record

```
1. Application created (status: 'draft')
   ├─> application_status_histories (log: null → draft)
   
2. Application submitted (status: 'submitted')
   ├─> application_status_histories (log: draft → submitted)
   ├─> audit_logs (action: application_submitted)
   
3. Registrar reviews (status: 'under_review')
   ├─> applications.reviewed_by = registrar_id
   ├─> applications.reviewed_at = timestamp
   ├─> application_status_histories (log: submitted → under_review)
   ├─> audit_logs (action: application_under_review)
   
4a. Registrar approves (status: 'approved')
   ├─> BEGIN TRANSACTION
   │   ├─> applications.current_status = 'approved'
   │   ├─> applications.approval_notes = notes
   │   ├─> application_status_histories (log: under_review → approved)
   │   ├─> students record created
   │   │   ├─> Generate unique student_id
   │   │   ├─> Link to application_id
   │   │   ├─> Copy department, occupation, level
   │   │   ├─> approved_by = registrar_id
   │   ├─> audit_logs (action: application_approved)
   │   ├─> audit_logs (action: student_record_created)
   └─> COMMIT TRANSACTION
   
4b. Registrar requests correction (status: 'correction_required')
   ├─> applications.current_status = 'correction_required'
   ├─> applications.correction_notes = notes
   ├─> application_status_histories (log: under_review → correction_required)
   ├─> audit_logs (action: correction_requested)
   
4c. Registrar rejects (status: 'rejected')
   ├─> applications.current_status = 'rejected'
   ├─> applications.rejection_reason = reason
   ├─> application_status_histories (log: under_review → rejected)
   ├─> audit_logs (action: application_rejected)
```

---

## Critical Constraints and Validations

### Database Level
1. Foreign key constraints with CASCADE/RESTRICT as appropriate
2. Unique constraints on email, application_number, student_id
3. Check constraints on date ranges (closing_date > opening_date)
4. Enum values enforced at database level

### Application Level
1. Date validation: admission period open and within date range
2. Status transition validation: only allowed transitions permitted
3. Role-based authorization: only registrar can approve
4. Duplicate prevention: one application per user per period
5. Student ID uniqueness: prevent duplicate generation
6. Document validation: file type, size, ownership

---

## Indexes Strategy

### High-Priority Indexes
- users.email (UNIQUE)
- applications.application_number (UNIQUE)
- applications.current_status
- applications.user_id
- students.student_id (UNIQUE)
- audit_logs.created_at

### Foreign Key Indexes
All foreign keys have indexes for join performance

### Composite Indexes
- audit_logs (auditable_type, auditable_id)
- applications (user_id, admission_period_id) - for duplicate check

---

## Future Expansion Considerations

### Phase 2+ Tables (Not in First Release)
- **courses**: Course/competency definitions
- **course_enrollments**: Student course registrations
- **assessments**: Assessment definitions
- **assessment_results**: Student assessment grades
- **attendance**: Student attendance records
- **certificates**: Certificate generation records
- **announcements**: System announcements
- **notifications**: User notifications

### Extensibility Points
- Polymorphic relationships where appropriate
- JSON columns for flexible metadata
- Status enums can be extended
- Document types can be dynamic
- Audit log captures all entity changes

---

## Data Retention & Archival

1. **Audit logs**: Retained indefinitely (legal requirement)
2. **Application status histories**: Retained indefinitely
3. **Rejected applications**: Retained for 2 years (policy TBD)
4. **Approved applications**: Retained permanently (linked to student)
5. **Inactive students**: Status changed, not deleted

---

## Security Considerations

1. **Password Storage**: Bcrypt hashing (Laravel default)
2. **Document Storage**: Private disk, authorized access only
3. **Audit Trail**: Immutable, comprehensive logging
4. **Personal Data**: GDPR-style considerations for Ethiopian context
5. **Access Control**: Role-based, enforced at model/policy level
6. **SQL Injection**: Protected by Eloquent ORM and prepared statements

---

## Database Diagram Summary

```
REFERENCE TABLES (Independent):
- roles
- departments
- occupations (→ departments)
- qualification_levels
- admission_periods

USER & PROFILE:
- users (→ roles)
- applicant_profiles (→ users)

APPLICATION SYSTEM:
- applications (→ users, admission_periods, departments, occupations, qualification_levels)
- application_documents (→ applications)
- application_status_histories (→ applications, users)

STUDENT RECORDS:
- students (→ applications, users, departments, occupations, qualification_levels)

AUDIT:
- audit_logs (→ users, polymorphic)
```

---

## Next Steps

1. ✅ Design complete
2. Create migrations in dependency order
3. Create Eloquent models with relationships
4. Create seeders for reference data
5. Write tests for relationships and constraints
6. Implement business logic in services

---

**Document Status**: Ready for Implementation  
**Last Updated**: November 2, 2026  
**Approved By**: Pending College Review
