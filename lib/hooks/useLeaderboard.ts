import { useQuery } from "@apollo/client";
import { LEADERBOARD_QUERY } from "../algebra/graphql/clients/leaderboard";
import BigNumber from "bignumber.js";
import type { FactoryData } from "../algebra/graphql/clients/leaderboard";
import { wallet } from "@/services/wallet";

export function useLeaderboard() {
  const { data, loading, error, refetch } =
    useQuery<FactoryData>(LEADERBOARD_QUERY);

  const formatValue = (value: string) => {
    const bn = new BigNumber(value || "0");
    return {
      usd: `$${bn.toFormat(2)}`,
      matic: `${bn.toFormat(2)} ${wallet.currentChain?.nativeToken?.symbol}`,
    };
  };

  const stats = data?.factories[0]
    ? {
        totalMemeCreated: {
          title: "Total Meme Created",
          value: data.factories[0].totalMemeCreated,
        },
        totalSuccessedMeme: {
          title: "Total Successed Meme",
          value: data.factories[0].totalSuccessedMeme,
        },
        totalDepositedUSD: {
          title: "Total Deposited USD",
          value: data.factories[0].totalDepositedUSD,
        },
      }
    : null;

  return {
    stats,
    loading,
    error,
  };
}
