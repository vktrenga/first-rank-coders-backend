# First Rank Coders Backend

This is a monorepo containing the backend services and shared libraries for the First Rank Coders platform.

## Project Structure

```
first-rank-coders/
├── apps/                   # Application services
│   └── user/              # User management service
│       ├── src/           # Source code
│       ├── test/          # Test files
│       └── package.json   # User service dependencies
├── libs/                   # Shared libraries
│   └── shared/            # Common utilities and types
│       ├── src/           # Source code
│       └── package.json   # Shared lib dependencies
└── package.json           # Root package.json for workspace management
```

## Applications

### User Service (`apps/user`)
- REST API for user management
- Built with NestJS framework
- Handles authentication and user operations

## Libraries

### Shared Library (`libs/shared`)
- Common utilities and types
- Shared business logic
- Reusable components across services

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/vktrenga/first-rank-coders-backend.git
cd first-rank-coders-backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Build all packages:
\`\`\`bash
npm run build
\`\`\`

### Development

#### Running the User Service
```bash
# Development mode
npm run start:dev

# Production mode
npm run start
```

#### Building Packages
```bash
# Build everything
npm run build

# Build only libraries
npm run build:libs

# Build only applications
npm run build:apps
```

#### Cleaning
```bash
# Clean all build outputs and node_modules
npm run clean
```

## Available Scripts

- `npm run build` - Build all packages
- `npm run build:libs` - Build shared libraries
- `npm run build:apps` - Build applications
- `npm run start:dev` - Run user service in development mode
- `npm run start` - Run user service in production mode
- `npm run test` - Run tests
- `npm run clean` - Clean build outputs and dependencies
- `npm run install:all` - Fresh install and build libraries

## Project Dependencies

- NestJS - Backend framework
- TypeScript - Programming language
- Jest - Testing framework

## Development Workflow

1. Make changes in shared library if adding common functionality
2. Build shared library: `npm run build:libs`
3. Implement features in user service
4. Run tests: `npm run test`
5. Start service: `npm run start:dev`

## Contributing

1. Create a new branch from `main`
2. Make your changes
3. Submit a pull request

## License
Run postgres in docker
docker-compose up -d postgres-db

Run this command to connect to the default postgres database (which always exists):
    docker exec -it postgres-db psql -U postgres -d frc
Now you can verify it works:
docker exec -it postgres-db psql -U postgres -d frc

npx prisma migrate dev --schema=libs/shared/database/prisma/schema.prisma
npx prisma generate --schema=libs/shared/database/prisma/schema.prisma
npx prisma format --schema=libs/shared/database/prisma/schema.prisma
