import { liquidity } from "@/services/liquidity";
import { NextLayoutPage } from "@/types/nextjs";
import { observer, useLocalObservable } from "mobx-react-lite";
import { Table } from "@/components/table/index";
import { trpc, trpcClient } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import { useAccount } from "wagmi";
import { PaginationState } from "@/services/utils";
import { Button } from "@/components/button";
import { Input } from "../components/input/index";
import { LuPlus } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import { set } from "lodash";
import Link from "next/link";
import { Copy } from "@/components/copy";
import { wallet } from "@/services/wallet";
import { chainsMap } from "@/lib/chain";
import { networksMap } from "@/services/chain";
import TokenLogo from "@/components/TokenLogo/TokenLogo";
import ShareSocialMedialPopUp from "@/components/ShareSocialMedialPopUp/ShareSocialMedialPopUp";
import PopUp from "@/components/PopUp/PopUp";
import { RemoveLiquidity } from "@/components/LPCard";
import { GhostPair } from "@/services/indexer/indexerTypes";

const PoolsPage: NextLayoutPage = observer(() => {
  const { chainId } = useAccount();
  const router = useRouter();
  const [pairsMap, setPairsMap] = useState<GhostPair[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpcClient.indexerFeedRouter.getAllPairs.query().then((data) => {
      setPairsMap(data.data);
    });
  }, []);

  useEffect(() => {
    if (wallet.isInit && liquidity.isInit) {
      setLoading(false);
    }
  }, [wallet.isInit, liquidity.isInit]);

  const state = useLocalObservable(() => ({
    columns: [
      {
        key: "name",
        label: "Pool Name",
      },
      {
        key: "liquidity",
        label: "Liquidity",
      },
    ],
    pagination: new PaginationState({}),
    searchValue: "",
    setSearchValue(value: string) {
      this.searchValue = value;
    },

    get columnsMap() {
      return this.columns.reduce((acc, column) => {
        acc[column.key] = column;
        return acc;
      }, {} as Record<string, (typeof this.columns)[number]>);
    },
    get filteredPairs() {
      return liquidity.pairs.filter((pair) => {
        return (
          pair.poolName
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()) ||
          pair.address.toLowerCase().includes(this.searchValue.toLowerCase()) ||
          pair.token0.address
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()) ||
          pair.token1.address
            .toLowerCase()
            .includes(this.searchValue.toLowerCase())
        );
      });
    },
    get pairsByPage() {
      return this.filteredPairs.slice(
        state.pagination.offset,
        state.pagination.end
      );
    },
  }));

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
      state.pagination.setTotal(liquidity.pairs.length);
    }
  }, [pairsMap]);

  return (
    <div className="flex flex-col  items-center">
      <div className="w-[800px] max-w-full relative space-y-4">
        <div className="flex top-0 md:absolute right-0 md:flex-row flex-col md:gap-[16px] gap-[8px]">
          <Input
            value={state.searchValue}
            onChange={(e) => {
              state.setSearchValue(e.target.value);
            }}
            startContent={<IoSearchOutline></IoSearchOutline>}
            placeholder="Search by name, symbol or address"
            classNames={{
              innerWrapper: "w-[369px] h-[32px]",
            }}
            className=" border [background:var(--card-color,#271A0C)] rounded-2xl border-solid border-[rgba(225,138,32,0.10)]"
          ></Input>
          <Button
            onClick={() => {
              router.push("/pool");
            }}
            styleMode="plain"
            className=" md:w-[170px] h-[41px] gap-2.5"
          >
            <LuPlus />
            Create Pool
          </Button>
        </div>
        <Tabs
          aria-label="Options"
          classNames={{
            tabList: "bg-transparent",
            tab: "flex flex-col items-start gap-2.5 border-0  backdrop-blur-[100px] p-2.5 rounded-[10px]",
          }}
          className="next-tab"
        >
          <Tab key="all" title="All Pools">
            <Card className="[background:#1D1407] rounded-[20px]">
              <CardBody className="">
                <Table
                  rowKey="address"
                  pagination={state.pagination}
                  isLoading={loading}
                  columns={[
                    {
                      title: "",
                      render(value, row) {
                        return (
                          <div className="flex items-center gap-[12px]">
                            <TokenLogo
                              token={row.token0}
                              addtionalClasses="translate-x-[10px]"
                            ></TokenLogo>
                            <TokenLogo
                              token={row.token1}
                              addtionalClasses="translate-x-[-10px]"
                            ></TokenLogo>
                          </div>
                        );
                      },
                    },
                    {
                      title: "Pool Name",
                      dataKey: "poolName",
                    },
                    {
                      title: "Liquidity",
                      dataKey: "liquidityDisplay",
                    },
                    {
                      title: "Action",
                      dataKey: "_action",
                      render(value, row) {
                        return (
                          <div className="flex gap-[12px]">
                            <Link
                              className="flex items-center gap-[6px]"
                              href={`/pool?inputCurrency=${row.token0.address}&outputCurrency=${row.token1.address}`}
                            >
                              <span className="inline-block sm:hidden hover:text-[#FCD729] cursor-pointer hover:underline">
                                Add
                              </span>
                              <Button className="hidden sm:flex">
                                <p>Add</p>
                                <div>
                                  <ShareSocialMedialPopUp
                                    shareUrl={`${window.location.origin}/pool?inputCurrency=${row.token0.address}&outputCurrency=${row.token1.address}`}
                                    shareText="Add Liquidity to this pool"
                                  />
                                </div>
                              </Button>
                            </Link>
                            <Link
                              className="flex items-center gap-[6px]"
                              href={`/swap?inputCurrency=${row.token0.address}&outputCurrency=${row.token1.address}`}
                            >
                              <span className="inline-block sm:hidden hover:text-[#FCD729] cursor-pointer hover:underline">
                                Swap
                              </span>
                              <Button
                                styleMode="plain"
                                className="hidden sm:flex"
                              >
                                <p>Swap</p>
                                <div>
                                  <ShareSocialMedialPopUp
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    shareUrl={`${window.location.origin}/swap?inputCurrency=${row.token0.address}&outputCurrency=${row.token1.address}`}
                                    shareText="Swap with this pool"
                                  />
                                </div>
                              </Button>
                            </Link>
                          </div>
                        );
                      },
                    },
                  ]}
                  datasource={state.pairsByPage}
                ></Table>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="my" title="My Pools">
            <Card className="[background:#1D1407] rounded-[20px]">
              <CardBody>
                <Table
                  rowKey="address"
                  columns={[
                    {
                      title: "",
                      render(value, row) {
                        return (
                          <div className="flex items-center gap-[12px]">
                            <TokenLogo
                              token={row.token0}
                              addtionalClasses="translate-x-[10px]"
                            ></TokenLogo>
                            <TokenLogo
                              token={row.token1}
                              addtionalClasses="translate-x-[-10px]"
                            ></TokenLogo>
                          </div>
                        );
                      },
                    },
                    {
                      title: "Pool Name",
                      dataKey: "poolName",
                    },
                    {
                      title: "Liquidity",
                      dataKey: "liquidityDisplay",
                    },
                    {
                      title: "Action",
                      dataKey: "_action",
                      render(value, row) {
                        return (
                          <div className="flex gap-[12px]">
                            <PopUp
                              info="normal"
                              trigger={
                                <Button
                                  onPress={(e) => {
                                    liquidity.setCurrentRemovePair(row);
                                  }}
                                >
                                  Remove LP
                                </Button>
                              }
                              contents={
                                <RemoveLiquidity
                                  noCancelButton
                                ></RemoveLiquidity>
                              }
                            />
                          </div>
                        );
                      },
                    },
                  ]}
                  datasource={liquidity.myPairs}
                ></Table>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
});

export default PoolsPage;
