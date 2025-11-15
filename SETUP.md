# Lanyards Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` if you need to customize settings:
   ```env
   # Set authentication method (app_password for development, oauth for production)
   AUTH_METHOD=app_password

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # PDS Configuration (change if using a different PDS)
   PDS_URL=https://bsky.social
   ```

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Sign In

Visit [http://localhost:3000](http://localhost:3000) and click "Sign In". Enter your Bluesky handle and app password.

#### Creating a Bluesky App Password

1. Go to [https://bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
2. Click "Add App Password"
3. Give it a name (e.g., "Lanyards")
4. Copy the generated password and use it to sign in

## Authentication Methods

Lanyards supports two authentication methods:

### App Password (Recommended for Development)
- **Pros**: Simple setup, works immediately, no OAuth configuration needed
- **Cons**: Users must create an app password from Bluesky settings
- **Use for**: Local development and testing
- **Configuration**: Set `AUTH_METHOD=app_password` in `.env`

### OAuth (Production)
- **Pros**: Multi-user support, secure authorization flow, standard OAuth experience
- **Cons**: Requires OAuth client setup and configuration
- **Use for**: Production deployment
- **Configuration**: Set `AUTH_METHOD=oauth` in `.env`

## Switching Between Authentication Methods

Simply change the `AUTH_METHOD` value in your `.env` file:

```env
# For App Password
AUTH_METHOD=app_password

# For OAuth
AUTH_METHOD=oauth
```

Restart the development server after changing the method.

## Setting Up OAuth (Production)

Coming soon - OAuth setup requires AT Protocol OAuth client configuration.

## Troubleshooting

### Authentication fails
- Verify your app password is correct (no typos, copied fully)
- Make sure your Bluesky account is active
- Check that `PDS_URL` is set to `https://bsky.social` (or your PDS URL)
- Try creating a new app password

### Can't access dashboard
- Make sure you're signed in (check for session cookie)
- Try clearing cookies and signing in again
- Check the browser console for errors

### Public profiles not loading
- Check the browser console for errors
- Ensure the handle is correct (e.g., `alice.bsky.social`)
- Verify the user has created a Lanyards profile

## Next Steps

Once authenticated, you can:
1. View your dashboard at `/dashboard`
2. Add affiliations, publications, and events
3. Configure your profile settings
4. View your public profile at `/{your-handle}`
