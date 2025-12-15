# Sentry Integration Setup

Sentry is now integrated across the entire platform to track errors and performance issues from all tenant sites.

## Environment Variables Required

Add these to your Vercel project:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

## Getting Your Sentry Values

1. **DSN**: Go to Settings → Projects → [Your Project] → Client Keys (DSN)
2. **Organization**: Your Sentry organization slug (visible in URL)
3. **Project**: Your Sentry project slug
4. **Auth Token**: Create at Settings → Account → API → Auth Tokens
   - Scopes needed: `project:releases` and `org:read`

## What's Tracked

### Error Tracking
- All client-side errors with session replay
- All server-side errors
- Failed API calls
- Authentication errors
- Payment/Stripe integration errors

### Tenant Context
Every error includes:
- Tenant subdomain
- Tenant ID
- Tenant name
- Whether user is tenant owner

### User Context
- User ID
- User email

### Performance Monitoring
- Page load times
- API response times
- Server action performance

## Features Enabled

1. **Session Replay** - See exactly what users did before an error
2. **Source Maps** - Hidden from browsers but uploaded to Sentry
3. **Performance Monitoring** - Track slow pages and APIs
4. **Error Filtering** - Ignores browser extensions and irrelevant errors

## Viewing Errors in Sentry

Errors will be grouped by:
- Tenant (use `tenant_subdomain` tag to filter)
- Error type
- URL where error occurred
- User who experienced it

## Testing

To test the integration:

```javascript
// In browser console
throw new Error('Test error from tenant site')
```

Check your Sentry dashboard - you should see the error with full tenant context.

## Best Practices

1. Don't log sensitive data (payment details, passwords, etc.)
2. Use Sentry breadcrumbs for context: 
   ```typescript
   Sentry.addBreadcrumb({
     message: 'User initiated donation',
     level: 'info',
   })
   ```
3. Set custom contexts for important flows:
   ```typescript
   Sentry.setContext('donation', {
     amount: 100,
     currency: 'USD',
     tenant: subdomain,
   })
