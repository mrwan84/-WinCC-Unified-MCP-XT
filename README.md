# WinCC Unified MCP XT

A **Model Context Protocol (MCP)** server designed to interface with **SIEMENS WinCC Unified SCADA systems** via their **GraphQL API**.
This server exposes various WinCC Unified functionalities as MCP tools, enabling AI assistants and other MCP-compatible clients to interact programmatically with the SCADA system.

---

## 🔧 Features

- Connects to a WinCC Unified GraphQL endpoint.
- Provides MCP tools for:
  - ✅ User authentication (`login-user`)
  - 📂 Browsing SCADA objects (`browse-objects`)
  - 📊 Reading current tag values (`get-tag-values`)
  - 🕒 Querying historical/logged tag data (`get-logged-tag-values`)
  - 🚨 Fetching active alarms (`get-active-alarms`)
  - 📁 Fetching logged alarms (`get-logged-alarms`)
  - ✍️ Writing values to tags (`write-tag-values`)
  - 🟢 Acknowledging alarms (`acknowledge-alarms`)
  - 🔄 Resetting alarms (`reset-alarms`)
- Optional automatic service account login with token refresh mechanism.

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or newer recommended)
- npm (comes with Node.js)
- Access to a running **WinCC Unified GraphQL** server endpoint

## ⚙️ Configuration

this server uses a `config.js` file written in ES module syntax.

### `config.js` (ESM) example:

```js
export const config = {
  URL: "https://your-wincc-server.example.com/graphql", // required
  userName: "service_account_username", // optional
  pwr: "service_account_password", // optional
};
```

## 🚀 How to Start

1. Navigate to the project folder:

```bash
cd your-project-directory
```

2. Install dependencies:

```bash
npm install
```

3. Edit config.js as shown above.

4. Start the server

```bash
node start
```

###🖥️ Connecting with Claude Desktop

To use this MCP server with Claude AI (desktop version):

1. Find or create the claude_desktop_config.json file
   (typically in the Claude app config folder).

2. Add or update the following:

```json
{
  "mcpServers": {
    "WinCC Unified": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:3000/mcp"]
    }
  }
}
```

4. Ensure @modelcontextprotocol/tools is installed:

```bash
npm install -g @modelcontextprotocol/tools
```

### 🧰 Available MCP Tools

| Tool                    | Description                        |
| ----------------------- | ---------------------------------- |
| `login-user`            | Logs in with username/password.    |
| `browse-objects`        | Browses configured SCADA elements. |
| `get-tag-values`        | Retrieves live tag values.         |
| `get-logged-tag-values` | Gets historical tag data.          |
| `get-active-alarms`     | Lists currently active alarms.     |
| `get-logged-alarms`     | Shows previously triggered alarms. |
| `write-tag-values`      | Updates one or more tags.          |
| `acknowledge-alarms`    | Acknowledges alarms.               |
| `reset-alarms`          | Resets alarms.                     |

### 📝 Notes

- If configured, a service account is automatically logged in and token refreshed every minute.

- A user's manual login overrides the service session temporarily.
"# WinCC-Unified-MCP-XT" 
"# WinCC-Unified-MCP-XT" 
