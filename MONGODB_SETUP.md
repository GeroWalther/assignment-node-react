# MongoDB Setup Guide

## Prerequisites

- Docker and Docker Compose installed on your system

## Docker Compose vs Single Container Approach

### Why We Use Docker Compose Instead of Simple `docker run`

You might wonder why we use Docker Compose instead of a simple command like:

```bash
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:6.0.4
```

Here's the comparison:

### **Single Container Approach:**

```bash
# Simple but limited:
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:6.0.4
```

**Pros:**

- ✅ Quick and simple for basic testing
- ✅ Single command
- ✅ Good for learning MongoDB basics

**Cons:**

- ❌ No authentication (security risk)
- ❌ No data persistence (data lost on container removal)
- ❌ No management interface
- ❌ Manual network configuration
- ❌ Hard to reproduce across environments
- ❌ No version control for configuration

### **Our Docker Compose Approach:**

```yaml
# Professional setup with multiple services
services:
  mongodb: # Secure, persistent database
  mongo-express: # Web management interface
  volumes: # Data persistence
  networks: # Isolated networking
```

**Pros:**

- ✅ **Built-in authentication** (admin/password123)
- ✅ **Data persistence** with named volumes
- ✅ **Management GUI** (Mongo Express on port 8081)
- ✅ **Network isolation** for security
- ✅ **Version controlled** configuration
- ✅ **Team-friendly** - easy to share and reproduce
- ✅ **Production-ready** patterns
- ✅ **Multi-service management** (database + UI)

**Cons:**

- ❌ Slightly more complex initially
- ❌ Requires Docker Compose knowledge

### **When to Use Each:**

**Single Container** - Good for:

- Quick prototyping
- Learning MongoDB commands
- Temporary testing

**Docker Compose** - Better for:

- **Study projects** (like this assessment)
- Team development
- Production-like environments
- Long-term development

## Setup Instructions

### 1. Start MongoDB with Docker Compose

From the project root directory, run:

```bash
# For newer Docker versions (recommended):
docker compose up -d

# OR for older Docker versions:
docker-compose up -d
```

This will start:

- MongoDB on port 27017
- Mongo Express (Database UI) on port 8081

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Seed the Database

```bash
npm run seed
```

This will migrate all existing data from `data/items.json` into MongoDB.

### 4. Start the Backend Server

```bash
npm run dev
```

## Environment Configuration

The application uses these default MongoDB settings:

- **Host**: localhost:27017
- **Database**: assessment_db
- **Username**: admin
- **Password**: password123

To customize these settings, create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/assessment_db?authSource=admin
PORT=4001
NODE_ENV=development
```

## Database Management

### MongoDB Express UI (Web-based GUI)

**Mongo Express is a GUI!** It's a web-based MongoDB administration interface.

Access the database management interface at: http://localhost:8081

**What you can do with Mongo Express:**

- 📊 **View databases and collections** visually
- 📝 **Browse and edit documents** with a user-friendly interface
- 🔍 **Run queries** without command line
- 📈 **View collection statistics** and indexes
- 🗑️ **Delete documents/collections** easily
- 📋 **Import/Export data** in JSON format

**Screenshots in browser:**

- Database list → Collections → Documents
- Click-to-edit documents
- Query builder interface
- Real-time data updates

### Useful Docker Commands

```bash
# Start containers
docker compose up -d
# OR: docker-compose up -d

# Stop containers
docker compose down
# OR: docker-compose down

# View logs
docker compose logs mongodb
# OR: docker-compose logs mongodb

# Reset database (removes all data)
docker compose down -v
docker compose up -d
npm run seed
```

## API Endpoints

The API endpoints remain the same:

- `GET /api/items` - List items with pagination and search
- `GET /api/items/:id` - Get specific item
- `POST /api/items` - Create new item
- `GET /api/stats` - Get statistics

## Local vs Production Environments

### **This Setup is Perfect for Local Development & Study**

✅ **Valid for local running and testing:**

- Great for learning MongoDB concepts
- Perfect for development and experimentation
- Excellent for portfolio/assessment projects
- Safe environment to break things and learn

### **For Production - We need Different Approaches:**

#### **Option 1: MongoDB Atlas (Cloud - Recommended)**

```env
# Production environment variable:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/assessment_db
```

**MongoDB Atlas Benefits:**

- ✅ Fully managed (no server maintenance)
- ✅ Automatic backups and scaling
- ✅ Built-in security and monitoring
- ✅ Global distribution
- ✅ Free tier available for small projects

#### **Option 2: Self-hosted Production MongoDB**

```yaml
# Production docker-compose.yml would include:
- Replica sets for high availability
- Authentication with certificates
- Monitoring (Prometheus/Grafana)
- Backup strategies
- Load balancers
- SSL/TLS encryption
```

#### **Production Considerations:**

- 🔒 **Security**: SSL, firewalls, authentication
- 📊 **Monitoring**: Performance, alerts, logging
- 💾 **Backups**: Automated, tested restore procedures
- 🚀 **Scaling**: Replica sets, sharding
- 🌐 **Networking**: VPCs, private networks
- 🔄 **Updates**: Rolling updates, maintenance windows

## Migration Notes

- All existing data from `items.json` is preserved in MongoDB
- API responses maintain the same format
- Frontend requires no changes
- Original JSON file can be kept as backup or deleted after successful migration

### **Can I Delete items.json?**

**Yes, after successful migration:**

- ✅ Your app no longer reads from the JSON file
- ✅ All data is now stored in MongoDB
- ✅ Routes have been updated to use MongoDB

**Recommendation:** Keep it as backup until you're confident everything works!

```bash
# To delete after confirming everything works:
rm data/items.json

# Or move to backup location:
mkdir backup
mv data/items.json backup/original-items.json
```
