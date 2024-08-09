import { PairFilter } from "../launchpad";
import {GhostIndexer } from './indexerProviders/ghost'
import Indexer from './indexer';

// export interface IndexerProvider {
//   apiKey: string;
//   apiEndpoint: string;

//   callIndexerApi(query: string, option: any): Promise<ApiResponseType<any>>;
//   getFilteredFtoPairs: (
//     input: PairFilter,
//     provider?: string
//   ) => Promise<ApiResponseType<GhostFtoPairResponse>>;
//   getAllFtoTokens(): Promise<ApiResponseType<GhostFtoTokensResponse>>;
//   getAllPairs(): Promise<ApiResponseType<GhostPairResponse>>;
// }

export type IndexerProvider = GhostIndexer;

export type GhostFtoPairResponse = {
  pairs: GhostFTOPair[];
};

export type GhostPairResponse = {
  pairs: GhostPair[];
};

export type GhostFtoTokensResponse = {
  items: GhostToken[];
};

export type GhostToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type GhostPair = {
  id: string;
  token0: GhostToken;
  token1: GhostToken;
};
export type GhostFTOPair = {
  id: string;
  token0Id: string;
  token1Id: string;
  depositedRaisedToken: string;
  depositedLaunchedToken: string;
  createdAt: string;
  endTime: string;
  status: string;
  token0: GhostToken;
  token1: GhostToken;
};

export type GhostAPIOpt = {
  apiHandle: string;
};
