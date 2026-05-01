import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockContractReader, mockInitiaRPC } = vi.hoisted(() => ({
  mockPrisma: {
    userPosition: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    userStrategy: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
  },
  mockContractReader: {
    getPosition: vi.fn(),
    getStrategies: vi.fn(),
  },
  mockInitiaRPC: {
    resolveInitUsername: vi.fn(),
  },
}));

vi.mock("../db.js", () => ({ prisma: mockPrisma }));
vi.mock("../services/contractReader.js", () => ({ contractReader: mockContractReader }));
vi.mock("../services/initiaRPC.js", () => ({ initiaRPC: mockInitiaRPC }));

import { positionsRouter } from "../routes/positions.js";

function getHandler() {
  const layer = (positionsRouter as any).stack.find(
    (entry: any) => entry.route?.path === "/api/positions/:address" && entry.route?.methods?.get
  );
  return layer.route.stack[0].handle;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("positions route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/positions/{unknownAddress} returns null position", async () => {
    const handler = getHandler();
    const req: any = { params: { address: "init1unknown" } };
    const res = createRes();

    mockPrisma.userPosition.findUnique.mockResolvedValueOnce({
      id: "p1",
      userAddress: "init1unknown",
      totalDeposited: 0,
      totalWithdrawn: 0,
      currentValue: 0,
      riskScore: 0,
      autopilotEnabled: false,
      lastUpdated: new Date(),
      strategies: [],
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        position: expect.objectContaining({ userAddress: "init1unknown" }),
        strategies: [],
      })
    );
  });

  it("GET /api/positions/{knownAddress} returns position with strategies", async () => {
    const handler = getHandler();
    const req: any = { params: { address: "init1known" } };
    const res = createRes();

    mockPrisma.userPosition.findUnique.mockResolvedValueOnce(null);

    mockContractReader.getPosition.mockResolvedValueOnce({
      totalDeposited: 2_000_000_000_000_000_000n,
      totalWithdrawn: 500_000_000_000_000_000n,
      riskScore: 42,
      lastUpdated: 0n,
      strategyCount: 1,
      autopilotEnabled: true,
    });
    mockContractReader.getStrategies.mockResolvedValueOnce([
      {
        protocolAddress: "0x2222222222222222222222222222222222222222",
        functionSelector: "0x12345678",
        allocatedAmount: 1_500_000_000_000_000_000n,
        currentValue: 1_600_000_000_000_000_000n,
        strategyType: 2,
        minReturn: 0n,
        isActive: true,
      },
    ]);
    mockInitiaRPC.resolveInitUsername.mockResolvedValueOnce("alice");

    mockPrisma.userPosition.upsert.mockResolvedValueOnce({
      id: "p2",
      userAddress: "init1known",
      totalDeposited: 2,
      totalWithdrawn: 0.5,
      currentValue: 1.5,
      riskScore: 42,
      autopilotEnabled: true,
      lastUpdated: new Date(),
    });

    mockPrisma.userStrategy.deleteMany.mockResolvedValueOnce({ count: 0 });
    mockPrisma.userStrategy.createMany.mockResolvedValueOnce({ count: 1 });
    mockPrisma.userStrategy.findMany.mockResolvedValueOnce([
      {
        id: "s1",
        userAddress: "init1known",
        strategyType: "lend",
        allocatedAmount: 1.5,
        currentValue: 1.6,
        isActive: true,
      },
    ]);

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        position: expect.objectContaining({ userAddress: "init1known" }),
        strategies: expect.any(Array),
      })
    );
    expect(mockContractReader.getPosition).toHaveBeenCalledWith("init1known");
  });
});
