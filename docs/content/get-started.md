---
title: "Get Started"
description: "Signing in to Lanyards"
url: /documentation/
---

# Get Started

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables (Optional)

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if you need to customize settings:

```env
# Set authentication method (app_password for development, oauth for production)
AUTH_METHOD=app_password

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PDS Configuration (change if using a different PDS)
PDS_URL=https://bsky.social
```

## 3. Run the Development Server

```bash
npm run dev
```

## 4. Open Lanyards

Once authenticated, you can:
1. View your dashboard at `/dashboard`
2. Add affiliations, publications, and events
3. Configure your profile settings
4. View your public profile at `/{your-handle}`

## Dev Commands

- `npm run build` - Generate lexicons and build for production
- `npm run dev` - Generate lexicons and start development server
- `npm run format` - Format code with Prettier
- `npm run lex:gen` - Generate TypeScript types from lexicon schemas
- `npm run lex:watch` - Watch lexicon schemas and regenerate types on changes
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run lint` - Run ESLint
- `npm run start` - Start production server



