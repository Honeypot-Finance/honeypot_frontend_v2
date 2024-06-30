"use client";
import { Button } from "@nextui-org/react";
import EChartsReact from "echarts-for-react";
import { useEffect, useState } from "react";
import { Token } from "@/services/contract/token";
import { networksMap } from "@/services/chain";
import { useAccount } from "wagmi";

const upColor = "#ec0000";
const upBorderColor = "#8A0000";
const downColor = "#00da3c";
const downBorderColor = "#008F28";
const viewRanges = Object.values({
  "1095d": {
    name: "3 years",
    value: 1095,
  },
  "365d": {
    name: "1 year",
    value: 365,
  },
  "180d": {
    name: "6 months",
    value: 180,
  },
  "90d": {
    name: "3 months",
    value: 90,
  },
  "30d": {
    name: "1 month",
    value: 30,
  },
  "7d": {
    name: "7 Days",
    value: 7,
  },
});

export default function PriceFeedGraph() {
  const { chainId } = useAccount();
  const [priceData, setPriceData] = useState<any>();
  const [option, setOption] = useState<any>({
    title: {
      text: networksMap[chainId as number].faucetTokens[0].name,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
    },
    xAxis: {
      type: "category",
      data: priceData?.categoryData,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: "dataMin",
      max: "dataMax",
    },
    yAxis: {
      scale: true,
      splitArea: {},
    },
    series: [
      {
        name: "price",
        type: "candlestick",
        data: priceData?.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upBorderColor,
          borderColor0: downBorderColor,
        },
      },
    ],
    backgroundColor: "transparent",
  });
  const [currentToken, setCurrentToken] = useState<Token>(
    networksMap[chainId as number].faucetTokens[0]
  );

  useEffect(() => {
    fetch(
      `/api/defined/get-price?tokenaddress=${currentToken.address}&networkId=${chainId}`
    ).then((res) => {
      console.log(res);
      res.json().then((data) => {
        console.log(data);
        setPriceData(splitData(data));
      });
    });
  }, [chainId, currentToken]);

  useEffect(() => {
    setOption((prev: any) => ({
      ...prev,
      xAxis: {
        type: "category",
        data: priceData?.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: "dataMin",
        max: "dataMax",
      },
      series: [
        {
          name: "price",
          type: "candlestick",
          data: priceData?.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor,
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          startValue: priceData?.categoryData?.length - 30,
          endValue: priceData?.categoryData?.length,
        },
        {
          show: true,
          type: "slider",
          top: "90%",
          startValue: priceData?.categoryData?.length - 30,
          endValue: priceData?.categoryData?.length,
        },
      ],
    }));
  }, [priceData]);

  function splitData(rawData: any) {
    const categoryData = [];
    const values = [];

    const data = rawData.data.getBars;
    for (let i = 0; i < data.c.length; i++) {
      categoryData.push(
        new Date((data.t[i] ?? 0) * 1000).toLocaleDateString("en-US")
      );
      values.push([data.o[i], data.c[i], data.l[i], data.h[i]]);
    }

    return {
      categoryData: categoryData,
      values: values,
    };
  }

  function changeTokenHandler(tokenAddress: Token) {
    setCurrentToken(tokenAddress);
    setOption((prev: any) => ({
      ...prev,
      title: {
        text: tokenAddress.name,
      },
    }));
  }

  function toViewHandler(days: number) {
    setOption({
      ...option,
      dataZoom: [
        {
          type: "inside",
          startValue: priceData.categoryData?.length - days,
          endValue: priceData.categoryData?.length,
        },
        {
          show: true,
          type: "slider",
          top: "90%",
          startValue: priceData.categoryData?.length - days,
          endValue: priceData.categoryData?.length,
        },
      ],
    });
  }

  return (
    <>
      {networksMap[chainId as number].faucetTokens.map((token) => (
        <Button key={token.address} onClick={() => changeTokenHandler(token)}>
          {token.name}
        </Button>
      ))}
      <EChartsReact option={option} />
      {viewRanges.map((days) => (
        <Button
          key={days.value}
          onClick={() => {
            toViewHandler(days.value);
          }}
        >
          {days.name}
        </Button>
      ))}
    </>
  );
}
