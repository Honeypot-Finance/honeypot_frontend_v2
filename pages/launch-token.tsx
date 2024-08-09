import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { observer, useLocalObservable } from "mobx-react-lite";
import { wallet } from "@/services/wallet";
import launchpad from "@/services/launchpad";
import { Button } from "@/components/button";
import { ViewSvg } from "@/components/svg/View";
import { NextLayoutPage } from "@/types/nextjs";
import { RocketSvg } from "@/components/svg/Rocket";
import { PeddingSvg } from "@/components/svg/Pedding";
import { ApprovedSvg } from "@/components/svg/Approved";
import { DreampadSvg } from "@/components/svg/Dreampad";
import { Select, SelectItem } from "@nextui-org/select";
import { now, getLocalTimeZone, fromDate } from "@internationalized/date";
// import { DatePicker } from "@/components/DatePicker";
import { dayjs } from "@/lib/dayjs";
import { Accordion, AccordionItem, DateValue } from "@nextui-org/react";
import { DatePicker } from "@nextui-org/date-picker";
import { useRouter } from "next/router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Copy } from "@/components/copy";
import { trpcClient } from "@/lib/trpc";

const positiveIntegerPattern = /^[1-9]\d*$/;
const minimumTimePattern = /^(6[1-9]|[7-9][0-9]|[1-9][0-9]{2,})$/;

