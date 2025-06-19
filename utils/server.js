import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// ------------------------------------------------------------------------------------------------------------------------------------------------
import {
  ObjectTypes,
  LoggedTagValuesSortingMode,
  LoggedTagValuesBoundingMode,
  MainQuality,
  QualitySubStatus,
  QualityInput,
  AlarmIdentifierInput,
} from "./enum.js";
// ------------------------------------------------------------------------------------------------------------------------------------------------
import {
  graphqlQueryBrowse,
  graphqlQueryTagValues,
  graphqlQueryLoggedTagValues,
  graphqlQueryActiveAlarms,
  graphqlQueryLoggedAlarms,
  graphqlMutationTagValues,
  graphqlMutationAcknowledgeAlarms,
  graphqlMutationResetAlarms,
} from "./query.js";
// ------------------------------------------------------------------------------------------------------------------------------------------------
import { logon, sendReq } from "./graphqlFunc.js";
import { config } from "../config.js";
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Log on service for WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------
const graphQL_URL = config.URL;
const graphQL_user = config.userName;
const graphQL_pwr = config.pwr;
let authInfos = { user: graphQL_user, pwd: graphQL_pwr, token: null };
export const logonService = () => {
  if (authInfos.user && authInfos.pwd) {
    const runLogon = async () => {
      try {
        const loginData = await logon(
          graphQL_URL,
          authInfos.user,
          authInfos.pwd
        );
        if (loginData && loginData.token) {
          console.log(`run Logon success for user: '${loginData.user}'`);
          authInfos.user = loginData.user;
          authInfos.pwd = loginData.pwd;
          authInfos.token = loginData.token;
        }
      } catch (err) {
        console.error("run Logon failed", err.message);
      }
    };
    runLogon();
    setInterval(runLogon, 60000);
  }
};
// ------------------------------------------------------------------------------------------------------------------------------------------------
// MCP Server
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Create server instance
export const server = new McpServer({
  name: "WinCC Unified Core XT",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to log in a user to WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "login-user",
  `Authenticates a user in WinCC Unified using a provided username and password.
   `,
  {
    username: z.string().min(1, "Username cannot be empty."),
    password: z.string().min(1, "Password cannot be empty."),
  },
  async ({ username, password }, executionContext) => {
    console.log(`Tool 'login-user' || username: ${username}`);

    try {
      const session = logon(graphQL_URL, username, password);
      authInfos.user = session.user;
      authInfos.pwd = session.pwd;
      authInfos.token = session.token;
      return {
        content: [
          {
            type: "text",
            text: "Tool 'login-user' || successfully completed.",
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'login-user' || Error GraphQL:", err);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to browse objects in WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "browse-objects",
  "Retrieves tags, elements, types, alarms, logging tags, and other named objects based on specified filter criteria.",
  {
    nameFilters: z.array(z.string()).optional().default([]),
    objectTypeFilters: z.array(ObjectTypes).optional().default([]),
    baseTypeFilters: z.array(z.string()).optional().default([]),
    language: z.string().optional().default("en-US"),
  },
  async (
    { nameFilters, objectTypeFilters, baseTypeFilters, language },
    executionContext
  ) => {
    try {
      const variables = {
        nameFilters,
        objectTypeFilters,
        baseTypeFilters,
        language,
      };
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlQueryBrowse,
        variables
      );
      if (data?.browse) {
        console.log(
          "Tool 'browse-objects' ||  Number of items: ",
          data.browse.length
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data.browse) }],
        };
      }
    } catch (error) {
      console.error("Tool 'browse-objects' ||error GraphQL:", error);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to get tag values from WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "get-tag-values",
  "Retrieves tag values from WinCC Unified based on the provided names or filter criteria.",
  {
    names: z
      .array(z.string())
      .min(1, "At least one tag name must be provided."),
    directRead: z.boolean().optional().default(false), // Matches GraphQL default
  },
  async ({ names, directRead }, executionContext) => {
    const variables = {
      names,
      directRead,
    };
    try {
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlQueryTagValues,
        variables
      );

      if (data?.tagValues) {
        console.log("Tool 'get-tag-values' || successfully completed.");
        return {
          content: [{ type: "text", text: JSON.stringify(data.tagValues) }],
        };
      }
    } catch (error) {
      console.error("Tool 'get-tag-values' || Error GraphQL:", error);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to get logged tag values from WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "get-logged-tag-values",
  "Retrieves historical tag values from the database for the specified tags or logging tags.",
  {
    names: z
      .array(z.string())
      .min(1, "At least one tag name must be provided."),
    startTime: z
      .string()
      .datetime({ message: "Invalid ISO 8601 datetime string for startTime" })
      .optional()
      .default("1970-01-01T00:00:00.000Z"),
    endTime: z
      .string()
      .datetime({ message: "Invalid ISO 8601 datetime string for endTime" })
      .optional()
      .default("1970-01-01T00:00:00.000Z"),
    maxNumberOfValues: z.number().int().optional().default(0),
    sortingMode: LoggedTagValuesSortingMode.optional().default("TIME_ASC"),
    boundingValuesMode:
      LoggedTagValuesBoundingMode.optional().default("NO_BOUNDING_VALUES"),
  },
  async (
    {
      names,
      startTime,
      endTime,
      maxNumberOfValues,
      sortingMode,
      boundingValuesMode,
    },
    executionContext
  ) => {
    const variables = {
      names,
      startTime,
      endTime,
      maxNumberOfValues,
      sortingMode,
      boundingValuesMode,
    };

    try {
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlQueryLoggedTagValues,
        variables
      );
      // Transform the GraphQL response to MCP table format
      const tableData = {
        columns: [
          { name: "Logging Tag Name", type: "string" },
          { name: "Timestamp", type: "datetime" },
          { name: "Value", type: "string" },
        ],
        rows: [],
      };
      if (data && data.loggedTagValues) {
        data.loggedTagValues.forEach((tagResult) => {
          const tagName = tagResult.loggingTagName;
          if (tagResult.values && tagResult.values.length > 0) {
            tagResult.values.forEach((loggedVal) => {
              if (loggedVal.value) {
                tableData.rows.push([
                  tagName,
                  loggedVal.value.timestamp || null,
                  loggedVal.value.value !== undefined &&
                  loggedVal.value.value !== null
                    ? String(loggedVal.value.value)
                    : null,
                ]);
              }
            });
          } else {
            tableData.rows.push([tagName, null, null]);
          }
        });
      }
      const formatTableAsText = (columns, rows) => {
        if (rows.length === 0) {
          return "No data available.";
        }
        const columnNames = columns.map((col) => col.name);
        const columnWidths = columnNames.map((name, index) => {
          let maxWidth = name.length;
          rows.forEach((row) => {
            const cellValue =
              row[index] !== null && row[index] !== undefined
                ? String(row[index])
                : "";
            if (cellValue.length > maxWidth) {
              maxWidth = cellValue.length;
            }
          });
          return maxWidth;
        });
        // Create header
        let textTable =
          columnNames
            .map((name, index) => name.padEnd(columnWidths[index]))
            .join(" | ") + "\n";
        textTable +=
          columnWidths.map((width) => "-".repeat(width)).join("-+-") + "\n";
        // Create rows
        rows.forEach((row) => {
          textTable +=
            row
              .map((cell, index) => {
                const cellValue =
                  cell !== null && cell !== undefined ? String(cell) : "";
                return cellValue.padEnd(columnWidths[index]);
              })
              .join(" | ") + "\n";
        });
        return textTable;
      };

      const textFormattedTable = formatTableAsText(
        tableData.columns,
        tableData.rows
      );
      console.log(
        "Tool 'get-logged-tag-values' || successfully completed. Number of rows: ",
        tableData.rows.length
      );
      return { content: [{ type: "text", text: textFormattedTable }] };
    } catch (error) {
      console.error("Tool 'get-logged-tag-values' ||error GraphQL:", error);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to get active alarms from WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "get-active-alarms",
  "Retrieves active alarms from the specified systems.",
  {
    systemNames: z.array(z.string()).optional().default([]),
    filterString: z.string().optional().default(""),
    filterLanguage: z.string().optional().default("en-US"),
    languages: z.array(z.string()).optional().default(["en-US"]),
  },
  async (
    {
      systemNames,
      filterString,
      filterLanguage,
      languages: requestedLanguages,
    },
    executionContext
  ) => {
    const variables = {
      systemNames,
      filterString,
      filterLanguage,
      languages: requestedLanguages,
    };

    try {
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlQueryActiveAlarms,
        variables
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.activeAlarms || [], null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Tool 'get-active-alarms' || error GraphQL:", error);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to get logged alarms from WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "get-logged-alarms",
  "Retrieves historical (logged) alarms from the storage system.",

  {
    systemNames: z.array(z.string()).optional().default([]),
    filterString: z.string().optional().default(""),
    filterLanguage: z.string().optional().default("en-US"),
    languages: z.array(z.string()).optional().default(["en-US"]),
    startTime: z
      .string()
      .datetime({ message: "Invalid ISO 8601 datetime string for startTime" })
      .optional()
      .default("1970-01-01T00:00:00.000Z"),
    endTime: z
      .string()
      .datetime({ message: "Invalid ISO 8601 datetime string for endTime" })
      .optional()
      .default("1970-01-01T00:00:00.000Z"),
    maxNumberOfResults: z.number().int().optional().default(0),
  },
  async (
    {
      systemNames,
      filterString,
      filterLanguage,
      languages: requestedLanguages,
      startTime,
      endTime,
      maxNumberOfResults,
    },
    executionContext
  ) => {
    const variables = {
      systemNames,
      filterString,
      filterLanguage,
      languages: requestedLanguages,
      startTime,
      endTime,
      maxNumberOfResults,
    };

    try {
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlQueryLoggedAlarms,
        variables
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.loggedAlarms || [], null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Tool 'get-logged-alarms' || error GraphQL:", error);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to write tag values to WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "write-tag-values",
  " Updates tag values based on a provided list of TagValueInput entries.",
  {
    input: z
      .array(
        z.object({
          name: z.string().min(1, "Tag name cannot be empty."),
          value: z.any(), // GraphQL Variant can be string, number, boolean, etc.
          timestamp: z
            .string()
            .datetime({
              message: "Invalid ISO 8601 datetime string for timestamp",
            })
            .optional(),
          quality: QualityInput.optional(),
        })
      )
      .min(1, "At least one tag value input must be provided."),
    timestamp: z
      .string()
      .datetime({
        message: "Invalid ISO 8601 datetime string for global timestamp",
      })
      .optional(),
    quality: QualityInput.optional(),
  },
  async ({ input, timestamp, quality }, executionContext) => {
    const variables = {
      input,
      timestamp,
      quality,
    };
    try {
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlMutationTagValues,
        variables
      );

      if (data?.writeTagValues) {
        console.log("Tool 'write-tag-values' || successfully completed.");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.writeTagValues, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      console.error("Tool 'write-tag-values' || error GraphQL:", error);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to acknowledge or reset alarms in WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "acknowledge-alarms",
  "Acknowledges one or more active alarms based on their identifiers.",
  {
    input: z
      .array(AlarmIdentifierInput)
      .min(1, "At least one alarm identifier must be provided."),
  },
  async ({ input }, executionContext) => {
    console.log(`Tool 'acknowledge-alarms' called with:`, { input });

    const variables = {
      input,
    };

    try {
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlMutationAcknowledgeAlarms,
        variables
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.acknowledgeAlarms || [], null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Tool 'acknowledge-alarms' || error GraphQL:", error);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to reset alarms in WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "reset-alarms",
  " Resets one or more active alarms based on their identifiers.",
  {
    input: z
      .array(AlarmIdentifierInput)
      .min(1, "At least one alarm identifier must be provided."),
  },
  async ({ input }, executionContext) => {
    console.log(`Tool 'reset-alarms' called with:`, { input });

    const variables = {
      input,
    };

    try {
      const data = await sendReq(
        graphQL_URL,
        authInfos,
        graphqlMutationResetAlarms,
        variables
      );

      if (data?.resetAlarms) {
        console.log("Tool 'reset-alarms' || successfully completed.");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.resetAlarms, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      console.error("Tool 'reset-alarms' || error GraphQL:", error);
    }
  }
);
