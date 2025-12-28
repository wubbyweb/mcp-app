# MCP Apps Demo Application

This is a demonstration of the Model Context Protocol (MCP) Apps Extension (SEP-1865), showcasing interactive UI resources in MCP servers.

## Overview

The application consists of:

- **MCP Server**: Exposes tools with UI resources using the `ui://` scheme.
- **Host App**: A web client that renders UI templates in sandboxed iframes and handles bidirectional communication.
- **UI Templates**: HTML/JavaScript interfaces that communicate with the host via postMessage.

## Features

- Interactive UI for collecting user information.
- Text-based fallback for tools without UI.
- Sandboxed iframe rendering for security.
- User consent prompts for tool calls from UI.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Clone or download the project.
2. Navigate to the project directory.
3. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the MCP Server:

```bash
npm run start:server
```

The server will run on http://localhost:3001.

2. In a new terminal, start the Host App:

```bash
npm run start:host
```

The host app will run on http://localhost:3000.

3. Open your browser and go to http://localhost:3000.

## Demo

1. The host app will display available tools.
2. For the "collect_user_info" tool, click "Open UI" to load the interactive form in an iframe.
3. Fill in the name and email fields in the form.
4. Click "Submit". A consent prompt will appear.
5. Allow the tool call. The result will be displayed in the UI.
6. For the "echo" tool, enter JSON args like `{"message": "Hello World"}` and click "Call Tool" to see the text-based interaction.

## Architecture

- **Server (server/server.js)**: Express server serving tools API and UI resources.
- **Host (host/host.js, host/public/index.html)**: Express server serving the host page that connects to the MCP server.
- **UI (ui/myform.html)**: HTML template for the collect_user_info tool.

Communication between UI and host uses postMessage with MCP-like JSON-RPC messages.

## Security

- UI content is rendered in iframes with `sandbox="allow-scripts allow-same-origin"`.
- Tool calls from UI require explicit user consent.

## Fallback

Tools without UI resources provide text-based interaction. All tool results include a `fallback` field for text-only clients.

## Development

To modify the application:

- Edit server logic in `server/server.js`.
- Update UI templates in `ui/`.
- Modify host behavior in `host/public/index.html`.

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Apps Extension Blog Post](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/?utm_source=chatgpt.com)