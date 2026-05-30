# Fearch Console

Enterprise-grade API management dashboard for the Fearch search and scrape platform.

## Features

- **Real-time API Usage Tracking** — Monitor request counts, key usage, and billing tiers
- **API Key Management** — Create, revoke, and monitor API keys
- **Interactive Playground** — Test search, scrape, and crawl endpoints
- **Dark/Light Mode** — Full theme support with system preference detection
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Keyboard Shortcuts** — Power-user friendly (⌘K search, ⌘R refresh, ⌘N new key)
- **Offline Detection** — Shows connection status and handles gracefully
- **Export Functionality** — Export usage data as JSON
- **Toast Notifications** — Real-time feedback for all actions
- **Auto-refresh** — Data refreshes every 30 seconds automatically

## Tech Stack

- React 19 + TypeScript
- Vite (fast dev/build)
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Clerk (authentication)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_FEARCH_ADMIN_SECRET=your_admin_secret
```

## API Integration

The dashboard connects to the Fearch API at `https://search.frenix.sh/v1`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/search` | POST | Web search |
| `/v1/scrape` | POST | URL scraping |
| `/v1/keys/create` | POST | Create API key (admin) |
| `/v1/keys` | GET | List API keys (admin) |
| `/v1/user/usage` | GET | Get user usage |
| `/v1/billing` | GET/POST | Billing management |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K | Focus search |
| ⌘R | Refresh data |
| ⌘N | Create new key |
| 1-4 | Switch tabs |

## License

MIT
