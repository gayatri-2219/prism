import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    opportunity: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../db.js", () => ({ prisma: mockPrisma }));

import { opportunitiesRouter } from "../routes/opportunities.js";

function getHandler(path: string) {
  const layer = (opportunitiesRouter as any).stack.find(
    (entry: any) => entry.route?.path === path && entry.route?.methods?.get
  );
  return layer.route.stack[0].handle;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("opportunities routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/opportunities returns array", async () => {
    const handler = getHandler("/api/opportunities");
    const req: any = { query: {} };
    const res = createRes();

    mockPrisma.opportunity.findMany.mockResolvedValueOnce([
      {
        id: "op1",
        protocolName: "Initia Lending",
        strategyType: "lend",
        riskScore: 25,
        apy: 8.2,
        tvl: 5_100_000,
        lastUpdated: new Date("2026-04-24T12:00:00.000Z"),
      },
    ]);

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        opportunities: expect.any(Array),
        total: 1,
      })
    );
  });

  it("GET /api/opportunities?riskScore=30 only queries within ±20 range", async () => {
    const handler = getHandler("/api/opportunities");
    const req: any = { query: { riskScore: "30" } };
    const res = createRes();

    mockPrisma.opportunity.findMany.mockResolvedValueOnce([]);

    await handler(req, res);

    expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          riskScore: { gte: 10, lte: 50 },
        }),
      })
    );
  });

  it("GET /api/opportunities?type=lend only returns lend type", async () => {
    const handler = getHandler("/api/opportunities");
    const req: any = { query: { type: "lend" } };
    const res = createRes();

    mockPrisma.opportunity.findMany.mockResolvedValueOnce([]);

    await handler(req, res);

    expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ strategyType: "lend" }),
      })
    );
  });

  it("GET /api/opportunities?sort=apy returns sorted descending", async () => {
    const handler = getHandler("/api/opportunities");
    const req: any = { query: { sort: "apy" } };
    const res = createRes();

    mockPrisma.opportunity.findMany.mockResolvedValueOnce([]);

    await handler(req, res);

    expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { apy: "desc" } })
    );
  });
});
