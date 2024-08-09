import dayjs from "dayjs";
import { wallet } from "./wallet";
import BigNumber from "bignumber.js";
import { FtoPairContract } from "./contract/ftopair-contract";
import { AsyncState, PaginationState } from "./utils";
import { trpc, trpcClient } from "@/lib/trpc";
import { createSiweMessage } from "@/lib/siwe";
import { Address } from "viem";
import { Token } from "./contract/token";

const pagelimit = 9;

export type PairFilter = {
  search: string;
  status: "all" | "processing" | "success" | "fail";
  showNotValidatedPairs: boolean;
};

export const statusTextToNumber = (status: string) => {
  switch (status) {
    case "processing":
      return 3;
    case "success":
      return 0;
    case "fail":
      return 1;
    default:
      return -1;
  }
};

function calculateTimeDifference(timestamp: number): string {
  if (timestamp.toString().length !== 13) {
    return "Invaild";
  }
  const now = dayjs();
  const targetTime = dayjs(timestamp);

  const diffDays = now.diff(targetTime, "days");

  if (Math.abs(diffDays) >= 1) {
    return `${diffDays} ${diffDays > 0 ? "days later" : "days ago"}`;
  }

  const diffHours = now.diff(targetTime, "hours");

  if (Math.abs(diffHours) >= 1) {
    return `${diffHours} ${diffHours > 0 ? "hours later" : "hours ago"}`;
  }

  const diffMinutes = now.diff(targetTime, "minutes");
  return `${diffMinutes} ${diffMinutes > 0 ? "minutes later" : "minutes ago"}`;
}

class LaunchPad {
  pairFilter: PairFilter = {
    search: "",
    status: "all",
    showNotValidatedPairs: true,
  };

  set pairFilterSearch(search: string) {
    this.pairFilter.search = search;
    this.ftoPairs.call({
      page: this.ftoPairsPagination.page,
      limit: this.ftoPairsPagination.limit,
    });
    this.myFtoPairs.call();
    this.getMyFtoParticipatedPairs.call();
  }

  set pairFilterStatus(status: "all" | "processing" | "success" | "fail") {
    this.pairFilter.status = status;
    this.ftoPairs.call({
      page: this.ftoPairsPagination.page,
      limit: this.ftoPairsPagination.limit,
    });
    this.myFtoPairs.call();
    this.getMyFtoParticipatedPairs.call();
  }

  set showNotValidatedPairs(show: boolean) {
    this.pairFilter.showNotValidatedPairs = show;
    this.ftoPairs.call({
      page: this.ftoPairsPagination.page,
      limit: this.ftoPairsPagination.limit,
    });
    this.myFtoPairs.call();
    this.getMyFtoParticipatedPairs.call();
  }

  get ftofactoryContract() {
    return wallet.contracts.ftofactory;
  }

  get ftofacadeContract() {
    return wallet.contracts.ftofacade;
  }

  // loadCurrentPagePairs = async () => {
  //   console.log(this.ftoPairsPagination.page);
  //   for (
  //     let i =
  //       (this.ftoPairsPagination.page - 1) * this.ftoPairsPagination.limit;
  //     i < this.ftoPairsPagination.page * this.ftoPairsPagination.limit;
  //     i++
  //   ) {
  //     if (this.getFtoPairs?.value) {
  //       if (this.getFtoPairs.value[i]) {
  //         console.log("init", this.getFtoPairs.value[i]);
  //         await this.getFtoPairs.value[i].init();
  //         console.log("init", this.getFtoPairs.value[i]);
  //       } else {
  //         break;
  //       }
  //     }
  //   }
  // };

  allPairsLength = async () =>
    await this.ftofactoryContract.allPairsLength.call();

  getPairAddress = async (index: bigint) =>
    await this.ftofactoryContract.allPairs.call([index]);

