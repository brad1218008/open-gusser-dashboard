# Open Gusser Score Tracker

A professional score tracking dashboard for Geoguessr competitions with real-time updates and admin authentication.

## Features

- 🏆 **Competition Management** - Create and manage Geoguessr competitions
- 👥 **Player Tracking** - Track multiple players across rounds and games
- 🔐 **Authentication** - Secure admin login with creator-based permissions
- ⚡ **Real-time Updates** - Automatic score updates via WebSocket
- 📊 **Leaderboards** - Live rankings and score history
- 🎮 **Multi-game Rounds** - Support for rounds with multiple games
- 🔄 **Rejoin Logic** - Handle player rejoins with correct scoring

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add NEXTAUTH_SECRET (generate with: openssl rand -base64 32)

# Apply database schema
npx prisma db push
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your first admin account at `/login`.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with credentials provider
- **Real-time**: Socket.io with custom Next.js server
- **Styling**: Vanilla CSS with modern design system
- **TypeScript**: Full type safety

## Authentication

- Only authenticated users can create and manage competitions
- Competition creators have exclusive edit/delete permissions
- Non-authenticated users have read-only access to all data

## Real-time Updates

Scores automatically update across all connected clients when:
- New scores are submitted
- Existing scores are edited
- No manual refresh required

## Docker Deployment

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`.

## License

MIT
