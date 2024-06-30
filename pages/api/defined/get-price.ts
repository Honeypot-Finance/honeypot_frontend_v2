// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getDefinedTokenPriceForLast3Years } from "@/lib/defined/defined";
import { withErrorHandler } from "../apiHandler";

export const handler = withErrorHandler(
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method === "GET") {
      const { tokenaddress, networkId } = req.query;
      if (!tokenaddress || !networkId) {
        throw new Error("Invalid query parameters.");
      }

      const data = await getDefinedTokenPriceForLast3Years(
        tokenaddress as string,
        networkId as string
      );

      if (!data) {
        throw new Error("Failed to fetch data.");
      }

      res.status(200).json({
        status: "success",
        message: "success",
        data: data,
      });
    } else {
      throw new Error("Method not allowed.");
    }
  }
);

export default handler;