  filterPairs = (pairs: FtoPairContract[]) => {
    const filteredPairs = pairs.filter((pair) => {
      if (this.pairFilter.showNotValidatedPairs) {
        return true;
      } else {
        return pair.isValidated;
      }
    });
    // .filter((pair) => {
    //   if (this.pairFilter.status === "all") return true;
    //   else if (this.pairFilter.status === "processing") {
    //     return pair.ftoState === 3;
    //   } else if (this.pairFilter.status === "success") {
    //     return pair.ftoState === 0;
    //   } else if (this.pairFilter.status === "fail") {
    //     return pair.ftoState === 1;
    //   }
    // })
    // .filter((pair) => {
    //   if (
    //     pair.projectName
    //       .toLowerCase()
    //       .includes(this.pairFilter.search.toLowerCase()) ||
    //     pair.name
    //       .toLowerCase()
    //       .includes(this.pairFilter.search.toLowerCase()) ||
    //     pair.description
    //       .toLowerCase()
    //       .includes(this.pairFilter.search.toLowerCase()) ||
    //     pair.address
    //       .toLowerCase()
    //       .includes(this.pairFilter.search.toLowerCase()) ||
    //     pair.launchedToken.address
    //       .toLowerCase()
    //       .includes(this.pairFilter.search.toLowerCase()) ||
    //     pair.launchedToken.name
    //       .toLowerCase()
    //       .includes(this.pairFilter.search.toLowerCase()) ||
    //     pair.launchedToken.symbol
    //       .toLowerCase()
    //       .includes(this.pairFilter.search.toLowerCase())
    //   ) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // });
    return filteredPairs;
  };

  getMyFtoParticipatedPairs = new AsyncState<FtoPairContract[]>(async () => {
    if (!this.myFtoParticipatedPairs.value) {
      await this.myFtoParticipatedPairs.call();
    } else {
      this.myFtoParticipatedPairs.value.data.forEach(async (pair) => {
        if (!pair.isInit) await pair.init();
      });
    }

    const filteredPairs = this.filterPairs(
      this.myFtoParticipatedPairs.value?.data ?? []
    );

    this.myFtoParticipatedPairsPagination.setTotal(filteredPairs.length);

    return filteredPairs ?? [];
  });

  ftoPairs = new AsyncState<
    {
      data: FtoPairContract[];
      total: number;
    },
    ({ page, limit }: { page: number; limit: number }) => Promise<{
      data: FtoPairContract[];
      total: number;
    }>
  >(async ({ page, limit }) => {
    const ftoAddresses =
      await trpcClient.indexerFeedRouter.getFilteredFtoPairs.query({
        filter: this.pairFilter,
        chainId: String(wallet.currentChainId),
      });

    if (!ftoAddresses || ftoAddresses.status === "error") {
      return { data: [], total: 0 };
    }

    const data: Array<FtoPairContract> = (
      await Promise.all(
        ftoAddresses.data.pairs.map(async (pairAddress, idx) => {
          if (
            idx >= (this.ftoPairsPagination.page - 1) * limit &&
            idx < this.ftoPairsPagination.page * limit
          ) {
            const pair = new FtoPairContract({
              address: pairAddress.id,
            });
            if (!pair.isInit) {
              pair.init({
                raisedToken: new Token({
                  ...pairAddress.token1,
                  address: pairAddress.token1.id,
                }),
                launchedToken: new Token({
                  ...pairAddress.token0,
                  address: pairAddress.token0.id,
                }),
                depositedLaunchedToken: pairAddress.depositedLaunchedToken,
                depositedRaisedToken: pairAddress.depositedRaisedToken,
                startTime: pairAddress.createdAt,
                endTime: pairAddress.endTime,
                ftoState: Number(pairAddress.status),
              });
            }

            return pair;
          }
        })
      )
    ).filter((pair) => pair !== undefined) as FtoPairContract[];

    this.ftoPairsPagination.setTotal(ftoAddresses.data.pairs.length);

    if (!data || data.length === 0) {
      return { data: [], total: 0 };
    } else {
      return {
        data: data,
        total: ftoAddresses.data.pairs.length,
      };
    }
  });

  myFtoParticipatedPairs = new AsyncState<{
    data: FtoPairContract[];
    total: number;
  }>(async () => {
    const projects = await this.ftofactoryContract.events(
      wallet.account as Address
    );

    let data = await Promise.all(
      projects.map(async (pairAddress) => {
        const pair = new FtoPairContract({ address: pairAddress as string });
        if (!pair.isInit) {
          await pair.init();
          pair.raiseToken.init();
          pair.launchedToken.init();
        }
        return pair;
      })
    );

    data.sort((a, b) => {
      return Number(b.startTime) - Number(a.startTime);
    });

    this.myFtoParticipatedPairsPagination.setTotal(data.length);

    return {
      data,
      total: data.length,
    };
  });

