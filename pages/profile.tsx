import CardContianer from "@/components/CardContianer/CardContianer";
import { LaunchCard } from "@/components/LaunchCard";
import LoadingDisplay from "@/components/LoadingDisplay/LoadingDisplay";
import PoolLiquidityCard from "@/components/PoolLiquidityCard/PoolLiquidityCard";
import TokenBalanceCard from "@/components/TokenBalanceCard/TokenBalanceCard";
import TokenLogo from "@/components/TokenLogo/TokenLogo";
import { Button } from "@/components/button";
import { Copy } from "@/components/copy";
import { PeddingSvg } from "@/components/svg/Pedding";
import { RocketSvg } from "@/components/svg/Rocket";
import { truncate } from "@/lib/format";
import { trpc, trpcClient } from "@/lib/trpc";
import { networksMap } from "@/services/chain";
import { PairContract } from "@/services/contract/pair-contract";
import { GhostPair } from "@/services/indexer/indexerTypes";
import launchpad from "@/services/launchpad";
import { liquidity } from "@/services/liquidity";
import { wallet } from "@/services/wallet";
import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const Profile = observer(() => {
  const { chainId } = useAccount();
  const [pairsMap, setPairsMap] = useState<GhostPair[]>();

  useEffect(() => {
    trpcClient.indexerFeedRouter.getAllPairs.query().then((data) => {
      setPairsMap(data.data);
    });
  }, []);

  useEffect(() => {
    if (pairsMap) {
      liquidity.initPool(
        pairsMap.map((pair: any) => ({
          address: pair.id,
          token0: {
            address: pair.token0.id,
            name: pair.token0.name,
            symbol: pair.token0.symbol,
            decimals: pair.token0.decimals,
          },
          token1: {
            address: pair.token1.id,
            name: pair.token1.name,
            symbol: pair.token1.symbol,
            decimals: pair.token1.decimals,
          },
        }))
      );
    }
  }, [pairsMap]);

  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }
    launchpad.showNotValidatedPairs = true;
    launchpad.ftoPairs.call({
      page: launchpad.ftoPairsPagination.page,
      limit: launchpad.ftoPairsPagination.limit,
    });
    launchpad.myFtoPairs.call();
    launchpad.getMyFtoParticipatedPairs.call();
  }, [wallet.isInit]);

  return (
    <div className="m-auto flex justify-center items-start flex-col max-w-[800px] gap-2">
      <div>
        {wallet.isInit && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <div className="flex h-10 w-10">
                <div
                  className="rounded-full w-full h-full "
                  style={{
                    backgroundImage: `linear-gradient(90deg, #${wallet.account
                      .substring(2, 8)
                      .toUpperCase()} 0%, #${wallet.account
                      .substring(
                        wallet.account.length - 6,
                        wallet.account.length
                      )
                      .toUpperCase()} 100%)`,
                  }}
                ></div>
              </div>
              <div className="grow">
                <p>My Account</p>
                <p className="w-full break-all">
                  {truncate(wallet.account, 10)} <Copy value={wallet.account} />
                </p>
              </div>
            </div>
            <div>
              <Link
                target="_blank"
                className="underline p-1"
                href={`https://bartio.beratrail.io/address/${wallet.account}`}
              >
                view on beratrail.io
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="w-full">
        <Tabs
          aria-label="Options"
          classNames={{
            tabList: "bg-transparent flex-wrap sm:flex-nowrap",
            tab: "flex flex-col items-start gap-2.5 border-0  backdrop-blur-[100px] p-2.5 rounded-[10px]",
          }}
          className="next-tab"
        >
          <Tab key="portfolio" title="Portfolio">
            <Card className="next-card">
              <CardBody className="">
                {wallet?.currentChain?.faucetTokens &&
                  wallet?.currentChain?.faucetTokens?.map((token) => (
                    <TokenBalanceCard
                      key={token.address}
                      token={token}
                      autoSize
                    ></TokenBalanceCard>
                  ))}
              </CardBody>
            </Card>
          </Tab>
          <Tab key="my-launch" title="My Launch">
            <Card className="next-card">
              <CardBody>
                {launchpad.ftoPairs.loading ? (
                  <LoadingDisplay />
                ) : (
                  launchpad.myFtoPairs.value?.data.map((project) => (
                    <LaunchCard
                      key={project.address}
                      pair={project}
                      action={
                        <div className="flex">
                          <Link
                            href={`/launch-detail/${project.address}`}
                            className="text-black font-bold w-full px-[8px]"
                          >
                            <Button className="w-full">View Token</Button>
                          </Link>
                          {project.ftoState === 0 && (
                            <Link
                              href={`/swap?inputCurrency=${project.launchedToken.address}&outputCurrency=${project.raiseToken.address}`}
                              className="text-black font-bold w-full px-[8px]"
                            >
                              <Button className="w-full">
                                <p>Swap Token</p>
                                <p>
                                  <Copy
                                    onClick={(e) => {
                                      e.preventDefault();
                                    }}
                                    className=" absolute ml-[8px] top-[50%] translate-y-[-50%]"
                                    value={`${window.location.origin}/swap?inputCurrency=${project.launchedToken.address}&outputCurrency=${project.raiseToken.address}`}
                                  ></Copy>
                                </p>
                              </Button>{" "}
                            </Link>
                          )}
                        </div>
                      }
                    />
                  ))
                )}
              </CardBody>
            </Card>
          </Tab>
          <Tab key="participated-launch" title="Participated Launch">
            <Card className="next-card">
              <CardBody>
                {launchpad.ftoPairs.loading ? (
                  <LoadingDisplay />
                ) : (
                  launchpad.getMyFtoParticipatedPairs.value?.map((project) => (
                    <LaunchCard
                      key={project.address}
                      pair={project}
                      action={
                        <div className="flex">
                          <Link
                            href={`/launch-detail/${project.address}`}
                            className="text-black font-bold w-full px-[8px]"
                          >
                            <Button className="w-full">View Token</Button>
                          </Link>
                          {project.ftoState === 0 && (
                            <Link
                              href={`/swap?inputCurrency=${project.launchedToken.address}&outputCurrency=${project.raiseToken.address}`}
                              className="text-black font-bold w-full px-[8px]"
                            >
                              <Button className="w-full">
                                <p>Swap Token</p>
                                <p>
                                  <Copy
                                    onClick={(e) => {
                                      e.preventDefault();
                                    }}
                                    className=" absolute ml-[8px] top-[50%] translate-y-[-50%]"
                                    value={`${window.location.origin}/swap?inputCurrency=${project.launchedToken.address}&outputCurrency=${project.raiseToken.address}`}
                                  ></Copy>
                                </p>
                              </Button>{" "}
                            </Link>
                          )}
                        </div>
                      }
                    />
                  ))
                )}
              </CardBody>
            </Card>
          </Tab>
          <Tab key="my-pools" title="My Pools">
            <Card className="next-card">
              <CardBody>
                {(liquidity.isInit &&
                  liquidity.myPairs.map((pair) => (
                    <PoolLiquidityCard
                      key={pair.address}
                      pair={pair}
                      autoSize
                    ></PoolLiquidityCard>
                  ))) || <LoadingDisplay />}
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
});

export default Profile;
