import Link from "next/link";
import { Observer, observer } from "mobx-react-lite";
import { wallet } from "@/services/wallet";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import launchpad from "@/services/launchpad";
import { NextLayoutPage } from "@/types/nextjs";
import { FtoPairContract } from "@/services/contract/ftopair-contract";
import { LaunchCard } from "@/components/LaunchCard";
import Image from "next/image";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  Tabs,
  useDisclosure,
  Button as NextButton,
  Checkbox,
} from "@nextui-org/react";
import { IoSearchOutline } from "react-icons/io5";
import { SpinnerContainer } from "@/components/Spinner";
import { DropdownSvg } from "@/components/svg/dropdown";
import LoadingDisplay from "@/components/LoadingDisplay/LoadingDisplay";
import { motion } from "framer-motion";
import { defaultContainerVariants, itemPopUpVariants } from "@/lib/animation";
import CardContianer from "@/components/CardContianer/CardContianer";
import { FaCrown } from "react-icons/fa";
import MemeWarBanner from "@/components/MemeWarBanner/MemeWarBanner";
import HoneyStickSvg from "@/components/svg/HoneyStick";

const LaunchPage: NextLayoutPage = observer(() => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mostSuccessProjects, setMostSuccessProjects] = useState<
    FtoPairContract[]
  >(launchpad.ftoPageInfo.pageItems.value);

  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }
    launchpad.setCurrentLaunchpadType("fto");
    launchpad.showNotValidatedPairs = true;
    launchpad.ftoPageInfo.reloadPage();
    launchpad.participatedPairs.reloadPage();

    //loading most success projects
    launchpad.mostSuccessfulFtos().then((data) => {
      setMostSuccessProjects(data);
    });
  }, [wallet.isInit]);

  return (
    <div className="px-6 xl:max-w-[1200px] mx-auto flex flex-col sm:gap-y-4">
      <div className="w-full">
        <MemeWarBanner isEnd />
      </div>

      {mostSuccessProjects && mostSuccessProjects.length > 0 && (
        <>
          <h2 className="w-full text-center text-[3rem] [font-family:MEMEH] font-bold">
            Trending Projects
          </h2>

          <motion.div
            variants={defaultContainerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col lg:flex-row gap-2 flex-grow-[1]"
          >
            {mostSuccessProjects.map((pair: FtoPairContract, idx) => (
              <motion.div
                variants={itemPopUpVariants}
                key={pair.address}
                className={
                  "flex-grow relative " + (idx !== 0 && "hidden lg:flex")
                }
              >
                <CardContianer>
                  <motion.div
                    className="absolute  top-0 left-0"
                    initial={{
                      rotate: 0,
                    }}
                    whileHover={{
                      rotate: [0, -10, 10, -10, 10, -10, 10, -10, 10, 0],
                    }}
                    transition={{
                      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
                      duration: 1,
                    }}
                  >
                    {idx === 0 && (
                      <FaCrown className="absolute top-0 left-2 rotate-[-30deg] translate-x-[-50%] translate-y-[-100%] scale-[500%] fill-yellow-300" />
                    )}
                    {idx === 1 && (
                      <FaCrown className="absolute top-0 left-1 rotate-[-30deg] translate-x-[-50%] translate-y-[-100%] scale-[300%] fill-gray-300" />
                    )}
                    {idx === 2 && (
                      <FaCrown className="absolute top-0 left-0 rotate-[-30deg] translate-x-[-30%] translate-y-[-50%] scale-[100%] fill-amber-800" />
                    )}
                  </motion.div>
                  <div className="flex flex-col gap-2 justify-center items-center flex-grow-[1] basis-1">
                    <div className="w-14 flex items-center justify-center rounded-lg bg-gold-primary aspect-square overflow-hidden">
                      <Image
                        src={
                          !!pair?.logoUrl
                            ? pair.logoUrl
                            : "/images/project_honey.png"
                        }
                        alt="honey"
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      ></Image>
                    </div>
                    <h4 className="text-white text-center text-[1rem] font-bold flex items-center">
                      <div className=" relative">
                        {pair?.launchedToken?.name} <br />(
                        {pair?.launchedToken?.symbol})
                      </div>
                    </h4>{" "}
                    <motion.div className="flex flex-col items-center gap-1">
                      <h6 className="opacity-50 text-xs">Total raised</h6>
                      <div className="flex items-center gap-2 text-sm">
                        {/* <TotalRaisedSvg /> */}
                        <span className="font-bold">
                          {pair?.depositedRaisedToken
                            ? pair.depositedRaisedToken.toFormat(0)
                            : "-"}{" "}
                          &nbsp;
                          {pair?.raiseToken?.displayName}
                        </span>
                      </div>
                    </motion.div>
                    <Link
                      href={`/launch-detail/${pair.address}`}
                      className="text-black font-bold px-[8px]"
                    >
                      <Button className="">View Token</Button>
                    </Link>
                  </div>
                </CardContianer>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      <div className="flex w-full justify-end gap-2">
        <Button className="scale-[0.8] sm:scale-100">
          <Link
            href="/launch-token?launchType=meme"
            className="text-black font-bold"
          >
            Launch Token
          </Link>
        </Button>
      </div>

      <div>
        <div id="filter" className="flex flex-col sm:flex-row gap-2">
          <Input
            onChange={(e) => {
              launchpad.pairFilterSearch = e.target.value;
            }}
            startContent={<IoSearchOutline></IoSearchOutline>}
            placeholder="Search by name, symbol or address"
            classNames={{
              innerWrapper: "w-[369px] h-[32px]",
            }}
            className=" border [background:var(--card-color,#271A0C)] rounded-2xl border-solid border-[rgba(225,138,32,0.10)]"
          ></Input>{" "}
          <Popover
            shouldBlockScroll
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
                <span className="flex-1">
                  {launchpad.ftoPageInfo.filter.status.toUpperCase()}
                </span>
                <DropdownSvg></DropdownSvg>
              </NextButton>
            </PopoverTrigger>
            <PopoverContent className="flex lg:w-[352px] flex-col items-center gap-4 border border-[color:var(--card-stroke,#F7931A)] [background:var(--card-color,#271A0C)] rounded-xl border-solid">
              <Observer>
                {() => (
                  <div className="w-full">
                    <SpinnerContainer
                      isLoading={launchpad.ftoPageInfo.isLoading}
                    >
                      <div className="max-h-[300px] grid grid-cols-3 gap-2">
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "all";
                          }}
                          className="w-[100px]"
                        >
                          All
                        </NextButton>
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "success";
                          }}
                          className="w-[100px]"
                        >
                          Success
                        </NextButton>
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "fail";
                          }}
                          className="w-[100px]"
                        >
                          Failed
                        </NextButton>
                        <NextButton
                          onClick={() => {
                            launchpad.pairFilterStatus = "processing";
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
        <div className="flex justify-between items-center">
          <Checkbox
            onClick={() => {
              launchpad.ftoPageInfo.updateFilter({
                showNotValidatedPairs:
                  !launchpad.ftoPageInfo.filter.showNotValidatedPairs,
              });
            }}
            defaultSelected={launchpad.ftoPageInfo.filter.showNotValidatedPairs}
            defaultChecked={launchpad.ftoPageInfo.filter.showNotValidatedPairs}
            checked={launchpad.ftoPageInfo.filter.showNotValidatedPairs}
            className="mt-2"
          >
            Show Unvalidated Projects
          </Checkbox>
          <div className="flex justify-end">
            <Link
              href={"https://tryghost.xyz/log"}
              target="_blank"
              className="flex p-2 gap-2 items-center"
            >
              <Image
                className="h-4"
                src="/images/partners/powered_by_ghost_light.png"
                alt=""
                width={100}
                height={100}
              />
            </Link>
          </div>
        </div>
      </div>

      {!launchpad.ftoPageInfo.isInit ? (
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
            onSelectionChange={(key) => {
              launchpad.setCurrentLaunchpadType("fto");
              if (key === "all") {
                //
              } else if (key === "my") {
                launchpad.myPairs.call();
              } else if (key === "participated-launch") {
                launchpad.participatedPairs.reloadPage();
              }
            }}
          >
            <Tab key="all" title="All Projects">
              <motion.div
                variants={defaultContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3"
              >
                {launchpad.ftoPageInfo.pageItems.value.map(
                  (pair: FtoPairContract) => (
                    <motion.div variants={itemPopUpVariants} key={pair.address}>
                      <LaunchCard pair={pair} action={<></>} />
                    </motion.div>
                  )
                )}
              </motion.div>
              <div className="flex justify-around my-5">
                {launchpad.ftoPageInfo.pageInfo.hasNextPage && (
                  <Button
                    onClick={() => {
                      launchpad.ftoPageInfo.loadMore();
                    }}
                    isDisabled={launchpad.ftoPageInfo.isLoading}
                  >
                    {launchpad.ftoPageInfo.isLoading
                      ? "Loading..."
                      : "Load More"}
                  </Button>
                )}
              </div>
            </Tab>
            <Tab key="my" title="My Projects">
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3">
                {launchpad.myPairs.value?.data.map((pair: FtoPairContract) => (
                  <div key={pair.address}>
                    <LaunchCard pair={pair} action={<></>} />
                  </div>
                ))}
              </div>
            </Tab>{" "}
            <Tab key="participated-launch" title="Participated Launch">
              <motion.div
                variants={defaultContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3"
              >
                {!launchpad.participatedPairs.isInit ? (
                  <LoadingDisplay />
                ) : launchpad.participatedPairs.pageItems.value?.length ??
                  0 > 0 ? (
                  launchpad.participatedPairs.pageItems.value?.map(
                    (project) => (
                      <LaunchCard
                        key={project.address}
                        pair={project}
                        action={<></>}
                      />
                    )
                  )
                ) : (
                  <div className="flex flex-col justify-center items-center">
                    <HoneyStickSvg />
                    <div className="text-[#eee369] mt-2  text-[3rem] text-center">
                      List is empty
                    </div>
                  </div>
                )}
              </motion.div>{" "}
              <div className="flex justify-around my-5">
                {launchpad.participatedPairs.pageInfo.hasNextPage && (
                  <Button
                    onClick={() => {
                      launchpad.participatedPairs.loadMore();
                    }}
                    isDisabled={launchpad.memePageInfo.isLoading}
                  >
                    {launchpad.participatedPairs.isLoading
                      ? "Loading..."
                      : "Load More"}
                  </Button>
                )}
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
});

export default LaunchPage;
