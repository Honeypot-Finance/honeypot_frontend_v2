import { truncate } from "@/lib/format";
import { wallet } from "@/services/wallet";
import { Tab, Tabs } from "@nextui-org/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { MyLaunches } from "./MyLaunches";
import ParticipatedLaunches from "./ParticipatedLaunches";
import { MyPools } from "./MyPools";
import PortfolioTab from "./Portfolio";
import { ProtfolioBalanceChart } from "./ProtfolioBalanceChart";
import { portfolio } from "@/services/portfolio";
import {
  getLiquidatorDatas,
  UserPoolProfit,
} from "@/lib/algebra/graphql/clients/userProfit";
import { formatAmountWithAlphabetSymbol } from "@/lib/algebra/utils/common/formatAmount";
import CardContainer from "@/components/CardContianer/v3";
import Image from "next/image";
import Copy from "@/components/Copy/v3";
import { cn } from "@/lib/utils";

export const Profile = observer(() => {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 font-gliker">
      <div className="flex flex-col gap-6">
        {wallet.isInit && (
          <div className="space-y-16">
            <CardContainer showBottomBorder={false}>
              <div className="flex justify-between items-start w-full py-5 px-8">
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <Image
                      width={72}
                      height={72}
                      alt="avatar"
                      src="/images/v3/avatar.svg"
                      className="stroke-1 stroke-black drop-shadow-[0_1px_0_#000]"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-3xl text-[#0D0D0D] text-shadow-[1px_2px_0_#AF7F3D] text-stroke-0.5 text-stroke-white">
                        My Account
                      </p>
                      <div className="flex items-center justify-between w-full text-[#4D4D4D]">
                        <Link
                          target="_blank"
                          className="text-[#4D4D4D] hover:text-[#0D0D0D] hover:underline decoration-2 transition-colors"
                          href={`https://bartio.beratrail.io/address/${wallet.account}`}
                        >
                          {wallet.account}
                        </Link>
                        <Copy value={wallet.account} copyTip="Copy address" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContainer>

            <Tabs
              aria-label="Options"
              classNames={{
                base: "relative w-full",
                tabList:
                  "flex rounded-2xl border border-[#202020] bg-white p-4 shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] py-2 px-3.5 absolute left-1/2 -translate-x-1/2 z-10 -top-5",
                panel: cn(
                  "flex flex-col h-full w-full gap-y-4 justify-center items-center bg-[#FFCD4D] rounded-2xl text-[#202020]",
                  "px-8 pt-[70px] pb-[70px]",
                  "bg-[url('/images/card-container/honey/honey-border.png'),url('/images/card-container/dark/bottom-border.svg')]",
                  "bg-[position:-65px_top,_-85px_bottom]",
                  "bg-[size:auto_65px,_auto_65px]",
                  "bg-repeat-x",
                  "!mt-0"
                ),
              }}
            >
              <Tab key="my-launch" title="My Launch">
                <MyLaunches />
              </Tab>
              <Tab key="participated-launch" title="Participated Launch">
                <ParticipatedLaunches />
              </Tab>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
});

export default Profile;
