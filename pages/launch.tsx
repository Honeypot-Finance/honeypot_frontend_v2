import Link from "next/link";
import { Observer, observer } from "mobx-react-lite";
import { wallet } from "@/services/wallet";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import launchpad from "@/services/launchpad";
import { NextLayoutPage } from "@/types/nextjs";
import { RocketSvg } from "@/components/svg/Rocket";
import { PeddingSvg } from "@/components/svg/Pedding";
import { FtoPairContract } from "@/services/contract/ftopair-contract";
import { Copy } from "@/components/copy";
import { LaunchCard } from "@/components/LaunchCard";
import {
  Input,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  Tabs,
  useDisclosure,
  Button as NextButton,
  Checkbox,
} from "@nextui-org/react";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { SpinnerContainer } from "@/components/Spinner";
import { DropdownSvg } from "@/components/svg/dropdown";
import LoadingDisplay from "@/components/LoadingDisplay/LoadingDisplay";

const LaunchPage: NextLayoutPage = observer(() => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    launchpad.ftoPairsPagination.page = 1;
  }, []);

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
  }, [wallet.isInit]);

  return (
    <div className="px-6 xl:max-w-[1200px] mx-auto flex flex-col gap-y-4 sm:gap-y-16">
      <div className="flex w-full justify-end gap-2">
        <Button className="scale-[0.8] sm:scale-100">
          <Link href="/launch-token" className="text-black font-bold">
            Launch Token
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            onChange={(e) => {
              launchpad.pairFilterSearch = e.target.value;
              launchpad.ftoPairsPagination.page = 1;
              launchpad.ftoPairsPagination.totalPage.call();
            }}
            startContent={<IoSearchOutline></IoSearchOutline>}
            placeholder="Search by name, symbol or address"
            classNames={{
              innerWrapper: "w-[369px] h-[32px]",
            }}
            className=" border [background:var(--card-color,#271A0C)] rounded-2xl border-solid border-[rgba(225,138,32,0.10)]"
          ></Input>{" "}
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
              <NextButton className="inline-flex w-full sm:w-[124px] h-10 justify-between items-center shrink-0 border [background:#3E2A0F] px-2.5 py-0 rounded-[30px] border-solid border-[rgba(247,147,26,0.10)] text-white text-center">
                <span className="flex-1">{launchpad.pairFilter.status}</span>
                <DropdownSvg></DropdownSvg>
              </NextButton>
            </PopoverTrigger>
            <PopoverContent className="flex lg:w-[352px] flex-col items-center gap-4 border border-[color:var(--card-stroke,#F7931A)] [background:var(--card-color,#271A0C)] rounded-xl border-solid">
              <Observer>
                {() => (
                  <div className="w-full">
                    <SpinnerContainer isLoading={launchpad.ftoPairs.loading}>
                      <div className="max-h-[300px] grid grid-cols-3 gap-2">
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "all";
                            launchpad.ftoPairsPagination.page = 1;
                            launchpad.ftoPairs.call({
                              page: launchpad.ftoPairsPagination.page,
                              limit: launchpad.ftoPairsPagination.limit,
                            });
                          }}
                          className="w-[100px]"
                        >
                          All
                        </NextButton>
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "success";
                            launchpad.ftoPairsPagination.page = 1;
                            launchpad.ftoPairs.call({
                              page: launchpad.ftoPairsPagination.page,
                              limit: launchpad.ftoPairsPagination.limit,
                            });
                          }}
                          className="w-[100px]"
                        >
                          Success
                        </NextButton>
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "fail";
                            launchpad.ftoPairsPagination.page = 1;
                            launchpad.ftoPairs.call({
                              page: launchpad.ftoPairsPagination.page,
                              limit: launchpad.ftoPairsPagination.limit,
                            });
                          }}
                          className="w-[100px]"
                        >
                          Failed
                        </NextButton>
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "processing";
                            launchpad.ftoPairsPagination.page = 1;
                            launchpad.ftoPairs.call({
                              page: launchpad.ftoPairsPagination.page,
                              limit: launchpad.ftoPairsPagination.limit,
                            });
                          }}
                          className="w-[100px]"
                        >
                          Processing
                        </NextButton>
                      </div>
                    </SpinnerContainer>
                  </div>
                )}
              </Observer>
            </PopoverContent>
          </Popover>
        </div>
        <Checkbox
          onClick={() => {
            launchpad.showNotValidatedPairs =
              !launchpad.pairFilter.showNotValidatedPairs;
            launchpad.ftoPairsPagination.page = 1;
            launchpad.ftoPairs.call({
              page: launchpad.ftoPairsPagination.page,
              limit: launchpad.ftoPairsPagination.limit,
            });
          }}
          defaultSelected={launchpad.pairFilter.showNotValidatedPairs}
          defaultChecked={launchpad.pairFilter.showNotValidatedPairs}
          checked={launchpad.pairFilter.showNotValidatedPairs}
          className="mt-2"
        >
          Show Not verified Projects
        </Checkbox>
      </div>

      {launchpad.ftoPairs.loading ? (
        <div className="flex h-80 sm:h-[566px] max-w-full w-[583px] justify-center items-center [background:#121212] rounded-[54px]  mx-auto">
          <LoadingDisplay />
        </div>
      ) : (
        <div>
          <Tabs
            aria-label="Options"
            classNames={{
              tabList: "bg-transparent",
              tab: "flex flex-col items-start gap-2.5 border-0  backdrop-blur-[100px] p-2.5 rounded-[10px]",
            }}
            className="next-tab"
          >
            <Tab key="all" title="All Projects">
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3">
                {launchpad.ftoPairs.value?.data.map((pair: FtoPairContract) => (
                  <div key={pair.address}>
                    <LaunchCard
                      pair={pair}
                      action={
                        <div className="flex flex-col gap-[0.5rem] lg:flex-row">
                          <Link
                            href={`/launch-detail/${pair.address}`}
                            className="text-black font-bold w-full px-[8px]"
                          >
                            <Button className="w-full">View Token</Button>
                          </Link>
                          {pair.ftoState === 0 && (
                            <Link
                              href={`/swap?inputCurrency=${pair.launchedToken.address}&outputCurrency=${pair.raiseToken.address}`}
                              className="text-black font-bold w-full px-[8px]"
                            >
                              <Button className="w-full">
                                <p>Swap Token</p>
                                {/* <p>
                                  <Copy
                                    onClick={(e) => {
                                      e.preventDefault();
                                    }}
                                    className="absolute ml-[8px] top-[50%] translate-y-[-50%]"
                                    value={`${window.location.origin}/swap?inputCurrency=${pair.launchedToken.address}&outputCurrency=${pair.raiseToken.address}`}
                                  ></Copy>
                                </p> */}
                              </Button>{" "}
                            </Link>
                          )}
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
              <Pagination
                className="flex justify-center mt-[12px]"
                total={launchpad.ftoPairsPagination.totalPage.value ?? 1}
                page={launchpad.ftoPairsPagination.page}
                initialPage={launchpad.ftoPairsPagination.page}
                onChange={(page) => {
                  launchpad.ftoPairsPagination.onPageChange(page);
                  launchpad.ftoPairs.call({
                    page,
                    limit: launchpad.ftoPairsPagination.limit,
                  });
                }}
              />
            </Tab>
            <Tab key="my" title="My Projects">
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3">
                {launchpad.myFtoPairs.value?.data.map(
                  (pair: FtoPairContract) => (
                    <div key={pair.address}>
                      <LaunchCard
                        pair={pair}
                        action={
                          <Link
                            href={`/launch-detail/${pair.address}`}
                            className="text-black font-bold w-full px-[8px]"
                          >
                            <Button className="w-full">View Token</Button>
                          </Link>
                        }
                      />
                    </div>
                  )
                )}
              </div>
              {/* <Pagination
                className="flex justify-center mt-[12px]"
                total={launchpad.ftoPairsPagination.totalPage}
                page={launchpad.ftoPairsPagination.page}
                initialPage={launchpad.ftoPairsPagination.page}
                onChange={(page) => {
                  launchpad.ftoPairsPagination.onPageChange(page);
                  launchpad.ftoPairs.call({
                    page,
                    limit: launchpad.ftoPairsPagination.limit,
                  });
                }}
              /> */}
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
});

export default LaunchPage;
