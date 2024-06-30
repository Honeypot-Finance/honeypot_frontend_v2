import axios from "axios";
const DEFINED_API_KEY = process.env.DEFINED_API_KEY;

const callDefinedApi = async (query: string): Promise<any> => {
  let data = await axios.post(
    "https://graph.defined.fi/graphql",
    {
      query: query,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: DEFINED_API_KEY,
      },
    }
  );

  return data.data.data;
};

export const getDefinedTokenPrice = async (
  address: string,
  networkId: string,
  from: number,
  to: number,
  resolution: string
): Promise<DefinedChartDataResponse | undefined> => {
  let data;

  await callDefinedApi(
    `{
  getBars(
    symbol: "${address}:${networkId}"
    from: ${from}
    to: ${to}
    resolution: "${resolution}"
    quoteToken: token1
  ) {
    o
    h
    l
    c
    t
  }
}`
  ).then((response) => {
    data = response;
  });

  return data as DefinedChartDataResponse | undefined;
};

export const getDefinedTokenPriceForLast3Years = async (
  address: string,
  networkId: string
): Promise<DefinedChartDataResponse | undefined> => {
  let data = await getDefinedTokenPrice(
    address,
    networkId,
    Math.round(new Date().getTime() / 1000 - 3 * 365 * 24 * 60 * 60),
    Math.round(new Date().getTime() / 1000),
    "1D"
  );

  return data;
};

export const getDefinedNetworks = async () => {
  let data;
  await axios
    .post(
      "https://graph.defined.fi/graphql",
      {
        query: `{
        getNetworks {
          name
          id
        }
      }`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: DEFINED_API_KEY,
        },
      }
    )
    .then((response) => {
      data = response.data;
    });

  return data;
};
