# Vercel Deployment Guide for OneBookPerDay

This guide covers deploying your OneBookPerDay application to Vercel with proper OAuth configuration for both production and preview deployments.

## Environment Variables Setup

### Production Environment Variables
Set these in your Vercel dashboard under **Settings > Environment Variables** for **Production**:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=https://harry-s-note.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
AUTH_TRUST_HOST=true

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Database - Supabase PostgreSQL
# Format: postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
# Note: Using POSTGRES_PRISMA_URL (Vercel's default) instead of DATABASE_URL
POSTGRES_PRISMA_URL=your-supabase-database-url-here

# Supabase Configuration
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Notion API
NOTION_API_KEY=your-notion-api-key-here
NOTION_DATABASE_ID=your-notion-database-id-here
```

### Preview Environment Variables
Set these for **Preview** deployments (DO NOT set NEXTAUTH_URL for previews):

```bash
# NextAuth.js Configuration - Let NextAuth auto-detect URL
NEXTAUTH_SECRET=your-nextauth-secret-here
AUTH_TRUST_HOST=true

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Database - Supabase PostgreSQL
# Format: postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
# Note: Using POSTGRES_PRISMA_URL (Vercel's default) instead of DATABASE_URL
POSTGRES_PRISMA_URL=your-supabase-database-url-here

# Supabase Configuration
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Notion API
NOTION_API_KEY=your-notion-api-key-here
NOTION_DATABASE_ID=your-notion-database-id-here
```

## Google OAuth Configuration for Dynamic URLs

### The Challenge
Vercel preview deployments generate dynamic URLs like:
- `https://your-app-git-branch-username.vercel.app`
- `https://your-app-abc123.vercel.app`

These dynamic URLs change with each deployment, making it impossible to pre-configure specific redirect URIs in Google Cloud Console.

### Solution: Wildcard Redirect URIs

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Select your OAuth 2.0 Client ID**
3. **Add these Authorized Redirect URIs**:

```
# Production
https://harry-s-note.vercel.app/api/auth/callback/google

# Development
http://localhost:3000/api/auth/callback/google

# Vercel Preview Deployments (Wildcard)
https://*.vercel.app/api/auth/callback/google
```

### Important Notes:
- ✅ **Wildcard support**: Google OAuth supports `*.vercel.app` for subdomains
- ✅ **AUTH_TRUST_HOST=true**: This tells NextAuth to trust the host header from Vercel
- ✅ **No NEXTAUTH_URL for previews**: Let NextAuth auto-detect the URL for preview deployments
- ⚠️ **Security**: Wildcard URIs are less secure but necessary for dynamic preview URLs

## Alternative Solutions

### Option 1: Vercel Alias (Recommended for staging)
Create a consistent staging URL:

```bash
# Set up a staging alias
vercel alias set your-deployment-url.vercel.app staging-harry-s-note.vercel.app
```

Then add to Google OAuth:
```
https://staging-harry-s-note.vercel.app/api/auth/callback/google
```

### Option 2: Custom Domain for Previews
1. Set up a custom domain in Vercel
2. Use subdomains for different branches
3. Configure DNS wildcards

## Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Configure Google OAuth** with wildcard redirect URIs
3. **Deploy to Vercel**:
   ```bash
   vercel --prod  # For production
   vercel         # For preview
   ```
4. **Test Authentication** on both production and preview URLs

## Troubleshooting

### OAuth Callback Error
If you get `OAUTH_CALLBACK_HANDLER_ERROR`:
1. ✅ Check that `AUTH_TRUST_HOST=true` is set
2. ✅ Verify Google OAuth redirect URIs include `*.vercel.app`
3. ✅ Ensure `NEXTAUTH_SECRET` is set in all environments
4. ✅ Don't set `NEXTAUTH_URL` for preview deployments

### Database Connection Issues
1. ✅ Verify Supabase `POSTGRES_PRISMA_URL` format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`
2. ✅ Check that URL starts with `postgresql://` or `postgres://` (not `mysql://` or other protocols)
3. ✅ Verify Supabase `POSTGRES_PRISMA_URL` is correct
4. ✅ Check Supabase connection limits
5. ✅ Ensure database is accessible from Vercel's IP ranges

## Security Considerations

- 🔒 **Never commit secrets** to your repository
- 🔒 **Use different secrets** for production and preview
- 🔒 **Rotate secrets regularly**
- 🔒 **Monitor OAuth usage** in Google Cloud Console
- ⚠️ **Wildcard URIs** reduce security - consider using staging aliases for sensitive applications

## Testing Checklist

- [ ] Production deployment authentication works
- [ ] Preview deployment authentication works
- [ ] Database connections work in both environments
- [ ] Environment variables are properly set
- [ ] No secrets are exposed in client-side code