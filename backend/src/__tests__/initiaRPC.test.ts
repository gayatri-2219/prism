import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
    })),
  },
}));

import { InitiaRPCService } from "../services/initiaRPC.js";

describe("InitiaRPCService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolveInitUsername returns null for unknown address", async () => {
    const rpc = new InitiaRPCService();
    mockGet.mockResolvedValueOnce({ data: { names: [] } });

    const result = await rpc.resolveInitUsername("init1unknown");

    expect(result).toBeNull();
  });

  it("getBalance returns array of { denom, amount }", async () => {
    const rpc = new InitiaRPCService();
    mockGet.mockResolvedValueOnce({
      data: {
        balances: [
          { denom: "uinit", amount: "1000000" },
          { denom: "uusdc", amount: "500000" },
        ],
      },
    });

    const balances = await rpc.getBalance("init1known");

    expect(balances).toEqual([
      { denom: "uinit", amount: "1000000" },
      { denom: "uusdc", amount: "500000" },
    ]);
  });
});
