import React, { ReactNode, useEffect, useState, useMemo } from "react";
import { Copy } from "@/components/Copy";
import { truncate } from "@/lib/format";
import { LoadingDisplay } from "@/components/LoadingDisplay/LoadingDisplay";
import { getTokenTop10Holders } from "@/lib/algebra/graphql/clients/token";
import BigNumber from "bignumber.js";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import Image from "next/image";
import pot2pumpIcon from "@/public/images/bera/smoking_bera.png";
import poolIcon from "@/public/images/icons/tokens/wbera-token-icon.png";
import { poolExists } from "@/lib/algebra/graphql/clients/pool";
import { ExternalLink } from "lucide-react";
import { VscCopy } from "react-icons/vsc";

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
  projectPool: MemePairContract | null | undefined;
}

const HolderAddressDisplay = ({
  address,
  projectPool,
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
    <div className="custom-dashed-3xl w-full p-3 sm:p-6 bg-white">
      {!loading ? (
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-[#FFCD4D] [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left border-b-2 border-[#202020]">
                <th className="py-2 sm:py-4 px-3 sm:px-6 font-gliker text-[#4D4D4D] text-xs sm:text-base">
                  Rank
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 font-gliker text-[#4D4D4D] text-xs sm:text-base">
                  Address
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 font-gliker text-[#4D4D4D] text-right text-xs sm:text-base">
                  Quantity
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 font-gliker text-[#4D4D4D] text-right text-xs sm:text-base">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4D4D]/10">
              {!holders.length ? (
                <tr className="hover:bg-white border-white h-full">
                  <td
                    colSpan={4}
                    className="h-24 text-center text-black text-xs sm:text-base"
                  >
                    No results.
                  </td>
                </tr>
              ) : (
                holders.map((holder, index) => (
                  <tr
                    key={index}
                    className="transition-colors bg-white text-black hover:bg-gray-50"
                  >
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base">
                      <div className="flex flex-col">
                        <span className="text-black">{holder.rank}</span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {holder.address.toLowerCase() ===
                        projectPool?.address.toLowerCase() ? (
                          <span className="text-black flex items-center gap-1 sm:gap-2">
                            <Image
                              src="/images/empty-logo.png"
                              alt="Pot2Pump Pool"
                              width={12}
                              height={12}
                              className="sm:w-4 sm:h-4"
                            />
                            <span>Pot2Pump Pool</span>
                          </span>
                        ) : holder.address.toLowerCase() ===
                          projectPool?.provider.toLowerCase() ? (
                          <span className="text-black flex items-center gap-1 sm:gap-2">
                            <Image
                              width={12}
                              height={12}
                              src={pot2pumpIcon}
                              alt="pot2pump"
                              className="sm:w-4 sm:h-4"
                            />
                            <span>Launcher</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <a
                              href={`https://berascan.com/address/${holder.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#FFCD4D] flex items-center gap-1"
                            >
                              {truncate(holder.address, 8)}
                              <ExternalLink className="size-3 sm:size-4" />
                            </a>
                            <Copy
                              className="p-0.5 sm:p-1 hover:bg-gray-100 rounded"
                              value={holder.address}
                              content="Copy address"
                            >
                              <VscCopy className="size-4 sm:size-5" />
                            </Copy>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-right text-xs sm:text-base">
                      <div className="flex flex-col">
                        <span className="text-black">{holder.quantity}</span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-right text-xs sm:text-base">
                      <div className="flex flex-col">
                        <span className="text-black">{holder.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <LoadingDisplay />
      )}
    </div>
  );
};

export default TopHoldersTable;
