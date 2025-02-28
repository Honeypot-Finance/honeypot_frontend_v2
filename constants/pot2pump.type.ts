import { Token } from "@/services/contract/token";

export type FilterField = RangeFilterField | TokenFilterField;

export type RangeFilterField = {
  inputType: "range";
  min?: string;
  max?: string;
};

export type TokenFilterField = {
  inputType: "token";
  token?: Token;
};

export interface FilterState {
  tvl?: RangeFilterField;
  participants?: RangeFilterField;
  liquidity?: RangeFilterField;
  marketcap?: RangeFilterField;
  daytxns?: RangeFilterField;
  daybuys?: RangeFilterField;
  daysells?: RangeFilterField;
  dayvolume?: RangeFilterField;
  daychange?: RangeFilterField;
  depositraisedtokenpercentage?: RangeFilterField;
  raiseToken?: TokenFilterField;
}
