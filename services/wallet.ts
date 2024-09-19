import { Network, networks } from "./chain";
import BigNumber from "bignumber.js";
import { PublicClient, WalletClient } from "viem";
import { RouterV2Contract } from "./contract/routerv2-contract";
import { FactoryContract } from "./contract/factory-contract";
import { FtoFactoryContract } from "./contract/ftofactory-contract";
import { FtoFacadeContract } from "./contract/ftofacade-contract";
import { makeAutoObservable, reaction } from "mobx";
import { Token } from "./contract/token";
import { createPublicClientByChain } from "@/lib/client";
import { AsyncState, StorageState } from "./utils";
import { MemeFactoryContract } from "./contract/memefactory-contract";
import { MEMEFacadeContract } from "./contract/memefacade-contract";
import { init } from "next/dist/compiled/webpack/webpack";
import { BerachainVaultFactoryContract } from "./contract/berachain-vault-factory-contract";

export class Wallet {
  account: string = "";
  accountShort = "";
  networks: Network[] = [];
  balance: BigNumber = new BigNumber(0);
  walletClient!: WalletClient;
  currentChainId: number = -1;
  contracts: {
    routerV2: RouterV2Contract;
    factory: FactoryContract;
    ftofactory: FtoFactoryContract;
    ftofacade: FtoFacadeContract;
    memeFactory: MemeFactoryContract;
    memeFacade: MEMEFacadeContract;
    vaultFactory?: BerachainVaultFactoryContract;
  } = {} as any;
  publicClient!: PublicClient;
  isInit = false;
  get networksMap() {
    return this.networks.reduce((acc, network) => {
      acc[network.chainId] = network;
      return acc;
    }, {} as Record<number, Network>);
  }

  get currentChain() {
    return this.networksMap[this.currentChainId];
  }

  constructor(args: Partial<Wallet>) {
    makeAutoObservable(this);
    reaction(
      () => this.walletClient?.account,
      () => {
        this.initWallet(this.walletClient);
      }
    );
  }

  async initWallet(walletClient: WalletClient) {
    this.networks = networks;
    if (
      !walletClient.chain?.id ||
      !this.networksMap[walletClient.chain.id] ||
      !walletClient.account?.address
    ) {
      return;
    }
    this.currentChainId = walletClient.chain.id;
    const mockAccount = localStorage.getItem("mockAccount");
    this.account = mockAccount || walletClient.account.address;
    this.contracts = {
      routerV2: new RouterV2Contract({
        address: this.currentChain.contracts.routerV2,
      }),
      factory: new FactoryContract({
        address: this.currentChain.contracts.factory,
      }),
      ftofactory: new FtoFactoryContract({
        address: this.currentChain.contracts.ftoFactory,
      }),
      ftofacade: new FtoFacadeContract({
        address: this.currentChain.contracts.ftoFacade,
      }),
      memeFactory: new MemeFactoryContract({
        address: this.currentChain.contracts.memeFactory,
      }),
      memeFacade: new MEMEFacadeContract({
        address: this.currentChain.contracts.memeFacade,
      }),
      vaultFactory: this.currentChain.contracts.vaultFactory
        ? new BerachainVaultFactoryContract({
            address: this.currentChain.contracts.vaultFactory,
          })
        : undefined,
    };
    this.publicClient = createPublicClientByChain(this.currentChain.chain);
    this.walletClient = walletClient;
    this.currentChain.init();
    await StorageState.sync();
    this.isInit = true;
  }
}

export const wallet = new Wallet({});
