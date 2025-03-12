import { FilterState } from "./pot2pump.type";

export const defaultFilterState: FilterState = {
  tvl: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  participants: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  liquidity: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  marketcap: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  daytxns: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  daybuys: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  daysells: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  dayvolume: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  daychange: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  depositraisedtokenpercentage: {
    inputType: "range",
    min: undefined,
    max: undefined,
  },
  raiseToken: {
    inputType: "token",
    token: undefined,
  },
};
