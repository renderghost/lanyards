# Lanyards Setup Guide

## Quick Start with App Password (Recommended for Development)

### 1. Create a Bluesky App Password

1. Go to [https://bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
2. Click "Add App Password"
3. Give it a name (e.g., "Lanyards Development")
4. Copy the generated password

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   # Set authentication method to app_password
   AUTH_METHOD=app_password

   # Add your Bluesky credentials
   BLUESKY_HANDLE=your-handle.bsky.social
   BLUESKY_APP_PASSWORD=your-app-password-here

   # Leave these as-is for now
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   PDS_URL=https://bsky.social
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and click "Sign In". You'll be automatically authenticated with your configured account.

## Authentication Methods

Lanyards supports two authentication methods:

### App Password (Development)
- **Pros**: Simple setup, no OAuth configuration needed
- **Cons**: Single account only, credentials in .env file
- **Use for**: Local development and testing
- **Configuration**: Set `AUTH_METHOD=app_password` in `.env`

### OAuth (Production)
- **Pros**: Multi-user support, secure authorization flow
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

### "App password not configured" error
- Check that `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD` are set in `.env`
- Ensure there are no extra spaces or quotes around the values
- Restart the development server after changing `.env`

### Authentication fails
- Verify your app password is correct
- Make sure your Bluesky account is active
- Check that `PDS_URL` is set to `https://bsky.social`

### Can't access dashboard
- Make sure you're signed in (check for session cookie)
- Try clearing cookies and signing in again
- Check the browser console for errors

## Next Steps

Once authenticated, you can:
1. View your dashboard at `/dashboard`
2. Add affiliations, publications, and events
3. Configure your profile settings
4. View your public profile at `/{your-handle}`
