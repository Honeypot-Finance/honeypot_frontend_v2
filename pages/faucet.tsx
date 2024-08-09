import { Button } from "@/components/button";
import { Copy } from "@/components/copy";
import { NoData } from "@/components/table";
import { wallet } from "@/services/wallet";
import { NextLayoutPage } from "@/types/nextjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { ChangeEvent, useEffect, useState } from "react";
import { amountFormatted } from "../lib/format";
import TokenLogo from "@/components/TokenLogo/TokenLogo";
import TokenBalanceCard from "@/components/TokenBalanceCard/TokenBalanceCard";
import CardContianer from "@/components/CardContianer/CardContianer";
import { useAccount, useBalance, UseBalanceReturnType } from "wagmi";
import Link from "next/link";
import { Modal, ModalContent, ModalHeader, Tooltip } from "@nextui-org/react";
import { ControlledToolTip } from "@/components/molecule/ControlledToolTip/ControlledToolTip";
import { NativeFaucetContract } from "@/services/contract/faucet-contract";
import { faucet } from "@/services/faucet";
import { OptionsDropdown } from "@/components/OptionsDropdown/OptionsDropdown";
import { VscHome } from "react-icons/vsc";
import { FaDonate } from "react-icons/fa";
import { sendTransaction } from "viem/actions";
import { toast } from "react-toastify";

export function DonationModal({
  balance,
  setModalOpen,
}: {
  balance: UseBalanceReturnType;
  setModalOpen: (open: boolean) => void;
}) {
  const [amount, setAmount] = useState(0);
  return (
    <>
      <ModalHeader>Donate</ModalHeader>
      <ModalContent>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2">
            <div className="text-[#F7931A]">Amount</div>
            <div className="flex items-center gap-2">
              <input
                className="w-full bg-[#1D1407] border-[1px] border-[#F7931A] rounded-[8px] p-[8px] text-[#F7931A] placeholder-[#F7931A] placeholder-opacity-[0.5]"
                placeholder={"enter amount"}
                step={undefined}
                onChange={
                  ((e: ChangeEvent<HTMLInputElement>) => {
                    setAmount(parseFloat(e.target.value));
                  }) as any
                }
              />
              <Button
                onClick={async () => {
                  await faucet.nativeFaucet?.donateToContract(String(amount));
                  await balance.refetch();
                  toast.success("Thank you for your donation!");
                  setModalOpen(false);
                }}
              >
                Donate
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </>
  );
}

const FaucetPage: NextLayoutPage = observer(() => {
  const account = useAccount();
  const balance = useBalance({
    address: account?.address,
  });
  const [isdonationModalOpen, setIsdonationModalOpen] = useState(false);

  useEffect(() => {
    if (!wallet.currentChain) return;
    wallet.currentChain?.faucetTokens?.forEach((token) => {
      token.init({ loadClaimed: true });
    });
    faucet.init();
  }, [wallet.currentChain?.faucetTokens]);
  return (
    <div className="flex flex-col  items-center ">
      <div className="flex items-center relative w-full sm:w-[578px] h-[138px] overflow-hidden">
        <Image src="/images/faucet_bg_v2.png" alt="faucet" fill></Image>
        <Image
          src="/images/bera/honeybera.svg"
          alt=""
          fill
          className="scale-90 translate-x-[25%]"
        ></Image>
        <div className="relative z-1 ml-[25px]">
          <div className="text-[black] text-2xl font-bold leading-7 tracking-[-0.24px]">
            Faucet
          </div>
          <div className="w-[309px] text-[black] mt-[8px] text-pretty text-sm sm:text-base font-bold leading-6 opacity-[0.5]">
            Claim test tokens to try out the Berachain testnet.
          </div>
        </div>
      </div>
      <div className="w-[578px] max-w-[100%] mt-[30px] flex flex-col gap-[24px]">
        {/** Native token faucet */}
        {wallet.currentChain?.officialFaucets?.[0] && (
          <div className="flex items-center flex-col lg:grid lg:grid-cols-[1fr,200px] gap-[0.5rem]">
            <CardContianer>
              <div className="flex-1 flex items-center">
                <Image
                  className={
                    "border border-[color:var(--card-stroke,#F7931A)] rounded-[50%] mr-[1rem]"
                  }
                  src={wallet.currentChain?.officialFaucets?.[0]?.logoURI ?? ""}
                  alt=""
                  width={24}
                  height={24}
                />
                {wallet.currentChain?.chain.nativeCurrency.name} (
                {wallet.currentChain?.chain.nativeCurrency.symbol})
                <OptionsDropdown
                  className="min-h-0 h-[unset]"
                  options={[
                    {
                      icon: <VscHome />,
                      display: (
                        <Link
                          target="_blank"
                          href={
                            (wallet.currentChain?.officialFaucets &&
                              wallet.currentChain?.officialFaucets[0].url) ||
                            ""
                          }
                        >
                          Official Faucet
                        </Link>
                      ),
                      onClick: () => {
                        window.open(
                          (wallet.currentChain?.officialFaucets &&
                            wallet.currentChain?.officialFaucets[0].url) ||
                            "",
                          "_blank"
                        );
                      },
                    },
                    {
                      icon: <FaDonate />,
                      display: "Donate",
                      onClick: () => {
                        setIsdonationModalOpen(true);
                      },
                    },
                  ]}
                ></OptionsDropdown>
              </div>
              <div className="">
                {amountFormatted(balance.data?.value.toString(), {
                  decimals: wallet.currentChain?.chain.nativeCurrency.decimals,
                  fixed: 3,
                })}
              </div>
            </CardContianer>
            {faucet.nativeFaucet && (
              <div className="w-full">
                <ControlledToolTip
                  content={
                    faucet.nativeFaucet.cantClaimReason ??
                    "HPOT holders can claim BERA tokens every 24 hours."
                  }
                >
                  <Button
                    className="lg:ml-[13px] w-full"
                    onClick={async () => {
                      await faucet.nativeFaucet!.Claim.call();
                      faucet.nativeFaucet!.isClaimable();
                      balance.refetch();
                    }}
                    isDisabled={!faucet.nativeFaucet.canclaim}
                    isLoading={faucet.nativeFaucet.Claim.loading}
                  >
                    {faucet.nativeFaucet.canclaim ? "Claim" : "Not Available"}
                  </Button>
                </ControlledToolTip>
              </div>
            )}
          </div>
        )}
        {wallet.currentChain?.faucetTokens?.length ? (
          wallet.currentChain?.faucetTokens.map((token) => (
            <div
              key={token.address}
              className="flex items-center flex-col lg:grid lg:grid-cols-[1fr,200px] gap-[0.5rem]"
            >
              <TokenBalanceCard token={token}></TokenBalanceCard>
              <Button
                isDisabled={token.claimed}
                isLoading={token.faucet.loading}
                className="lg:ml-[13px] w-full"
                onClick={async () => {
                  token.claimed = true;
                  await token.faucet.call();
                  await token.getBalance();
                  await token.getClaimed();
                }}
              >
                {token.claimed ? "Tokens Claimed" : "Claim Tokens"}
              </Button>
            </div>
          ))
        ) : (
          <NoData></NoData>
        )}
      </div>
      <Modal
        isOpen={isdonationModalOpen}
        onClose={() => setIsdonationModalOpen(false)}
      >
        <DonationModal
          balance={balance}
          setModalOpen={setIsdonationModalOpen}
        />
      </Modal>
    </div>
  );
});

export default FaucetPage;
