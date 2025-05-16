# Unpack - GitHub Code Analysis Platform

![Unpack Logo](public/unpack-logo.png)

Unpack is a web-based platform that analyzes GitHub repositories to provide comprehensive code insights, summarizations, and architecture details. Users can paste GitHub repository links and receive detailed analysis of the codebase, focusing on features, implementation details, and architectural patterns.

## Features

- **Repository Analysis**: Analyze any GitHub repository to get detailed insights
- **Code Summarization**: Get comprehensive summaries of codebases
- **Architecture Detection**: Visualize and understand the architecture of repositories
- **Feature Identification**: Identify key features and implementation details
- **Code Statistics**: View detailed code statistics including languages, file counts, and line counts
- **Bookmarking**: Save and organize your favorite analyses
- **User Authentication**: Secure user accounts and history management

## Tech Stack

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **AI Integration**: Gemini API for code analysis
- **API**: GitHub API for repository data

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- GitHub API token
- Gemini API key

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Database
DATABASE_URL=your_postgres_url

# GitHub API
GITHUB_API_TOKEN=your_github_token

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/unpack.git
cd unpack
```

2. Install dependencies

```bash
npm install
```

3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and libraries
│   └── middleware.ts    # Authentication middleware
├── .env.local           # Environment variables (create this file)
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user and return JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Invalidate current JWT token

### Repository Analysis

- `POST /api/repos/analyze` - Submit repo URL for analysis
- `GET /api/repos/:analysisId` - Get full analysis results

### History Management

- `GET /api/history` - Get user's analysis history
- `POST /api/history/:analysisId/bookmark` - Bookmark analysis
- `DELETE /api/history/:analysisId/bookmark` - Remove bookmark

## Deployment

The application can be deployed on Vercel or any other platform that supports Next.js applications.

```bash
npm run build
```

## License

MIT
