# UNIDEL Voting System Backend API

A production-ready REST API for academic institution voting systems, featuring role-based access control, secure authentication, and comprehensive audit logging.

---

## 🎯 Overview

The UNIDEL Voting System Backend is a robust, scalable Express.js API designed to manage student elections with administrative oversight. The system supports secure voter registration, real-time vote counting, fraud prevention mechanisms, and complete audit trails for compliance and security.

**Key Capabilities:**
- Secure student authentication with session-based security
- Multi-category voting with duplicate vote prevention
- Role-based access control (Student, Admin)
- Real-time voting results and analytics
- Comprehensive audit logging for compliance
- Docker-ready deployment
- Production-grade security headers and CORS
- RESTful OpenAPI 3.0 documentation

---

## 🏗️ Architecture

```
voting-backend-system/
├── api/
│   ├── v1/                          # Public API endpoints
│   │   ├── controllers/              # Business logic
│   │   └── routes/                   # Route definitions
│   └── admin/                        # Administrative endpoints
│       ├── controllers/              # Admin business logic
│       └── routes/                   # Admin routes
├── config/                           # Application configuration
│   ├── db.js                        # PostgreSQL connection pool
│   ├── passport.js                  # Authentication strategy
│   └── index.js                     # Global config
├── middleware/                       # Custom middleware
│   ├── isAuthenticated.js           # Auth verification
│   └── isAdmin.js                   # Admin role verification
├── server.js                        # Express server entry point
├── openapi.yaml                     # API documentation
├── docker-compose.yml               # Multi-container setup
├── Dockerfile                       # Container configuration
├── init.sql                         # Database schema
└── package.json                     # Dependencies
```

---

## 📋 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 20 | JavaScript runtime |
| **Framework** | Express.js 5+ | Web application framework |
| **Database** | PostgreSQL 12+ | Relational data storage |
| **Authentication** | Passport.js | User authentication strategy |
| **Security** | Helmet.js | Security headers management |
| **Logging** | Morgan | HTTP request logging |
| **Process Manager** | Nodemon | Development auto-reload |
| **Containerization** | Docker Compose | Multi-container orchestration |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 12+
- Docker & Docker Compose (optional, for containerized setup)

### Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Create .env file
   cat > .env << EOF
   NODE_ENV=development
   PORT=5000
   PGUSER=dbuser
   PGPASSWORD=password
   PGDATABASE=your_db
   PGHOST=localhost
   PGPORT=5432
   SECRET_KEY=your-session-secret-key
   ALLOWED_ORIGINS=http://localhost:3000
   EOF
   ```

3. **Initialize database:**
   ```bash
   npm install --save-dev dotenv-cli
   npm run db:init
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Docker Deployment

1. **Configure environment:**
   ```bash
   cat > .env << EOF
   DB_USER=postgres
   DB_PASSWORD=your-strong-password
   DB_NAME=voting_backend
   NODE_ENV=production
   SECRET_KEY=your-secure-session-key
   EOF
   ```

2. **Launch containers:**
   ```bash
   docker-compose up -d
   ```

3. **Verify health:**
   ```bash
   curl http://localhost:5000/health
   ```

---

## 💻 API Endpoints

Full API documentation available in [OpenAPI Specification](./openapi.yaml) or view with Swagger UI.

### Authentication (v1)
- `POST /api/v1/auth/register` - Student registration
- `POST /api/v1/auth/login` - Student login
- `POST /api/v1/auth/logout` - Session termination

### Voting (v1)
- `GET /api/v1/categories` - Browse voting categories
- `GET /api/v1/categories/:id/contestants` - View contestants per category
- `POST /api/v1/categories/:id/vote` - Submit vote
- `DELETE /api/v1/votes/:id` - Retract vote (before deadline)

### Administration (Admin)
- `POST /api/admin/auth/login` - Admin authentication
- `GET /api/admin/contests/:contestId/results` - Real-time results
- `GET /api/admin/audit-logs` - Voting audit trail
- `POST /api/admin/contests` - Create contests
- `PATCH /api/admin/contests/:id` - Manage contest status

---

## 🔐 Security Features

