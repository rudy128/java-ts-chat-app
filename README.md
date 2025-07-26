# 🚀 Java-TypeScript Chat Application

A modern, real-time messaging application built with **Spring Boot** backend and **React TypeScript** frontend, featuring WebSocket communication, media sharing, and a beautiful glassmorphism UI.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green)
![Redis](https://img.shields.io/badge/Redis-7-red)

## ✨ Features

### 🎯 Core Features
- **Real-time messaging** with WebSocket connection
- **User authentication** with JWT tokens
- **Media sharing** (Images, Videos, Audio, Documents up to 65MB)
- **Emoji picker** with 6 categories
- **User search** and discovery
- **Online status** indicators
- **Message delivery status** (sent, delivered, read)
- **Responsive design** for mobile and desktop

### 🎨 UI/UX Features
- **Glassmorphism design** with backdrop blur effects
- **Smooth animations** and transitions
- **Dark theme** with gradient accents
- **Media preview** with proper icons in sidebar
- **Typing indicators**
- **Message timestamps** with smart grouping

### 🔧 Technical Features
- **Reactive programming** with Spring WebFlux
- **MongoDB** for data persistence
- **Redis** for session management and caching
- **File upload** with validation and CDN serving
- **CORS configuration** for cross-origin requests
- **Security** with JWT authentication
- **Docker-ready** configuration

## 📁 Project Structure

```
Java-CRM-Project/
├── messaging-app-backend/          # Spring Boot Backend
│   ├── src/main/java/             # Java source code
│   │   └── com/messaging/backend/
│   │       ├── controller/        # REST controllers
│   │       ├── service/          # Business logic
│   │       ├── model/            # Data models
│   │       ├── repository/       # Data repositories
│   │       ├── websocket/        # WebSocket handlers
│   │       ├── security/         # Security configuration
│   │       └── config/           # App configuration
│   ├── src/main/resources/       # Configuration files
│   ├── media/                    # File uploads directory
│   └── pom.xml                   # Maven dependencies
├── frontend/                      # React TypeScript Frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── auth/            # Authentication forms
│   │   │   ├── chat/            # Chat interface
│   │   │   └── ui/              # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── stores/              # State management
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom hooks
│   │   └── types/               # TypeScript types
│   └── package.json             # Node dependencies
└── README.md                     # This file
```

## 🛠️ Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring WebFlux** - Reactive web framework
- **Spring Security** - Authentication & authorization
- **MongoDB** - Document database
- **Redis** - Caching and session store
- **WebSocket** - Real-time communication
- **JWT** - Token-based authentication
- **Maven** - Dependency management

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS
- **WebSocket API** - Real-time communication

## 🚀 Quick Start

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **MongoDB 7+**
- **Redis 7+**
- **Maven 3.6+**
- **pnpm** (recommended) or npm

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Java-CRM-Project
```

### 2. Backend Setup
```bash
cd messaging-app-backend

# Install dependencies and build
mvn clean install

# Run MongoDB (if not using Docker)
mongod --dbpath /path/to/your/db

# Run Redis (if not using Docker)
redis-server

# Start the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend will start on `http://localhost:5173`

### 4. Create Your First User
- Open `http://localhost:5173`
- Register a new account
- Start chatting!

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    container_name: chatapp-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your-secure-password
      MONGO_INITDB_DATABASE: messaging_db

  redis:
    image: redis:7-alpine
    container_name: chatapp-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  chatapp-backend:
    build: ./messaging-app-backend
    container_name: chatapp-backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATA_MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/messaging_db?authSource=admin
      - SPRING_DATA_REDIS_HOST=redis
      - JWT_SECRET=your-super-long-jwt-secret-key-here
      - CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
    volumes:
      - ./messaging-app-backend/media:/app/media
    depends_on:
      - mongodb
      - redis

volumes:
  mongodb_data:
  redis_data:
```

### Build and Run
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Production Deployment

### Backend on Your Server

1. **Setup Nginx** (`/etc/nginx/sites-available/chatapp`):
```nginx
server {
    listen 443 ssl;
    server_name backend.your-domain.com;
    
    # SSL certificates
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    # File upload size
    client_max_body_size 70M;
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
    
    # API endpoints
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **Setup SSL**:
```bash
sudo certbot --nginx -d backend.your-domain.com
```

3. **Deploy with Docker**:
```bash
docker-compose up -d
sudo systemctl enable nginx
sudo systemctl reload nginx
```

### Frontend on Vercel

1. **Build Configuration** (`vercel.json`):
```json
{
  "builds": [{ "src": "package.json", "use": "@vercel/static-build" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.html" }],
  "env": {
    "REACT_APP_API_URL": "https://backend.your-domain.com"
  }
}
```

2. **Deploy**:
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

## 🔧 Configuration

### Backend Configuration

**`application.properties`** (Development):
```properties
server.port=8080
spring.application.name=messaging-backend

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/messaging_db

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# File upload
spring.servlet.multipart.max-file-size=65MB
spring.servlet.multipart.max-request-size=65MB
file.upload-dir=./media

# JWT
jwt.secret=your-jwt-secret-key
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:5173
```

**`application-prod.properties`** (Production):
```properties
server.port=8080

# MongoDB
spring.data.mongodb.uri=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/messaging_db?authSource=admin

# Redis
spring.data.redis.host=redis

# File settings
file.upload-dir=/app/media
file.base-url=https://backend.your-domain.com

# Security
jwt.secret=${JWT_SECRET}
cors.allowed-origins=https://your-frontend-domain.com
```

### Frontend Configuration

**Environment Variables**:
```bash
# .env.development
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080

# .env.production
VITE_API_URL=https://backend.your-domain.com
VITE_WS_URL=wss://backend.your-domain.com
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?q={query}` - Search users

### Messages
- `GET /api/messages/{userId}` - Get messages with user
- `POST /api/messages` - Send message
- `PUT /api/messages/{id}/read` - Mark as read

### Files
- `POST /api/files/upload` - Upload media file
- `GET /uploads/{filename}` - Serve uploaded file

### WebSocket
- `WS /ws/chat?token={jwt}` - Real-time messaging

## 🔍 Testing

### Backend Tests
```bash
cd messaging-app-backend
mvn test
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

### Manual Testing Scripts
```bash
# Test user endpoints
./test_users_endpoint.sh

# Test chat functionality
./test_chat_functionality.sh
```

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check CORS configuration
   - Verify JWT token is valid
   - Ensure WebSocket endpoint is correct

2. **File Upload Issues**
   - Check file size limits in nginx and application
   - Verify media directory permissions
   - Check available disk space

3. **Database Connection Issues**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure database credentials are correct

4. **Redis Connection Issues**
   - Verify Redis server is running
   - Check Redis configuration
   - Ensure Redis is accessible from application

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or issues, please:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

## 🎯 Future Enhancements

- [ ] Message encryption
- [ ] Voice/Video calling
- [ ] Group chats
- [ ] Message search
- [ ] File sharing with drag & drop
- [ ] Push notifications
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)

---

**Made with ❤️ using Java, Spring Boot, React, and TypeScript**