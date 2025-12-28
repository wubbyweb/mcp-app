Below is **a detailed technical specification** for implementing an MCP Apps-enabled application that demonstrates the ideas in the **MCP Apps Extension (SEP-1865)**—basically an MCP server + interactive UI experience based on the recent blog post proposal. ([Model Context Protocol Blog][1])

---

# 📌 **Technical Specification: MCP Apps Demo Application**

## 📌 **Overview**

This project will build an interactive application using the **Model Context Protocol (MCP) Apps Extension (SEP-1865)**, showcasing:

* An MCP server that exposes tools with **UI resources**
* A host/client environment that loads and renders those UI resources
* Bidirectional communication between UI and host using **MCP JSON-RPC**
* Fallback to non-UI text when UI isn’t supported

This spec assumes familiarity with MCP basics (clients, hosts, servers, tools) and adds the Apps extension for interactive UIs. ([Model Context Protocol][2])

---

## 🎯 **Goals**

| Feature         | Description                                        |
| --------------- | -------------------------------------------------- |
| MCP Server      | Exposes tools + UI resources using `ui://…` scheme |
| MCP Client/Host | Renders UI templates in sandboxed iframes          |
| UI Templates    | HTML/JavaScript UIs driven by JSON data from tools |
| Communication   | UI ↔ host via MCP JSON-RPC over `postMessage`      |
| Fallback        | Text responses when UI isn’t supported             |

---

## 🏗️ **Architecture**

Here’s the high-level architecture:

```
+----------------------+   JSON-RPC   +----------------------+
|   Host App (Client)  | <==========> |    MCP Server        |
|                      |              |                      |
| +------------------+ |              | +------------------+ |
| | UI Renderer (iframe) |           | | Tools (logic)     | |
| +------------------+ |              | +------------------+ |
+----------------------+              +----------------------+
                  |
                  | postMessage (MCP JSON-RPC transport)
                  |
                  v
         UI Code (HTML + JS + SDK)
```

Key components:

* **MCP Server** – Hosts tools + UI resources (HTML templates, metadata)
* **Host App** – MCP client + iframe renderer
* **UI Template** – HTML/JavaScript bundle loaded by host

---

## 📦 **Server Implementation**

### 🧱 **1. MCP Server Setup**

Implement a basic MCP server that:

* Advertises tools with JSON Schema input/output
* Declares UI resources using the `ui://` scheme
* Hosts UI templates (HTML + assets)

Example registration in server metadata:

```jsonc
{
  "uri": "ui://example/myform",
  "name": "Example Form UI",
  "mimeType": "text/html+mcp"
}
```

Tool metadata references UI:

```jsonc
{
  "name": "collect_user_info",
  "inputSchema": {
    "type": "object",
    "properties": {
      "initial": { "type": "string" }
    }
  },
  "_meta": {
    "ui/resourceUri": "ui://example/myform"
  }
}
```

This allows the host to *prefetch and review* the HTML before executing. ([Model Context Protocol Blog][1])

---

### 🧩 **2. Tool Handlers**

For each tool:

* Implement logic that accepts arguments
* Emits JSON output that the UI template will use
* Return either data or signal UI update events

Example server “collect_user_info” handler:

```js
async function collectUserInfo(params) {
  return {
    message: "Please fill in your profile:",
    initial: params.initial
  }
}
```

---

## 🖼️ **UI Template Design**

### ✨ **3. HTML UI Resource**

Each UI is:

* A self-contained HTML file
* Loaded into a sandboxed iframe in the host
* Communicating via `postMessage`

Minimal HTML structure:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MCP UI</title>
  <script src="mcp-sdk.js"></script>
</head>
<body>
  <form id="uiForm">
     <input id="name" placeholder="Name" />
     <button type="submit">Submit</button>
  </form>

  <script>
    const client = new MCP.UIClient();

    document.getElementById("uiForm").addEventListener("submit", e => {
      e.preventDefault();
      client.toolCall("collect_user_info", {
        name: document.getElementById("name").value
      });
    });

    client.onResponse((result) => {
      // Handle response
      alert("Server response: " + JSON.stringify(result));
    });
  </script>
</body>
</html>
```

---

## 📡 **Host/Client Implementation**

### 🧠 **4. Rendering UI in Host**

The Host must:

1. Detect UI resource referenced by MCP tool metadata
2. Fetch the HTML template server-side
3. Render it in an iframe with sandboxing
4. Provide MCP JSON-RPC bridge between UI and host

Security rules:

* Use strict iframe sandbox flags
* Only allow communication via MCP JSON-RPC messages
* Prompt user consent for tool calls from UI

---

### 🔁 **5. MCP JSON-RPC Bridge**

Communication between:

* **iframe UI** and **Host app**
* Uses `postMessage` channel
* Follows MCP’s JSON-RPC protocol

This allows UI to request tool invocation via:

```
UI → Host: request_call_tool(...)
Host → Server: MCP JSON-RPC call
Server → Host → UI: responses/events
```

---

## 📜 **Fallback Behavior**

If a host doesn’t support MCP Apps:

* The server must provide **text-only** fallback results
* Fallback could be OpenAPI-like descriptions or plain text

Example:

```
Tool result:
{
  fallback: "Please visit the UI in a compatible client to use this tool."
}
```

---

## 🔐 **Security & UX Requirements**

### 🚀 **6. Sandboxed UI**

UI content must be rendered inside:

* HTML `iframe` with sandboxing (`sandbox="allow-scripts"`)
* Only explicit host messages allowed

This mitigates malicious content risks. ([Model Context Protocol Blog][1])

### 🧾 **7. Explicit Permissions**

Hosts must:

* Ask user before granting UI ability to call tools
* Reject unauthorized UI tool calls

---

## 🧪 **Testing Plan**

### ✔️ **Unit Tests**

* Test MCP server tool handlers
* Test correct UIP metadata registration
* Verify postMessage bridges handle JSON-RPC messages

### 🧷 **Integration Tests**

* Render UI in a mock host
* Validate sequences: UI loads → tool call → data returned
* Tests for fallback behavior

---

## 🧠 **Development Roadmap**

| Phase                     | Tasks                                     |
| ------------------------- | ----------------------------------------- |
| **P1: MCP Server + Tool** | Build server, define tools + JSON schemas |
| **P2: UI Templates**      | Create HTML UIs with MCP SDK              |
| **P3: Host Renderer**     | Build host to load UI + bridge            |
| **P4: Fallback Support**  | Graceful behavior when UI isn’t supported |
| **P5: Security Harden**   | Sandboxing + consent prompts              |
| **P6: User Testing**      | UX validation + error handling            |

---

## 🔧 **Tech Stack Recommendations**

* **Server**: Node.js/Python or Go with MCP SDK
* **UI Templates**: Static HTML/JS using MCP SDK
* **Host**: Electron/Web (React) capable of iframe sandboxing
* **Testing**: Jest, Playwright

---

## 📎 **References**

* MCP Core: protocol for connecting AI tools & servers, using JSON-RPC. ([Model Context Protocol][2])
* MCP Apps extension proposal standardizes interactive UI resources, linking UIs to tools using `ui://…` scheme, and secure bidirectional MCP JSON-RPC. ([Model Context Protocol Blog][1])

---

If you want, I can extend this with **code examples** (server + host + UI) in your preferred stack (Node, Python, or Go).

[1]: https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/?utm_source=chatgpt.com "MCP Apps: Extending servers with interactive user interfaces | Model Context Protocol Blog"
[2]: https://modelcontextprotocol.io/?utm_source=chatgpt.com "What is the Model Context Protocol (MCP)? - Model Context Protocol"
