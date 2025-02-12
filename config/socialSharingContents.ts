import { DynamicFormatAmount } from "@/lib/algebra/utils/common/formatAmount";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import { DOMAIN_MAP } from "honeypot-sdk";

type platformMap = "telegram" | "twitter";

export const pot2pumpShareLink = (pair: MemePairContract) =>
  `${DOMAIN_MAP.POT2PUMP}/launch-detail/${pair.address}`;

export const pot2PumpPumpingShareTwitterContent = (pair: MemePairContract) => `
🚀 Just graduated from Pot2Pump on @honeypotfinance 
💥 "${pair.launchedToken?.symbol}" now trading on Pot-Wasabee DEX -> Berachain's answer to @Meteora

🔹 A portion of token permanently locked
🔹 Enhanced m3m3 staking mechanism
🔹 Integrated with @berachain POL.
`;

export const pot2PumpPottingShareTwitterContent = (pair: MemePairContract) => `
🚀 "${pair.launchedToken?.symbol}" Token launched on @honeypotfinance 's pot2pump.
💥 Launched with liquidity-focused meme model.
🔹 Maintained in PotWasabee -> @Meteora on berachain (unique CLMM, ALM to generate high APY).

👥 come play with me and have fun.
`;

export const pot2PumpPumpingShareTelegramContent = (pair: MemePairContract) => `
🚀 Pot2Pump
💥 Ticker: ${pair.launchedToken?.symbol} 
🔹 Full Name: ${pair.launchedToken?.displayName}  

📈 Price Growth since Launch: ${pair.priceChangeDisplay}     
💵 USD Price: $${DynamicFormatAmount({
  amount: pair.launchedToken?.derivedUSD ?? "0",
  decimals: 5,
  endWith: "$",
})} 
📊 Total Supply: ${DynamicFormatAmount({
  amount:
    pair.launchedToken?.totalSupplyWithoutDecimals
      .div(10 ** (pair.launchedToken?.decimals ?? 18))
      .toFixed(2) ?? "0",
  decimals: 2,
  endWith: " ",
})}  
🔄 Transactions: 🟢 ${pair.launchedTokenBuyCount} / 🔴 ${pair.launchedTokenSellCount}

🔗 ${window.location.origin}/launch-detail/${pair.address}
`;

export const pot2PumpPottingShareTelegramContent = (pair: MemePairContract) => `
🚀 Pot2Pump
💥 Ticker: ${pair.launchedToken?.symbol} 
🔹 Full Name: ${pair.launchedToken?.displayName} 

📈 Potting Percentage: ${pair.pottingPercentageDisplay}    
💵 Total Raised: $${pair.depositedRaisedToken}    
👥 Participants count: ${pair.participantsCount}  
📊 Total Supply: ${pair.launchedToken?.totalSupplyWithoutDecimals.div(10 ** (pair.launchedToken?.decimals ?? 18)).toFixed(2)} 

🔗 ${window.location.origin}/launch-detail/${pair.address}
`;

export const pot2PumpShareContent = (
  pair: MemePairContract,
  platform: platformMap
) => {
  return encodeURIComponent(
    platform === "twitter"
      ? pair.state === 0
        ? pot2PumpPumpingShareTwitterContent(pair)
        : pot2PumpPottingShareTwitterContent(pair)
      : pair.state === 0
        ? pot2PumpPumpingShareTelegramContent(pair)
        : pot2PumpPottingShareTelegramContent(pair)
  );
};
