# JobTrackr - Full-Stack Job Application Tracker

A modern full-stack web application for tracking, organizing, and managing your job applications throughout your job search journey.

**🎯 Live Demo**: [https://jobtrackr.vercel.app](https://jobtrackr.vercel.app)
**💻 GitHub**: [github.com/toluwalasefasoyin/jobtrackr](https://github.com/toluwalasefasoyin/jobtrackr)

## 📱 What JobTrackr Does

JobTrackr simplifies job hunting by providing a centralized platform to:

- **Track Applications**: Record every job application with company name, position, date applied, and application link
- **Monitor Status**: Update application status (Applied, Interview, Offer, Rejected) as you progress through hiring pipelines
- **View Analytics**: See at-a-glance statistics on total applications, interviews scheduled, and offers received
- **Filter & Search**: Quickly find applications by status (All, Applied, Interview, Offer, Rejected)
- **Manage Records**: Add, edit, and delete job applications with a clean, intuitive interface
- **Secure Access**: User authentication with JWT tokens ensures your data is private and secure

## 🛠️ Tech Stack

### Backend
- **Java 21 LTS** - Latest long-term support Java runtime
- **Spring Boot 3.5.13** - Modern, fast web framework
- **Spring Security 6.x** - JWT-based authentication
- **Spring Data JPA** - Object-relational mapping with Hibernate
- **Hibernate 6.6.45** - ORM framework
- **PostgreSQL 14+** - Powerful open-source relational database
- **HikariCP** - High-performance connection pooling
- **Maven 3.9.12** - Build automation
- **Docker** - Containerization for easy deployment
- **Apache Tomcat 10.1** - Embedded web server

### Frontend
- **React 19.2** - JavaScript UI library
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 8.0** - Lightning-fast build tool
- **Tailwind CSS 4.2** - Utility-first CSS framework
- **Axios 1.14** - HTTP client with JWT interceptors
- **React Router 7.13** - Client-side routing
- **Context API** - State management for auth & user profile

## � Screenshots

### Login & Registration
Clean, modern authentication interface with email validation and secure password handling.

### Dashboard with Statistics
- Real-time statistics cards (Total Applications, Interviews, Offers, Rejected)
- Status filter buttons for quick navigation
- Comprehensive job applications table with edit/delete actions
- User greeting with logout button

### Add/Edit Application Modal
- Form fields for company name, position title, application link, and status
- Date picker for application date
- Real-time form validation

## �🚀 How to Run Locally

### Prerequisites
- **Java 21 LTS** - Download from [Eclipse Adoptium](https://adoptium.net/temurin/releases/?version=21)
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **PostgreSQL 14+** - Download from [postgresql.org](https://www.postgresql.org/download/)
- **Git** - Download from [git-scm.com](https://git-scm.com/)

### Setup Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/jobtrackr.git
cd jobtrackr
```

#### 2. Setup Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jobtrackr;
\c jobtrackr

# Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

# Create job_applications table
CREATE TABLE job_applications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  position_title VARCHAR(255) NOT NULL,
  application_link VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
  date_applied DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

# Create index for better performance
CREATE INDEX idx_user_id ON job_applications(user_id);
CREATE INDEX idx_status ON job_applications(status);
```

#### 3. Configure Backend
```bash
cd backend
```

Update `src/main/resources/application.properties`:
```properties
spring.application.name=demo
spring.datasource.url=jdbc:postgresql://localhost:5432/jobtrackr
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
server.port=8080
```

#### 4. Start Backend
```bash
# From backend directory
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

#### 5. Setup Frontend
```bash
cd ../frontend
npm install
```

#### 6. Start Frontend
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173` (or next available port)

#### 7. Access Application
Open your browser to the frontend URL and:
1. **Register** - Create a new account
2. **Login** - Use your credentials
3. **Dashboard** - Start tracking your job applications!

## 📸 Screenshots

### Login Page
Clean, minimal login interface with email and password fields.

### Dashboard
- Statistics cards showing total applications, interviews, offers, and rejections
- Status filter buttons for quick filtering
- Comprehensive table listing all applications with edit/delete actions
- User profile display with logout button

### Add/Edit Application
- Modal form with fields for company name, position title, application link, and status
- Date picker for application date
- Real-time form validation

## 🔐 Security Features

- **JWT Authentication** - Secure token-based user authentication
- **Password Hashing** - Passwords are encrypted and never stored in plain text
- **CORS Protection** - Cross-origin requests properly validated
- **Stateless Sessions** - JWT eliminates need for server-side session storage
- **Protected Routes** - API endpoints require valid JWT token (except auth endpoints)

## 📁 Project Structure

```
jobtrackr/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/com/jobtrackr/
│   │   ├── config/
│   │   │   └── SecurityConfig.java   # Spring Security & CORS config
│   │   ├── controller/
│   │   │   ├── AuthController.java   # Auth endpoints
│   │   │   └── JobApplicationController.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   └── JobApplication.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   └── JobApplicationRepository.java
│   │   ├── service/
│   │   │   └── AuthService.java
│   │   └── DemoApplication.java      # Main entry point
│   ├── pom.xml                       # Maven dependencies
│   └── mvnw                          # Maven wrapper
│
├── frontend/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── components/
│   │   │   ├── JobApplicationForm.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # Authentication state
│   │   │   └── ProfileContext.tsx    # User profile state
│   │   ├── api/
│   │   │   └── jobApplications.ts    # API service with strong typing
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                   # Main app component
│   │   └── main.tsx                  # Entry point
│   ├── package.json                  # npm dependencies
│   ├── vite.config.ts                # Vite configuration
│   └── tailwind.config.ts            # Tailwind CSS config
│
└── README.md                         # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with credentials, returns JWT token
- `GET /api/auth/profile` - Get current user profile (requires JWT)

### Job Applications (All require JWT token)
- `GET /api/applications` - List all user's applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

## 🚢 Deployment

### Deploy Backend to Render
1. Go to [render.com](https://render.com)
2. **New +** → **Web Service**
3. Connect your GitHub repo (`jobtrackr`)
4. **Settings**:
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
5. **Environment Variables**:
   - `JWT_SECRET=am9idHJhY2tyX3N1cGVyX3NlY3JldF9rZXlfY2hhbmdlX2luX3Byb2R1Y3Rpb25fMjAyNA==`
   - `SPRING_DATASOURCE_URL`: (Render will provide PostgreSQL connection)
6. Click **Create Web Service**

You'll get a backend URL: `https://jobtrackr-api.onrender.com`

### Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. **Add New** → **Project** → **Import Git Repository**
3. Select your `jobtrackr` repo
4. **Root Directory**: `./frontend`
5. Click **Deploy**

You'll get a frontend URL: `https://jobtrackr.vercel.app`

## 📤 Push to GitHub

```bash
cd jobtrackr
git add .
git commit -m "Initial commit - JobTrackr full-stack job application tracker"
git push origin main
```

## 📝 License

This project is open source and available under the MIT License.

## 💡 Future Enhancements

- Email notifications for application reminders
- Interview scheduling with calendar integration
- Resume management and version control
- Job description analysis and matching
- Export applications to CSV/PDF
- Mobile app (React Native)
- Dark mode theme

## 👤 Author

Toluwalase Fasoyin

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

---

**Happy job hunting! 🎯**
