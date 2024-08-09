import { Token } from "./contract/token";
import { createPublicClientByChain } from "@/lib/client";
import { Chain } from "viem/chains";
import {
  berachainBartioTestnet,
  berachainTestnet,
  polygonMumbaiChain,
  //sepolia,
} from "@/lib/chain";
import { NativeFaucetContract } from "./contract/faucet-contract";

export class Network {
  get chainId() {
    return this.chain.id;
  }
  contracts!: {
    routerV2: string;
    factory: string;
    ftoFactory: string;
    ftoFacade: string;
    ftoTokens: Partial<Token>[];
  };
  faucetTokens: Token[] = [];
  nativeFaucet?: {
    address: string;
    name: string;
    requirements: string;
  };
  chain!: Chain;
  officialFaucets?: {
    url: string;
    name: string;
    logoURI?: string;
  }[];
  blacklist?: {
    poolBlacklist: string[];
  };
  validatedTokensInfo: Record<
    string,
    {
      name: string;
      symbol: string;
      decimals: number;
      logoURI?: string;
    }
  > = {};
  validatedFtoAddresses: string[] = [];
  constructor(
    args: Omit<Partial<Network>, "faucetTokens"> & {
      faucetTokens: Partial<Token>[];
    }
  ) {
    Object.assign(this, args);
  }
}
// export const polygonTestNetwork = new Network({
//   chain: polygonMumbaiChain,
//   contracts: {
//     routerV2: "0x2ef225538c9FcE4641e038Fd6FA64cA5519cF971",
//     factory: "0x333bB9e7Aa8E02017E92cBAe2A8D500be7c0B95F",
//     ftoFactory: "0x5AD84056574066c774C5e58BC4a0652b6c171253",
//     ftoFacade: "0xe67a15AeBD845C779BF6672442567b1C66de34C2",
//     ftoTokens: ["0x878fd3Ccf564Cc2e38EEdDd798F88D8f8a51a1dD"],

//   },
//   faucetTokens: [
//     {
//       name: "AORI",
//       symbol: "AORI",
//       decimals: 18,
//       address: "0x41ffb8e98174e84faaa7133b2e6ff30537c64d66",
//     },
//     {
//       name: "YEET",
//       symbol: "YEET",
//       decimals: 18,
//       address: "0x2E985184792faDDc8AB9a0E855F289576a1e5dD2",
//     },
//     {
//       name: "HONEY",
//       symbol: "HONEY",
//       decimals: 18,
//       address: "0xEEAeA06afd271F665ba005AAaDdDBF4ADCeB330a",
//     },
//     {
//       name: "HPOT",
//       symbol: "HPOT",
//       decimals: 18,
//       address: "0xa3C79E1Ec388f5FaAaC993DeeaF3Bc4EbD10568B",
//     },
//   ],
// });

