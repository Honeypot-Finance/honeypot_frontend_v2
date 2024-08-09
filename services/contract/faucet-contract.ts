import { exec } from "~/lib/contract";
import { BaseContract } from ".";
import { wallet } from "../wallet";
import { Signer, ethers } from "ethers";
import { Contract } from "ethcall";
import BigNumber from "bignumber.js";
import { makeAutoObservable } from "mobx";
import { get } from "http";
import { getContract } from "viem";
import { faucetABI } from "@/lib/abis/faucet";
import { ContractWrite } from "../utils";
import { berachainBartioTestnetNetwork, networksMap } from "../chain";
import { DailyFaucetABI } from "@/lib/abis/faucet/daily-faucet";
import { Token } from "./token";

export class NativeFaucetContract implements BaseContract {
  address = "";
  name: string = "";
  canclaim = false;
  cantClaimReason = "";
  abi = DailyFaucetABI;

  constructor(args: Partial<NativeFaucetContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  async isClaimable(): Promise<boolean> {
    //check time
    const timeFaucetable = await this.contract.read.faucetable([
      wallet.account as `0x${string}`,
    ]);

    if (!timeFaucetable) {
      this.canclaim = false;
      this.cantClaimReason = "Need to wait 24 hours before next claim";
      return false;
    }

    const hpotAdress = await this.contract.read.hpot();
    const minHpotBalance = await this.contract.read.minHpot();

    const hpotContract = new Token({
      address: hpotAdress,
    });
    await hpotContract.init();

    const enoughBalance =
      Number(hpotContract.balanceWithoutDecimals.toString()) >=
      Number(minHpotBalance.toString());

    if (!enoughBalance) {
      this.canclaim = false;
      this.cantClaimReason = `Not enough HPOT balance, need at least ${
        Number(minHpotBalance) / Math.pow(10, hpotContract.decimals)
      } HPOT`;
      return false;
    }

    this.canclaim = true;
    return this.canclaim;
  }

  get Claim(): ContractWrite<any> {
    return new ContractWrite(this.contract.write?.faucet, {
      action: "Get Faucet",
    });
  }

  donateToContract = async (amount: string) => {
    const tx = await wallet.walletClient.sendTransaction({
      account: wallet.account as `0x${string}`,
      to: this.address as `0x${string}`,
      value: ethers.utils.parseEther(amount).toBigInt(),
      chain: null,
    });

    return tx;
  };
}
