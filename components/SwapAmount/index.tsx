import { InputProps } from "@nextui-org/react";
import { Input } from "../input/index";

type SwapAmountProps = {
  label: string;
  inputProps?: InputProps;
};

export const SwapAmount = ({ label, inputProps }: SwapAmountProps) => {
  return (
    <div className="flex-1 w-full">
      <div className="text-sub text-sm font-normal leading-3 tracking-[0.14px]">
        {label}
      </div>
      <Input
        type="number"
        placeholder="0.0"
        className="mt-[8px] text-white text-right text-[21px] font-bold leading-6 placeholder:text-[rgba(255,255,255,0.50)]"
        {...inputProps}
      />
    </div>
  );
};
