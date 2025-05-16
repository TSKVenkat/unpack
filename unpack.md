# GitHub Code Analysis Platform - Comprehensive Project Plan

## 1. Project Overview

### 1.1 Project Description
A web-based platform that analyzes GitHub repositories to provide comprehensive code insights, summarizations, and architecture details. Users can paste GitHub repository links and receive detailed analysis of the codebase, focusing on features, implementation details, and architectural patterns.

### 1.2 Core Value Proposition
- Save developers time by automating code understanding
- Accelerate onboarding to new codebases
- Provide intelligent insights beyond surface-level code exploration
- Enable focused analysis on specific files or directories

### 1.3 Target Users
- Software developers joining existing projects
- Technical managers evaluating potential dependencies
- Code reviewers needing deeper understanding
- Open-source contributors exploring new projects

## 2. Technical Architecture

### 2.1 Stack Selection

#### Frontend
- **Framework**: Next.js (React framework with SSR capabilities)
- **UI/Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API + SWR for data fetching
- **Authentication**: JWT-based authentication flow

#### Backend
- **API Framework**: Next.js API routes
- **Database**: 
  - Primary: Xata PostgreSQL (via Prisma ORM)
  - Cache: Redis for performance optimization
- **AI Integration**: Gemini API for code analysis and summarization
- **Repository Access**: GitHub API for fetching repository content

### 2.2 System Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Browser │────▶│    Next.js      │────▶│   GitHub API    │
│                 │     │  (Frontend +    │     │                 │
└─────────────────┘     │   API Routes)   │     └─────────────────┘
                        │                 │              │
                        └─────────────────┘              │
                                │                        │
                                ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │                 │     │                 │
                        │  Redis Cache    │     │   Gemini API    │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
                                │                        │
                                ▼                        │
                        ┌─────────────────┐              │
                        │                 │              │
                        │ Xata PostgreSQL │◀─────────────┘
                        │  (via Prisma)   │
                        │                 │
                        └─────────────────┘
```

### 2.3 Data Flow

1. User authenticates and submits GitHub repo URL
2. System checks cache for existing analysis
3. If not cached, system fetches repo structure via GitHub API
4. Code files are processed and analyzed via Gemini API
5. Results are stored in PostgreSQL database via Prisma ORM
6. Analysis is cached in Redis for future requests
7. Results are returned to user

## 3. Feature Set

### 3.1 Core Features

#### Authentication System
- JWT-based authentication
- User registration and login
- Session management and token refresh

#### Repository Analysis
- Repository URL input and validation
- Fetch and process repository structure
- Code parsing and tokenization
- Language detection and statistics

#### Code Insights
- Codebase summarization
- Feature identification
- Architecture detection and visualization
- Implementation details
- Code quality assessment
- Dependencies analysis

#### Focused Analysis
- File-level analysis selection
- Directory-level analysis selection
- Custom query-based analysis

#### History Management
- Saving analysis history
- Analysis comparison
- Bookmarking important insights

### 3.2 User Experience Features

#### Dashboard
- Recent analysis history
- Bookmarked repositories
- Analysis metrics and statistics

#### Visualization
- Code structure visualizations
- Architecture diagrams
- Dependency graphs

#### Export Options
- PDF reports
- Markdown documentation
- Shareable links

## 4. Database Schema

### 4.1 Prisma Schema

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  hashedPassword String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  analyses      Analysis[]
}

model Analysis {
  id            String    @id @default(uuid())
  repoUrl       String
  repoName      String
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  summary       String    @db.Text
  features      Json
  architecture  Json
  codeStats     Json
  analysisItems AnalysisItem[]
  bookmarked    Boolean   @default(false)
}

model AnalysisItem {
  id            String    @id @default(uuid())
  analysisId    String
  analysis      Analysis  @relation(fields: [analysisId], references: [id])
  path          String
  type          String    // "FILE" or "DIRECTORY"
  summary       String?   @db.Text
  content       String?   @db.Text
  features      Json?
  complexity    Float?
  createdAt     DateTime  @default(now())
}
```

### 4.2 Redis Cache Structure

```
# Repository analysis cache
repo:{repoUrl}:summary -> JSON string of full repo analysis
repo:{repoUrl}:files:{filePath} -> JSON string of file analysis
repo:{repoUrl}:dirs:{dirPath} -> JSON string of directory analysis

# User session cache
user:{userId}:session -> JWT token data
```

## 5. API Endpoints

### 5.1 Authentication Endpoints

```
POST /api/auth/register - Create new user account
POST /api/auth/login - Authenticate user and return JWT
GET /api/auth/me - Get current user profile
POST /api/auth/refresh - Refresh JWT token
POST /api/auth/logout - Invalidate current JWT token
```

### 5.2 Repository Analysis Endpoints

