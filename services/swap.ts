// import scrollTokens from '~/static/tokens/scroll_tokens.json'
// import scrollSepoliaTokens from '~/static/tokens/scroll_alpha_tokens.json'
import { Token } from "./contract/token";
import { PairContract } from "./contract/pair-contract";
import BigNumber from "bignumber.js";
import { wallet } from "./wallet";
import { liquidity } from "./liquidity";
import { exec } from "~/lib/contract";
import { makeAutoObservable, reaction, when } from "mobx";
import { AsyncState } from "./utils";
import { debounce } from "lodash";
import dayjs from "dayjs";
import { chart } from "./chart";

class Swap {
  fromToken: Token | null = null;
  toToken: Token | null = null;

  fromAmount: string = "";
  toAmount: string = "";
  slippage: number = 1;
  deadline: number = 20;
  price: BigNumber | null = null;

  routerToken = new AsyncState<Token[] | undefined>(async () => {
    if (!this.fromToken || !this.toToken) {
      return undefined;
    }

    //try to get 1 token in fto tokens for both from and to
    //route them by from -> router token -> to
    const fromTokenRouterTokens = await liquidity.getTokenFtoPair(
      this.fromToken
    );
    console.log("fromTokenRouterTokens: " + fromTokenRouterTokens);
    if (fromTokenRouterTokens.length === 0) {
      return undefined;
    }

    fromTokenRouterTokens.forEach(async (rtoken) => {
      if (
        liquidity.pairsByToken[`${this.toToken!.address}-${rtoken.address}`] ||
        liquidity.pairsByToken[`${rtoken.address}-${this.toToken!.address}`]
      ) {
        return [rtoken];
      }
    });

    // if there is not one token for both,
    // get fto tokens for from and to separately
    // and route them by from -> router token 1 -> router token 2 -> to
    const toTokenRouterTokens = await liquidity.getTokenFtoPair(this.toToken);
    console.log("toTokenRouterTokens: " + toTokenRouterTokens);
    if (toTokenRouterTokens.length === 0) {
      return undefined;
    }

    return [fromTokenRouterTokens[0], toTokenRouterTokens[0]];
  });

  currentPair = new AsyncState<PairContract | undefined>(async () => {
    if (this.fromToken && this.toToken) {
      const res = await liquidity.getPairByTokens(
        this.fromToken.address,
        this.toToken.address
      );

      console.log("currentPair: ", res);

      if (!res) {
        this.routerToken.call();
        console.log("router token: ", this.routerToken.value);
      }

      await res?.init();
      return res;
    }
  });

  //whether the sort of from and to token is consistent with the current pair's token0 and token1
  get isTokenPairSortMatch() {
    return (
      this.fromToken?.address === this.currentPair.value?.token0.address &&
      this.toToken?.address === this.currentPair.value?.token1.address
    );
  }

  get isDisabled() {
    return (
      !this.fromToken ||
      !this.toToken ||
      !this.fromAmount ||
      !this.toAmount ||
      !this.currentPair.value ||
      this.fromToken.balance.toNumber() < Number(this.fromAmount)
    );
  }

  get buttonContent() {
    if (!this.fromToken || !this.toToken) {
      return "Select Tokens";
    }
    if (this.currentPair.loading) {
      return "Loading Pair";
    }

    if (!this.currentPair.value) {
      return "Insufficient Liquidity";
    }
    if (!this.fromAmount || !this.toAmount) {
      return "Enter Amount";
    }
    if (this.fromToken.balance.toNumber() < Number(this.fromAmount)) {
      return "Insufficient Balance";
    }
    return "Swap";
  }

  get factoryContract() {
    return wallet.contracts.factory;
  }

  get routerV2Contract() {
    return wallet.contracts.routerV2;
  }

