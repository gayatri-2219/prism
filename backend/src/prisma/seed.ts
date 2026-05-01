import "dotenv/config";
import { prisma } from "../db.js";

async function main() {
  await prisma.opportunity.deleteMany();

  await prisma.opportunity.createMany({
    data: [
      {
        protocolName: "Initia DEX",
        protocolAddress: "0x1111111111111111111111111111111111111111",
        strategyType: "lp",
        apy: 18.5,
        tvl: 2400000,
        riskScore: 45,
        tokenSymbol: "INIT/USDC",
        tokenAddress: "0x9999999999999999999999999999999999999999",
        minDeposit: 1,
        description: "Provide liquidity to the main INIT/USDC pool",
        isActive: true,
      },
      {
        protocolName: "Initia Lending",
        protocolAddress: "0x2222222222222222222222222222222222222222",
        strategyType: "lend",
        apy: 8.2,
        tvl: 5100000,
        riskScore: 25,
        tokenSymbol: "INIT",
        tokenAddress: "0x8888888888888888888888888888888888888888",
        minDeposit: 1,
        description: "Lend INIT tokens to earn stable interest",
        isActive: true,
      },
      {
        protocolName: "Initia Staking",
        protocolAddress: "0x3333333333333333333333333333333333333333",
        strategyType: "stake",
        apy: 12.0,
        tvl: 18000000,
        riskScore: 15,
        tokenSymbol: "INIT",
        tokenAddress: "0x7777777777777777777777777777777777777777",
        minDeposit: 1,
        description: "Stake INIT to earn validator rewards",
        isActive: true,
      },
      {
        protocolName: "Initia Vault",
        protocolAddress: "0x4444444444444444444444444444444444444444",
        strategyType: "lend",
        apy: 22.4,
        tvl: 800000,
        riskScore: 72,
        tokenSymbol: "USDC",
        tokenAddress: "0x6666666666666666666666666666666666666666",
        minDeposit: 1,
        description: "High-yield USDC vault with leverage",
        isActive: true,
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log("seed_complete", { opportunities: 4 });
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("seed_failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
