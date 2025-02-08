import { useRouter } from "next/router";
import { Logo } from "@/components/svg/logo";
import { observer, useLocalObservable } from "mobx-react-lite";
import { useEffect, useMemo, useState, useCallback } from "react";
import launchpad from "@/services/launchpad";
import { NextLayoutPage } from "@/types/nextjs";
import { AsyncState } from "@/services/utils";
import { FtoPairContract } from "@/services/contract/launches/fto/ftopair-contract";
import { wallet } from "@/services/wallet";
import { Button } from "@/components/button/button-next";
import Image from "next/image";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpcClient } from "@/lib/trpc";
import PairStatus from "@/components/atoms/TokenStatusDisplay/PairStatus";
import { UploadImage } from "@/components/UploadImage/UploadImage";
import { useAccount } from "wagmi";
import { chart } from "@/services/chart";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import { WrappedToastify } from "@/lib/wrappedToastify";
import Action from "./components/Action";
import Tabs from "./components/Tabs";
import CountdownTimer from "./components/Countdown";
import ProjectTitle from "./components/ProjectTitle";
import TokenRaised from "./components/TokenRaised";
import SaleProgress from "./components/SaleProgress";
import TokenAddress from "./components/TokenAddress";
import TokenDetails from "./components/TokenDetails";
import KlineChart from "./components/KlineChart";
import { LaunchDataProgress } from "./components/LaunchDataProgress";
import { cn } from "@/lib/tailwindcss";
import { DynamicFormatAmount } from "@/lib/algebra/utils/common/formatAmount";

