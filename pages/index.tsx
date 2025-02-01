import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { NextLayoutPage } from "@/types/nextjs";
import { useEffect, useMemo, useState } from "react";
import { LaunchCardV3 } from "@/components/LaunchCard/v3";
import { itemPopUpVariants } from "@/lib/animation";
import {
  fetchNearSuccessPot2Pump,
  fetchPumpingHighPricePot2Pump,
  fetchPottingNewTokens,
  fetchPottingTrendingPot2Pump,
  pot2PumpListToMemePairList,
} from "@/lib/algebra/graphql/clients/pair";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import { wallet } from "@/services/wallet";
import { Button } from "@/components/button";
import Link from "next/link";
import {
  Pot2Pump,
  usePot2PumpPottingHighPriceQuery,
  usePot2PumpPottingNearSuccessQuery,
  usePot2PumpPottingNewTokensQuery,
  usePot2PumpPottingTrendingQuery,
  usePot2PumpPottingMarketCapQuery,
  usePot2PumpPottingNewTokensByEndtimeQuery,
} from "@/lib/algebra/graphql/generated/graphql";
import LoadingDisplay from "@/components/LoadingDisplay/LoadingDisplay";
import CardContainer from "@/components/CardContianer/v3";

// 在组件外部定义常量
const POT_TABS = {
  NEW: "New POTs",
  ALMOST: "Almost",
  MOON: "Moon 🚀",
  TRENDING: "Trending",
  MARKET_CAP: "Market Cap",
  NEW_PUMPS: "New Pumps",
} as const;

type TabType = (typeof POT_TABS)[keyof typeof POT_TABS];

const STORAGE_KEY = 'pot2pump_selected_tabs';