```
POST /api/repos/analyze - Submit repo URL for analysis
GET /api/repos/status/:analysisId - Check analysis status
GET /api/repos/:analysisId - Get full analysis results
GET /api/repos/:analysisId/summary - Get repo summary
GET /api/repos/:analysisId/features - Get detected features
GET /api/repos/:analysisId/architecture - Get architecture details
```

### 5.3 File/Directory Analysis Endpoints

```
POST /api/repos/:analysisId/file - Analyze specific file
POST /api/repos/:analysisId/directory - Analyze specific directory
GET /api/repos/:analysisId/file/:filePath - Get file analysis
GET /api/repos/:analysisId/directory/:dirPath - Get directory analysis
```

### 5.4 History Management Endpoints

```
GET /api/history - Get user's analysis history
POST /api/history/:analysisId/bookmark - Bookmark analysis
DELETE /api/history/:analysisId/bookmark - Remove bookmark
DELETE /api/history/:analysisId - Delete analysis history
```

## 6. Implementation Plan

### 6.1 Phase 1: Foundation (Weeks 1-2)

- Set up Next.js project with Tailwind CSS
- Configure Prisma ORM with Xata PostgreSQL
- Implement authentication system with JWT
- Create basic UI components and layouts
- Set up GitHub API integration for repository fetching

### 6.2 Phase 2: Core Analysis (Weeks 3-4)

- Implement repository structure parsing
- Set up Gemini API integration
- Build code analysis processing pipeline
- Create repository summarization functionality
- Implement Redis caching for performance

### 6.3 Phase 3: Advanced Features (Weeks 5-6)

- Add file/directory specific analysis
- Implement history management
- Create visualization components
- Add export functionality
- Build dashboard with analytics

### 6.4 Phase 4: Optimization & Testing (Weeks 7-8)

- Performance optimization
- Implement comprehensive error handling
- Add extensive testing (unit, integration, E2E)
- Security hardening
- Documentation

## 7. Core Logic Implementation

### 7.1 GitHub Repository Fetching

```javascript
// Core logic for fetching a GitHub repository
const fetchRepository = async (repoUrl) => {
  // Extract owner and repo name from URL
  const { owner, repo } = parseGitHubUrl(repoUrl);
  
  // GitHub API endpoints
  const baseApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const contentsUrl = `${baseApiUrl}/contents`;
  
  // Fetch repository metadata
  const repoData = await fetchWithAuth(baseApiUrl);
  
  // Recursively fetch directory structure
  const structure = await fetchDirectoryContents(contentsUrl);
  
  return {
    metadata: repoData,
    structure: structure
  };
};

// Helper to recursively fetch directory contents
const fetchDirectoryContents = async (url, path = '') => {
  const contents = await fetchWithAuth(url);
  
  const result = [];
  
  for (const item of contents) {
    if (item.type === 'dir') {
      const children = await fetchDirectoryContents(item.url, `${path}/${item.name}`);
      result.push({
        type: 'directory',
        name: item.name,
        path: `${path}/${item.name}`,
        children: children
      });
    } else if (item.type === 'file') {
      // Only fetch content for code files under size limit
      let content = null;
      if (isCodeFile(item.name) && item.size < MAX_FILE_SIZE) {
        const fileData = await fetchWithAuth(item.download_url);
        content = fileData;
      }
      
      result.push({
        type: 'file',
        name: item.name,
        path: `${path}/${item.name}`,
        size: item.size,
        content: content
      });
    }
  }
  
  return result;
};
```

### 7.2 Code Analysis with Gemini API

```javascript
// Core logic for analyzing code with Gemini API
const analyzeCode = async (repoStructure, options = {}) => {
  // Create context from repository structure
  const context = buildAnalysisContext(repoStructure);
  
  // Construct prompt for Gemini API
  const prompt = constructAnalysisPrompt(context, options);
  
  // Call Gemini API
  const result = await callGeminiAPI(prompt);
  
  // Parse and structure the response
  const structuredAnalysis = parseAnalysisResponse(result);
  
  return structuredAnalysis;
};

// Build analysis context from repo structure
const buildAnalysisContext = (repoStructure) => {
  // Extract languages used
  const languages = detectLanguages(repoStructure);
  
  // Identify key files (package.json, etc)
  const keyFiles = findKeyFiles(repoStructure);
  
  // Calculate code statistics
  const stats = calculateCodeStats(repoStructure);
  
  return {
    languages,
    keyFiles,
    stats,
    structure: simplifyStructure(repoStructure)
  };
};

// Construct appropriate prompt for Gemini API
const constructAnalysisPrompt = (context, options) => {
  let prompt = '';
  
  if (options.type === 'repository') {
    prompt = `Analyze the following GitHub repository structure and provide insights:
    
    Repository Statistics:
    - Languages: ${JSON.stringify(context.languages)}
    - Key Files: ${JSON.stringify(context.keyFiles)}
    - Stats: ${JSON.stringify(context.stats)}
    
    Structure:
    ${JSON.stringify(context.structure, null, 2)}
    
    Provide the following:
    1. Overall summary of the repository
    2. Main features implemented
    3. Architecture overview
    4. Key implementation details
    5. Recommendations for improvement`;
  } else if (options.type === 'file') {
    // Construct file-specific prompt
    prompt = `Analyze the following code file and provide insights:
    
    File: ${options.path}
    Content:
    ${options.content}
    
    Provide the following:
    1. Summary of what this file does
    2. Key functions/components and their purpose
    3. How this file integrates with the rest of the codebase
    4. Potential improvements or issues`;
  }
  
  return prompt;
};
```

