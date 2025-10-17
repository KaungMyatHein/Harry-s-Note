# OneBookPerDay - Harry's Note

A Next.js application for reading and taking notes on one book per day, integrated with Notion for content management and Supabase for production database.

## 🚀 Features

- **Daily Book Reading**: Read one book per day with progress tracking
- **Notion Integration**: Fetch book content directly from Notion pages
- **Note Taking**: Take and manage notes for each book
- **User Authentication**: Google OAuth integration with NextAuth.js
- **Image Support**: Render images from Notion content in markdown
- **Responsive Design**: Modern UI with Tailwind CSS
- **Database**: SQLite for development, PostgreSQL (Supabase) for production

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js with Google OAuth
- **Content**: Notion API integration
- **Deployment**: Ready for Vercel/Netlify deployment

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- Notion API integration token
- Supabase account (for production)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KaungMyatHein/Harry-s-Note.git
   cd Harry-s-Note
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXTAUTH_SECRET`: Random string for NextAuth
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
   - `NOTION_TOKEN` & `NOTION_DATABASE_ID`: Notion API credentials
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_DATABASE_URL`: Supabase credentials (production)

4. **Database Setup**
   
   **Development (SQLite):**
   ```bash
   npm run db:dev:push
   npm run db:dev:generate
   ```
   
   **Production (Supabase):**
   ```bash
   npm run db:prod:push
   npm run db:prod:generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🌿 Branch Strategy

This project uses a three-branch strategy for different environments:

### 📚 Branch Overview

- **`main`** - Main development branch
  - Latest stable development code
  - All feature development happens here
  - Automatically tested and reviewed

- **`uat`** - User Acceptance Testing branch  
  - Staging environment for testing
  - Deploy here for client/stakeholder review
  - Merge from `main` when ready for testing

- **`production`** - Production deployment branch
  - Live production code
  - Only merge from `uat` after thorough testing
  - Represents the current live version

### 🔄 Workflow

1. **Development**: Work on `main` branch
2. **Testing**: Merge `main` → `uat` for staging deployment
3. **Production**: Merge `uat` → `production` for live deployment

### 🚀 Deployment Commands

```bash
# Switch branches
git checkout main        # Development
git checkout uat         # Staging
git checkout production  # Production

# Database commands per environment
npm run db:dev:*         # Development (SQLite)
npm run db:prod:*        # Production (PostgreSQL)
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database Management
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio

# Environment-specific database commands
npm run db:dev:*         # Development (SQLite)
npm run db:prod:*        # Production (PostgreSQL)
```

## 🗂️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── book/           # Book detail pages
│   ├── dashboard/      # User dashboard
│   └── notes/          # Notes management
├── components/         # Reusable components
├── lib/               # Utility libraries
│   ├── auth.ts        # NextAuth configuration
│   ├── database.ts    # Database utilities
│   ├── notion.ts      # Notion API integration
│   └── prisma.ts      # Prisma client
└── types/             # TypeScript type definitions
```

## 🔧 Configuration Files

- `prisma/schema.prisma` - Production database schema (PostgreSQL)
- `prisma/schema.dev.prisma` - Development database schema (SQLite)
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration

## 🚀 Deployment

### Environment Variables for Production

Ensure these are set in your production environment:

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
SUPABASE_DATABASE_URL=postgresql://...
# ... other production variables
```

### Recommended Deployment Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Submit a pull request to `main`

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

**Happy Reading! 📚✨**