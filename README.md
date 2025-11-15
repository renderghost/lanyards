# Lanyards 🧑‍🚀

> One link to make your research life easier to share! Papers, talks, affiliations, socials, whatever... Easy, free, decentralised.

**A dedicated profile for researchers, built on the AT Protocol.**

## Features

- **Account Creation**: Sign in with your Bluesky account using OAuth
- **Researcher Profile**: Mobile-first profile display with QR code sharing
- **Profile Management**: Manage honorifics, location, affiliations, and more
- **Social Networks**: Link to Twitter, LinkedIn, ResearchGate, Google Scholar, and Semble
- **Scholarly Contributions**: Add research using DOIs
- **Academic Events**: Track conference presentations and symposiums

## Technology Stack

- Next.js (latest)
- TypeScript
- Tailwind CSS v4
- AT Protocol (@atproto/*)
- Zod for validation

## Getting Started

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment (optional):
   ```bash
   cp .env.example .env
   # Edit .env if you need to change the PDS URL or other settings
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and sign in with your Bluesky app password

See [SETUP.md](SETUP.md) for detailed setup instructions and OAuth configuration.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
