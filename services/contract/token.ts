import BigNumber from "bignumber.js";
import { BaseContract } from ".";
import { wallet } from "../wallet";
import { makeAutoObservable } from "mobx";
import { getContract } from "viem";
import { ContractWrite } from "../utils";
import { amountFormatted } from "@/lib/format";
import { ERC20ABI } from "@/lib/abis/erc20";
import { faucetABI } from "@/lib/abis/faucet";
import { watchAsset } from "viem/actions";
import { toast } from "react-toastify";

export class Token implements BaseContract {
  address: string = "";
  name: string = "";
  balanceWithoutDecimals = new BigNumber(0);
  totalSupplyWithoutDecimals = new BigNumber(0);
  symbol: string = "";
  decimals: number = 0;
  logoURI = "";
  abi = ERC20ABI;
  faucetLoading = false;
  claimed = false;
  isInit = false;

  get displayName() {
    return this.symbol || this.name;
  }

  get faucetContract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: faucetABI,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }
  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  constructor({ balance, ...args }: Partial<Token>) {
    Object.assign(this, args);
    if (balance) {
      this.balanceWithoutDecimals = new BigNumber(balance);
    }

    this.getLogoURI();

    makeAutoObservable(this);
  }

  get faucet() {
    return new ContractWrite(this.faucetContract.write?.faucet, {
      action: "Get Faucet",
    });
  }
  get approve() {
    return new ContractWrite(this.contract.write?.approve, {
      action: "Approve",
    });
  }

  async init(options?: {
    loadName?: boolean;
    loadSymbol?: boolean;
    loadDecimals?: boolean;
    loadBalance?: boolean;
    loadTotalSupply?: boolean;
    loadClaimed?: boolean;
  }) {
    const loadName = options?.loadName ?? true;
    const loadSymbol = options?.loadSymbol ?? true;
    const loadDecimals = options?.loadDecimals ?? true;
    const loadBalance = options?.loadBalance ?? true;
    const loadTotalSupply = options?.loadTotalSupply ?? false;
    const loadClaimed = options?.loadClaimed ?? false;

    this.getLogoURI();

    await Promise.all([
      loadName && !this.name
        ? this.contract.read.name().then((name) => {
            this.name = name;
          })
        : Promise.resolve(),
      loadSymbol && !this.symbol
        ? this.contract.read.symbol().then((symbol) => {
            this.symbol = symbol;
          })
        : Promise.resolve(),
      loadDecimals && !this.decimals
        ? this.contract.read.decimals().then((decimals) => {
            this.decimals = decimals;
          })
        : Promise.resolve(),
      loadBalance ? this.getBalance() : Promise.resolve(),
      loadTotalSupply ? this.getTotalSupply() : Promise.resolve(),
      loadClaimed
        ? this.getClaimed().then((claimed) => {
            this.claimed = claimed;
          })
        : Promise.resolve(),
    ]).catch((e) => {
      console.log(e);
      return;
    });

    this.isInit = true;
  }

  getLogoURI() {
    if (this.logoURI) return;

    Object.entries(wallet.currentChain.validatedTokensInfo).forEach(
      ([address, info]) => {
        if (address.toLowerCase() === this.address.toLowerCase()) {
          this.logoURI = info.logoURI ?? "";
        }
      }
    );
  }

  async approveIfNoAllowance({
    amount,
    spender,
  }: {
    amount: string;
    spender: string;
  }) {
    const allowance = await this.contract.read.allowance([
      wallet.account as `0x${string}`,
      spender as `0x${string}`,
    ]);
    if (
      new BigNumber(allowance.toString()).isGreaterThanOrEqualTo(
        new BigNumber(amount)
      )
    ) {
      return;
    }
    await this.approve.call([spender as `0x${string}`, BigInt(amount)]);
  }

  async getClaimed(): Promise<boolean> {
    const claimed = await this.faucetContract.read.faucetClaimer([
      wallet.account as `0x${string}`,
    ]);

    return claimed;
  }

  async getBalance() {
    try {
      const balance = await this.contract.read.balanceOf([
        wallet.account as `0x${string}`,
      ]);
      this.balanceWithoutDecimals = new BigNumber(balance.toString());
      return this.balanceWithoutDecimals;
    } catch (e) {
      console.log(e);
      return new BigNumber(0);
    }
  }

  async getTotalSupply() {
    const totalSupply = await this.contract.read.totalSupply();
    this.totalSupplyWithoutDecimals = new BigNumber(totalSupply.toString());
    return this.totalSupplyWithoutDecimals;
  }

  get balance() {
    return this.balanceWithoutDecimals.div(
      new BigNumber(10).pow(this.decimals)
    );
  }

  get balanceFormatted() {
    return amountFormatted(this.balanceWithoutDecimals, {
      decimals: this.decimals,
      fixed: 3,
    });
  }

  async watch() {
    watchAsset(wallet.walletClient, {
      type: "ERC20",
      options: {
        address: this.address,
        symbol: this.symbol,
        decimals: this.decimals,
        image: window.location.origin + this.logoURI,
      },
    })
      .then(() => {
        toast.success("Token added to wallet");
      })
      .catch((e) => {
        toast.error("Failed to add token to wallet");
      });
  }
}