✅ **Session-Based Authentication** - Secure session cookies with HTTPOnly flag  
✅ **Password Hashing** - bcrypt with salt rounds  
✅ **Duplicate Vote Prevention** - Database constraint at SQL level  
✅ **Audit Logging** - Complete action history for compliance  
✅ **CORS Protection** - Configurable origin validation  
✅ **Security Headers** - Helmet.js manages CSP, X-Frame-Options, etc.  
✅ **SQL Injection Prevention** - Parameterized queries via pg library  
✅ **Role-Based Access Control** - Admin vs Student permissions  

---

## 📊 Database Schema

### Core Tables
- **users** - Student accounts with bcrypt passwords
- **categories** - Voting election categories (President, VP, etc.)
- **contests** - Candidate registrations per category
- **votes** - Voting records with fraud prevention constraints
- **audit_logs** - Complete action tracking for security audits

**Key Constraint:** `UNIQUE (voter_id, contest_id)` prevents multiple votes per election category.

---

## 🔧 Configuration

### Environment Variables

```env
# Server
NODE_ENV=development|production
PORT=5000

# Database (use one approach)
# Option 1: Connection String (for Supabase, AWS RDS, etc.)
DATABASE_URL=postgresql://user:password@host:port/database

# Option 2: Individual Variables (legacy)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=voting_backend

# Security
SECRET_KEY=your-session-encryption-key
FRONTEND_URL=http://localhost:3000
```

### Production Database (Supabase/AWS RDS)

Update `DATABASE_URL` environment variable in production:
```env
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/voting_backend?sslmode=require
```

---

## 📦 Scripts

```bash
npm start              # Run production server
npm run dev            # Run with nodemon (development)
npm run db:init        # Initialize PostgreSQL schema
npm test               # Run test suite (configure as needed)
```

---

## 🧪 Testing

```bash
# Register a student
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "matric_number": "UID2024001",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "matric_number": "UID2024001",
    "password": "SecurePass123!"
  }'

# View categories
curl http://localhost:5000/api/v1/categories -b cookies.txt
```

---

## 📚 API Documentation

The complete API specification is available in the [OpenAPI YAML](./openapi.yaml) file, detailing:
- Request/response schemas
- Authentication flows
- Error codes and handling
- Security requirements
- Example payloads

**View in Tools:**
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Import `openapi.yaml`
- [Postman](https://www.postman.com/) - Import as API definition
- [ReDoc](https://redoc.ly/) - Alternative documentation viewer

---

## 🐳 Docker Setup

### Container Configuration

The system uses Docker Compose with two services:

1. **app** - Express.js application (Node 20 Alpine)
2. **db** - PostgreSQL database (latest version)

### Health Checks

```bash
# Check app health
docker-compose exec app curl http://localhost:5000/health

# Check database connectivity
docker-compose exec db pg_isready -U postgres
```

### View Logs

```bash
docker-compose logs -f app
docker-compose logs -f db
```

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production `DATABASE_URL` (Supabase/AWS RDS)
- [ ] Generate strong `SECRET_KEY` for session encryption
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Enable HTTPS/TLS certificates
- [ ] Configure firewall rules (port 5000)
- [ ] Set up backup strategy for PostgreSQL
- [ ] Enable monitoring/alerting on API endpoints
- [ ] Review audit logs regularly
- [ ] Test failover and recovery procedures

---

## 📈 Performance Considerations

- **Connection Pooling** - pg library manages PostgreSQL connection pool
- **Index Strategy** - Consider indexes on `voter_id`, `contest_id`, `matric_number`
- **Session Store** - For production, migrate to Redis: `connect-redis`
- **Caching** - Add Redis for category/contestant caching
- **Load Balancing** - Run multiple app instances behind nginx

---

## 🤝 Contributing

This is a specialized voting system. Contributions should focus on:
- Security hardening
- Performance optimization
- Additional audit logging
- Admin dashboard features
- Database schema improvements

---

## 📄 License

ISC

---

## 👨‍💻 Built By

Developed with focus on security, scalability, and compliance.

**Questions or Issues?** Review the [OpenAPI documentation](./openapi.yaml) or check the INSTRUCTION notes in the NOTE/ directory.
