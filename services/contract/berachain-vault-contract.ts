import { exec } from "~/lib/contract";
import { BaseContract } from ".";
import { wallet } from "../wallet";
import { Signer, ethers } from "ethers";
import { Contract } from "ethcall";
import BigNumber from "bignumber.js";
import { makeAutoObservable } from "mobx";
import { get } from "http";
import { getContract } from "viem";
import { BerachainRewardsVaultFactoryABI } from "@/lib/abis/BerachainRewardsVaultFactory";
import { ContractWrite } from "../utils";

export class BerachainRewardsVaultContract implements BaseContract {
  address = "";
  name: string = "";
  abi = BerachainRewardsVaultFactoryABI;
  constructor(args: Partial<BerachainRewardsVaultContract>) {
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
}