export const berachainBartioTestnetNetwork = new Network({
  chain: berachainBartioTestnet,
  officialFaucets: [
    {
      url: "https://bartio.faucet.berachain.com",
      name: "Official Faucet",
      logoURI:
        "https://res.cloudinary.com/duv0g402y/raw/upload/src/assets/bera.png",
    },
  ],
  nativeFaucet: {
    address: "0x57E2814Bd03B0b01B46d5112A238687a43E38271",
    name: "Daily Faucet",
    requirements: "You can claim 100 BERA tokens every 24 hours.",
  },
  contracts: {
    routerV2: "0x482270069fF98a0dF528955B651494759b3B2F8C",
    factory: "0x2f795195bae7E61E848ffC87ba7f6ae1A06c0527",
    ftoFactory: "0x2B74f450371D9977E412609B37588D17d4985c36",
    ftoFacade: "0x149519DD90392172467BfDb0cB91a04C0950e2DD",
    ftoTokens: [
      {
        address: "0xfc5e3743E9FAC8BB60408797607352E24Db7d65E",
        name: "T-HPOT",
        symbol: "T-HPOT",
        decimals: 18,
      },
      {
        address: "0x05D0dD5135E3eF3aDE32a9eF9Cb06e8D37A6795D",
        name: "USDT",
        symbol: "USDT",
        decimals: 18,
      },
      {
        address: "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8",
        name: "Wrapped Bera",
        symbol: "WBERA",
        decimals: 18,
        logoURI: "/images/icons/wbera-token-icon.png",
      },
      {
        address: "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03",
        name: "Honey",
        symbol: "HONEY",
        decimals: 18,
      },
      {
        address: "0x2C2fc71339aCdD913734a4CAe9dD95D9d2b1438d",
        name: "Bera the Pooh",
        symbol: "BERA THE POOH",
        decimals: 18,
      },
      // {
      //   address: "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c",
      //   name: "USDC",
      //   symbol: "USDC",
      //   decimals: 18,
      // },
      // {
      //   address: "0x286F1C3f0323dB9c91D1E8f45c8DF2d065AB5fae",
      //   name: "WBTC",
      //   symbol: "WBTC",
      //   decimals: 18,
      // },
      // {
      //   address: "0x6E1E9896e93F7A71ECB33d4386b49DeeD67a231A",
      //   name: "WETH",
      //   symbol: "WETH",
      //   decimals: 18,
      // },
      // {
      //   address: "0x806Ef538b228844c73E8E692ADCFa8Eb2fCF729c",
      //   name: "DAI",
      //   symbol: "DAI",
      //   decimals: 18,
      // },
    ],
  },
  faucetTokens: [
    {
      address: "0xfc5e3743E9FAC8BB60408797607352E24Db7d65E",
      name: "T-HPOT",
      symbol: "tHPOT",
      decimals: 18,
    },
    {
      address: "0x2C2fc71339aCdD913734a4CAe9dD95D9d2b1438d",
      name: "Bera the Pooh",
      symbol: "BTP",
      decimals: 18,
    },
    // {
    //   name: "YEET",
    //   symbol: "YEET",
    //   decimals: 18,
    //   address: "0xb6a43bc17680fb67fd8371977d264e047f47c675",
    // },
    // {
    //   address: "0x5806E416dA447b267cEA759358cF22Cc41FAE80F",
    //   name: "Wrapped BERA",
    //   symbol: "WBERA",
    //   decimals: 18,
    // },
  ],
  blacklist: {
    poolBlacklist: ["0xfF95cdfC724Ca85b8d96D5a6Ea86333AC6a4799D"],
  },
  validatedTokensInfo: {
    "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8": {
      name: "Wrapped Bera",
      symbol: "WBERA",
      decimals: 18,
      logoURI: "/images/icons/tokens/wbera-token-icon.png",
    },
    "0x2C2fc71339aCdD913734a4CAe9dD95D9d2b1438d": {
      name: "Bera the Pooh",
      symbol: "BTP",
      decimals: 18,
      logoURI: "/images/icons/tokens/bera-the-pooh-token-icon.png",
    },
    "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03": {
      name: "Honey",
      symbol: "HONEY",
      decimals: 18,
      logoURI: "/images/icons/tokens/honey-token-icon.png",
    },
    "0xfc5e3743E9FAC8BB60408797607352E24Db7d65E": {
      name: "T-HPOT",
      symbol: "tHPOT",
      decimals: 18,
      logoURI: "/images/icons/tokens/thpot-token-icon.jpg",
    },
    "0x05D0dD5135E3eF3aDE32a9eF9Cb06e8D37A6795D": {
      name: "USDT",
      symbol: "USDT",
      decimals: 18,
      logoURI: "/images/icons/tokens/usdt-token-icon.png",
    },
    "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c": {
      name: "USDC",
      symbol: "USDC",
      decimals: 18,
      logoURI: "/images/icons/tokens/usdc-token-icon.png",
    },
    "0x286F1C3f0323dB9c91D1E8f45c8DF2d065AB5fae": {
      name: "WBTC",
      symbol: "WBTC",
      decimals: 18,
      logoURI: "/images/icons/tokens/wbtc-token-icon.png",
    },
    "0xE28AfD8c634946833e89ee3F122C06d7C537E8A8": {
      name: "WETH",
      symbol: "WETH",
      decimals: 18,
      logoURI: "/images/icons/tokens/weth-token-icon.png",
    },
    "0x806Ef538b228844c73E8E692ADCFa8Eb2fCF729c": {
      name: "DAI",
      symbol: "DAI",
      decimals: 18,
      logoURI: "/images/icons/tokens/dai-token-icon.png",
    },
    "0x343499E6315f7d3473a12aaf660Ac02b5739C382": {
      name: "Grand Conquest Gold",
      symbol: "GCG",
      decimals: 18,
      logoURI: "/images/icons/tokens/grandconquest-token-icon.svg",
    },
  },
  validatedFtoAddresses: [
    "0x1a58303C577CBbEA0714588059De9052896CaCF7".toLowerCase(),
    "0x21ccE939ae1390890AacFe99aE768F1a37e8e7e8".toLowerCase(),
  ],
});

