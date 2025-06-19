/*
 * M.alsouki
 *
 * A MCP Server integration with WinCC Unified via GraphQL
 *
 */

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

import { logonService, server } from "./utils/server.js";

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Logon
// ------------------------------------------------------------------------------------------------------------------------------------------------
logonService();
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Express server setup for MCP requests
// ------------------------------------------------------------------------------------------------------------------------------------------------
const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  console.log("Received POST MCP request");
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      transport.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req, res) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

app.delete("/mcp", async (req, res) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`WinCC Unified MCP Server port ${PORT}`);
});
