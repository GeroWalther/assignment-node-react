# Docker Development Environment Guide

## 🐳 Complete Dockerized Development Setup

This guide explains how to run the entire application stack using Docker with **hot reload** for both frontend and backend development.

## 🤔 Why Dockerfiles for Frontend/Backend but Not MongoDB?

### **MongoDB - Pre-built Image:**

```yaml
mongodb:
  image: mongo:7.0 # ← Official pre-built image
```

- ✅ **Ready-to-use**: MongoDB team maintains official Docker images
- ✅ **No customization needed**: Standard database, just needs configuration
- ✅ **Environment variables**: Handle all setup (users, database, ports)

### **Frontend/Backend - Custom Applications:**

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.dev # ← Custom Dockerfile needed
```

- 🛠️ **Your custom code**: React and Node.js applications
- 📦 **Dependencies**: Need to install your specific npm packages
- ⚙️ **Build process**: Compile TypeScript, bundle assets, configure environment
- 🔧 **Development tools**: Hot reload, debugging, file watching

## 🚀 One Command to Rule Them All

### **Start Everything:**

```bash
# Option 1: Using the convenience script
./dev.sh

# Option 2: Direct Docker Compose
docker compose -f docker-compose.dev.yml up --build

# Option 3: Background mode
docker compose -f docker-compose.dev.yml up --build -d
```

### **What Gets Started:**

- 🗃️ **MongoDB** on port 27017 (database)
- 🖥️ **Mongo Express** on port 8081 (database UI)
- ⚡ **Backend API** on port 4001 (with hot reload)
- 🎨 **Frontend** on port 3000 (with hot reload)

## 📁 File Structure

```
📁 assessment/
├── 🐳 docker-compose.dev.yml        # Development orchestration
├── 🚀 dev.sh                       # One-command startup script
├── 🔧 backend/
│   ├── 📋 Dockerfile.dev           # Backend development image
│   ├── 🚫 .dockerignore            # Ignore unnecessary files
│   └── 📦 src/                     # Source code (mounted for hot reload)
├── 🎨 frontend/
│   ├── 📋 Dockerfile.dev           # Frontend development image
│   ├── 🚫 .dockerignore            # Ignore unnecessary files
│   └── 📦 src/                     # Source code (mounted for hot reload)
└── 📊 DOCKER_DEVELOPMENT_GUIDE.md  # This guide
```

## 🔥 Hot Reload Magic

### **How It Works:**

```yaml
# Volume mounting for live code updates
volumes:
  - ./backend/src:/app/src # Mount source code
  - ./frontend/src:/app/src # Changes reflect instantly
  - /app/node_modules # Exclude node_modules
```

### **Backend Hot Reload:**

- Uses **nodemon** to watch file changes
- Automatically restarts server on code changes
- MongoDB connection persists across restarts

### **Frontend Hot Reload:**

- React's built-in hot reload with **CHOKIDAR_USEPOLLING**
- Instant browser updates on file changes
- State preservation during updates

## 🛠️ Development Commands

### **Full Stack Development:**

```bash
# Start entire stack with hot reload
./dev.sh

# Or with Docker Compose directly
docker compose -f docker-compose.dev.yml up --build
```

### **Individual Services:**

```bash
# Backend only
docker compose -f docker-compose.dev.yml up --build backend

# Frontend only
docker compose -f docker-compose.dev.yml up --build frontend

# Database only
docker compose -f docker-compose.dev.yml up --build mongodb mongo-express
```

### **Database Operations:**

```bash
# Seed database with initial data
docker compose -f docker-compose.dev.yml exec backend npm run seed

# Access MongoDB shell
docker compose -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123

# View logs
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs frontend
```

### **Utility Commands:**

```bash
# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (fresh start)
docker compose -f docker-compose.dev.yml down -v

# View running containers
docker compose -f docker-compose.dev.yml ps

# Follow logs in real-time
docker compose -f docker-compose.dev.yml logs -f
```

## 🌐 Access Points

Once running, access your application at:

| Service         | URL                       | Description                        |
| --------------- | ------------------------- | ---------------------------------- |
| **Frontend**    | http://localhost:3000     | React application with hot reload  |
| **Backend API** | http://localhost:4001/api | Node.js API endpoints              |
| **Database UI** | http://localhost:8081     | Mongo Express management interface |
| **MongoDB**     | localhost:27017           | Direct database connection         |

## 🔧 Environment Variables

### **Development Configuration:**

```yaml
# Backend
NODE_ENV: development
MONGODB_URI: mongodb://admin:password123@mongodb:27017/assessment_db?authSource=admin
PORT: 4001

# Frontend
CHOKIDAR_USEPOLLING: true # Enable hot reload in Docker
REACT_APP_API_URL: http://localhost:4001
```

## 🚀 Production vs Development

### **Development Setup (Current):**

- Hot reload enabled
- Source code mounted as volumes
- Development dependencies included
- Debugging tools available

### **Production Setup (Future):**

```yaml
# Would use different Dockerfiles:
frontend:
  build:
    dockerfile: Dockerfile.prod # Optimized build