const LaunchTokenPage: NextLayoutPage = observer(() => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const state = useLocalObservable(() => ({
    pairAddress: "",
    setPairAddress(pairAddress: string) {
      this.pairAddress = pairAddress;
    },
  }));
  const onSubmit = async (data: {
    provider: string;
    raisedToken: string;
    tokenName: string;
    tokenSymbol: string;
    tokenAmount: number;
    poolHandler: string;
    raisingCycle: DateValue;
  }) => {
    try {
      const pairAddress = await launchpad.createFTO({
        ...data,
        // @ts-ignore
        raisingCycle: Math.floor(
          (data.raisingCycle.toDate(getLocalTimeZone()).getTime() -
            Date.now()) /
            1000
        ),
      });
      state.setPairAddress(pairAddress);
      router.push(`/launch-detail/${pairAddress}`);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="md:p-6  md:max-w-full xl:max-w-[1200px] mx-auto">
      <Breadcrumbs
        breadcrumbs={[
          {
            title: "Projects",
            href: "/launch",
          },
          {
            title: "Launch Token",
            href: "/launch-token",
          },
        ]}
      ></Breadcrumbs>
      <div className=" flex items-center justify-center mt-[24px]">
        {launchpad.ftofactoryContract?.createFTO.loading ? (
          <div className="flex h-[566px] w-full sm:w-[583px] justify-center items-center [background:#121212] rounded-[54px]">
            <div className="flex flex-col items-center">
              <div className="relative">
                <PeddingSvg />
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <RocketSvg />
                </div>
              </div>
              <div className="text-gold-primary mt-[59px] font-bold">
                Transaction Pending
              </div>
              <div className="text-[#868B9A] mt-2 w-[250px] text-xs text-center">
                We have received your transaction just waiting for approval
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full sm:w-[580.188px] items-center border-[color:var(--Button-Gradient,#F7931A)] bg-[#291C0A] py-4 px-[5px] rounded-[54px] border-2">
            <div className="flex items-center gap-2">
              <DreampadSvg />
              <span>Dreampad</span>
            </div>
            <div className="mt-4 opacity-50 w-full sm:w-[409px] text-center mb-4 ">
              Launch your token within three steps.{" "}
              <span className="underline cursor-pointer">Read more </span>about
              Dreampad.
            </div>
            <form
              //@ts-ignore
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-[22px] w-full px-4 sm:w-auto sm:px-0"
            >
              <div className="flex-col gap-4 hidden">
                <label htmlFor="provider">Token Provider</label>
                {wallet.account && (
                  <input
                    type="text"
                    {...register("provider")}
                    defaultValue={wallet.account}
                    className="outline-none w-full sm:w-[522px] h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl cursor-not-allowed"
                  />
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div>Token Name</div>
                <input
                  type="text"
                  {...register("tokenName", { required: true })}
                  className="outline-none w-full sm:w-[522px] h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
                />
                {errors.tokenName && (
                  <span className="text-red-500">Token Name is required</span>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <div>Token Symbol</div>
                <input
                  type="text"
                  {...register("tokenSymbol", { required: true })}
                  className="outline-none w-full sm:w-[522px] h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
                />
                {errors.tokenSymbol && (
                  <span className="text-red-500">Token Symbol is required</span>
                )}
              </div>

              <Accordion variant="bordered">
                <AccordionItem
                  key="advanced"
                  aria-label="advanced"
                  title="Advanced Options"
                >
                  <div className="flex flex-col gap-4">
                    <div>Token Amount</div>
                    <input
                      type="text"
                      {...register("tokenAmount", {
                        required: "Token Amount is required",
                        pattern: {
                          value: positiveIntegerPattern,
                          message: "Token Amount should be a positive integer",
                        },
                      })}
                      className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
                      defaultValue={1_000_000}
                    />
                    {errors.tokenAmount && (
                      <span className="text-red-500">
                        {errors.tokenAmount.message as any}
                      </span>
                    )}
                  </div>
                  <div className="flex-col gap-4 hidden">
                    <label htmlFor="poolHandler">Pool Handler</label>
                    {wallet.currentChain?.contracts?.routerV2 && (
                      <input
                        defaultValue={wallet.currentChain?.contracts?.routerV2}
                        // defaultValue={'0x1a12as1212'}
                        type="text"
                        {...register("poolHandler", {})}
                        className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl cursor-not-allowed"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>Campaign End</div>
                    <Controller
                      control={control}
                      name="raisingCycle"
                      defaultValue={fromDate(
                        dayjs().add(48, "hour").toDate(),
                        getLocalTimeZone()
                      )}
                      render={({ field: { onChange, onBlur, value, ref } }) => {
                        return (
                          <DatePicker
                            ref={ref}
                            classNames={{
                              inputWrapper: "bg-transparent",
                            }}
                            hideTimeZone
                            showMonthAndYearPickers
                            onChange={onChange} // send value to hook form
                            minValue={now(getLocalTimeZone())}
                            onBlur={onBlur} // notify when input is touched/blur
                            value={value}
                          />
                        );
                      }}
                    ></Controller>
                    {errors.rasing_cycle && (
                      <span className="text-red-500">
                        {"Please select an end date"}
                      </span>
                    )}
                  </div>{" "}
                  <div className="flex flex-col gap-4">
                    <label htmlFor="raisedToken">Raised Token</label>
                    <Select
                      required
                      classNames={{
                        trigger:
                          "bg-transparent data-[hover=true]:bg-transparent",
                      }}
                      {...register("raisedToken", { required: true })}
                      defaultSelectedKeys={[
                        wallet.currentChain?.contracts.ftoTokens[0]
                          .address as string,
                      ]}
                      className="outline-none w-full  h-[60px] bg-[#2F200B] pl-3 pr-4 py-3 rounded-2xl"
                    >
                      {wallet.currentChain?.contracts.ftoTokens.map(
                        (token, idx) => (
                          <SelectItem
                            key={token.address as string}
                            value={token.address}
                          >
                            {token.symbol}
                          </SelectItem>
                        )
                      )}
                    </Select>
                    {errors.raisedToken && (
                      <span className="text-red-500">
                        Rasied Token is required
                      </span>
                    )}
                  </div>
                </AccordionItem>
              </Accordion>

              {(state.pairAddress && (
                <div className="flex items-center">
                  Pair Address:&nbsp;
                  <Link
                    className="text-primary"
                    href={`/launch-detail/${state.pairAddress}`}
                    target="_blank"
                  >
                    {state.pairAddress}
                  </Link>
                  <Copy className="ml-[8px]" value={state.pairAddress}></Copy>
                </div>
              )) || (
                <Button type="submit" className="text-black font-bold">
                  Launch Token
                </Button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

export default LaunchTokenPage;
