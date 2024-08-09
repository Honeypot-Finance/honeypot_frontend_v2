import { observer, useLocalObservable } from "mobx-react-lite";
import { TokenSelector } from "@/components/TokenSelector";
import { SwapAmount } from "../SwapAmount/index";
import { liquidity } from "@/services/liquidity";
import { Button } from "@/components/button";
import { Token } from "@/services/contract/token";
import { SpinnerContainer } from "../Spinner";
import { PlusSvg } from "../svg/plus";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isEthAddress } from "@/lib/address";
import { wallet } from "@/services/wallet";
import { Tab, Tabs } from "@nextui-org/react";
import { Table } from "../table";
import { ItemSelect, SelectState } from "../ItemSelect";
import { SelectItem } from "../ItemSelect/index";
import { MouseEvent } from "react";
import _ from "lodash";
import LoadingDisplay from "../LoadingDisplay/LoadingDisplay";
import { trpc, trpcClient } from "@/lib/trpc";
import { GhostPair } from "@/services/indexer/indexerTypes";

const AddLiquidity = observer(() => {
  return (
    <SpinnerContainer
      className="mt-[24px]"
      isLoading={liquidity.currentPair.loading}
    >
      <div className=" flex flex-col justify-center items-start gap-[23px] ">
        <div className="flex justify-between items-center w-full">
          <SwapAmount
            label=""
            inputProps={{
              value: liquidity.fromAmount,
              disabled: !liquidity.fromToken,
              max: liquidity.fromToken?.balance.toNumber(),
              min: 0,
              onClear: () => {
                liquidity.setFromAmount("");
              },
              onChange: (e) => {
                liquidity.setFromAmount(e.target.value);
              },
              onInput: (e) => {
                liquidity.onFromAmountInputChange();
              },
            }}
          ></SwapAmount>
          <div className="flex flex-col items-end">
            {!!liquidity.fromToken && (
              <div className="flex items-center">
                <div className="text-sub">
                  Balance: {liquidity.fromToken.balanceFormatted}
                </div>
                <div
                  onClick={() => {
                    liquidity.setFromAmount(
                      (liquidity.fromToken as Token).balance.toFixed()
                    );
                  }}
                  className="  cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] text-base ml-[8px] font-bold leading-3 tracking-[0.16px] underline"
                >
                  Max
                </div>
              </div>
            )}
            <TokenSelector
              value={liquidity.fromToken}
              onSelect={(token) => {
                liquidity.setFromToken(token);
              }}
            ></TokenSelector>
          </div>
        </div>
        <div className="flex w-full items-center gap-[5px]">
          <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
          <PlusSvg></PlusSvg>
          <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
        </div>
        <div className="flex justify-between  items-center w-full">
          <SwapAmount
            label=""
            inputProps={{
              value: liquidity.toAmount,
              disabled: !liquidity.toToken,
              max: liquidity.toToken?.balance.toNumber(),
              min: 0,
              onClear: () => {
                liquidity.setToAmount("");
              },
              isClearable: !liquidity.currentPair.value,
              onChange: (e) => {
                liquidity.setToAmount(e.target.value);
              },
              onInput: (e) => {
                liquidity.onToAmountInputChange();
              },
            }}
          ></SwapAmount>
          <div className="flex flex-col items-end">
            {!!liquidity.toToken && (
              <div className="flex items-center">
                <div className="text-sub">
                  Balance: {liquidity.toToken.balanceFormatted}
                </div>
                <div
                  onClick={() => {
                    liquidity.setToAmount(
                      (liquidity.toToken as Token).balance.toFixed()
                    );
                  }}
                  className="  cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] text-base ml-[8px] font-bold leading-3 tracking-[0.16px] underline"
                >
                  Max
                </div>
              </div>
            )}
            <TokenSelector
              value={liquidity.toToken}
              onSelect={(token) => {
                liquidity.setToToken(token);
              }}
            ></TokenSelector>
          </div>
        </div>
        <Button
          isDisabled={liquidity.isDisabled}
          isLoading={liquidity.addLiquidity.loading}
          onClick={() => {
            liquidity.addLiquidity.call();
          }}
        >
          {liquidity.buttonContent}
        </Button>
      </div>
    </SpinnerContainer>
  );
});

