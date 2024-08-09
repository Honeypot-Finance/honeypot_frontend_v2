import { PairFilter, statusTextToNumber } from "@/services/launchpad";
import {
  IndexerProvider,
  GhostFtoPairResponse,
  GhostAPIOpt,
  GhostFtoTokensResponse,
  GhostPair,
  GhostPairResponse,
  GhostFTOPair,
} from "./../indexerTypes";
import { networksMap } from "@/services/chain";
import { debounce } from "lodash";

const ftoGraphHandle = "c0ea90ad-1a89-4078-b789-aa41d791398d/ghostgraph";
const pairGraphHandle = "747fa52a-205d-4434-ac02-0dd20f49c0dd/ghostgraph";

export class GhostIndexer {
  apiKey: string;
  apiEndpoint: string;

  constructor(apiKey: string, apiEndpoint: string) {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
  }

  callIndexerApi = async <T>(
    query: string,
    option: GhostAPIOpt
  ): Promise<ApiResponseType<any>> => {
    if (!this.apiKey || !query) {
      return {
        status: "error",
        message: "Error: API Key or query is missing.",
      };
    }

    const res = await fetch(this.apiEndpoint + option.apiHandle, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GHOST-KEY": this.apiKey,
      },
      body: JSON.stringify({ query: query }),
    });

    if (res.status === 200) {
      const data = await res.json();
      return {
        status: "success",
        data: data.data,
        message: "Success",
      };
    } else {
      throw new Error(res.statusText);
    }
  };

  getFilteredFtoPairs = async (
    filter: PairFilter,
    chainId: string,
    provider?: string
  ): Promise<ApiResponseType<GhostFtoPairResponse>> => {
    const statusNum = statusTextToNumber(filter?.status ?? -1);

    const statusCondition = statusNum != -1 ? `status: "${statusNum}",` : "";
    const searchIdCondition = filter?.search ? `id: "${filter.search}",` : "";
    const searchToken0IdCondition = filter?.search
      ? `token0Id: "${filter?.search}",`
      : "";
    const searchToken1IdCondition = filter?.search
      ? `token1Id: "${filter?.search}",`
      : "";
    const providerCondition = provider
      ? `launchedTokenProvider: "${provider}",`
      : "";

    const query = `
        {
          pairs(
            where: {
              OR:[
                {
                  ${statusCondition}
                  ${searchIdCondition}
                  ${providerCondition}
                }
                {
                  ${statusCondition}
                  ${searchToken0IdCondition}
                  ${providerCondition}
                }
                {
                  ${statusCondition}
                  ${searchToken1IdCondition}
                  ${providerCondition}
                }
              ]
            }
          ) {
            items {
              id
              token0Id
              token1Id
              depositedRaisedToken
              depositedLaunchedToken
              createdAt
              endTime
              status
              token0 {
                id
                name
                symbol
                decimals
              }
              token1 {
                id
                name
                symbol
                decimals
              }
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, { apiHandle: ftoGraphHandle });

    if (res.status === "error") {
      return res;
    } else {
      let pairs = ((res.data as any)?.pairs?.items as GhostFTOPair[]) ?? [];

      if (filter && !filter.showNotValidatedPairs) {
        pairs = pairs?.filter((pair: GhostPair) => {
          return networksMap[chainId].validatedFtoAddresses.includes(pair.id);
        });
      }

      return {
        status: "success",
        message: "Success",
        data: { pairs: pairs },
      };
    }
  };

  getAllFtoTokens = async (): Promise<
    ApiResponseType<GhostFtoTokensResponse>
  > => {
    const query = `
        {
          erc20s {
            items {
              id
              name
              symbol
              decimals
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, { apiHandle: ftoGraphHandle });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: (res.data as any).erc20s.items as GhostFtoTokensResponse,
      };
    }
  };

  getAllPairs = async (): Promise<ApiResponseType<GhostPairResponse>> => {
    const query = `
        {
          pairs {
            items {
              id
              token0 {
                id
                name
                symbol
                decimals
              }
              token1 {
                id
                name
                symbol
                decimals
              }
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: ((res.data as any).pairs?.items as GhostPairResponse) ?? {
          pairs: [],
        },
      };
    }
  };

  async getPairByTokens({
    token0,
    token1,
  }: {
    token0: string;
    token1: string;
  }) {
    console.log("token0", token0, token1);
    const query = `#graphql
      query {
            
        pairs0: pairs(
    where: {token0Id: "${token0}", token1Id: "${token1}"}
  ) {
    items {
      address: id
      token0{
        address: id
        name
        symbol
        decimals
      }
      token1{
        address: id
        name
        symbol
        decimals
      }
      reserve0
      reserve1
    }
  }
    
  pairs1: pairs(
    where: {token0Id: "${token1}", token1Id: "${token0}"}
  ) {
    items {
      address: id
      token0{
        address: id
        name
        symbol
        decimals
      }
      token1{
        address: id
        name
        symbol
        decimals
      }
      reserve0
      reserve1
    }
  }

  }`;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });
    if (res.status === "success") {
      return res.data.pairs0.items[0] || res.data.pairs1.items[0];
    }
    return res;
  }
}