  get minToAmount() {
    return new BigNumber(this.toAmount || 0).minus(
      new BigNumber(this.toAmount || 0).multipliedBy(this.slippage).div(100)
    );
  }

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.fromToken?.address,
      async () => {
        this.currentPair.setValue(undefined);
        this.routerToken.setValue(undefined);
        await this.toToken?.init();
        chart.setChartTarget(this.fromToken as Token);
        if (this.fromToken && this.toToken) {
          await this.currentPair.call();
          console.log(this.currentPair.value);
          chart.setChartTarget(this.currentPair.value as PairContract);
        }
      }
    );
    reaction(
      () => this.toToken?.address,
      async () => {
        this.currentPair.setValue(undefined);
        this.routerToken.setValue(undefined);
        await this.toToken?.init();
        chart.setChartTarget(this.toToken);
        if (this.fromToken && this.toToken) {
          await this.currentPair.call();
          console.log(this.currentPair.value);
          chart.setChartTarget(this.currentPair.value as PairContract);
        }
      }
    );
    reaction(
      () => this.fromAmount,
      debounce(async () => {
        if (!this.currentPair.value) {
          return;
        }
        if (this.fromAmount) {
          const [toAmount] = await this.currentPair.value.getAmountOut.call(
            this.fromAmount,
            this.fromToken as Token
          );
          //@ts-ignore
          this.toAmount = toAmount?.toFixed();
          this.price = new BigNumber(this.toAmount).div(this.fromAmount);
        } else {
          this.toAmount = "";
          this.price = null;
        }
      }, 300)
    );
  }

  setDeadline(deadline: number) {
    this.deadline = deadline;
  }
  setSlippage(slippage: number) {
    this.slippage = slippage;
  }

  switchTokens() {
    const fromToken = this.fromToken;
    this.fromToken = this.toToken;
    this.toToken = fromToken;
    this.fromAmount = "";
    this.toAmount = "";
  }

  setFromToken(token: Token) {
    if (this.fromToken?.address !== token?.address) {
      if (this.toToken?.address === token?.address) {
        this.toToken = this.fromToken;
        this.toAmount = "";
      }
      this.fromToken = token;
      this.fromToken.init();
      this.fromAmount = "";
    }
  }

  setFromAmount(amount: string) {
    this.fromAmount = amount;
  }

  setToToken(token: Token) {
    if (this.toToken?.address !== token?.address) {
      if (this.fromToken?.address === token?.address) {
        this.fromToken = this.toToken;
        this.fromAmount = "";
      }
      this.toToken = token;
      this.toToken.init();
      this.toAmount = "";
    }
  }

  setToAmount(amount: string) {
    this.toAmount = amount;
  }

  swapExactTokensForTokens = new AsyncState(async () => {
    if (
      !this.fromToken ||
      !this.toToken ||
      !this.fromAmount ||
      !this.toAmount ||
      !this.currentPair.value
    ) {
      return;
    }
    const fromAmountDecimals = new BigNumber(this.fromAmount)
      .multipliedBy(new BigNumber(10).pow(this.fromToken.decimals))
      .toFixed(0);

    const deadline = dayjs().unix() + 60 * (this.deadline || 20);
    const path = [
      this.fromToken.address,
      this.toToken.address,
    ] as readonly `0x${string}`[];
    await Promise.all([
      this.fromToken.approveIfNoAllowance({
        amount: fromAmountDecimals,
        spender: this.routerV2Contract.address,
      }),
    ]);
    await this.currentPair.value.getAmountOut.call(
      this.fromAmount,
      this.fromToken
    );
    const toAmountDecimals = (
      this.currentPair.value.getAmountOut.value as BigNumber
    )
      .multipliedBy(1 - this.slippage / 100)
      .multipliedBy(new BigNumber(10).pow(this.toToken.decimals))
      .toFixed(0);
    await this.routerV2Contract.swapExactTokensForTokens.call([
      BigInt(fromAmountDecimals),
      BigInt(toAmountDecimals),
      path,
      wallet.account as `0x${string}`,
      BigInt(deadline),
    ]);

    this.fromAmount = "";
    Promise.all([
      this.currentPair.value.init(true),
      this.fromToken.getBalance(),
      this.toToken.getBalance(),
    ]);
  });
}

export const swap = new Swap();
