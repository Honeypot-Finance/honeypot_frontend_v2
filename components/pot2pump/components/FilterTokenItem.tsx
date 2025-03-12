import React, { useState } from "react";
import { Token } from "@/services/contract/token";
import { TokenSelector } from "@/components/TokenSelector/v3";
import { observer } from "mobx-react-lite";

type Props = {
  token?: Token;
  staticTokenList?: Token[];
  onChange: (token: Token) => void;
  label: string;
};

const FilterTokenItem = observer(
  ({ token, staticTokenList, onChange, label }: Props) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-black text-base font-medium">{label}</label>
        <div className="flex gap-2">
          <TokenSelector
            onSelect={onChange}
            value={token}
            staticTokenList={staticTokenList}
          />
        </div>
      </div>
    );
  }
);

export default FilterTokenItem;
