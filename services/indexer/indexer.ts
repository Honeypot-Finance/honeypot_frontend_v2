import { PairFilter } from "../launchpad";
import { GhostIndexer } from "./indexerProviders/ghost";
import {
  GhostFtoPairResponse,
  GhostFtoTokensResponse,
  IndexerProvider,
} from "./indexerTypes";

export default class Indexer<T extends IndexerProvider> {
  dataProvider: T;
  debug: boolean;

  constructor(dataProvider: T, debug: boolean = false) {
    this.dataProvider = dataProvider;
    this.debug = debug;
  }

  callIndexerApi = async <T extends any>(
    query: string,
    options: any
  ): Promise<ApiResponseType<T>> => {
    return await this.dataProvider.callIndexerApi(query, options);
  };

  getFilteredFtoPairs = async (
    filter: PairFilter,
    chainId: string,
    provider?: string
  ): Promise<ApiResponseType<GhostFtoPairResponse>> => {
    return await this.dataProvider.getFilteredFtoPairs(
      filter,
      chainId,
      provider
    );
  };

  getAllFtoTokens = async (): Promise<
    ApiResponseType<GhostFtoTokensResponse>
  > => {
    return await this.dataProvider.getAllFtoTokens();
  };

  async getPairByTokens({
    token0,
    token1,
  }: {
    token0: string;
    token1: string;
  }) {
    return await this.dataProvider.getPairByTokens({ token0, token1 });
  }
}


const ghostIndexer = new GhostIndexer(
  process.env.GHOST_INDEXER_API_KEY ?? "",
  "https://api.ghostlogs.xyz/gg/pub/"
);



export const indexer = new Indexer(ghostIndexer);
