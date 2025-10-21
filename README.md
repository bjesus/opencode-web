# OpenCode Web

A modern, responsive web interface for [OpenCode](https://github.com/sst/opencode) built with SolidJS, featuring real-time message streaming, virtual scrolling for optimal performance, and a simple UI.

## Features

- **Session Management** - Create, rename, delete, and fork sessions
- **Real-time Messaging** - Live SSE streaming for instant message updates
- **High Performance** - Virtual scrolling handles thousands of messages smoothly
- **Model & Agent Selection** - Dynamic model and agent picker with session memory
- **Token & Cost Tracking** - Real-time display of tokens used and costs
- **Flexible Configuration** - Frontend-only or proxied-backend modes
- **Theme Customization** - Choose from 32 DaisyUI themes
- **Mobile Responsive** - Optimized for mobile devices with collapsible sidebar

## Quick Start

## Frontend mode
With "Frontend mode" the app runs as a static SPA. You're expected to have an OpenCode API server running somewhere accessible. You can start one using `opencode serve`.

You can then use the the [hosted frontend](https://opencode-web.pages.dev/). Alternatively you can build it yourself using `npm run build`, and then host anywhere. 

## Proxied mode
With "Proxied mode" OpenCode Web will auto start `opencode serve` (so it needs to be in your `$PATH`), proxy it under `/api`, and auto-configure the UI to use it. This mode isn't purely static and should be started from the device you're using `opencode` from. You can then expose it to the internet using something like [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) and configure some access control for it.

You can start this mode using `npm run dev:proxy`

## License

MIT
