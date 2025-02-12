import { DynamicFormatAmount } from "@/lib/algebra/utils/common/formatAmount";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import { DOMAIN_MAP } from "honeypot-sdk";

export const pot2pumpShareLink = (pair: MemePairContract) =>
  `${DOMAIN_MAP.POT2PUMP}/launch-detail/${pair.address}`;

export const pot2PumpPumpingShareContent = (pair: MemePairContract) => `
🚀 Just graduated from Pot2Pump on @honeypotfinance 
💥 "${pair.launchedToken?.symbol}" now trading on Pot-Wasabee DEX -> Berachain's answer to @Meteora

🔹 A portion of token permanently locked
🔹 Enhanced m3m3 staking mechanism
🔹 Integrated with @berachain POL.
`;

export const pot2PumpPottingShareContent = (pair: MemePairContract) => `
🚀 "${pair.launchedToken?.symbol}" Token launched on @honeypotfinance 's pot2pump.
💥 Launched with liquidity-focused meme model.
🔹 Maintained in PotWasabee -> @Meteora on berachain (unique CLMM, ALM to generate high APY).

👥 come play with me and have fun.
`;

export const pot2PumpTGShareContent = (pair: MemePairContract) => {
  return encodeURIComponent(
    pair.state === 0
      ? pot2PumpPumpingShareContent(pair)
      : pot2PumpPottingShareContent(pair)
  );
};
