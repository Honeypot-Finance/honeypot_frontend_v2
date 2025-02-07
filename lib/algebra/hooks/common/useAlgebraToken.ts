import { useMemo } from "react";
import { useToken } from "wagmi";
import { Address } from "viem";
import { Token } from "@cryptoalgebra/wasabee-sdk";
import { ExtendedNative } from "@cryptoalgebra/wasabee-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/wasabee-sdk";
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_NATIVE_SYMBOL,
  DEFAULT_NATIVE_NAME,
} from "@/config/algebra/default-chain-id";

export function useAlgebraToken(address: Address | undefined) {
  const isETH = address === ADDRESS_ZERO;

  const { data: tokenData, isLoading } = useToken({
    address: isETH ? undefined : address,
    chainId: DEFAULT_CHAIN_ID,
  });

  return useMemo(() => {
    if (!address) return;

    if (address === ADDRESS_ZERO)
      return ExtendedNative.onChain(
        DEFAULT_CHAIN_ID,
        DEFAULT_NATIVE_SYMBOL,
        DEFAULT_NATIVE_NAME
      );

    if (isLoading || !tokenData) return undefined;

    const { symbol, name, decimals } = tokenData;

    return new Token(DEFAULT_CHAIN_ID, address, decimals, symbol, name);
  }, [address, tokenData, isLoading]);
}
