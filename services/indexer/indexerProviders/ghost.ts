import {
  PairFilter as FtoPairFilter,
  ProjectStatus,
  statusTextToNumber,
} from "@/services/launchpad";
import {
  GhostFtoPairResponse,
  GhostAPIOpt,
  GhostFtoTokensResponse,
  GhostPair,
  GhostPairResponse,
  GhostFTOPair,
  PageRequest,
  GhostToken,
  PairFilter,
  holdingPairs,
  GhostHoldingPairsResponse,
  TrendingMEMEs,
  GhostParticipatedProjectsResponse,
} from "./../indexerTypes";
import { networksMap } from "@/services/chain";
import { PageInfo } from "@/services/utils";
import dayjs from "dayjs";

const memeGraphHandle = "65fdc7f0-3ffc-48e5-b74b-48466ded88f6/ghostgraph";
const ftoGraphHandle = "59eb35ba-6a83-4bb6-b00c-af0f103db519/ghostgraph";
//const pairGraphHandle = "43791f34-6b9f-4fc7-99bc-3883fe155151/ghostgraph";
const pairGraphHandle = "ca609e38-a070-4806-b4c9-08e96fee8118/ghostgraph";

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

  getMostSuccessfulFTOPairs = async (
    chainId: string,
    limit: number
  ): Promise<ApiResponseType<GhostFtoPairResponse>> => {
    const query = `#graphql
    {
      pairs(
        where:{
          status: "3"
        }
        orderBy: "depositedRaisedToken"
        orderDirection: "desc"
        limit: ${limit}
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
      let pageInfo = (res.data as any)?.pairs?.pageInfo as PageInfo;

      return {
        status: "success",
        message: "Success",
        data: { pairs: pairs, pageInfo: pageInfo },
      };
    }
  };

  getFilteredFtoPairs = async (
    filter: Partial<FtoPairFilter>,
    chainId: string,
    provider?: string,
    pageRequest?: PageRequest,
    projectType?: "fto" | "meme"
  ): Promise<ApiResponseType<GhostFtoPairResponse>> => {
    const getMemeStatusQuery = (status: string) => {
      switch (status) {
        case ProjectStatus.Success:
          return `status: "0"`;
        case ProjectStatus.Fail:
          return `status_not: "0"  endTime_lt:"${dayjs().unix()}"`;
        case ProjectStatus.Processing:
          return `endTime_gt:"${dayjs().unix()}"
        status: "3"`;
        default:
          return ``;
      }
    };
    const getFtoStatusQuery = (status: string) => {
      const statusNum = statusTextToNumber(filter?.status ?? "all");
      const statusCondition = statusNum != -1 ? `status: "${statusNum}",` : "";
      return statusCondition;
    };
    const status = filter?.status ?? ProjectStatus.All;
    const statusCondition =
      projectType === "meme"
        ? getMemeStatusQuery(status)
        : getFtoStatusQuery(status);
    const dirCondition = pageRequest?.cursor
      ? pageRequest?.direction === "next"
        ? `after:"${pageRequest?.cursor}"`
        : `before:"${pageRequest?.cursor}"`
      : "";

    const searchIdCondition =
      filter?.search && filter.search.startsWith("0x")
        ? `id: "${filter.search}",`
        : "";

    const searchToken0IdCondition =
      filter?.search && filter.search.startsWith("0x")
        ? `token0Id: "${filter?.search}",`
        : "";

    const searchToken1IdCondition =
      filter?.search && filter.search.startsWith("0x")
        ? `token1Id: "${filter?.search}",`
        : "";

    const providerCondition = provider
      ? `launchedTokenProvider: "${provider}",`
      : "";

    const searchStringCondition = filter?.search
      ? `searchString_contains:"${filter.search.toLowerCase()}",`
      : "";

    const query = `
        {
          pairs(
            where: {
                    ${providerCondition}
                    ${statusCondition}
              OR:[
                {
                  ${searchStringCondition}
                }
                ${
                  (statusCondition || searchIdCondition || !filter.search) &&
                  (!filter.search || filter.search.startsWith("0x"))
                    ? `{
                    ${searchIdCondition}
                  }
                  {
                    ${searchToken0IdCondition}
                  }
                  {
                    ${searchToken1IdCondition}
                  } 
                  `
                    : ""
                }
              ]
            }
            orderBy:"createdAt"
            orderDirection: "desc"
            limit: ${filter?.limit ?? 9}
            ${dirCondition}
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
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
          }
        }
      `;
    const res = await this.callIndexerApi(query, {
      apiHandle: projectType === "meme" ? memeGraphHandle : ftoGraphHandle,
    });

    if (res.status === "error") {
      return res;
    } else {
      let pairs = ((res.data as any)?.pairs?.items as GhostFTOPair[]) ?? [];
      let pageInfo = (res.data as any)?.pairs?.pageInfo as PageInfo;

      if (filter && !filter.showNotValidatedPairs) {
        pairs = pairs?.filter((pair: GhostPair) => {
          return networksMap[chainId].validatedFtoAddresses.includes(pair.id);
        });
      }

      return {
        status: "success",
        message: "Success",
        data: { pairs: pairs, pageInfo: pageInfo },
      };
    }
  };

  getAllFtoTokens = async (): Promise<
    ApiResponseType<GhostFtoTokensResponse>
  > => {
    const query = `#graphql
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

  getFilteredFtoTokens = async (
    filter: Partial<FtoPairFilter>
  ): Promise<ApiResponseType<GhostFtoTokensResponse>> => {
    const query = `
        {
          erc20s(
            where: {
              OR: [
                { name_contains: "${filter.search}" },
                { symbol_contains: "${filter.search}" }
              ]
            }
          ) {
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
        data: { items: (res.data as any).erc20s.items as GhostToken[] },
      };
    }
  };

  getAllPairs = async (): Promise<ApiResponseType<GhostPairResponse>> => {
    const query = `#graphql
        {
          pairs (
            limit: 1000
          ){
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
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
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
        data: {
          pairs: (res.data as any).pairs?.items as GhostPair[],
          pageInfo: (res.data as any).pairs?.pageInfo as PageInfo,
        } ?? {
          pairs: [],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: "",
            endCursor: "",
          },
        },
      };
    }
  };

  getHoldingPairs = async (
    walletAddress: string,
    chainId: string,
    filter?: Partial<PairFilter>,
    pageRequest?: PageRequest
  ): Promise<ApiResponseType<GhostHoldingPairsResponse>> => {
    console.log("filter", filter);
    const dirCondition = pageRequest?.cursor
      ? pageRequest?.direction === "next"
        ? `after:"${pageRequest?.cursor}"`
        : `before:"${pageRequest?.cursor}"`
      : "";

    const searchStringCondition = filter?.searchString
      ? `pair_:{
            searchString_contains:"${filter.searchString.toLowerCase()}"
          },`
      : ``;

    const query = `
    {
      holdingPairs(
        where: {
            holder: "${walletAddress}",
            totalLpAmount_gt: "0",
            ${searchStringCondition}
          },
        orderBy: "totalLpAmount",
        orderDirection: "desc",
        limit: ${filter?.limit ?? 10}, 
        ${dirCondition}
      ) {
        items {
          pairId
          totalLpAmount
          deCreaselpAmount
          inCreaselpAmount
          pair{
            token0Id
            token1Id
            token0name
            token1name
            token0symbol
            token1symbol
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  `;

    console.log(query);

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    res.status === "success" &&
      res.data.holdingPairs.items.map(
        (item: holdingPairs) =>
          `${item.pair.token0symbol}-${item.pair.token1symbol} ${item.totalLpAmount}`
      );

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: {
          holdingPairs: (res.data as any).holdingPairs?.items as holdingPairs[],
          pageInfo: (res.data as any).holdingPairs?.pageInfo as PageInfo,
        } ?? {
          pairs: [],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: "",
            endCursor: "",
          },
        },
      };
    }
  };

  getParticipatedProjects = async (
    walletAddress: string,
    chainId: string,
    pageRequest: PageRequest,
    type: "fto" | "meme",
    filter: Partial<FtoPairFilter>
  ): Promise<ApiResponseType<GhostParticipatedProjectsResponse>> => {
    const getMemeStatusQuery = (status: string) => {
      switch (status) {
        case ProjectStatus.Success:
          return `pair_:{status: "0"}`;
        case ProjectStatus.Fail:
          return `pair_:{status_not: "0"  endTime_lt:"${dayjs().unix()}}`;
        case ProjectStatus.Processing:
          return `pair_:{endTime_gt:"${dayjs().unix()}"
        status: "3"}`;
        default:
          return ``;
      }
    };
    const getFtoStatusQuery = (status: string) => {
      const statusNum = statusTextToNumber(filter?.status ?? "all");

      const statusCondition =
        statusNum != -1
          ? `pair_:{
        status: "${statusNum}",
      }`
          : "";
      return statusCondition;
    };
    const status = filter?.status ?? ProjectStatus.All;
    const statusCondition =
      type === "meme" ? getMemeStatusQuery(status) : getFtoStatusQuery(status);
    const searchIdCondition =
      filter?.search && filter.search.startsWith("0x")
        ? `{
            pair_:{
              id: "${filter.search}"
            }
          },
          {
            pair_:{
              token0Id: "${filter.search}"
            }
          },
          {
            pair_:{
              token1Id: "${filter.search}"
            }
          },`
        : "";

    const dirCondition = pageRequest?.cursor
      ? pageRequest?.direction === "next"
        ? `after:"${pageRequest?.cursor}"`
        : `before:"${pageRequest?.cursor}"`
      : "";

    const searchStringCondition = filter?.search
      ? `searchString_contains:"${filter.search.toLowerCase()}",`
      : "";

    console.log("filter", filter);

    const limit = filter.limit ?? 9;

    const query = ` {
                      participateds(
                        where:{
                          depositer:"${walletAddress.toLowerCase()}",
                          ${statusCondition}
                          OR:[
                            {
                              ${searchStringCondition}
                            },
                            ${searchIdCondition}
                          ]
                        }
                        orderBy:"createdAt"
                        orderDirection: "desc"
                        limit: ${limit}
                        ${dirCondition}
                      ){
                        items{
                          id
                          depositer
                          pairId
                          createdAt
                          pair {
                            id
                            token0Id
                            token1Id
                            token0name
                            token1name
                            token0symbol
                            token1symbol
                            depositedRaisedToken
                            depositedLaunchedToken
                            createdAt
                            endTime
                            status
                            launchedTokenProvider
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
                        pageInfo {
                          hasPreviousPage
                          hasNextPage
                          startCursor
                          endCursor
                        }
                      }
                    }`;

    console.log(query);

    const res = await this.callIndexerApi(query, {
      apiHandle: type === "meme" ? memeGraphHandle : ftoGraphHandle,
    });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: res.data ?? {
          pairs: [],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: "",
            endCursor: "",
          },
        },
      };
    }
  };

  getFilteredPairs = async (
    filter: Partial<PairFilter>,
    chainId: string,
    provider?: string,
    pageRequest?: PageRequest
  ): Promise<ApiResponseType<GhostPairResponse>> => {
    const dirCondition = pageRequest?.cursor
      ? pageRequest?.direction === "next"
        ? `after:"${pageRequest?.cursor}"`
        : `before:"${pageRequest?.cursor}"`
      : "";

    const query = `
        {
          pairs(
            where: {
              ${
                filter.searchString
                  ? `
              OR: [
                ${
                  filter.searchString.startsWith("0x")
                    ? `{ id: "${filter.searchString}"  }`
                    : ""
                }
                
                 ${
                   filter.searchString.startsWith("0x")
                     ? `{ token1Id: "${filter.searchString}"  }`
                     : ""
                 }
                
                 ${
                   filter.searchString.startsWith("0x")
                     ? `{ token1Id: "${filter.searchString}"  }`
                     : ""
                 }

                {searchString_contains:"${filter.searchString.toLowerCase()}" }
              ]`
                  : ""
              }
            }
            limit: ${filter.limit}
            ${dirCondition}
          ) {
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
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
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
        data: {
          pairs: (res.data as any).pairs?.items as GhostPair[],
          pageInfo: (res.data as any).pairs?.pageInfo as PageInfo,
        } ?? {
          pairs: [],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: "",
            endCursor: "",
          },
        },
      };
    }
  };

  getValidatedTokenPairs = async (
    chainId: string
  ): Promise<ApiResponseType<GhostPairResponse>> => {
    const validatedPairs: {
      token0: string;
      token1: string;
    }[] = [];

    const addresses = Object.entries(networksMap[chainId].validatedTokensInfo)
      .filter(([, value]) => value?.isRouterToken ?? false)
      .map(([key]) => key);

    addresses.forEach((address0: string) => {
      addresses.forEach((address1: string) => {
        if (address0 !== address1) {
          validatedPairs.push({
            token0: address0,
            token1: address1,
          });
        }
      });
    });

    const query = `
      query {   
        pairs(
        where: {OR:[${validatedPairs.map((pair) => {
          return `
                  {token0Id: "${pair.token0}", token1Id: "${pair.token1}"}
                  {token0Id: "${pair.token1}", token1Id: "${pair.token0}"}
                  `;
        })}]}
      ) {
        items {
          id
          token0{
            id
            name
            symbol
            decimals
          }
          token1{
            id
            name
            symbol
            decimals
          }
        }
      }
    }`;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: {
          pairs: (res.data as any).pairs?.items as GhostPair[],
          pageInfo: (res.data as any).pairs?.pageInfo as PageInfo,
        } ?? {
          pairs: [],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: "",
            endCursor: "",
          },
        },
      };
    }
  };

  async getTrendingMEMEPairs(): Promise<ApiResponseType<TrendingMEMEs>> {
    const query = `{
        pairs(
          where:{
            endTime_gt:"${dayjs().unix()}"
            status: "3"
          }
          limit: 5
          orderBy: "depositedRaisedToken"
          orderDirection: "desc"
        ) {
          items {
            id
            status
            depositedRaisedToken
            depositedLaunchedToken
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
      apiHandle: memeGraphHandle,
    });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: res.data,
      };
    }
  }

  async getPairByTokens({
    token0,
    token1,
  }: {
    token0: string;
    token1: string;
  }) {
    const query = `
      query {   
        pairs0: pairs(
        where: {OR:[{token0Id: "${token0}", token1Id: "${token1}"},{token0Id: "${token1}", token1Id: "${token0}"}]}
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

    console.log(res);

    if (res.status === "success") {
      return res.data.pairs0.items[0] || res.data.pairs1.items[0];
    }
    return res;
  }
}
