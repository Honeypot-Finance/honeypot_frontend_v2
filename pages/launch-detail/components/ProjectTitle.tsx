import React, { createElement } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import { FaTelegram, FaGlobe } from "react-icons/fa";
import { Copy } from "@/components/Copy";
import { VscCopy } from "react-icons/vsc";
import { BiSearch } from "react-icons/bi";
import PairStatus from "@/components/atoms/TokenStatusDisplay/PairStatus";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import {
  pot2pumpShareLink,
  pot2PumpShareContent,
} from "@/config/socialSharingContents";
import { cn } from "@nextui-org/theme";
import Link from "next/link";
import { BiLinkExternal } from "react-icons/bi";
import Image from "next/image";
import { Tooltip, useDisclosure } from "@nextui-org/react";
import { WrappedTooltip } from "@/components/wrappedNextUI/Tooltip/Tooltip";
import { optionsPresets } from "@/components/OptionsDropdown/OptionsDropdown";
import { LucideFileEdit } from "lucide-react";
import { wallet } from "@/services/wallet";
import { toast } from "react-toastify";

interface ProjectTitleProps {
  name?: string;
  displayName?: string;
  telegram?: string;
  twitter?: string;
  website?: string;
  address?: string;
  statusColor?: string;
  status?: string;
  isValidated?: boolean;
  pair?: MemePairContract;
  className?: string;
}

