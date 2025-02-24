import SwapPairV3 from "./SwapPair/SwapPairV3";
import SwapButtonV3 from "./SwapButton/SwapButotnV3";
import SwapParamsV3 from "./SwapParams/SwapParamsV3";
import CardContainer from "../../CardContianer/v3";
import PoweredByAlgebra from "../common/PoweredByAlgebra";
import { Token } from "@/services/contract/token";
import { PresetPair } from "./SwapPair/SwapPairV3";

interface V3SwapCardProps {
  presetPairs?: PresetPair[];
  fromTokenAddress?: string;
  toTokenAddress?: string;
  disableSelection?: boolean;
  disableFromSelection?: boolean;
  disableToSelection?: boolean;
  bordered?: boolean;
  borderHeight?: string;
  onSwapSuccess?: () => void;
  isUpdatingPriceChart?: boolean;
  staticFromTokenList?: Token[];
  staticToTokenList?: Token[];
  isInputNative?: boolean;
  isOutputNative?: boolean;
  showPresetInput?: boolean;
  showPresetOutput?: boolean;
}

export function V3SwapCard({
  presetPairs,
  fromTokenAddress,
  toTokenAddress,
  disableSelection,
  bordered = true,
  isUpdatingPriceChart = false,
  staticFromTokenList,
  staticToTokenList,
  isInputNative,
  isOutputNative,
  disableFromSelection,
  disableToSelection,
  showPresetInput,
  showPresetOutput,
}: V3SwapCardProps) {
  return (
    <CardContainer>
      <SwapPairV3
        presetPairs={presetPairs}
        fromTokenAddress={fromTokenAddress}
        toTokenAddress={toTokenAddress}
        disableSelection={disableSelection}
        isUpdatingPriceChart={isUpdatingPriceChart}
        staticFromTokenList={staticFromTokenList}
        staticToTokenList={staticToTokenList}
        isInputNative={isInputNative}
        isOutputNative={isOutputNative}
        disableFromSelection={disableFromSelection}
        disableToSelection={disableToSelection}
        showPresetInput={showPresetInput}
        showPresetOutput={showPresetOutput}
      />
      <SwapParamsV3 />
      <SwapButtonV3 />
      <PoweredByAlgebra />
    </CardContainer>
  );
}

export default V3SwapCard;
