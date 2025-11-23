# Authentication & WebSocket Setup

## Environment Variables

Add these to your `.env` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/opengusser"

# NextAuth.js
# Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Apply database schema:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Create your first admin user:
   - Navigate to http://localhost:3000/login
   - Click "Sign up"
   - Create an account

## Features

### Authentication
- Only logged-in users can create competitions
- Only competition creators can edit/delete their competitions
- Non-authenticated users have view-only access

### Real-time Updates
- Scores automatically update across all connected clients
- No manual refresh needed
- Connection status shown in development mode

## Testing

1. **Test Authentication:**
   - Create a user and login
   - Try creating a competition
   - Logout and verify you can only view competitions

2. **Test Real-time Updates:**
   - Open a competition page in one browser tab
   - Open the score entry page in another tab
   - Submit scores and watch the first tab update automatically
