import { BaseContract } from ".";
import { wallet } from "../wallet";
import { getContract } from "viem";
import { AsyncState, ContractWrite } from "../utils";
import { makeAutoObservable } from "mobx";
import { MemePairABI } from "@/lib/abis/MemePair";
import BigNumber from "bignumber.js";
import { Token } from "./token";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/tailwindcss";
import { trpcClient } from "@/lib/trpc";
import { ZodError } from "zod";
import { statusTextToNumber } from "../launchpad";
import { liquidity } from "../liquidity";

export class MemePairContract implements BaseContract {
  databaseId: number | undefined = undefined;
  address = "";
  name: string = "";
  abi = MemePairABI.abi;
  raiseToken: Token | undefined = undefined;
  launchedToken: Token | undefined = undefined;
  depositedRaisedTokenWithoutDecimals: BigNumber | null = null;
  depositedLaunchedTokenWithoutDecimals: BigNumber | null = null;
  endTime: string = "";
  startTime: string = "";
  ftoState: number = 3;
  launchedTokenProvider: string = "";
  projectName = "";
  description = "";
  telegram = "";
  twitter = "";
  website = "";
  isValidated = false;
  isInit = false;
  provider = "";
  canClaimLP = false;
  canRefund = false;
  isRefundable = false;
  raisedTokenMinCap: BigNumber | undefined = undefined;
  userParticipated = false;
  socials: {
    name: string;
    link: string;
    icon: string;
  }[] = [];
  logoUrl = "";

  constructor(args: Partial<MemePairContract>) {
    Object.assign(this, args);
    this.getIsValidated();
    makeAutoObservable(this);
  }

  get startTimeDisplay() {
    return this.startTime
      ? dayjs(
          new BigNumber(this.startTime).multipliedBy(1000).toNumber()
        ).toISOString()
      : "-";
  }

  get endTimeDisplay() {
    return this.endTime
      ? dayjs(
          new BigNumber(this.endTime).multipliedBy(1000).toNumber()
        ).toISOString()
      : "-";
  }

  get depositedRaisedToken() {
    if (!this.raiseToken) {
      throw new Error("token is not initialized");
    }

    return this.depositedRaisedTokenWithoutDecimals && this.raiseToken.decimals
      ? this.depositedRaisedTokenWithoutDecimals.div(
          new BigNumber(10).pow(this.raiseToken.decimals)
        )
      : undefined;
  }

  get depositedLaunchedToken() {
    if (!this.launchedToken) {
      return undefined;
    }

    return this.depositedLaunchedTokenWithoutDecimals &&
      this.launchedToken.decimals
      ? this.depositedLaunchedTokenWithoutDecimals.div(
          new BigNumber(10).pow(this.launchedToken.decimals)
        )
      : undefined;
  }

