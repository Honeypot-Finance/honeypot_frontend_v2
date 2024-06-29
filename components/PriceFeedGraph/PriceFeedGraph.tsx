"use client";
import { Button } from "@nextui-org/react";
import EChartsReact from "echarts-for-react";
import { useEffect, useState } from "react";
import { wallet } from "@/services/wallet";
import { Token } from "@/services/contract/token";
import { networksMap } from "@/services/chain";
import { useAccount } from "wagmi";

const upColor = "#ec0000";
const upBorderColor = "#8A0000";
const downColor = "#00da3c";
const downBorderColor = "#008F28";

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
      splitArea: {
        show: true,
      },
    },
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
  });
  const [currentToken, setCurrentToken] = useState<Token>(
    networksMap[chainId as number].faucetTokens[0]
  );

  useEffect(() => {
    fetch(
      `/api/defined/get-price?tokenaddress=${currentToken.address}&networkId=${chainId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPriceData(splitData(data));
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
    }));
  }, [priceData]);

  function splitData(rawData: any) {
    const categoryData = [];
    const values = [];

    const data = rawData.data.data.getBars;
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
      <Button
        onClick={() => {
          toViewHandler(1095);
        }}
      >
        3 Years
      </Button>
      <Button
        onClick={() => {
          toViewHandler(365);
        }}
      >
        1 Year
      </Button>
      <Button
        onClick={() => {
          toViewHandler(180);
        }}
      >
        6 Months
      </Button>
      <Button
        onClick={() => {
          toViewHandler(30);
        }}
      >
        1 Month
      </Button>
      <Button
        onClick={() => {
          toViewHandler(7);
        }}
      >
        1 Week
      </Button>
    </>
  );
}