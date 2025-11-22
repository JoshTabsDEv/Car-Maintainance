# Car Maintenance Log

A simple Car Maintenance Log application built with Next.js, MySQL, and Tailwind CSS. Features role-based access control with admin (full CRUD) and user (view-only) roles.

## Features

- **Authentication**: 
  - Google OAuth login (automatically creates user account)
  - Admin credentials login (username: `admin`, password: `admin`)
- **Role-Based Access**:
  - **Admin**: Full CRUD (Create, Read, Update, Delete) operations
  - **User**: View-only access to maintenance logs
- **Maintenance Log Management**:
  - Track car make, model, service type, date, mileage, cost, and notes
  - Admin can create, edit, and delete maintenance logs
  - Users can view all maintenance logs

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **MySQL** (via mysql2)
- **NextAuth.js** (Authentication)
- **Tailwind CSS** (Styling)
- **Vercel** (Deployment)

## Prerequisites

- Node.js 18+ installed
- MySQL database (local or hosted)
- Google OAuth credentials (for Google login)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd car-maintenance-log
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# Database Configuration
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306
DB_SSL=false

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_generate_with_openssl_rand_base64_32

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Initialize the database:
   - **Option 1**: Use the application's init endpoint:
     - Visit `http://localhost:3000/api/init-db` to create the necessary tables and admin user
   - **Option 2**: Manually run the SQL schema:
     - Make sure your MySQL database is running and accessible
     - Run the `schema.sql` file:
       ```bash
       mysql -h localhost -u root -p your_database < schema.sql
       ```
     - The admin user will be created automatically when you first login or by the init endpoint

5. Generate NextAuth Secret:
```bash
openssl rand -base64 32
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (for development)
7. For production, add: `https://yourdomain.com/api/auth/callback/google`
8. Copy the Client ID and Client Secret to your `.env.local` file

## Default Admin Credentials

- **Email/Username**: `admin@admin.com`
- **Password**: `admin`

**Note**: Please change the admin password after first login in production!

## Deployment

### Deployment to Vercel with DigitalOcean MySQL

1. **Set up DigitalOcean MySQL Database:**
   - Go to [DigitalOcean](https://www.digitalocean.com/)
   - Create a new MySQL Database cluster
   - Choose your plan and region
   - Note down your connection details:
     - Host
     - Port (usually 25060 for managed databases)
     - Username
     - Password
     - Database name

2. **Initialize Database Schema:**
   - Connect to your DigitalOcean database using a MySQL client (like MySQL Workbench, phpMyAdmin, or command line)
   - Run the `schema.sql` file to create tables:
     ```bash
     mysql -h your_host -P 25060 -u your_user -p your_database < schema.sql
     ```
   - Or use the application's init endpoint after deployment

3. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

4. **Import your project to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

5. **Configure Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all the environment variables:
     ```env
     DB_HOST=your_digitalocean_db_host
     DB_USER=your_digitalocean_db_user
     DB_PASSWORD=your_digitalocean_db_password
     DB_NAME=your_database_name
     DB_PORT=25060
     DB_SSL=true
     
     NEXTAUTH_URL=https://yourdomain.vercel.app
     NEXTAUTH_SECRET=your_nextauth_secret
     
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     ```
   - **Important for DigitalOcean**: Set `DB_SSL=true` since DigitalOcean requires SSL connections
   - For `NEXTAUTH_URL`, use your production URL: `https://perales.vercel.app` (without trailing slash)
   - **Important**: Make sure to add the production Google OAuth redirect URI in Google Cloud Console:
     - `https://perales.vercel.app/api/auth/callback/google`
     - Note: The callback URL is `/api/auth/callback/google`, NOT `/app/api/callback`

6. **Deploy:**
   - Vercel will automatically deploy on every push to main branch
   - After deployment, visit `https://yourdomain.vercel.app/api/init-db` to initialize the database (if you haven't run schema.sql manually)

7. **Other MySQL Hosting Options:**
   - **PlanetScale**: Serverless MySQL platform that works great with Vercel
   - **Railway**: MySQL hosting with easy setup
   - **AWS RDS**: Fully managed MySQL database
   - **Any MySQL hosting service**: Just update the connection details

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth configuration
│   │   ├── maintenance/            # CRUD API routes
│   │   └── init-db/                # Database initialization
│   ├── dashboard/                  # Dashboard page
│   ├── login/                      # Login page
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page (redirects)
│   └── globals.css                 # Global styles
├── components/
│   ├── AdminDashboard.tsx          # Admin dashboard component
│   ├── UserDashboard.tsx           # User dashboard component
│   ├── MaintenanceForm.tsx         # Form for create/edit
│   └── MaintenanceList.tsx         # List of maintenance logs
├── lib/
│   ├── db.ts                       # MySQL connection pool
│   └── auth.ts                     # NextAuth configuration
├── types/
│   └── next-auth.d.ts              # TypeScript types for NextAuth
├── middleware.ts                   # Authentication middleware
└── ...config files
```

## API Routes

- `GET /api/maintenance` - Get all maintenance logs (authenticated users)
- `POST /api/maintenance` - Create new maintenance log (admin only)
- `GET /api/maintenance/[id]` - Get single maintenance log (authenticated users)
- `PUT /api/maintenance/[id]` - Update maintenance log (admin only)
- `DELETE /api/maintenance/[id]` - Delete maintenance log (admin only)
- `GET /api/init-db` - Initialize database tables (one-time setup)

## Database Schema

The `schema.sql` file contains the complete database schema for DigitalOcean MySQL. You can:

**Option 1: Run schema.sql manually**
```bash
mysql -h your_host -P 25060 -u your_user -p your_database < schema.sql
```

**Option 2: Use the init endpoint**
- Visit `/api/init-db` after deployment to automatically initialize tables
- The admin user will be created automatically with email `admin@admin.com` and password `admin`

**Schema includes:**
- `users` table - For authentication (admin and user roles, Google OAuth support)
- `maintenance_logs` table - For storing car maintenance records
- Indexes for optimized queries
- UTF8MB4 character set for full Unicode support

**DigitalOcean MySQL Setup:**
1. Create a MySQL database cluster in DigitalOcean
2. Get your connection details (host, port, username, password, database name)
3. Set `DB_SSL=true` in your environment variables (DigitalOcean requires SSL)
4. Run the schema.sql file or use the init endpoint

## License

MIT

