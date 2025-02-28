import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState, useCallback } from "react";
import launchpad from "@/services/launchpad";
import { NextLayoutPage } from "@/types/nextjs";
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
import { chart } from "@/services/chart";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import { WrappedToastify } from "@/lib/wrappedToastify";
import Action from "./components/Action";
import Tabs from "./components/Tabs";
import ProjectTitle from "./components/ProjectTitle";
import KlineChart from "./components/KlineChart";
import { LaunchDataProgress } from "./components/LaunchDataProgress";
import { cn } from "@/lib/tailwindcss";
import CardContainer from "@/components/CardContianer/v3";
import ProjectDescription from "./components/ProjectDescription";
import ProjectStats from "./components/ProjectStats";
import { useLaunchTokenQuery } from "@/lib/hooks/useLaunchTokenQuery";
import { Pot2Pump } from "@/lib/algebra/graphql/generated/graphql";
import { pot2PumpToMemePair } from "@/lib/algebra/graphql/clients/pair";
import { chain } from "@/services/chain";

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

    const inputBaseClass =
      "w-full bg-white rounded-[12px] md:rounded-[16px] px-3 md:px-4 py-2 md:py-[18px] text-black outline-none border border-black shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] placeholder:text-black/50 text-sm md:text-base font-medium h-[40px] md:h-[60px]";

    const labelBaseClass = "text-black text-sm md:text-base font-medium";

    const FormBody = observer(({ onClose }: any) => (
      <>
        <ModalHeader className="flex flex-col gap-1 text-black">
          Update {pair.launchedToken?.displayName}
        </ModalHeader>
        <ModalBody>
          <div className="w-full rounded-[24px] md:rounded-[32px] bg-white space-y-5 px-4 md:px-8 py-4 md:py-6 custom-dashed">
            {/* <div className="flex flex-col gap-4">
              <UploadImage
                blobName={pair.address + "_logo"}
                imagePath={
                  !!pair.logoUrl ? pair.logoUrl : "/images/project_honey.png"
                }
                onUpload={async (url) => {
                  console.log(url);
                  await launchpad.updateProjectLogo.call({
                    logo_url: url,
                    pair: pair.address,
                    chain_id: wallet.currentChainId,
                  });
                  pair.logoUrl = url;
                }}
              />
              <div className="text-black opacity-50 text-center text-sm">
                Click icon to upload new token icon
              </div>
            </div> */}
            <div className="flex flex-col gap-2">
              <label className={labelBaseClass}>Project Name</label>
              <input
                type="text"
                {...register("projectName", {
                  value: pair.projectName,
                  required: "Project name is required",
                })}
                className={inputBaseClass}
                placeholder="Enter project name"
              />
              {errors.projectName && (
                <span className="text-red-500 text-sm">
                  {errors.projectName.message as any}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelBaseClass}>Description</label>
              <input
                type="text"
                {...register("description", {
                  value: pair.description,
                  required: "Description is required",
                })}
                className={inputBaseClass}
                placeholder="Enter description"
              />
              {errors.description && (
                <span className="text-red-500 text-sm">
                  {errors.description.message as any}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelBaseClass}>
                Twitter <span className="text-black/50">(Optional)</span>
              </label>
              <input
                type="text"
                {...register("twitter", {
                  value: pair.twitter,
                })}
                className={inputBaseClass}
                placeholder="Enter Twitter URL"
              />
              {errors.twitter && (
                <span className="text-red-500 text-sm">
                  {errors.twitter.message as any}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelBaseClass}>
                Website <span className="text-black/50">(Optional)</span>
              </label>
              <input
                type="text"
                {...register("website", {
                  value: pair.website,
                })}
                className={inputBaseClass}
                placeholder="Enter website URL"
              />
              {errors.website && (
                <span className="text-red-500 text-sm">
                  {errors.website.message as any}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelBaseClass}>
                Telegram <span className="text-black/50">(Optional)</span>
              </label>
              <input
                type="text"
                {...register("telegram", {
                  value: pair.telegram,
                })}
                className={inputBaseClass}
                placeholder="Enter Telegram URL"
              />
              {errors.telegram && (
                <span className="text-red-500 text-sm">
                  {errors.telegram.message as any}
                </span>
              )}
            </div>
            <Button
              isLoading={launchpad.updateProject.loading}
              className="bg-black text-white font-bold border-2 border-black hover:bg-black/90 w-full"
              onPress={async () => {
                handleSubmit(async (data) => {
                  await launchpad.updateProject.call({
                    pair: pair.address,
                    chain_id: chain.currentChainId,
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
          </div>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </>
    ));
    return (
      <ModalContent className="bg-[#FFCD4D]">
        {(onClose) => <FormBody onClose={onClose}></FormBody>}
      </ModalContent>
    );
  }
);

const MemeView = observer(() => {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { pair: launchTokenAddress } = router.query;

  const { data: pairData, loading: pot2PumpLoading } = useLaunchTokenQuery(
    launchTokenAddress as string
  );

  const pair = useMemo(() => {
    if (pairData?.pot2Pumps?.[0]) {
      return pot2PumpToMemePair(pairData.pot2Pumps[0] as Partial<Pot2Pump>);
    }
  }, [pairData]);

  // remind provider to edit project details
  useEffect(() => {
    if (!pair || !pair.isInit || !pair.isProvider) return;

    if (
      !pair.logoUrl ||
      !pair.projectName ||
      !pair.description ||
      !pair.twitter ||
      !pair.website ||
      !pair.telegram
    ) {
      WrappedToastify.warn({
        message: (
          <div>
            <ul className="list-disc list-inside">
              {!pair.logoUrl && <li className="text-orange-400">no icon</li>}
              {!pair.projectName && (
                <li className="text-orange-400">no project name</li>
              )}
              {!pair.description && (
                <li className="text-orange-400">no description</li>
              )}
              {!pair.twitter && (
                <li className="text-orange-400">no twitter link</li>
              )}
              {!pair.website && (
                <li className="text-orange-400">no website link</li>
              )}
              {!pair.telegram && (
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
  }, [pair, onOpen, router.query.edit, router]);

  useEffect(() => {
    if (!pair?.launchedToken) {
      return;
    }
    chart.setCurrencyCode("USD");
    chart.setTokenNumber(0);
    chart.setChartTarget(pair.launchedToken);
    chart.setChartLabel(pair.launchedToken?.displayName + "/USD");
  }, [pair, pair?.launchedToken]);

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 xl:px-0 space-y-4 md:space-y-8 xl:max-w-[1200px] 2xl:max-w-[1500px] mx-auto">
      <CardContainer type="default" showBottomBorder={false}>
        {pair && (
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            classNames={{
              body: "bg-[#FFCD4D]",
              header: "bg-[#FFCD4D]",
              footer: "bg-[#FFCD4D]",
              closeButton: "hover:bg-black/5",
              base: "max-h-[70vh] overflow-y-auto",
            }}
          >
            <UpdateProjectModal pair={pair}></UpdateProjectModal>
          </Modal>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-4 md:gap-x-4 md:gap-y-14 w-full @container">
          <div
            className={cn(
              "relative bg-white col-span-1 lg:col-span-2 px-2 sm:px-4 md:px-8 py-3 md:py-5 rounded-xl sm:rounded-3xl",
              "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 text-[#202020]"
            )}
          >
            <ProjectTitle
              className="col-span-1"
              pair={pair ?? undefined}
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
            <ProjectDescription
              className="col-span-1"
              description={pair?.description}
            />
            <ProjectStats className="col-span-1" pair={pair} />
          </div>

          <CardContainer
            variant="dark"
            loading={!pair}
            loadingSize={200}
            loadingText="Loading Data..."
            className={cn("relative min-h-[500px] px-1 sm:px-2 md:px-4")}
          >
            {pair?.state === 0 && (
              <div className="md:block w-full">
                <KlineChart height={500} />
              </div>
            )}

            {pair?.state === 1 && (
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

            {pair?.state === 3 && <LaunchDataProgress pair={pair} />}
          </CardContainer>

          <div className="bg-transparent rounded-2xl space-y-3 col-span-1">
            {wallet.isInit && pair && (
              <Action pair={pair} refreshTxsCallback={triggerRefresh} />
            )}
          </div>
        </div>

        <div className="mt-6 md:mt-16 w-full">
          {pair && <Tabs pair={pair} refreshTrigger={refreshTrigger} />}
        </div>
      </CardContainer>
    </div>
  );
});

const LaunchPage: NextLayoutPage = observer(() => {
  return <MemeView />;
});

export default LaunchPage;