const Pot2PumpOverviewPage: NextLayoutPage = observer(() => {
  const [newTokensList, setNewTokensList] = useState<MemePairContract[]>([]);
  const [nearSuccessTokensList, setNearSuccessTokensList] = useState<
    MemePairContract[]
  >([]);
  const [highPriceTokensList, setHighPriceTokensList] = useState<
    MemePairContract[]
  >([]);
  const [trendingTokensList, setTrendingTokensList] = useState<
    MemePairContract[]
  >([]);
  const [marketCapTokensList, setMarketCapTokensList] = useState<
    MemePairContract[]
  >([]);
  const [endTimeTokensList, setEndTimeTokensList] = useState<MemePairContract[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>(POT_TABS.NEW);
  const [currentTime, setCurrentTime] = useState(
    Math.floor(new Date().getTime() / 1000)
  );
  const [selectedTabs, setSelectedTabs] = useState<TabType[]>(() => {
    // 从 localStorage 读取保存的标签，如果没有则使用默认值
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [POT_TABS.NEW, POT_TABS.ALMOST, POT_TABS.NEW_PUMPS];
    }
    return [POT_TABS.NEW, POT_TABS.ALMOST, POT_TABS.NEW_PUMPS];
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(new Date().getTime() / 1000));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { data: pottingNewTokens, loading: isPottingNewTokensLoading } =
    usePot2PumpPottingNewTokensQuery({
      variables: {
        endTime: currentTime,
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      skip: !wallet.isInit,
    });

  const {
    data: pottingNearSuccessTokens,
    loading: isPottingNearSuccessTokensLoading,
  } = usePot2PumpPottingNearSuccessQuery({
    variables: {
      endTime: currentTime,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    skip: !wallet.isInit,
  });

  const {
    data: pottingHighPriceTokens,
    loading: isPottingHighPriceTokensLoading,
  } = usePot2PumpPottingHighPriceQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    pollInterval: 5000, // Refetch every 10 seconds
    skip: !wallet.isInit,
  });

  const {
    data: pottingTrendingTokens,
    loading: isPottingTrendingTokensLoading,
  } = usePot2PumpPottingTrendingQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    pollInterval: 5000, // Refetch every 10 seconds
    skip: !wallet.isInit,
  });

  const {
    data: pottingMarketCapTokens,
    loading: isPottingMarketCapTokensLoading,
  } = usePot2PumpPottingMarketCapQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    pollInterval: 5000, // Refetch every 5 seconds
    skip: !wallet.isInit,
  });

  const {
    data: pottingNewTokensByEndtime,
    loading: isPottingNewTokensByEndtimeLoading,
  } = usePot2PumpPottingNewTokensByEndtimeQuery({
    variables: {
      endTime: currentTime,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    skip: !wallet.isInit,
  });

  useEffect(() => {
    if (!pottingNewTokens) return;

    const list = pot2PumpListToMemePairList(
      (pottingNewTokens?.pot2Pumps as Partial<Pot2Pump>[]) ?? []
    );

    if (!list.length || list.length == 0) return;
    if (!newTokensList.length) {
      setNewTokensList(list);
      return;
    }

    setNewTokensList((prev) => {
      prev.map((item) => {
        const i = list.find((item2) => item.address === item2.address);
        if (!i) {
          prev.splice(prev.indexOf(item), 1);
        }
      });

      list.map((item) => {
        if (!prev.find((item2) => item.address === item2.address)) {
          prev.push(item);
        } else {
          const existItem = prev.find(
            (item2) => item.address === item2.address
          );
          if (existItem) {
            Object.assign(existItem, {
              depositedRaisedTokenWithoutDecimals:
                item.depositedRaisedTokenWithoutDecimals,
            });
          }
        }
      });
      return prev;
    });
  }, [pottingNewTokens]);

  useEffect(() => {
    if (!pottingNearSuccessTokens) return;

    const list = pot2PumpListToMemePairList(
      (pottingNearSuccessTokens?.pot2Pumps as Partial<Pot2Pump>[]) ?? []
    );

    if (!list.length || list.length == 0) return;

    if (!nearSuccessTokensList.length) {
      setNearSuccessTokensList(list);
      return;
    }

    setNearSuccessTokensList((prev) => {
      prev.map((item2) => {
        const i = list.find((item) => item.address == item2.address);
        if (!i) {
          prev.splice(prev.indexOf(item2), 1);
        }
      });

      list.map((item) => {
        if (!prev.find((item2) => item.address === item2.address)) {
          prev.unshift(item);
        } else {
          const existItem = prev.find(
            (item2) => item.address === item2.address
          );

          if (existItem) {
            Object.assign(existItem, {
              depositedRaisedTokenWithoutDecimals:
                item.depositedRaisedTokenWithoutDecimals,
            });
          }
        }
      });

      return prev;
    });
  }, [pottingNearSuccessTokens]);

  useEffect(() => {
    if (!pottingHighPriceTokens) return;

    const list = pot2PumpListToMemePairList(
      (pottingHighPriceTokens?.pot2Pumps as Partial<Pot2Pump>[]) ?? []
    );

    if (!highPriceTokensList.length) {
      setHighPriceTokensList(list);
      return;
    }

    setHighPriceTokensList((prev) => {
      list.map((item) => {
        if (!prev.find((item2) => item.address === item2.address)) {
          prev.push(item);
        } else {
          const existItem = prev.find(
            (item2) => item.address === item2.address
          );
          if (existItem) {
            Object.assign(existItem, {
              launchedToken: item.launchedToken,
            });
          }
        }
      });
      return prev;
    });
  }, [pottingHighPriceTokens]);

  useEffect(() => {
    const list = pot2PumpListToMemePairList(
      (pottingTrendingTokens?.pot2Pumps as Partial<Pot2Pump>[]) ?? []
    );

    if (!trendingTokensList.length) {
      setTrendingTokensList(list);
      return;
    }

    setTrendingTokensList((prev) => {
      list.map((item) => {
        if (!prev.find((item2) => item.address === item2.address)) {
          prev.push(item);
        } else {
          const existItem = prev.find(
            (item2) => item.address === item2.address
          );

          if (existItem) {
            Object.assign(existItem, {
              launchedToken: item.launchedToken,
            });
          }
        }
      });
      return prev;
    });
  }, [pottingTrendingTokens]);

  useEffect(() => {
    if (!pottingMarketCapTokens) return;

    const list = pot2PumpListToMemePairList(
      (pottingMarketCapTokens?.pot2Pumps as Partial<Pot2Pump>[]) ?? []
    );

    if (!marketCapTokensList.length) {
      setMarketCapTokensList(list);
      return;
    }

    setMarketCapTokensList((prev) => {
      list.map((item) => {
        if (!prev.find((item2) => item.address === item2.address)) {
          prev.push(item);
        } else {
          const existItem = prev.find(
            (item2) => item.address === item2.address
          );
          if (existItem) {
            Object.assign(existItem, {
              launchedToken: item.launchedToken,
            });
          }
        }
      });
      return prev;
    });
  }, [pottingMarketCapTokens]);

  useEffect(() => {
    if (!pottingNewTokensByEndtime) return;

    const list = pot2PumpListToMemePairList(
      (pottingNewTokensByEndtime?.pot2Pumps as Partial<Pot2Pump>[]) ?? []
    );

    if (!list.length || list.length == 0) return;
    if (!endTimeTokensList.length) {
      setEndTimeTokensList(list);
      return;
    }

    setEndTimeTokensList((prev) => {
      prev.map((item) => {
        const i = list.find((item2) => item.address === item2.address);
        if (!i) {
          prev.splice(prev.indexOf(item), 1);
        }
      });

      list.map((item) => {
        if (!prev.find((item2) => item.address === item2.address)) {
          prev.push(item);
        } else {
          const existItem = prev.find(
            (item2) => item.address === item2.address
          );
          if (existItem) {
            Object.assign(existItem, {
              depositedRaisedTokenWithoutDecimals:
                item.depositedRaisedTokenWithoutDecimals,
            });
          }
        }
      });
      return prev;
    });
  }, [pottingNewTokensByEndtime]);

  // Auto scroll effect
  useEffect(() => {
    if (!highPriceTokensList?.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev >= Math.min(4, highPriceTokensList?.length - 1) ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [highPriceTokensList]);

  const handleTabClick = (tab: TabType) => {
    setSelectedTabs(prev => {
      if (prev.includes(tab)) {
        return prev;
      }
      const newTabs = [...prev.slice(1), tab];
      // 保存到 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTabs));
      return newTabs;
    });
  };

  return (
    <div className="w-full flex flex-col justify-center items-center px-4 font-gliker">
      <CardContainer className="max-w-[1200px]">
        <div className="flex flex-col justify-center w-full rounded-2xl relative">
          {/* Featured Slideshow */}
          <div className="relative">
            <div className="user-select-none opacity-0 min-h-[2 00px]">
              <LaunchCardV3
                type="featured"
                pair={highPriceTokensList?.[currentSlide]}
                action={<></>}
              />
            </div>
            {trendingTokensList.length > 0 ? (
              trendingTokensList
                ?.sort(
                  (a, b) =>
                    Number(b.launchedToken?.priceChange24hPercentage) -
                    Number(a.launchedToken?.priceChange24hPercentage)
                )
                ?.slice(0, 5)
                ?.map((token, index) => (
                  <div
                    key={index}
                    className={`transition-opacity duration-500 absolute inset-0 ${
                      currentSlide === index
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                  >
                    <LaunchCardV3 type="featured" pair={token} action={<></>} />
                  </div>
                ))
            ) : (
              <LoadingDisplay />
            )}
          </div>
          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 absolute bottom-1 left-0 right-0 z-20">
            {trendingTokensList
              ?.slice(0, 5)
              .map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentSlide === index ? "bg-black" : "bg-gray-400"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
          </div>
        </div>
      </CardContainer>
      <div className="w-full relative flex justify-center my-12">
        <div className="w-full max-w-[600px]">
          <Link
            href="/launch-token?launchType=meme"
            className="text-black font-bold block"
          >
            <Button className="w-full tex   t-xl md:text-3xl py-3 md:py-5">
              🍯 Launch Your Token 🍯
            </Button>
          </Link>
        </div>
      </div>
      <CardContainer className="w-full max-w-[1200px] bg-[#FFCD4D] rounded-2xl relative px-8 py-[75px]">
        {/* Tab Selector */}
        <div className="flex gap-4 mb-6">
          {Object.values(POT_TABS).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 rounded-lg border ${
                selectedTabs.includes(tab) 
                  ? 'bg-amber-500 text-white border-amber-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl p-8 border border-black shadow-[4px_4px_0px_0px_#D29A0D]">
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-3 min-h-[600px] h-[calc(100vh-300px)] gap-2">
            {selectedTabs.map((tab) => (
              <section key={tab} className="relative flex flex-col px-2 overflow-hidden">
                <h2 className="text-xl font-bold mb-4 absolute top-0 left-0 right-0 z-20 py-2 px-2 bg-white">
                  {tab}
                </h2>
                <div className="flex flex-col gap-6 pb-2 overflow-y-auto h-full pt-[60px] [&::-webkit-scrollbar]:w-1 &::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                  {(() => {
                    switch (tab) {
                      case POT_TABS.NEW:
                        return newTokensList.length > 0 ? (
                          newTokensList
                            .sort((a, b) => Number(b.startTime) - Number(a.startTime))
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                  theme="dark"
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.ALMOST:
                        return nearSuccessTokensList.length > 0 ? (
                          nearSuccessTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.pottingPercentageNumber) -
                                Number(a.pottingPercentageNumber)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                  theme="dark"
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.MOON:
                        return highPriceTokensList.length > 0 ? (
                          highPriceTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.launchedToken?.derivedUSD) -
                                Number(a.launchedToken?.derivedUSD)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                  theme="dark"
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.TRENDING:
                        return trendingTokensList.length > 0 ? (
                          trendingTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.launchedToken?.priceChange24hPercentage) -
                                Number(a.launchedToken?.priceChange24hPercentage)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                  theme="dark"
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.MARKET_CAP:
                        return marketCapTokensList.length > 0 ? (
                          marketCapTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.launchedToken?.marketCap) -
                                Number(a.launchedToken?.marketCap)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                  theme="dark"
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.NEW_PUMPS:
                        return endTimeTokensList.length > 0 ? (
                          endTimeTokensList
                            ?.sort(
                              (a, b) => Number(a.endTime) - Number(b.endTime)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                  theme="dark"
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              </section>
            ))}
          </div>

          {/* Mobile Content */}
          <div className="md:hidden min-h-[600px] h-[calc(100vh-300px)]">
            <div className="h-full flex flex-col px-2 overflow-hidden">
              {selectedTabs.map((tab) => (
                <div key={tab} className="flex flex-col gap-4 pb-2 overflow-y-auto h-full [&::-webkit-scrollbar]:w-1 &::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                  {(() => {
                    switch (tab) {
                      case POT_TABS.NEW:
                        return newTokensList.length > 0 ? (
                          newTokensList
                            .sort((a, b) => Number(b.startTime) - Number(a.startTime))
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.ALMOST:
                        return nearSuccessTokensList.length > 0 ? (
                          nearSuccessTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.pottingPercentageNumber) -
                                Number(a.pottingPercentageNumber)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.MOON:
                        return highPriceTokensList.length > 0 ? (
                          highPriceTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.launchedToken?.derivedUSD) -
                                Number(a.launchedToken?.derivedUSD)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.TRENDING:
                        return trendingTokensList.length > 0 ? (
                          trendingTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.launchedToken?.priceChange24hPercentage) -
                                Number(a.launchedToken?.priceChange24hPercentage)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.MARKET_CAP:
                        return marketCapTokensList.length > 0 ? (
                          marketCapTokensList
                            ?.sort(
                              (a, b) =>
                                Number(b.launchedToken?.marketCap) -
                                Number(a.launchedToken?.marketCap)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      case POT_TABS.NEW_PUMPS:
                        return endTimeTokensList.length > 0 ? (
                          endTimeTokensList
                            ?.sort(
                              (a, b) => Number(a.endTime) - Number(b.endTime)
                            )
                            ?.map((pot2pump, index) => (
                              <motion.div key={index} variants={itemPopUpVariants}>
                                <LaunchCardV3
                                  type="simple"
                                  pair={pot2pump}
                                  action={<></>}
                                />
                              </motion.div>
                            ))
                        ) : (
                          <LoadingDisplay />
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContainer>
    </div>
  );
});

export default Pot2PumpOverviewPage;
