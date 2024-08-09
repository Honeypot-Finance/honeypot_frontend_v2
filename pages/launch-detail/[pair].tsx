import { useRouter } from "next/router";
import { observer, useLocalObservable } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import launchpad from "@/services/launchpad";
import { NextLayoutPage } from "@/types/nextjs";
import { AsyncState } from "@/services/utils";
import { FtoPairContract } from "@/services/contract/ftopair-contract";
import { wallet } from "@/services/wallet";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Image from "next/image";
import { amountFormatted } from "@/lib/format";
import { Copy } from "@/components/copy";
import { LuFileEdit } from "react-icons/lu";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TokenLogo from "@/components/TokenLogo/TokenLogo";
import { BiLinkExternal, BiWallet } from "react-icons/bi";
import { PopupActions } from "reactjs-popup/dist/types";
import PopUp from "@/components/PopUp/PopUp";
import { info } from "console";
import ShareSocialMedialPopUp, {
  shareMediaToast,
} from "@/components/ShareSocialMedialPopUp/ShareSocialMedialPopUp";
import { trpcClient } from "@/lib/trpc";
import TokenStatusDisplay from "@/components/atoms/TokenStatusDisplay/TokenStatusDisplay";
import { Provider } from "ethcall";
import { WatchAsset } from "@/components/atoms/WatchAsset/WatchAsset";
import { UploadImage } from "@/components/UploadImage/UploadImage";
import {
  OptionsDropdown,
  optionsPresets,
} from "@/components/OptionsDropdown/OptionsDropdown";
import { SlShare } from "react-icons/sl";
import { VscCopy } from "react-icons/vsc";

