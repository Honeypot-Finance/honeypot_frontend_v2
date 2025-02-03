"use client";

import React from "react";
import Image from "next/image";
import CardContainer from "@/components/CardContianer/v3";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

const LBPDetailPage = () => {
  return (
    <div className="min-h-screen relative w-full font-gliker">
      <div className="container mx-auto max-w-[1320px] space-y-[72px]">
        <CardContainer showBottomBorder={false}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
            <div className="space-y-4 col-span-2">
              <div className="space-y-2">
                <div className="flex justify-center items-center w-[74px] h-[32px] bg-white rounded-[4px] border-[0.75px] border-[#202020] shadow-[1px_1px_0px_0px_#000] text-[14px]">
                  $OVL
                </div>

                <h1 className="text-[30px] text-[#0D0D0D] font-gliker text-stroke-0.5 text-stroke-white text-shadow-[1px_2px_0px_#AF7F3D]">
                  Overlay
                </h1>
                <p className="text-[#4D4D4D]">
                  Overlay uses a dynamic mint/burn model built around the $OVL
                  token to enable counterpart-free trades, solving the liquidity
                  problem that haunts exotic markets.
                </p>
              </div>

              <div className="rounded-[16px] border border-black bg-white shadow-[4px_4px_0px_0px_#D29A0D] p-4">
                <div className="divide-y divide-black">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#4D4D4D] text-xs">
                      Token Sale Type
                    </span>
                    <div className="text-[#202020] text-base flex items-center gap-1">
                      Fixed Price
                      <Image
                        src="/images/lbp-detail/logo/link.svg"
                        alt="link"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#4D4D4D] text-xs">
                      Network Chain
                    </span>
                    <div className="text-[#202020] text-base flex items-center gap-1">
                      Arbitrum
                      <Image
                        src="/images/lbp-detail/logo/arb.png"
                        alt="arbitrum"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#4D4D4D] text-xs">
                      Token Vesting
                    </span>
                    <div className="text-[#202020] text-base flex items-center gap-1">
                      None
                      <Image
                        src="/images/lbp-detail/logo/lock.svg"
                        alt="lock"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#4D4D4D] text-xs">
                      Launch Partner
                    </span>
                    <div className="text-[#202020] text-base flex items-center gap-1">
                      Honeypot Finance
                      <Image
                        src="/images/lbp-detail/logo/honeypot.png"
                        alt="honeypot"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#4D4D4D] text-xs">Round Type</span>
                    <div className="text-[#202020] text-base flex items-center gap-1">
                      Public
                      <Image
                        src="/images/lbp-detail/logo/person.svg"
                        alt="person"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Logo */}
            <Image
              src="/images/lbp-detail/overlay-logo.png"
              alt="Overlay Logo"
              className="relative w-full h-full object-contain col-span-3"
              width={500}
              height={500}
              priority
            />
          </div>
        </CardContainer>

        <CardContainer
          className="bg-transparent border-3 border-[#FFCD4D] px-8 grid grid-cols-6 gap-y-7 gap-x-6 items-start"
          showBottomBorder={false}
        >
          <div className="rounded-[24px] border-2 border-dashed border-black bg-white p-8 text-center col-span-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image
                src="/images/lbp-detail/logo/warning.svg"
                alt="warning"
                width={24}
                height={24}
              />
              <span className="font-bold text-[#FFCD4D] text-shadow-[1.081px_2.162px_0px_#AF7F3D] text-stroke-0.5 text-stroke-black text-2xl">
                Warning!
              </span>
            </div>
            <p className="text-[#4D4D4D] mb-4 text-xs w-[80%] mx-auto">
              Please be aware that engaging with a Token Sale on Fjord Foundry
              carries significant risk. The tokens acquired through Sales can
              potentially lose all value. Fjord Foundry assumes no
              responsibility for losses. Exercise caution and conduct thorough
              research (DYOR) before investing.
            </p>
            <p className="text-[#4D4D4D] mb-2 text-xs w-[80%] mx-auto">
              Additionally, third party curation is not an indicator of project
              quality and token value always investigate independently.
            </p>
            <button className="bg-white rounded-[16px] border border-black py-3 px-8 shadow-[4px_4px_0px_0px_#000000] mt-6">
              I Accept These Risks
            </button>
          </div>

          <CardContainer className="col-span-4">
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
                <div className="space-y-4">
                  <div className="bg-white rounded-[16px] border border-black p-5 shadow-[4px_4px_0px_0px_#D29A0D] hover:shadow-[2px_2px_0px_0px_#D29A0D] transition-shadow">
                    <div className="text-sm text-[#4D4D4D] mb-2 text-center">
                      Price per OVL
                    </div>
                    <div className="text-[24px] text-white text-shadow-[1.481px_2.963px_0px_#AF7F3D] text-stroke-1 text-stroke-black text-center">
                      0.281 USDC
                    </div>
                  </div>
                  <div className="bg-white rounded-[16px] border border-black p-5 shadow-[4px_4px_0px_0px_#D29A0D] hover:shadow-[2px_2px_0px_0px_#D29A0D] transition-shadow">
                    <div className="text-sm text-[#4D4D4D] mb-2 text-center">
                      Min/Max Allocation
                    </div>
                    <div className="text-[24px] text-white text-shadow-[1.481px_2.963px_0px_#AF7F3D] text-stroke-1 text-stroke-black text-center">
                      0 - 50K
                    </div>
                  </div>
                  <div className="bg-white rounded-[16px] border border-black p-5 shadow-[4px_4px_0px_0px_#D29A0D] hover:shadow-[2px_2px_0px_0px_#D29A0D] transition-shadow">
                    <div className="text-sm text-[#4D4D4D] mb-2 text-center">
                      Funds Raised
                    </div>
                    <div className="text-[24px] text-white text-shadow-[1.481px_2.963px_0px_#AF7F3D] text-stroke-1 text-stroke-black text-center">
                      $704.2k
                    </div>
                  </div>
                  <div className="bg-white rounded-[16px] border border-black p-5 shadow-[4px_4px_0px_0px_#D29A0D] hover:shadow-[2px_2px_0px_0px_#D29A0D] transition-shadow">
                    <div className="text-sm text-[#4D4D4D] mb-2 text-center">
                      FDV Marketcap
                    </div>
                    <div className="text-[24px] text-white text-shadow-[1.481px_2.963px_0px_#AF7F3D] text-stroke-1 text-stroke-black text-center">
                      $25M
                    </div>
                  </div>
                  <div className="bg-white rounded-[16px] border border-black p-5 shadow-[4px_4px_0px_0px_#D29A0D] hover:shadow-[2px_2px_0px_0px_#D29A0D] transition-shadow">
                    <div className="text-sm text-[#4D4D4D] mb-2 text-center">
                      Sale Marketcap
                    </div>
                    <div className="text-[24px] text-white text-shadow-[1.481px_2.963px_0px_#AF7F3D] text-stroke-1 text-stroke-black text-center">
                      $690.4k
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] border border-black border-dashed p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                      <thead>
                        <tr>
                          <th className="text-left text-xs text-[#4D4D4D] py-2">
                            Time
                          </th>
                          <th className="text-left text-xs text-[#4D4D4D] py-2">
                            Address
                          </th>
                          <th className="text-left text-xs text-[#4D4D4D] py-2">
                            Amount In
                          </th>
                          <th className="text-left text-xs text-[#4D4D4D] py-2">
                            Amount Out
                          </th>
                          <th className="text-left text-xs text-[#4D4D4D] py-2">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array(9)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index}>
                              <td className="text-sm text-[#4D4D4D] py-3 border-b border-black">
                                10 days ago
                              </td>
                              <td className="text-sm text-[#4D4D4D] font-mono py-3 border-b border-black">
                                0x2c73...7BA9
                              </td>
                              <td className="py-3 border-b border-black">
                                <div className="flex items-center gap-1">
                                  <Image
                                    src="/images/lbp-detail/logo/arb.png"
                                    alt="eth"
                                    width={16}
                                    height={16}
                                    className="inline-block"
                                  />
                                  <span className="text-[#4BC964] text-sm">
                                    2.2
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 border-b border-black">
                                <div className="flex items-center gap-1">
                                  <Image
                                    src="/images/lbp-detail/logo/arb.png"
                                    alt="token"
                                    width={16}
                                    height={16}
                                    className="inline-block"
                                  />
                                  <span className="text-sm">23.02k</span>
                                </div>
                              </td>
                              <td className="py-3 border-b border-black">
                                <span className="text-[#4BC964] text-sm">
                                  Buy
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-center mt-6 gap-4">
                    <button className="w-8 h-8 flex items-center justify-center text-base">
                      <HiOutlineChevronLeft size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center border border-black rounded-[4.571px] bg-[#FFCD4D] shadow-[1px_1px_0px_0px_#000] text-base font-bold">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base">
                      2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base">
                      3
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base">
                      4
                    </button>
                    <span className="text-base text-[#4D4D4D]">........</span>
                    <button className="w-8 h-8 flex items-center justify-center text-base">
                      68
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base">
                      <HiOutlineChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[16px] border-2 border-[#5A4A4A] p-2 shadow-[2px_2px_0px_0px_#202020,2px_4px_0px_0px_#202020]">
                <div className="text-center">
                  <div className="text-lg font-bold">100.00%</div>
                  <div className="text-sm text-[#4D4D4D]">
                    2,455M / 2,4555M OVL
                  </div>
                </div>
              </div>
            </div>
          </CardContainer>

          <div className="col-span-2">
            <CardContainer>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#4D4D4D]">Sale Status</div>
                  <div className="text-base font-bold">Ended</div>
                </div>
                <div>
                  <div className="text-sm text-[#4D4D4D] mb-2">Completed</div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-xl font-bold">1</div>
                      <div className="text-xs text-[#4D4D4D]">Days</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">0</div>
                      <div className="text-xs text-[#4D4D4D]">Hours</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">37</div>
                      <div className="text-xs text-[#4D4D4D]">Minutes</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">45</div>
                      <div className="text-xs text-[#4D4D4D]">Seconds</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] border border-black p-4 text-center">
                  <div className="mb-4">
                    <Image
                      src="/images/lbp-detail/logo/check.svg"
                      alt="check"
                      width={32}
                      height={32}
                      className="mx-auto"
                    />
                  </div>
                  <div className="text-lg font-bold mb-2">Sale Ended</div>
                  <div className="text-sm text-[#4D4D4D] mb-4">
                    The token sale has ended. Tokens can be redeemed by clicking
                    the &apos;Claim Tokens Here&apos; button below.
                  </div>
                  <div className="text-sm text-[#4D4D4D] mb-4">
                    Some tokens may have a claim delay as set by the sale
                    creator.
                  </div>
                  <div className="border-t border-black pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Purchased tokens:</span>
                      <span>0 OVL</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black rounded-2xl p-4">
                  <button className="w-full bg-[#FFCD4D] text-black rounded-xl text-[18px] py-3">
                    Nothing to redeem
                  </button>
                </div>
              </div>
            </CardContainer>
          </div>
        </CardContainer>
      </div>
    </div>
  );
};

export default LBPDetailPage;
