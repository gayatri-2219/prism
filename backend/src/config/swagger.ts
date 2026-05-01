/**
 * Swagger/OpenAPI Configuration
 */

import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PRISM DeFi API",
      version: "1.0.0",
      description: "AI-powered DeFi strategy engine built on Initia Chain. Provides portfolio tracking, staking, airdrop tracking, cross-chain bridging, auto-signing sessions, and AI-powered insights.",
      contact: { name: "PRISM Team" },
    },
    servers: [
      { url: "http://localhost:3001", description: "Local Development" },
    ],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Portfolio", description: "Wallet & portfolio management" },
      { name: "Staking", description: "ETH staking via EigenLayer" },
      { name: "Airdrops", description: "Airdrop campaign tracking" },
      { name: "Bridge", description: "Interwoven cross-chain bridge" },
      { name: "Session", description: "Auto-signing session keys" },
      { name: "AI Insights", description: "AI-powered portfolio analysis" },
      { name: "Opportunities", description: "DeFi opportunity feed" },
      { name: "Positions", description: "User on-chain positions" },
      { name: "Leaderboard", description: "Strategy leaderboard" },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Service health check",
          responses: { "200": { description: "Health status with DB and chain connectivity" } },
        },
      },
      "/api/portfolio/{address}": {
        get: {
          tags: ["Portfolio"],
          summary: "Get portfolio for address",
          parameters: [
            { name: "address", in: "path", required: true, schema: { type: "string" }, description: "Initia or EVM address" },
            { name: "evmAddress", in: "query", schema: { type: "string" }, description: "Optional EVM address for contract reads" },
          ],
          responses: { "200": { description: "Portfolio with balances, strategies, and tx history" } },
        },
      },
      "/api/stake/apy": {
        get: {
          tags: ["Staking"],
          summary: "Get current staking APY",
          responses: { "200": { description: "Current APY and source" } },
        },
      },
      "/api/stake/position/{address}": {
        get: {
          tags: ["Staking"],
          summary: "Get staking position",
          parameters: [{ name: "address", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Staking position with rewards" } },
        },
      },
      "/api/stake/eth": {
        post: {
          tags: ["Staking"],
          summary: "Stake ETH",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    amount: { type: "string", example: "0.01" },
                    strategy: { type: "string", example: "default" },
                  },
                  required: ["amount"],
                },
              },
            },
          },
          responses: { "200": { description: "Transaction result" } },
        },
      },
      "/api/airdrops": {
        get: {
          tags: ["Airdrops"],
          summary: "List active airdrop campaigns",
          responses: { "200": { description: "Active campaigns" } },
        },
      },
      "/api/airdrops/{address}": {
        get: {
          tags: ["Airdrops"],
          summary: "Get airdrop progress & eligibility",
          parameters: [{ name: "address", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Progress and eligibility per campaign" } },
        },
      },
      "/api/airdrops/step": {
        post: {
          tags: ["Airdrops"],
          summary: "Mark airdrop step completed",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    address: { type: "string" },
                    campaignId: { type: "string" },
                    stepName: { type: "string" },
                  },
                  required: ["address", "campaignId", "stepName"],
                },
              },
            },
          },
          responses: { "200": { description: "Updated progress" } },
        },
      },
      "/api/bridge": {
        post: {
          tags: ["Bridge"],
          summary: "Initiate cross-chain bridge",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    fromChain: { type: "string", example: "ethereum" },
                    toChain: { type: "string", example: "initia" },
                    token: { type: "string", example: "ETH" },
                    amount: { type: "string", example: "0.5" },
                    senderAddress: { type: "string" },
                    recipientAddress: { type: "string" },
                  },
                  required: ["fromChain", "toChain", "token", "amount", "senderAddress"],
                },
              },
            },
          },
          responses: { "200": { description: "Bridge status" } },
        },
      },
      "/api/bridge/{txHash}": {
        get: {
          tags: ["Bridge"],
          summary: "Check bridge status",
          parameters: [{ name: "txHash", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Bridge transaction status" } },
        },
      },
      "/api/session/create": {
        post: {
          tags: ["Session"],
          summary: "Create auto-signing session key",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ownerAddress: { type: "string" },
                    permissions: { type: "array", items: { type: "string" }, example: ["stake", "bridge"] },
                    maxTxValue: { type: "string", example: "1.0" },
                    ttlSeconds: { type: "integer", example: 3600 },
                  },
                  required: ["ownerAddress"],
                },
              },
            },
          },
          responses: { "200": { description: "Created session key" } },
        },
      },
      "/api/session/execute": {
        post: {
          tags: ["Session"],
          summary: "Execute tx via session key (no popup)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sessionId: { type: "string" },
                    to: { type: "string" },
                    data: { type: "string" },
                    value: { type: "string" },
                    action: { type: "string", example: "stake" },
                  },
                  required: ["sessionId", "action"],
                },
              },
            },
          },
          responses: { "200": { description: "Transaction result" } },
        },
      },
      "/api/insights/{address}": {
        get: {
          tags: ["AI Insights"],
          summary: "Get AI-powered insights for wallet",
          parameters: [{ name: "address", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Personalized AI insights" } },
        },
      },
      "/api/insights/chat": {
        post: {
          tags: ["AI Insights"],
          summary: "Chat with PRISM AI",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    address: { type: "string" },
                    message: { type: "string" },
                    history: { type: "array", items: { type: "object" } },
                  },
                  required: ["message"],
                },
              },
            },
          },
          responses: { "200": { description: "AI response" } },
        },
      },
      "/api/opportunities": {
        get: {
          tags: ["Opportunities"],
          summary: "List DeFi opportunities",
          parameters: [
            { name: "riskScore", in: "query", schema: { type: "integer" } },
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "sort", in: "query", schema: { type: "string", enum: ["apy", "tvl", "risk", "newest"] } },
            { name: "limit", in: "query", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "Filtered opportunities list" } },
        },
      },
    },
  },
  apis: [], // We define paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);