export const UpdateProjectModal = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
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
          Update {pair.launchedToken?.displayName}
        </ModalHeader>
        <ModalBody>
          <div>
            <div className="relative w-full h-[5rem] border-dashed border-amber-950 hover:border-amber-500 border-3 rounded-2xl mb-5  transition-all text-white hover:text-amber-500">
              <UploadImage
                imagePath={pair.bannerUrl}
                blobName={pair.address + "_banner"}
                onUpload={async (url) => {
                  console.log(url);
                  await launchpad.updateProjectBanner.call({
                    banner_url: url,
                    pair: pair.address,
                    chain_id: wallet.currentChainId,
                  });
                  pair.bannerUrl = url;
                }}
                variant="banner"
              ></UploadImage>{" "}
              <h3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold pointer-events-none">
                Upload Banner
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              <UploadImage
                imagePath={
                  !!pair.logoUrl ? pair.logoUrl : "/images/project_honey.png"
                }
                blobName={pair.address + "_logo"}
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
              <div className="text align opacity-50 text-center">
                Click icon to upload new token icon
              </div>
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
            isLoading={launchpad.updateProject.loading}
            color="primary"
            onPress={async () => {
              handleSubmit(async (data) => {
                await launchpad.updateProject.call({
                  pair: pair.address,
                  chain_id: wallet.currentChainId,
                  projectName: data.projectName,
                  description: data.description,
                  twitter: data.twitter || "",
                  website: data.website || "",
                  telegram: data.telegram || "",
                });
                if (launchpad.updateProject.error) {
                  WrappedToastify.error({
                    message: "Update failed",
                    title: "Update Project Detail",
                  });
                  return;
                }
                await pair.getProjectInfo();
                WrappedToastify.success({
                  message: "Update success",
                  title: "Update Project Detail",
                });
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
  }
);

// const FtoView = observer(() => {
//   const router = useRouter();
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const triggerRefresh = useCallback(() => {
//     setRefreshTrigger((prev) => prev + 1);
//   }, []);

//   const { isOpen, onOpen, onOpenChange } = useDisclosure();
//   const { pair: pairAddress } = router.query;
//   const [votes, setVotes] = useState({
//     rocket_count: 0,
//     fire_count: 0,
//     poo_count: 0,
//     flag_count: 0,
//   });
//   const state = useLocalObservable(() => ({
//     pair: new AsyncState(async ({ pairAddress }: { pairAddress: string }) => {
//       const pairInfo = await trpcClient.projects.getProjectInfo.query({
//         pair: pairAddress,
//         chain_id: wallet.currentChainId,
//       });

//       const pair =
//         pairInfo?.project_type === "meme"
//           ? new MemePairContract({ address: pairAddress as string })
//           : new FtoPairContract({ address: pairAddress as string });
//       console.log(pair);
//       await pair.init();
//       pair.raiseToken?.init(true, {
//         loadIndexerTokenData: true,
//       });
//       pair.launchedToken?.init(true, {
//         loadIndexerTokenData: true,
//       });
//       return pair;
//     }),
//   }));

//   const account = useAccount();

//   // remind provider to edit project details
//   useEffect(() => {
//     if (
//       !state.pair.value ||
//       !state.pair.value.isInit ||
//       !state.pair.value.isProvider
//     )
//       return;

//     if (
//       !state.pair.value.logoUrl ||
//       !state.pair.value.projectName ||
//       !state.pair.value.description ||
//       !state.pair.value.twitter ||
//       !state.pair.value.website ||
//       !state.pair.value.telegram
//     ) {
//       WrappedToastify.warn({
//         message: (
//           <div>
//             <ul className="list-disc list-inside">
//               {!state.pair.value.logoUrl && (
//                 <li className="text-orange-400">no icon</li>
//               )}
//               {!state.pair.value.projectName && (
//                 <li className="text-orange-400">no project name</li>
//               )}
//               {!state.pair.value.description && (
//                 <li className="text-orange-400">no description</li>
//               )}
//               {!state.pair.value.twitter && (
//                 <li className="text-orange-400">no twitter link</li>
//               )}
//               {!state.pair.value.website && (
//                 <li className="text-orange-400">no website link</li>
//               )}
//               {!state.pair.value.telegram && (
//                 <li className="text-orange-400">no telegram link</li>
//               )}
//             </ul>
//             <p>
//               Click{" "}
//               <span
//                 onClick={() => {
//                   onOpen();
//                   toast.dismiss();
//                 }}
//                 className="text-blue-500 cursor-pointer"
//               >
//                 here
//               </span>{" "}
//               to update the project
//             </p>
//           </div>
//         ),
//         options: {
//           autoClose: false,
//         },
//       });
//       return () => toast.dismiss();
//     }
//   }, [
//     pairAddress,
//     account.address,
//     state.pair.value?.isProvider,
//     state.pair.value,
//     onOpen,
//   ]);

//   useEffect(() => {
//     if (!wallet.isInit || !pairAddress) {
//       return;
//     }
//     state.pair
//       .call({
//         pairAddress: pairAddress as string,
//       })
//       .then(() => {
//         console.log("social: ", state.pair.value?.socials);
//       });

//     refreshVotes();
//   }, [wallet.isInit, pairAddress]);

//   useEffect(() => {
//     if (!state.pair.value) {
//       return;
//     }
//     chart.setCurrencyCode("USD");
//     chart.setTokenNumber(0);
//     chart.setChartTarget(state.pair.value?.launchedToken ?? undefined);
//     chart.setChartLabel(state.pair.value?.launchedToken?.displayName + "/USD");
//   }, [state.pair.value]);

//   const pair = useMemo(() => state.pair.value, [state.pair.value]);

//   // useEffect(() => {
//   //   if (!state.pair.value) return;
//   //   if (router.query.edit == "true" && state.pair.value?.isProvider) {
//   //     onOpen();
//   //   }
//   // }, [onOpen, router.query, state.pair.value, state.pair.value?.isProvider]);

//   function refreshVotes() {
//     trpcClient.projects.getProjectVotes
//       .query({ pair: pairAddress as string })
//       .then((data) => {
//         setVotes(data);
//       });
//   }

//   return (
//     <div className="px-2 md:px-6 xl:max-w-[1200px] mx-auto pb-[20vh]">
//       {state.pair.value && (
//         <Modal
//           isOpen={isOpen}
//           onOpenChange={onOpenChange}
//           classNames={{
//             base: "max-h-[70vh] overflow-y-scroll",
//           }}
//         >
//           <UpdateProjectModal pair={state.pair.value}></UpdateProjectModal>
//         </Modal>
//       )}
//       <div className="grid grid-cols-2 gap-4 xl:w-[1170px]">
//         <div className="bg-[#271A0C] col-span-2 px-5 py-2.5 rounded-[30px] flex md:items-center md:justify-between md:flex-row flex-col gap-2 md:gap-0">
//           <div className="flex items-center gap-x-4 md:gap-x-[7.5px]">
//             <div className="size-10 md:size-[77px] bg-[#ECC94E] flex items-center justify-center rounded-full">
//               <Image
//                 alt={state.pair.value?.launchedToken?.name || "honey"}
//                 width={state.pair.value?.logoUrl ? 77 : 44}
//                 height={state.pair.value?.logoUrl ? 77 : 44}
//                 className="rounded-full hidden md:inline-block"
//                 src={
//                   !!state.pair.value?.logoUrl
//                     ? state.pair.value.logoUrl
//                     : "/images/project_honey.png"
//                 }
//               />
//               <Image
//                 alt={state.pair.value?.launchedToken?.name || "honey"}
//                 width={20}
//                 height={20}
//                 className="rounded-full md:hidden"
//                 src={
//                   !!state.pair.value?.logoUrl
//                     ? state.pair.value.logoUrl
//                     : "/images/project_honey.png"
//                 }
//               />
//             </div>
//             <ProjectTitle
//               name={pair?.launchedToken?.name}
//               displayName={pair?.launchedToken?.displayName}
//               telegram={pair?.telegram}
//               twitter={pair?.twitter}
//               website={pair?.website}
//               address={pair?.launchedToken?.address}
//               statusColor={pair?.ftoStatusDisplay?.color}
//               status={pair?.ftoStatusDisplay?.status}
//               isValidated={pair?.isValidated}
//             />
//           </div>
//           <div className="flex items-center md:gap-x-8 gap-x-0 justify-between md:justify-start">
//             <CountdownTimer
//               endTime={pair?.endTime}
//               ftoState={state.pair.value?.state}
//               endTimeDisplay={state.pair.value?.endTimeDisplay}
//             />
//             <PairStatus
//               statusColor={pair?.ftoStatusDisplay?.color}
//               status={pair?.ftoStatusDisplay?.status}
//               isValidated={pair?.isValidated}
//             />
//           </div>
//         </div>
//         <div className="bg-[#271A0C] p-5 rounded-2xl space-y-3 col-span-2 lg:col-span-1">
//           <TokenRaised
//             depositedRaisedToken={pair?.depositedRaisedToken}
//             raiseTokenDerivedUSD={pair?.raiseToken?.derivedUSD}
//             raisedTokenMinCap={pair?.raiseToken?.balance}
//             raiseTokenDecimals={pair?.raiseToken?.decimals}
//           />

//           <SaleProgress
//             ftoStatusDisplayStatus={pair?.ftoStatusDisplay?.status}
//             raiseTokenBalance={pair?.raiseToken?.balance}
//             raiseTokenDecimals={pair?.raiseToken?.decimals}
//             depositedRaisedToken={pair?.depositedRaisedToken}
//             raiseTokenSymbol={pair?.raiseToken?.symbol || ""}
//           />

//           <TokenAddress address={pair?.launchedToken?.address} />

//           <TokenDetails
//             price={pair?.price}
//             depositedRaisedToken={pair?.depositedRaisedToken}
//             startTimeDisplay={pair?.startTimeDisplay}
//             endTimeDisplay={pair?.endTimeDisplay}
//           />

//           <hr />
//           <p className="text-white/65 text-sm mt-2.5">Rank Project</p>
//           <div className="flex gap-5">
//             {Object.entries(votes).map(([key, value]) => {
//               return (
//                 <div
//                   key={key}
//                   onClick={() => {
//                     if (!wallet.account || !state.pair.value?.address) return;

//                     trpcClient.projects.createOrUpdateProjectVotes
//                       .mutate({
//                         project_pair: state.pair.value?.address,
//                         wallet_address: wallet.account,
//                         vote: key.split("_")[0],
//                       })
//                       .then(() => {
//                         refreshVotes();
//                       });
//                   }}
//                   className="mt-[8px] flex-1 flex flex-col  justify-center items-center [background:#3B2912] px-3 py-3 rounded-[10px] hover:[background:#FFCD4D] active:[background:#F0A000] cursor-pointer select-none"
//                 >
//                   <p>
//                     {(key.split("_")[0] === "rocket" && "🚀") ||
//                       (key.split("_")[0] === "fire" && "🔥") ||
//                       (key.split("_")[0] === "poo" && "💩") ||
//                       (key.split("_")[0] === "flag" && "🚩")}
//                   </p>
//                   <p>{value}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//         <div className="bg-[#271A0C] p-5 rounded-2xl space-y-3 col-span-2 lg:col-span-1">
//           {pair && <Action pair={pair} refreshTxsCallback={triggerRefresh} />}
//         </div>
//       </div>

//       <div className="w-full flex items-center justify-between my-4 md:my-12">
//         <div className="text-lg md:text-xl">Project Details</div>
//         <div className="flex items-center gap-x-1">
//           <Logo />
//           <span className='text-[#FFCD4D] [font-family:"Bebas_Neue"] text-lg md:text-3xl'>
//             Honeypot Finance
//           </span>
//         </div>
//       </div>

//       <Tabs pair={pair} refreshTrigger={refreshTrigger} />
//     </div>
//   );
// });

const MemeView = observer(({ pairAddress }: { pairAddress: string }) => {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const state = useLocalObservable(() => ({
    pair: new AsyncState(async ({ pairAddress }: { pairAddress: string }) => {
      const pair = MemePairContract.loadContract(pairAddress, {
        address: pairAddress as string,
      });

      await pair.init({ force: true });

      pair.raiseToken?.init(false, {
        loadIndexerTokenData: true,
      });

      pair.launchedToken?.init(false, {
        loadIndexerTokenData: true,
      });

      return pair;
    }),
  }));

  const account = useAccount();

  // remind provider to edit project details
  useEffect(() => {
    if (
      !state.pair.value ||
      !state.pair.value.isInit ||
      !state.pair.value.isProvider
    )
      return;

    if (
      !state.pair.value.logoUrl ||
      !state.pair.value.projectName ||
      !state.pair.value.description ||
      !state.pair.value.twitter ||
      !state.pair.value.website ||
      !state.pair.value.telegram
    ) {
      WrappedToastify.warn({
        message: (
          <div>
            <ul className="list-disc list-inside">
              {!state.pair.value.logoUrl && (
                <li className="text-orange-400">no icon</li>
              )}
              {!state.pair.value.projectName && (
                <li className="text-orange-400">no project name</li>
              )}
              {!state.pair.value.description && (
                <li className="text-orange-400">no description</li>
              )}
              {!state.pair.value.twitter && (
                <li className="text-orange-400">no twitter link</li>
              )}
              {!state.pair.value.website && (
                <li className="text-orange-400">no website link</li>
              )}
              {!state.pair.value.telegram && (
                <li className="text-orange-400">no telegram link</li>
              )}
            </ul>
            <p>
              Click{" "}
              <span
                onClick={() => {
                  onOpen();
                  toast.dismiss();
                }}
                className="text-blue-500 cursor-pointer"
              >
                here
              </span>{" "}
              to update the project
            </p>
          </div>
        ),
        options: {
          autoClose: false,
        },
      });
      return () => toast.dismiss();
    }
  }, [
    pairAddress,
    account.address,
    state.pair.value?.isProvider,
    state.pair.value,
    onOpen,
    router.query.edit,
    router,
  ]);
  useEffect(() => {
    if (!wallet.isInit || !pairAddress) {
      return;
    }

    state.pair.call({
      pairAddress: pairAddress as string,
    });
  }, [wallet.isInit, pairAddress]);

  useEffect(() => {
    if (!state.pair.value?.launchedToken) {
      return;
    }
    chart.setCurrencyCode("USD");
    chart.setTokenNumber(0);
    chart.setChartTarget(state.pair.value.launchedToken);
    chart.setChartLabel(state.pair.value.launchedToken?.displayName + "/USD");
    console.log("chart", chart);
  }, [state.pair.value, state.pair.value?.launchedToken]);

  const pair = useMemo(() => state.pair.value, [state.pair.value]);

  return (
    <div className="w-full px-4 md:px-8 xl:px-0 space-y-4 md:space-y-8">
      <div className="px-4 md:px-8 xl:max-w-[min(1500px,100%)] mx-auto pb-20 relative pt-[90px] bg-[#202020] border-3 border-[#F2C34A] rounded-3xl overflow-hidden">
        <div className="bg-[url('/images/pumping/outline-border.png')] h-[90px] absolute top-0 left-0 w-full bg-contain bg-[left_-90px_top] bg-repeat-x"></div>
        {state.pair.value && (
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            classNames={{
              base: "max-h-[70vh] overflow-y-scroll",
            }}
          >
            <UpdateProjectModal pair={state.pair.value}></UpdateProjectModal>
          </Modal>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-4 md:gap-x-4 md:gap-y-14 w-full @container">
          <div
            className={cn(
              "bg-white col-span-1 lg:col-span-2 px-4 md:px-8 py-3 md:py-5 rounded-3xl flex md:items-center flex-col @[450px]:flex-row justify-between gap-2 md:gap-0 text-black"
            )}
          >
            <div className="flex items-center gap-x-4 md:gap-x-[7.5px] justify-center sm:justify-start">
              <div className="size-10 md:size-[77px] bg-[#ECC94E] flex items-center justify-center rounded-full">
                <Image
                  alt={state.pair.value?.launchedToken?.name || "honey"}
                  width={77}
                  height={0}
                  className="rounded-full hidden md:inline-block w-10 sm:w-[77px]"
                  src={
                    !!state.pair.value?.logoUrl
                      ? state.pair.value.logoUrl
                      : "/images/empty-logo.png"
                  }
                />
              </div>
              <ProjectTitle
                name={pair?.launchedToken?.name}
                displayName={pair?.launchedToken?.displayName}
                telegram={pair?.telegram}
                twitter={pair?.twitter}
                website={pair?.website}
                address={pair?.launchedToken?.address}
                statusColor={pair?.ftoStatusDisplay?.color}
                status={pair?.ftoStatusDisplay?.status}
                isValidated={pair?.isValidated}
              />
            </div>
            <div className="md:block hidden">
              {state.pair.value?.state !== 0 && (
                <CountdownTimer
                  endTime={pair?.endTime}
                  endTimeDisplay={state.pair.value?.endTimeDisplay}
                />
              )}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
              <div className="md:hidden block">
                {state.pair.value?.state !== 0 && (
                  <CountdownTimer
                    endTime={pair?.endTime}
                    endTimeDisplay={state.pair.value?.endTimeDisplay}
                  />
                )}
              </div>
              {state.pair.value?.state !== 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-3 text-xs">
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Current Raise
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      $
                      {Number(pair?.depositedRaisedToken || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Participants
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      {Number(pair?.participantsCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-x-3 md:gap-x-6 gap-y-2 md:gap-y-3 text-xs w-full md:w-[400px]">
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      24H
                    </span>
                    <span
                      className={cn(
                        "text-sm md:text-[15px] font-bold",
                        pair?.priceChangeDisplay?.startsWith("-")
                          ? "text-red-500"
                          : "text-green-500"
                      )}
                    >
                      {pair?.priceChangeDisplay}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      MCap
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      $
                      {Number(pair?.marketValue || 0).toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Price
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      $
                      {DynamicFormatAmount({
                        amount: pair?.launchedToken?.derivedUSD ?? "0",
                        decimals: 5,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Volume
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      $
                      {Number(
                        pair?.launchedToken?.volumeUSD || 0
                      ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      TVL
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      $
                      {Number(
                        pair?.launchedToken?.totalValueLockedUSD || 0
                      ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Position Count
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      {pair?.launchedToken?.poolCount || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Buys
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      {Number(
                        pair?.launchedTokenBuyCount || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Sells
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      {Number(
                        pair?.launchedTokenSellCount || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-[11px] text-[#5C5C5C]/60 uppercase">
                      Holders
                    </span>
                    <span className="text-sm md:text-[15px] font-bold">
                      {Number(
                        pair?.launchedToken?.holderCount || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              "bg-[#FFCD4D] min-h-[500px] md:min-h-[665px] px-4 py-6 rounded-2xl space-y-3 relative overflow-hidden col-span-1"
            )}
          >
            <div className="bg-[url('/images/pool-detail/top-border.svg')] bg-left-top h-6 absolute top-0 left-0 w-full bg-contain"></div>
            {state.pair.value?.state === 0 && (
              <div className="md:block">
                <KlineChart height={500} />
              </div>
            )}

            {state.pair.value?.state === 1 && (
              <div className="flex flex-col gap-y-3 md:gap-y-5">
                <div className="flex flex-col gap-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-black text-center w-full">
                    This Project has Failed!
                  </h2>
                  <Image
                    className="w-full h-auto"
                    src="/images/bera/deadfaceBear.webp"
                    width={1000}
                    height={0}
                    alt="dead face"
                  />
                </div>
              </div>
            )}

            {state.pair.value?.state === 3 && (
              <LaunchDataProgress pair={state.pair.value} />
            )}
            <div className="bg-[url('/images/pool-detail/bottom-border.svg')] bg-left-top h-6 absolute -bottom-1 left-0 w-full bg-repeat-x bg-auto"></div>
          </div>

          <div className="bg-transparent rounded-2xl space-y-3 col-span-1">
            {pair && <Action pair={pair} refreshTxsCallback={triggerRefresh} />}
          </div>
        </div>

        <div className="mt-6 md:mt-16">
          <Tabs pair={pair} refreshTrigger={refreshTrigger} />
        </div>
      </div>
      {/* <footer>
        <Image
          src="/images/pumping/toast-bear.png"
          width={1000}
          height={0}
          className="w-full h-auto mt-auto"
          alt="toast bear"
        />
      </footer> */}
    </div>
  );
});

const LaunchPage: NextLayoutPage = observer(() => {
  const router = useRouter();
  const { pair: pairAddress } = router.query;
  const [projectInfo, setProjectInfo] = useState<{
    name?: string | null;
    description?: string | null;
    provider?: string;
    project_type?: string | null;
    id?: number;
    twitter?: string | null;
    telegram?: string | null;
    website?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!pairAddress || !wallet.isInit) {
      return;
    }
    trpcClient.projects.getProjectInfo
      .query({
        pair: (pairAddress as string).toLowerCase(),
        chain_id: wallet.currentChainId,
      })
      .then((data) => {
        console.log("data", data);
        setProjectInfo(data);
      });
  }, [pairAddress, wallet.isInit]);

  return (
    <>
      {projectInfo && projectInfo?.project_type === "meme" && (
        <MemeView pairAddress={pairAddress as string} />
      )}
      {/* {projectInfo && projectInfo?.project_type === "fto" && (
        <FtoView></FtoView>
      )} */}
    </>
  );
});

export default LaunchPage;
