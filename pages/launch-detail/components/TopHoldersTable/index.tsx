import React, { useEffect, useState } from "react";
import { Copy } from "@/components/Copy";
import { truncate } from "@/lib/format";
import { LoadingDisplay } from "@/components/LoadingDisplay/LoadingDisplay";
import { getTokenTop10Holders } from "@/lib/algebra/graphql/clients/token";
import BigNumber from "bignumber.js";

interface Holder {
  rank: string;
  address: string;
  quantity: string;
  percentage: string;
  value: string;
}

interface TopHoldersTableProps {
  launchedToken:
    | {
        address: string;
        decimals: number;
        derivedUSD: string;
      }
    | null
    | undefined;
  depositedLaunchedTokenWithoutDecimals: string | number | BigNumber;
}

const TopHoldersTable = ({
  launchedToken,
  depositedLaunchedTokenWithoutDecimals,
}: TopHoldersTableProps) => {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHolders = async () => {
      if (launchedToken?.address) {
        try {
          setLoading(true);
          const holdersData = await getTokenTop10Holders(launchedToken.address);

          const formattedHolders =
            holdersData.token?.holders.map((holder, index) => ({
              rank: (index + 1).toString(),
              address: holder.account.id,
              quantity: BigNumber(holder.holdingValue)
                .dividedBy(10 ** (launchedToken.decimals || 0))
                .toFixed(2),
              percentage: (
                (Number(holder.holdingValue) /
                  Number(depositedLaunchedTokenWithoutDecimals)) *
                100
              ).toFixed(2),
              value: BigNumber(holder.holdingValue)
                .dividedBy(10 ** (launchedToken.decimals || 0))
                .multipliedBy(Number(launchedToken.derivedUSD))
                .toFixed(2),
            })) || [];
          setHolders(formattedHolders);
        } catch (error) {
          console.error("Error fetching holders:", error);
          setHolders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHolders();
  }, [launchedToken, depositedLaunchedTokenWithoutDecimals]);

  return (
    <div className="custom-dashed-3xl w-full p-6 bg-white">
      {!loading ? (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b-2 border-[#202020]">
              <th className="py-4 px-6 font-gliker text-[#4D4D4D]">Rank</th>
              <th className="py-4 px-6 font-gliker text-[#4D4D4D]">Address</th>
              <th className="py-4 px-6 font-gliker text-[#4D4D4D] text-right">Quantity</th>
              <th className="py-4 px-6 font-gliker text-[#4D4D4D] text-right">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4D4D4D]/10">
            {!holders.length ? (
              <tr className="hover:bg-white border-white h-full">
                <td colSpan={4} className="h-24 text-center text-black">
                  No results.
                </td>
              </tr>
            ) : (
              holders.map((holder, index) => (
                <tr
                  key={index}
                  className="transition-colors bg-white text-black hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-black">{holder.rank}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Copy
                        content="Copy address"
                        value={holder.address}
                        displayContent={truncate(holder.address, 8)}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col">
                      <span className="text-black">{holder.quantity}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col">
                      <span className="text-black">{holder.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <LoadingDisplay />
      )}
    </div>
  );
};

export default TopHoldersTable;