const ProjectTitle: React.FC<ProjectTitleProps> = ({
  name,
  displayName,
  telegram,
  twitter,
  website,
  address,
  statusColor,
  status,
  isValidated,
  pair,
  className,
}) => {
  const isLoading = !pair;

  const { onOpen } = useDisclosure();

  return (
    <div
      className={cn(
        "flex items-end md:items-center md:justify-start gap-x-4 md:gap-x-[7.5px] justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 md:gap-0 ">
        <div className="size-10 md:size-[77px] flex items-center justify-center rounded-full shrink-0">
          <Image
            width={77}
            height={77}
            objectFit="cover"
            className="rounded-full"
            sizes="(max-width: 640px) 40px,77px"
            alt={pair?.launchedToken?.name || "honey"}
            src={!!pair?.logoUrl ? pair.logoUrl : "/images/empty-logo.png"}
          />
        </div>
        <div className="flex flex-col items-center gap-0.5 md:hidden">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-[120px] bg-slate-200" />
              <Skeleton className="h-4 w-[100px] bg-slate-200" />
            </>
          ) : (
            <>
              <div className="text-base font-medium">{displayName}</div>
              {name && (
                <div className="text-xs text-[#5C5C5C]/60">({name})</div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 items-start">
        {!isLoading && (
          <div className="md:hidden">
            <PairStatus
              status={status}
              statusColor={statusColor}
              isValidated={isValidated}
            />
          </div>
        )}
        <div className="">
          <div className="hidden md:flex items-center gap-1">
            {isLoading ? (
              <Skeleton className="h-8 w-[60px] bg-slate-200" />
            ) : (
              <div className="text-2xl">{displayName}</div>
            )}
            {isLoading ? (
              <Skeleton className="h-5 w-[150px] bg-slate-200" />
            ) : name ? (
              <div className="text-sm text-[#5C5C5C]/60">({name})</div>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-4 bg-slate-200" />
                <Skeleton className="h-4 w-4 bg-slate-200" />
                <Skeleton className="h-4 w-4 bg-slate-200" />
                <Skeleton className="h-4 w-4 bg-slate-200" />
                <Skeleton className="h-4 w-4 bg-slate-200" />
              </>
            ) : (
              <>
                {telegram && (
                  <WrappedTooltip content="Telegram">
                    <a
                      href={telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 text-[#5C5C5C]"
                    >
                      <FaTelegram size={16} />
                    </a>
                  </WrappedTooltip>
                )}
                {twitter && (
                  <WrappedTooltip content="Twitter">
                    <a
                      href={twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 text-[#5C5C5C]"
                    >
                      <FaXTwitter size={16} />
                    </a>
                  </WrappedTooltip>
                )}
                {website && (
                  <WrappedTooltip content="Website">
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 text-[#5C5C5C]"
                    >
                      <FaGlobe size={16} />
                    </a>
                  </WrappedTooltip>
                )}

                {/*[
                optionsPresets.copy({
                  copyText: pair?.launchedToken?.address ?? "",
                  displayText: "Copy Token address",
                  copysSuccessText: "Token address copied",
                }),
                optionsPresets.share({
                  shareUrl: `${window.location.origin}/launch-detail/${pair?.launchedToken?.address}`,
                  displayText: "Share this project",
                  shareText: "Checkout this Token: " + pair?.projectName,
                }),
                optionsPresets.importTokenToWallet({
                  token: pair?.launchedToken,
                }),
                optionsPresets.viewOnExplorer({
                  address: pair?.address ?? "",
                }),
                {
                  icon: <LucideFileEdit />,
                  display: "Update Project",
                  onClick: () => {
                    if (!pair) return;

                    if (
                      pair.provider.toLowerCase() !==
                      wallet.account.toLowerCase()
                    ) {
                      toast.warning("You are not the owner of this project");
                      return;
                    }

                    onOpen();
                  },
                },
              ] */}

                {address && (
                  <>
                    <Copy
                      content="Copy address"
                      value={address}
                      displayContent={
                        <div className="relative hover:opacity-80 text-[#5C5C5C]">
                          <VscCopy size={16} />
                        </div>
                      }
                    />
                    <WrappedTooltip content="Search on Twitter">
                      <a
                        href={`https://x.com/search?q=($${displayName} or ${address})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 text-[#5C5C5C]"
                      >
                        <BiSearch size={18} />
                      </a>
                    </WrappedTooltip>

                    {[
                      optionsPresets.importTokenToWallet({
                        token: pair?.launchedToken,
                      }),
                      optionsPresets.viewOnExplorer({
                        address: pair?.address ?? "",
                      }),
                      {
                        icon: <LucideFileEdit size={14} />,
                        display: "Update Project",
                        onClick: () => {
                          if (!pair) return;

                          if (
                            pair.provider.toLowerCase() !==
                            wallet.account.toLowerCase()
                          ) {
                            toast.warning(
                              "You are not the owner of this project"
                            );
                            return;
                          }

                          onOpen();
                        },
                      },
                    ].map((item) => {
                      return (
                        <WrappedTooltip
                          key={item.display}
                          content={item.display}
                        >
                          <div onClick={() => item.onClick()}>
                            {
                              <div className="hover:opacity-80 text-[#5C5C5C] cursor-pointer">
                                {item.icon}
                              </div>
                            }
                          </div>
                        </WrappedTooltip>
                      );
                    })}
                  </>
                )}
                {pair?.state === 0 && (
                  <WrappedTooltip content="Defined.fi">
                    <a
                      href={`https://www.defined.fi/berachain/${pair?.launchedToken?.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 text-[#5C5C5C] text-lg"
                      title="defined.fi"
                    >
                      {`𝔻`}
                    </a>
                  </WrappedTooltip>
                )}
                <div className="hidden md:block">
                  <PairStatus
                    status={status}
                    statusColor={statusColor}
                    isValidated={isValidated}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-start gap-1">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 bg-slate-200" />
                <Skeleton className="h-6 w-16 bg-slate-200" />
              </div>
            ) : pair ? (
              <div className="flex items-center self-start gap-2">
                <span className="text-xs sm:text-sm text-[#5C5C5C]">
                  Share To
                </span>
                <div
                  className={cn(
                    "text-right flex items-center gap-2 flex-row text-black"
                  )}
                >
                  <Link
                    className="cursor-pointer flex items-center gap-2 hover:text-primary flex-col"
                    target="_blank"
                    href={`https://twitter.com/intent/tweet?text=${pot2PumpShareContent(
                      pair,
                      "twitter"
                    )}%0A%0A${pot2pumpShareLink(pair)}`}
                  >
                    <div className="flex items-center gap-1 hover:text-black/40">
                      X
                      <BiLinkExternal />
                    </div>
                  </Link>
                  <Link
                    className="cursor-pointer flex items-center gap-2 hover:text-primary flex-col"
                    target="_blank"
                    href={`https://telegram.me/share/url?url=${pot2pumpShareLink(
                      pair
                    )}%0A&text=${pot2PumpShareContent(pair, "telegram")}`}
                  >
                    <div className="flex items-center gap-1 hover:text-black/40">
                      TG
                      <BiLinkExternal />
                    </div>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTitle;
