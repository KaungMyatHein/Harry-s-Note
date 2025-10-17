# Deployment Guide - OneBookPerDay

This guide outlines the deployment process for different environments using our three-branch strategy.

## 🌿 Branch Strategy Overview

```
main (development) → uat (staging) → production (live)
```

## 🚀 Environment Setup

### Development Environment
- **Branch**: `main`
- **Database**: SQLite (local file)
- **URL**: `http://localhost:3000`
- **Purpose**: Active development and testing

### UAT Environment (Staging)
- **Branch**: `uat`  
- **Database**: PostgreSQL (Supabase staging)
- **URL**: `https://uat-your-app.vercel.app`
- **Purpose**: Client testing and acceptance

### Production Environment
- **Branch**: `production`
- **Database**: PostgreSQL (Supabase production)
- **URL**: `https://your-app.vercel.app`
- **Purpose**: Live application

## 📋 Pre-Deployment Checklist

### Before Deploying to UAT
- [ ] All features tested locally on `main` branch
- [ ] Database migrations tested with development schema
- [ ] Environment variables configured for staging
- [ ] All tests passing
- [ ] Code reviewed and approved

### Before Deploying to Production
- [ ] UAT testing completed successfully
- [ ] Client/stakeholder approval received
- [ ] Production environment variables configured
- [ ] Database backup completed (if applicable)
- [ ] Monitoring and logging configured

## 🔄 Deployment Workflow

### 1. Deploy to UAT (Staging)

```bash
# Ensure you're on main with latest changes
git checkout main
git pull origin main

# Switch to UAT branch
git checkout uat
git pull origin uat

# Merge main into UAT
git merge main

# Push to trigger UAT deployment
git push origin uat
```

### 2. Deploy to Production

```bash
# After UAT testing is complete
git checkout production
git pull origin production

# Merge UAT into production
git merge uat

# Push to trigger production deployment
git push origin production
```

## 🗄️ Database Deployment

### UAT Database Setup
```bash
# Set environment to staging
export NODE_ENV=staging
export DATABASE_URL="your-supabase-staging-url"

# Run migrations
npm run db:prod:push
npm run db:prod:generate
```

### Production Database Setup
```bash
# Set environment to production
export NODE_ENV=production
export DATABASE_URL="your-supabase-production-url"

# Run migrations
npm run db:prod:push
npm run db:prod:generate
```

## 🔧 Environment Variables by Environment

### Development (.env.local)
```env
NODE_ENV=development
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
# ... other dev variables
```

### UAT/Staging
```env
NODE_ENV=staging
DATABASE_URL="postgresql://staging-connection-string"
NEXTAUTH_URL="https://uat-your-app.vercel.app"
SUPABASE_URL="your-staging-supabase-url"
SUPABASE_ANON_KEY="your-staging-anon-key"
SUPABASE_DATABASE_URL="postgresql://staging-db-url"
# ... other staging variables
```

### Production
```env
NODE_ENV=production
DATABASE_URL="postgresql://production-connection-string"
NEXTAUTH_URL="https://your-app.vercel.app"
SUPABASE_URL="your-production-supabase-url"
SUPABASE_ANON_KEY="your-production-anon-key"
SUPABASE_DATABASE_URL="postgresql://production-db-url"
# ... other production variables
```

## 🚨 Rollback Procedures

### Rollback UAT
```bash
git checkout uat
git reset --hard HEAD~1  # Go back one commit
git push --force-with-lease origin uat
```

### Rollback Production
```bash
git checkout production
git reset --hard HEAD~1  # Go back one commit
git push --force-with-lease origin production
```

## 📊 Monitoring and Health Checks

### Post-Deployment Verification

1. **Application Health**
   - [ ] Application loads successfully
   - [ ] Authentication works
   - [ ] Database connections established
   - [ ] API endpoints responding

2. **Feature Testing**
   - [ ] Book fetching from Notion works
   - [ ] Note taking functionality
   - [ ] User registration/login
   - [ ] Image rendering in markdown

3. **Performance Checks**
   - [ ] Page load times acceptable
   - [ ] Database query performance
   - [ ] API response times

## 🔍 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check environment variables
echo $DATABASE_URL
echo $SUPABASE_URL

# Test database connection
node scripts/test-db-connection.js
```

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Environment Variable Issues**
- Verify all required variables are set
- Check for typos in variable names
- Ensure proper escaping of special characters

## 📞 Emergency Contacts

- **Development Team**: [Your Team Contact]
- **DevOps/Infrastructure**: [DevOps Contact]
- **Product Owner**: [Product Contact]

## 📝 Deployment Log Template

```
Deployment Date: [DATE]
Environment: [UAT/Production]
Branch: [branch-name]
Commit Hash: [commit-hash]
Deployed By: [deployer-name]
Changes: [brief description]
Rollback Plan: [if needed]
Verification: [checklist completed]
```

---

**Remember**: Always test thoroughly in UAT before deploying to production! 🚀