backend:
  build:
    dockerfile: Dockerfile.prod # Production optimizations
```

## 🎯 Benefits of This Setup

### **Developer Experience:**

- ✅ **One command startup**: `./dev.sh` starts everything
- ✅ **Hot reload**: Instant feedback on code changes
- ✅ **Consistent environment**: Same setup across all machines
- ✅ **No local dependencies**: Only Docker required

### **Professional Development:**

- ✅ **Production parity**: Similar to production environment
- ✅ **Team collaboration**: Same setup for entire team
- ✅ **Easy onboarding**: New developers up and running in minutes
- ✅ **Isolated services**: Each service in its own container

## 💡 Understanding Docker Images vs Source Code

### **🎯 Key Insight: Docker Images are Self-Contained Applications**

This is a crucial concept that many developers miss:

**Development Mode (`./dev.sh`):**

- **Requires**: Local source code files (`./backend/src/`, `./frontend/src/`)
- **How it works**: Volume mounting maps your local files into containers
- **Benefit**: Hot reload - edit code, see changes instantly
- **Use case**: Active development, debugging, experimentation

**Production Images (`./scripts/run-prod.sh`):**

- **Requires**: Only Docker (no source code needed!)
- **How it works**: Code is baked into the Docker images during build
- **Benefit**: Run anywhere, no dependencies, immutable deployments
- **Use case**: Demos, sharing, production deployment

### **What's Inside a Docker Image?**

When you run `./scripts/build-and-push.sh`, it creates images containing:

- ✅ **Your complete source code**
- ✅ **All dependencies** (node_modules, packages)
- ✅ **Runtime environment** (Node.js, nginx)
- ✅ **Configuration files**
- ✅ **Everything needed to run the application**

### **The Power of Self-Contained Images:**

```bash
# Extreme example - this actually works:
rm -rf backend/ frontend/  # Delete ALL your source code
./scripts/run-prod.sh      # App still runs perfectly!
```

**Why?** Because your code lives inside the Docker images, not on your filesystem.

### **Two Worlds of Development:**

| Aspect           | Development Mode    | Production Images         |
| ---------------- | ------------------- | ------------------------- |
| **Source Code**  | Required locally    | Not needed (baked in)     |
| **Dependencies** | Volume mounted      | Built into image          |
| **Hot Reload**   | ✅ Yes              | ❌ No                     |
| **Startup Time** | 3-5 minutes (build) | 30 seconds (pull)         |
| **Use Case**     | Active coding       | Deployment/sharing        |
| **Internet**     | Not required        | Required (to pull images) |

### **Team Collaboration Workflow:**

**For Code Changes:**

```bash
git pull origin main  # Get colleague's source code changes
./dev.sh             # Develop with hot reload using updated code
```

**For Image Updates:**

```bash
./scripts/run-prod.sh  # Automatically pulls colleague's latest images
# No git pull needed - images contain the code
```

### **Real-World Scenarios:**

**Scenario 1: New Team Member**

```bash
# Traditional way:
git clone repo
cd project
npm install  # Install frontend deps
cd backend && npm install  # Install backend deps
# Setup database, configure environment...
# 30+ minutes of setup

# With Docker images:
./scripts/run-prod.sh  # 30 seconds - done!
```

**Scenario 2: Cloud Deployment**

```bash
# On AWS/Azure/GCP server (no source code):
docker compose -f docker-compose.prod.yml up -d
# Application running in production
```

**Scenario 3: Demo/Presentation**

```bash
# Clean machine, no development setup:
./scripts/run-prod.sh  # Professional demo ready instantly
```

This is exactly how **Netflix, Spotify, and Airbnb** deploy applications - build once, run anywhere with Docker images! 🚀

## 🐛 Troubleshooting

### **Common Issues:**

**Port already in use:**

```bash
# Check what's using the port
lsof -i :3000
lsof -i :4001

# Kill the process or use different ports
docker compose -f docker-compose.dev.yml down
```

**Hot reload not working:**

```bash
# For macOS/Windows, try enabling polling
CHOKIDAR_USEPOLLING=true
```

**Database connection issues:**

```bash
# Check if MongoDB is running
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs mongodb
```

**Build cache issues:**

```bash
# Force rebuild without cache
docker compose -f docker-compose.dev.yml build --no-cache
```

## 🎉 Getting Started

1. **Ensure Docker is running**
2. **Run the magic command:**
   ```bash
   ./dev.sh
   ```
3. **Wait for all services to start** (~2-3 minutes first time)
4. **Open your browser** to http://localhost:3000
5. **Start coding!** Changes will reflect automatically

Your complete development environment is now running with hot reload! 🚀
