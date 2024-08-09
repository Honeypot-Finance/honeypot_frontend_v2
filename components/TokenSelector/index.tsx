import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
  useDisclosure,
  Link,
} from "@nextui-org/react";
import { DropdownSvg } from "../svg/dropdown";
import { IoSearchOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { Token } from "@/services/contract/token";
import { Observer, observer, useLocalObservable } from "mobx-react-lite";
import { liquidity } from "@/services/liquidity";
import { useEffect, useMemo, useState } from "react";
import { isEthAddress } from "@/lib/address";
import { useOnce } from "@/lib/hooks";
import { useAccount } from "wagmi";
import { Input } from "../input/index";
import { SpinnerContainer } from "../Spinner";
import { NoData } from "../table";
import debounce from "lodash/debounce";
import { Copy } from "../copy/index";
import { BiLinkExternal } from "react-icons/bi";
import { wallet } from "@/services/wallet";
import Image from "next/image";
import TokenLogo from "../TokenLogo/TokenLogo";

type TokenSelectorProps = {
  onSelect: (token: Token) => void;
  value?: Token | null;
};

export const TokenSelector = observer(
  ({ onSelect, value }: TokenSelectorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isConnected } = useAccount();
    const state = useLocalObservable(() => ({
      search: "",
      setSearch(value: string) {
        state.search = value.trim();
      },
      filterLoading: false,
      filterTokensBySearch: async function () {
        if (!state.search) {
          state.tokens = liquidity.tokens;
          return;
        }
        state.filterLoading = true;
        const isEthAddr = isEthAddress(state.search);
        if (isEthAddr) {
          const filterToken = liquidity.tokens?.find((token) => {
            return (
              token.address.toLowerCase() === state.search.toLocaleLowerCase()
            );
          });
          if (filterToken) {
            state.tokens = [filterToken];
            state.filterLoading = false;
            return;
          }
          const token = new Token({
            address: state.search,
          });
          await token.init();
          console.log(token);
          liquidity.tokensMap[state.search] = token;
          state.tokens = [token];
        } else {
          state.tokens = liquidity.tokens?.filter((token) => {
            return (
              token.name?.toLowerCase().includes(state.search) ||
              token.symbol?.toLowerCase().includes(state.search)
            );
          });
        }
        state.filterLoading = false;
      },
      tokens: [] as Token[],
    }));

    useOnce(() => {
      isConnected && liquidity.tokens.forEach((t) => t.getBalance());
    }, [liquidity.tokens, isConnected]);
    useEffect(() => {
      liquidity.isInit && state.filterTokensBySearch();
    }, [state.search, liquidity.isInit]);
    return (
      <div className="flex items-center group">
        {value && (
          <>
            <Link
              href={`${wallet.currentChain?.chain.blockExplorers?.default.url}/token/${value.address}`}
              target="_blank"
            >
              <BiLinkExternal className=" cursor-pointer hover:text-primary "></BiLinkExternal>
            </Link>
            <Copy value={value.address} className="ml-[8px] mr-[8px]"></Copy>
          </>
        )}
        <Popover
          isOpen={isOpen}
          onOpenChange={(isOpen) => {
            isOpen ? onOpen() : onClose();
          }}
          placement="bottom"
          classNames={{
            base: [
              // arrow color
              "before:bg-default-200",
            ],
            content: [
              "py-3 px-4 border border-default-200",
              "bg-gradient-to-br from-white to-default-300",
              "dark:from-default-100 dark:to-default-50",
            ],
          }}
        >
          <PopoverTrigger>
            <Button className="inline-flex w-[124px] h-10 justify-between items-center shrink-0 border [background:#3E2A0F] px-2.5 py-0 rounded-[30px] border-solid border-[rgba(247,147,26,0.10)]">
              {value && <TokenLogo token={value}></TokenLogo>}
              {value?.displayName ? value.displayName : "Select Token"}
              <div className="group-hover:translate-y-1 transition-all">
                <DropdownSvg></DropdownSvg>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex w-full lg:w-[350px] flex-col items-center gap-4 border border-[color:var(--card-stroke,#F7931A)] [background:var(--card-color,#271A0C)] rounded-xl border-solid">
            <Observer>
              {() => (
                <div className="w-full">
                  <SpinnerContainer
                    isLoading={state.filterLoading || !liquidity.isInit}
                  >
                    <Input
                      placeholder="Search token by symbol or address"
                      // className=" bg-transparent"
                      onClear={() => {
                        state.setSearch("");
                      }}
                      onChange={(e) => {
                        state.setSearch(e.target.value);
                      }}
                      isClearable={true}
                      // labelPlacement="outside"
                      startContent={<IoSearchOutline></IoSearchOutline>}
                      endContent={<IoClose></IoClose>}
                    />
                    <Divider className="my-4" />
                    <div>
                      <div></div>

                      <div className="max-h-[300px] overflow-auto">
                        {state.tokens.length ? (
                          state.tokens.map((token) => {
                            return (
                              <div
                                key={token.address}
                                onClick={() => {
                                  onSelect(token);
                                  onClose();
                                }}
                                className="py-[8px] px-[8px] rounded-[8px] flex justify-between items-center cursor-pointer hover:[background:rgba(255,255,255,0.04)]"
                              >
                                <TokenLogo token={token}></TokenLogo>
                                <div className="flex-grow-[1] px-2">
                                  <div>{token.name}</div>
                                  <div className="text-[rgba(255,255,255,0.50)] [font-kerning:none] [font-feature-settings:'calt'_off] [font-family:Inter] text-xs font-normal leading-[14px]">
                                    {token.symbol}
                                  </div>
                                </div>
                                <div>{token.balanceFormatted}</div>
                              </div>
                            );
                          })
                        ) : (
                          <NoData></NoData>
                        )}
                      </div>
                    </div>
                  </SpinnerContainer>
                </div>
              )}
            </Observer>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