const UpdateProjectModal = observer(({ pair }: { pair: FtoPairContract }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z
        .object({
          projectName: z.string(),
          description: z.string(),
          twitter: z.union([
            z.string().url().startsWith("https://x.com/"),
            z.string().url().startsWith("https://twitter.com/"),
            z.literal(""),
          ]),
          website: z.string().url().startsWith("https://").or(z.literal("")),
          telegram: z.union([
            z.string().startsWith("https://t.me/"),
            z.string().startsWith("@"),
            z.literal(""),
          ]),
        })
        .transform((data) => {
          const mutateTelegram = (telegram: string | undefined | null) => {
            if (telegram && telegram.startsWith("@")) {
              return `https://t.me/${telegram.split("@")[1]}`;
            }

            return telegram;
          };
          return {
            ...data,
            telegram: mutateTelegram(data.telegram),
          };
        })
    ),
  });
  const FormBody = observer(({ onClose }: any) => (
    <>
      <ModalHeader className="flex flex-col gap-1">
        Update {pair.launchedToken.displayName}
      </ModalHeader>
      <ModalBody>
        <div>
          <div className="flex flex-col gap-4">
            <UploadImage
              imagePath={
                !!pair.logoUrl ? pair.logoUrl : "/images/project_honey.png"
              }
              blobName={pair.address}
              onUpload={async (url) => {
                console.log(url);
                await launchpad.updateProjectLogo.call({
                  logo_url: url,
                  pair: pair.address,
                  chain_id: wallet.currentChainId,
                });
                pair.logoUrl = url;
              }}
            ></UploadImage>
            <div>Project Name</div>
            <input
              type="text"
              {...register("projectName", {
                value: pair.projectName,
                required: "Project name is required",
              })}
              className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
            />
            {errors.projectName && (
              <span className="text-red-500">
                {errors.projectName.message as any}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>Description</div>
            <input
              type="text"
              {...register("description", {
                value: pair.description,
                required: "Description is required",
              })}
              className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
            />
            {errors.description && (
              <span className="text-red-500">
                {errors.description.message as any}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>Twitter</div>
            <input
              type="text"
              {...register("twitter", {
                value: pair.twitter,
              })}
              className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
            />
            {errors.twitter && (
              <span className="text-red-500">
                {errors.twitter.message as any}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>Website</div>
            <input
              type="text"
              {...register("website", {
                value: pair.website,
              })}
              className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
            />
            {errors.website && (
              <span className="text-red-500">
                {errors.website.message as any}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>Telegram</div>
            <input
              type="text"
              {...register("telegram", {
                value: pair.telegram,
              })}
              className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
            />
            {errors.telegram && (
              <span className="text-red-500">
                {errors.telegram.message as any}
              </span>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Close
        </Button>
        <Button
          isLoading={launchpad.updateFtoProject.loading}
          color="primary"
          onPress={async () => {
            handleSubmit(async (data) => {
              await launchpad.updateFtoProject.call({
                pair: pair.address,
                chain_id: wallet.currentChainId,
                projectName: data.projectName,
                description: data.description,
                twitter: data.twitter || "",
                website: data.website || "",
                telegram: data.telegram || "",
              });
              if (launchpad.updateFtoProject.error) {
                toast.error("Update failed");
                return;
              }
              await pair.getProjectInfo();
              toast.success("Update success");
              onClose();
            })();
          }}
        >
          Submit
        </Button>
      </ModalFooter>
    </>
  ));
  return (
    <ModalContent>
      {(onClose) => <FormBody onClose={onClose}></FormBody>}
    </ModalContent>
  );
});

const SuccessAction = observer(({ pair }: { pair: FtoPairContract }) => {
  return (
    <div className="flex gap-[16px] justify-center items-center flex-col lg:flex-row">
      {wallet.account != pair.provider && (
        <Button
          className=""
          isLoading={pair.claimLP.loading}
          onClick={() => {
            pair.claimLP.call();
          }}
          isDisabled={!pair.canClaimLP}
        >
          {pair.canClaimLP ? "Claim LP" : "Claim LP (Not available)"}
        </Button>
      )}

      <Link
        href={`/swap?inputCurrency=${pair.launchedToken.address}&outputCurrency=${pair.raiseToken.address}`}
        className="text-black font-bold"
      >
        <Button className="w-full">
          <p>Swap Token</p>
          <p>
            <Copy
              onClick={(e) => {
                e.preventDefault();
              }}
              className=" absolute ml-[8px] top-[50%] translate-y-[-50%]"
              value={`${window.location.origin}/swap?inputCurrency=${pair.launchedToken.address}&outputCurrency=${pair.raiseToken.address}`}
            ></Copy>
          </p>
        </Button>{" "}
      </Link>
    </div>
  );
});
const FailAction = observer(({ pair }: { pair: FtoPairContract }) => {
  return pair.isProvider ? (
    <div className="flex flex-col gap-[16px]">
      <Button
        className="w-full"
        isLoading={pair.withdraw.loading}
        onClick={() => {
          pair.withdraw.call();
        }}
      >
        Provider Withdraw
      </Button>
    </div>
  ) : (
    <></>
  );
});

const PauseAction = observer(({ pair }: { pair: FtoPairContract }) => {
  return pair.isProvider ? (
    <div className="flex flex-col gap-[16px]">
      <Button
        className="w-full"
        isLoading={pair.resume.loading}
        onClick={() => {
          pair.resume.call();
        }}
      >
        Resume
      </Button>
    </div>
  ) : (
    <></>
  );
});

const ProcessingAction = observer(({ pair }: { pair: FtoPairContract }) => {
  const state = useLocalObservable(() => ({
    depositAmount: "0",
    setDepositAmount(val: string) {
      this.depositAmount = val;
    },
  }));
  return (
    <div className="flex flex-col gap-[16px]">
      <Input
        className="bg-[#2F200B] rounded-[10px]"
        value={state.depositAmount}
        placeholder="Deposit amount"
        min={0}
        type="number"
        max={pair.raiseToken.balance.toFixed()}
        onChange={(e) => {
          state.setDepositAmount(e.target.value);
        }}
        defaultValue="0"
        endContent={
          <div className="flex items-center">
            <span className="mr-2">{pair.raiseToken.displayName}</span>
            <TokenLogo token={pair.raiseToken} />
          </div>
        }
      ></Input>
      <div className="flex items-center gap-[8px]">
        <div>Balance: {pair.raiseToken.balance.toFormat()}</div>
        <div
          onClick={() => {
            state.setDepositAmount(pair.raiseToken.balance.toFixed());
          }}
          className="  cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] text-base ml-[8px] font-bold leading-3 tracking-[0.16px] underline"
        >
          Max
        </div>
      </div>
      <Button
        className="w-full"
        isLoading={pair.deposit.loading}
        onClick={() => {
          pair.deposit.call({
            amount: state.depositAmount,
          });
        }}
      >
        Deposit
      </Button>
    </div>
  );
});

const Action = observer(({ pair }: { pair: FtoPairContract }) => {
  switch (pair.ftoState) {
    case 0:
      return <SuccessAction pair={pair}></SuccessAction>;
    case 1:
      return <FailAction pair={pair}></FailAction>;
    case 2:
      // return <PauseAction pair={pair}></PauseAction>;
      return <></>;
    case 3:
      if (pair.isCompleted) {
        return <></>;
      }
      return <ProcessingAction pair={pair}></ProcessingAction>;
  }
});

const LaunchPage: NextLayoutPage = observer(() => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { pair: pairAddress } = router.query;
  const [votes, setVotes] = useState({
    rocket_count: 0,
    fire_count: 0,
    poo_count: 0,
    flag_count: 0,
  });
  const state = useLocalObservable(() => ({
    pair: new AsyncState<
      FtoPairContract,
      ({ pairAddress }: { pairAddress: string }) => Promise<FtoPairContract>
    >(async ({ pairAddress }: { pairAddress: string }) => {
      const pair = new FtoPairContract({ address: pairAddress as string });
      await pair.init();
      pair.raiseToken.init();
      pair.launchedToken.init();
      return pair;
    }),
  }));

  useEffect(() => {
    if (!wallet.isInit || !pairAddress) {
      return;
    }
    state.pair.call({
      pairAddress: pairAddress as string,
    });

    refreshVotes();
  }, [wallet.isInit, pairAddress]);

  function refreshVotes() {
    trpcClient.fto.getProjectVotes
      .query({ pair: pairAddress as string })
      .then((data) => {
        setVotes(data);
      });
  }

  return (
    <div className="px-6 xl:max-w-[1200px] mx-auto">
      {state.pair.value && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <UpdateProjectModal pair={state.pair.value}></UpdateProjectModal>
        </Modal>
      )}
      <Breadcrumbs
        breadcrumbs={[
          {
            title: "Projects",
            href: "/launch",
          },
          {
            title: state.pair.value?.launchedToken.displayName || "-",
            href: "/launch-token",
          },
        ]}
      ></Breadcrumbs>
      <div className="flex justify-center mt-[24px]">
        <div className="flex gap-[20px] flex-wrap min-h-[425px]">
          <div className="flex-1 flex basis-full sm:basis-0 w-full sm:min-w-[500px] flex-col items-center  shrink-0 [background:#271B0C] rounded-2xl">
            <div className="flex h-[119px] shrink-0 self-stretch [background:radial-gradient(50%_50%_at_50%_50%,#9D5E28_0%,#FFCD4D_100%)] rounded-[12px_12px_0px_0px]"></div>
            <div className="relative flex-1 w-full h-full px-[29px] pb-[26px]">
              <TokenStatusDisplay pair={state.pair.value} />
              <div className=" relative translate-y-[-50%] w-[65px] h-[65px] [background:#271B0C] rounded-[11.712px] overflow-hidden">
                <div className="w-full h-full flex items-center justify-center [background:#ECC94E] rounded-[11.712px] overflow-hidden">
                  <Image
                    src={
                      !!state.pair.value?.logoUrl
                        ? state.pair.value.logoUrl
                        : "/images/project_honey.png"
                    }
                    alt="honey"
                    fill
                  ></Image>
                </div>
              </div>
              <div className="flex flex-col gap-[16px]">
                <div>
                  <div>
                    <div className="text-[rgba(255,255,255,0.66)] text-base font-medium leading-[normal]">
                      {state.pair.value?.launchedToken.displayName}
                    </div>
                    <div className="text-white text-[32px] font-medium leading-[normal]">
                      {state.pair.value?.projectName}
                    </div>
                  </div>
                  <div></div>
                </div>
                <div>{state.pair.value?.description}</div>
                <div>
                  {state.pair.value && (
                    <Action pair={state.pair.value}></Action>
                  )}
                </div>
                <div className="flex gap-[10px] justify-center">
                  {state.pair.value?.socials.map((social) => {
                    return social.name === "website" ? (
                      <PopUp
                        info="warning"
                        trigger={
                          <div key={social.name}>
                            <span className="cursor-pointer">
                              <Image
                                src={social.icon}
                                width={23}
                                height={23}
                                alt={social.name}
                              ></Image>
                            </span>
                          </div>
                        }
                        contents={
                          <div>
                            <h2 className="text-red-500 text-[2rem]">
                              Caution!
                            </h2>
                            <p>
                              This project is not verified, are you sure you
                              want to proceed to the website?
                            </p>
                            <div className="flex justify-end">
                              <Link
                                className="text-blue-500 text-right flex"
                                href={social.link}
                                target="_blank"
                              >
                                <Button>
                                  Proceed
                                  <BiLinkExternal />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        }
                      ></PopUp>
                    ) : (
                      <div key={social.name}>
                        <Link href={social.link} target="_blank">
                          <Image
                            src={social.icon}
                            width={23}
                            height={23}
                            alt={social.name}
                          ></Image>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
              {state.pair.value?.launchedToken.address && (
                <span className="flex justify-end flex-row ml-2 absolute right-4 bottom-4">
                  <ShareSocialMedialPopUp
                    shareUrl={window.location.href}
                    shareText={
                      "Checkout our Token " + state.pair.value?.projectName
                    }
                    text="share this project"
                  />
                </span>
              )}
            </div>
          </div>
          <div className="text-left relative flex-1 flex basis-full w-full sm:basis-0 sm:min-w-[500px]  flex-col gap-[10px] shrink-0 [background:#271B0C] rounded-2xl py-[12px] px-[24px]">
            <div className="flex absolute right-[24px] top-[12px]">
              <OptionsDropdown
                className=""
                options={[
                  optionsPresets.copy({
                    copyText: state.pair?.value?.launchedToken.address ?? "",
                    displayText: "Copy Token address",
                    copysSuccessText: "Token address copied",
                  }),
                  optionsPresets.share({
                    shareUrl: `${window.location.origin}/launch-detail/${state.pair?.value?.address}`,
                    displayText: "Share this project",
                    shareText:
                      "Checkout this Token: " + state.pair?.value?.projectName,
                  }),
                  {
                    icon: <BiWallet />,
                    display: "Import token to wallet",
                    onClick: () => {
                      state.pair?.value?.launchedToken.watch();
                    },
                  },
                  {
                    icon: <LuFileEdit />,
                    display: "Update Project",
                    onClick: () => {
                      if (!state.pair.value) return;

                      if (
                        state.pair.value.provider.toLowerCase() !==
                        wallet.account.toLowerCase()
                      ) {
                        toast.warning("You are not the owner of this project");
                        return;
                      }

                      onOpen();
                    },
                  },
                ]}
              />
            </div>
            <div>
              {/* <Button
                onClick={() => {
                  fetch("/api/fto/updatefto", {
                    method: "POST",
                    body: JSON.stringify({
                      twitter: "https://twitter.com/123",
                      telegram: "https://t.me/1234",
                      website: "https://12345",
                      description: "description",
                      projectName: "projectName",
                      pair: state.pair.value?.address,
                      chain_id: wallet.currentChainId,
                      creator_api_key: "7523695c-ba97-43bf-bd0c-5740cfddd532",
                    }),
                  }).then((res) => {
                    console.log(res);
                    res.json().then((data) => {
                      console.log(data);
                    });
                  });
                }}
              >
                test
              </Button> */}
              <div className="text-[rgba(255,255,255,0.66)] text-[15.958px] font-bold leading-[normal]">
                Token Raised
              </div>{" "}
              <div className="text-[color:var(--Button-Gradient,var(--card-stroke,#F7931A))] text-[16.727px] font-normal leading-[normal]">
                {amountFormatted(state.pair.value?.depositedRaisedToken, {
                  decimals: 0,
                  fixed: 3,
                })}{" "}
                {state.pair.value?.raiseToken.displayName}
              </div>
            </div>
            {/* // TODO: raised progress */}
            {/* <div></div> */}
            <div>
              <div className="text-[rgba(255,255,255,0.66)] text-sm font-medium leading-[normal]">
                Token address
              </div>
              <div className="mt-[8px] flex  h-[41px] justify-between items-center [background:#3B2912] px-3 py-0 rounded-[10px]">
                {state.pair.value?.launchedToken.address}{" "}
              </div>
            </div>

            <div className="grid grid-cols-3">
              <div>
                <div className="flex gap-[4px] text-white text-[12.165px] font-bold leading-[normal]">
                  <Image
                    src="/images/wallet.png"
                    alt="price"
                    width={12}
                    height={12}
                  ></Image>
                  Token Price
                </div>
                <div className="text-[#FFCD4D]  text-base font-medium leading-[normal] mt-[4px]">
                  {amountFormatted(state.pair.value?.price, {
                    decimals: 0,
                    fixed: 3,
                    prefix: "$",
                  })}
                </div>
              </div>
              <div>
                <div className="flex gap-[4px] text-white  text-[12.165px] font-bold leading-[normal]">
                  <Image
                    src="/images/calendar.png"
                    alt="price"
                    width={12}
                    height={12}
                  ></Image>
                  Start Date
                </div>
                <div className="text-[#FFCD4D]  text-base font-medium leading-[normal] mt-[4px]">
                  {state.pair.value?.startTimeDisplay
                    ? new Date(
                        state.pair.value?.startTimeDisplay
                      ).toLocaleString()
                    : "--"}
                </div>
              </div>
              <div>
                <div className="flex gap-[4px] text-white  text-[12.165px] font-bold leading-[normal]">
                  <Image
                    src="/images/calendar.png"
                    alt="price"
                    width={12}
                    height={12}
                  ></Image>
                  End Date
                </div>
                <div className="text-[#FFCD4D]  text-base font-medium leading-[normal] mt-[4px]">
                  {state.pair.value?.endTimeDisplay
                    ? new Date(
                        state.pair.value?.endTimeDisplay
                      ).toLocaleString()
                    : "--"}
                </div>
              </div>
            </div>
            <p>Token Vote</p>
            <hr />
            <div className="flex gap-5">
              {Object.entries(votes).map(([key, value]) => {
                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (!wallet.account || !state.pair.value?.address) return;

                      trpcClient.fto.createOrUpdateProjectVotes
                        .mutate({
                          project_pair: state.pair.value?.address,
                          wallet_address: wallet.account,
                          vote: key.split("_")[0],
                        })
                        .then(() => {
                          refreshVotes();
                        });
                    }}
                    className="mt-[8px] flex-1 flex flex-col  justify-center items-center [background:#3B2912] px-3 py-3 rounded-[10px] hover:[background:#FFCD4D] active:[background:#F0A000] cursor-pointer select-none"
                  >
                    <p>
                      {(key.split("_")[0] === "rocket" && "🚀") ||
                        (key.split("_")[0] === "fire" && "🔥") ||
                        (key.split("_")[0] === "poo" && "💩") ||
                        (key.split("_")[0] === "flag" && "🚩")}
                    </p>
                    <p>{value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LaunchPage;
