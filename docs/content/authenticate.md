---
title: "Authentication"
description: "Signing in to Lanyards"
url: /authentication/
---

# Authentication

'Lanyards' currently supports these authentication methods

## App Password

- **Pros**: Simple setup, works immediately, no OAuth configuration needed
- **Cons**: Users must create an app password from Bluesky settings
- **Use for**: Local development and testing
- **Configuration**: Set `AUTH_METHOD=app_password` in `.env`

### Creating a Bluesky App Password

1. Go to [https://bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
2. Click "Add App Password"
3. Give it a name (e.g., "Lanyards")
4. Copy the generated password and use it to sign in

## OAuth

> [!WARNING] DO not use OAuth
> OAuth is not ready for use in development or production.

- **Pros**: Multi-user support, secure authorization flow, standard OAuth experience
- **Cons**: Requires OAuth client setup and configuration
- **Use for**: Production deployment
- **Configuration**: Set `AUTH_METHOD=oauth` in `.env`

### Switching Between Methods

> [!WARNING] DO not use OAuth
> OAuth is not ready for use in development or production.

Change the `AUTH_METHOD` value in your `.env` file and restart the development server:

```env
# For App Password
AUTH_METHOD=app_password

# For OAuth
AUTH_METHOD=oauth
```