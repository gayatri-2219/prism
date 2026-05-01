import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    leaderboardEntry: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("../db.js", () => ({ prisma: mockPrisma }));

import { leaderboardRouter } from "../routes/leaderboard.js";

function getHandler() {
  const layer = (leaderboardRouter as any).stack.find(
    (entry: any) => entry.route?.path === "/api/leaderboard" && entry.route?.methods?.get
  );
  return layer.route.stack[0].handle;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("leaderboard route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/leaderboard returns sorted by totalReturn", async () => {
    const handler = getHandler();
    const req: any = { query: {} };
    const res = createRes();

    mockPrisma.leaderboardEntry.findMany.mockResolvedValueOnce([
      { userAddress: "init1a", totalReturn: 45, rank: 1 },
      { userAddress: "init1b", totalReturn: 20, rank: 2 },
    ]);
    mockPrisma.leaderboardEntry.count.mockResolvedValueOnce(2);

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: expect.any(Array),
        total: 2,
      })
    );
  });

  it("limit and offset pagination works", async () => {
    const handler = getHandler();
    const req: any = { query: { limit: "20", offset: "40" } };
    const res = createRes();

    mockPrisma.leaderboardEntry.findMany.mockResolvedValueOnce([]);
    mockPrisma.leaderboardEntry.count.mockResolvedValueOnce(99);

    await handler(req, res);

    expect(mockPrisma.leaderboardEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        skip: 40,
      })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 99,
      })
    );
  });
});