export const RemoveLiquidity = observer(
  ({ noCancelButton = false }: { noCancelButton?: boolean }) => {
    const state = useLocalObservable(() => ({
      selectState: new SelectState({
        value: 0.25,
      }),
    }));
    return liquidity.currentRemovePair ? (
      <div className="flex justify-center">
        <div className="flex flex-col gap-[24px] items-center lg:w-[360px]">
          <div className="w-full"></div>
          <ItemSelect
            selectState={state.selectState}
            className="gap-[16px] justify-around w-full flex flex-wrap"
          >
            <SelectItem className="rounded-[30px] px-[24px]" value={0.25}>
              25%
            </SelectItem>
            <SelectItem className="rounded-[30px] px-[24px]" value={0.5}>
              50%
            </SelectItem>
            <SelectItem className="rounded-[30px] px-[24px]" value={0.75}>
              75%
            </SelectItem>
            <SelectItem className="rounded-[30px] px-[24px]" value={1}>
              100%
            </SelectItem>
          </ItemSelect>
          <div className="w-full">
            <div className="flex justify-between">
              <div>{liquidity.currentRemovePair?.token0.displayName}</div>
              <div>
                {liquidity.currentRemovePair?.token0LpBalance
                  .multipliedBy(state.selectState.value as number)
                  .toFixed(3)}
              </div>
            </div>
            <div className="mt-[16px] flex justify-between">
              <div>{liquidity.currentRemovePair?.token1.displayName}</div>
              <div>
                {liquidity.currentRemovePair?.token1LpBalance
                  .multipliedBy(state.selectState.value as number)
                  .toFixed(3)}
              </div>
            </div>
          </div>
          <div className="flex w-full gap-[16px] justify-between">
            {!noCancelButton && (
              <Button
                className="flex-1"
                onClick={(e) => {
                  liquidity.setCurrentRemovePair(null);
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              className="flex-1"
              isLoading={liquidity.currentRemovePair?.removeLiquidity.loading}
              onClick={() => {
                liquidity.currentRemovePair?.removeLiquidity.call(
                  state.selectState.value as number
                );
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    ) : (
      <Table
        rowKey="address"
        columns={[
          {
            title: "Pool Name",
            dataKey: "poolName",
          },
          {
            title: "Self Liquidity",
            dataKey: "myLiquidityDisplay",
          },
          {
            title: "Action",
            key: "action",
            render: (value, record) => {
              return (
                <Button
                  onClick={() => {
                    liquidity.setCurrentRemovePair(record);
                  }}
                >
                  Remove
                </Button>
              );
            },
          },
        ]}
        datasource={liquidity.myPairs}
      ></Table>
    );
  }
);

export const LPCard = observer(() => {
  const router = useRouter();
  const [pairsMap, setPairsMap] = useState<GhostPair[]>();
  const { inputCurrency, outputCurrency } = router.query as {
    inputCurrency: string;
    outputCurrency: string;
  };

  const isinit = wallet.isInit && liquidity.isInit;

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
    if (!isinit) {
      return;
    }
    if (inputCurrency && isEthAddress(inputCurrency)) {
      liquidity.setFromToken(liquidity.tokensMap[inputCurrency]);
    }
    if (outputCurrency && isEthAddress(outputCurrency)) {
      liquidity.setToToken(liquidity.tokensMap[outputCurrency]);
    }
  }, [inputCurrency, outputCurrency, isinit]);
  return (
    <div className="[background:var(--card-color,#271A0C)]   p-[20px] rounded-[20px] border-2 border-solid border-[rgba(247,147,26,0.10)]">
      {(isinit && (
        <Tabs
          variant="light"
          disableAnimation
          classNames={{
            tabList: "gap-16px p-0 bg-transparent",
            tab: "px-[0.25rem] data-[selected=true]:bg-transparent font-bold text-[1.2rem]",
          }}
        >
          <Tab
            key="addLiquidity"
            title={<span className="text-sm sm:text-base">Add Liquidity</span>}
            className="text-red-500"
          >
            <AddLiquidity></AddLiquidity>
          </Tab>
          <Tab
            key="removeLiquidity"
            title={
              <span className="text-sm sm:text-base">Remove Liquidity</span>
            }
          >
            <RemoveLiquidity></RemoveLiquidity>
          </Tab>
        </Tabs>
      )) || <LoadingDisplay></LoadingDisplay>}
    </div>
  );
});
