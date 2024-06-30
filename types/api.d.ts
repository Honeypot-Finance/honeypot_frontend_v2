declare type ApiResponseType =
  | {
      status: "success";
      data: DefinedChartDataResponse;
      message: string;
    }
  | {
      status: "error";
      data: null;
      message: string;
    };
