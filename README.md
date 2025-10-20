# OpenCode Web

A modern, responsive web interface for [OpenCode](https://github.com/sst/opencode) built with SolidJS, featuring real-time message streaming, virtual scrolling for optimal performance, and a beautiful UI powered by DaisyUI.

## Features

- ✨ **Session Management** - Create, rename, delete, and fork sessions
- 💬 **Real-time Messaging** - Live SSE streaming for instant message updates
- 🎨 **Beautiful UI** - Modern, responsive design with DaisyUI and 32 themes
- ⚡ **High Performance** - Virtual scrolling handles thousands of messages smoothly
- 🎯 **Model & Agent Selection** - Dynamic model and agent picker with session memory
- 📊 **Token & Cost Tracking** - Real-time display of tokens used and costs
- 🔧 **Flexible Configuration** - Frontend-only or proxied-backend modes
- 🎨 **Theme Customization** - Choose from 32 DaisyUI themes
- 📱 **Mobile Responsive** - Optimized for mobile devices with collapsible sidebar

## Tech Stack

- **Framework**: [SolidJS](https://www.solidjs.com/) - Reactive, performant UI framework
- **API Client**: [@opencode-ai/sdk](https://www.npmjs.com/package/@opencode-ai/sdk) - Type-safe OpenCode SDK
- **Virtualization**: [@tanstack/solid-virtual](https://tanstack.com/virtual) - Efficient rendering of large lists
- **UI Components**: [DaisyUI](https://daisyui.com/) - Tailwind CSS component library with 32 themes
- **Markdown**: [Marked](https://marked.js.org/) - Fast markdown parser
- **Syntax Highlighting**: [Prism](https://prismjs.com/) - Lightweight syntax highlighter
- **Build Tool**: [Vite 7](https://vitejs.dev/) - Next-generation frontend tooling
- **Language**: TypeScript

## Prerequisites

- Node.js 20.19+ or 22.12+ (required for Vite 7)
- npm
- OpenCode API server running (default: `http://localhost:9999`)

## Quick Start

### Development Mode (Frontend Only)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`. On first load, you'll be prompted to enter your OpenCode API endpoint.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm preview
```

## Operating Modes

### Frontend-Only Mode (Default)

The application runs as a static SPA. Users configure the API endpoint via the settings page, which is saved to localStorage.

**To deploy:**
- Build the app with `npm run build`
- Deploy the `dist` folder to any static hosting service (Cloudflare Pages, GitHub Pages, etc.)
- Users connect to their own OpenCode API server

### Proxied-Backend Mode

A Node.js helper that:
- Launches `opencode serve` automatically
- Proxies API requests to the local OpenCode instance
- Serves the frontend at `/` and the API under `/api/*`
- Auto-sets the web app API endpoint to `/api` (no manual config)

Prerequisites:
- `opencode` CLI installed and in PATH

Usage:
```bash
npm run dev:proxy
```

Vite runs on http://localhost:3000 and proxies API requests to the detected OpenCode server.

## Configuration

### API Endpoint

Configure the OpenCode API endpoint via the settings page (gear icon):
- Default: `http://localhost:9999`
- Supports any OpenCode API server with CORS enabled

### Theme

The app automatically respects your system's dark/light mode preference. You can customize themes in `tailwind.config.js`.

## Project Structure

```
opencode-web/
├── src/
│   ├── api/              # API client and SSE handling
│   │   ├── client.ts     # OpenCode API client
│   │   ├── types.ts      # TypeScript types from OpenAPI
│   │   └── sse.ts        # Server-Sent Events handler
│   ├── components/       # UI components
│   │   ├── SessionList.tsx
│   │   ├── ChatView.tsx
│   │   ├── MessageItem.tsx
│   │   ├── MessageInput.tsx
│   │   ├── Settings.tsx
│   │   └── common/
│   │       └── Markdown.tsx
│   ├── stores/           # State management
│   │   ├── config.ts     # App configuration
│   │   └── session.ts    # Session state
│   ├── App.tsx           # Main app component
│   ├── index.tsx         # Entry point
│   └── index.css         # Global styles
├── public/
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## API Integration

The app integrates with the OpenCode API:

- **Sessions**: List, create, update, delete, fork sessions
- **Messages**: Send messages, receive real-time updates via SSE
- **Models**: Dynamic loading of available AI models
- **Agents**: Support for different agent types (build, plan, general)
- **Real-time Updates**: SSE for live message streaming

## Development

### Available Scripts

- `npm run dev` - Start development server (frontend only)
- `npm run dev:frontend` - Alias for `npm run dev`
- `npm run dev:proxy` - Start dev server with integrated backend proxy
- `npm run build` - Build for production
- `npm run build:cf` - Build for Cloudflare Workers (TODO)
- `npm run preview` - Preview production build

### Testing

The app has been tested with automated browser tests using Playwright:

```bash
# Run verification test
node test-final-check.mjs
```

## Performance Optimizations

- **Virtual Scrolling**: Only renders visible messages, handling conversations with thousands of messages
- **Reactive Updates**: SolidJS fine-grained reactivity ensures minimal re-renders
- **Code Splitting**: Vite automatically splits code for optimal loading
- **Markdown Caching**: Efficient markdown rendering with syntax highlighting

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Cloudflare Pages/Workers (TODO)

```bash
npm run build:cf
# Follow Cloudflare deployment instructions
```

### Static Hosting

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Roadmap

- [x] Theme customization with 32 DaisyUI themes
- [x] Fork session functionality
- [x] Model/Agent selection persistence
- [x] Type-safe API client with @opencode-ai/sdk
- [ ] File attachment support in message input
- [x] Backend proxy mode with `opencode serve` integration
- [ ] Cloudflare Workers deployment config
- [ ] Session search and filtering
- [ ] Export conversation to markdown
- [ ] Keyboard shortcuts

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Acknowledgments

- Built for [OpenCode](https://github.com/sst/opencode) by [SST](https://sst.dev/)
- Powered by [SolidJS](https://www.solidjs.com/)
- UI components by [DaisyUI](https://daisyui.com/)