  myFtoPairs = new AsyncState<{
    data: FtoPairContract[];
    total: number;
  }>(async () => {
    const ftoAddresses =
      await trpcClient.indexerFeedRouter.getFilteredFtoPairs.query({
        filter: this.pairFilter,
        chainId: String(wallet.currentChainId),
        provider: wallet.account,
      });

    if (!ftoAddresses || ftoAddresses.status === "error") {
      return { data: [], total: 0 };
    }

    const data: Array<FtoPairContract> = (
      await Promise.all(
        ftoAddresses.data.pairs.map(async (pairAddress, idx) => {
          const pair = new FtoPairContract({
            address: pairAddress.id,
          });
          if (!pair.isInit) {
            pair.init({
              raisedToken: new Token(pairAddress.token1),
              launchedToken: new Token(pairAddress.token0),
              depositedLaunchedToken: pairAddress.depositedLaunchedToken,
              depositedRaisedToken: pairAddress.depositedRaisedToken,
              startTime: pairAddress.createdAt,
              endTime: pairAddress.endTime,
              ftoState: Number(pairAddress.status),
            });
          }
          return pair;
        })
      )
    ).filter((pair) => pair !== undefined) as FtoPairContract[];

    const filteredPairs = this.filterPairs(data);

    if (!filteredPairs || filteredPairs.length === 0) {
      return { data: [], total: 0 };
    } else {
      filteredPairs.sort((a, b) => {
        return Number(b.startTime) - Number(a.startTime);
      });

      this.myFtoPairsPagination.setTotal(ftoAddresses.data.pairs.length);

      return {
        data: filteredPairs,
        total: ftoAddresses.data.pairs.length,
      };
    }
  });

  ftoPairsPagination = new PaginationState({
    limit: pagelimit,
  });

  myFtoPairsPagination = new PaginationState({
    limit: pagelimit,
  });

  myFtoParticipatedPairsPagination = new PaginationState({
    limit: pagelimit,
  });

  // getPairInfo = async (pairAddress: `0x${string}`) => {
  //   const ftoPairContract = this.ftoPairContract(pairAddress);
  //   const launchedTokenAddress = await ftoPairContract.launchedTokenAddress();
  //   const depositedRaisedToken = await ftoPairContract.depositedRaisedToken();
  //   const depositedLaunchedToken =
  //     await ftoPairContract.depositedLaunchedToken();

  //   const price = BigNumber(formatEther(depositedRaisedToken))
  //     .div(formatEther(depositedLaunchedToken))
  //     .toFormat();
  //   return {
  //     price,
  //     launchedTokenAddress,
  //     depositedRaisedToken,
  //     endTime: await ftoPairContract.endTime(),
  //   };
  // };

  createFTO = async ({
    provider,
    raisedToken,
    tokenName,
    tokenSymbol,
    tokenAmount,
    poolHandler,
    raisingCycle,
  }: {
    provider: string;
    raisedToken: string;
    tokenName: string;
    tokenSymbol: string;
    tokenAmount: number;
    poolHandler: string;
    raisingCycle: number;
  }) => {
    const res = await this.ftofactoryContract.createFTO.call([
      provider as `0x${string}`,
      raisedToken as `0x${string}`,
      tokenName,
      tokenSymbol,
      BigInt(new BigNumber(tokenAmount).multipliedBy(1e18).toFixed()),
      poolHandler as `0x${string}`,
      BigInt(raisingCycle),
    ]);
    const pairAddress = res.logs.pop()?.address as string;
    await trpcClient.fto.createProject.mutate({
      pair: pairAddress,
      chain_id: wallet.currentChainId,
      provider: provider,
    });
    return pairAddress;
  };

  updateFtoProject = new AsyncState(
    async (data: {
      pair: string;
      chain_id: number;
      twitter: string;
      telegram: string;
      website: string;
      description: string;
      projectName: string;
    }) => {
      await createSiweMessage(
        wallet.account,
        "Sign In With Honeypot",
        wallet.walletClient
      );
      await trpcClient.fto.createOrUpdateProjectInfo.mutate(data);
    }
  );

  updateProjectLogo = new AsyncState(
    async (data: { logo_url: string; pair: string; chain_id: number }) => {
      await createSiweMessage(
        wallet.account,
        "Sign In With Honeypot",
        wallet.walletClient
      );

      await trpcClient.fto.updateProjectLogo.mutate(data);
    }
  );
}

const launchpad = new LaunchPad();

export default launchpad;
