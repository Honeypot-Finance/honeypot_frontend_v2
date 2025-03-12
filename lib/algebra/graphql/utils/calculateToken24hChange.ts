import { Token } from "../generated/graphql";
import dayjs from "dayjs";
export const calculateToken24hPriceChange: (token: Token) => {
  priceChange: number;
  priceChangePercentage: number;
} = (token: Token) => {
  const tokenHourData = token.tokenHourData;

  const timeNow = dayjs().unix();
  const timeHourIndex = Math.floor(Number(timeNow) / 3600);

  console.log("calculateToken24hPriceChange time data", {
    token: token.symbol,
    timeNow,
    timeHourIndex,
    tokenHourData,
  });

  let price24h = Number(token.derivedUSD);
  let priceBefore24h =
    tokenHourData.filter(
      (hour) => hour.periodStartUnix < (timeHourIndex - 24) * 3600
    )[0]?.priceUSD ?? 0;

  //find first available price
  // for (let i = 0; i < 24; i++) {
  //   const hourTimestamp = tokenHourNowUnix - i * 3600;
  //   const hourData = tokenHourData.find((hourData) => {
  //     return Number(hourData.periodStartUnix) === hourTimestamp;
  //   });
  //   if (hourData) {
  //     price24h = Number(hourData.priceUSD);
  //     break;
  //   }
  // }

  //find first available price after 24 hours
  // tokenHourData.filter((hour)=>hour.periodStartUnix<(timeHourIndex - 24) * 3600)[0]

  // for (let i = 24; i < 100; i++) {
  //   const hourTimestamp = (timeHourIndex - i) * 3600;
  //   const hourData = tokenHourData.find((hourData) => {
  //     return Number(hourData.periodStartUnix) === hourTimestamp;
  //   });
  //   if (hourData) {
  //     priceBefore24h = Number(hourData.priceUSD);
  //     break;
  //   }
  // }

  if (priceBefore24h === 0) {
    priceBefore24h = Number(token.initialUSD);
  }

  console.log("calculateToken24hPriceChange price data", {
    price24h: Number(price24h),
    priceBefore24h: Number(priceBefore24h),
    priceChange: Number(price24h) - Number(priceBefore24h),
    priceChangePercentage:
      100 - (Number(price24h) / Number(priceBefore24h)) * 100,
  });

  return {
    priceChange: Number(price24h) - Number(priceBefore24h),
    priceChangePercentage:
      (Number(price24h) / Number(priceBefore24h)) * 100 - 100,
  };
};
