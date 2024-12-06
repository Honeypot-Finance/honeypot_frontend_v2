// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { trpcClient } from "@/lib/trpc";
import type { NextApiRequest, NextApiResponse } from "next";
import { appRouter, caller } from "@/server/_app";

const WBERAtHPOTHLP =
  "0x28feC64EaBc1e4Af7f5cD33d2bd20b01D5E8f203".toLowerCase();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<any>>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      message: "Method Not Allowed",
    });
  }

  console.log(req.query);

  const { walletAddress } = req.query;
  if (!walletAddress) {
    return res.status(400).json({
      status: "error",
      message: "Invalid request params",
    });
  }

  const holdingData = await caller.indexerFeedRouter.getHoldingsPairs({
    chainId: "80084",
    walletAddress: walletAddress as string,
    filter: {
      limit: 999,
    },
  });

  if (holdingData.status !== "success") {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }

  const isQuestFinished = holdingData.data.holdingPairs.find(
    (pair) => pair.pairId.toLowerCase() === WBERAtHPOTHLP
  );

  console.log(isQuestFinished);

  res.status(200).json({
    status: "success",
    data: isQuestFinished ? true : false,
    message: "request Success",
  });
}
