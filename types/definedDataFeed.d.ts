declare type DefinedTokenHistoryPrice = {
  token: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
  data: {
    priceUsd: number;
  }[];
};

declare interface DefinedChartDataResponse {
  data: DefinedChartDataResponseData;
}

declare interface DefinedChartDataResponseData {
  getBars: DefinedChartDataResponseGetBars;
}

declare interface DefinedChartDataResponseGetBars {
  o: number[] | undefined[];
  h: number[] | undefined[];
  l: number[] | undefined[];
  c: number[] | undefined[];
  t: number[] | undefined[];
}
