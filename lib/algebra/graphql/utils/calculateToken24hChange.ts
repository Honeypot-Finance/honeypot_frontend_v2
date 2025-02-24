import { Token } from "../generated/graphql";
import dayjs from "dayjs";
export const calculateToken24hPriceChange: (token: Token) => {
  priceChange: number;
  priceChangePercentage: number;
} = (token: Token) => {
  const tokenHourData = token.tokenHourData;
  if (!tokenHourData) {
    return {
      priceChange: 0,
      priceChangePercentage: 0,
    };
  }

  const timeNow = dayjs().unix();
  const timeHourIndex = Math.floor(Number(timeNow) / 3600);
  const tokenHourNowUnix = timeHourIndex * 3600;

  // console.log("calculateToken24hPriceChange time data", {
  //   timeNow,
  //   timeHourIndex,
  //   tokenHourNowUnix,
  //   tokenHourData,
  // });

  let price24h = 0;
  let price48h = 0;

  //find first available price
  for (let i = 0; i < 24; i++) {
    const hourTimestamp = tokenHourNowUnix - i * 3600;
    const hourData = tokenHourData.find((hourData) => {
      return Number(hourData.periodStartUnix) === hourTimestamp;
    });
    if (hourData) {
      price24h = Number(hourData.priceUSD);
      break;
    }
  }

  //calculate average price of token in the last 48 hours
  for (let i = 24; i < 48; i++) {
    const hourTimestamp = tokenHourNowUnix - i * 3600;
    const hourData = tokenHourData.find((hourData) => {
      return Number(hourData.periodStartUnix) === hourTimestamp;
    });
    if (hourData) {
      price48h = Number(hourData.priceUSD);
      break;
    }
  }

  if (price48h === 0) {
    price48h = token.initialUSD;
  }

  if (price48h === 0) {
    return {
      priceChange: price24h,
      priceChangePercentage: 100,
    };
  } else if (price24h === 0) {
    return {
      priceChange: -price48h,
      priceChangePercentage: 0,
    };
  } else {
    return {
      priceChange: price24h - price48h,
      priceChangePercentage: ((price24h - price48h) / price48h) * 100,
    };
  }
};