### 7.3 Caching Strategy

```javascript
// Core logic for cache management
const cacheManager = {
  // Check if analysis exists in cache
  async checkCache(repoUrl, type, path = null) {
    let cacheKey;
    
    if (type === 'repository') {
      cacheKey = `repo:${repoUrl}:summary`;
    } else if (type === 'file') {
      cacheKey = `repo:${repoUrl}:files:${path}`;
    } else if (type === 'directory') {
      cacheKey = `repo:${repoUrl}:dirs:${path}`;
    }
    
    const cachedData = await redis.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  },
  
  // Store analysis in cache
  async storeInCache(repoUrl, type, data, path = null, ttl = 86400) {
    let cacheKey;
    
    if (type === 'repository') {
      cacheKey = `repo:${repoUrl}:summary`;
    } else if (type === 'file') {
      cacheKey = `repo:${repoUrl}:files:${path}`;
    } else if (type === 'directory') {
      cacheKey = `repo:${repoUrl}:dirs:${path}`;
    }
    
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
  },
  
  // Invalidate cache entries
  async invalidateCache(repoUrl, type = null, path = null) {
    if (!type) {
      // Invalidate all cache for this repo
      const keys = await redis.keys(`repo:${repoUrl}:*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } else if (type === 'repository') {
      await redis.del(`repo:${repoUrl}:summary`);
    } else if (type === 'file' && path) {
      await redis.del(`repo:${repoUrl}:files:${path}`);
    } else if (type === 'directory' && path) {
      await redis.del(`repo:${repoUrl}:dirs:${path}`);
      // Also invalidate all files under this directory
      const keys = await redis.keys(`repo:${repoUrl}:files:${path}/*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }
  }
};
```

## 8. Authentication Implementation

### 8.1 JWT Authentication Flow

```javascript
// JWT token generation
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return {
    accessToken,
    refreshToken
  };
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Token refresh
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Generate new access token
    const { accessToken } = generateToken(user);
    
    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
```

## 9. Deployment and Scaling Strategy

### 9.1 Development Environment
- Local development using Next.js dev server
- Docker containerization for consistent environments
- Environment variables management with `.env.local`

### 9.2 Production Deployment
- Vercel for Next.js hosting (primary recommendation)
- Alternatives: AWS Amplify, Netlify, or custom deployment
- Database hosting on Xata's managed PostgreSQL service
- Redis cache via Upstash or Redis Labs

### 9.3 Scaling Considerations
- Implement rate limiting for API endpoints
- Optimize cache TTL based on repository update frequency
- Utilize serverless functions for analysis to handle load spikes
- Consider background processing for large repositories
- Implement connection pooling for database

## 10. Security Considerations

### 10.1 Authentication Security
- Store hashed passwords only (using bcrypt)
- Implement proper JWT secret rotation
- Set secure and HTTP-only flags for cookies
- Implement CSRF protection

### 10.2 API Security
- Rate limiting to prevent abuse
- Input validation for all endpoints
- Proper error handling to avoid information leakage
- Implement proper CORS policies

### 10.3 Data Security
- Encrypt sensitive data in database
- Implement proper access controls
- Regular security audits
- Follow principle of least privilege

## 11. Monitoring and Analytics

### 11.1 Application Monitoring
- Error tracking with Sentry
- Performance monitoring with New Relic or Datadog
- Log aggregation with Logtail or Papertrail

### 11.2 User Analytics
- Track feature usage
- Analyze popular repositories
- Monitor query patterns
- Track user engagement metrics

## 12. Future Enhancements

### 12.1 Potential Future Features
- Team collaboration for shared analysis
- Integration with VS Code/IDE extensions
- Natural language querying of codebase
- Integration with CI/CD pipelines
- Custom analysis rules and templates
- Real-time collaboration on code exploration
- Code change impact analysis

### 12.2 AI Enhancement Roadmap
- Fine-tune Gemini model for code-specific analysis
- Implement additional specialized models for specific languages
- Add code vulnerability scanning
- Implement semantic code search
- Add automated refactoring suggestions

## 13. Appendix: Environment Setup

### 13.1 Required Environment Variables

```
# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Database
DATABASE_URL=your_xata_postgres_url

# Redis
REDIS_URL=your_redis_url

# GitHub API
GITHUB_API_TOKEN=your_github_token

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 13.2 Development Setup Commands

```bash
# Install dependencies
npm install

# Set up Prisma with PostgreSQL
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```