  get isProvider() {
    return (
      this.launchedTokenProvider.toLocaleLowerCase() ===
      wallet.account.toLocaleLowerCase()
    );
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  get facadeContract() {
    return wallet.contracts.memeFacade;
  }

  get factoryContract() {
    return wallet.contracts.memeFactory;
  }

  get price() {
    return this.depositedRaisedToken && this.depositedLaunchedToken
      ? this.depositedRaisedToken.div(this.depositedLaunchedToken)
      : undefined;
  }

  get isCompleted() {
    return (
      this.endTime && new BigNumber(this.endTime).isLessThan(dayjs().unix())
    );
  }

  get remainTime() {
    const now = dayjs();
    if (!this.endTime) {
      return "-";
    }
    const targetTime = dayjs(
      new BigNumber(this.endTime).multipliedBy(1000).toNumber()
    );
    if (!targetTime.isValid()) {
      return "Invalid Date";
    }
    const diffDays = targetTime.diff(now, "days");

    if (Math.abs(diffDays) >= 1) {
      return `${Math.abs(diffDays)} ${
        diffDays > 0 ? "days later" : "days ago"
      }`;
    }

    const diffHours = targetTime.diff(now, "hours");

    if (Math.abs(diffHours) >= 1) {
      return `${Math.abs(diffHours)} ${
        diffHours > 0 ? "hours later" : "hours ago"
      }`;
    }

    const diffMinutes = targetTime.diff(now, "minutes");
    return `${Math.abs(diffMinutes)} ${
      diffMinutes > 0 ? "minutes later" : "minutes ago"
    }`;
  }

  deposit = new AsyncState(async ({ amount }: { amount: string }) => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    amount = new BigNumber(amount)
      .multipliedBy(new BigNumber(10).pow(this.raiseToken.decimals))
      .toFixed();
    await this.raiseToken.approveIfNoAllowance({
      amount,
      spender: this.facadeContract.address,
    });

    await this.facadeContract.deposit.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
      BigInt(amount),
    ]);
    await Promise.all([
      this.getDepositedRaisedToken(),
      this.raiseToken.getBalance(),
    ]);
  });

  refund = new AsyncState(async () => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    await new ContractWrite(this.contract.write.refundRaisedToken, {
      action: "Refund",
    }).call();

    await this.raiseToken?.getBalance();

    this.canRefund = false;
  });

  claimLP = new AsyncState(async () => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    await this.facadeContract.claimLP.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
    ]);
    this.canClaimLP = false;
  });

  resume = new AsyncState(async () => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    await this.factoryContract.resume.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
    ]);

    await this.getState();
  });

  pause = new AsyncState(async () => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    await this.factoryContract.pause.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
    ]);

    await this.getState();
  });

  get withdraw() {
    return new ContractWrite(this.contract.write.claimLP, {
      action: "Withdraw",
    });
  }

  get ftoStatusDisplay() {
    switch (this.ftoState) {
      case 0:
        return {
          status: "success",
          color: "bg-success/20 text-success-600",
        };
      case 1:
        return {
          status: "Fail",
          color: "bg-danger/20 text-danger",
        };
      case 2:
        return {
          status: "Paused",
          color: "bg-warning/20 text-warning-600",
        };
      case 3:
        if (this.isCompleted) {
          return {
            status: "Completed",
            color: "bg-[rgba(226,232,240,0.1)] text-default-foreground",
          };
        }
        return {
          status: "Processing",
          color: "text-[#83C2E9] bg-[rgba(131,194,233,0.1)]",
        };
    }
  }

  async getProjectInfo() {
    const res = await trpcClient.projects.getProjectInfo.query({
      chain_id: wallet.currentChainId,
      pair: this.address,
    });
    if (!res) {
      return;
    }
    this.socials = [];
    if (res.id) {
      this.databaseId = res.id;
    }
    if (res.telegram) {
      this.telegram = res.telegram;
      this.socials.push({
        name: "telegram",
        link: res.telegram,
        icon: "/images/telegram.svg",
      });
    }
    if (res.twitter) {
      this.twitter = res.twitter;
      this.socials.push({
        name: "twitter",
        link: res.twitter,
        icon: "/images/twitter.svg",
      });
    }
    if (res.website) {
      this.website = res.website;
      this.socials.push({
        name: "website",
        link: res.website,
        icon: "/images/website.svg",
      });
    }
    if (res.description) {
      this.description = res.description;
    }
    if (res.name) {
      this.projectName = res.name;
    }
    if (res.provider) {
      this.provider = res.provider;
    }
    if (res.logo_url) {
      this.logoUrl = res.logo_url;
      this.launchedToken?.setLogoURI(res.logo_url);
    }
  }

  async init({
    raisedToken,
    launchedToken,
    depositedRaisedToken,
    depositedLaunchedToken,
    startTime,
    endTime,
    ftoState,
  }: {
    raisedToken?: Token;
    launchedToken?: Token;
    depositedRaisedToken?: string;
    depositedLaunchedToken?: string;
    startTime?: string;
    endTime?: string;
    ftoState?: number;
  } = {}) {
    if (this.isInit) {
      return;
    }

    await Promise.all([
      this.getRaisedToken(raisedToken),
      this.getLaunchedToken(launchedToken),
      this.getDepositedRaisedToken(),
      //depositedRaisedToken
      this.getDepositedLaunchedToken(depositedLaunchedToken),
      this.getEndTime(endTime),
      this.getLaunchedTokenProvider(),
      this.getProjectInfo(),
      this.getCanClaimLP(),
      this.getRaisedTokenMinCap(),
      this.getUserParticipated(),
    ]).catch((error) => {
      console.error(error, `init-memepair-error-${this.address}`);
      return;
    });

    this.getState();
    this.getCanRefund();

    this.isInit = true;
  }

  async getRaisedTokenMinCap() {
    const res = await this.contract.read.raisedTokenMinCap();

    this.raisedTokenMinCap = new BigNumber(res.toString());
  }

  getIsValidated() {
    this.isValidated = wallet.currentChain?.validatedFtoAddresses.includes(
      this.address.toLowerCase()
    );
  }
  async getCanClaimLP() {
    try {
      if (
        !wallet.account ||
        // provider can't claim LP
        wallet.account.toLowerCase() === this.provider.toLowerCase()
      ) {
        return false;
      }

      const claimed = await this.contract.read.claimedLp([wallet.account] as [
        `0x${string}`
      ]);

      console.log("claimed", claimed);

      const claimable = await this.contract.read.claimableLP([
        wallet.account,
      ] as [`0x${string}`]);

      console.log("claimable", claimable);

      this.canClaimLP = claimable > claimed;
    } catch (error) {
      // console.error(error);
      this.canClaimLP = false;
    }
  }

  async getRaisedToken(token?: Token) {
    if (token) {
      this.raiseToken = token;
      this.raiseToken.init();
    } else {
      const res = (await this.contract.read.raisedToken()) as `0x${string}`;
      this.raiseToken = Token.getToken({ address: res });
      this.raiseToken.init();
    }
  }

  async getLaunchedToken(launchedToken?: Token) {
    if (launchedToken) {
      this.launchedToken = launchedToken;
      this.launchedToken.init();
    } else {
      const res = (await this.contract.read.memeToken()) as `0x${string}`;
      this.launchedToken = Token.getToken({ address: res });
      this.launchedToken.init();
    }
  }

  async getDepositedRaisedToken(amount?: string) {
    if (amount) {
      this.depositedRaisedTokenWithoutDecimals = new BigNumber(amount);
    } else {
      const res = (await this.contract.read.depositedRaisedToken()) as bigint;
      this.depositedRaisedTokenWithoutDecimals = new BigNumber(res.toString());
    }
  }

  async getDepositedLaunchedToken(amount?: string) {
    if (amount && Number(amount) !== 0) {
      this.depositedLaunchedTokenWithoutDecimals = new BigNumber(amount);
    } else {
      const res = (await this.contract.read.depositedmemeToken()) as bigint;
      this.depositedLaunchedTokenWithoutDecimals = new BigNumber(
        res.toString()
      );
    }
  }

  async getPoolPair() {
    if (this.ftoState !== 0) {
      console.error("fto is not completed");
      return;
    }
    if (!this.raiseToken || !this.launchedToken) {
      console.error("token is not initialized");
      return;
    }

    const poolPair = await liquidity.getPairByTokens(
      this.raiseToken.address.toLowerCase(),
      this.launchedToken.address.toLowerCase()
    );

    return poolPair;
  }

  async getEndTime(endtime?: string) {
    if (endtime) {
      this.endTime = endtime;
    } else {
      const res = await this.contract.read.endTime();
      this.endTime = res.toString();
    }
  }

  getCanRefund() {
    if (
      !this.userParticipated ||
      !this.depositedRaisedToken ||
      !this.raisedTokenMinCap ||
      (this.ftoState !== 1 && this.ftoState !== 2)
    ) {
      this.canRefund = false;
      return;
    }

    if (!this.depositedRaisedToken.isZero()) {
      this.canRefund = true;
    }
  }

  async getUserParticipated() {
    if (!wallet.account) {
      return;
    }

    const res = await this.contract.read.raisedTokenDeposit([
      wallet.account,
    ] as [`0x${string}`]);

    // console.log("userParticipated", res);

    this.userParticipated = res > 0;
  }

  getState() {
    if (
      !this.depositedRaisedToken ||
      !this.endTime ||
      !this.raisedTokenMinCap
    ) {
      console.error(
        this.depositedRaisedToken,
        this.endTime,
        this.raisedTokenMinCap
      );
      console.error("missing data for getState");
      return;
    }

    if (
      this.depositedRaisedToken.toNumber() >=
      this.raisedTokenMinCap.div(Math.pow(10, 18)).toNumber()
    ) {
      this.ftoState = 0;
    } else if (dayjs.unix(Number(this.endTime)).isBefore(dayjs())) {
      this.ftoState = 1;
    } else {
      this.ftoState = 3;
    }
  }

  async getLaunchedTokenProvider() {
    const res = await this.contract.read.tokenDeployer();
    this.launchedTokenProvider = res;
  }
}