// export const berachainTestNetwork = new Network({
//   chain: berachainTestnet,
//   faucets: [
//     {
//       url: "https://artio.faucet.berachain.com",
//       name: "Official Faucet",
//     },
//   ],
//   contracts: {
//     routerV2: "0xB192af2225791c439CB2024290158d3202DbcD95",
//     factory: "0xE0D1F1cE03A7598EE7FdF7E5DB837d9726C0Ea5c",
//     ftoFactory: "0xEd6a0A29A962B4296bCeEC4e1E55F5Ec0474EAC7",
//     ftoFacade: "0x3aCCC3dD26EeC5F6e254060906b7FA24D98E6722",
//     ftoTokens: [
//       {
//         address: "0xebF244521CCAc3C5a18FeAE79b4BaFBFc8926B46",
//         name: "USDT",
//         symbol: "USDT",
//         decimals: 18,
//       },
//     ],
//   },
//   faucetTokens: [
//     {
//       address: "0xebF244521CCAc3C5a18FeAE79b4BaFBFc8926B46",
//       name: "USDT",
//       symbol: "USDT",
//       decimals: 18,
//     },
//     // {
//     //   address: "0x5806E416dA447b267cEA759358cF22Cc41FAE80F",
//     //   name: "Wrapped BERA",
//     //   symbol: "WBERA",
//     //   decimals: 18,
//     // },
//     {
//       name: "AORI",
//       symbol: "AORI",
//       decimals: 18,
//       address: "0x388e116A5FE443dfc1A7338AED7D22be925E31f2",
//     },
//     {
//       name: "HONEY",
//       symbol: "HONEY",
//       decimals: 18,
//       address: "0xB2a1216856880D07eee9C4f71756FA8f72036e1E",
//     },
//     {
//       name: "tHPOT",
//       symbol: "tHPOT",
//       decimals: 18,
//       address: "0xfc5e3743E9FAC8BB60408797607352E24Db7d65E",
//     },
//   ],
// });

// export const sepoliaNetwork = new Network({
//   chain: sepolia,
//   faucets: [
//     {
//       url: "https://www.alchemy.com/faucets/ethereum-sepolia",
//       name: "Alchemy",
//     },
//     {
//       url: "https://www.infura.io/faucet/sepolia",
//       name: "Infura",
//     },
//     {
//       url: "https://sepolia-faucet.pk910.de/",
//       name: "PowFaucet",
//     },
//     {
//       url: "https://faucet.quicknode.com/ethereum/sepolia",
//       name: "QuickNode",
//     },
//     {
//       url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
//       name: "Google",
//     },
//   ],
//   contracts: {
//     routerV2: "0xBF5BB6e4189877bA03168035a56CBC452f59c0d2",
//     factory: "0x51089092b3c40c15698818592f9487340C2379B5",
//     ftoFactory: "0x13Db24fF75a7FB3Cc22Fa938c3a07C5938A7d0cD",
//     ftoFacade: "0x27bAceFAA89c00d29B4F7a3424c648f34e092009",
//     ftoTokens: [
//       {
//         address: "0x5d116b0032188519e62858dFd3b7917ccEcad170",
//         name: "USDT",
//         symbol: "USDT",
//         decimals: 18,
//       },
//     ],
//   },
//   faucetTokens: [
//     {
//       address: "0x5d116b0032188519e62858dFd3b7917ccEcad170",
//       name: "USDT",
//       symbol: "USDT",
//       decimals: 18,
//     },
//   ],
// });

export const networks = [
  // berachainTestNetwork,
  berachainBartioTestnetNetwork,
  //sepoliaNetwork,
  // polygonTestNetwork,
];
export const networksMap = networks.reduce((acc, network) => {
  acc[network.chainId] = network;
  return acc;
}, {} as Record<number | string, Network>);
