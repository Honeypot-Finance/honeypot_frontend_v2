import { NextApiRequest, NextApiResponse } from "next";

export const withErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error,
        data: null,
      });
    }
  };
};
