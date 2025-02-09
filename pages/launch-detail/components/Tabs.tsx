import { useState } from "react";
import { motion } from "framer-motion";
import { amountFormatted, truncate } from "@/lib/format";
import { getTextSizeClass } from "@/lib/utils";
import { ChevronDown, LucideFileEdit } from "lucide-react";
import CardContianer from "@/components/CardContianer/CardContianer";
import { FtoPairContract } from "@/services/contract/launches/fto/ftopair-contract";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import { DiscussionArea } from "@/components/Discussion/DiscussionArea/DiscussionArea";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/button";
import BeraVoteForm from "@/components/beravote/components/NewSpace/Steps/BeraVoteForm";
import { observer } from "mobx-react-lite";
import { VscCopy } from "react-icons/vsc";
import { Copy } from "@/components/Copy";
import { Trigger } from "@/components/Trigger";
import {
  OptionsDropdown,
  optionsPresets,
} from "@/components/OptionsDropdown/OptionsDropdown";
import { wallet } from "@/services/wallet";
import { toast } from "react-toastify";
import { Modal, useDisclosure } from "@nextui-org/react";
import { UpdateProjectModal } from "../[pair]";
import TransactionHistory from "./TransactionHistory";
import { ShareMediaDisplay } from "@/components/ShareSocialMedialPopUp/ShareSocialMedialPopUp";
import { pot2PumpTGShareContent } from "@/config/socialSharingContents";
import { popmodal } from "@/services/popmodal";
import TopHoldersTable from "./TopHoldersTable";

const universalMenuItems = [
  { key: "txs", label: "Transactions" },
  { key: "comment", label: "Comments" },
  //{ key: "priceChart", label: "Price Chart" },
  { key: "holders", label: "Top 10 Holders" },
];

const successMenuItems = [{ key: "votingspace", label: "Voting Space" }];

interface Transaction {
  rank: string;
  address: string;
  quantity: string;
  percentage: string;
  value: string;
}

interface Holder {
  rank: string;
  address: string;
  quantity: string;
  percentage: string;
  value: string;
}

const Tabs = observer(
  ({
    pair,
    refreshTrigger,
  }: {
    pair: FtoPairContract | MemePairContract | null;
    refreshTrigger?: number;
  }) => {
    const [tab, setTab] = useState("comment");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const options =
      pair?.state === 0
        ? [...universalMenuItems, ...successMenuItems]
        : universalMenuItems;

    return (
      <div className="relative">
        {pair && (
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            classNames={{
              base: "max-h-[70vh] overflow-y-scroll",
            }}
          >
            <UpdateProjectModal pair={pair}></UpdateProjectModal>
          </Modal>
        )}
        {/* <div className="hidden sm:flex items-center gap-x-1 md:text-xs ml-3">
          {universalMenuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={[
                "px-2 md:px-8 pt-2 pb-1 rounded-t-2xl",
                tab === item.key
                  ? "bg-[#9D5E28] text-white"
                  : "bg-[#3B2712] text-[#A46617]",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
          {pair?.state === 0 &&
            successMenuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={[
                  "px-2 md:px-8 pt-2 pb-1 rounded-t-2xl",
                  tab === item.key
                    ? "bg-[#9D5E28] text-white"
                    : "bg-[#3B2712] text-[#A46617]",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
        </div> */}
        <Trigger
          tab={tab}
          setTab={setTab}
          options={options.map((item) => item.key)}
          className="px-2 md:px-8 pt-2 pb-1 rounded-t-2xl mx-auto absolute -top-8 z-10 left-1/2 -translate-x-1/2 hidden sm:block"
          capitalize={true}
        />

        <div className="relative sm:hidden inline-block text-left">
          <button
            onBlur={() => setIsMenuOpen(false)}
            onClick={() => setIsMenuOpen((isMenuOpen) => !isMenuOpen)}
            className="inline-flex justify-center w-full rounded-2xl border border-[#202020] bg-white px-4 py-2 text-[#202020] text-sm font-medium shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] focus:outline-none mb-2 space-x-0.5"
          >
            <span>
              {universalMenuItems.find((item) => item.key === tab)?.label}
              {successMenuItems.find((item) => item.key === tab)?.label}
            </span>
            <ChevronDown className="size-4" />
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isMenuOpen ? "auto" : 0,
              opacity: isMenuOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 w-56 rounded-2xl overflow-hidden z-10 border border-[#202020] bg-white shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020]"
          >
            <div className="py-1 rounded-2xl">
              {universalMenuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setTab(item.key);
                    setIsMenuOpen(false);
                  }}
                  className={[
                    "block px-4 py-2 text-sm w-full text-left transition-all",
                    tab === item.key
                      ? "bg-[#202020] text-white"
                      : "text-[#202020] hover:bg-[#20202010]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
              {pair?.state === 0 &&
                successMenuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setTab(item.key);
                      setIsMenuOpen(false);
                    }}
                    className={[
                      "block px-4 py-2 text-sm w-full text-left transition-all",
                      tab === item.key
                        ? "bg-[#202020] text-white"
                        : "text-[#202020] hover:bg-[#20202010]",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          </motion.div>
        </div>

        {/** Comment section */}
        <CardContianer
          addtionalClassName={
            "block bg-[#FFCD4D] relative overflow-hidden pt-12"
          }
        >
          <div className="bg-[url('/images/pumping/outline-border.png')] bg-top h-12 absolute top-0 left-0 w-full bg-contain bg-repeat-x"></div>
          {tab === "txs" && (
            <TransactionHistory
              pairAddress={pair?.address ?? ""}
              pair={pair as MemePairContract}
              refreshTrigger={refreshTrigger}
            />
          )}
          {tab === "comment" && (
            <div className="w-full">
              {pair && (
                <DiscussionArea
                  pairDatabaseId={pair.databaseId ?? -1}
                  classNames={{ container: "border-none" }}
                />
              )}
            </div>
          )}
          {tab === "holders" && (
            <div className="w-full px-4 md:px-10">
              <h1 className="text-[var(--Heading,#0D0D0D)] text-center text-shadow-[2px_4px_0px_#AF7F3D] webkit-text-stroke-[2px] text-stroke-white font-gliker text-[40px] md:text-[64px] font-normal leading-[110%] tracking-[1.28px] mb-6 md:mb-12">
                Top 10 Holders
              </h1>
              <TopHoldersTable
                launchedToken={pair?.launchedToken}
                depositedLaunchedTokenWithoutDecimals={
                  pair?.depositedLaunchedTokenWithoutDecimals || 0
                }
              />
            </div>
          )}
          {tab === "votingspace" && (
            <div className="flex flex-col justify-center items-center gap-2">
              {pair &&
                (pair.beravoteSpaceId ? (
                  <>
                    <iframe
                      className="w-full aspect-video"
                      src={`https://beravote.com/space/${pair.beravoteSpaceId}`}
                    >
                      {" "}
                    </iframe>
                    <Link
                      href={`https://beravote.com/space/${pair.beravoteSpaceId}`}
                    >
                      <Button className="w-full">View On Beravote</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Image
                      src={"/images/partners/beravote.avif"}
                      width={500}
                      height={500}
                      alt="beravote logo"
                      className="w-full"
                    />
                    {pair.isProvider ? (
                      <BeraVoteForm pair={pair} />
                    ) : (
                      <h3>this project does not have voting space</h3>
                    )}
                  </>
                ))}
            </div>
          )}
        </CardContianer>
      </div>
    );
  }
);

export default Tabs;
