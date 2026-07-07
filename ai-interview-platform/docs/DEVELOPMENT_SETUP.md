# Development Setup Guide

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- Firebase project with Authentication enabled
- Google Cloud project with Gemini API enabled
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Babin123456/Interview-Intelligence-.git
cd Interview-Intelligence-
```

### 2. Install Dependencies

```bash
# Server
cd ai-interview-platform/server
npm install

# Client (separate terminal)
cd ai-interview-platform/client
npm install
```

### 3. Environment Configuration

Create `.env` file in `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/interview-intelligence
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="your-private-key"
GEMINI_API_KEY=your-gemini-api-key
API_KEY=your-internal-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
```

Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Firebase Setup

1. Go to Firebase Console
2. Enable Email/Password authentication
3. Generate a service account key (JSON)
4. Save as `server/serviceAccountKey.json` or set environment variables

### 5. MongoDB Setup

Option A: Local MongoDB
```bash
# Ensure MongoDB is running on default port
mongod
```

Option B: MongoDB Atlas
1. Create cluster at mongodb.com
2. Get connection string
3. Update MONGODB_URI in .env

### 6. Start Development Servers

```bash
# Terminal 1: Server
cd ai-interview-platform/server
npm run dev

# Terminal 2: Client
cd ai-interview-platform/client
npm run dev
```

The application will be available at:
- Client: http://localhost:5173
- Server: http://localhost:5000

## Available Scripts

### Client (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

### Server (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Production start |
| `npm test` | Run test suite |

## Common Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### MongoDB Connection Failed
- Verify MongoDB is running: `mongosh` or check Atlas dashboard
- Check connection string in .env
- Ensure IP whitelist includes your address (Atlas)

### Firebase Auth Errors
- Verify service account key is correct
- Check Firebase project settings
- Ensure Authentication is enabled in Firebase Console

### Gemini API Errors
- Verify API key is valid at console.cloud.google.com
- Check API is enabled for your project
- Verify billing is set up if required

## Project Conventions

### Code Style
- Use ES6+ features
- Prefer functional components with hooks
- Use inline styles with style constants
- Follow existing naming patterns

### Git Workflow
1. Create feature branch from `master`
2. Make changes with descriptive commits
3. Push branch and create PR
4. Get review and merge to master

### Commit Messages
```
type(scope): description

Examples:
feat(auth): add OTP verification flow
fix(dashboard): resolve undefined state access
refactor(services): consolidate API calls
docs(readme): update setup instructions
```

## Testing

### Running Tests
```bash
# Client
cd client && npm test

# Server
cd server && npm test
```

### Writing Tests
- Place test files next to source files
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

## Deployment

### Client (Vercel)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables

### Server (Railway/Render)
1. Connect GitHub repository
2. Set start command: `npm start`
3. Configure environment variables
4. Ensure MongoDB is accessible

## Contributing

See CONTRIBUTING.md for detailed contribution guidelines.
